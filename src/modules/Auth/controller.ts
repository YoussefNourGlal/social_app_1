import { Request, Response, Router } from "express";
import auth from "./service"
import { validation } from "../../middleWare/validationMiddleware";
import { confirmEmail, login, signupSchema } from "./validation";
 let router=Router();


router.get("/signup",validation(signupSchema),auth.signup);
router.get("/confirm",validation(confirmEmail),auth.confirmEmail);
router.post("/login",validation(login),auth.login);











  export default router;