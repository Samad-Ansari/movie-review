// controllers/contentController.js
import express from "express";
import * as contentService from "../services/contentService.js";
import * as visitService from "../services/visitService.js";

const router = express.Router();

// Helper to parse query params
const parseIntParam = (param, defaultValue = 0) => parseInt(param) || defaultValue;

// ------------------ MOVIES ------------------
router.get(["/", "/movies"], async (req, res) => {
  try {
    const page = parseIntParam(req.query.page, 0);
    const keyword = req.query.keyword || "";

    await visitService.trackVisit(req, "movies-list");

    const size = 8;
    let contents;
    if (keyword) {
      contents = await contentService.searchContentsByTypeAndKeyword("MOVIE", keyword, page, size);
    } else {
      contents = await contentService.getContentsByType("MOVIE", page, size);
    }

    // get total items count
    const totalCount = await contentService.countContentsByTypeAndKeyword("MOVIE", keyword);
    const totalPages = Math.ceil(totalCount / size);

    res.render("content", {
      contents,
      currentPage: page,
      keyword,
      totalPages,
      contentType: "movies",
      currentPath: "/movies", // make pagination links consistent
    });
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ------------------ WEBSERIES ------------------
router.get("/webseries", async (req, res) => {
  try {
    const page = parseIntParam(req.query.page, 0);
    const keyword = req.query.keyword || "";
    const size = 8;

    await visitService.trackVisit(req, "webseries-list");

    let contents, totalCount;

    if (keyword) {
      // Get paginated search results
      contents = await contentService.searchContentsByTypeAndKeyword("WEBSERIES", keyword, page, size);
      // Get total matching count for pagination
      totalCount = await contentService.countContentsByTypeAndKeyword("WEBSERIES", keyword);
    } else {
      // Get paginated list
      contents = await contentService.getContentsByType("WEBSERIES", page, size);
      // Get total count
      totalCount = await contentService.countContentsByType("WEBSERIES");
    }

    res.render("content", {
      contents,
      currentPage: page,
      keyword,
      totalPages: Math.ceil(totalCount / size),
      contentType: "WEBSERIES",  // match template condition
      currentPath: "/webseries",  // keep it clean for pagination links
    });
  } catch (err) {
    console.error("Error fetching webseries:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ------------------ CONTENT DETAILS ------------------
router.get("/movies/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await visitService.trackVisit(req, `movie-detail-${id}`);

    const movie = await contentService.findByIdAndType(id, "MOVIE");
    if (!movie) return res.render("default_page");

    res.render("contentdetail", {
      typeName: movie.type.toLowerCase(),
      content: movie,
      links: movie.links || [],
      currentPath: req.originalUrl,
    });
  } catch (err) {
    console.error("Error fetching movie details:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/webseries/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await visitService.trackVisit(req, `webseries-detail-${id}`);

    const series = await contentService.findByIdAndType(id, "WEBSERIES");
    if (!series) return res.render("default_page");

    res.render("contentdetail", {
      typeName: series.type.toLowerCase(),
      content: series,
      links: series.links || [],
      currentPath: req.originalUrl,
    });
  } catch (err) {
    console.error("Error fetching webseries details:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ------------------ STATIC PAGES ------------------
router.get("/about", async (req, res) => {
  try { await visitService.trackVisit(req, "about"); } catch {}
  res.render("about", { currentPath: req.originalUrl });
});

router.get("/contact", async (req, res) => {
  try { await visitService.trackVisit(req, "contact"); } catch {}
  res.render("contact", { currentPath: req.originalUrl });
});

router.get("/privacy", async (req, res) => {
  try { await visitService.trackVisit(req, "privacy"); } catch {}
  res.render("privacy", { currentPath: req.originalUrl });
});

// ------------------ VISIT STATS ------------------
router.get("/data/visits", async (req, res) => {
  try {
    const dailyCounts = await visitService.getTodayVisits();
    const weeklyCounts = await visitService.getWeeklyVisits();
    const monthlyCounts = await visitService.getMonthlyVisits();
    const weeklyVisits = await visitService.getVisitsLast7Days();
    const monthlyVisits = await visitService.getVisitsLast30Days();
    const topData = await visitService.topUrlVisits();

    const topUrls = topData.map(obj => obj.page_url);
    const topCounts = topData.map(obj => obj.visit_count);

    res.render("visit-tracker", {
      dailyCounts,
      weeklyCounts,
      monthlyCounts,
      weeklyVisits,
      monthlyVisits,
      topUrls,
      topCounts
    });
  } catch (err) {
    console.error("Error fetching visits:", err);
    res.status(500).send("Internal Server Error");
  }
});

// ------------------ FALLBACK ------------------
router.get("*", (req, res) => {
  res.render("default_page");
});

export default router;
