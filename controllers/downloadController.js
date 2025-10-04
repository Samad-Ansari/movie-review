import express from "express";
import * as contentService from "../services/contentService.js";
import { Buffer } from "buffer";

const router = express.Router();

const PREFIX_URL = process.env.APP_PREFIX_URL
const SUFFIX_URL = process.env.APP_SUFFIX_URL;

// ------------------ Timer Page ------------------
router.get("/fetch/:token", (req, res) => {
  const { token } = req.params;
  res.render("file_timer", { token });
});

// ------------------ Choose File Page ------------------
router.get("/choose/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decodedJson = Buffer.from(token, "base64").toString("utf-8");
    const obj = JSON.parse(decodedJson);

    if (!obj.id) {
      return res.render("default_page", { error: "Token missing required information." });
    }

    const contentId = obj.id;
    const content = await contentService.findById(contentId); // should return the content object

    if (!content) {
      return res.render("default_page", { error: `Content not found for ID: ${contentId}` });
    }
    res.render("choose_file", { content, token });
  } catch (err) {
    console.error("Error in /choose/:token:", err);
    res.render("default_page", { error: "Invalid or expired token." });
  }
});

// ------------------ Default Page ------------------
router.get("/", (req, res) => {
  res.render("default_page", { message: "Welcome to Your Movie Hub Blog!" });
});

// ------------------ Get File Link ------------------
router.get("/getting", (req, res) => {
  const { token } = req.query;

  try {
    if (!token) return res.status(400).send("Missing token.");

    const decodedJson = Buffer.from(token, "base64").toString("utf-8");
    const obj = JSON.parse(decodedJson);

    if (!obj.id) return res.status(400).send("Token missing ID.");
    const fileLink = `${PREFIX_URL}${obj.id}${SUFFIX_URL}`;
    res.send(fileLink);
  } catch (err) {
    console.error("Error in /getting:", err);
    return res.status(400).send("Invalid token.");
  }
});

export default router;
