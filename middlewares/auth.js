import jwt from 'jsonwebtoken';

const auth = async (req, res, next)=>{
    try {

        const token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({
                message:"No token available",
                error:true,
                succes:false,
            })
        }
 
        const verifytoken = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY)

         if(!verifytoken){
            return res.status(401).json({
                message:"Unauthorized Access",
                error:true,
                succes:false,
            })
        }

        req.userId = verifytoken.id;

        next();
        
    } catch (error) {
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      message: "jwt expired",
      error: true,
      succes: false,
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid token",
      error: true,
      succes: false,
    });
  }

  return res.status(500).json({
    message: error.message || "Internal server error",
    error: true,
    succes: false,
  });
}
}

export default auth;