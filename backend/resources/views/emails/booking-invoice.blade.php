<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">Your trip is ready to book</h2>
    <p>{{ $booking->listing->title }}</p>
    <p>Guests: {{ $booking->guests }}</p>
    @if ($booking->check_in)
        <p>Dates: {{ $booking->check_in->format('j M Y') }}@if($booking->check_out) &ndash; {{ $booking->check_out->format('j M Y') }}@endif</p>
    @endif
    <p style="font-size: 20px; font-weight: bold;">Amount due: Ksh {{ number_format($booking->total, 0) }}</p>
    <a href="{{ $paymentLink }}" style="display: inline-block; background: #2c4a1e; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
        Pay now
    </a>
    <p style="color: #b45309; font-size: 12px; margin-top: 16px;">
        This link expires on {{ $booking->invoice_expires_at?->format('j M Y, g:ia') }} — please pay before then.
    </p>
    <p style="color: #888; font-size: 12px; margin-top: 24px;">If you didn't expect this email, you can safely ignore it.</p>
</body>
</html>
