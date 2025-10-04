// controllers/adminController.js
import express from "express";
import * as contentService from "../services/contentService.js";

const router = express.Router();

router.get("/test", (req, res) => res.send("Admin router works"));

// ------------------ CONTENT ------------------

// Get all content with pagination + optional keyword + type filter
router.get("/content", async (req, res) => {
  try {
    const { keyword, type, page = 0, size = 10 } = req.query;

    let results;
    if (keyword && type) {
      results = await contentService.searchContentsByTypeAndKeyword(type, keyword, page, size);
    } else if (type) {
      results = await contentService.getContentsByType(type, page, size);
    } else if (keyword) {
      results = await contentService.searchContents(keyword, page, size);
    } else {
      results = await contentService.getAllContents(page, size);
    }

    res.json(results);
  } catch (err) {
    console.error("Error fetching contents:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add single content
router.post("/content", async (req, res) => {
  try {
    const content = await contentService.saveContent(req.body);
    res.status(201).json(content);
  } catch (err) {
    console.error("Error adding content:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add multiple contents
router.post("/contents/all", async (req, res) => {
  try {
    const contents = req.body;
    if (!contents || contents.length === 0) {
      return res.status(400).json({ error: "No content provided" });
    }

    const savedContents = await contentService.saveAllContent(contents);
    res.json(savedContents);
  } catch (err) {
    console.error("Error adding multiple contents:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get content by ID
router.get("/content/:id", async (req, res) => {
  try {
    const content = await contentService.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }
    res.json(content);
  } catch (err) {
    console.error("Error fetching content by id:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update content by ID
router.put("/content/:id", async (req, res) => {
  try {
    const existing = await contentService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Content not found" });
    }

    const updated = {
      ...existing,
      ...req.body, // merge new fields
    };

    const saved = await contentService.saveContent(updated);
    res.json(saved);
  } catch (err) {
    console.error("Error updating content:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete content by ID
router.delete("/content/:id", async (req, res) => {
  try {
    const existing = await contentService.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Content not found" });
    }

    await contentService.deleteById(req.params.id);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting content:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ------------------ EPISODES (Links) ------------------

// Add link to content
router.post("/content/:contentId/links", async (req, res) => {
  try {
    const link = await contentService.addLinkToContent(req.params.contentId, req.body);
    res.status(201).json(link);
  } catch (err) {
    console.error("Error adding link:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete link from content
router.delete("/content/:contentId/links/:linkId", async (req, res) => {
  try {
    const removed = await contentService.deleteLinkFromContent(req.params.contentId, req.params.linkId);
    if (!removed) {
      return res.status(404).json({ error: "Link not found" });
    }
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting link:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
