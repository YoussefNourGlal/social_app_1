import { Request, Response } from "express";
import { badRequest } from "../../utils/response/response.error";
import { confilect } from "../../utils/response/response.error";
import { ISconemail, ISsignupDto, ISlogin } from "./dto";
import { usermodel } from "../../db/models/user";
import { userRepository } from "../../db/repository/user.repository";
import { customAlphabet, nanoid } from "nanoid";
import { compare } from "bcrypt";
import { generateToken, getToken } from "../../utils/security/token";
class authenticationService {
  private _usermodel = new userRepository(usermodel);

  constructor() {}

  signup = async (req: Request, res: Response) => {
    let { username, email, password, confirmPassword }: ISsignupDto = req.body;

    let check = await this._usermodel.findOne({
      filter: { email },
      select: "email",
    });
    if (check) throw new confilect("user already exist");

    let otp = customAlphabet("0123456789akjtr", 6)();

    let user =
      (await this._usermodel.createuser({
        data: [{ username, email, password: password, confirmEmailOTP: otp }],
        options: { validateBeforeSave: true },
      })) || [];

    return res.json({ msg: "user is  created And check your email ", user });
  };

  confirmEmail = async (req: Request, res: Response) => {
    let { email, otp }: ISconemail = req.body;

    let user = await this._usermodel.findOne({
      filter: {
        email,
        confirmEmailOTP: { $exists: true },
        confirmedAt: { $exists: false },
      },
    });
    if (!user) {
      throw new badRequest("the email not found");
    }
    let check = compare(otp, user.confirmEmailOTP as string);

    if (!check) {
      throw new badRequest("the otp not correct");
    }

    await this._usermodel.updateOne({
      filter: { email },
      update: {
        $set: { confirmedAt: Date.now() },
        $unset: { confirmEmailOTP: true },
      },
    });
    return res.json({ msg: "user is  confirmed" });
  };

  login = async (req: Request, res: Response) => {
    let { email, password }: ISlogin = req.body;

    let user = await this._usermodel.findOne({ filter: { email } });
    if (!user) {
      throw new badRequest("email  not found");
    }

    if (!user.confirmedAt) {
      throw new badRequest("email  not confirmed");
    }
    if (user.resetPasswordOTP) {
      throw new badRequest("password  not confirmed");
    }

    if (!(await compare(password, user.password))) {
      throw new badRequest("the password is not correct");
    }

    let tokens = await getToken(user);

    return res.json({
      message: "user is  logged successfuly",
      data: { tokens },
    });
  };
}
export default new authenticationService();
