import { Request, Response } from "express";
import { HUserDocument, usermodel } from "../../db/models/user";
import { userRepository } from "../../db/repository/user.repository";
import { getToken, LogoutEnum } from "../../utils/security/token";
import { createRevokeToken } from "../../utils/security/token";
import { LogoutDTO } from "./dto";
import { UpdateQuery } from "mongoose";
import { IUser } from "../../db/models/user";
import { Types } from "mongoose";
import { MyJwtPayload } from "../../utils/security/token";
import {
  createPresignedURL,
  deleteFile,
  deleteFiles,
  getFile,
  uploadFile,
  uploadFiles,
  uploadLargeFile,
} from "../../utils/multer/cloud.multer";
import { badRequest } from "../../utils/response/response.error";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { createGetPresignedURL } from "../../utils/multer/cloud.multer";
import { friendRequestRepository } from "../../db/repository/friendRequest.repository ";
import { friendRequestmodel } from "../../db/models/friendRequest";
import { chatRepository } from "../../db/repository/chat.repository ";
import { ChatModel } from "../../db/models/chat";
import { customAlphabet } from "nanoid";
import { compare, hashing } from "../../utils/security/hash";
import { Emailevent } from "../../utils/events/email";


const createS3WriteStreamPipe = promisify(pipeline);

class UserService {
  private userModel = new userRepository(usermodel);
  private _friendModel = new friendRequestRepository(friendRequestmodel);
  private _chatModel = new chatRepository(ChatModel);

  constructor() {}

  getProfile = async (req: Request, res: Response): Promise<Response> => {
    await req.user?.populate("friends");
    let groups = await this._chatModel.find({
      filter: {
        particiants: { $in: [req.user?._id as Types.ObjectId] },
        group: { $exists: true },
      },
    });

    return res.status(200).json({
      message: "Done",
      data: {
        user: req.user,
        decoded: req.decoded,
        groups,
      },
    });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const { flag }: LogoutDTO = req.body;

    let statusCode = 200;
    let update: UpdateQuery<IUser> = {};

    switch (flag) {
      case LogoutEnum.ONLY:
        await createRevokeToken(req.decoded as MyJwtPayload);
        statusCode = 201;
        break;

      case LogoutEnum.ALL:
        update.changeCredientialsTime = new Date();
        break;

      default:
        break;
    }

    if (flag === LogoutEnum.ALL) {
      await this.userModel.updateOne({
        filter: { _id: new Types.ObjectId(req.decoded!.id) },
        update,
      });
    }

    return res.status(statusCode).json({
      message: "Done",
    });
  };

  profileImage = async (req: Request, res: Response): Promise<Response> => {
    // let key= await uploadFile({path:`users/${req.decoded?.id}`,file:req.file!});
    let key = await uploadLargeFile({
      path: `users/${req.decoded?.id}`,
      file: req.file!,
    });

    await this.userModel.updateOne({
      filter: { _id: new Types.ObjectId(req.decoded!.id) },
      update: { profileImage: key },
    });

    return res.status(200).json({ message: "Done", key });
  };

  coverImage = async (req: Request, res: Response): Promise<Response> => {
    let keys = await uploadFiles({
      files: req.files as Express.Multer.File[],
      path: `users/${req.decoded?.id}`,
    });

    await this.userModel.updateOne({
      filter: { _id: new Types.ObjectId(req.decoded!.id) },
      update: { coverImage: keys },
    });

    return res.status(200).json({ message: "Done", keys });
  };

  getUrlforFront = async (req: Request, res: Response): Promise<Response> => {
    let {
      ContentType,
      originalname,
    }: { ContentType: string; originalname: string } = req.body;
    let { key, url } = await createPresignedURL({
      ContentType,
      originalname,
      path: `users/${req.decoded?.id}`,
    });

    await this.userModel.updateOne({
      filter: { _id: new Types.ObjectId(req.decoded?.id) },
      update: { profileImage: key },
    });

    return res.status(200).json({ message: "Done", key, url });
  };

  getprofilePic = async (req: Request, res: Response) => {
    try {
      // query
      const { downloadName } = req.query as { downloadName?: string };

      // params
      const { path } = req.params as unknown as { path: string[] };
      const Key = path.join("/");

      // get file from s3
      const s3Response = await getFile({ Key });

      if (!s3Response.Body) {
        throw new badRequest("Fail to Fetch Asset");
      }

      // content type
      res.setHeader(
        "Content-Type",
        s3Response.ContentType || "application/octet-stream",
      );

      // download or inline
      if (downloadName) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${downloadName}"`,
        );
      } else {
        res.setHeader("Content-Disposition", "inline");
      }

      // stream from s3 to response
      return await createS3WriteStreamPipe(
        s3Response.Body as NodeJS.ReadableStream,
        res,
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  };

  // Get Asset With Presigned URL
  getprofilePicPresigned = async (req: Request, res: Response) => {
    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join("/");
    const url = await createGetPresignedURL({ Key });
    return res.status(200).json({ message: "Done", url });
  };

