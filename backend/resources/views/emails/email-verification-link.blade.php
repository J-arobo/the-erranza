<!DOCTYPE html>
<html>
<body style="font-family: Arial, Helvetica, sans-serif; color: #333; background: #eeeeee; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff;">
    <div style="background: #2c4a1e; height: 72px;"></div>
    <div style="padding: 40px 40px 32px;">
      <h1 style="font-size: 24px; font-weight: normal; color: #333; margin: 0 0 28px;">Account Confirmation</h1>

      <p style="margin: 0 0 4px;">Hi {{ $userName }},</p>
      <p style="margin: 0 0 4px;">You have created an Erranza account.</p>
      <p style="margin: 0 0 28px;">Please click the button below to confirm your email address.</p>

      <p style="margin: 0 0 32px;">
        <a href="{{ $url }}"
           style="background: #6aa84f; color: #ffffff; padding: 14px 28px; border-radius: 6px;
                  text-decoration: none; font-weight: bold; display: inline-block;">
          Confirm Account
        </a>
      </p>

      <p style="margin: 0 0 8px;">If clicking the button doesn't seem to work, you can copy and paste the following link into your browser.</p>
      <p style="margin: 0 0 28px; word-break: break-all;">
        <a href="{{ $url }}" style="color: #6aa84f;">{{ $url }}</a>
      </p>

      <p style="color: #888; font-size: 13px; margin: 0 0 24px;">
        This link expires in 60 minutes. If you didn't create this account, you can ignore this email.
      </p>

      <p style="margin: 0;">Thanks,<br>The Erranza Team</p>
    </div>
    <div style="text-align: center; color: #999; font-size: 12px; padding: 20px;">
      &copy; {{ date('Y') }} Erranza
    </div>
  </div>
</body>
</html>
