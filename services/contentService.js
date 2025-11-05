import fs from "fs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const CONTENT_FILE = "./data/content_rows.csv";
const LINKS_FILE = "./data/links_rows.csv";

let cache = {
  contents: [],
  links: [],
  loaded: false,
};

function readCSV(file) {
  if (!fs.existsSync(file)) return [];
  const data = fs.readFileSync(file, "utf8");
  return parse(data, { columns: true });
}

function writeCSV(file, data) {
  const csv = stringify(data, { header: true });
  fs.writeFileSync(file, csv, "utf8");
}

export function loadData(forceReload = false) {
  if (!cache.loaded || forceReload) {
    console.log("🔁 Loading CSV data from disk...");
    cache.contents = readCSV(CONTENT_FILE);
    cache.links = readCSV(LINKS_FILE);
    cache.loaded = true;
  } else {
    // console.log("✅ Using cached CSV data");
  }

  return cache;
}

// ------------------ HELPERS ------------------

const paginate = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

// ------------------ CORE METHODS ------------------

// Get all contents with pagination
export const getAllContents = async (page = 0, size = 10) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  return contents.slice(offset, offset + limit);
};

// Count by type + keyword
export const countContentsByTypeAndKeyword = async (type, keyword = "") => {
  const { contents } = loadData();
  return contents.filter(
    (c) =>
      c.type === type &&
      c.name.toLowerCase().includes(keyword.toLowerCase())
  ).length;
};

// Search by name
export const searchContents = async (keyword, page = 0, size = 10) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  const filtered = contents.filter((c) =>
    c.name.toLowerCase().includes(keyword.toLowerCase())
  );
  return filtered.slice(offset, offset + limit);
};

// Get contents by type
export const getContentsByType = async (type, page = 0, size = 10) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);

  const filtered = contents
    .filter((c) => c.type === type)
    .sort((a, b) => Number(b.id) - Number(a.id)); // ✅ newest first

  return filtered.slice(offset, offset + limit);
};


// Search by type + keyword
export const searchContentsByTypeAndKeyword = async (
  type,
  keyword,
  page = 0,
  size = 10
) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  const filtered = contents.filter(
    (c) =>
      c.type === type &&
      c.name.toLowerCase().includes(keyword.toLowerCase())
  );
  return filtered.slice(offset, offset + limit);
};

// Find content by ID + links
export const findById = async (contentId) => {
  const { contents, links } = loadData();
  const content = contents.find((c) => +c.id === +contentId);
  if (!content) return null;
  content.links = links.filter((l) => +l.content_id === +contentId);
  return content;
};

// Save single content (with links)
export const saveContent = async (content) => {
  const { contents, links } = loadData();

  const newId = contents.length
    ? Math.max(...contents.map((c) => +c.id)) + 1
    : 1;

  const newContent = {
    id: newId,
    name: content.name,
    rating: content.rating,
    genre: content.genre,
    plot_summary: content.plotSummary,
    poster_url: content.posterUrl,
    release_year: content.releaseYear,
    duration: content.duration,
    type: content.type,
  };

  contents.push(newContent);
  writeCSV(CONTENT_FILE, contents);

  // Save links if any
  if (content.links?.length) {
    const nextLinkId = links.length
      ? Math.max(...links.map((l) => +l.id)) + 1
      : 1;

    const newLinks = content.links.map((l, i) => ({
      id: nextLinkId + i,
      title: l.title,
      link: l.link,
      content_id: newId,
    }));

    writeCSV(LINKS_FILE, [...links, ...newLinks]);
  }

  return newContent;
};

// Save multiple contents
export const saveAllContent = async (list) => {
  const results = [];
  for (const item of list) {
    results.push(await saveContent(item));
  }
  return results;
};

// Delete content by ID
export const deleteById = async (id) => {
  const { contents, links } = loadData();
  const newContents = contents.filter((c) => +c.id !== +id);
  const newLinks = links.filter((l) => +l.content_id !== +id);

  writeCSV(CONTENT_FILE, newContents);
  writeCSV(LINKS_FILE, newLinks);
};

// Add link to content
export const addLinkToContent = async (contentId, link) => {
  const { links } = loadData();
  const newId = links.length ? Math.max(...links.map((l) => +l.id)) + 1 : 1;

  const newLink = {
    id: newId,
    title: link.title,
    link: link.link,
    content_id: contentId,
  };

  links.push(newLink);
  writeCSV(LINKS_FILE, links);
  return newLink;
};

// Delete link from content
export const deleteLinkFromContent = async (contentId, linkId) => {
  const { links } = loadData();
  const filtered = links.filter(
    (l) => !(+l.content_id === +contentId && +l.id === +linkId)
  );
  writeCSV(LINKS_FILE, filtered);
  return filtered.length < links.length;
};

// 1. Search by name with pagination
export const findByName = async (keyword, page = 0, size = 10) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  const filtered = contents.filter((c) =>
    c.name.toLowerCase().includes(keyword.toLowerCase())
  );
  return filtered.slice(offset, offset + limit);
};

// 2. Find by id and type
export const findByIdAndType = async (id, type) => {
  const { contents } = loadData();
  return contents.find((c) => +c.id === +id && c.type === type);
};

// 3. Find by type with pagination
export const findByType = async (type, page = 0, size = 10) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  const filtered = contents.filter((c) => c.type === type);
  return filtered.slice(offset, offset + limit);
};

// 4. Find by type + keyword
export const findByTypeAndName = async (type, keyword, page = 0, size = 10) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  const filtered = contents.filter(
    (c) =>
      c.type === type &&
      c.name.toLowerCase().includes(keyword.toLowerCase())
  );
  return filtered.slice(offset, offset + limit);
};

// 5. Count contents by type
export const countContentsByType = async (type) => {
  const { contents } = loadData();
  return contents.filter((c) => c.type === type).length;
};

/* ===========================================================
   GENRE-BASED QUERIES
   =========================================================== */

// Get contents by genre & type
export const getContentsByGenreAndType = async (
  genre,
  type,
  page = 0,
  size = 10
) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  const filtered = contents.filter(
    (c) =>
      c.type === type &&
      c.genre.toLowerCase().includes(genre.toLowerCase())
  );
  return filtered.slice(offset, offset + limit);
};

// Count by genre & type
export const countContentsByGenreAndType = async (genre, type) => {
  const { contents } = loadData();
  return contents.filter(
    (c) =>
      c.type === type &&
      c.genre.toLowerCase().includes(genre.toLowerCase())
  ).length;
};

// Get contents by genre (all types)
export const getContentsByGenre = async (genre, page = 0, size = 10) => {
  const { contents } = loadData();
  const { limit, offset } = paginate(page, size);
  const filtered = contents.filter((c) =>
    c.genre.toLowerCase().includes(genre.toLowerCase())
  );
  return filtered.slice(offset, offset + limit);
};

// Count by genre (all types)
export const countContentsByGenre = async (genre) => {
  const { contents } = loadData();
  return contents.filter((c) =>
    c.genre.toLowerCase().includes(genre.toLowerCase())
  ).length;
};

