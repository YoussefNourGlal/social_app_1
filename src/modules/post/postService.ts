import { Request, Response } from "express";
import { HUserDocument, usermodel } from "../../db/models/user";
import { userRepository } from "../../db/repository/user.repository";
import { UpdateQuery } from "mongoose";
import { Types } from "mongoose";
import { badRequest } from "../../utils/response/response.error";
import { AvailablityEnum, LikeEnum, postmodel } from "../../db/models/post";
import { postRepository } from "../../db/repository/post.repository ";
import { v4 as uuid } from "uuid";
import { deleteFiles, uploadFiles } from "../../utils/multer/cloud.multer";
import { ISgetAllPostDto } from "./postDto";

class postService {
  private userModel = new userRepository(usermodel);
  private postModel = new postRepository(postmodel);

  constructor() {}

  createPost = async (req: Request, res: Response) => {
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
    let assetPostFolderId: string | undefined = undefined;

    if (req.files?.length) {
      assetPostFolderId = uuid();
      attachments = await uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user?._id}/post/${assetPostFolderId}`,
      });
    }
    const [post] =
      (await this.postModel.create({
        data: [
          {
            ...req.body,
            attachments,
            assetPostFolderId,
            createdBy: req.user?._id,
          },
        ],
      })) || [];

    if (!post) {
      if (attachments.length) {
        await deleteFiles({ urls: attachments });
      }
      throw new badRequest("Fail To Create Post");
    }

    return res.status(201).json({
      message: "Post Created Successfully",
      post,
    });
  };

  likePost = async (req: Request, res: Response) => {
    const { postId } = req.params as unknown as { postId: string };
    const { action } = req.query as unknown as { action: string };

    let update: UpdateQuery<HUserDocument> = {
      $addToSet: { likes: req.user?._id },
    };
    if (action === LikeEnum.UNLIKE) {
      update = { $pull: { likes: req.user?._id } };
    }
    const post = await this.postModel.findOneAndUpdate({
      filter: {
        _id: new Types.ObjectId(postId),
        avilablity: AvailablityEnum.PUBLIC,
      },
      update,
    });

    if (!post) throw new badRequest("Post Does Not Existss");

    return res.status(200).json({ message: "Done", post });
  };

  getAllPosts = async (req: Request, res: Response) => {
    let { page, size }: ISgetAllPostDto = req.body;

    let posts = await this.postModel.paginate({
      filter: { avilablity: AvailablityEnum.PUBLIC },
      page,
      size,
    });

    return res
      .status(200)
      .json({ message: "Posts Fetched Successfully", posts });
  };
}

export default new postService();
