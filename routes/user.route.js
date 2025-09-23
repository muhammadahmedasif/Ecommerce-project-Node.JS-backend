import { Router } from "express";
import { fetchUserDetails, loginUserController, logoutUserController, refreshuseraccesstoken, registerUserController, userAvatarController, userAvatarDeleteColltroller, userForgetPasswordController, userPasswordController, userProfileUpdateController, verifyEmailController } from "../controller/user.controller.js";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/multer.js";

const userRouter = Router();

userRouter.get('/logout', auth, logoutUserController);
userRouter.post('/register', registerUserController);
userRouter.post('/verifyemail', verifyEmailController);
userRouter.post('/login', loginUserController);
userRouter.post('/avatarupload', auth, upload.array('avatar'), userAvatarController);
userRouter.put('/updateprofile', auth, userProfileUpdateController);
userRouter.post('/forgetpassword', userForgetPasswordController);
userRouter.put('/newpassword', userPasswordController);
userRouter.delete('/deleteavatarimage', auth, userAvatarDeleteColltroller);
userRouter.post('/refreshaccesstoken', refreshuseraccesstoken);
userRouter.get('/userdetails',auth, fetchUserDetails);


export default userRouter;