"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const multer_1 = __importDefault(require("multer"));
const AWS = __importStar(require("aws-sdk"));
const config_1 = __importDefault(require("config"));
const path_1 = __importDefault(require("path"));
const options = {
    secretAccessKey: config_1.default.get("AWS.BUCKET.SECRET"),
    accessKeyId: config_1.default.get("AWS.BUCKET.ACCESS_KEY"),
    region: config_1.default.get("AWS.BUCKET.REGION"),
    endpoint: config_1.default.get("AWS.BUCKET.ENDPOINT")
};
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        console.log('MULTER');
        const path = "temp/";
        fs_1.default.mkdirSync(path, { recursive: true });
        return cb(null, path);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({
    storage: storage
});
class FileUpload {
    static delete(type, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            AWS.config.update(options);
            const s3 = new AWS.S3();
            let oldFile;
            oldFile = fileName;
            const params = {
                Bucket: `${config_1.default.get("AWS.BUCKET.NAME")}`,
                Key: `${oldFile}`
                // Key: `${type}/${fileName}`
            };
            try {
                yield s3.deleteObject(params).promise();
                return true;
            }
            catch (err) {
                return false;
            }
        });
    }
}
exports.FileUpload = FileUpload;
_a = FileUpload;
FileUpload.uploadFileToAWS = (file, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
            const source = `temp/${file.filename}`;
            const fileContent = fs_1.default.readFileSync(source);
            AWS.config.update(options);
            const s3 = new AWS.S3({
                s3ForcePathStyle: true,
            });
            const fileExt = path_1.default.extname(file.originalname);
            const fileRandomName = (0, uuid_1.v4)();
            const fileName = file === null || file === void 0 ? void 0 : file.originalname.split('.')[0];
            let newName;
            if (file.mimetype.indexOf('image/') > -1) {
                newName = `${fileName}.png`;
            }
            else {
                newName = `${fileName}${fileExt}`;
            }
            let s3Params = {
                ContentType: `${file.mimetype}`,
                Bucket: "sports-club-storage",
                Body: fileContent,
                Key: `${newName}`,
            };
            try {
                let data = s3.upload(s3Params).promise();
                resolve(data);
            }
            catch (err) {
                console.log("erroris", err);
            }
        }));
    }
    catch (err) {
        console.log('value of error is', err);
    }
});
//# sourceMappingURL=FileUploadUtilities.js.map