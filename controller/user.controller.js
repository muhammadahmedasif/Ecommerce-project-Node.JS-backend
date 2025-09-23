import UserModel from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import SendEmailFun from '../config/sendemail.js';
import htmlTemplate from '../utils/verifyemailtemplate.js';
import textTemplate from '../utils/verifyemialtexttemplate.js';
import generateaccesstoken from '../utils/generateaccesstoken.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import generaterefreshtoken from '../utils/generaterefreshtoken.js';
import { error } from 'console';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});


export async function registerUserController(req, res) {
    try {

        let user;

        const { name, email, password } = req.body;

        // if (!name || !email || !password) {
        //     return res.status(400).json(
        //         {
        //             message: "Please fill all the necessary fields",
        //             error: true,
        //             success: false,
        //         }
        //     )
        // }

        user = await UserModel.findOne({ email });

        if (user) {
            return res.status(400).json({
                message: "Already registered user with this email",
                error: true,
                success: false,
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashpassword = await bcrypt.hash(password, salt);
        const verifyOTP = Math.floor(100000 + Math.random() * 900000).toString();

        user = new UserModel(
            {
                name: name,
                email: email,
                password: hashpassword,
                otp: verifyOTP,
                otpexpiry: Date.now() + 600000,
            }
        );

        await user.save();

        await SendEmailFun(
            {
                to: email,
                subject: "Verify Your Email Ecommerce App",
                text: textTemplate(user.name, user.otp),
                html: htmlTemplate(user.name, user.otp),
            }
        )


        return res.status(200).json({
            success: true,
            error: false,
            message: "User registration Successful! Please verify your email",
            verifyOTP: verifyOTP,
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: error.message || error,
                error: true,
                success: false,
            }
        )
    }
}


export async function verifyEmailController(req, res) {
    try {
        const { email, otp } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found with this email",
                success: false,
                error: true,
            })
        }

        const iscodevalid = user.otp === otp;
        const isotpnotexpired = user.otpexpiry > Date.now();

        if (iscodevalid && isotpnotexpired) {
            user.verify_email = true;
            user.otp = null;
            user.otpexpiry = null;

            await user.save();

            return res.status(200).json({
                message: "Email Verified Successfully!",
                error: false,
                success: true,
            })

        } else if (!iscodevalid) {
            return res.status(400).json({
                message: "Invalid OTP! Proviide correct OTP",
                error: true,
                success: false,
            })
        } else {
            return res.status(400).json({
                message: "Time Expired!",
                error: true,
                success: false,
            })
        }

    } catch (error) {
        return res.status(500).json(
            {
                message: error.message || error,
                error: true,
                success: false,
            }
        )
    }
}


export async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found with this email",
                success: false,
                error: true,
            })
        }

        if (user.status !== 'Active') {
            return res.status(400).json({
                message: "User Not Active Contact Admin",
                success: false,
                error: true,
            })
        }
        if (!user.verify_email) {
            return res.status(400).json({
                message: "User Not Verified Please Verify OTP",
                success: false,
                error: true,
            })
        }

        const validatepassword = await bcrypt.compare(password, user.password)
        console.log(validatepassword)
        if (!validatepassword) {
            return res.status(400).json({
                message: "Invalid Password",
                error: true,
                success: false,
            })
        }

        const accesstoken = generateaccesstoken(user._id);
        const refreshtoken = generaterefreshtoken(user._id);

        user.refresh_token = refreshtoken,
            user.last_login_date = new Date(),

            await user.save();

        const cookiesoption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        res.cookie('accessToken', accesstoken, cookiesoption);
        res.cookie('refreshToken', refreshtoken, cookiesoption);

        return res.status(200).json({
            message: "Login Successfully!",
            error: false,
            success: true,
            data: {
                accesstoken,
                refreshtoken,
            }
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: error.message || error,
                error: true,
                success: false,
            }
        )
    }
}


export async function logoutUserController(req, res) {

    try {

        const user = await UserModel.findById(req.userId) //from the jwt decoding || middleware when jwt decodes the token it sets the userId in the req


        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            })
        }

        if (!user.verify_email) {
            return res.status(400).json({
                message: "User not verified",
                success: false,
                error: true
            })
        }

        const cookieOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        }

        res.clearCookie('accessToken', cookieOption);
        res.clearCookie('refreshToken', cookieOption);

        user.refresh_token = "";
        await user.save();

        return res.status(200).json({
            message: "Logout Successfully!",
            error: false,
            success: true,
        })

    } catch (error) {
        return res.status(500).json(
            {
                message: error.message || error,
                error: true,
                success: false,
            }
        )
    }

}

// var imagesArray = [];

// export async function userAvatarController(req, res) {
//     try {
//         imagesArray = [];

