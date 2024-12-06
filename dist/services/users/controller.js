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
exports.assignedMembersRecords = exports.assignedMembers = exports.getUserSlots = exports.deleteUser = exports.approveUser = exports.updateUserAvatar = exports.updateSponsor = exports.updateUser = exports.addUser = exports.getUserProfileById = exports.getAllUsersForExport = exports.getAllTrainers = exports.getAllMembers = exports.getAllUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("config"));
const ejs_1 = __importDefault(require("ejs"));
const httpErrors_1 = require("../../utils/httpErrors");
const user_1 = require("../../db/user");
const Utilities_1 = require("../../utils/Utilities");
const MailerUtilities_1 = require("../../utils/MailerUtilities");
const defaultSlots_1 = require("../../db/defaultSlots");
const userSlots_1 = require("../../db/userSlots");
//  common api for users
const getAllUsers = (auth, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = req.query;
        let query = {
            isDeleted: false,
            isSuperUser: { $ne: true },
            _id: { $ne: new mongoose_1.default.Types.ObjectId(auth === null || auth === void 0 ? void 0 : auth.id) }
        };
        if (search) {
            query["$or"] = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') },
            ];
        }
        const users = yield user_1.UserModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assignendUser",
                    foreignField: "_id",
                    as: "assignendUser",
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                            },
                        },
                    ],
                },
            },
            {
                $skip: Number((page - 1) * limit)
            },
            {
                $limit: Number(limit),
            }
        ]);
        const totalRecord = yield user_1.UserModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: users,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsers = getAllUsers;
const getAllMembers = (auth, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search, id } = req.query;
        let query = {
            approved: true,
            isDeleted: false,
            role: { $in: ['member', 'sponsor', 'trainer'] },
            isSuperUser: { $ne: true },
            _id: { $ne: new mongoose_1.default.Types.ObjectId(id ? id : auth === null || auth === void 0 ? void 0 : auth.id) }
        };
        if (search) {
            query["$or"] = [
                { firstName: new RegExp(search, 'i') },
                { lastName: new RegExp(search, 'i') },
                { phone: new RegExp(search, 'i') },
            ];
        }
        const users = yield user_1.UserModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $skip: Number((page - 1) * limit)
            },
            {
                $limit: Number(limit),
            }
        ]);
        const totalRecord = yield user_1.UserModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: users,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMembers = getAllMembers;
const getAllTrainers = (next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {
            approved: true,
            isDeleted: false,
            role: { $in: ['trainer'] },
            isSuperUser: { $ne: true }
        };
        const users = yield user_1.UserModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    avatar: 1,
                    _id: 1
                }
            }
        ]);
        const totalRecord = yield user_1.UserModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: users,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTrainers = getAllTrainers;
