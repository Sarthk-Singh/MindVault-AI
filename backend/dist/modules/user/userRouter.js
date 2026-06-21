"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../auth/authMiddleware");
const userController_1 = require("./userController");
exports.userRouter = (0, express_1.Router)();
exports.userRouter.use(authMiddleware_1.verifyToken);
exports.userRouter.get("/search", userController_1.userController.searchUserById);
