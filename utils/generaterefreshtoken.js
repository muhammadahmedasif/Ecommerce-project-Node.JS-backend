import UserModel from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const generaterefreshtoken = (userid)=>{
    const token = jwt.sign(
        {
            id: userid,
        },
        process.env.JSON_WEB_TOKEN_SECRET_REFRESH,
        {
            expiresIn: '30d',
        }
    )
// doing by send avoiding more database queries
    // const updaterefreshtoken = await UserModel.updateOne({_id: userid},
    //     {
    //         refresh_token: token
    //     }
    // );

    return token;
}


export default generaterefreshtoken;
