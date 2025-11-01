// controllers/contentController.js
import express from "express";
import * as contentService from "../services/contentService.js";
import * as visitService from "../services/visitService.js";

const router = express.Router();

/* -------------------------- Helper Functions -------------------------- */
const parseIntParam = (param, defaultValue = 0) => parseInt(param) || defaultValue;

const renderPage = async (res, view, data = {}, meta = {}) => {
  res.render(view, {
    ...data,
    pageTitle: meta.title || "MovieAurSeries",
    pageDescription: meta.description || "Explore movies and web series in Hindi dubbed and HD quality.",
    pageKeywords: meta.keywords || "movies, webseries, Hindi dubbed, MovieAurSeries",
  });
};

/* -------------------------- MOVIES -------------------------- */
router.get(["/", "/movies"], async (req, res) => {
  try {
    const page = parseIntParam(req.query.page, 0);
    const keyword = req.query.keyword || "";
    const size = 12;

    const contents = keyword
      ? await contentService.searchContentsByTypeAndKeyword("MOVIE", keyword, page, size)
      : await contentService.getContentsByType("MOVIE", page, size);

    const totalCount = await contentService.countContentsByTypeAndKeyword("MOVIE", keyword);
    const totalPages = Math.ceil(totalCount / size);

    await renderPage(res, "content", {
      contents,
      currentPage: page,
      keyword,
      totalPages,
      contentType: "movies",
      currentPath: "/movies",
    }, {
      title: keyword
        ? `Search Results for "${keyword}" | Movies | MovieAurSeries`
        : "Latest Hindi Dubbed Movies | MovieAurSeries",
      description: "Watch and explore the latest Hindi dubbed movies online on MovieAurSeries.",
      keywords: "movies, Hindi dubbed, HD movies, download, stream",
    });
  } catch (err) {
    console.error("Error fetching movies:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* -------------------------- WEB SERIES -------------------------- */
router.get("/webseries", async (req, res) => {
  try {
    const page = parseIntParam(req.query.page, 0);
    const keyword = req.query.keyword || "";
    const size = 12;

    const contents = keyword
      ? await contentService.searchContentsByTypeAndKeyword("WEBSERIES", keyword, page, size)
      : await contentService.getContentsByType("WEBSERIES", page, size);

    const totalCount = await contentService.countContentsByTypeAndKeyword("WEBSERIES", keyword);
    const totalPages = Math.ceil(totalCount / size);

    await renderPage(res, "content", {
      contents,
      currentPage: page,
      keyword,
      totalPages,
      contentType: "webseries",
      currentPath: "/webseries",
    }, {
      title: keyword
        ? `Search Results for "${keyword}" | Web Series | MovieAurSeries`
        : "Best Hindi Dubbed Web Series | MovieAurSeries",
      description: "Discover trending Hindi dubbed web series. Watch and download latest episodes in HD.",
      keywords: "web series, Hindi dubbed, HD series, Netflix, Amazon Prime",
    });
  } catch (err) {
    console.error("Error fetching webseries:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* -------------------------- MOVIE DETAIL -------------------------- */
router.get("/movie/:id/:slug", async (req, res) => {
  try {
    const id = req.params.id;

    const movie = await contentService.findByIdAndType(id, "MOVIE");
    if (!movie) return res.render("default_page");

    await visitService.trackVisit(req, `movie-detail-${movie.name}`);

    await renderPage(res, "contentdetail", {
      typeName: movie.type.toLowerCase(),
      content: movie,
      links: movie.links || [],
      currentPath: req.originalUrl,
    }, {
      title: `${movie.name} (${movie.year}) | ${movie.language} | MovieAurSeries`,
      description: `${movie.description?.slice(0, 150) || "Watch latest Hindi dubbed movie"}...`,
      keywords: `${movie.name}, ${movie.genre}, ${movie.language}, movie, MovieAurSeries`,
    });
  } catch (err) {
    console.error("Error fetching movie details:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* -------------------------- WEBSERIES DETAIL -------------------------- */
router.get("/webseries/:id/:slug", async (req, res) => {
  try {
    const id = req.params.id;

    const series = await contentService.findByIdAndType(id, "WEBSERIES");
    if (!series) return res.render("default_page");

    await visitService.trackVisit(req, `movie-detail-${series.name}`);

    await renderPage(res, "contentdetail", {
      typeName: series.type.toLowerCase(),
      content: series,
      links: series.links || [],
      currentPath: req.originalUrl,
    }, {
      title: `${series.name} (${series.year}) | ${series.language} | MovieAurSeries`,
      description: `${series.description?.slice(0, 150) || "Watch trending Hindi dubbed series"}...`,
      keywords: `${series.name}, ${series.genre}, ${series.language}, webseries, MovieAurSeries`,
    });
  } catch (err) {
    console.error("Error fetching webseries details:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* -------------------------- STATIC PAGES -------------------------- */
router.get("/about", async (req, res) => {
  await renderPage(res, "about", { currentPath: req.originalUrl }, {
    title: "About Us | MovieAurSeries",
    description: "Learn more about MovieAurSeries, your go-to platform for movies and web series.",
  });
});

router.get("/contact", async (req, res) => {
  await renderPage(res, "contact", { currentPath: req.originalUrl }, {
    title: "Contact Us | MovieAurSeries",
    description: "Have questions or suggestions? Contact MovieAurSeries support.",
  });
});

router.get("/privacy", async (req, res) => {
  await renderPage(res, "privacy", { currentPath: req.originalUrl }, {
    title: "Privacy Policy | MovieAurSeries",
    description: "Read our privacy policy to understand how MovieAurSeries handles your data.",
  });
});

/* -------------------------- VISIT STATS -------------------------- */
router.get("/data/visits", async (req, res) => {
  try {
    const [dailyCounts, weeklyCounts, monthlyCounts, weeklyVisits, monthlyVisits, topData] =
      await Promise.all([
        visitService.getTodayVisits(),
        visitService.getWeeklyVisits(),
        visitService.getMonthlyVisits(),
        visitService.getVisitsLast7Days(),
        visitService.getVisitsLast30Days(),
        visitService.topUrlVisits(),
      ]);

    const topUrls = topData.map(obj => obj.page_url);
    const topCounts = topData.map(obj => obj.visit_count);

    await renderPage(res, "visit-tracker", {
      dailyCounts,
      weeklyCounts,
      monthlyCounts,
      weeklyVisits,
      monthlyVisits,
      topUrls,
      topCounts,
    }, {
      title: "Visitor Analytics | MovieAurSeries",
      description: "Track visit statistics and page popularity on MovieAurSeries.",
    });
  } catch (err) {
    console.error("Error fetching visits:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* -------------------------- GET BY GENRE -------------------------- */
router.get("/genre/:genre", async (req, res) => {
  try {
    const genreParam = req.params.genre;
    const page = parseIntParam(req.query.page, 0);
    const size = 12;

    // Fetch all contents (both movies + webseries) by genre
    const contents = await contentService.getContentsByGenre(genreParam, page, size);
    const totalCount = await contentService.countContentsByGenre(genreParam);
    const totalPages = Math.ceil(totalCount / size);

    // Format genre for display (e.g., "sci-fi" → "Sci Fi")
    const formattedGenre = genreParam
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    await renderPage(
      res,
      "content",
      {
        contents,
        currentPage: page,
        totalPages,
        currentPath: req.originalUrl,
        genre: formattedGenre,
        contentType: "all", // no filter by type
      },
      {
        title: `${formattedGenre} Movies & Web Series | MovieAurSeries`,
        description: `Explore top-rated ${formattedGenre} movies and web series on MovieAurSeries. Watch and download in HD quality.`,
        keywords: `${formattedGenre}, movies, webseries, Hindi dubbed, MovieAurSeries`,
      }
    );
  } catch (err) {
    console.error("Error fetching by genre:", err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/search", async (req, res) => {
  try {
    const page = parseIntParam(req.query.page, 0);
    const keyword = req.query.keyword?.trim() || "";
    const size = 12;

    // Fetch both types in parallel
    const [movies, webseries] = await Promise.all([
      contentService.searchContentsByTypeAndKeyword("MOVIE", keyword, page, size),
      contentService.searchContentsByTypeAndKeyword("WEBSERIES", keyword, page, size)
    ]);

    // Combine both results
    const contents = [...movies, ...webseries];

    // For pagination (optional): total count from both
    const [movieCount, webCount] = await Promise.all([
      contentService.countContentsByTypeAndKeyword("MOVIE", keyword),
      contentService.countContentsByTypeAndKeyword("WEBSERIES", keyword)
    ]);

    const totalCount = movieCount + webCount;
    const totalPages = Math.ceil(totalCount / size);

    await renderPage(res, "content", {
      contents,
      currentPage: page,
      keyword,
      totalPages,
      contentType: "all",
      currentPath: "/search",
    }, {
      title: `Search Results for "${keyword}" | MovieAurSeries`,
      description: `Find the best movies and web series for "${keyword}" on MovieAurSeries.`,
      keywords: `${keyword}, movies, webseries, Hindi dubbed, HD, MovieAurSeries`,
    });
  } catch (err) {
    console.error("Error in universal search:", err);
    res.status(500).send("Internal Server Error");
  }
});

/* -------------------------- FALLBACK -------------------------- */
router.get("*", (req, res) => {
  console.warn("No matching route for:", req.originalUrl); // helpful for debugging
  renderPage(res, "default_page", {}, {
    title: "Page Not Found | MovieAurSeries",
    description: "Oops! The page you are looking for doesn’t exist. Explore latest movies instead.",
  });
});


export default router;
