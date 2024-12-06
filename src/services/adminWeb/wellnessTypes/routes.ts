import { NextFunction, Request, Response } from "express";
import config from "config";
import {
  addWellnessType,
  deleteWellnessType,
  getAllWellnessTypes,
  getWellnessTypeById,
  updateWellnessType,
} from "./controller";
import { checkAuthenticate } from "./middleware/check";
import { Utilities } from "../../../utils/Utilities";
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
        const result = await addWellnessType(req.get(config.get("AUTHORIZATION")),req.body, req.files, next);
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
  
  //  Get all wellness types  //
  {
    path: userPathURL + '/wellnessTypes', 
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getAllWellnessTypes(req.query, next);
        res.status(200).send(result);
      },
    ],
  },

  // Get wellness type by ID
  {
    path: userPathURL + '/wellnessType/:id',  
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getWellnessTypeById(req.params.id, next);
        res.status(200).send(result);
      },
    ],
  },

  // delete wellness Type //
  {
    path: userPathURL + '/wellnessType/:id',
    method: "delete",
    handler: [
      checkAuthenticate, 
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await deleteWellnessType(req.params.id, next);  
        res.status(200).send(result); 
      },
    ],
  },
  
];
