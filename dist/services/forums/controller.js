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
exports.deleteForumAdmin = exports.updateForumAdmin = exports.addNewReply = exports.deleteComment = exports.updateComment = exports.addNewComment = exports.voteReply = exports.voteComment = exports.voteForum = exports.deleteForum = exports.updateForum = exports.addNewForum = exports.getAllMyForum = exports.getForumById = exports.getAllForum = void 0;
const config_1 = __importDefault(require("config"));
const httpErrors_1 = require("../../utils/httpErrors");
const Utilities_1 = require("../../utils/Utilities");
const Forum_1 = require("../../db/Forum");
const Comments_1 = require("../../db/Comments");
const Reply_1 = require("../../db/Reply");
const getAllForum = (queryData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = queryData;
        let query = {
            isDeleted: false
        };
        if (search) {
            query["$or"] = [
                { title: new RegExp(search, 'i') }
            ];
        }
        const forum = yield Forum_1.ForumModel.find(query).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar",
            },
            {
                path: "comments",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                    {
                        path: "replies",
                        populate: [
                            {
                                path: "addedBy",
                                select: "firstName lastName avatar",
                            },
                        ]
                    }
                ]
            }
        ]).skip(Number((page - 1) * limit)).limit(Number(limit)).sort({ createdAt: -1 });
        const totalRecord = yield Forum_1.ForumModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_ADDED_SUCCESSFULLY"),
            data: forum,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllForum = getAllForum;
const getForumById = (forumId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let query = {
            isDeleted: false,
            _id: forumId
        };
        const forum = yield Forum_1.ForumModel.findOne(query).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar description",
            },
            {
                path: "comments",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                    {
                        path: "replies",
                        populate: [
                            {
                                path: "addedBy",
                                select: "firstName lastName avatar",
                            },
                        ]
                    }
                ]
            }
        ]).lean();
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "",
            data: forum,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getForumById = getForumById;
const getAllMyForum = (userId, queryData, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { limit, page, search } = queryData;
        let query = {
            isDeleted: false,
            createdBy: userId
        };
        if (search) {
            query["$or"] = [
                { title: new RegExp(search, 'i') }
            ];
        }
        const forum = yield Forum_1.ForumModel.find(query).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar",
            },
            {
                path: "comments",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                    {
                        path: "replies",
                        populate: [
                            {
                                path: "addedBy",
                                select: "firstName lastName avatar",
                            },
                        ]
                    }
                ]
            }
        ]).skip(Number((page - 1) * limit)).limit(Number(limit)).sort({ createdAt: -1 });
        const totalRecord = yield Forum_1.ForumModel.countDocuments(query);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_ADDED_SUCCESSFULLY"),
            data: forum,
            totalRecord
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMyForum = getAllMyForum;
const addNewForum = (userId, bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let { title, description } = bodyData;
        let image;
        if (files === null || files === void 0 ? void 0 : files.length) {
            image = (_a = files[0]) === null || _a === void 0 ? void 0 : _a.filename;
        }
        const forum = yield (yield Forum_1.ForumModel.create({
            title, description, image, createdBy: userId
        })).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar",
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_ADDED_SUCCESSFULLY"),
            data: forum
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addNewForum = addNewForum;
const updateForum = (userId, forumId, bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const checkExistence = yield Forum_1.ForumModel.exists({ createdBy: userId, _id: forumId, isDeleted: false });
        if (!checkExistence) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_NOT_FOUND"),
            }));
        }
        let { title, description } = bodyData;
        let image;
        if (files === null || files === void 0 ? void 0 : files.length) {
            image = (_a = files[0]) === null || _a === void 0 ? void 0 : _a.filename;
        }
        const forum = yield Forum_1.ForumModel.findOneAndUpdate({ _id: forumId, isDeleted: false }, {
            $set: {
                title, description, image
            }
        }, { new: true }).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar",
            },
            {
                path: "comments",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                    {
                        path: "replies",
                        populate: [
                            {
                                path: "addedBy",
                                select: "firstName lastName avatar",
                            },
                        ]
                    }
                ]
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: forum
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateForum = updateForum;
const deleteForum = (userId, forumId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkExistence = yield Forum_1.ForumModel.exists({ createdBy: userId, _id: forumId, isDeleted: false });
        if (!checkExistence) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_NOT_FOUND"),
            }));
        }
        yield Forum_1.ForumModel.findOneAndUpdate({ _id: forumId, isDeleted: false }, {
            $set: {
                isDeleted: true,
            }
        });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_DELETED_SUCCESSFULLY"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteForum = deleteForum;
