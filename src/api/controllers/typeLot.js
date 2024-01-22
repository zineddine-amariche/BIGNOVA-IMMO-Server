const TypeLot = require("../models/typelot.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const typelotController = {
  
  createTypeLot: async (req, res) => {
    const { typeName } = req.body;

    try {
      if (!typeName) {
        return res
          .status(500)
          .json({ status: "failed", message: "Invalid data." });
      }

      const lots = await TypeLot.findOne({ typeName });
      if (lots)
        return res
          .status(406)
          .json({ status: "failed", message: "This type already exists." });

      const newtype = new TypeLot({
        typeName: typeName,
      });

      await newtype.save().then((createdData) => {
        const plainData = createdData.toObject();
        delete plainData.__v;
        return res.status(201).json({
          message: "Type lot created successfully",
          data: plainData,
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "failed", message: error.message });
    }
  },
  getTypeLotById: async (req, res) => {
    try {
      const token = req.headers["x-access-token"];
      //const token = req.headers.refreshtoken
      // console.log(`token getUserInfo`, token)
      decodeData = jwt.verify(token, process.env.ACCESS_TOKEN);
      req.userId = decodeData?.id;

      const user = await Client.findById(req.userId).select("-motDePasse");

      res.json(user);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  getAllTypeLot: async (req, res) => {
    try {
      const projection = { __v: 0 };
      const typeLot = await TypeLot.find().select(projection);

      return res.status(201).json({
        message: "success",
        data: typeLot,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  updateTypeLot: async (req, res) => {
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
  deleteTypeLot: async (req, res) => {
    try {
      await Client.findByIdAndDelete(req.params.id);

      res.json({ message: "Deleted Success!" });
      // console.log(`message`, message)
    } catch (err) {
      return console.log(`err`, err);
      // res.status(500).json({ message: err.message });
    }
  },
  deleteAllTypeLots: async (req, res) => {
    try {
      await User.deleteMany({});
      return res.status(200).json({ msg: "delete all users" });
    } catch (error) {
      console.log(error.message);
    }
  },
};

exports.TypeLotController = typelotController;
