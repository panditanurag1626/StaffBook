# PhonePe Payment Integration Guide

## Overview
This document explains the PhonePe payment integration implemented in the Services component for subscription purchases.

## Configuration

### Environment Variables
Add the following variables to your `.env.local` file:

```env
# PhonePe Payment Gateway Configuration
NEXT_PUBLIC_PHONEPE_MERCHANT_ID=YOUR_MERCHANT_ID_HERE
NEXT_PUBLIC_PHONEPE_SALT_KEY=YOUR_SALT_KEY_HERE
NEXT_PUBLIC_PHONEPE_SALT_INDEX=1
NEXT_PUBLIC_PHONEPE_ENV=UAT  # Use 'PRODUCTION' for live environment
```

### Getting PhonePe Credentials
1. Sign up for PhonePe Business at https://business.phonepe.com/
2. Complete KYC verification
3. Get your Merchant ID and Salt Key from the dashboard
4. Use UAT environment for testing, PRODUCTION for live

## Payment Flow

### 1. User Clicks "Buy Now"
- User selects a subscription plan
- Clicks "Buy Now" button on the ServiceCard

### 2. Payment Initiation
```typescript
handleBuyNow(plan) {
  // Validates user is logged in
  // Extracts amount from plan
  // Calls PhonePe initiatePayment()
  // Redirects to PhonePe payment page
}
```

### 3. PhonePe Payment Page
- User completes payment on PhonePe's secure page
- Supports UPI, Cards, Net Banking, Wallets

### 4. Payment Callback
- PhonePe redirects back to: `/payment/callback?txnId=XXX&status=success`
- App verifies payment with PhonePe API
- Stores payment details in state

### 5. Payment Verification
```typescript
handlePaymentCallback(transactionId, status) {
  // Verifies payment with PhonePe
  // Creates PaymentDetails object
  // Stores in state
  // Shows success/failure message
}
```

## Payment Details Structure

The payment details are stored in state with the following structure:

```typescript
interface PaymentDetails {
  transactionId: string;        // Unique transaction ID
  amount: number;               // Payment amount in INR
  planId: string | number;      // Subscription plan ID
  planName: string;             // Plan name
  status: 'initiated' | 'success' | 'failed' | 'pending';
  timestamp: string;            // ISO timestamp
  userId: string;               // User ID
  userName: string;             // User full name
  phoneNumber?: string;         // User phone number
  paymentResponse?: any;        // Full PhonePe response
}
```

## State Management

### Current Implementation
Payment details are stored in component state:

```typescript
const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
const [paymentHistory, setPaymentHistory] = useState<PaymentDetails[]>([]);
```

### Next Steps
You mentioned you'll use these details later. Here's what you can do:

1. **Send to Backend API**
   ```typescript
   // In handlePaymentCallback, after successful verification:
   await fetch('/api/subscriptions/activate', {
     method: 'POST',
     body: JSON.stringify(paymentDetails)
   });
   ```

2. **Store in Database**
   - Create a subscription activation endpoint
   - Save payment details to your database
   - Activate user's subscription
   - Update user's plan status

3. **Update User Context**
   ```typescript
   // After successful payment
   await refreshUser(); // Refresh user data to get updated subscription
   ```

## API Endpoints Required

You'll need to create these backend endpoints:

### 1. Initiate Payment
```
POST /api/payment/phonepe/initiate
Body: {
  amount: number,
  merchantTransactionId: string,
  merchantUserId: string,
  redirectUrl: string,
  callbackUrl: string,
  mobileNumber?: string
}
```

### 2. Verify Payment
```
GET /api/payment/phonepe/verify/:transactionId
```

### 3. Activate Subscription
```
POST /api/subscriptions/activate
Body: PaymentDetails
```

## Testing

### UAT Environment
- Use test credentials from PhonePe dashboard
- Test with PhonePe's test UPI IDs
- No real money is charged

### Test Flow
1. Click "Buy Now" on any plan
2. You'll be redirected to PhonePe UAT page
3. Use test UPI ID: `success@ybl` for successful payment
4. Use test UPI ID: `failure@ybl` for failed payment
5. Check console logs for payment details

## Security Considerations

1. **Never expose Salt Key in frontend**
   - Current implementation uses env variables
   - In production, handle payment initiation on backend

2. **Verify all payments on backend**
   - Don't trust client-side verification alone
   - Always verify with PhonePe API on your server

3. **Use HTTPS**
   - PhonePe requires HTTPS for callbacks
   - Ensure your production domain has SSL

## Production Checklist

- [ ] Replace placeholder credentials with real PhonePe credentials
- [ ] Change environment to PRODUCTION
- [ ] Implement backend payment verification
- [ ] Set up proper callback URLs
- [ ] Test with real payment methods
- [ ] Implement subscription activation logic
- [ ] Add payment failure handling
- [ ] Set up payment reconciliation
- [ ] Add payment history page
- [ ] Implement refund handling (if needed)

## Debugging

### Check Payment Details
In development mode, payment details are displayed on screen:
```tsx
{paymentDetails && process.env.NODE_ENV === 'development' && (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
    <h3>Latest Payment Details (Dev Only)</h3>
    <pre>{JSON.stringify(paymentDetails, null, 2)}</pre>
  </div>
)}
```

### Console Logs
Check browser console for:
- Payment initiation logs
- Payment callback logs
- Verification results
- Error messages

## Files Modified

1. **`/src/lib/api/services/phonePeService.ts`** - PhonePe service layer
2. **`/src/components/shared/ServiceCard.tsx`** - Added onBuyNow callback
3. **`/src/components/Services/Services.tsx`** - Payment flow implementation
4. **`.env.local`** - PhonePe configuration

## Support

For PhonePe integration issues:
- Documentation: https://developer.phonepe.com/
- Support: https://business.phonepe.com/support
- Status Page: https://status.phonepe.com/

## Next Steps

1. **Replace credentials** in `.env.local` with your actual PhonePe credentials
2. **Create backend endpoints** for payment initiation and verification
3. **Implement subscription activation** logic in your backend
4. **Test the complete flow** in UAT environment
5. **Move to production** after thorough testing
