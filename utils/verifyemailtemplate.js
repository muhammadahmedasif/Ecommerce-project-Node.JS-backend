// htmlTemplate.js

const htmlTemplate = (name, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Arial,sans-serif;background-color:#f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(90deg,#4CAF50,#2e7d32);color:#ffffff;text-align:center;padding:25px;font-size:26px;font-weight:bold;letter-spacing:1px;">
              🌟 Ecommerce App
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:35px;color:#333333;line-height:1.6;font-size:16px;">
              <h2 style="margin-top:0;font-size:22px;color:#222;"><h2 style="margin-top:0;font-size:22px;color:#222;">Hi ${name.charAt(0).toUpperCase() + name.slice(1)}, 👋</h2>
, 👋</h2>
              <p style="margin:15px 0;">Thank you for registering with <strong>Ecommerce App</strong>! To complete your registration, please verify your email using the One-Time Password (OTP) below:</p>
              
              <div style="text-align:center;margin:30px 0;">
                <p style="font-size:22px;font-weight:bold;color:#ffffff;background:#4CAF50;padding:15px 30px;display:inline-block;border-radius:8px;letter-spacing:2px;">
                  ${otp}
                </p>
              </div>

              <p style="margin:20px 0;">⚠️ This OTP will expire in <strong>10 minutes</strong>.</p>
              <p style="margin:20px 0;">If you did not request this email, you can safely ignore it.</p>

              <p style="margin-top:35px;">Best Regards,<br/><strong>The Ecommerce App Team</strong> </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f0f0f0;text-align:center;padding:20px;font-size:13px;color:#777777;">
              &copy; ${new Date().getFullYear()} Ecommerce App. All rights reserved.<br/>
              <span style="color:#999;">You’re receiving this email because you signed up for Ecommerce App.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

export default htmlTemplate;
