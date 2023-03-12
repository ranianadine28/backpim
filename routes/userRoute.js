import express from "express";
import { body } from 'express-validator';
import multerConfigProfile from '../middelwares/multer-config-Profile.js';
import multerConfig from '../middelwares/multer-config.js';


import {getAllUsers, login, signUp,forgotpassword ,editPassword,getUsersBySpeciality,changeUserPhoto, enable, verif} from "../controllers/userController.js";
const router = express.Router();
//import upload from "../middlewares/uploads"


router.route("/signup").post(multerConfigProfile, signUp);
router.route("/login").post(login);
router.route("/enable-2fa").post(enable);
router.route("/verif").post(verif);
router.route("/getAllUsers").get(getAllUsers);
router.route("/reset_password").post(forgotpassword)
router.route("/edit_password").put(editPassword)
router.route("/filterdoctor/:speciality").get(getUsersBySpeciality)
router.route("/updatePhoto/:email").post(multerConfig, changeUserPhoto);




export default router;