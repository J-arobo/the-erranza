<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">Payment received ✓</h2>
    <p>Thanks for your payment — here's your receipt.</p>
    <p style="font-weight: bold; margin-top: 16px;">{{ $booking->listing->title }}</p>
    <p>Guests: {{ $booking->guests }}</p>
    @if ($booking->check_in)
        <p>Dates: {{ $booking->check_in->format('j M Y') }}@if($booking->check_out) &ndash; {{ $booking->check_out->format('j M Y') }}@endif</p>
    @endif
    <p style="font-size: 20px; font-weight: bold; margin-top: 12px;">Total paid: Ksh {{ number_format($booking->total, 0) }}</p>
    @if ($reference)
        <p style="color: #888; font-size: 12px;">Reference: {{ $reference }}</p>
    @endif
    <p style="color: #888; font-size: 12px;">Paid on {{ ($booking->payments->last()->paid_at ?? now())->format('j M Y, g:i A') }}</p>
    <p style="color: #888; font-size: 12px; margin-top: 24px;">Your host still needs to confirm this booking — we'll email you again once they do. Thanks for booking with Erranza.</p>
</body>
</html>
