import { NextFunction, Request, Response } from "express";
import config from "config";
import {
  addWellnessType,
  updateWellnessType,
} from "./controller";
import { checkAuthenticate } from "./middleware/check";
import { Utilities } from "../../utils/Utilities";
const basePath = config.get("BASE_PATH");
const userPath = 'adminWeb';
const userPathURL = basePath + userPath;

export default [

  // add wellness Type //
  {
    path: userPathURL + "/wellnessType",
    method: "post",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await addWellnessType(req.body, req.files, next);
        res.status(200).send(result);
      },
    ],
  },

  //  update wellness Type //
  {
    path: userPathURL + '/wellnessType/:id',
    method: "put",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await updateWellnessType(req.params, req.body, req.files, next);
        res.status(200).send(result);
      },
    ],
  },

  // // Get all users
  // {
  //   path: userPathURL + "/getAllUsers",
  //   method: "get",
  //   handler: [
  //     checkAuthenticate,
  //     async (req: any, res: Response, next: NextFunction) => {
  //       const result = await getAllUsers(req.user, req, next);
  //       res.status(200).send(result);
  //     },
  //   ],
  // },


];
