import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { createClass, editClass, getAllClasses, getClassById } from "./controller";
const basePath = config.get("BASE_PATH");
const partnerPath = "partner";
const partnerPathURL = basePath + partnerPath;

export default [
  // Route for add a class
  {
    path: partnerPathURL + "/addClass",
    method: "post",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await createClass(
          req.get("Authorization"),
          req.body,
          req.file,
          next
        );
        res.status(200).send(result);
      },
    ],
  },

  // Route for editing a class
  {
    path: partnerPathURL + "/editClass/:id",
    method: "put",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await editClass(
          req.get("Authorization"),
          req.params.id,
          req.body,
          req.file,
          next
        );
        res.status(200).send(result);
      },
    ],
  },
  
  // Route for Fetch classes
  {
    path: partnerPathURL + "/classes",
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
    path: partnerPathURL + "/class/:id",
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
