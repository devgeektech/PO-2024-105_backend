import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { editPartnerProfile, getPartnerAllLocations, getPartnerByLocation } from "./controller";
const basePath = config.get("BASE_PATH");
const userPath = 'partner';
const userPathURL = basePath + userPath;

export default [
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
  {
    path: userPathURL + "/location/:id",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const locationId = req.params.id; // Extract partner ID from URL
        const result = await getPartnerByLocation(locationId, next);
        res.status(200).send(result);
      },
    ],
  },
  {
    path: userPathURL + "/all/locations/:id",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const partnerId = req.params.id;
        const result = await getPartnerAllLocations(partnerId, next);
        res.status(200).send(result);
      },
    ],
  },
];
