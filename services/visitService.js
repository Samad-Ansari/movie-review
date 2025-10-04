// services/visitService.js
import * as visitRepo from "../repositories/visitRepository.js";
import sql from "../config/db.js"; // Supabase postgres client
import crypto from "crypto";

// Track visit
export const trackVisit = async (req, pageUrl) => {
  try {
    const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const ipHash = hashIp(ip);

    await sql`
      INSERT INTO visits (ip_hash, page_url, user_agent, timestamp)
      VALUES (${ipHash}, ${pageUrl}, ${userAgent}, NOW())
    `;
  } catch (err) {
    console.error("Error tracking visit:", err);
  }
};

// Hash IP (SHA-256)
const hashIp = (ip) => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};

// Delete all visits
export const deleteAllVisits = async () => {
  await sql`DELETE FROM visits`;
};

// Aggregated counts
export const getTodayVisits = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return await visitRepo.countByTimestampAfter(startOfDay);
};

export const getWeeklyVisits = async () => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return await visitRepo.countByTimestampAfter(sevenDaysAgo);
};

export const getMonthlyVisits = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return await visitRepo.countByTimestampAfter(thirtyDaysAgo);
};

// Top URLs
export const topUrlVisits = async () => {
  return await visitRepo.findTopUrls(20);
};

// Visits for last 7 days
export const getVisitsLast7Days = async () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);

  const endDate = new Date();
  const dbCounts = await visitRepo.countVisitsPerDay(startDate, endDate);

  const countsMap = new Map(
    dbCounts.map((row) => [
      row.visit_date.toISOString().split("T")[0],
      parseInt(row.visit_count, 10),
    ])
  );

  const result = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().split("T")[0];
    result.push(countsMap.get(key) || 0);
  }
  return result;
};

// Visits for last 30 days
export const getVisitsLast30Days = async () => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 29);

  const endDate = new Date();
  const dbCounts = await visitRepo.countVisitsPerDay(startDate, endDate);

  const countsMap = new Map(
    dbCounts.map((row) => [
      row.visit_date.toISOString().split("T")[0],
      parseInt(row.visit_count, 10),
    ])
  );

  const result = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const key = d.toISOString().split("T")[0];
    result.push(countsMap.get(key) || 0);
  }
  return result;
};
