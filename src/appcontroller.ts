import express from "express";
import type { Express, Request, Response } from "express";
import mycon from "./db/connection";
import cors from "cors";
import { errorHandling } from "./utils/response/response.error";
import helmet from "helmet";
import { config } from "dotenv";
import routeruser from "./modules/user/controller";
import { rateLimit } from "express-rate-limit";
import path from "node:path";
import routerAuth from "./modules/Auth/controller";
import routerPost from "./modules/post/postController";
import { inialize } from "./modules/gateway/gateway";
import routerChat from "./modules/chat/controller";
config({ path: path.resolve("./config/.env.dev") });
export let bootstrap = async function () {
  let app: Express = express();
  let port: number = Number(process.env.PORT);
  app.use(cors());
  app.use(helmet());
  const limiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 3,
    message: {
      statusCode: 429,
      message: "to many request,please try again later",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use(limiter);
  await mycon();
  app.use(express.json());
  app.use("/post", routerPost);
  app.use("/auth", routerAuth);
  app.use("/user", routeruser);
  app.use("/chat", routerChat);

  app.use("/*dummy", function (req: Request, res: Response) {
    return res.json({ msg: "handler not found" });
  });

  app.use(errorHandling);

  let httpServer = app.listen(port, function () {
    console.log(`hi from ${port}`);
  });

  inialize(httpServer);
};
