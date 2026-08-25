<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">New paid booking request</h2>
    <p>{{ $booking->traveller->name }} has paid for a booking on one of your listings. Accept it to confirm the trip.</p>
    <p style="font-weight: bold; margin-top: 16px;">{{ $booking->listing->title }}</p>
    <p>Guests: {{ $booking->guests }}</p>
    @if ($booking->check_in)
        <p>Dates: {{ $booking->check_in->format('j M Y') }}@if($booking->check_out) &ndash; {{ $booking->check_out->format('j M Y') }}@endif</p>
    @endif
    <p style="font-size: 20px; font-weight: bold; margin-top: 12px;">Total: Ksh {{ number_format($booking->total, 0) }}</p>
    <p style="margin-top: 24px;">
        <a href="{{ $acceptLink }}" style="background: #2c4a1e; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;">
            Review &amp; accept booking
        </a>
    </p>
    <p style="color: #888; font-size: 12px; margin-top: 24px;">Log in to your Erranza vendor dashboard to accept or decline this request.</p>
</body>
</html>
