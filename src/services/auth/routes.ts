import { NextFunction, Request, Response } from "express";
import {
  adminChangePassword,
  adminLogin,
  createNewPassword,
  forgotPassword,
  verifyResetLink,
  memberLogin,
  memberLoginByToken,
  memberRegister,
} from "./controller";
import config from "config";
import { checkLogin, checkAuthenticate, } from "./middleware/check";
const basePath = config.get("BASE_PATH");
const currentPath = basePath + "auth";
const adminPath = '/admin/';
const memberPath = '/member/';
const memberPathURL = currentPath + memberPath;
const adminPathURL = currentPath + adminPath;


export default [
  //***********************   ADMIN   *************************//
  //  login  //
  {
    path: adminPathURL + "login",
    method: "post",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await adminLogin(req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  //  forgot Password  //
  {
    path: adminPathURL + 'forgotPassword',
    method: "post",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await forgotPassword(req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  //  verify link  //
  {
    path: currentPath + '/resetLink/:id',
    method: "get",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await verifyResetLink(req.params, req.query, next);
        res.status(200).send(result);
      },
    ],
  },

  // reset password  //
  {
    path: adminPathURL + 'resetPassword',
    method: "put",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await createNewPassword(req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  //  change Password  //
  {
    path: adminPathURL + "changePassword",
    method: "put",
    handler: [
      checkAuthenticate,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await adminChangePassword(req.get(config.get("AUTHORIZATION")), req.body, next);
        res.status(200).send(result);
      },
    ],
  },


  //***********************   MEMBER   *************************//
  //  register  //
  {
    path: memberPathURL + "register",
    method: "post",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await memberRegister(req.files, req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  // Login & Ragister 
  {
    path: memberPathURL + "login",
    method: "post",
    handler: [
      checkLogin,
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await memberLogin(req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  // Login with token 
  {
    path: memberPathURL + "tokenLogin",
    method: "post",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await memberLoginByToken(req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  // {
  //   path: memberPathURL + "verifyAccount",
  //   method: "post",
  //   handler: [
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const result = await verifyAccount(req.body, next);
  //       res.status(200).send(result);
  //     },
  //   ],
  // },

  // {
  //   path: memberPathURL + "changePassword",
  //   method: "post",
  //   handler: [
  //     checkAuthenticate,
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const result = await adminChangePassword(req.get(config.get("AUTHORIZATION")), req.body, next);
  //       res.status(200).send(result);
  //     },
  //   ],
  // },

  // {
  //   path: memberPathURL + "exists",
  //   method: "post",
  //   handler: [
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const result = await checkEmailExistence(req.body, next);
  //       res.status(200).send(result);
  //     },
  //   ],
  // },

  // {
  //   path: memberPathURL + "checkMember",
  //   method: "post",
  //   handler: [
  //     async (req: Request, res: Response, next: NextFunction) => {
  //       const result = await getMemberByEmail(req.body, next);
  //       res.status(200).send(result);
  //     },
  //   ],
  // },
];
