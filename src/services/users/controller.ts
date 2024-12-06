import mongoose from 'mongoose';
import config from "config";
import ejs from "ejs";
import { HTTP400Error, HTTP404Error } from "../../utils/httpErrors";
import { UserModel } from "../../db/user";
import { Utilities } from "../../utils/Utilities";
import { MailerUtilities } from '../../utils/MailerUtilities';
import { defaultSlotsModel } from '../../db/defaultSlots';
import { userSlotsModel } from '../../db/userSlots';
import moment from 'moment';

//  common api for users
export const getAllUsers = async (auth: any, req: any, next: any) => {
  try {
    const { limit, page, search } = req.query;
    let query: any = {
      isDeleted: false,
      isSuperUser: { $ne: true },
      _id: { $ne: new mongoose.Types.ObjectId(auth?.id) }
    };

    if (search) {
      query["$or"] = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }
    const users = await UserModel.aggregate([
      {
        $match: {
          ...query,
        }
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
    ])
    const totalRecord = await UserModel.countDocuments(query);
    return Utilities.sendResponsData({
      code: 200,
      message: "Success",
      data: users,
      totalRecord
    });
  } catch (error) {
    next(error);
  }
};

export const getAllMembers = async (auth: any, req: any, next: any) => {
  try {
    const { limit, page, search, id } = req.query;
    let query: any = {
      approved: true,
      isDeleted: false,
      role:{$in:['member','sponsor','trainer']},
      isSuperUser: { $ne: true },
      _id: { $ne: new mongoose.Types.ObjectId(id ? id: auth?.id) }
    };

    if (search) {
      query["$or"] = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
      ];
    }
    const users = await UserModel.aggregate([
      {
        $match: {
          ...query,
        }
      },
      {
        $skip: Number((page - 1) * limit)
      },
      {
        $limit: Number(limit),
      }
    ])
    const totalRecord = await UserModel.countDocuments(query);
    return Utilities.sendResponsData({
      code: 200,
      message: "Success",
      data: users,
      totalRecord
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTrainers = async (next: any) => {
  try {
    let query: any = {
      approved: true,
      isDeleted: false,
      role:{$in:['trainer']},
      isSuperUser: { $ne: true }
    };

    const users = await UserModel.aggregate([
      {
        $match: {
          ...query,
        }
      },
      {
        $project:{
          firstName: 1,
          lastName: 1,
          avatar: 1,
          _id: 1
        }
      }
    ])
    const totalRecord = await UserModel.countDocuments(query);
    return Utilities.sendResponsData({
      code: 200,
      message: "Success",
      data: users,
      totalRecord
    });
  } catch (error) {
    next(error);
  }
};
// get all approved users for exports
export const getAllUsersForExport = async (next: any) => {
  try {
    let query: any = {
      isDeleted: false,
      approved: true
    };
    const users = await UserModel.aggregate([
      {
        $match: {
          ...query,
        }
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
    ])
    return Utilities.sendResponsData({
      code: 200,
      message: "Success",
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProfileById = async (userId: any, next: any) => {
  try {
    let user = await UserModel.findById(userId).select("-password").lean();
    if (!user) {
      throw new HTTP404Error(
        Utilities.sendResponsData({
          code: 404,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
        })
      );
    }

    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.USER_ADDED"),
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


export const addUser = async (bodyData: any, files:any, next: any) => {
  try {
    let checkExist = await UserModel.exists({ email: bodyData.email });
    if (checkExist) {
      throw new HTTP400Error(
        Utilities.sendResponsData({
          code: 400,
          message: config.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
        })
      );
    }
    const pass: any = await Utilities.cryptPassword(bodyData.password);
    if (files && files.length) {
      bodyData.avatar = files[0].filename;
    }
    bodyData.password = pass;
    bodyData.role= JSON.parse(bodyData.role);
    const result = await UserModel.create(bodyData);
    
    let messageHtml = await ejs.renderFile(
      process.cwd() + "/src/views/welcome.ejs",
      {
        name: `${bodyData?.firstName||""} ${bodyData?.lastName||""}`
      },
      { async: true }
    );
    let mailResponse = await MailerUtilities.sendSendgridMail({
      recipient_email: [bodyData?.email],
      subject: "Willkommens-E-Mail",
      text: messageHtml,
    });

    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.USER_ADDED"),
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (userId: any, bodyData: any, files:any, next: any) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new HTTP404Error(
        Utilities.sendResponsData({
          code: 404,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
        })
      );
    }

    if (bodyData.email && bodyData.email !== user.email) {
      const emailExists = await UserModel.exists({ email: bodyData.email });
      if (emailExists) {
        throw new HTTP400Error(
          Utilities.sendResponsData({
            code: 400,
            message: config.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
          })
        );
      }
    }
    const { firstName, lastName, email, phone, gender, role, dob, street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry,
      bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails, description, parentEmail,parentFirstName,
      parentLastName,parentPhone, parentRelatation,bloodGroup
    } = bodyData;

    let payload:any = {
      firstName, lastName, email, phone, gender, dob,
      parentEmail,parentFirstName,parentLastName,parentPhone, parentRelatation,
      street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry,
      bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails,
      bloodGroup
    }
    if(role){
      payload.role= JSON.parse(role);
    }
    if(description){
      payload.description = description;
    }
    let matchPermissionDoc,clubTransferDoc,birthCertificateDoc,residenceCertificateDoc,
    playersParentDeclarationDoc,copyOfPassportDoc,attachmentArgentinaDoc,attachmentIstupnicaDoc,
    attachmentBrisovnicaDoc,avatar;
  if(files && files?.length){
    for(let file of files){
      if(file.fieldname=='matchPermissionDoc'){
        matchPermissionDoc= file?.filename;
      }else if(file.fieldname=='clubTransferDoc'){
        clubTransferDoc= file?.filename;
      }if(file.fieldname=='birthCertificateDoc'){
        birthCertificateDoc= file?.filename;
      }if(file.fieldname=='residenceCertificateDoc'){
        residenceCertificateDoc= file?.filename;
      }if(file.fieldname=='playersParentDeclarationDoc'){
        playersParentDeclarationDoc= file?.filename;
      }if(file.fieldname=='copyOfPassportDoc'){
        copyOfPassportDoc= file?.filename;
      }if(file.fieldname=='attachmentArgentinaDoc'){
        attachmentArgentinaDoc= file?.filename;
      }if(file.fieldname=='attachmentIstupnicaDoc'){
        attachmentIstupnicaDoc= file?.filename;
      }if(file.fieldname=='attachmentBrisovnicaDoc'){
        attachmentBrisovnicaDoc= file?.filename;
      }if(file.fieldname=='avatar'){
        avatar= file?.filename;
      }
    }
  }
    payload={
      ...payload,
      matchPermissionDoc,clubTransferDoc,birthCertificateDoc,residenceCertificateDoc,
      playersParentDeclarationDoc,copyOfPassportDoc,attachmentArgentinaDoc,attachmentIstupnicaDoc,
      attachmentBrisovnicaDoc, avatar
    }
    const updatedUser = await UserModel.findOneAndUpdate({ _id: userId }, { $set: payload }, { new: true });

    if(role && payload.role?.length !== user.role?.length){
      let messageHtml = await ejs.renderFile(
        process.cwd() + "/src/views/roleInvitation.ejs",
        {
          name: `${user?.firstName||""} ${user?.lastName||""}`,
        },
        { async: true }
      );
      let mailResponse = await MailerUtilities.sendSendgridMail({
        recipient_email: [user?.email],
        subject: "Willkommen in Ihrer neuen Rolle!",
        text: messageHtml,
      });
    }
    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSponsor = async (userId: any, bodyData: any, files:any, next: any) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new HTTP404Error(
        Utilities.sendResponsData({
          code: 404,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
        })
      );
    }
 
    if (bodyData.email && bodyData.email !== user.email) {
      const emailExists = await UserModel.exists({ email: bodyData.email });
      if (emailExists) {
        throw new HTTP400Error(
          Utilities.sendResponsData({
            code: 400,
            message: config.get("ERRORS.COMMON_ERRORS.USER_EXISTS"),
          })
        );
      }
    }
    const { firstName, lastName, email, phone, gender, role, dob, street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry,
      bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails, description,
      companyName,websiteUrl,offerings,companyDescription,companyEmail, companyPhone,
    } = bodyData;

    let payload:any = {
      firstName, lastName, email, phone, gender, dob,
      street, houseNumber, zipCode, city, birthPlaceCity, birthPlaceCountry,
      bankName, iban, bic, accountHolder, subscription, visibility, onVocation, siblingDetails,
      companyName,websiteUrl,offerings,companyDescription,companyEmail, companyPhone
    }
    if(role) {
      payload.role= JSON.parse(role);
    }
    if(description){
      payload.description = description;
    }
    let companyLogo, avatar;
    if(files && files?.length){
    for(let file of files){
      if(file.fieldname=='companyLogo') {
        companyLogo = file?.filename;
      }
      if(file.fieldname=='avatar'){
        avatar = file?.filename;
      }
    }
  }
    payload={
      ...payload,
      companyLogo, avatar
    }
    const updatedUser = await UserModel.findOneAndUpdate({ _id: userId }, { $set: payload }, { new: true });

    if(role && payload.role?.length !== user.role?.length){
      let messageHtml = await ejs.renderFile(
        process.cwd() + "/src/views/roleInvitation.ejs",
        {
          name: `${user?.firstName||""} ${user?.lastName||""}`,
        },
        { async: true }
      );
      let mailResponse = await MailerUtilities.sendSendgridMail({
        recipient_email: [user?.email],
        subject: "Willkommen in Ihrer neuen Rolle!",
        text: messageHtml,
      });
    }
    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};


export const updateUserAvatar = async (userId: any, files: any, next: any) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new HTTP404Error(
        Utilities.sendResponsData({
          code: 404,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
        })
      );
    }
    if (files && files.length) {
      user.image = files[0].filename;
    }
    const updatedUser = await user.save();
    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const approveUser = async (userId: any, bodyData: any, next: any) => {
  try {
    const user = await UserModel.findById(userId);
    const { approved } = bodyData;
    if (!user) {
      throw new HTTP404Error(
        Utilities.sendResponsData({
          code: 404,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
        })
      );
    }
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user?._id?.toString() },
      { $set: { approved } },
      { new: true }
    )
    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.USER_UPDATED"),
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (userId: string, next: any) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new HTTP404Error(
        Utilities.sendResponsData({
          code: 404,
          message: config.get("ERRORS.COMMON_ERRORS.USER_NOT_FOUND"),
        })
      );
    }

    user.isDeleted = true;
    await user.save();

    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.USER_DELETED"),
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSlots = async(token:any, date:string, req:any, next: any) => {
  try {
    const decoded: any = await Utilities.getDecoded(token);
    let response = {};

    const { startTime, endTime } = Utilities.parseDateWithMoment(date);

    const { duration, roomId } = req.query; 

    // default slots
    let defalutSlots:any = await defaultSlotsModel.findOne({}).select("slots").lean();

    // if (!defalutSlots) {
    //   throw new HTTP400Error({
    //     responseCode: 400,
    //     responseMessage: config.get("ERRORS.BOOKING.NO_STAFF_DETAILS"),
    //   });
    // }

    defalutSlots = defalutSlots.slots;

    const userSlotsResponse = await userSlotsModel.findOne({
      roomId:new  mongoose.Types.ObjectId(roomId),
      date: { $gte: startTime, $lte: endTime },
    });

    if (userSlotsResponse) {
      let appointmentSlots = userSlotsResponse.slots;
      if (appointmentSlots) {
        appointmentSlots = JSON.parse(JSON.stringify(appointmentSlots));
          let combinedSlots: any = [];
          for (let k = 0; k < defalutSlots.length; k++) {
            if (
              appointmentSlots[k] &&
              appointmentSlots[k].status == "available" 
              )
             {
              combinedSlots.push(appointmentSlots[k]);
            }
            else {
              combinedSlots.push({...appointmentSlots[k], status:'unavailable'})
            }
          }
          combinedSlots = JSON.parse(JSON.stringify(combinedSlots));
          console.log("2 >>>>>>")
          const result =  Utilities.getAvailableStartingSlots(combinedSlots, parseInt(duration));

          response = JSON.parse(JSON.stringify(result));
      }
    } else {
      if (defalutSlots){ 
          response = defalutSlots;
          defalutSlots = JSON.parse(JSON.stringify(defalutSlots));
          const result = Utilities.getAvailableStartingSlots([...defalutSlots], parseInt(duration));
          response = JSON.parse(JSON.stringify(result));
      } else {
        throw new HTTP404Error(
          Utilities.sendResponsData({
            code: 404,
            message: config.get("ERRORS.COMMON_ERRORS.NO_SLOT_AVAILABLE"),
          })
        );
      }
    }

    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.SLOTS_ADDED"),
      data: response,
    });
  } catch (error) {
    next(error);
  }
}

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


export const assignedMembers = async (userId: any, bodyData: any, next: any) => {
  try {
    const validParticipants = bodyData.filter((user: any) =>
      mongoose.Types.ObjectId.isValid(user._id)
    );

    const updatedUser = await UserModel.findByIdAndUpdate(userId, {
      $set: { assignendUser: validParticipants },
    }, { new: true });

    if (!updatedUser) throw new Error("User not found.");

    let users = await UserModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
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
    users= users[0]?.assignendUser||[]; 
    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.MEMBER_ASSIGNED"),
      data: users,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const assignedMembersRecords = async (userId: any,  next: any) => {
  try {
    let users = await UserModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(userId) },
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
    users= users[0]?.assignendUser||[]; 

    return Utilities.sendResponsData({
      code: 200,
      message: config.get("ERRORS.COMMON_ERRORS.MEMBER_ASSIGNED"),
      data: users,
      success: true,
    });

  } catch (error) {
    next(error);
  }
};