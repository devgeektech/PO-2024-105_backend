import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { addPartnerWithLocation, deletePartnerById, editPartnerWithLocation, getAllPartners, getPartnerById, updatePartnerStatus } from "./controller";
const basePath = config.get("BASE_PATH");
const userPath = 'adminWeb';
const userPathURL = basePath + userPath;

export default [
  // add partner //  
  {
    path: userPathURL + "/partner",
    method: "post",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await addPartnerWithLocation(
          req.body,
          next
        );
        res.status(200).send(result);
      },
    ],
  },

  // edit partner //
  {
    path: userPathURL + "/partner/:id",
    method: "put",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await editPartnerWithLocation(
          req.params.id,
          req.body,
          next
        );
        res.status(200).send(result);
      },
    ],  
  },

  // get all partners //
  {
    path: userPathURL + "/partners",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await getAllPartners(req.get("Authorization"), req.query, next);
        res.status(200).send(result);
      },
    ],
  },

  //get Partner By Id //
  {
    path: userPathURL + "/partner/:id",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const partnerId = req.params.id; // Extract partner ID from URL
        const result = await getPartnerById(partnerId, next);
        res.status(200).send(result);
      },
    ],
  },

  // delete Partner By Id //
  {
    path: userPathURL + "/partner/:id",
    method: "delete",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const partnerId = req.params.id; // Extract partner ID from URL
        const result = await deletePartnerById(partnerId, next);
        res.status(200).send(result);
      },
    ],
  },

  // update Partner status By Id //
  {
    path: userPathURL + "/partner/updateStatus/:id",
    method: "put",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const partnerId = req.params.id;
        const result = await updatePartnerStatus(partnerId, req.body,  next);
        res.status(200).send(result);
      },
    ],
  }


];
