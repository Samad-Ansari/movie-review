// repositories/visitRepository.js
import sql from "../config/db.js"; // Supabase postgres client

// 1. Count visits since a given date
export const countVisitsSince = async (startDate) => {
  const result = await sql`
    SELECT COUNT(*) AS count
    FROM visits
    WHERE timestamp >= ${startDate}
  `;
  return parseInt(result[0].count, 10);
};

// 2. Count visits after a specific time
export const countByTimestampAfter = async (time) => {
  const result = await sql`
    SELECT COUNT(*) AS count
    FROM visits
    WHERE timestamp > ${time}
  `;
  return parseInt(result[0].count, 10);
};

// 3. Find top visited URLs (with limit + offset)
export const findTopUrls = async (limit = 5, offset = 0) => {
  const result = await sql`
    SELECT page_url, COUNT(*) AS visit_count
    FROM visits
    GROUP BY page_url
    ORDER BY visit_count DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
};

// 4. Count visits per day between start and end
export const countVisitsPerDay = async (startDate, endDate) => {
  const result = await sql`
    SELECT DATE(timestamp) AS visit_date, COUNT(*) AS visit_count
    FROM visits
    WHERE timestamp BETWEEN ${startDate} AND ${endDate}
    GROUP BY visit_date
    ORDER BY visit_date ASC
  `;
  return result;
};
