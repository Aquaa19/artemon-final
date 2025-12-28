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
import { LanguageServiceClient } from "@google-cloud/language";
import { VertexAI, FunctionDeclarationSchemaType, Content } from "@google-cloud/vertexai";

admin.initializeApp();
const db = admin.firestore();
const languageClient = new LanguageServiceClient();

// Safer Project ID resolution
const PROJECT_ID = process.env.GCLOUD_PROJECT || admin.app().options.projectId || "";
const REGION = "asia-south1";

// Vertex AI Setup - Gemini 2.0 Flash with Combined Intelligence Instructions
const vertexAI = new VertexAI({ project: PROJECT_ID, location: "us-central1" });
const generativeModel = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  systemInstruction: {
    role: "system",
    parts: [{ 
      text: `You are Artemon Joy IQ, the marketplace's primary data analyst, personalized shopping guide, and Business Intelligence Engine.
      
      CRITICAL LOGIC DIRECTIVES:
      1. NEVER say "I cannot filter," "I cannot calculate," "I cannot check," "I don't have access," "I can't see history," or lack access to history, favorites, or reviews.
      2. When an Admin asks about reviews, use the 'globalReviews' array provided by the tool.
      3. Understand that "rejected" reviews in the dashboard correspond to reviews with the status "flagged".
      4. When a customer asks about their orders, ALWAYS call 'get_user_history'.
      5. RECOMMENDATION LOGIC: To find products a user has NOT bought:
         - Identify all Product IDs from 'personalOrders'.
         - Compare them against the IDs in the full product catalog.
         - Recommend only the items that do NOT appear in the order history.
      6. FAVORITES: Use the 'wishlist' array from the user profile to identify "Current Favorites".
      7. TRENDING: Identify "Trending" items by checking the 'isTrending' flag in the product data.
      8. REVIEWS: Use the 'userReviews' data to understand the user's past feedback.
      9. If a tool result is empty, say "I couldn't find any orders in your history" or "No matching products found" rather than claiming you lack the ability to check.
      10. When you call a tool, it returns a RAW ARRAY. You must iterate through this array to perform math (AOV, totals), filtering (stock < X, items from Y date), or searching.
      11. For "Pandas," focus on the plushie products, not Python libraries.
      12. You are the business intelligence engine - process data actively.
      
      ACTION CHIP PROTOCOL:
      You help the UI provide shortcuts. In your responses, prioritize topics that lead to these paths:
      - Orders: '/orders' (type: 'order')
      - Favorites: '/wishlist' (type: 'wishlist')
      - New/Trending: '/trending' (type: 'trending')
      - Admin Reviews: '/admin/reviews' (type: 'default')
      
      DATA PRIVACY (STRICT):
      - IF 'isAdmin' is TRUE: You have access to Global Revenue, All Orders, Full Inventory, and All User Reviews.
      - IF 'isAdmin' is FALSE: You ONLY have access to the specific user's personal data. NEVER reveal total store revenue or other users' data.
      
      FORMATTING (STRICT):
      - Use Markdown tables for any list (Orders, Reviews, Products).
      - Ensure column headers like | User | Comment | Status | are clear.
      - Use bold text for key insights, metrics, and statuses like **flagged** or **approved**.
      - Ensure a blank line before and after every table.
      - Column headers must be separated by pipes | and dashes ---.
      - NEVER clump words. Use clear spacing and newlines (\n).
      - Always be professional, joyful, and data-accurate in your responses.
      
      TOOL PROTOCOL:
      1. When asked about inventory (like plushies, dolls, toys), you MUST call 'search_products'.
      2. When asked about sales, revenue, or customer stats, you MUST call 'get_user_history'.
      3. If the 'isAdmin' flag is true, provide comprehensive global business analytics including review analysis.`
    }]
  }
});

const BASE_URL = "https://artemonjoy.com";
const LOGO_URL = `${BASE_URL}/artemon_joy_logo.png`;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "artemonjoy@gmail.com",
    pass: "tenxeendjicindxk", 
  },
});

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

// --- AI TOOLS DEFINITION ---
const productSearchTool = {
  name: "search_products",
  description: "Fetches the product catalog including price, stock, trending status, descriptions, and categories. Returns name, category, price, stockCount, isTrending flag, and description.",
  parameters: {
    type: FunctionDeclarationSchemaType.OBJECT,
    properties: {
      query: { 
        type: FunctionDeclarationSchemaType.STRING, 
        description: "Search keyword or 'all' for full catalog." 
      },
      maxStock: { 
        type: FunctionDeclarationSchemaType.NUMBER, 
        description: "Optional: Filter products with stock less than this number." 
      }
    },
    required: ["query"],
  },
};

