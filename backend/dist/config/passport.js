"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("./env");
const prisma_1 = require("./prisma");
const authService_1 = require("../modules/auth/authService");
if (env_1.env.GOOGLE_CLIENT_ID && env_1.env.GOOGLE_CLIENT_SECRET) {
    passport_1.default.use(new passport_google_oauth20_1.Strategy({
        clientID: env_1.env.GOOGLE_CLIENT_ID,
        clientSecret: env_1.env.GOOGLE_CLIENT_SECRET,
        callbackURL: env_1.env.GOOGLE_CALLBACK_URL,
    }, async (_accessToken, _refreshToken, profile, done) => {
        try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
                return done(new Error("No email found in Google profile"));
            }
            let user = await prisma_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                // Generate a secure random password
                const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const hashedPassword = await bcryptjs_1.default.hash(randomPassword, 12);
                const userId = "MV-" + Math.floor(1000 + Math.random() * 9000).toString();
                user = await prisma_1.prisma.user.create({
                    data: {
                        userId,
                        name: profile.displayName || "Google User",
                        email,
                        password: hashedPassword,
                        role: "TEAM_MEMBER",
                        isGoogleUser: true
                    }
                });
            }
            // Generate tokens
            const tokens = (0, authService_1.createTokens)({
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name,
                isGoogleUser: user.isGoogleUser,
                userId: user.userId
            });
            // Pass user along with tokens to callback
            return done(null, {
                ...user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken
            });
        }
        catch (error) {
            return done(error);
        }
    }));
}
else {
    console.warn("Google OAuth credentials are not set. Google Sign-In will be disabled.");
}