//         const userid = req.userId;

//         const user = await UserModel.findOne({ _id: userid });

//         if (!user) {
//             return res.status(400).json({
//                 message: "User Not Found",
//                 error: true,
//                 success: false,
//             })
//         };

//         //removing the prev image/images first on upload of the new one
//       if(user.avatar){
//         const avatarimagetodestroyURL = user.avatar;
//         const avatarimagetodestroyURLarray = avatarimagetodestroyURL.split('/');
//         const avatarimagetodestroy = avatarimagetodestroyURLarray[avatarimagetodestroyURLarray.length - 1];

//         const avatarimagetodestroyimagename = avatarimagetodestroy.split('.')[0];

//         await cloudinary.uploader.destroy(
//             avatarimagetodestroyimagename,
//             (error, result) => {
//                 console.log(result, error);
//             }
//         );
//       }

//         // Case 1: single upload
//         if (req.file) {
//             const options = {
//                 use_filename: true,
//                 unique_filename: false,
//                 overwrite: false,
//             };

//             const result = await cloudinary.uploader.upload(
//                 req.file.path,
//                 options
//             );

//             imagesArray.push(result.secure_url);

//             fs.unlinkSync(`uploads/${req.file.filename}`);
//         }

//         // Case 2: multiple upload
//         if (req.files && req.files.length > 0) {
//             for (let i = 0; i < req.files.length; i++) {
//                 const result = await cloudinary.uploader.upload(
//                     req.files[i].path,
//                     {
//                         use_filename: true,
//                         unique_filename: false,
//                         overwrite: false,
//                     }
//                 );

//                 imagesArray.push(result.secure_url);

//                 fs.unlinkSync(`uploads/${req.files[i].filename}`);
//             }
//         }

//         user.avatar = imagesArray[0];
//         await user.save();

//         return res.status(200).json({
//             message: "Images Uploaded",
//             _id: userid,
//             avatar: imagesArray[0], // first image as avatar
//         });
//     } catch (error) {
//         return res.status(500).json({
//             message: error.message || error,
//             error: true,
//             success: false,
//         });
//     }
// }





export async function userAvatarController(req, res) {
    try {
        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            })
        }

        if (!user.verify_email) {
            return res.status(400).json({
                message: "User not verified",
                success: false,
                error: true
            })
        }
        const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
        };

        // If user already has avatars, delete them all before uploading new ones
        // Remove all previous images from Cloudinary
        if (user.avatarPublicId && user.avatarPublicId.length > 0) {
            for (const publicId of user.avatarPublicId) {
                await cloudinary.uploader.destroy(publicId);
            }
            // clear old keys after deletion
            user.avatarPublicId = [];
        }

        let uploadedImagessecureurl = [];
        let uploadedImagespublickey = [];

        // Case 2: files upload
        if (req.files && req.files.length > 0) {
            for (let f of req.files) {
                const result = await cloudinary.uploader.upload(f.path, options);

                uploadedImagessecureurl.push(result.secure_url);
                uploadedImagespublickey.push(result.public_id);

                fs.unlinkSync(`uploads/${f.filename}`);
            }
        }

        // ✅ Save all new images
        user.avatar = uploadedImagessecureurl[0];
        user.avatarPublicId = uploadedImagespublickey;


        await user.save();

        return res.status(200).json({
            message: "Images Uploaded",
            data: {
                _id: user._id,
                avatar: user.avatar
            },
            success: true,
            error: false
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}




export async function userAvatarDeleteColltroller(req, res) {

    try {

        const user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            })
        }
        if (!user.verify_email) {
            return res.status(400).json({
                message: "User not verified",
                success: false,
                error: true
            })
        }

        // const imageURL = req.query.image;
        // const URLarray = imageURL.split('/');
        // const image = URLarray[URLarray.length - 1];

        // const imagename = image.split('.')[0];

        // const deletedimage = await cloudinary.uploader.destroy(imagename);


          if (user.avatarPublicId && user.avatarPublicId.length > 0) {
            for (const publicId of user.avatarPublicId) {
                const deletedimage = await cloudinary.uploader.destroy(publicId);
                 if (deletedimage) {
                     user.avatar = "/images.png";
                     user.avatarPublicId = []
                     await user.save()
            return res.status(200).json({
            message: "Avatar Removed",
            data: {
                _id: user._id,
                avatar: user.avatar
            },
            success: true,
            error: false
        });

        }
            }
            // clear old keys after deletion
            user.avatarPublicId = [];
        }


        return res.status(400).json({
            message: "Image can not be deleted",
            error: true,
            success: false,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}

export async function userProfileUpdateController(req, res) {
    try {
        let { email, oldpassword, password, mobile, name, nickname } = req.body;

        let user = await UserModel.findById(req.userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            })
        }
        if (!user.verify_email) {
            return res.status(400).json({
                message: "User not verified check email and verify OTP",
                success: false,
                error: true
            })
        }

        let otp = "";
        if (email) {
            if (email === user.email) {
                return res.status(401).json({
                    message: "This email is already registered try updating with a new email",
                    error: true,
                    success: false,
                })
            }
            otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.email = email;
            user.verify_email = false;
            user.otp = otp;
            user.otpexpiry = Date.now() + 600000;
        }

        if (password) {
            const validatepassword = await bcrypt.compare(oldpassword, user.password);
            if (!validatepassword) {
                console.log(validatepassword)
                return res.status(401).json({
                    message: "This Passsword incorrect",
                    error: true,
                    success: false,
                })
            }
            if(validatepassword && (password === oldpassword)){
                 return res.status(401).json({
                    message: "This Passsword already in use try setting a new one",
                    error: true,
                    success: false,
                })
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            if (otp === "") {

                otp = Math.floor(100000 + Math.random() * 900000).toString();
                user.verify_email = false;
                user.otp = otp;
                user.otpexpiry = Date.now() + 600000;
            }
        }

        if (name) {
            user.name = name;
        }
        if (nickname) {
            user.nickname = nickname;
        }

        if (mobile) {
            user.mobile = mobile;
        }

        await user.save();
        let otpmessage = "";
        if (otp) {
            await SendEmailFun(
                {
                    to: user.email,
                    subject: "Verify Your Email Ecommerce App",
                    text: textTemplate(user.name, user.otp),
                    html: htmlTemplate(user.name, user.otp),
                }
            )


            otpmessage = "Password or Email resetted Check your Email for the OTP"
        }

        return res.status(200).json({
            message: otp !== "" ? `Profile Updated! and ${otpmessage}` : 'Profile Updated Successfully',
            error: false,
            success: true,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        });
    }
}