// get all approved users for exports
const getAllUsersForExport = (next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {
            isDeleted: false,
            approved: true
        };
        const users = yield user_1.UserModel.aggregate([
            {
                $match: Object.assign({}, query)
            },
            {
                $project: {
                    firstName: 1,
                    lastName: 1,
                    email: 1,
                    phone: 1,
                    gender: 1,
                    role: 1,
                    createdAt: 1
                }
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: users
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllUsersForExport = getAllUsersForExport;
const getUserProfileById = (userId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user = yield user_1.UserModel.findById(userId).select("-password").lean();
        if (!user) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_ADDED"),
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserProfileById = getUserProfileById;
const addUser = (bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let checkExist = yield user_1.UserModel.exists({ email: bodyData.email });
        if (checkExist) {
            throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                code: 400,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
            }));
        }
        const pass = yield Utilities_1.Utilities.cryptPassword(bodyData.password);
        if (files && files.length) {
            bodyData.avatar = files[0].filename;
        }
        bodyData.password = pass;
        bodyData.role = JSON.parse(bodyData.role);
        const result = yield user_1.UserModel.create(bodyData);
        let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/welcome.ejs", {
            name: `${(bodyData === null || bodyData === void 0 ? void 0 : bodyData.firstName) || ""} ${(bodyData === null || bodyData === void 0 ? void 0 : bodyData.lastName) || ""}`
        }, { async: true });
        let mailResponse = yield MailerUtilities_1.MailerUtilities.sendSendgridMail({
            recipient_email: [bodyData === null || bodyData === void 0 ? void 0 : bodyData.email],
            subject: "Willkommens-E-Mail",
            text: messageHtml,
        });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_ADDED"),
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addUser = addUser;
const updateUser = (userId, bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = yield user_1.UserModel.findById(userId);
        if (!user) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        if (bodyData.email && bodyData.email !== user.email) {
            const emailExists = yield user_1.UserModel.exists({ email: bodyData.email });
            if (emailExists) {
                throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                    code: 400,
                    message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
                }));
            }
        }
        const { firstName, lastName, email, phone, gender, role, dob, street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry, bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails, description, parentEmail, parentFirstName, parentLastName, parentPhone, parentRelatation, bloodGroup } = bodyData;
        let payload = {
            firstName, lastName, email, phone, gender, dob,
            parentEmail, parentFirstName, parentLastName, parentPhone, parentRelatation,
            street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry,
            bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails,
            bloodGroup
        };
        if (role) {
            payload.role = JSON.parse(role);
        }
        if (description) {
            payload.description = description;
        }
        let matchPermissionDoc, clubTransferDoc, birthCertificateDoc, residenceCertificateDoc, playersParentDeclarationDoc, copyOfPassportDoc, attachmentArgentinaDoc, attachmentIstupnicaDoc, attachmentBrisovnicaDoc, avatar;
        if (files && (files === null || files === void 0 ? void 0 : files.length)) {
            for (let file of files) {
                if (file.fieldname == 'matchPermissionDoc') {
                    matchPermissionDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                else if (file.fieldname == 'clubTransferDoc') {
                    clubTransferDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'birthCertificateDoc') {
                    birthCertificateDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'residenceCertificateDoc') {
                    residenceCertificateDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'playersParentDeclarationDoc') {
                    playersParentDeclarationDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'copyOfPassportDoc') {
                    copyOfPassportDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'attachmentArgentinaDoc') {
                    attachmentArgentinaDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'attachmentIstupnicaDoc') {
                    attachmentIstupnicaDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'attachmentBrisovnicaDoc') {
                    attachmentBrisovnicaDoc = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'avatar') {
                    avatar = file === null || file === void 0 ? void 0 : file.filename;
                }
            }
        }
        payload = Object.assign(Object.assign({}, payload), { matchPermissionDoc, clubTransferDoc, birthCertificateDoc, residenceCertificateDoc,
            playersParentDeclarationDoc, copyOfPassportDoc, attachmentArgentinaDoc, attachmentIstupnicaDoc,
            attachmentBrisovnicaDoc, avatar });
        const updatedUser = yield user_1.UserModel.findOneAndUpdate({ _id: userId }, { $set: payload }, { new: true });
        if (role && ((_a = payload.role) === null || _a === void 0 ? void 0 : _a.length) !== ((_b = user.role) === null || _b === void 0 ? void 0 : _b.length)) {
            let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/roleInvitation.ejs", {
                name: `${(user === null || user === void 0 ? void 0 : user.firstName) || ""} ${(user === null || user === void 0 ? void 0 : user.lastName) || ""}`,
            }, { async: true });
            let mailResponse = yield MailerUtilities_1.MailerUtilities.sendSendgridMail({
                recipient_email: [user === null || user === void 0 ? void 0 : user.email],
                subject: "Willkommen in Ihrer neuen Rolle!",
                text: messageHtml,
            });
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
const updateSponsor = (userId, bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user = yield user_1.UserModel.findById(userId);
        if (!user) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        if (bodyData.email && bodyData.email !== user.email) {
            const emailExists = yield user_1.UserModel.exists({ email: bodyData.email });
            if (emailExists) {
                throw new httpErrors_1.HTTP400Error(Utilities_1.Utilities.sendResponsData({
                    code: 400,
                    message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
                }));
            }
        }
        const { firstName, lastName, email, phone, gender, role, dob, street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry, bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails, description, companyName, websiteUrl, offerings, companyDescription, companyEmail, companyPhone, } = bodyData;
        let payload = {
            firstName, lastName, email, phone, gender, dob,
            street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry,
            bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails,
            companyName, websiteUrl, offerings, companyDescription, companyEmail, companyPhone
        };
        if (role) {
            payload.role = JSON.parse(role);
        }
        if (description) {
            payload.description = description;
        }
        let companyLogo, avatar;
        if (files && (files === null || files === void 0 ? void 0 : files.length)) {
            for (let file of files) {
                if (file.fieldname == 'companyLogo') {
                    companyLogo = file === null || file === void 0 ? void 0 : file.filename;
                }
                if (file.fieldname == 'avatar') {
                    avatar = file === null || file === void 0 ? void 0 : file.filename;
                }
            }
        }
        payload = Object.assign(Object.assign({}, payload), { companyLogo, avatar });
        const updatedUser = yield user_1.UserModel.findOneAndUpdate({ _id: userId }, { $set: payload }, { new: true });
        if (role && ((_a = payload.role) === null || _a === void 0 ? void 0 : _a.length) !== ((_b = user.role) === null || _b === void 0 ? void 0 : _b.length)) {
            let messageHtml = yield ejs_1.default.renderFile(process.cwd() + "/src/views/roleInvitation.ejs", {
                name: `${(user === null || user === void 0 ? void 0 : user.firstName) || ""} ${(user === null || user === void 0 ? void 0 : user.lastName) || ""}`,
            }, { async: true });
            let mailResponse = yield MailerUtilities_1.MailerUtilities.sendSendgridMail({
                recipient_email: [user === null || user === void 0 ? void 0 : user.email],
                subject: "Willkommen in Ihrer neuen Rolle!",
                text: messageHtml,
            });
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateSponsor = updateSponsor;
const updateUserAvatar = (userId, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.UserModel.findById(userId);
        if (!user) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        if (files && files.length) {
            user.image = files[0].filename;
        }
        const updatedUser = yield user.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserAvatar = updateUserAvatar;
const approveUser = (userId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = yield user_1.UserModel.findById(userId);
        const { approved } = bodyData;
        if (!user) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        const updatedUser = yield user_1.UserModel.findOneAndUpdate({ _id: (_a = user === null || user === void 0 ? void 0 : user._id) === null || _a === void 0 ? void 0 : _a.toString() }, { $set: { approved } }, { new: true });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.approveUser = approveUser;
const deleteUser = (userId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.UserModel.findById(userId);
        if (!user) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
            }));
        }
        user.isDeleted = true;
        yield user.save();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.USER_DELETED"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
const getUserSlots = (token, date, req, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const decoded = yield Utilities_1.Utilities.getDecoded(token);
        let response = {};
        const { startTime, endTime } = Utilities_1.Utilities.parseDateWithMoment(date);
        const { duration, roomId } = req.query;
        // default slots
        let defalutSlots = yield defaultSlots_1.defaultSlotsModel.findOne({}).select("slots").lean();
        // if (!defalutSlots) {
        //   throw new HTTP400Error({
        //     responseCode: 400,
        //     responseMessage: config.get("ERRORS.BOOKING.NO_STAFF_DETAILS"),
        //   });
        // }
        defalutSlots = defalutSlots.slots;
        const userSlotsResponse = yield userSlots_1.userSlotsModel.findOne({
            roomId: new mongoose_1.default.Types.ObjectId(roomId),
            date: { $gte: startTime, $lte: endTime },
        });
        if (userSlotsResponse) {
            let appointmentSlots = userSlotsResponse.slots;
            if (appointmentSlots) {
                appointmentSlots = JSON.parse(JSON.stringify(appointmentSlots));
                let combinedSlots = [];
                for (let k = 0; k < defalutSlots.length; k++) {
                    if (appointmentSlots[k] &&
                        appointmentSlots[k].status == "available") {
                        combinedSlots.push(appointmentSlots[k]);
                    }
                    else {
                        combinedSlots.push(Object.assign(Object.assign({}, appointmentSlots[k]), { status: 'unavailable' }));
                    }
                }
                combinedSlots = JSON.parse(JSON.stringify(combinedSlots));
                console.log("2 >>>>>>");
                const result = Utilities_1.Utilities.getAvailableStartingSlots(combinedSlots, parseInt(duration));
                response = JSON.parse(JSON.stringify(result));
            }
        }
        else {
            if (defalutSlots) {
                response = defalutSlots;
                defalutSlots = JSON.parse(JSON.stringify(defalutSlots));
                const result = Utilities_1.Utilities.getAvailableStartingSlots([...defalutSlots], parseInt(duration));
                response = JSON.parse(JSON.stringify(result));
            }
            else {
                throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                    code: 404,
                    message: config_1.default.get("ERRORS.COMMON_ERRORS.NO_SLOT_AVAILABLE"),
                }));
            }
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.SLOTS_ADDED"),
            data: response,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserSlots = getUserSlots;
