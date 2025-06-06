import { Router } from "express";
import { UserAuth } from "../middlewares/UserAuth";
import { logout, me, session } from "../controllers/userController";

export const UserRouter = Router();

UserRouter.get("/session" , UserAuth , session) // User Session!, Protected Endpoint!
UserRouter.get("/me" , UserAuth , me); // PROTECTED ENDPOINT!!
UserRouter.post("/logout" , logout);