import jwt from 'jsonwebtoken';

const generateaccesstoken = (userid)=>{

    const token = jwt.sign(
        {
            id: userid
        },
        process.env.JSON_WEB_TOKEN_SECRET_KEY,
        {
            expiresIn: '5h',
        }
    )

    return token;
}


export default generateaccesstoken;