import { Request, Response } from "express";
import http from "node:http";
import https from "node:https";

const defaultHosts = ["upload.wikimedia.org", "images.unsplash.com"];

const getAllowedHosts = () => {
  const raw = process.env.IMAGE_PROXY_ALLOWLIST;
  if (!raw) return defaultHosts;
  return raw
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
};

export const proxyImage = async (req: Request, res: Response) => {
  try {
    const rawUrl = String(req.query.url || "");
    if (!rawUrl) {
      return res.status(400).json({ status: "Failed", message: "Missing url query" });
    }

    let target: URL;
    try {
      target = new URL(rawUrl);
    } catch {
      return res.status(400).json({ status: "Failed", message: "Invalid url" });
    }

    const allowedHosts = getAllowedHosts();
    if (!allowedHosts.includes(target.hostname)) {
      return res.status(403).json({ status: "Failed", message: "Host not allowed" });
    }

    const client = target.protocol === "https:" ? https : http;

    const request = client.get(
      target,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "image/*",
        },
      },
      (upstream) => {
        if (!upstream.statusCode || upstream.statusCode >= 400) {
          return res.status(502).json({
            status: "Failed",
            message: `Upstream responded with ${upstream.statusCode ?? "unknown"}`,
          });
        }

        const contentType = upstream.headers["content-type"] || "image/jpeg";
        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", "public, max-age=86400");
        upstream.pipe(res);
      }
    );

    request.on("error", () => {
      res.status(502).json({ status: "Failed", message: "Upstream error" });
    });
  } catch (error) {
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};
