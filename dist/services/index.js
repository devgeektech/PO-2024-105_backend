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
const routes_6 = __importDefault(require("./adminWeb/partners/routes"));
const routes_7 = __importDefault(require("./partner/routes"));
const routes_8 = __importDefault(require("./adminWeb/company/routes"));
exports.default = [
    ...routes_1.default,
    ...routes_2.default,
    ...routes_3.default,
    ...routes_4.default,
    ...routes_5.default,
    ...routes_6.default,
    ...routes_7.default,
    ...routes_8.default
];
//# sourceMappingURL=index.js.map