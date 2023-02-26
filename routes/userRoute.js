import express from "express";
import { body } from 'express-validator';
import multerConfigProfile from '../middelwares/multer-config-Profile.js';

import {getAllUsers, login, signUp } from "../controllers/userController.js";
const router = express.Router();
//import upload from "../middlewares/uploads"


router.route("/signup").post(multerConfigProfile, signUp);
router.route("/login").post(login);
router.route("/getAllUsers").get(getAllUsers);



export default router;