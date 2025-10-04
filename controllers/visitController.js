// controllers/visitController.js
import express from "express";
import * as visitService from "../services/visitService.js";

const router = express.Router();

// ------------------ VISITS ------------------

// Log a visit
router.post("/track", async (req, res) => {
  try {
    const { pageUrl } = req.body;
    if (!pageUrl) return res.status(400).json({ error: "pageUrl is required" });

    await visitService.trackVisit(req, pageUrl);
    res.json({ message: "Visit tracked!" });
  } catch (err) {
    console.error("Error tracking visit:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete all visits
router.post("/deleteAll", async (req, res) => {
  try {
    await visitService.deleteAllVisits();
    res.json({ message: "All visits deleted" });
  } catch (err) {
    console.error("Error deleting visits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get today's visits
router.get("/today", async (req, res) => {
  try {
    const count = await visitService.getTodayVisits();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching today's visits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get weekly visits
router.get("/weekly", async (req, res) => {
  try {
    const count = await visitService.getWeeklyVisits();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching weekly visits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get monthly visits
router.get("/monthly", async (req, res) => {
  try {
    const count = await visitService.getMonthlyVisits();
    res.json({ count });
  } catch (err) {
    console.error("Error fetching monthly visits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get top 20 visited URLs
router.get("/top-urls", async (req, res) => {
  try {
    const urls = await visitService.topUrlVisits();
    res.json(urls);
  } catch (err) {
    console.error("Error fetching top URLs:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get visits last 7 days
router.get("/last7days", async (req, res) => {
  try {
    const visits = await visitService.getVisitsLast7Days();
    res.json(visits);
  } catch (err) {
    console.error("Error fetching last 7 days visits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get visits last 30 days
router.get("/last30days", async (req, res) => {
  try {
    const visits = await visitService.getVisitsLast30Days();
    res.json(visits);
  } catch (err) {
    console.error("Error fetching last 30 days visits:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
