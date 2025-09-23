import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.Email,
        pass: process.env.Email_Pass,
    },
});


async function sendEmail({ to, subject, text, html }) {
    try {
        console.log("Sending Email from:", process.env.Email);
        console.log("Sending to:", to);

        const info = await transporter.sendMail({
            from: process.env.Email,
            to,
            subject,
            text,
            html,
        })
        console.log("Email send result:", info);
        return {
            success: true,
            messageID: info.messageId
        }


    } catch (error) {
        console.error("Error while sending the email: ", error);
        return {
            success: false,
            message: error.message,
        }
    }
}

export default sendEmail;