const mongoose = require("mongoose");

const PORT = process.env.PORT || 9000;

mongoose.set("strictQuery", false);

connectDB = (url) => {
  // Connecting to the database
 return mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Successfully connected to database");
    })
    .catch((error) => {
      console.log("database connection failed. exiting now...");
      console.error(error);
      //process.exit(1);
    });
};
module.exports = connectDB