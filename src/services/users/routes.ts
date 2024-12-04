import { NextFunction, Request, Response } from "express";
import config from "config";
import { addUser, approveUser, deleteUser, getAllMembers, getAllUsers, getAllUsersForExport, getUserProfileById, getUserSlots, updateSponsor, updateUser, updateUserAvatar, assignedMembers, assignedMembersRecords, getAllTrainers } from "./controller";
import { checkAuthenticate } from "./middleware/check";
import { Utilities } from "../../utils/Utilities";
const basePath = config.get("BASE_PATH");
const userPath = 'users';
const userPathURL = basePath + userPath;
export default [
  // Get all users
  {
    path: userPathURL + "/getAllUsers",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: any, res: Response, next: NextFunction) => {
        const result = await getAllUsers(req.user, req, next);
        res.status(200).send(result);
      },
    ],
  },
  {
    path: userPathURL + "/getAllMembers",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: any, res: Response, next: NextFunction) => {
        const result = await getAllMembers(req.user, req, next);
        res.status(200).send(result);
      },
    ],
  },
  // get all trainers
  {
    path: userPathURL + "/getAllTrainers",
    method: "get",
    handler: [
      checkAuthenticate,
      async (_: any, res: Response, next: NextFunction) => {
        const result = await getAllTrainers(next);
        res.status(200).send(result);
      },
    ],
  },
  // Get all users for exports
  {
    path: userPathURL + "/getAllUsersForExport",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: any, res: Response, next: NextFunction) => {
        const result = await getAllUsersForExport(next);
        res.status(200).send(result);
      },
    ],
  },

  // Get user by id
  {
    path: userPathURL + "/profile/:id",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: any, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const result = await getUserProfileById(userId, next);
        res.status(200).send(result);
      },
    ],
  },
  //add user
  {
    path: userPathURL,
    method: "post",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const result = await addUser(req.body, req.files, next);
        res.status(200).send(result);
      },
    ],
  },
  //update user
  {
    path: userPathURL + '/:id',
    method: "put",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const result = await updateUser(userId, req.body, req.files, next);
        res.status(200).send(result);
      },
    ],
  },
  //update user
  {
    path: userPathURL + '/:id',
    method: "put",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const result = await updateUser(userId, req.body, req.files, next);
        res.status(200).send(result);
      },
    ],
  },
  //update sponsor
  {
    path: userPathURL + '/sponsor/:id',
    method: "put",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const result = await updateSponsor(userId,req.body, req.files, next);
        res.status(200).send(result);
      },
    ],
  },
  // Approve User
  {
    path: userPathURL + '/approve/:id',
    method: "put",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const result = await approveUser(userId, req.body, next);
        res.status(200).send(result);
      },
    ],
  },

  {
    path: userPathURL + '/:id',
    method: "delete",
    handler: [
      async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id;
        const result = await deleteUser(userId, next);
        res.status(200).send(result);
      },
    ],
  },
  {
    path: userPathURL + "/slots/:date",
    method: "get",
    handler: [
      checkAuthenticate,
      async (req: any, res: Response, next: NextFunction) => {
        const date = req.params.date;
        const result = await getUserSlots(req.get(config.get("AUTHORIZATION")), date, req, next);
        res.status(200).send(result);
      },
    ],
  },
  // {
  //   path: userPathURL + "/slots",
  //   method: "post",
  //   handler: [
  //     // checkAuthenticate,
  //     async (req: any, res: Response, next: NextFunction) => {
  //       const result = await addSlots(await Utilities.getDecoded(req.get(config.get("AUTHORIZATION"))), req, next);
  //       res.status(200).send(result);
  //     },
  //   ],
  // },
  {
    path: userPathURL + "/trainer/:id/assignedMembers",
    method: "put",
    handler: [
      // checkAuthenticate,
      async (req: any, res: Response, next: NextFunction) => {
      const userId = req.params.id;

        const result = await assignedMembers(userId, req.body,  next);
        res.status(200).send(result);
      },
    ],
  },
  {
    path: userPathURL + "/trainer/:id/assignedMembers",
    method: "get",
    handler: [
      // checkAuthenticate,
      async (req: any, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const result = await assignedMembersRecords(userId,  next);
        res.status(200).send(result);
      },
    ],
  },

];
