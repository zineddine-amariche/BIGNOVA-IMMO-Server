const express = require('express') ; 

 
const lotController = require("../controllers/lot");

const router = express.Router();

const {auth} = require('../middlewares/auth.middleware')
const admin = require('../middlewares/admin.middleware');

router.get("/",[auth, admin], lotController.lotController.getAllLot)
router.get("/:id",[auth, admin], lotController.lotController.getLotById)
router.get("/check",[auth, admin],  lotController.lotController.checkLot);
router.delete("/delete/:id", [auth, admin],  lotController.lotController.deleteLot);
router.delete("/", [auth, admin], lotController.lotController.deleteAllLots);
router.post('/',[auth, admin],lotController.lotController.createLot)




module.exports = router;


