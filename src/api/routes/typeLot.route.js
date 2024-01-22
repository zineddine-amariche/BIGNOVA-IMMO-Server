const express = require('express') ; 

 
const TypeLotController = require("../controllers/typeLot");

const router = express.Router();
 
const {auth} = require('../middlewares/auth.middleware')
const admin = require('../middlewares/admin.middleware');
 

router.post("/",  [auth, admin],TypeLotController.TypeLotController.createTypeLot);
router.delete("/", [auth, admin], TypeLotController.TypeLotController.deleteAllTypeLots);
router.delete("/:id",  [auth, admin],TypeLotController.TypeLotController.deleteTypeLot);
router.get("/:id",  [auth, admin],TypeLotController.TypeLotController.getTypeLotById);
router.get("/",  [auth, admin],TypeLotController.TypeLotController.getAllTypeLot);
router.patch("/update",  [auth, admin],TypeLotController.TypeLotController.updateTypeLot);





module.exports = router;


