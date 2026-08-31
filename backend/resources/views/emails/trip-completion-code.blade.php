<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">Your trip is wrapping up</h2>
    <p>{{ $booking->listing->title }}</p>
    <p>When your host is ready to close out the booking, give them this code:</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center;
              background: #eaf5e4; color: #2c4a1e; padding: 20px; border-radius: 12px; margin: 20px 0;">
        {{ $code }}
    </p>
    <p style="color: #888; font-size: 12px;">Valid for 24 hours. If it expires, just ask your host to request a new one from your booking.</p>
</body>
</html>
