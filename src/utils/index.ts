import { Router, Request, Response, NextFunction } from "express";
import config from 'config';
import { Utilities } from "./Utilities";

type Wrapper = ((router: Router) => void);

export const applyMiddleware = (
  middlewareWrappers: Wrapper[],
  router: Router
) => {
  for (const wrapper of middlewareWrappers) {
    wrapper(router);
  }
};

type Handler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

type Route = {
  path: string;
  method: string;
  handler: Handler | Handler[];
};

export const applyRoutes = (routes: Route[], router: Router) => {
  for (const route of routes) {
    const { method, path, handler } = route;
    (router as any)[method](path, handler);
  }
};


export const generateVerificationLink=async (userDetail:any)=>{
  const api_url= config.get('VERIFICATION_URL');
  const token=await Utilities.createJWTToken({id: userDetail?._id},'30m');
  const verificationLink= `${api_url}?token=${token}`;
  return verificationLink;
}