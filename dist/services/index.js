"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const routes_1 = __importDefault(require("./auth/routes"));
const routes_2 = __importDefault(require("./users/routes"));
const routes_3 = __importDefault(require("./adminWeb/wellnessTypes/routes"));
const routes_4 = __importDefault(require("./adminWeb/services/routes"));
const routes_5 = __importDefault(require("./adminWeb/subServices/routes"));
exports.default = [
    ...routes_1.default,
    ...routes_2.default,
    ...routes_3.default,
    ...routes_4.default,
    ...routes_5.default
];
//# sourceMappingURL=index.js.map