export async function userForgetPasswordController(req, res) {
    try {

        const { email } = req.body;
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "Incorrect Email No User Found",
                success: false,
                error: true
            })
        }

        user.otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.verify_email = false;
        user.otpexpiry = Date.now() + 600000;
        await user.save();

        await SendEmailFun(
            {
                to: user.email,
                subject: "Verify Your Email Ecommerce App",
                text: textTemplate(user.name, user.otp),
                html: htmlTemplate(user.name, user.otp),
            }
        )

        return res.status(200).json({
            message: "OTP Sent! Verify Email",
            error: false,
            success: true,
            otp: user.otp,
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }

}


export async function userPasswordController(req, res) {
    try {
        const { password,email, confirmpassword } = req.body;

        const user = await UserModel.findOne({email})

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                success: false,
                error: true
            })
        }

        if (confirmpassword === password) {
            const validatepassword = await bcrypt.compare(password, user.password);
            if (validatepassword) {
                return res.status(401).json({
                    message: "This Passsword is already Used try updating with a new Password",
                    error: true,
                    success: false,
                })
            }


            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            return res.status(200).json({
                message: "Email Verified Successfully! and Password updated Successfully",
                error: false,
                success: true,
            })

        }

        return res.status(401).json({
            message: confirmpassword !== password ? "Password and Confirm Password should be same" : "Completely fill all the fields",
            error: true,
            success: false,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }
}


export async function refreshuseraccesstoken(req, res) {
    try {

        const refreshtoken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1];

        if (!refreshtoken) {
            return res.status(401).json({
                message: "No Refresh Token Login or signup",
                success: false,
                error: true,
            });
        };

        const verifyrefreshtoken = jwt.verify(refreshtoken, process.env.JSON_WEB_TOKEN_SECRET_REFRESH);

        if (!verifyrefreshtoken) {
            return res.status(401).json({
                message: "Token Expired Login again",
                success: false,
                error: true,
            });
        };

        const accesstoken = generateaccesstoken(refreshtoken._id);

        const cookiesoption = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        res.cookie("accessToken", accesstoken, cookiesoption);

        return res.status(200).json({
            message: "Access Token Granted!",
            success: true,
            error: false,
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }

}

export async function fetchUserDetails(req, res) {
    try {
        const user = await UserModel.findById(req.userId).select({ password: 0, refresh_token: 0 });

        if (!user) {
            return res.status(400).json({
                message: "User not found",
                error: true,
                success: false,
            })
        }

        if (!user.verify_email) {
            return res.status(400).json({
                message: "User is not verified",
                error: true,
                success: false,
            })
        }

        return res.status(200).json({
            message: "User Found Details are:",
            user_details: user,
            error: false,
            success: true,
        })


    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true,
            success: false,
        })
    }

}