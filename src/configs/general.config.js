const express = require('express') ; 
const bodyParser = require('body-parser') ; 
const cors = require('cors') ; 
const dotenv = require('dotenv') ; 
const database = require('../configs/db.config') ; 
const helmet = require('helmet') ; 
const morgan = require('morgan') ; 
var cookieParser = require('cookie-parser')
const userRoute = require('../api/routes/users.route'); 
const lot = require('../api/routes/lot.route')
const projet = require('../api/routes/projet.route')
const typelot = require('../api/routes/typeLot.route')


/* CONFIGURATION */
dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser())
/* ROUTES */
app.use("/user", userRoute);
app.use('/lot',lot)
app.use('/projet',projet)
app.use('/typelot',typelot)

/* MONGOOSE SETUP */
// database.connect();


module.exports = app;




















// const app = require("./app");
// const server = http.createServer(app);


// mongoose
//   .connect(process.env.MONGO_URL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//   })
//   .then(() => {
//     app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
//   })
//   .catch((error) => console.log(`${error} did not connect`));