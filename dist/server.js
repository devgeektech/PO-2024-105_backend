"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const utils_1 = require("./utils");
const middleware_1 = __importDefault(require("./middleware"));
const errorHandlers_1 = __importDefault(require("./middleware/errorHandlers"));
const services_1 = __importDefault(require("./services"));
const mongoose = require("mongoose");
const config_1 = __importDefault(require("config"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
require("dotenv/config");
const { Server } = require("socket.io");
const defaultCreate_1 = require("./middleware/defaultCreate");
const router = (0, express_1.default)();
router.set('views', path_1.default.join(__dirname, 'views'));
router.set("view engine", "ejs");
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            cb(null, "temp/");
        },
        filename: (req, file, cb) => {
            let customFileName = Date.now();
            let fileExtension = path_1.default.extname(file.originalname).split('.')[1];
            cb(null, customFileName + '.' + fileExtension);
        }
    })
});
router.use(upload.any());
router.use(express_1.default.static('./temp'));
(0, utils_1.applyMiddleware)(middleware_1.default, router);
(0, utils_1.applyRoutes)(services_1.default, router);
(0, utils_1.applyMiddleware)(errorHandlers_1.default, router);
(0, defaultCreate_1.defaultCreates)();
const PORT = config_1.default.get("MONGO_CRED.PORT") || 9000;
exports.server = http_1.default.createServer(router);
exports.io = new Server(exports.server, {
    cors: {
        origin: config_1.default.get("SITE_URL"), // Allow requests from this origin and my frontend port = 5173
        methods: ["GET", "POST"], // Allow these HTTP methods
    },
});
mongoose
    .connect(`${config_1.default.get("MONGO_CRED.MONGO_PATH")}/${config_1.default.get("MONGO_CRED.DATABASE")}`, {})
    .then(() => {
    exports.server.listen(PORT);
    console.log(`Server is running http://localhost:${PORT}...`);
    // Utilities.createDefaultSlotsIfNotExists()
})
    .catch((err) => {
    console.log(err, "server.js file");
});
//# sourceMappingURL=server.js.map