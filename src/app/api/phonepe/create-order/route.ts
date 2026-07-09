import { NextRequest, NextResponse } from 'next/server';

const PHONEPE_UAT_BASE = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
const PHONEPE_PROD_BASE = 'https://api.phonepe.com/apis/hermes';

function getBaseUrl() {
    return process.env.NEXT_PUBLIC_PHONEPE_ENV === 'PRODUCTION'
        ? PHONEPE_PROD_BASE
        : PHONEPE_UAT_BASE;
}

// Cache token in memory (server-side only)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
    // Return cached token if still valid (with 60s buffer)
    if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
        return cachedToken.token;
    }

    const clientId = process.env.PHONEPE_CLIENT_ID!;
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET!;
    const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1';

    const res = await fetch(`${getBaseUrl()}/v1/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            client_version: clientVersion,
            grant_type: 'client_credentials',
        }),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`PhonePe token error: ${res.status} - ${err}`);
    }

    const data = await res.json();
    const token: string = data.access_token;
    const expiresIn: number = data.expires_in || 3600; // seconds

    cachedToken = { token, expiresAt: Date.now() + expiresIn * 1000 };
    return token;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { amount, orderId, userId, userName, userPhone, planName, planId, redirectUrl } = body;

        if (!amount || !orderId) {
            return NextResponse.json({ error: 'amount and orderId are required' }, { status: 400 });
        }

        const merchantId = process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID!;
        const accessToken = await getAccessToken();

        // Create payment order
        const orderPayload = {
            merchantOrderId: orderId,
            amount: Math.round(amount * 100), // paise
            expireAfter: 1200, // 20 minutes
            paymentFlow: {
                type: 'PG_CHECKOUT',
                message: `Payment for ${planName || 'Subscription'}`,
                merchantUrls: {
                    redirectUrl: redirectUrl || `${req.nextUrl.origin}/services?payment=callback`,
                },
            },
        };

        const orderRes = await fetch(`${getBaseUrl()}/checkout/v2/pay`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `O-Bearer ${accessToken}`,
            },
            body: JSON.stringify(orderPayload),
        });

        if (!orderRes.ok) {
            const err = await orderRes.text();
            throw new Error(`PhonePe order error: ${orderRes.status} - ${err}`);
        }

        const orderData = await orderRes.json();

        // Return the tokenUrl (checkout URL) to the frontend
        return NextResponse.json({
            success: true,
            orderId,
            tokenUrl: orderData.redirectUrl || orderData.tokenUrl || orderData.checkoutUrl,
            orderData,
        });
    } catch (error: any) {
        console.error('PhonePe create-order error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create payment order' },
            { status: 500 }
        );
    }
}
