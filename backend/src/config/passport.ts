import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { env } from "./env";
import { prisma } from "./prisma";
import { createTokens } from "../modules/auth/authService";

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Generate a secure random password
            const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const hashedPassword = await bcrypt.hash(randomPassword, 12);
            const userId = "MV-" + Math.floor(1000 + Math.random() * 9000).toString();

            user = await prisma.user.create({
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
          const tokens = createTokens({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            isGoogleUser: user.isGoogleUser
          });

          // Pass user along with tokens to callback
          return done(null, {
            ...user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken
          });
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth credentials are not set. Google Sign-In will be disabled.");
}
