import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { addService, deleteService, getAllServices, getServiceById, updateService } from "./controller";
const basePath = config.get("BASE_PATH");
const userPath = 'adminWeb';
const userPathURL = basePath + userPath;

export default [
  // add services //  
  {
    path: userPathURL + "/service",
    method: "post",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await addService(
          req.get(config.get("AUTHORIZATION")),
          req.body,
          next
        );
        res.status(200).send(result);
      },
    ],
  },

  // get all services
  {
    path: userPathURL + "/services",
    method: "get",
    handler: [
      // checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getAllServices(req.query, next);
        res.status(200).send(result);
      },
    ],
  },

  // get service by ID
  {
    path: userPathURL + "/service/:id",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getServiceById(req.params.id, next);
        res.status(200).send(result);
      },
    ],
  },

  // update service
  {
    path: userPathURL + "/service/:id",
    method: "put",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await updateService(req.params, req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  // delete service
  {
    path: userPathURL + "/service/:id",
    method: "delete",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await deleteService(req.params.id, next);
        res.status(200).send(result);
      },
    ],
  },
];
