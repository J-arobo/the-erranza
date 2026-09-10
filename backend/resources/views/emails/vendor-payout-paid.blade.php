<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">You've been paid</h2>
    <p>Hi {{ $businessName }},</p>
    <p style="font-size: 24px; font-weight: bold; margin: 16px 0;">KES {{ number_format($amount) }}</p>
    <p>for <strong>{{ $listingTitle }}</strong> has been sent to {{ $destination }}.</p>
    @if ($reference)
        <p style="color: #888; font-size: 13px;">M-Pesa reference: {{ $reference }}</p>
    @endif
    <p style="color: #888; font-size: 13px;">This is net of Erranza's commission. See all your payouts under Earnings → Payouts.</p>
</body>
</html>