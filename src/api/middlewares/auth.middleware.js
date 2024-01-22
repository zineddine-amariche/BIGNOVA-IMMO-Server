const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const bearerToken = token.substring(7); // Remove "Bearer " from the token string

    jwt.verify(bearerToken, process.env.BEARER_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Invalid token authentication.  " });
      }

      req.user = decoded; // Assign the decoded user object to the request object
      next();
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports.auth = auth;
