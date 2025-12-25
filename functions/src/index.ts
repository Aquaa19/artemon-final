// Filename: functions/src/index.ts
import * as functions from "firebase-functions/v2/https";
import * as firestore from "firebase-functions/v2/firestore";
import * as scheduler from "firebase-functions/v2/scheduler";
import * as storage from "firebase-functions/v2/storage";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import sharp from "sharp";

admin.initializeApp();
const db = admin.firestore();

const BASE_URL = "https://artemonjoy.com";
const LOGO_URL = `${BASE_URL}/artemon_joy_logo.png`;

/**
 * EMAIL SETUP
 * Hard-coded password reverted as requested.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "artemonjoy@gmail.com",
    pass: "tenxeendjicindxk", 
  },
});

/**
 * High-Fidelity Branded Email Template
 */
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Artemon Joy</title>
</head>
<body style="margin:0; padding:0; background:#f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6; padding:24px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#6366f1); padding:32px 24px; text-align:center;">
              <a href="${BASE_URL}" style="text-decoration:none;">
                <img src="${LOGO_URL}" alt="Artemon Joy" width="64" height="64"
                  style="display:block; margin:0 auto 12px auto; border-radius:50%; border:3px solid #ffffff;" />
                <h1 style="margin:0; font-size:26px; font-weight:800; color:#ffffff; letter-spacing:-0.02em;">
                  Artemon Joy
                </h1>
                <p style="margin:6px 0 0 0; font-size:13px; color:#e0e7ff;">
                  Playtime, Reimagined with Wonder
                </p>
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 28px; color:#111827; font-size:15px; line-height:1.7;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px;">
              <hr style="border:none; border-top:1px solid #e5e7eb;"/>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px 28px; text-align:center; color:#6b7280; font-size:12px;">
              <p style="margin:0;">
                © ${new Date().getFullYear()} <strong>Artemon Joy</strong><br/>
                Crafted with ❤️ for little imaginations
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// --- 1. AUTHENTICATION ---
export const sendOTP = functions.onCall({ 
  region: "asia-south1"
}, async (request) => {
  const email = request.data.email;
  if (!email) throw new functions.HttpsError("invalid-argument", "Email required");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60000));
  await db.collection("otp_requests").doc(email).set({ otp, expiresAt });
  
  await transporter.sendMail({
    from: '"Artemon Joy" <artemonjoy@gmail.com>',
    to: email,
    subject: `${otp} is your verification code`,
    html: emailTemplate(`<div style="text-align:center;"><h2>Verify email</h2><div style="background:#f3f4f6;padding:24px;font-size:36px;font-weight:800;color:#4f46e5;">${otp}</div></div>`)
  });
  return { success: true };
});

export const verifyAndRegister = functions.onCall({ region: "asia-south1" }, async (request) => {
  const { email, password, otp, name } = request.data;
  const otpDoc = await db.collection("otp_requests").doc(email).get();
  if (!otpDoc.exists || otpDoc.data()?.otp !== otp) throw new functions.HttpsError("permission-denied", "Incorrect code");
  const userRecord = await admin.auth().createUser({ email, password, displayName: name });
  await db.collection("users").doc(userRecord.uid).set({ uid: userRecord.uid, email, displayName: name, role: "customer", createdAt: admin.firestore.FieldValue.serverTimestamp() });
  return { success: true };
});

export const onUserCreated = firestore.onDocumentCreated({
  document: "users/{userId}",
  region: "asia-south1"
}, async (event) => {
  const userData = event.data?.data();
  if (!userData) return;
  await transporter.sendMail({
    from: '"Artemon Joy" <artemonjoy@gmail.com>',
    to: userData.email,
    subject: `Welcome, ${userData.displayName}!`,
    html: emailTemplate(`<h2>Welcome aboard!</h2><p>Start exploring joyful toys today.</p>`)
  });
});

// --- 2. ABANDONED CART ---
export const onCartUpdated = firestore.onDocumentUpdated({
  document: "users/{userId}",
  region: "asia-south1"
}, async (event) => {
  const afterData = event.data?.after.data();
  if (!afterData) return; 

  if (afterData.cart?.length > (event.data?.before.data()?.cart?.length || 0)) {
    await db.collection("abandoned_carts").doc(event.params.userId).set({
      email: afterData.email, displayName: afterData.displayName,
      scheduledFor: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), processed: false
    });
  }
});

export const checkAbandonedCarts = scheduler.onSchedule({ 
  schedule: "every 1 hours", 
  region: "asia-south1"
}, async () => {
  const snapshot = await db.collection("abandoned_carts").where("scheduledFor", "<=", admin.firestore.Timestamp.now()).where("processed", "==", false).limit(50).get();
  for (const doc of snapshot.docs) {
    const userDoc = await db.collection("users").doc(doc.id).get();
    if (userDoc.exists && userDoc.data()?.cart?.length > 0) {
      await transporter.sendMail({
        from: '"Artemon Joy" <artemonjoy@gmail.com>', to: doc.data().email, subject: "Don't forget your toys! 🧸",
        html: emailTemplate(`<p>Items are waiting in your cart. Use code <b>JOY5OFF</b>.</p>`)
      });
    }
    await doc.ref.update({ processed: true });
  }
});

