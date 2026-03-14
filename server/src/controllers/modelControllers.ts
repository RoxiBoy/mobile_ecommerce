import { Request, Response } from "express";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export const listGeminiModels = async (_req: Request, res: Response) => {
  try {
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ status: "Failed", message: "GEMINI_API_KEY is missing" });
    }

    if (typeof fetch !== "function") {
      return res.status(500).json({ status: "Failed", message: "Fetch is not available" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(502).json({ status: "Failed", message: `Upstream error: ${text}` });
    }

    const data = (await response.json()) as {
      models?: Array<{
        name: string;
        supportedGenerationMethods?: string[];
      }>;
    };

    const models = (data.models || []).map((model) => ({
      name: model.name,
      supportedGenerationMethods: model.supportedGenerationMethods || [],
    }));

    return res.status(200).json({
      status: "Success",
      models,
    });
  } catch (error) {
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};