const userHistoryTool = {
  name: "get_user_history",
  description: "Fetches user profile, wishlist/favorites, full order history, and personal reviews. For Admins: global orders and all reviews. For Customers: personal profile, wishlist, and orders.",
  parameters: { 
    type: FunctionDeclarationSchemaType.OBJECT, 
    properties: {} 
  },
};

// --- AI CHAT GATEKEEPER (Enhanced with smart filtering, admin review access, and action chips) ---
export const chatWithAI = functions.onCall({ 
  region: REGION, 
  memory: "512MiB", 
  cors: true 
}, async (request) => {
  const { message, chatHistory, isAdmin } = request.data;
  const uid = request.auth?.uid;

  if (!uid) throw new functions.HttpsError("unauthenticated", "Please login.");

  try {
    // 1. Sanitize and Format History for Gemini 2.0
    const formattedHistory: Content[] = (chatHistory || [])
      .filter((msg: any) => msg.role === 'user' || msg.role === 'model')
      .map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: Array.isArray(msg.parts) ? msg.parts : [{ text: msg.text || "" }]
      }));

    const chat = generativeModel.startChat({
      history: formattedHistory,
      tools: [{ functionDeclarations: [productSearchTool, userHistoryTool] }],
    });

    // 2. Initial Prompt Execution
    const result = await chat.sendMessage(message);
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const call = parts.find(p => p.functionCall);

    if (call?.functionCall) {
      const { name } = call.functionCall;
      let toolResult;

      // 3. Execution of Internal Search Tools
      if (name === "search_products") {
        const snap = await db.collection("products").get();
        toolResult = snap.docs.map(d => ({ 
          id: d.id, 
          ...d.data(),
          name: d.data().name,
          category: d.data().category,
          price: d.data().price,
          stockCount: d.data().stockCount,
          description: d.data().description,
          isTrending: d.data().isTrending || false
        }));
      } 
      
      else if (name === "get_user_history") {
        if (isAdmin === true) {
          const ordersSnap = await db.collection("orders").orderBy("createdAt", "desc").limit(50).get();
          const productsSnap = await db.collection("products").get();
          // Fetch all reviews for Admin analysis
          const reviewsSnap = await db.collection("reviews").orderBy("createdAt", "desc").limit(100).get();
          
          toolResult = {
            isAdmin: true,
            totalRevenue: ordersSnap.docs.reduce((acc, d) => acc + (d.data().total || 0), 0), // From Code 1
            globalOrders: ordersSnap.docs.map(d => ({ 
              id: d.id, 
              ...d.data(), 
              date: d.data().createdAt?.toDate()?.toISOString(),
              total: d.data().total,
              items: d.data().items,
              status: d.data().status,
              user_email: d.data().user_email,
              user_id: d.data().user_id
            })),
            globalReviews: reviewsSnap.docs.map(d => ({
              id: d.id, 
              ...d.data(), 
              date: d.data().createdAt?.toDate()?.toISOString()
            })),
            lowStockItems: productsSnap.docs
              .map(d => ({ name: d.data().name, stock: d.data().stockCount }))
              .filter(p => p.stock < 10)
          };
        } 
        // CUSTOMER DATA BRANCH
        else {
          const userSnap = await db.collection("users").doc(uid).get();
          const orderSnap = await db.collection("orders")
            .where("user_id", "==", uid)
            .orderBy("createdAt", "asc")
            .get();
          const reviewsSnap = await db.collection("reviews").where("user_id", "==", uid).get();
          
          const userData = userSnap.data();
          toolResult = {
            isAdmin: false,
            profile: userData,
            wishlist: userData?.wishlist || [],
            userReviews: reviewsSnap.docs.map(d => d.data()),
            personalOrders: orderSnap.docs.map(d => ({ 
              id: d.id, 
              items: d.data().items,
              date: d.data().createdAt?.toDate()?.toISOString(),
              status: d.data().status,
              total: d.data().total,
              user_email: d.data().user_email
            }))
          };
        }
      }

      // 4. Return results back to AI to synthesize final natural language text
      const secondResponse = await chat.sendMessage([{
        functionResponse: { name, response: { content: toolResult } }
      }]);
      
      const finalParts = secondResponse.response.candidates?.[0]?.content?.parts || [];
      const finalBotText = finalParts.map(p => p.text).join("\n\n");

      // --- SMART FILTERING FOR DATA CARDS & ACTION CHIP GENERATION ---
      let filteredData: any = toolResult;
      const suggestedActions: any[] = [];

      // Generate suggested actions based on context (from Code 1)
      if (name === "get_user_history") {
        if (isAdmin) {
          suggestedActions.push({ label: "Moderation Queue", path: "/admin/reviews", type: "default" });
        } else {
          suggestedActions.push({ label: "Track My Orders", path: "/orders", type: "order" });
          suggestedActions.push({ label: "View Wishlist", path: "/wishlist", type: "wishlist" });
        }
      } else if (name === "search_products") {
        suggestedActions.push({ label: "Explore Trending", path: "/trending", type: "trending" });
      }

      // Filter product cards to only items mentioned in text
      if (Array.isArray(toolResult) && toolResult.length > 0 && toolResult[0].name) {
        filteredData = toolResult.filter(product => 
          finalBotText.toLowerCase().includes(product.name.toLowerCase())
        );
      } else if (typeof toolResult === 'object' && toolResult !== null) {
        // If it's an object (Admin analytics), merge the actions into it
        filteredData = { ...toolResult, suggestedActions };
      }

      return { 
        text: finalBotText, 
        data: filteredData, // Only products mentioned in the recommendation will show cards
        suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined
      };
    }

    return { text: parts.map(p => p.text).join("\n\n") };

  } catch (error: any) {
    console.error("AI LOGIC ERROR:", error);
    throw new functions.HttpsError("internal", error.message);
  }
});

