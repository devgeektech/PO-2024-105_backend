"use strict";
const success = (res, message, code) => {
    res.status(code).json({
        is_success: true,
        message: message,
        responseCode: code,
    });
};
const data = (res, item, code, message = "") => {
    res.status(code).json({
        is_success: true,
        data: item,
        message: message,
        responseCode: code,
    });
};
const linkData = (res, item, code, link = "") => {
    res.status(code).json({
        is_success: true,
        data: item,
        link: link,
        responseCode: code,
    });
};
const token = (res, item, code) => {
    res.status(code).json({
        is_success: true,
        token: item,
        responseCode: code,
    });
};
const failure = (res, error, code) => {
    res.status(code).json({
        is_success: false,
        message: error.message ? error.message : error,
        responseCode: code,
    });
};
const page = (res, items, total, page_no, code, type = "") => {
    res.status(code).json({
        is_success: true,
        data: {
            items: items,
            skip: page_no || 0,
            userType: type,
            total: total || items.length,
        },
        responseCode: code,
    });
};
module.exports = {
    success,
    data,
    token,
    failure,
    page,
    linkData,
};
//# sourceMappingURL=res.js.map