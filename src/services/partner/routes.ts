import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { editPartnerProfile } from "./controller";
const basePath = config.get("BASE_PATH");
const userPath = 'partner';
const userPathURL = basePath + userPath;

export default [
  // edit partner //
  {
    path: userPathURL + "/editProfile/:id",
    method: "put",
    handler: [
      // checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await editPartnerProfile(
          req.params.id,
          req.body,
          req.files,
          next
        );
        res.status(200).send(result);
      },
    ],  
  },
];
