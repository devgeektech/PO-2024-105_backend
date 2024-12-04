import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import * as AWS from "aws-sdk";
import config from "config";
import path from "path";

const options: any = {
  secretAccessKey: config.get("AWS.BUCKET.SECRET"),
  accessKeyId: config.get("AWS.BUCKET.ACCESS_KEY"),
  region: config.get("AWS.BUCKET.REGION"),
  endpoint: config.get("AWS.BUCKET.ENDPOINT")
};

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    console.log('MULTER')
    const path = "temp/";
    fs.mkdirSync(path, { recursive: true });
    return cb(null, path);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage
});


export class FileUpload {
  public static uploadFileToAWS = async (file: any, type: string) => {
    try {
      return new Promise(async (resolve, reject) => {
        const source = `temp/${file.filename}`;
        const fileContent = fs.readFileSync(source);
        AWS.config.update(options);
        const s3 = new AWS.S3({
          s3ForcePathStyle: true,
        });
        const fileExt = path.extname(file.originalname);
        const fileRandomName = uuidv4();
        const fileName = file?.originalname.split('.')[0];
        let newName ;
        if (file.mimetype.indexOf('image/') > -1) {
          newName = `${fileName}.png`;
      } else {
          newName = `${fileName}${fileExt}`;
      }

        let s3Params = {
          ContentType: `${file.mimetype}`,
          Bucket: "sports-club-storage",
          Body: fileContent,
          Key: `${newName}`,
        };
        try {
          let data = s3.upload(s3Params).promise();
          resolve(data);
        } catch (err) {
          console.log("erroris", err);
        }
      });
    }
    catch (err) {
      console.log('value of error is', err)
    }
  }


  public static async delete(type: string, fileName: any) {
    AWS.config.update(options);
    const s3 = new AWS.S3();

    let oldFile: any;
    oldFile = fileName

    const params = {
      Bucket: `${config.get("AWS.BUCKET.NAME")}`,
      Key: `${oldFile}`
      // Key: `${type}/${fileName}`
    };

    try {
      await s3.deleteObject(params).promise();
      return true;
    } catch (err) {
      return false;
    }
  }
}
