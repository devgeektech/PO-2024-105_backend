import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { addPartnerWithLocation, getAllPartners } from "./controller";
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
          req.get("Authorization"),
          req.body,
          next
        );
        res.status(200).send(result);
      },
    ],
  },

  // edit partner //
  // {
  //   path: userPathURL + "/partner/:id",
  //   method: "put",
  //   handler: [
  //     checkAuthenticate,
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const result = await editPartnerWithLocation(
  //         req.get("Authorization"),
  //         req.params.id,
  //         req.body,
  //         next
  //       );
  //       res.status(200).send(result);
  //     },
  //   ],  
  // },

  // get all partners //
  // {
  //   path: userPathURL + "/partners",
  //   method: "get",
  //   handler: [
  //     checkAuthenticate,
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const result = await getAllPartners(req.get("Authorization"), req.query, next);
  //       res.status(200).send(result);
  //     },
  //   ],
  // }
];
