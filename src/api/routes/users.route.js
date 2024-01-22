const express = require('express') ; 

const upload = require("../middlewares/upload");
 
const userController = require("../controllers/users");

const router = express.Router();

const {auth} = require('../middlewares/auth.middleware')
const admin = require('../middlewares/admin.middleware');



router.post("/register",upload.single('profileImage'), userController.userController.inscription);
router.post("/login", userController.userController.authentification); 
router.get("/logout", [auth], userController.userController.logout);

router.post("/activate", userController.userController.activate);
router.post("/refresh-token", userController.userController.refreshToken);

router.get("/" , userController.userController.getUsers);
router.get("/roles" , userController.userController.getByRoles);


router.get("/getAll",userController.userController.getAll)
router.get("/:id", userController.userController.getUser);



router.patch("/update", [auth, admin],  userController.userController.update);
router.patch("/role/:id", [auth, admin], userController.userController.updateRole);


router.delete("/delete/:id", [auth, admin], userController.userController.delete);
router.delete('/delete', userController.userController.deleteAll)


router.post("/resete",  userController.userController.resetPassword);
router.post('/forgotPassword',userController.userController.passwordForgot)   
router.post('/updatePassword/:id/:token',userController.userController.updatePassord)

//for validation
router.patch('/validation/:email',userController.userController.validation)






module.exports = router;


