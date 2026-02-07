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
import {
  createPostSchema,
  getAllPostSchema,
  likePostSchema,
} from "./postValidation";
import post from "./postService";
import commentRouter from "../comment/commentController";

let router: Router = Router();

router.use("/:postId/comment", commentRouter);

router.post(
  "/createpost",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  cloudFileUpload({
    validation: filevalidation.images,
    storageApproch: StorageEnum.MEMORY,
    maxSize: 6,
  }).array("attachments", 5),
  validation(createPostSchema),
  post.createPost,
);

router.patch(
  "/:postId/like",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(likePostSchema),
  post.likePost,
);

router.get(
  "/getAllPost",
  authintication(typeTokenEnum.access),
  authorization([roletype.admin, roletype.user]),
  validation(getAllPostSchema),
  post.getAllPosts,
);

export default router;