  deleteprofileImage = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    let { Key } = req.query as { Key: string };
    let result = await deleteFile({ Key });
    return res.status(200).json({ message: "Done", result });
  };

  deleteprofileImages = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    let { Keys } = req.body as { Keys: string[] };
    let result = await deleteFiles({ urls: Keys });
    return res.status(200).json({ message: "Done", result });
  };

  sendFriendRequest = async (req: Request, res: Response) => {
    const { userId } = req.params as unknown as { userId: Types.ObjectId };
    const checkFriendRequestExists = await this._friendModel.findOne({
      filter: {
        createdBy: { $in: [req.user!._id, userId] },
        sendTo: { $in: [req.user!._id, userId] },
      },
    });
    if (checkFriendRequestExists)
      throw new badRequest("Friend Request Already Exists");

    const user = await this.userModel.findOne({
      filter: {
        _id: userId,
      },
    });

    if (!user) {
      throw new badRequest("User Not Found");
    }

    const [friend] =
      (await this._friendModel.create({
        data: [
          {
            createdBy: req.user!._id as Types.ObjectId,
            sendTo: userId,
          },
        ],
      })) || [];

    if (!friend) throw new badRequest("Fail To send Friend Request");
    return res.status(201).json({ message: "Done", data: friend });
  };

  acceptRequest = async (req: Request, res: Response) => {
    const { requestId } = req.params as unknown as {
      requestId: Types.ObjectId;
    };

    const checkFriendRequestExists = await this._friendModel.findOneAndUpdate({
      filter: {
        _id: requestId,
        sendTo: req.user!._id,
        acceptedAt: { $exists: false },
      },
      update: {
        acceptedAt: new Date(),
      },
    });

    if (!checkFriendRequestExists) {
      throw new badRequest("Fail To Accept Friend Request");
    }

    await Promise.all([
      await this.userModel.updateOne({
        filter: {
          _id: checkFriendRequestExists.createdBy,
        },
        update: {
          $addToSet: {
            friends: checkFriendRequestExists.sendTo,
          },
        },
      }),

      await this.userModel.updateOne({
        filter: {
          _id: checkFriendRequestExists.sendTo,
        },
        update: {
          $addToSet: {
            friends: checkFriendRequestExists.createdBy,
          },
        },
      }),
    ]);

    return res.status(201).json({ message: "Done" });
  };

  refresh = async (req: Request, res: Response) => {
    let user = req.user;
    let tokens = await getToken(user as HUserDocument);

    return res
      .status(200)
      .json({
        message: "the token updated successfuly",
        tokens: tokens.tokenAccess,
      });
  };

  forgetPass = async (req: Request, res: Response) => {
    let { email }: { email: string } = req.body;
    let user = await usermodel.findOne({
      email,
      confirmedAt: { $exists: true },
    });
    if (!user) {
      throw new badRequest("the email not found");
    }
    let otp = customAlphabet("0123456789akjtr", 6)();
    let hashedOtp = await hashing(otp);

    let confirm = await usermodel.updateOne(
      { email },
      { $set: { resetPasswordOTP: hashedOtp } },
    );
    Emailevent.emit("forgetPassword", {
      to: user.email,
      otp,
      userName: user.username,
    });
    res.status(200).json({ message: "check your email" });
  };

  resetpass = async (req: Request, res: Response) => {
    let { email, otp, password, confirmpassword } = req.body;
    let user = await usermodel.findOne({
      email,
      confirmedAt: { $exists: true },
    });
    if (!user) {
      throw new badRequest("the email not found");
    }
    if (!user.resetPasswordOTP) {
      throw new badRequest("OTP expired or not found");
    }

    let state = await compare(otp, user.resetPasswordOTP);
    if (!state) {
      throw new badRequest("the otp not correct");
    }
    await usermodel.updateOne(
      { email },
      {
        $set: { password: await hashing(password) },
        $inc: { __v: 1 },
        $unset: { resetPasswordOTP: true },
      },
    );

    res.status(200).json({ message: "the password is updated" });
  };

  freez = async (req: Request, res: Response) => {
    let { userid } = req.params;
    if (userid && req.user?.role != "admin") {
      throw new badRequest("you are not authorized");
    }

    let data = await usermodel.findOneAndUpdate(
      { _id: userid || req.user?._id!, freezAt: { $exists: false } },
      { $set: { freezAt: new Date(), freezBy: req.user?._id } },
    );
    if (!data) {
      throw new badRequest("account not fount sorry");
    }

    res.status(200).json({ message: "the account is freezed successfuly" });
  };

  restore = async (req: Request, res: Response) => {
    let { userid } = req.params;
    if (!userid) throw new badRequest("error");

    let user = await usermodel.findById(userid);
    if (!user || !user.freezAt) {
      throw new badRequest("account not found or not freezed");
    }

    const freezer = user.freezBy?.toString();
    const currentUser = req.user?._id?.toString();
    const currentRole = req.user?.role;

    if (freezer !== currentUser && currentRole !== "admin") {
      throw new badRequest("you are not authorized");
    }

    let data = await usermodel.findOneAndUpdate(
      { _id: new Types.ObjectId(userid), freezAt: { $exists: true } },
      {
        $set: { restoreAt: new Date(), restoreBy: req.user?._id },
        $unset: { freezAt: true, freezBy: true },
      },
      { new: true },
    );
    if (!data) throw new badRequest("failed to restore the account");

    res.status(200).json({ message: "the account is restored successfuly" });
  };
}

export default new UserService();