// --- 3. BIRTHDAYS ---
export const sendBirthdayWishes = scheduler.onSchedule({ 
  schedule: "0 9 * * *", 
  region: "asia-south1"
}, async () => {
  const target = new Date(); target.setDate(target.getDate() + 7);
  const snapshot = await db.collection("users").where("childBirthdayMonth", "==", target.getMonth() + 1).where("childBirthdayDay", "==", target.getDate()).get();
  for (const doc of snapshot.docs) {
    await transporter.sendMail({
      from: '"Artemon Joy" <artemonjoy@gmail.com>', to: doc.data().email, subject: "A Birthday Gift is Waiting! 🎂",
      html: emailTemplate(`<p>Use code <b>BORNTOJOY10</b> for 10% OFF!</p>`)
    });
  }
});

// --- 4. ORDERS ---
export const onOrderCreated = firestore.onDocumentCreated({
  document: "orders/{orderId}",
  region: "asia-south1"
}, async (event) => {
  const orderData = event.data?.data();
  if (!orderData) return;
  const category = orderData.items[0]?.category || "Educational";
  const recs = await db.collection("products").where("category", "==", category).limit(5).get();
  const filteredRecs = recs.docs.filter(d => !orderData.items.map((i: any) => i.id).includes(d.id)).slice(0, 2);
  
  await transporter.sendMail({
    from: '"Artemon Joy" <artemonjoy@gmail.com>', to: orderData.user_email, subject: `Order Confirmed! #${event.params.orderId.slice(-6).toUpperCase()}`,
    html: emailTemplate(`<h2>Thank you!</h2><p>Total: ₹${orderData.total.toLocaleString()}</p>
      ${filteredRecs.length ? `<h3>You Might Also Love ✨</h3><ul>${filteredRecs.map(d => `<li>${d.data().name}</li>`).join("")}</ul>` : ""}`)
  });
});

// --- 5. INVENTORY & ANALYTICS ---
export const onProductStockUpdated = firestore.onDocumentUpdated({
  document: "products/{productId}",
  region: "asia-south1"
}, async (event) => {
  const after = event.data?.after.data();
  const before = event.data?.before.data();
  if (!after || !before) return; 

  if (after.stockCount < 5 && before.stockCount >= 5) {
    await transporter.sendMail({
      from: '"Inventory Alert"', to: "artemonjoy@gmail.com", subject: `🚨 Low Stock: ${after.name}`,
      html: emailTemplate(`<p><b>${after.name}</b> is critically low: ${after.stockCount} left.</p>`)
    });
  }
});

export const dailySalesSummary = scheduler.onSchedule({ 
  schedule: "0 0 * * *", 
  region: "asia-south1"
}, async () => {
  const yesterday = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000));
  const snapshot = await db.collection("orders").where("createdAt", ">=", yesterday).get();
  let total = 0; snapshot.forEach(d => total += d.data().total);
  await transporter.sendMail({
    from: '"Artemon Joy IQ"', to: "artemonjoy@gmail.com", subject: "📊 Daily Sales Report",
    html: emailTemplate(`<h2>Daily Summary</h2><p>Total Revenue: ₹${total.toLocaleString()}</p><p>Orders: ${snapshot.size}</p>`)
  });
});

// --- 6. IMAGE OPTIMIZATION (SHARP) ---
export const onImageUpload = storage.onObjectFinalized({ 
  region: "asia-south1" 
}, async (event) => {
  const filePath = event.data.name;
  if (!filePath || filePath.endsWith(".webp") || filePath.startsWith("optimized/")) return;
  const fileName = path.basename(filePath);
  const bucket = admin.storage().bucket(event.data.bucket);
  const tempPath = path.join(os.tmpdir(), fileName);
  const webpPath = path.join(os.tmpdir(), `${path.parse(fileName).name}.webp`);

  await bucket.file(filePath).download({ destination: tempPath });
  await sharp(tempPath).resize(800, 800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 80 }).toFile(webpPath);
  await bucket.upload(webpPath, { destination: `optimized/${path.basename(webpPath)}`, metadata: { contentType: "image/webp" } });
  
  await Promise.all([fs.promises.unlink(tempPath), fs.promises.unlink(webpPath)]); 
});

// --- 7. NEWSLETTER ---
export const pushNewsletter = functions.onCall({ 
  region: "asia-south1"
}, async (req) => {
  const snapshot = await db.collection("subscribers").get();
  const emails = snapshot.docs.map(d => d.data().email);
  if (emails.length) {
    await transporter.sendMail({ from: '"Artemon Joy"', bcc: emails, subject: req.data.subject, html: emailTemplate(req.data.content) });
  }
  return { success: true };
});

export const onSubscriberCreated = firestore.onDocumentCreated({
  document: "subscribers/{subId}",
  region: "asia-south1"
}, async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await transporter.sendMail({ from: '"Artemon Joy"', to: data.email, subject: "Welcome! 🚀", html: emailTemplate(`<p>Thanks for subscribing 🎉</p>`) });
});