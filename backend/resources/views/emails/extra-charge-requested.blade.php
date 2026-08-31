<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">Extra charge requested</h2>
    <p>Your host for <strong>{{ $booking->listing->title }}</strong> has requested an additional charge:</p>
    <p style="font-weight: bold; margin-top: 12px;">{{ $charge->description }}</p>
    <p style="font-size: 28px; font-weight: bold; color: #2c4a1e; margin: 16px 0;">
        Ksh {{ number_format($charge->amount, 0) }}
    </p>
    <p style="color: #888; font-size: 12px;">Review and approve or decline it from your trip details in the Erranza app.</p>
</body>
</html>
