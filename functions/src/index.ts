// Filename: functions/src/index.ts
import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

// Transporter with your newest App Password
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "artemonjoy@gmail.com",
    pass: "tenxeendjicindxk", 
  },
});

// 1. Send OTP Function - Forced to asia-south1
export const sendOTP = functions.onCall({ region: "asia-south1" }, async (request) => {
  const email = request.data.email;
  if (!email) {
    throw new functions.HttpsError("invalid-argument", "Email is required");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 5 * 60000)
  );

  await db.collection("otp_requests").doc(email).set({
    otp,
    expiresAt,
  });

  const mailOptions = {
    from: "artemonjoy@gmail.com",
    to: email,
    subject: "Your Artemon Joy Verification Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h1 style="color: #4f46e5;">Welcome to Artemon Joy!</h1>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code will expire in 5 minutes.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    console.error("Gmail SMTP Error:", error.message);
    throw new functions.HttpsError("internal", "Failed to send email");
  }
});

// 2. Verify and Register Function - Forced to asia-south1
export const verifyAndRegister = functions.onCall({ region: "asia-south1" }, async (request) => {
  const { email, password, otp, name } = request.data;

  const otpDoc = await db.collection("otp_requests").doc(email).get();
  if (!otpDoc.exists) {
    throw new functions.HttpsError("not-found", "No OTP found for this email");
  }

  const otpData = otpDoc.data();
  if (!otpData || otpData.otp !== otp) {
    throw new functions.HttpsError("permission-denied", "The code is incorrect");
  }

  if (otpData.expiresAt.toDate() < new Date()) {
    throw new functions.HttpsError("deadline-exceeded", "The code has expired");
  }

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    await db.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      displayName: name,
      role: "customer",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("otp_requests").doc(email).delete();

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    throw new functions.HttpsError("already-exists", error.message);
  }
});