import { NextFunction, Request, Response } from "express";
import config from "config";
import { checkAuthenticate } from "./middleware/check";
import { addCompany, deleteCompanyById, editCompany, getAllCompanies, getCompanyById } from "./controller";
const basePath = config.get("BASE_PATH");
const userPath = 'adminWeb';
const userPathURL = basePath + userPath;

export default [
  // add partner //  
  {
    path: userPathURL + "/company",
    method: "post",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await addCompany(
          req.body,
          req.get("Authorization"),
          next
        );
        res.status(200).send(result);
      },
    ],
  },

  // edit partner //
{
  path: userPathURL + "/company/:id",
  method: "put",
  handler: [
    checkAuthenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await editCompany(req.params.id, req.body, next);
      res.status(200).send(result);
    },
  ],  
},

// get all companies //
{
  path: userPathURL + "/companies",
  method: "get",
  handler: [
    checkAuthenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      const result = await getAllCompanies(req.get("Authorization"), req.query, next);
      res.status(200).send(result);
    },
  ],
},

{
  path: userPathURL + "/company/:id",
  method: "get",
  handler: [
    checkAuthenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      const companyId = req.params.id; // Extract company ID from URL
      const result = await getCompanyById(companyId, next);
      res.status(200).send(result);
    },
  ],
},

// Delete Company By Id
{
  path: userPathURL + "/company/:id",
  method: "delete",
  handler: [
    checkAuthenticate,
    async (req: Request, res: Response, next: NextFunction) => {
      const companyId = req.params.id; // Extract company ID from URL
      const result = await deleteCompanyById(companyId, next);
      res.status(200).send(result);
    },
  ],
}

];