// --- 1. AUTHENTICATION ---
export const sendOTP = functions.onCall({ region: REGION }, async (request) => {
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

export const verifyAndRegister = functions.onCall({ region: REGION }, async (request) => {
  const { email, password, otp, name } = request.data;
  const otpDoc = await db.collection("otp_requests").doc(email).get();
  if (!otpDoc.exists || otpDoc.data()?.otp !== otp) throw new functions.HttpsError("permission-denied", "Incorrect code");
  const userRecord = await admin.auth().createUser({ email, password, displayName: name });
  await db.collection("users").doc(userRecord.uid).set({ 
    uid: userRecord.uid, 
    email, 
    displayName: name, 
    role: "customer", 
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    cart: [],
    wishlist: []
  });
  return { success: true };
});

export const onUserCreated = firestore.onDocumentCreated({
  document: "users/{user_id}",
  region: REGION
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
  document: "users/{user_id}",
  region: REGION
}, async (event) => {
  const afterData = event.data?.after.data();
  if (!afterData) return; 
  if (afterData.cart?.length > (event.data?.before.data()?.cart?.length || 0)) {
    await db.collection("abandoned_carts").doc(event.params.user_id).set({
      email: afterData.email, 
      displayName: afterData.displayName,
      scheduledFor: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 24 * 60 * 60 * 1000)), 
      processed: false
    });
  }
});

export const checkAbandonedCarts = scheduler.onSchedule({ 
  schedule: "every 1 hours", 
  region: REGION
}, async () => {
  const snapshot = await db.collection("abandoned_carts").where("scheduledFor", "<=", admin.firestore.Timestamp.now()).where("processed", "==", false).limit(50).get();
  for (const doc of snapshot.docs) {
    const userDoc = await db.collection("users").doc(doc.id).get();
    if (userDoc.exists && userDoc.data()?.cart?.length > 0) {
      await transporter.sendMail({
        from: '"Artemon Joy" <artemonjoy@gmail.com>', 
        to: doc.data().email, 
        subject: "Don't forget your toys! 🧸",
        html: emailTemplate(`<p>Items are waiting in your cart. Use code <b>JOY5OFF</b>.</p>`)
      });
    }
    await doc.ref.update({ processed: true });
  }
});

