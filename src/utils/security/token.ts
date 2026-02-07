import { roletype } from "../../db/models/user";
import { v4 as uuid } from "uuid";
import { sign, verify, Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { HUserDocument } from "../../db/models/user";
import { TokenModel } from "../../db/models/tokens";
import { badRequest } from "../response/response.error";
import { tokenRepository } from "../../db/repository/token.repository ";
export interface MyJwtPayload extends JwtPayload {
  id: string;
  jti: string;
  email: string;
}
export let signatureEnum = {
  admin: "admin",
  user: "user",
};

export enum LogoutEnum {
  ONLY = "ONLY",
  ALL = "ALL",
}

export let generateToken = async function (
  payload: object,
  key: Secret,
  option: SignOptions,
): Promise<string> {
  return await sign(payload, key, option);
};

export let verifyToken = async function (
  payload: string,
  key: Secret,
): Promise<MyJwtPayload> {
  return (await verify(payload, key)) as MyJwtPayload;
};

export let getSignature = async function (
  signaturLevel: roletype = roletype.user,
) {
  let signature: { refreshKey: string; accessKey: string } = {
    refreshKey: "",
    accessKey: "",
  };
  switch (signaturLevel) {
    case signatureEnum.user:
      signature.refreshKey = process.env.KEYTOKEN_REFRESH_USER as string;
      signature.accessKey = process.env.KEYTOKEN_USER as string;
      break;

    default:
      signature.refreshKey = process.env.KEYTOKEN_REFRESH_ADMIN as string;
      signature.accessKey = process.env.KEYTOKEN_ADMIN as string;
      break;
  }
  return signature;
};

export let getToken = async function (user: HUserDocument) {
  let keys = await getSignature(user.role);
  let tokenAccess = await generateToken(
    { id: user._id, email: user.email },
    keys.accessKey,
    { jwtid: uuid(), expiresIn: "1h" },
  );

  let tokenRefresh = await generateToken(
    { id: user._id, email: user.email },
    keys.refreshKey,
    { jwtid: uuid(), expiresIn: "1d" },
  );

  return { tokenAccess, tokenRefresh };
};

export const createRevokeToken = async (decoded: MyJwtPayload) => {
  const tokenRepo = new tokenRepository(TokenModel);

  const [result] =
    (await tokenRepo.create({
      data: [
        {
          jti: decoded.jti as string,
          expiresIn: decoded.iat as number,
          userId: new Types.ObjectId(decoded.id),
        },
      ],
    })) || [];

  if (!result) {
    throw new badRequest("Fail to revoke token");
  }

  return result;
};
