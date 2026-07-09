/**
 * PhonePe Standard Checkout - Frontend Service
 *
 * Flow:
 * 1. Call /api/phonepe/create-order (our Next.js API route) → get tokenUrl
 * 2. Load PhonePeCheckout.js script
 * 3. Call PhonePeCheckout.transact({ tokenUrl, type: 'IFRAME', callback })
 *    → PhonePe shows its payment popup/iframe
 * 4. On success/failure the callback fires with the payment result
 */

export interface PhonePePaymentParams {
    amount: number;          // in ₹ (e.g. 999)
    userId: string;
    userName: string;
    userPhone?: string;
    planName: string;
    planId: string | number;
}

export interface PhonePePaymentResult {
    success: boolean;
    orderId?: string;
    transactionId?: string;
    status?: string;
    error?: string;
    rawResponse?: any;
}

/** Generate a unique merchant order ID */
export function generateOrderId(): string {
    return `ORD${Date.now()}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
}

/** Dynamically load the PhonePe Checkout JS SDK */
function loadPhonePeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('Not in browser'));

        // Already loaded
        if ((window as any).PhonePeCheckout) {
            resolve();
            return;
        }

        const existing = document.getElementById('phonepe-checkout-script');
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', () => reject(new Error('Failed to load PhonePe SDK')));
            return;
        }

        const script = document.createElement('script');
        script.id = 'phonepe-checkout-script';
        script.src = 'https://mercury.phonepe.com/web/bundle/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load PhonePe Checkout SDK'));
        document.head.appendChild(script);
    });
}

/**
 * Initiate a PhonePe payment popup (IFRAME mode).
 * Returns a promise that resolves when the user completes / dismisses payment.
 */
export async function initiatePhonePePayment(
    params: PhonePePaymentParams
): Promise<PhonePePaymentResult> {
    const orderId = generateOrderId();

    // Step 1: Create order on our server (keeps client_secret safe)
    const orderRes = await fetch('/api/phonepe/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: params.amount,
            orderId,
            userId: params.userId,
            userName: params.userName,
            userPhone: params.userPhone,
            planName: params.planName,
            planId: params.planId,
            redirectUrl: `${window.location.origin}/services?payment=callback&orderId=${orderId}`,
        }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.success || !orderData.tokenUrl) {
        if (window.location.hostname === 'localhost') {
            console.warn('MOCKING PAYMENT: PhonePe credentials not found or invalid. Returning success for testing.');
            return new Promise(resolve => {
                // Create a mock payment UI
                const overlay = document.createElement('div');
                overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 99999; font-family: sans-serif;';
                
                const modal = document.createElement('div');
                modal.style.cssText = 'background: white; padding: 24px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center;';
                
                modal.innerHTML = `
                    <h2 style="margin-top: 0; color: #333; font-size: 20px; font-weight: bold;">Test Payment Environment</h2>
                    <p style="color: #666; font-size: 14px; margin-bottom: 24px;">Select a payment method to simulate the transaction. (No real money will be charged).</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="mock-pay-btn" style="background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Pay with UPI</button>
                        <button class="mock-pay-btn" style="background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Pay with Credit/Debit Card</button>
                        <button class="mock-pay-btn" style="background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; padding: 12px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Pay with Net Banking</button>
                    </div>
                    <button id="mock-cancel-btn" style="margin-top: 24px; background: transparent; color: #ef4444; border: none; font-weight: bold; cursor: pointer;">Cancel Payment</button>
                `;
                
                overlay.appendChild(modal);
                document.body.appendChild(overlay);

                // Add event listeners to the mock buttons
                const buttons = modal.querySelectorAll('.mock-pay-btn');
                buttons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        btn.innerHTML = 'Processing...';
                        setTimeout(() => {
                            document.body.removeChild(overlay);
                            resolve({
                                success: true,
                                orderId,
                                transactionId: `mock_txn_${Date.now()}`,
                                status: 'success',
                                rawResponse: { mocked: true }
                            });
                        }, 1000);
                    });
                });

                document.getElementById('mock-cancel-btn')?.addEventListener('click', () => {
                    document.body.removeChild(overlay);
                    resolve({
                        success: false,
                        orderId,
                        status: 'cancelled',
                        error: 'Payment was cancelled',
                        rawResponse: { mocked: true }
                    });
                });
            });
        }
        throw new Error(orderData.error || 'Failed to create PhonePe order');
    }

    const tokenUrl: string = orderData.tokenUrl;

    // Step 2: Load PhonePe SDK
    await loadPhonePeScript();

    const PhonePeCheckout = (window as any).PhonePeCheckout;
    if (!PhonePeCheckout) {
        throw new Error('PhonePe Checkout SDK not available');
    }

    // Step 3: Open payment popup and wait for result
    return new Promise<PhonePePaymentResult>((resolve) => {
        let isResolved = false;

        const handleResolve = (result: PhonePePaymentResult) => {
            if (isResolved) return;
            isResolved = true;
            const btn = document.getElementById('phonepe-custom-close-btn');
            if (btn) btn.remove();
            resolve(result);
        };

        PhonePeCheckout.transact({
            tokenUrl,
            type: 'IFRAME', // Shows as popup/iframe overlay
            callback: (response: any) => {
                console.log('PhonePe payment response:', response);

                if (response === 'CONCLUDED' || (response && (response.status === 'SUCCESS' || response.code === 'PAYMENT_SUCCESS'))) {
                    handleResolve({
                        success: true,
                        orderId,
                        transactionId: response.transactionId || response.merchantOrderId || orderId,
                        status: 'success',
                        rawResponse: response,
                    });
                } else if (response && response.status === 'FAILED') {
                    handleResolve({
                        success: false,
                        orderId,
                        status: 'failed',
                        error: response.message || 'Payment failed',
                        rawResponse: response,
                    });
                } else {
                    // User closed / cancelled
                    handleResolve({
                        success: false,
                        orderId,
                        status: 'cancelled',
                        error: 'Payment was cancelled',
                        rawResponse: response,
                    });
                }
            },
        });

        // Inject a custom close button because PhonePe SDK sometimes hides it
        const injectCloseButton = () => {
            if (isResolved) return;
            
            // Check if PhonePe UI is present
            const phonepeContainer = document.getElementById('phonepe-checkout-container') || 
                                     document.querySelector('iframe[src*="phonepe.com"]') ||
                                     document.querySelector('.phonepe-checkout-iframe-container');

            if (phonepeContainer && !document.getElementById('phonepe-custom-close-btn')) {
                const closeBtn = document.createElement('div');
                closeBtn.id = 'phonepe-custom-close-btn';
                closeBtn.innerHTML = '✕';
                closeBtn.setAttribute('title', 'Close Payment');
                closeBtn.style.cssText = `
                    position: fixed;
                    top: 15px;
                    right: 15px;
                    z-index: 2147483647;
                    width: 44px;
                    height: 44px;
                    background: #ffffff;
                    color: #333333;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-family: sans-serif;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                    border: 1px solid #e0e0e0;
                    transition: all 0.2s ease;
                    -webkit-tap-highlight-color: transparent;
                `;
                
                closeBtn.onmouseenter = () => { closeBtn.style.transform = 'scale(1.1)'; };
                closeBtn.onmouseleave = () => { closeBtn.style.transform = 'scale(1)'; };
                
                closeBtn.onclick = () => {
                    if (confirm('Are you sure you want to cancel the payment?')) {
                        // Poll for the interval to stop
                        clearInterval(interval);

                        // Forcefully remove PhonePe elements
                        const selectors = [
                            '#phonepe-checkout-container',
                            '.phonepe-checkout-iframe-container',
                            'iframe[src*="phonepe.com"]',
                            '.phonepe-checkout-iframe'
                        ];
                        
                        selectors.forEach(sel => {
                            document.querySelectorAll(sel).forEach(el => el.remove());
                        });
                        
                        // Aggressively find and remove any backdrop divs added by the SDK
                        // We look for fixed/absolute elements with high z-index
                        const allElements = document.querySelectorAll('body > div, body > section');
                        allElements.forEach(el => {
                            const htmlEl = el as HTMLElement;
                            if (htmlEl.style) {
                                const style = window.getComputedStyle(htmlEl);
                                const zIndex = parseInt(style.zIndex);
                                if (zIndex >= 9999 || htmlEl.classList.contains('phonepe-checkout-backdrop')) {
                                    htmlEl.remove();
                                }
                            }
                        });

                        // Restore body scroll in case the SDK disabled it
                        document.body.style.overflow = '';
                        document.body.style.pointerEvents = '';
                        document.documentElement.style.overflow = '';

                        handleResolve({
                            success: false,
                            orderId,
                            status: 'cancelled',
                            error: 'User closed payment popup',
                        });
                    }
                };
                
                document.body.appendChild(closeBtn);
            }
        };

        // Poll for PhonePe UI injection
        const interval = setInterval(injectCloseButton, 500);
        
        // Safety timeout to stop polling after 5 minutes
        setTimeout(() => clearInterval(interval), 300000);
    });
}