// vote on forum
const voteForum = (userId, forumId, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const checkExistence = yield Forum_1.ForumModel.findOne({ _id: forumId, isDeleted: false });
        if (!checkExistence) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_NOT_FOUND"),
            }));
        }
        if ((_a = checkExistence.votes) === null || _a === void 0 ? void 0 : _a.includes(userId)) {
            yield Forum_1.ForumModel.updateOne({ _id: forumId, isDeleted: false }, {
                $pull: {
                    votes: userId
                }
            });
        }
        else {
            yield Forum_1.ForumModel.updateOne({ _id: forumId, isDeleted: false }, {
                $addToSet: {
                    votes: userId
                }
            });
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_UPDATED_SUCCESSFULLY"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.voteForum = voteForum;
// vote on comment
const voteComment = (userId, commentId, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const checkExistence = yield Comments_1.CommentModel.findOne({ _id: commentId });
        if (!checkExistence) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.COMMENT_NOT_FOUND"),
            }));
        }
        if ((_a = checkExistence.votes) === null || _a === void 0 ? void 0 : _a.includes(userId)) {
            yield Comments_1.CommentModel.updateOne({ _id: commentId }, {
                $pull: {
                    votes: userId
                }
            });
        }
        else {
            yield Comments_1.CommentModel.updateOne({ _id: commentId }, {
                $addToSet: {
                    votes: userId
                }
            });
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_UPDATED_SUCCESSFULLY"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.voteComment = voteComment;
// vote on comment
const voteReply = (userId, replyId, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const checkExistence = yield Reply_1.ReplyModel.findOne({ _id: replyId });
        if (!checkExistence) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_NOT_FOUND"),
            }));
        }
        if ((_a = checkExistence.votes) === null || _a === void 0 ? void 0 : _a.includes(userId)) {
            yield Reply_1.ReplyModel.updateOne({ _id: replyId }, {
                $pull: {
                    votes: userId
                }
            });
        }
        else {
            yield Reply_1.ReplyModel.updateOne({ _id: replyId }, {
                $addToSet: {
                    votes: userId
                }
            });
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_UPDATED_SUCCESSFULLY"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.voteReply = voteReply;
// comments 
const addNewComment = (userId, bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let { message, forumId } = bodyData;
        let image;
        if (files === null || files === void 0 ? void 0 : files.length) {
            image = (_a = files[0]) === null || _a === void 0 ? void 0 : _a.filename;
        }
        const comment = yield Comments_1.CommentModel.create({
            message, image, addedBy: userId, forumId
        });
        const forum = yield Forum_1.ForumModel.findOneAndUpdate({ _id: forumId, isDeleted: false }, {
            $push: {
                comments: (_b = comment === null || comment === void 0 ? void 0 : comment._id) === null || _b === void 0 ? void 0 : _b.toString()
            }
        }, { new: true }).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar",
            },
            {
                path: "comments",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                    {
                        path: "replies",
                        populate: [
                            {
                                path: "addedBy",
                                select: "firstName lastName avatar",
                            },
                        ]
                    }
                ]
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_ADDED_SUCCESSFULLY"),
            data: forum
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addNewComment = addNewComment;
const updateComment = (userId, commentId, bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let { message } = bodyData;
        let image;
        if (files === null || files === void 0 ? void 0 : files.length) {
            image = (_a = files[0]) === null || _a === void 0 ? void 0 : _a.filename;
        }
        const comment = yield Comments_1.CommentModel.findOneAndUpdate({ _id: commentId }, {
            message, image
        });
        if (!comment) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.COMMENT_NOT_FOUND"),
            }));
        }
        const forum = yield Forum_1.ForumModel.findOne({ _id: comment === null || comment === void 0 ? void 0 : comment.forumId, isDeleted: false }).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar",
            },
            {
                path: "comments",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                    {
                        path: "replies",
                        populate: [
                            {
                                path: "addedBy",
                                select: "firstName lastName avatar",
                            },
                        ]
                    }
                ]
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_ADDED_SUCCESSFULLY"),
            data: forum
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateComment = updateComment;
const deleteComment = (userId, commentId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const comment = yield Comments_1.CommentModel.findOneAndDelete({ _id: commentId, addedBy: userId });
        if (!comment) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.COMMENT_NOT_FOUND"),
            }));
        }
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.COMMENT_DELETED_SUCCESSFULLY"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteComment = deleteComment;
// reply section
const addNewReply = (userId, bodyData, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let { message, commentId } = bodyData;
        const reply = yield Reply_1.ReplyModel.create({
            message, createdBy: userId, commentId
        });
        const comment = yield Comments_1.CommentModel.findOneAndUpdate({ _id: commentId }, {
            $push: {
                replies: (_a = reply === null || reply === void 0 ? void 0 : reply._id) === null || _a === void 0 ? void 0 : _a.toString()
            }
        }, { new: true }).populate([
            {
                path: "addedBy",
                select: "firstName lastName avatar",
            },
            {
                path: "replies",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                ]
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_ADDED_SUCCESSFULLY"),
            data: comment
        });
    }
    catch (error) {
        next(error);
    }
});
exports.addNewReply = addNewReply;
const updateForumAdmin = (forumId, bodyData, files, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const checkExistence = yield Forum_1.ForumModel.exists({ _id: forumId, isDeleted: false });
        if (!checkExistence) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_NOT_FOUND"),
            }));
        }
        let { title, description } = bodyData;
        let image;
        if (files === null || files === void 0 ? void 0 : files.length) {
            image = (_a = files[0]) === null || _a === void 0 ? void 0 : _a.filename;
        }
        const forum = yield Forum_1.ForumModel.findOneAndUpdate({ _id: forumId, isDeleted: false }, {
            $set: {
                title, description, image
            }
        }, { new: true }).populate([
            {
                path: "createdBy",
                select: "firstName lastName avatar",
            },
            {
                path: "comments",
                populate: [
                    {
                        path: "addedBy",
                        select: "firstName lastName avatar",
                    },
                ]
            }
        ]);
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: "Success",
            data: forum
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateForumAdmin = updateForumAdmin;
const deleteForumAdmin = (forumId, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkExistence = yield Forum_1.ForumModel.exists({ _id: forumId, isDeleted: false });
        if (!checkExistence) {
            throw new httpErrors_1.HTTP404Error(Utilities_1.Utilities.sendResponsData({
                code: 404,
                message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_NOT_FOUND"),
            }));
        }
        yield Forum_1.ForumModel.findOneAndUpdate({ _id: forumId, isDeleted: false }, {
            $set: {
                isDeleted: true,
            }
        });
        return Utilities_1.Utilities.sendResponsData({
            code: 200,
            message: config_1.default.get("ERRORS.COMMON_ERRORS.FORUM_DELETED_SUCCESSFULLY"),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteForumAdmin = deleteForumAdmin;
//# sourceMappingURL=controller.js.map