<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">You're confirmed! 🎉</h2>
    <p>{{ $booking->listing->title }}</p>
    <p>Guests: {{ $booking->guests }}</p>
    @if ($booking->check_in)
        <p>Dates: {{ $booking->check_in->format('j M Y') }}@if($booking->check_out) &ndash; {{ $booking->check_out->format('j M Y') }}@endif</p>
    @endif
    <p style="font-size: 20px; font-weight: bold;">Total paid: Ksh {{ number_format($booking->total, 0) }}</p>
    <p style="color: #888; font-size: 12px; margin-top: 24px;">Your host will be in touch with any further details. Thanks for booking with Erranza.</p>
</body>
</html>
