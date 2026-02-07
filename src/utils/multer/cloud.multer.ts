import multer, { FileFilterCallback } from "multer";
import os from "os";
import {
  PutObjectCommand,
  ObjectCannedACL,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuid } from "uuid";
import { Request } from "express";
import { badRequest } from "../response/response.error";
import { s3Config } from "./s3.config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";
import { GetObjectCommand } from "@aws-sdk/client-s3";
export enum StorageEnum {
  MEMORY = "MEMORY",
  DISK = "DISK",
}

export const filevalidation = {
  images: ["image/png", "image/jpeg", "image/jpg"],
  pdf: ["application/pdf"],
  doc: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
};
//middleware of multer
export const cloudFileUpload = ({
  validation = [],
  storageApproch = StorageEnum.MEMORY,
  maxSize = 2,
}: {
  validation: string[];
  storageApproch: StorageEnum;
  maxSize?: number;
}) => {
  const storage =
    storageApproch === StorageEnum.MEMORY
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: os.tmpdir(),
          filename: (req: Request, file: Express.Multer.File, cb) => {
            cb(null, `${uuid()}-${file.originalname}`);
          },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (!validation.includes(file.mimetype)) {
      return cb(new badRequest("Invalid File Type"));
    }
    cb(null, true);
  };

  return multer({
    fileFilter,
    limits: { fileSize: maxSize * 1024 * 1024 },
    storage,
  });
};

//function to upload single file small size  ("@aws-sdk/client-s3")
export const uploadFile = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
    Body: storageApproch === StorageEnum.MEMORY ? file.buffer : file.path,
    ContentType: file.mimetype,
  });
  await s3Config().send(command);

  if (!command?.input?.Key) {
    throw new badRequest("fail to upload file");
  }

  return command.input.Key;
};

//function to upload single file large size  ("@aws-sdk/lib-storage")
export const uploadLargeFile = async ({
  storageApproch = StorageEnum.MEMORY,
  Bucket = process.env.AWS_BUCKET_NAME as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageApproch?: StorageEnum;
  Bucket?: string;
  ACL?: ObjectCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  let upload = new Upload({
    client: s3Config(),
    params: {
      Bucket,
      ACL,
      Key: `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
      Body: storageApproch === StorageEnum.MEMORY ? file.buffer : file.path,
      ContentType: file.mimetype,
    },
    partSize: 500 * 1024 * 1024,
  });
  let { Key } = await upload.done();

  if (!Key) {
    throw new badRequest("fail to upload file");
  }
  return Key;
};

//function to upload multiple file
export const uploadFiles = async ({
  path = "general",
  files,
}: {
  path?: string;
  files: Express.Multer.File[];
}) => {
  let keys: string[] = [];

  for (const file of files) {
    let key = await uploadFile({ path, file });
    keys.push(key);
  }
  return keys;
};

//function to create Url of file
export const createPresignedURL = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  path = "general",
  ContentType,
  originalname,
  expiresIn = 120,
}: {
  Bucket?: string;
  path?: string;
  ContentType: string;
  originalname: string;
  expiresIn?: number;
}) => {
  const Key = `${process.env.APPLICATION_NAME}/${path}/${uuid()}-presigned-${originalname}`;

  const command = new PutObjectCommand({
    Bucket,
    Key,
    ContentType,
  });

  const url = await getSignedUrl(s3Config(), command, {
    expiresIn,
  });

  if (!url) {
    throw new badRequest("Fail to generate URL");
  }

  return { url, key: command.input.Key };
};

//function to get Url of file to open it
export const getFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  return await s3Config().send(command);
};

//function to get Url of file to open it  by Presigned
export const createGetPresignedURL = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
  expiresIn = 120,
}: {
  Bucket?: string;
  Key: string;
  expiresIn?: number;
}) => {
  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  const url = await getSignedUrl(s3Config(), command, {
    expiresIn,
  });

  if (!url || !command.input.Key) {
    throw new badRequest("Fail to generate URL");
  }

  return url;
};

export const deleteFile = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  Key,
}: {
  Bucket?: string;
  Key: string;
}) => {
  const command = new DeleteObjectCommand({
    Bucket,
    Key,
  });

  return await s3Config().send(command);
};

export const deleteFiles = async ({
  Bucket = process.env.AWS_BUCKET_NAME as string,
  urls,
  Quiet = false,
}: {
  Bucket?: string;
  urls: string[];
  Quiet?: boolean;
}) => {
  const Objects = urls.map((url) => ({ Key: url }));

  const command = new DeleteObjectsCommand({
    Bucket,
    Delete: {
      Objects,
      Quiet,
    },
  });
  return await s3Config().send(command);
};
