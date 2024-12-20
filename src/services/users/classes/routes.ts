import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { getAllClasses, getClassById } from "./controller";
const basePath = config.get("BASE_PATH");
const userPath = "user";
const userPathURL = basePath + userPath;

export default [
  // Route for Fetch classes
  {
    path: userPathURL + "/classes",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getAllClasses(req.get("Authorization"), req.query, next);
        res.status(200).send(result);
      },
    ],
  },

  // Route to Fetch specific class
  {
    path: userPathURL + "/class/:id",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getClassById(req.get("Authorization"), req.params.id, next);
        res.status(200).send(result);
      },
    ],
  }

];
