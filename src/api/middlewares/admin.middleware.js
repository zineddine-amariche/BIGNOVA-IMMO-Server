const User = require("../models/user.model");

const admin = async (req, res, next) => {

  try {
    const user = await User.findById(req.user.userId); // Find the user by their ID
 
    if (!user || user.role !== 1) {
      return res
        .status(403)
        .json({ message: "Access to admin resources denied." });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = admin;
