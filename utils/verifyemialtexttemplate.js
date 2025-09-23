// textTemplate.js

// ✅ Text-only email template
const textTemplate = (name, otp) => `
Ecommerce App

Hi ${name},

Thank you for registering!
Please use the following One-Time Password (OTP) to verify your email address:

${otp}

This OTP will expire in 10 minutes.
If you did not request this, please ignore this email.

Cheers,
The Ecommerce App Team

© ${new Date().getFullYear()} Ecommerce App. All rights reserved.
`;

export default textTemplate;