// --- 3. BIRTHDAYS ---
export const sendBirthdayWishes = scheduler.onSchedule({ 
  schedule: "0 9 * * *", 
  region: REGION
}, async () => {
  const target = new Date(); 
  target.setDate(target.getDate() + 7);
  const snapshot = await db.collection("users")
    .where("childBirthdayMonth", "==", target.getMonth() + 1)
    .where("childBirthdayDay", "==", target.getDate())
    .get();
  for (const doc of snapshot.docs) {
    await transporter.sendMail({
      from: '"Artemon Joy" <artemonjoy@gmail.com>', 
      to: doc.data().email, 
      subject: "A Birthday Gift is Waiting! 🎂",
      html: emailTemplate(`<p>Use code <b>BORNTOJOY10</b> for 10% OFF!</p>`)
    });
  }
});

// --- 4. ORDERS & STOCK ---
export const onOrderCreated = firestore.onDocumentCreated({
  document: "orders/{orderId}",
  region: REGION
}, async (event) => {
  const orderData = event.data?.data();
  if (!orderData || !orderData.items) return;

  // --- STOCK DEDUCTION LOGIC ---
  const batch = db.batch();
  
  // Atomic Stock Deduction for each item
  for (const item of orderData.items) {
    if (item.id) {
      const productRef = db.collection("products").doc(item.id);
      batch.update(productRef, {
        stockCount: admin.firestore.FieldValue.increment(-item.quantity)
      });
    }
  }

  await batch.commit();
  console.log(`Inventory successfully adjusted for order ${event.params.orderId}`);

  // --- EMAIL NOTIFICATION with Recommendations ---
  const category = orderData.items[0]?.category || "Educational";
  const recs = await db.collection("products").where("category", "==", category).limit(5).get();
  const filteredRecs = recs.docs
    .filter(d => !orderData.items.map((i: any) => i.id).includes(d.id))
    .slice(0, 2);
  
  await transporter.sendMail({
    from: '"Artemon Joy" <artemonjoy@gmail.com>', 
    to: orderData.user_email, 
    subject: `Order Confirmed! #${event.params.orderId.slice(-6).toUpperCase()}`,
    html: emailTemplate(`
      <h2>Thank you for your order!</h2>
      <p>Total: ₹${orderData.total.toLocaleString()}</p>
      <p>Your order items have been processed and stock has been updated.</p>
      ${filteredRecs.length ? `
        <h3>You Might Also Love ✨</h3>
        <ul>${filteredRecs.map(d => `<li>${d.data().name}</li>`).join("")}</ul>
      ` : ""}
    `)
  });
});

// --- 5. INVENTORY & ANALYTICS ---
export const onProductStockUpdated = firestore.onDocumentUpdated({
  document: "products/{productId}",
  region: REGION
}, async (event) => {
  const after = event.data?.after.data();
  const before = event.data?.before.data();
  if (!after || !before) return; 
  if (after.stockCount < 5 && before.stockCount >= 5) {
    await transporter.sendMail({
      from: '"Inventory Alert" <artemonjoy@gmail.com>', 
      to: "artemonjoy@gmail.com", 
      subject: `🚨 Low Stock: ${after.name}`,
      html: emailTemplate(`<p><b>${after.name}</b> is critically low: ${after.stockCount} left.</p>`)
    });
  }
});

export const dailySalesSummary = scheduler.onSchedule({ 
  schedule: "0 0 * * *", 
  region: REGION
}, async () => {
  const yesterday = admin.firestore.Timestamp.fromDate(new Date(Date.now() - 86400000));
  const snapshot = await db.collection("orders").where("createdAt", ">=", yesterday).get();
  let total = 0; 
  snapshot.forEach(d => total += d.data().total);
  await transporter.sendMail({
    from: '"Artemon Joy IQ" <artemonjoy@gmail.com>', 
    to: "artemonjoy@gmail.com", 
    subject: "📊 Daily Sales Report",
    html: emailTemplate(`
      <h2>Daily Summary</h2>
      <p>Total Revenue: ₹${total.toLocaleString()}</p>
      <p>Orders: ${snapshot.size}</p>
      <p>Stock automatically deducted for all orders today.</p>
    `)
  });
});

