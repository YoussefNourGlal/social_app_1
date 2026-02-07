import { Router } from "express";
import { filevalidation, StorageEnum } from "../../utils/multer/cloud.multer";
import {
  authintication,
  authorization,
  typeTokenEnum,
} from "../../middleWare/authMiddleware";
import { roletype } from "../../db/models/user";
import { cloudFileUpload } from "../../utils/multer/cloud.multer";
import { validation } from "../../middleWare/validationMiddleware";
import comment from "./commentService";
import { createCommentSchema } from "./commentValidation";

let router: Router = Router({ mergeParams: true });

router.post(
  "/createComment",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  cloudFileUpload({
    validation: filevalidation.images,
    storageApproch: StorageEnum.MEMORY,
    maxSize: 6,
  }).array("attachments", 5),
  validation(createCommentSchema),
  comment.createComment,
);

export default router;
