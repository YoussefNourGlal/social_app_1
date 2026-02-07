import { Request, Response } from "express";
import { usermodel } from "../../db/models/user";
import { userRepository } from "../../db/repository/user.repository";
import { Types } from "mongoose";
import { badRequest } from "../../utils/response/response.error";
import {
  AllowCommentsEnum,
  AvailablityEnum,
  postmodel,
} from "../../db/models/post";
import { postRepository } from "../../db/repository/post.repository ";
import { v4 as uuid } from "uuid";
import { deleteFiles, uploadFiles } from "../../utils/multer/cloud.multer";
import { commentRepository } from "../../db/repository/comment.repository";
import { commentmodel } from "../../db/models/comment";

class commentService {
  private userModel = new userRepository(usermodel);
  private postModel = new postRepository(postmodel);
  private commentModel = new commentRepository(commentmodel);

  constructor() {}

  createComment = async (req: Request, res: Response) => {
    const { postId } = req.params;

    let post = await this.postModel.findOne({
      filter: {
        _id: new Types.ObjectId(postId),
        allowComments: AllowCommentsEnum.ALLOW,
        avilablity: AvailablityEnum.PUBLIC,
      },
    });

    if (!post) {
      throw new badRequest("sorry fail to mach result ");
    }

    if (
      req.body.tags?.length &&
      (
        await this.userModel.find({
          filter: { _id: req.body.tags },
        })
      ).length !== req.body.tags.length
    ) {
      throw new badRequest("Some Mentioned User Does Not Exists");
    }

    let attachments: string[] = [];

    if (req.files?.length) {
      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${post.createdBy}/post/${post.assetPostFolderId}`,
      });
    }

    const [comment] =
      (await this.commentModel.create({
        data: [
          {
            ...req.body,
            attachments,
            postId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];

    if (!comment) {
      if (attachments.length) {
        await deleteFiles({ urls: attachments });
      }
      throw new badRequest("Fail To Create comment");
    }

    return res
      .status(201)
      .json({ message: "Comment Created Successfully", comment });
  };
}

export default new commentService();
