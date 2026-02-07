import { Router } from "express";
import chat from "./service";
import {
  authintication,
  authorization,
  typeTokenEnum,
} from "../../middleWare/authMiddleware";
import { roletype } from "../../db/models/user";
import { validation } from "../../middleWare/validationMiddleware";
import {
  createGroupChatSchema,
  getchatSchema,
  getGroupChatSchema,
} from "./validation";

let router: Router = Router({
  mergeParams: true,
});

router.get(
  "/",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(getchatSchema),
  chat.getChat,
);

router.post(
  "/group",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(createGroupChatSchema),
  chat.createGroupChat,
);

router.get(
  "/group/:groupId",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(getGroupChatSchema),
  chat.getGroupChat,
);

export default router;
