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

export function getAllContents() {
  return loadData().contents;
}

export function findById(id) {
  const data = loadData().contents;
  return data.find(
    (c) => String(c.id).trim() === String(id).trim()
  );
}

export function getLinksByContentId(contentId) {
  const data = loadData().links;
  return data.filter(
    (l) => String(l.content_id).trim() === String(contentId).trim()
  );
}

export function addContent(newContent) {
  const data = loadData().contents;
  data.push(newContent);
  writeCSV(CONTENT_FILE, data);
  cache.contents = data; // update cache
}

export function addLink(newLink) {
  const data = loadData().links;
  data.push(newLink);
  writeCSV(LINKS_FILE, data);
  cache.links = data; // update cache
}

export function refreshCache() {
  cache.loaded = false;
  loadData(true);
}
