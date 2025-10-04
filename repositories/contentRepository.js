import sql from "../config/db.js";

// Pagination helper
const paginate = (page, size) => {
  const limit = size ? +size : 10;
  const offset = page ? page * limit : 0;
  return { limit, offset };
};

// 1. Search by name with pagination
const findByName = async (keyword, page = 0, size = 10) => {
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
const findByIdAndType = async (id, type) => {
  const result = await sql`
    SELECT * FROM content
    WHERE id = ${id} AND type = ${type}
  `;
  return result[0]; // single object
};

// 3. Find by type with pagination
const findByType = async (type, page = 0, size = 10) => {
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
const findByTypeAndName = async (type, keyword, page = 0, size = 10) => {
  const { limit, offset } = paginate(page, size);
  const result = await sql`
    SELECT * FROM content
    WHERE type = ${type} AND LOWER(name) LIKE LOWER(${`%${keyword}%`})
    ORDER BY id DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return result;
};

export { findByName, findByIdAndType, findByType, findByTypeAndName };
