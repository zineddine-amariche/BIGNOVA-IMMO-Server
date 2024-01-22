const express = require('express') ; 

 
const projetController = require("../controllers/projet");

const router = express.Router();

const {auth} = require('../middlewares/auth.middleware')
const admin = require('../middlewares/admin.middleware');

router.post("/",  [auth, admin],projetController.ProjetController.createProject);
router.get("/check",  [auth, admin],projetController.ProjetController.checkproject);
router.get("/",projetController.ProjetController.getAllProjects);
router.delete("/", [auth, admin], projetController.ProjetController.deleteAllProjects);
router.get("/:id",  [auth, admin],projetController.ProjetController.getProjectById);
router.patch("/update/:id",  [auth, admin],projetController.ProjetController.updateProject);
router.patch("/:id",  [auth, admin],projetController.ProjetController.updateStatus);
router.delete("/delete/:id",  [auth, admin],projetController.ProjetController.deleteProject);




module.exports = router;


