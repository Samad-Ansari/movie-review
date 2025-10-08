// services/contentService.js
import sql from "../config/db.js"; // Supabase postgres client

// ------------------ CONTENT ------------------

// Pagination helper
const paginate = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

// Get all contents with pagination
export const getAllContents = async (page = 0, size = 10) => {
  const { limit, offset } = paginate(page, size);
  const result = await sql`
    SELECT * FROM content
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
};

// Get total count of movies (optionally filter by keyword)
export const countContentsByTypeAndKeyword = async (type, keyword = "") => {
  if (keyword) {
    const result = await sql`
      SELECT COUNT(*) FROM content
      WHERE type = ${type} AND LOWER(name) LIKE '%' || LOWER(${keyword}) || '%'
    `;
    return parseInt(result[0].count, 10);
  } else {
    const result = await sql`
      SELECT COUNT(*) FROM content WHERE type = ${type}
    `;
    return parseInt(result[0].count, 10);
  }
};


// Search contents by name
export const searchContents = async (keyword, page = 0, size = 10) => {
  return findByName(keyword, page, size);
};

// Get contents by type
export const getContentsByType = async (type, page = 0, size = 10) => {
  return findByType(type, page, size);
};

// Search contents by type + keyword
export const searchContentsByTypeAndKeyword = async (type, keyword, page = 0, size = 10) => {
  return findByTypeAndName(type, keyword, page, size);
};

// Find by ID
// Find content by ID with all links
export const findById = async (contentId) => {
  // Fetch the content
  const contentResult = await sql`
    SELECT * FROM content WHERE id = ${contentId}
  `;
  const content = contentResult[0];

  if (!content) return null;

  // Fetch associated links
  const linksResult = await sql`
    SELECT * FROM links WHERE content_id = ${contentId} ORDER BY id ASC
  `;

  content.links = linksResult; // attach links to content object
  return content;
};

// Save single content (with links)
export const saveContent = async (content) => {
  const inserted = await sql`
    INSERT INTO content
      (name, rating, genre, plot_summary, poster_url, release_year, duration, type)
    VALUES
      (${content.name}, ${content.rating}, ${content.genre}, ${content.plotSummary}, ${content.posterUrl}, ${content.releaseYear}, ${content.duration}, ${content.type})
    RETURNING *;
  `;

  const contentId = inserted[0].id;

  // Insert links if provided
  if (content.links && content.links.length > 0) {
    for (const link of content.links) {
      await sql`
        INSERT INTO links (title, link, content_id)
        VALUES (${link.title}, ${link.link}, ${contentId});
      `;
    }
  }

  return inserted[0];
};

// Save multiple contents
export const saveAllContent = async (contents) => {
  const results = [];
  for (const content of contents) {
    const saved = await saveContent(content);
    results.push(saved);
  }
  return results;
};

// Delete content by ID
export const deleteById = async (id) => {
  await sql`
    DELETE FROM content WHERE id = ${id};
  `;
};

// Add link to content
export const addLinkToContent = async (contentId, link) => {
  const inserted = await sql`
    INSERT INTO links (title, link, content_id)
    VALUES (${link.title}, ${link.link}, ${contentId})
    RETURNING *;
  `;
  return inserted[0];
};

// Delete link from content
export const deleteLinkFromContent = async (contentId, linkId) => {
  const result = await sql`
    DELETE FROM links
    WHERE id = ${linkId} AND content_id = ${contentId}
    RETURNING *;
  `;
  return result.length > 0;
};

// 1. Search by name with pagination
export const findByName = async (keyword, page = 0, size = 10) => {
  const { limit, offset } = paginate(page, size);
  const result = await sql`
    SELECT * FROM content
    WHERE LOWER(name) LIKE LOWER(${`%${keyword}%`})
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
};

// 2. Find by id and type
export const findByIdAndType = async (id, type) => {
  const result = await sql`
    SELECT * FROM content
    WHERE id = ${id} AND type = ${type}
  `;
  return result[0]; // single object
};

// 3. Find by type with pagination
export const findByType = async (type, page = 0, size = 10) => {
  const { limit, offset } = paginate(page, size);
  const result = await sql`
    SELECT * FROM content
    WHERE type = ${type}
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
};

// 4. Find by type + keyword with pagination
export const findByTypeAndName = async (type, keyword, page = 0, size = 10) => {
  const { limit, offset } = paginate(page, size);
  const result = await sql`
    SELECT * FROM content
    WHERE type = ${type} AND LOWER(name) LIKE LOWER(${`%${keyword}%`})
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
};


export async function countContentsByType(type) {
    const result = await sql`
    SELECT COUNT(*) as total
    FROM content
    WHERE type = ${type}
  `;
  return result[0].total; // total number of rows for this type
}
