import { HUserDocument, usermodel } from "../db/models/user";
import { badRequest, confilect } from "../utils/response/response.error";
import { MyJwtPayload, verifyToken } from "../utils/security/token";
import { getSignature } from "../utils/security/token";
import { roletype } from "../db/models/user";
import { NextFunction, Request, Response } from "express";
import { tokenRepository } from "../db/repository/token.repository ";
import { TokenModel } from "../db/models/tokens";

export enum typeTokenEnum {
  access = "access",
  refresh = "refresh",
}

// function
export let decodedToken = async function (
  typeToken: typeTokenEnum = typeTokenEnum.access,
  authorization: string,
) {
  let tokenmodel = new tokenRepository(TokenModel);

  let [bearer, token] = authorization.split(" ");
  if (!bearer || !token) {
    throw new badRequest("the token is not correct");
  }
  if (bearer != "user" && bearer != "admin") {
    throw new badRequest("the token is not correctt");
  }
  let signature = await getSignature(bearer as roletype);
  let decoded = await verifyToken(
    token,
    typeToken == typeTokenEnum.access
      ? signature.accessKey
      : signature.refreshKey,
  );

  if (!decoded.jti) {
    throw new badRequest("the token is not correct");
  }
  let tokens = await tokenmodel.findOne({ filter: { jti: decoded.jti } });
  if (tokens) {
    throw new badRequest("the token is revokee");
  }

  let user = await usermodel.findOne({ _id: decoded.id });

  if (!user) {
    throw new badRequest("the user is not found");
  }

  if (user.changeCredientialsTime?.getTime() || 0 > decoded.iat! * 1000)
    throw new badRequest("Logged out From All Devices");
  return { decoded, user };
};

//middleware
export let authintication = function (
  typeToken: typeTokenEnum = typeTokenEnum.access,
) {
  return async function (req: Request, res: Response, next: NextFunction) {
    let { user, decoded } = await decodedToken(
      typeToken,
      req.headers.authorization as string,
    );
    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

//middleware
export let authorization = function (role: Array<roletype> = []) {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (!role.includes(req.user!.role)) {
      throw new badRequest("you are not authorized sorry");
    }
    return next();
  };
};
