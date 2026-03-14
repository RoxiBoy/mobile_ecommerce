import { Response } from "express";
import { AuthRequest } from "../utils/authRequestI";
import Cart from "../models/Cart";
import Order from "../models/Order";
import Product from "../models/Product";
import Coupon from "../models/Coupon";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const DEFAULT_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-1.5-flash-latest";
const normalizeModel = (model: string) => model.replace(/^models\//, "").trim();
const GEMINI_MODEL = normalizeModel(process.env.GEMINI_MODEL || DEFAULT_MODEL);

const buildPrompt = (payload: {
  message: string;
  cart: unknown;
  orders: unknown;
  products: unknown;
  coupons: unknown;
  userName: string;
}) => {
  return [
    {
      role: "user",
      parts: [
        {
          text: [
            `You are a friendly retail assistant for a mobile ecommerce app.`,
            `Use ONLY the data provided below to answer. If you need more info, ask a concise question.`,
            `Respond in short paragraphs. Suggest concrete next steps when possible.`,
            ``,
            `Customer: ${payload.userName}`,
            `User message: ${payload.message}`,
            ``,
            `Cart: ${JSON.stringify(payload.cart)}`,
            `Recent Orders: ${JSON.stringify(payload.orders)}`,
            `Sample Products: ${JSON.stringify(payload.products)}`,
            `Active Coupons: ${JSON.stringify(payload.coupons)}`,
          ].join("\n"),
        },
      ],
    },
  ];
};

export const chatWithAssistant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ status: "Failed", message: "Not authorized" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        status: "Failed",
        message: "GEMINI_API_KEY is missing in server env",
      });
    }

    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ status: "Failed", message: "message is required" });
    }

    const [cart, orders, products, coupons] = await Promise.all([
      Cart.findOne({ user: req.user._id }).populate("items.product", "name price images"),
      Order.find({ user: req.user._id }).sort("-createdAt").limit(5),
      Product.find().sort("-createdAt").limit(20).select("name price discountPrice stock category"),
      Coupon.find({ isActive: true }).sort("-createdAt").limit(10),
    ]);

    const prompt = buildPrompt({
      message,
      cart: cart ?? { items: [], totalPrice: 0 },
      orders,
      products,
      coupons,
      userName: req.user.name,
    });

    if (typeof fetch !== "function") {
      return res.status(500).json({ status: "Failed", message: "Fetch is not available" });
    }

    const callGemini = async (model: string) =>
      fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: prompt,
            generationConfig: {
              temperature: 0.4,
              topP: 0.9,
              maxOutputTokens: 700,
            },
          }),
        }
      );

    let response = await callGemini(GEMINI_MODEL);
    if (response.status === 404 && GEMINI_MODEL !== FALLBACK_MODEL) {
      response = await callGemini(FALLBACK_MODEL);
    }

    if (response.status === 429) {
      return res.status(503).json({
        status: "Failed",
        message: "Assistant is busy. Please try again in a moment.",
      });
    }

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({
        status: "Failed",
        message: `Assistant error: ${text}`,
      });
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
        finishReason?: string;
      }>;
    };

    const parts = data.candidates?.[0]?.content?.parts || [];
    const reply =
      parts.map((part) => part.text || "").join("").trim() ||
      "I’m not sure yet. Can you rephrase that?";

    if (process.env.CHAT_DEBUG === "true") {
      console.log("[chat] model:", response.url);
      console.log("[chat] finishReason:", data.candidates?.[0]?.finishReason);
      console.log("[chat] reply length:", reply.length);
      console.log("[chat] reply preview:", reply.slice(0, 400));
    }

    return res.status(200).json({
      status: "Success",
      reply,
      finishReason: data.candidates?.[0]?.finishReason,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};
