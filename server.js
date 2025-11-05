// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { loadData } from "./utils/loadData.js";


import contentRouter from "./controllers/contentController.js";
import adminRouter from "./controllers/adminController.js";
import downloadRouter from "./controllers/downloadController.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// --- Utilities to get __dirname in ES module ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors());
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (css, js, images)
app.use(express.static(path.join(__dirname, "public")));

// --- View Engine ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Load CSV data before routes
await loadData(); // run once at startup before starting server


// --- Routes ---
app.use("/admin", adminRouter); 
app.use("/file", downloadRouter);
app.use("/", contentRouter);

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
