import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log(err);
        return res.status(401).json({
          message: "Auth failed",
          success: false,
        });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  } catch (err) {
    return res.status(401).json({
      message: "Auth failed",
      success: false,
    });
  }
};
