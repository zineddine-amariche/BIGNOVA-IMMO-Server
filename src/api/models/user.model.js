const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");


const refreshTokenSchema = new mongoose.Schema({
  expiresAt: { type: Date, required: true },
  token: { type: String, required: true },
});


const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 100,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    phone: {
      type: String,
      max: 50,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    birthDay: {
      type: String,
      required: true,
      min: 6,
    },
    role: {
      type: Number,
      enum: [1, 2, 3],
      default: 1,
    },
    roleName: {
      type: String,
    },
    token: {
      type: String,
    },
    profileImage: {
      type: mongoose.Schema.Types.Mixed,
    },
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "lot",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    refreshToken:refreshTokenSchema
  
    
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  switch (this.role) {
    case 1:
      this.roleName = "ADMIN";
      break;
    case 2:
      this.roleName = "MANAGER";
      break;
    case 3:
      this.roleName = "ACQUEREURE";
      break;
    default:
      this.roleName = "Unknown Role";
      break;
  }
  next();
});

userSchema.methods.generateRefreshToken = function () {
  const expiresInDays = 7;
  const refreshToken = jwt.sign(
    { userId: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: `${expiresInDays}d` }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  this.refreshToken = { token: refreshToken, expiresAt };
  this.save();

  return refreshToken;
};


userSchema.methods.generateAccessToken = function (user) {
  // Generate access token logic...
  const accessToken = jwt.sign(
    { email: user.email, id: user._id },
    process.env.BEARER_TOKEN_SECRET,
    { expiresIn: "1h" }
  );
  return accessToken;
};

// function generateAccessToken(user) {
//   const accessToken = jwt.sign(
//     { email: user.email, id: user._id },
//     process.env.BEARER_TOKEN_SECRET,
//     { expiresIn: "1h" }
//   );
//   return accessToken;
// }
const User = mongoose.model("User", userSchema);

module.exports = User

