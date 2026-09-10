<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 480px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">You've been invited</h2>
    <p>
        <strong>{{ $member->vendor->business_name }}</strong> has invited you to join their team on Erranza
        as a <strong>{{ $member->role }}</strong>.
    </p>
    <p style="margin: 24px 0;">
        <a href="{{ $acceptLink }}"
           style="background: #2c4a1e; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: bold;">
            Accept invite
        </a>
    </p>
    <p style="color: #888; font-size: 13px;">This invite expires in 7 days. If you weren't expecting this, you can ignore this email.</p>
</body>
</html>
