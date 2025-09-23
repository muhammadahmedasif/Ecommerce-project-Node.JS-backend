import sendEmail from '../config/emailservice.js'

const SendEmailFun = async (to, subject, text, html) => {
    const result = await sendEmail(to, subject, text, html);

    if (result.success) {
        return true;
    } else {
        return false
    }

}

export default SendEmailFun;