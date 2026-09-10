<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; color: #1a1a1a; max-width: 520px; margin: 0 auto; padding: 24px;">
    <h2 style="color: #2c4a1e;">Payout settled</h2>
    <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #888;">Booking</td><td style="text-align: right;">#{{ $bookingId }} — {{ $listingTitle }}</td></tr>
        <tr><td style="padding: 6px 0; color: #888;">Vendor</td><td style="text-align: right;">{{ $businessName }}</td></tr>
        <tr><td style="padding: 6px 0; color: #888;">Guest</td><td style="text-align: right;">{{ $travellerName }}</td></tr>
        <tr><td style="padding: 6px 0; color: #888;">Paid to vendor</td><td style="text-align: right; font-weight: bold;">KES {{ number_format($vendorNet) }}</td></tr>
        <tr><td style="padding: 6px 0; color: #888;">Erranza commission</td><td style="text-align: right; font-weight: bold; color: #2c4a1e;">KES {{ number_format($commission) }}</td></tr>
        <tr><td style="padding: 6px 0; color: #888;">Destination</td><td style="text-align: right;">{{ $destination }}</td></tr>
        <tr><td style="padding: 6px 0; color: #888;">M-Pesa ref</td><td style="text-align: right;">{{ $reference ?? '—' }}</td></tr>
    </table>
</body>
</html>