// export const addSlots = async(decoded:any, req:any, next:any) => {
//   try {
//     const { duration, startSlot, date, eventId, roomId, users } = req.body;
//     const { startTime, endTime } =  Utilities.parseDateWithMoment(date);
//     let consecutiveSlotsNeeded = 0;
//     let response:any = []
//     const event = await EventModel.findOne({_id: new mongoose.Types.ObjectId(eventId)});
//     const eventIndex: any = []
//     let slotId:any = null;
//     const userSlots = await userSlotsModel.findOne({
//       roomId : new mongoose.Types.ObjectId(roomId),
//       date: { $gte: startTime, $lte: endTime }, 
//     });
//     let defalutSlots:any = await defaultSlotsModel.findOne({
//     }).lean();
//     defalutSlots = defalutSlots.slots
//     consecutiveSlotsNeeded = Math.ceil(parseInt(duration) / 30);
//     if (userSlots) {
//       let appointmentSlots:any = userSlots.slots;
//       let index = -1;
//       index = appointmentSlots.findIndex((slot:any) => slot.start === startSlot);
//       if(index != -1) {
//        let validResult: any = Utilities.getValidSlotsAvailable(appointmentSlots, consecutiveSlotsNeeded, index)
//        if (validResult.allAvailable) {
//         let slotDetails:any = []
//         for (let i = 0; i < consecutiveSlotsNeeded; i++) {
//           eventIndex.push(index+i);
//           slotDetails.push(appointmentSlots[index + i]);
//           appointmentSlots[index + i].status = "booked";
//           appointmentSlots[index + i].calenderStartDate = moment(date)
//           if(eventId) appointmentSlots[index + i].eventId = eventId.toString()
//           if(users && users.length) appointmentSlots[index + i].users = [...users, decoded.id];
//         }
//          response = slotDetails;
//          const appointmentUpdate = await userSlotsModel.findOneAndUpdate(
//            {
//             createdBy:new  mongoose.Types.ObjectId(decoded.id),
//             roomId : new mongoose.Types.ObjectId(roomId),
//             date: { $gte: startTime, $lte: endTime }, 
//            },
//            {
//              $set: {
//                slots: appointmentSlots
//              },
//            },
//            {
//              new: true,
//              upsert: false,
//            }
//          );
//          slotId = appointmentUpdate ? new mongoose.Types.ObjectId(appointmentUpdate._id): null;
//        } else {
//         throw new HTTP404Error(
//           Utilities.sendResponsData({
//             code: 404,
//             message: config.get("ERRORS.COMMON_ERRORS.NO_SLOT_AVAILABLE"),
//           })
//         );
//        }
//       }
//     }
//     else {
//       let index = -1;
//       index = defalutSlots.findIndex((slot:any) => slot.start === startSlot);
//       if(index != -1) {
//        let validResult:any = Utilities.getValidSlotsAvailable(defalutSlots, consecutiveSlotsNeeded, index)
//        if(validResult.allAvailable) {
//         let slotDetails = []
//         for(let i=0; i<consecutiveSlotsNeeded; i++){
//           eventIndex.push(index+i);
//           slotDetails.push(defalutSlots[index+i])
//           defalutSlots[index + i].status = "booked";
//           defalutSlots[index + i].calenderStartDate = moment(date);
//           if(eventId) defalutSlots[index + i].eventId = eventId.toString()
//           if(users && users.length) defalutSlots[index + i].users = [...users, decoded.id];
//         }
//         response = slotDetails;
//         let obj = {
//           slots: defalutSlots,
//           duration: duration,
//           createdBy: new mongoose.Types.ObjectId(decoded.id),
//           roomId : new mongoose.Types.ObjectId(roomId),
//           date: moment(date),
//         }
//         const slotResponse = await userSlotsModel.create(obj);
//         slotId = slotResponse ? new mongoose.Types.ObjectId(slotResponse._id): null;
//         }
//        else {
//         throw new HTTP404Error(
//           Utilities.sendResponsData({
//             code: 404,
//             message: config.get("ERRORS.COMMON_ERRORS.SLOT_NOT_AVAILABLE"),
//           })
//         );
//        }
//       }
//     }
//     await EventModel.updateOne({ _id: new mongoose.Types.ObjectId(eventId) }, { $set: { eventIndex, slotId } });
//     return Utilities.sendResponsData({
//       code: 200,
//       message: config.get("ERRORS.COMMON_ERRORS.SLOTS_ADDED"),
//       data: response,
//     });
//   } catch (error) {
//     console.log(error,">>>> error ")
//     next(error);
//   }
// }
const assignedMembers = (userId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const validParticipants = bodyData.filter((user) => mongoose_1.default.Types.ObjectId.isValid(user._id));
        const updatedUser = yield user_1.UserModel.findByIdAndUpdate(userId, {
            $set: { assignendUser: validParticipants },
        }, { new: true });
        if (!updatedUser)
            throw new Error("User not found.");
        let users = yield user_1.UserModel.aggregate([
            {
                $match: { _id: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assignendUser",
                    foreignField: "_id",
                    as: "assignendUser",
                    pipeline: [
                        { $project: { _id: 1, firstName: 1, lastName: 1, email: 1 } },
                    ],
                },
            },
        ]);
        users = ((_a = users[0]) === null || _a === void 0 ? void 0 : _a.assignendUser) || [];
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.MEMBER_ASSIGNED"),
            data: users,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.assignedMembers = assignedMembers;
const assignedMembersRecords = (userId, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let users = yield user_1.UserModel.aggregate([
            {
                $match: { _id: new mongoose_1.default.Types.ObjectId(userId) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assignendUser",
                    foreignField: "_id",
                    as: "assignendUser",
                    pipeline: [
                        { $project: { _id: 1, firstName: 1, lastName: 1, email: 1 } },
                    ],
                },
            }
        ]);
        users = ((_a = users[0]) === null || _a === void 0 ? void 0 : _a.assignendUser) || [];
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.MEMBER_ASSIGNED"),
            data: users,
            success: true,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.assignedMembersRecords = assignedMembersRecords;
//# sourceMappingURL=controller.js.map