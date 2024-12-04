import { adminSignUp } from "../services/auth/controller";

export const defaultCreates = async () => {
    await adminSignUp();
};