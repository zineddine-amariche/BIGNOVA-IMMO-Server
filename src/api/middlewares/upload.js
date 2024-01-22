const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
  fileFilter: (req, file, cb) => {
    // Check file types (you can customize this based on your needs)
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG and PNG files are allowed."));
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB file size limit
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
