"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const prisma_1 = require("./config/prisma");
const uploadService_1 = require("./modules/upload/uploadService");
async function main() {
    console.log("[test] Starting screenshot analysis integration test...");
    // 1. Find a meeting
    const meeting = await prisma_1.prisma.meeting.findFirst({
        orderBy: { createdAt: "desc" }
    });
    if (!meeting) {
        console.error("[test] No meetings found in the database. Please run the frontend first to create a workspace/meeting, or create one manually.");
        process.exit(1);
    }
    console.log(`[test] Using meeting ID: ${meeting.id} (${meeting.title})`);
    // 2. Read test screenshot image
    const imagePath = path.join(__dirname, "../../Test-Img&Rec/Screenshot 2026-06-12 at 9.59.07 PM.png");
    if (!fs.existsSync(imagePath)) {
        console.error(`[test] Test image not found at ${imagePath}`);
        process.exit(1);
    }
    const buffer = fs.readFileSync(imagePath);
    const file = {
        fieldname: "file",
        originalname: "login_page_layout.png",
        encoding: "7bit",
        mimetype: "image/png",
        buffer: buffer,
        size: buffer.length,
        stream: null,
        destination: "",
        filename: "",
        path: ""
    };
    // 3. Upload screenshot
    console.log("[test] Uploading screenshot to Cloudinary and database...");
    const screenshot = await uploadService_1.uploadService.uploadScreenshot(meeting.id, file);
    console.log(`[test] Screenshot row created with ID: ${screenshot.id}, waiting for analysis...`);
    // 4. Poll database for analysis results
    const startTime = Date.now();
    const timeoutMs = 45000; // 45 seconds timeout
    let analysisCompleted = false;
    while (Date.now() - startTime < timeoutMs) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const updatedScreenshot = await prisma_1.prisma.screenshot.findUnique({
            where: { id: screenshot.id }
        });
        if (updatedScreenshot && updatedScreenshot.ocrText) {
            console.log("\n[test] SUCCESS! Screenshot analysis completed:");
            console.log("--------------------------------------------------");
            console.log(`OCR Text:\n${updatedScreenshot.ocrText}\n`);
            console.log(`Summary:\n${updatedScreenshot.summary}\n`);
            console.log(`Concepts:\n${JSON.stringify(updatedScreenshot.concepts)}\n`);
            console.log("--------------------------------------------------");
            analysisCompleted = true;
            break;
        }
        else {
            console.log("[test] Still waiting for analysis worker to complete...");
        }
    }
    if (!analysisCompleted) {
        console.error("[test] Timeout reached waiting for screenshot analysis.");
        process.exit(1);
    }
}
main()
    .catch((err) => {
    console.error("[test] Test error:", err);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
