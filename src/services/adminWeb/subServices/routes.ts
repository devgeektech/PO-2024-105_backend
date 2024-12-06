import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { addSubService, deleteSubService, getAllSubServices, getSubServiceById, updateSubService } from "./controller";
const basePath = config.get("BASE_PATH");
const userPath = 'adminWeb';
const userPathURL = basePath + userPath;

export default [
  // Add sub-services
  {
    path: userPathURL + "/subservice",
    method: "post",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await addSubService(
          req.get(config.get("AUTHORIZATION")),
          req.body,
          next
        );
        res.status(200).send(result);
      },
    ],
  },

  // Get all sub-services
  {
    path: userPathURL + "/subservices",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getAllSubServices(req.query, next);
        res.status(200).send(result);
      },
    ],
  },

  // Get sub-service by ID
  {
    path: userPathURL + "/subservice/:id",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getSubServiceById(req.params.id, next);
        res.status(200).send(result);
      },
    ],
  },

  // Update sub-service
  {
    path: userPathURL + "/subservice/:id",
    method: "put",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await updateSubService(req.params, req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  // Delete sub-service (soft delete)
  {
    path: userPathURL + "/subservice/:id",
    method: "delete",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await deleteSubService(req.params.id, next);
        res.status(200).send(result);
      },
    ],
  },
];
