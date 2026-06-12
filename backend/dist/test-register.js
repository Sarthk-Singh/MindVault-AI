"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authService_1 = require("./modules/auth/authService");
async function test() {
    try {
        console.log("Starting test registration...");
        const result = await authService_1.authService.register("Test Admin", "testadmin@company.com", "password123", "ADMIN");
        console.log("Registration success:", result);
    }
    catch (error) {
        console.error("Registration failed with error:", error);
    }
}
test();
