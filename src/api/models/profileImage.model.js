const { default: mongoose } = require("mongoose");

const ProfileImageSchema = new mongoose.Schema(
    {
      data: Buffer,
      contentType: String,
    },
    { timestamps: true }
  );
  
  const ProfileImage = mongoose.model('ProfileImage', ProfileImageSchema);
  
  module.exports = ProfileImage;
  