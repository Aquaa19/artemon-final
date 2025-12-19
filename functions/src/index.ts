// Filename: functions/src/index.ts
import * as functions from "firebase-functions/v2/https";
import * as firestore from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "artemonjoy@gmail.com",
    pass: "tenxeendjicindxk", 
  },
});

// Helper for Branded Email Styles
const emailTemplate = (content: string) => `
  <div style="background-color: #f9fafb; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Artemon Joy</h1>
      </div>
      <div style="padding: 40px; color: #111827;">
        ${content}
      </div>
      <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        &copy; 2025 Artemon Joy. All rights reserved.
      </div>
    </div>
  </div>
`;

// 1. Enhanced OTP Function
export const sendOTP = functions.onCall({ region: "asia-south1" }, async (request) => {
  const email = request.data.email;
  if (!email) throw new functions.HttpsError("invalid-argument", "Email is required");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60000));

  await db.collection("otp_requests").doc(email).set({ otp, expiresAt });

  const mailOptions = {
    from: '"Artemon Joy" <artemonjoy@gmail.com>',
    to: email,
    subject: `${otp} is your verification code`,
    html: emailTemplate(`
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Verify your email</h2>
      <p style="font-size: 16px; line-height: 1.5; color: #4b5563; margin-bottom: 32px;">
        To finish setting up your Artemon Joy account, please use the following verification code:
      </p>
      <div style="background-color: #f3f4f6; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #4f46e5;">${otp}</span>
      </div>
      <p style="font-size: 14px; color: #9ca3af; text-align: center;">
        This code expires in 5 minutes. If you didn't request this code, you can safely ignore this email.
      </p>
    `),
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    throw new functions.HttpsError("internal", "Failed to send OTP");
  }
});

// 2. Registration Logic
export const verifyAndRegister = functions.onCall({ region: "asia-south1" }, async (request) => {
  const { email, password, otp, name } = request.data;
  const otpDoc = await db.collection("otp_requests").doc(email).get();

  if (!otpDoc.exists || otpDoc.data()?.otp !== otp) {
    throw new functions.HttpsError("permission-denied", "Incorrect or missing code");
  }
  if (otpDoc.data()?.expiresAt.toDate() < new Date()) {
    throw new functions.HttpsError("deadline-exceeded", "Code expired");
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password, displayName: name });
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

// 3. Welcome Email Trigger
export const onUserCreated = firestore.onDocumentCreated({
  document: "users/{userId}",
  region: "asia-south1"
}, async (event) => {
  const userData = event.data?.data();
  if (!userData) return;

  const mailOptions = {
    from: '"Artemon Joy" <artemonjoy@gmail.com>',
    to: userData.email,
    subject: `Welcome to the family, ${userData.displayName}!`,
    html: emailTemplate(`
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Welcome aboard!</h2>
      <p style="font-size: 16px; line-height: 1.5; color: #4b5563; margin-bottom: 24px;">
        Hi ${userData.displayName}, we're thrilled to have you join Artemon Joy. Discover a world of toys designed to spark joy and imagination.
      </p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://artemonjoy.web.app" style="background-color: #4f46e5; color: #ffffff; padding: 16px 32px; border-radius: 12px; font-weight: 700; text-decoration: none; display: inline-block;">
          Start Shopping Now
        </a>
      </div>
    `),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Welcome Email Error:", error);
  }
});

// 4. Order Confirmation Email Trigger
export const onOrderCreated = firestore.onDocumentCreated({
  document: "orders/{orderId}",
  region: "asia-south1"
}, async (event) => {
  const orderData = event.data?.data();
  if (!orderData) return;

  const itemsHtml = orderData.items.map((item: any) => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px;">
      <span>${item.name} x ${item.quantity}</span>
      <span style="font-weight: 700;">₹${(item.price * item.quantity).toLocaleString()}</span>
    </div>
  `).join("");

  const mailOptions = {
    from: '"Artemon Joy" <artemonjoy@gmail.com>',
    to: orderData.user_email,
    subject: `Order Confirmed! #${event.params.orderId.slice(-6).toUpperCase()}`,
    html: emailTemplate(`
      <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 16px;">Thank you for your order!</h2>
      <p style="font-size: 16px; color: #4b5563; margin-bottom: 24px;">
        We've received your order and are getting it ready for shipment. Here's a summary of what you bought:
      </p>
      <div style="border-top: 1px solid #f3f4f6; border-bottom: 1px solid #f3f4f6; padding: 20px 0; margin-bottom: 24px;">
        ${itemsHtml}
        <div style="display: flex; justify-content: space-between; margin-top: 16px; font-size: 18px; font-weight: 800;">
          <span>Total</span>
          <span>₹${orderData.total.toLocaleString()}</span>
        </div>
      </div>
      <p style="font-size: 14px; color: #9ca3af;">
        Payment Method: ${orderData.shipping.country === 'India' ? 'Cash on Delivery' : 'Standard Payment'}
      </p>
    `),
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Order Email Error:", error);
  }
});