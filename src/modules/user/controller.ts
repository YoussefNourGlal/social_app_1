import { Router } from "express";
import { filevalidation } from "../../utils/multer/cloud.multer";
import user from "./service";
import { StorageEnum } from "../../utils/multer/cloud.multer";
import {
  authintication,
  authorization,
  typeTokenEnum,
} from "../../middleWare/authMiddleware";
import { roletype } from "../../db/models/user";
let router: Router = Router();
import { cloudFileUpload } from "../../utils/multer/cloud.multer";
import { validation } from "../../middleWare/validationMiddleware";
import {
  acceptRequestSchema,
  forgetPass,
  freezSchema,
  friendRequestSchema,
  logoutSchema,
  resetpass,
} from "./validation";
import chatRouter from "../chat/controller";
router.use("/:userId/chat", chatRouter);

router.get(
  "/profile",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  user.getProfile,
);

router.post(
  "/logout",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(logoutSchema),
  user.logout,
);

//Api of files multer
router.patch(
  "/profile-image",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  cloudFileUpload({
    validation: filevalidation.images,
    storageApproch: StorageEnum.MEMORY,
    maxSize: 6,
  }).single("attachments"),
  user.profileImage,
);

router.patch(
  "/cover-image",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  cloudFileUpload({
    validation: filevalidation.images,
    storageApproch: StorageEnum.MEMORY,
    maxSize: 6,
  }).array("attachments", 5),
  user.coverImage,
);

router.patch(
  "/profile-image/url",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  user.getUrlforFront,
);

// Get Asset With Presigned URL
router.get(
  "/uploads/presigned/*path",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  user.getprofilePicPresigned,
);

router.get(
  "/uploads/*path",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  user.getprofilePic,
);

router.delete(
  "/delete/profilePicture",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  user.deleteprofileImage,
);

router.delete(
  "/delete/profilePictures",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  user.deleteprofileImages,
);
//////////

router.post(
  "/:userId/friend-request",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(friendRequestSchema),
  user.sendFriendRequest,
);

router.patch(
  "/:requestId/accept-request",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(acceptRequestSchema),
  user.acceptRequest,
);

router.post(
  "/refresh",
  authintication(typeTokenEnum.refresh),
  authorization([roletype.admin, roletype.user]),
  user.refresh,
);

router.post("/forgetPass", validation(forgetPass), user.forgetPass);
router.patch("/resetpass", validation(resetpass), user.resetpass);
router.patch(
  "{/:userid}/freez-account",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(freezSchema),
  user.freez,
);
router.patch(
  "/:userid/restore",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(freezSchema),
  user.restore,
);

export default router;
