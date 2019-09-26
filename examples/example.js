"use strict";
exports.__esModule = true;
var create_ts_1 = require("../create.ts");
var create_ts_2 = require("../create.ts");
var validate_ts_1 = require("../validate.ts");
var claims = {
    iss: "joe",
    exp: create_ts_2.setExpiration(new Date().getTime() + 1000),
    jti: ["jj"]
};
var headerObject = {
    alg: "HS256",
    typ: "JWT",
    crit: ["dummy"]
};
var handlers = {
    exp: function (header) {
        return (header.exp = "2019-12-09");
    },
    dummy: function (header) {
        console.log("dummy works");
        return 100;
    }
};
var key = "abcdef";
try {
    var jwt = create_ts_1["default"](headerObject, claims, key);
    var validatedJwt = validate_ts_1["default"](jwt, key, true, handlers);
    console.log(jwt);
    console.log(validatedJwt);
    validatedJwt.then(console.log);
}
catch (err) {
    console.log(err);
}
