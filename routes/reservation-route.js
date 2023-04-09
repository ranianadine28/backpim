import { Router } from "express";
import { sendRequest, acceptRequest, refuseRequest, getAll } from "../controllers/reservation-controller.js";

const router = Router();

router
    .route('/')
    .get(getAll);


router
    .route("/send")
    .post(sendRequest);

router
    .route("/accept")
    .post(acceptRequest);

router
    .route("/refuse")
    .post(refuseRequest);

export default router;