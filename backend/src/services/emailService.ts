import nodemailer from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.googleSMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465 || env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  }
});

const SENDER = `"MindVault AI" <${env.SMTP_USER}>`;

export const emailService = {
  async sendWorkspaceInviteEmail(
    toEmail: string,
    workspaceName: string,
    inviterName: string,
    inviteUrl: string
  ): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Workspace Invitation - MindVault AI</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #0b0f19;
              color: #f1f5f9;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #111827;
              border: 1px solid #1f2937;
              border-radius: 16px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #38bdf8;
              margin-bottom: 24px;
              text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
            }
            h1 {
              font-size: 20px;
              color: #ffffff;
              margin-bottom: 16px;
            }
            p {
              font-size: 14px;
              color: #94a3b8;
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%);
              color: #ffffff !important;
              text-decoration: none;
              font-size: 14px;
              font-weight: 600;
              padding: 14px 30px;
              border-radius: 12px;
              box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.3);
              transition: transform 0.2s ease;
            }
            .footer {
              margin-top: 40px;
              font-size: 11px;
              color: #64748b;
              border-top: 1px solid #1f2937;
              padding-top: 24px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">MindVault AI</div>
            <h1>Workspace Invitation</h1>
            <p>
              <strong>${inviterName}</strong> has invited you to join the workspace <strong>${workspaceName}</strong> on MindVault AI.
            </p>
            <a href="${inviteUrl}" class="button" target="_blank">Join Workspace</a>
            <div class="footer">
              If you didn't expect this invitation, you can safely ignore this email.<br>
              &copy; ${new Date().getFullYear()} MindVault AI. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: SENDER,
      to: toEmail,
      subject: `${inviterName} invited you to join ${workspaceName} on MindVault AI`,
      html: htmlContent
    });
  },

  async sendPasswordResetEmail(toEmail: string, resetUrl: string): Promise<void> {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password - MindVault AI</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #0b0f19;
              color: #f1f5f9;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 40px auto;
              background-color: #111827;
              border: 1px solid #1f2937;
              border-radius: 16px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #38bdf8;
              margin-bottom: 24px;
              text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
            }
            h1 {
              font-size: 20px;
              color: #ffffff;
              margin-bottom: 16px;
            }
            p {
              font-size: 14px;
              color: #94a3b8;
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%);
              color: #ffffff !important;
              text-decoration: none;
              font-size: 14px;
              font-weight: 600;
              padding: 14px 30px;
              border-radius: 12px;
              box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.3);
              transition: transform 0.2s ease;
            }
            .note {
              font-size: 12px;
              color: #f59e0b;
              margin-top: 16px;
            }
            .footer {
              margin-top: 40px;
              font-size: 11px;
              color: #64748b;
              border-top: 1px solid #1f2937;
              padding-top: 24px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">MindVault AI</div>
            <h1>Reset Your Password</h1>
            <p>
              We received a request to reset your password. Click the button below to set up a new password.
            </p>
            <a href="${resetUrl}" class="button" target="_blank">Reset Password</a>
            <div class="note">
              ⚠️ Note: This password reset link will expire in 1 hour.
            </div>
            <div class="footer">
              If you did not request a password reset, please ignore this email.<br>
              &copy; ${new Date().getFullYear()} MindVault AI. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: SENDER,
      to: toEmail,
      subject: "Reset your MindVault AI password",
      html: htmlContent
    });
  }
};
