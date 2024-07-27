import express from "express";
import { getUserInfo, login, register } from "../controllers/user.controller";
import { validateLogin, validateRegister } from "../middleware/auth.validation";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequestBody } from "../middleware/validaterequest.midlleware";

const router = express.Router();

router.post("/register", validateRegister, validateRequestBody, register);
router.post("/login", validateLogin, validateRequestBody, login);
router.get("/fetch-user", authenticate, getUserInfo);

export default router;
