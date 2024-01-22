const Lot = require("../models/lot.model");
const Project = require("../models/projet.model");
const Typelot = require("../models/typelot.model");
const User = require("../models/user.model");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

const lotController = {
  
  createLot: async (req, res) => {
    const {
      numerodelot,
      surfacetotal,
      surfacesansbalcon,
      prix,
      bloc,
      etage,
      typelot,
      projet,
      createdBy,
    } = req.body;

    try {
      if (
        !numerodelot ||
        !surfacetotal ||
        !surfacesansbalcon ||
        !prix ||
        !bloc ||
        !etage ||
        !typelot ||
        !projet
      ) {
        return res
          .status(400)
          .json({ status: "failed", message: "Invalid data." });
      }

      const existingLot = await Lot.findOne({ numerodelot });
      if (existingLot) {
        return res.status(406).json({
          status: "failed",
          message: "This batch already exists.",
        });
      }

      const isProject = await Project.findById(projet);
      if (!isProject) {
        return res.status(406).json({
          status: "failed",
          message: "This Project doesn't exist.",
        });
      }

      const isTypelot = await Typelot.findById(typelot);
      if (!isTypelot) {
        return res.status(406).json({
          status: "failed",
          message: "This type batch doesn't exist.",
        });
      }

      const isCreatedBy = await User.findById(createdBy);
      if (!isCreatedBy) {
        return res.status(406).json({
          status: "failed",
          message: "The createdBy user doesn't exist.",
        });
      }

      if (isCreatedBy.role !== 1) {
        return res.status(401).json({
          status: "failed",
          message: "Access denied. Only admin users can create lots.",
        });
      }
      const createdLot = await Lot.create(req.body);
      const projection = { __v: 0 };

      const populatedLot = await Lot.findById(createdLot._id)
        .select(projection)
        .populate("projet")
        .populate("typelot")
        .populate({
          path: "createdBy",
          select: "-__v", // Exclude the __v field from the createdBy object
        });

      const sanitizedTypelot = populatedLot.typelot.map((type) => {
        const { __v, ...rest } = type.toObject();
        return rest;
      });

      const sanitizedProjet = populatedLot.projet.map((proj) => {
        const { __v, ...rest } = proj.toObject();
        return rest;
      });

      const sanitizedData = populatedLot.toObject();
      sanitizedData.typelot = sanitizedTypelot;
      sanitizedData.projet = sanitizedProjet;

      return res.status(201).json({
        status: "success",
        message: "Lot created successfully",
        data: sanitizedData,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        status: "failed",
        message: "Internal server error",
      });
    }
  },
  getLotById: async (req, res) => {
    const lotId = req.params.id;
    try {
      // Check if the lotId is provided
      if (!lotId) {
        return res.status(400).json({ message: "Lot ID is required." });
      }

      // Check if the lotId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(lotId)) {
        return res.status(400).json({ message: "Invalid Lot ID." });
      }

      // Check if the lot with the provided ID exists
      const lot = await Lot.findById(lotId)
        .select("-__v")
        .populate("projet", "-__v")
        .populate("typelot", "-__v")
        .populate("createdBy", "-__v -password -createdBy");

      if (!lot) {
        return res.status(404).json({ message: "Lot not found." });
      }

      res.json({
        status: "Success",
        message: "Lot fetched successfully",
        data: lot,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Error retrieving lot.", error: error.message });
    }
  },
  getAllLot: async (req, res) => {
    try {
      const projection = { __v: 0 };
      Lot.find()
        .select(projection)
        .populate("projet") // Populate the 'projet' field with project data
        .populate("typelot")
        .populate("createdBy", "-__v")
        .then((projets) => {
          const sanitizedProjets = projets.map((projet) => {
            const sanitizedTypelot = projet.typelot.map((type) => {
              const { __v, ...rest } = type.toObject();
              return rest;
            });

            const sanitizedProjet = projet.projet.map((proj) => {
              const { __v, ...rest } = proj.toObject();
              return rest;
            });

            const sanitizedData = projet.toObject();
            sanitizedData.typelot = sanitizedTypelot;
            sanitizedData.projet = sanitizedProjet;

            return sanitizedData;
          });

          return res.status(201).json({
            message: "Lots fetched successfully",
            data: sanitizedProjets,
          });
        });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  checkLot: async (req, res) => {
    const query = { numerodelot: req.query.numerodelot };
    const projection = { __v: 0 };
    try {
      const lot = await Lot.find(query, projection);
      if (lot.length) {
        // lot exists in the database
        res.json(true);
      } else {
        // lots does not exist in the database
        res.json(false);
      }
    } catch (error) {
      // Handle any errors that occurred during the query
      res.status(500).json({ error: "An error occurred" });
    }
  },
  updateLot: async (req, res) => {
    try {
      const { fullName, avatar } = req.body;
      await Lot.findOneAndUpdate(
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
  updatePrixLot: async (req, res) => {
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
  deleteLot: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const deletedLot = await Lot.findByIdAndDelete(req.params.id).select(
        "-__v"
      );

      if (!deletedLot) {
        // If the deletedLot is null, it means the ID does not exist in the database
        return res.status(404).json({ message: "Lot not found" });
      }

      return res
        .status(200)
        .json({ message: "Lot deleted successfully", data: deletedLot });
    } catch (err) {
      console.log(`err`, err);
      res.status(500).json({ message: err.message });
    }
  },
  deleteAllLots: async (req, res) => {
    try {
      await Lot.deleteMany({});
      return res.status(200).json({ message: "All Lots deleted successfully" });
    } catch (error) {
      console.log(error.message);
    }
  },
};

exports.lotController = lotController;

 
