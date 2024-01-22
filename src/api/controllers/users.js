const  User = require("../models/user.model.js");
const ProfileImage = require("../models/profileImage.model");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const sendgrid = require("@sendgrid/mail");

require("dotenv").config();
sendgrid.setApiKey(process.env.api_keys);

const { default: mongoose } = require("mongoose");
const { id } = require("monk");
// const RefreshToken = require("../models/refreshtoken.model.js");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    service: "hotmail",
    host: "smtp.gmail.com",
    port: 465,
    auth: {
      user: process.env.user,
      pass: process.env.password,
      api_key:
        "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",
    },
  })
);

const userController = {
  inscription: async (req, res) => {
    const file = req.file;
    const {
      email,
      firstName,
      phone,
      birthDay,
      password,
      role,
      lastName,
      createdBy,
    } = req.body;

    try {
      // Check if the request body contains all required fields
      if (
        !email ||
        !firstName ||
        !phone ||
        !birthDay ||
        !password ||
        !role ||
        !lastName
      ) {
        return res
          .status(400)
          .json({ status: "failed", message: "Invalid data." });
      }

      // Check email format
      if (
        !/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          email
        )
      ) {
        return res
          .status(405)
          .json({ status: "failed", message: "Invalid email." });
      }

      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(406)
          .json({ status: "failed", message: "This email already exists." });
      }

      // Check password length
      if (password.length < 6) {
        return res.status(400).json({
          status: "failed",
          message: "Password must be at least 6 characters.",
        });
      }

      const mdb = await bcrypt.hash(password, 12);

      let createdByUser;

      if (createdBy) {
        createdByUser = await User.findById(createdBy).populate("createdBy");
        if (!createdByUser) {
          return res.status(406).json({
            status: "failed",
            message: "The createdBy user doesn't exist.",
          });
        }
      }
      // Check if the role is valid
      if ((createdByUser && createdByUser.role !== 1 && createdBy)) {
        return res.status(401).json({
          status: "failed",
          message:
            "Access denied. Only admin users can create accounts with this role.",
        });
      }

      // const refreshToken = createdByUser.generateRefreshToken();

      // Create a new User instance

      const newUser = new User({
        email,
        firstName,
        lastName,
        phone,
        birthDay,
        password: mdb,
        role,
      });

      if (role !== 1 && createdByUser) {
        newUser.createdBy = createdByUser._id;
      }

      if (file) {
        // Create a new ProfileImage document and save the image data
        const newProfileImage = new ProfileImage({
          data: file.buffer,
          contentType: file.mimetype,
        });

        // Save the ProfileImage document
        await newProfileImage.save();

        // Update the profileImage field in the User document with the ProfileImage _id
        newUser.profileImage = {
          _id: newProfileImage._id,
          fieldname: file.fieldname,
          contentType: file.mimetype,
          size: file.size,
          originalname: file.originalname,
        };
      }

      // Generate access token
      const accessToken = jwt.sign(
        { email, userId: newUser._id },
        process.env.BEARER_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      const refreshToken = {
        token: jwt.sign({ email, userId: newUser._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" }),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      
   
      newUser.refreshToken = refreshToken;
      await newUser.save();

      let obj = {
        _id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        birthDay: newUser.birthDay,
        role: newUser.role,
        profileImage: newUser.profileImage,
        roleName: newUser.roleName,
        createdBy:
          role !== 1&&createdBy
            ? {
                fullName: `${createdByUser.firstName} ${createdByUser.firstName}`,
                email: createdByUser.email,
                id: createdByUser._id,
              }
            : null,
        accessToken,
        refreshToken,
      };

      return res.status(200).json({
        message: "User registered successfully.",
        data: obj,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "failed", message: error.message });
    }
  },
  authentification: async (req, res) => {
    const { password, email } = req.body;

    try {
      const user = await User.findOne({ email })
        .populate("profileImage")
        .populate("createdBy");

      if (!user) {
        return res
          .status(400)
          .json({ status: "failed", message: "Cet utilisateur n'existe pas." });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          status: "failed",
          message: "Le mot de passe est incorrect.",
        });
      }

      // Create access token
      const accessToken = jwt.sign(
        { email: email, userId: user._id },
        process.env.BEARER_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      // Create refresh token
      const refreshToken = user.generateRefreshToken();

      res.status(200).json({
        message: "Connection completed successfully",
        data: {
          _id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          birthDay: user.birthDay,
          role: user.role,
          profileImage: user.profileImage,
          roleName: user.roleName,
          createdBy:
            user.role == 1
              ? null
              : {
                  fullName: `${user.firstName} ${user.firstName}`,
                  email: user.email,
                  id: user._id,
                },
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "failed", message: error.message });
    }
  },
  activate: async (req, res) => {
    try {
      const { activation_token } = req.body;

      const user = jwt.verify(
        activation_token,
        process.env.ACTIVATION_TOKEN_SECRET
      );
      const { email } = user;

      console.log(`user`, user);
      const check = await User.findOne({ email });
      if (check)
        return res
          .status(400)
          .json({ status: "failed", message: "This email already exists." });

      const newUser = new User({
        id: user.user_id,
        fullName: user.fullName,
        email: user.email,
        password: user.password,
      });

      await newUser.save();

      // console.log(`newUser`, newUser);
      res.json({ status: "Success", message: "Account has been activated!" });
    } catch (err) {
      return res.status(501).json({ status: "failed", message: err.message });
    }
  },
  getToken: (req, res) => {
    try {
      // const rf_token = req.cookie['x-access-token'];

      const rf_token = req.cookies["x-access-token"];
      // const rf_token = req.cookies.refreshtoken;

      console.log("first", rf_token);
      if (!rf_token)
        return res
          .status(400)
          .json({ message: "no token, Please login now !" });
      // console.log(`rf_token`, rf_token);
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(400).json({ message: "Please login now!" });

        const access_token = createAccessToken({ id: user.id });

        res.json({ access_token });
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;

    // Check if the refresh token exists in the database
    const user = await User.findOne({ "refreshToken.token": refreshToken });
    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check if the refresh token has expired
    const currentTimestamp = new Date();
    if (user.refreshToken.expiresAt < currentTimestamp) {
      return res.status(401).json({ message: "Refresh token has expired" });
    }

    try {
      // Verify the refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      // Create a new access token
      const accessToken = jwt.sign(
        { email: decoded.email, userId: decoded.userId  },
        process.env.BEARER_TOKEN_SECRET,
        { expiresIn: "1h" }
      );

      return res.status(200).json({ accessToken });
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await Client.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Cet e-mail n'existe pas." });

      const access_token = createAccessToken({ id: user._id });
      const url = `${CLIENT_URL}/user/reset/${access_token}`;

      try {
        transporter.sendMail({
          to: email,
          from: "insigned11@gmail.com",
          subject: "BIGNOVA-DELIV mot de passe oublié ",
          html: `
            <div style="max-width: 700px; margin:auto; border: 10px solid #ddd; padding: 50px 20px; font-size: 110%;">
            <h2 style="text-align: center; text-transform: uppercase;color: teal;">Bienvenue à BIGNOVA✮DELIV.</h2>
            <p> BIGNOVA✮DELIV.<br>
            Cliquez simplement sur le bouton ci-dessous pour réinitialiser votre mot de passe.
            </p>

            <a href=${url} style="background: crimson; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block ; ">aller</a>

            <p>Si le bouton ne fonctionne pas pour une raison quelconque, vous pouvez également cliquer sur le lien ci-dessous:</p>

            <div>${url}</div>
            </div>
        `,
        });
        res.json({
          status: "SUCCESS",
          message: "félicitations lien envoyer  ! Veuillez verfier votre email",
        });

        console.log(`access_token_forPassword`, access_token);
      } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
      }
      // res.json({ message: "Re-send the password, please check your email." })
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { motDePasse } = req.body;
      console.log(motDePasse);

      const passwordHash = await bcrypt.hash(motDePasse, 12);
      const token = req.headers["x-access-token"];

      decodeData = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.userId = decodeData?.id;

      //console.log(`ruser.ids`, {id :user.id})
      await Client.findOneAndUpdate(req.userId, {
        motDePasse: passwordHash,
      });

      res.json({ message: "Password successfully changed!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getUser: async (req, res) => {
    const userId = req.params.id;

    try {
      // Check if the userId is provided
      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }

      // Check if the userId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid User ID." });
      }

      // Check if the user with the provided ID exists
      const user = await User.findById(userId).select("-__v -password");
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      res.json({
        status: "Success",
        message: "User fetched successfully",
        data: user,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Error retrieving user.", error: error.message });
    }
  },
  getUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password -__v");

      return res.status(201).json({
        message: "success",
        data: users,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getByRoles: async (req, res) => {
    try {
      // Create a query to filter by the specified role
      const query = { role: req.query.role };

      // Specify the fields to include or exclude in the results
      const projection = { password: 0, __v: 0 }; // Exclude the password field

      // Retrieve the items matching the query
      const items = await User.find(query, projection);
      // const users = await User.find().select("-password");

      // res.json(users);
      return res.status(201).json({
        message: "success",
        data: items,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  logout: async (req, res) => {
    try {
      res.clearCookie("x-access-token", { path: "/user/refreshtoken" });
      return res.json({ message: "Logged out." });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  update: async (req, res) => {
    try {
      const { fullName, avatar } = req.body;
      await Client.findOneAndUpdate(
        { _id: req.user.id },
        {
          fullName,
          avatar,
        }
      );

      res.json({ message: "Update Success!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  updateRole: async (req, res) => {
    try {
      const { role } = req.body;

      await User.findOneAndUpdate(
        { _id: req.params.id },
        {
          role,
        }
      );

      res.json({ message: "Update Success!" });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  delete: async (req, res) => {
    try {
      await Client.findByIdAndDelete(req.params.id);

      res.json({ message: "Deleted Success!" });
      // console.log(`message`, message)
    } catch (err) {
      return console.log(`err`, err);
      // res.status(500).json({ message: err.message });
    }
  },
  getAll: async (req, res) => {
    const users = await User.find({});
    return res.status(200).json({ users });
  },
  deleteAll: async (req, res) => {
    try {
      await User.deleteMany({});
      return res.status(200).json({ msg: "delete all users" });
    } catch (error) {
      console.log(error.message);
    }
  },
  passwordForgot: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).json({ message: "Cet e-mail n'existe pas." });

      const secret = process.env.ForgetPasswordSecret + user.password;
      const payload = {
        email: user.email,
        id: user.id,
      };
      const token = jwt.sign(payload, secret, { expiresIn: "15m" });
      const link = `http://localhost:5000/api/updatePassword/${user.id}/${token}`;

      // send link to email

      const message = {
        to: user.email,
        from: "rarahim63@gmail.com",
        subject: "Update Password ",
        html: `click in this link to update your password ${link} `,
      };
      sendgrid
        .send(message)
        .then(() => res.status(200).json({ message: link }))
        .catch((error) => res.status(400).json({ message: error.message }));
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
  updatePassord: async (req, res) => {
    try {
      const { id, token } = req.params;

      const userWithId = await User.findById(req.params.id);

      if (!userWithId) return res.status(400).json({ message: "invalid link" });

      const secret = process.env.ForgetPasswordSecret + userWithId.password;

      try {
        const payload = jwt.verify(token, secret);
      } catch (error) {
        return res.status(400).json({ message: "invalid link" });
      }

      const { password, confirmPassword } = req.body;
      if (password != confirmPassword)
        return res.status(400).json({ msg: "error in password" });

      const passwordHash = await bcrypt.hash(password, 12);

      try {
        await User.findByIdAndUpdate(userWithId.id, { password: passwordHash });
      } catch (error) {
        return res.status(400).json({ msg: error.message });
      }

      return res.status(200).json({ msg: "password update successefuly" });
    } catch (error) {
      res.status(400).json({ msg: error.msg });
    }
  },
  validation: async (req, res) => {
    try {
      const { email } = req.params;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ msg: "email does not exists" });

      await User.findByIdAndUpdate(user.id, {
        validation: req.body.validation,
      });

      res.status(200).json({ msg: "validation update successefuly" });
    } catch (error) {
      return res.status(400).json({ msg: error.msg });
    }
  },
};

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: "15m" });
};

exports.userController = userController;
 