const Project = require("../models/projet.model");
const User= require("../models/user.model.js");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
require("dotenv").config();

const ProjetController = {

  createProject: async (req, res) => {
    const { name, adresse, etat, datefin, datestart, description, createdBy } =
      req.body;

    try {
      if (
        !name ||
        !adresse ||
        !etat ||
        !datefin ||
        !datestart ||
        !description
      ) {
        return res
          .status(500)
          .json({ status: "failed", message: "Invalid data." });
      }
      let project = await Project.findOne({ name });

      if (project) {
        return res
          .status(406)
          .json({ status: "failed", message: "This project already exists." });
      }

      const isCreatedBy = await User.findById(createdBy);
      console.log('isCreatedBy', isCreatedBy)
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

      const createdLot = await Project.create(req.body);

      const projection = { __v: 0 };
      const populatedProject = await Project.findById(createdLot._id)
        .select(projection)
        .populate({
          path: "createdBy",
          select: "-__v", // Exclude the __v field from the createdBy object
        });
      return (
        res.status(201).json({
          message: "Project created successfully",
          data: populatedProject,
        }),
        await populatedProject.save()
      );
    } catch (error) {
      console.log(error);
      return res.status(500).json({ status: "failed", message: error.message });
    }
  },
  checkproject: async (req, res) => {
    const query = { name: req.query.name };
    const projection = { __v: 0 };
    try {
      const project = await Project.find(query, projection);
      if (project.length) {
        // Project exists in the database
        res.json(true);
      } else {
        // Project does not exist in the database
        res.json(false);
      }
    } catch (error) {
      // Handle any errors that occurred during the query
      res.status(500).json({ error: "An error occurred" });
    }
  },
  getProjectById: async (req, res) => {
    const projectId = req.params.id;

    try {
      // Check if the projectId is provided
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required." });
      }

      // Check if the projectId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: "Invalid Project ID." });
      }

      // Check if the project with the provided ID exists
      const project = await Project.findById(projectId)
        .select("-__v")
        .populate("createdBy", "-__v");

      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }

      res.json({
        status: "Success",
        message: "Project fetched successfully",
        data: project,
      });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ message: "Error retrieving project.", error: error.message });
    }
  },
  getAllProjects: async (req, res) => {
    try {
      const projection = { __v: 0 }; // Exclude the __v field

      const projects = await Project.find()
        .select(projection)
        .populate("createdBy", "-__v");

      return res.status(201).json({
        message: "success",
        data: projects,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },
  updateStatus: async (req, res) => {
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
  deleteAllProjects: async (req, res) => {
    try {
      await Project.deleteMany({});
      return res
        .status(200)
        .json({ message: "All projects deleted successfully" });
    } catch (error) {
      console.log(error.message);
    }
  },
  deleteProject: async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }

      const deletedProject = await Project.findByIdAndDelete(
        req.params.id
      ).select("-__v");

      if (!deletedProject) {
        // If the deletedProject is null, it means the ID does not exist in the database
        return res.status(404).json({ message: "Project not found" });
      }

      return res.status(200).json({
        message: "Project deleted successfully",
        data: deletedProject,
      });
    } catch (err) {
      console.log(`err`, err);
      return res.status(500).json({ message: err.message });
    }
  },
  updateProject: async (req, res) => {
    const projectId = req.params.id;
    const updatedProjectData = req.body;
  
    try {
      // Check if the projectId is provided
      if (!projectId) {
        return res.status(400).json({ message: "Project ID is required." });
      }
  
      // Check if the projectId is a valid ObjectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json({ message: "Invalid Project ID." });
      }
  
      // Check if the project with the provided ID exists
      let project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found." });
      }
  
      // Check if the new createdBy exists in the database
      const createdByUser = await User.findById(updatedProjectData.createdBy);
      if (!createdByUser) {
        return res.status(404).json({ message: "The createdBy user doesn't exist." });
        
      }
       // Check if the role of the new createdBy is "admin"
     if (createdByUser.role !== 1) {
      return res.status(401).json({ message: "Access denied. Only admin users can update projects." });
     }

     // Check if the project name is unique
      const existingProject = await Project.findOne({
        name: updatedProjectData.name,
        _id: { $ne: projectId }, // Exclude the current project from the query
      });
      if (existingProject) {
        return res.status(409).json({ message: "A project with the same name already exists." });
      }
  
      // Update the project data
      project = await Project.findByIdAndUpdate(projectId, updatedProjectData, { new: true });
  
      res.json({ status: "Success", message: "Project updated successfully", data: project });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Error updating project.", error: error.message });
    }
  },
  
};

exports.ProjetController = ProjetController;
  // updateProject: async (req, res) => {
  //   const projectId = req.params.id;
  //   const updatedProjectData = req.body;
  
  //   try {
  //     // Check if the projectId is provided
  //     if (!projectId) {
  //       return res.status(400).json({ message: "Project ID is required." });
  //     }
  
  //     // Check if the projectId is a valid ObjectId
  //     if (!mongoose.Types.ObjectId.isValid(projectId)) {
  //       return res.status(400).json({ message: "Invalid Project ID." });
  //     }
  
  //     // Check if the project with the provided ID exists
  //     let project = await Project.findById(projectId);
  //     if (!project) {
  //       return res.status(404).json({ message: "Project not found." });
  //     }
  
  //     // Update the project data
  //     project = await Project.findByIdAndUpdate(projectId, updatedProjectData, { new: true });
  
  //     res.json({ status: "Success", message: "Project updated successfully", data: project });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(500).json({ message: "Error updating project.", error: error.message });
  //   }
  // },

    // updateProject: async (req, res) => {
  //   try {
  //     const { fullName, avatar } = req.body;
  //     await Client.findOneAndUpdate(
  //       { _id: req.user.id },
  //       {
  //         fullName,
  //         avatar,
  //       }
  //     );

  //     res.json({ message: "Update Success!" });
  //   } catch (err) {
  //     return res.status(500).json({ message: err.message });
  //   }
  // },