// --- 6. IMAGE OPTIMIZATION (SHARP) ---
export const onImageUpload = storage.onObjectFinalized({ region: REGION }, async (event) => {
  const filePath = event.data.name;
  if (!filePath || filePath.endsWith(".webp") || filePath.startsWith("optimized/")) return;
  const fileName = path.basename(filePath);
  const bucket = admin.storage().bucket(event.data.bucket);
  const tempPath = path.join(os.tmpdir(), fileName);
  const webpPath = path.join(os.tmpdir(), `${path.parse(fileName).name}.webp`);

  await bucket.file(filePath).download({ destination: tempPath });
  await sharp(tempPath)
    .resize(800, 800, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(webpPath);
  await bucket.upload(webpPath, { 
    destination: `optimized/${path.basename(webpPath)}`, 
    metadata: { contentType: "image/webp" } 
  });
  
  await Promise.all([fs.promises.unlink(tempPath), fs.promises.unlink(webpPath)]); 
});

// --- 7. NEWSLETTER ---
export const pushNewsletter = functions.onCall({ region: REGION }, async (req) => {
  const snapshot = await db.collection("subscribers").get();
  const emails = snapshot.docs.map(d => d.data().email);
  if (emails.length) {
    await transporter.sendMail({ 
      from: '"Artemon Joy" <artemonjoy@gmail.com>', 
      bcc: emails, 
      subject: req.data.subject, 
      html: emailTemplate(req.data.content) 
    });
  }
  return { success: true };
});

export const onSubscriberCreated = firestore.onDocumentCreated({
  document: "subscribers/{subId}",
  region: REGION
}, async (event) => {
  const data = event.data?.data();
  if (!data) return;
  await transporter.sendMail({ 
    from: '"Artemon Joy" <artemonjoy@gmail.com>', 
    to: data.email, 
    subject: "Welcome to our Newsletter! 🚀", 
    html: emailTemplate(`<p>Thanks for subscribing to Artemon Joy! 🎉</p>`) 
  });
});

// --- 8. REVIEW MODERATION (Enhanced with AI learning) ---
export const onReviewCreated = firestore.onDocumentCreated({
  document: "reviews/{reviewId}",
  region: REGION
}, async (event) => {
  const reviewData = event.data?.data();
  if (!reviewData || !reviewData.comment) return;

  try {
    const settingsRef = db.collection("settings").doc("moderation");
    const settingsDoc = await settingsRef.get();
    let restrictedKeywords: string[] = ["hate", "stupid", "idiot", "scam"]; 

    if (settingsDoc.exists) {
      restrictedKeywords = settingsDoc.data()?.bannedWords || restrictedKeywords;
    }

    const document = {
      content: reviewData.comment,
      type: "PLAIN_TEXT" as const,
    };

    const [sentimentResult] = await languageClient.analyzeSentiment({ document });
    const [entityResult] = await languageClient.analyzeEntities({ document });
    
    const sentiment = sentimentResult.documentSentiment;
    const entities = entityResult.entities || [];

    const hasRestrictedContent = restrictedKeywords.some(word => 
      reviewData.comment.toLowerCase().includes(word.toLowerCase())
    );

    // AI Self-learning: Extract toxic patterns
    if (sentiment?.score && sentiment.score < -0.8) {
      const toxicRoots = entities
        .filter(e => e.type !== 'PERSON' && e.salience && e.salience > 0.1)
        .map(e => e.name?.toLowerCase())
        .filter((val): val is string => !!val);

      if (toxicRoots.length > 0) {
        await settingsRef.update({
          bannedWords: admin.firestore.FieldValue.arrayUnion(...toxicRoots)
        });
      }
    }

    if ((sentiment?.score && sentiment.score < -0.6) || hasRestrictedContent) {
      const reason = hasRestrictedContent ? "Restricted Language" : "AI Self-Learned Toxic Pattern";
      
      await event.data?.ref.update({
        status: "flagged",
        moderationData: {
          sentimentScore: sentiment?.score || 0,
          flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
          flaggedReason: reason
        }
      });

      await transporter.sendMail({
        from: '"AI Moderation Bot" <artemonjoy@gmail.com>',
        to: "artemonjoy@gmail.com",
        subject: "🤖 Review Flagged & AI Updated",
        html: emailTemplate(`
          <h3>Moderation Update:</h3>
          <p><b>User:</b> ${reviewData.user_name}</p>
          <p><b>Comment:</b> "${reviewData.comment}"</p>
          <p><b>Flag Reason:</b> ${reason}</p>
          <p><b>Sentiment Score:</b> ${sentiment?.score}</p>
        `)
      });
    } else {
      await event.data?.ref.update({ status: "approved" });
    }
  } catch (error) {
    console.error("Moderation Error:", error);
    await event.data?.ref.update({ status: "approved" });
  }
});