"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("./controller");
const config_1 = __importDefault(require("config"));
const check_1 = require("./middleware/check");
const basePath = config_1.default.get("BASE_PATH");
const currentPath = basePath + "auth";
const adminPath = '/admin/';
const memberPath = '/member/';
const partnerPath = '/partner/';
const memberPathURL = currentPath + memberPath;
const adminPathURL = currentPath + adminPath;
const partnerPathURL = currentPath + partnerPath;
console.log('partnerPathURL ===== ', partnerPathURL);
exports.default = [
    //***********************   ADMIN   *************************//
    //  login  //
    {
        path: adminPathURL + "login",
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.adminLogin)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //  forgot Password  //
    {
        path: adminPathURL + 'forgotPassword',
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.forgotPassword)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //  verify link  //
    {
        path: currentPath + '/resetLink/:id',
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.verifyResetLink)(req.params, req.query, next);
                res.status(200).send(result);
            }),
        ],
    },
    // reset password  //
    {
        path: adminPathURL + 'resetPassword',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.createNewPassword)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //  change Password  //
    {
        path: adminPathURL + "changePassword",
        method: "put",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.adminChangePassword)(req.get(config_1.default.get("AUTHORIZATION")), req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //***********************   FITNESS PRTNER   *************************// 
    //  signup  //
    {
        path: partnerPathURL + "signup",
        method: "post",
        handler: [
            check_1.checkPartnerSignup,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerSignup)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //  verify code  //
    {
        path: partnerPathURL + "verifyCode",
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerVerifyCode)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // resend verify code  //
    {
        path: partnerPathURL + "resendVerifyCode",
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerResendVerifyCode)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // add partner //  
    {
        path: partnerPathURL + "add",
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerAddWithLocation)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // create new password On-board //  
    {
        path: partnerPathURL + "createNewPassword",
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerCreateNewPassword)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //  partner login  //
    {
        path: partnerPathURL + "login",
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerLogin)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //  partner forgot Password  //
    {
        path: partnerPathURL + 'forgotPassword',
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerForgotPassword)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //  partner verify link  //
    {
        path: partnerPathURL + 'resetLink/:id',
        method: "get",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerVerifyResetLink)(req.params, req.query, next);
                res.status(200).send(result);
            }),
        ],
    },
    // partner reset password  //
    {
        path: partnerPathURL + 'resetPassword',
        method: "put",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerResetPassword)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // partner change password  //
    {
        path: partnerPathURL + "changePassword",
        method: "put",
        handler: [
            check_1.checkAuthenticate,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.partnerChangePassword)(req.get(config_1.default.get("AUTHORIZATION")), req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    //***********************   MEMBER   *************************//
    //  register  //
    {
        path: memberPathURL + "register",
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.memberRegister)(req.files, req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Login & Ragister 
    {
        path: memberPathURL + "login",
        method: "post",
        handler: [
            check_1.checkLogin,
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.memberLogin)(req.body, next);
                res.status(200).send(result);
            }),
        ],
    },
    // Login with token 
    {
        path: memberPathURL + "tokenLogin",
        method: "post",
        handler: [
            (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
                const result = yield (0, controller_1.memberLoginByToken)(req.body, next);
                res.status(200).send(result);
            }),
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
//# sourceMappingURL=routes.js.map