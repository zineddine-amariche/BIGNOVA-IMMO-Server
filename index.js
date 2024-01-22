
const http = require("http");
const app = require("./src/configs/general.config");
const server = http.createServer(app);
const PORT = 5000;
const connectDB = require('./src/configs/db.config')
require('dotenv').config();
require('express-async-errors');
const user = require('./src/api/routes/users.route')

const port = process.env.PORT || PORT;
app.use('/api',user)

 /// server listening 
const start = async () => {
  try {
    //console.log(process.env.MONGO_URI)
    
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port} `)
    );
    
  } catch (error) {
    console.log(error);
  }
};

start();