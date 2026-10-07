import { query } from '../config/db.js';
import { toImagePath, removeImageFile } from '../middleware/upload.js';

// NUMERIC is cast to float so JSON contains numbers, not strings.
const COLUMNS = `
  id, name, location, description,
  price::float  AS price,
  rating::float AS rating,
  latitude::float  AS latitude,
  longitude::float AS longitude,
  image_path    AS image,
  created_at, updated_at
`;

const SORTABLE = {
  price: 'price',
  rating: 'rating',
  name: 'name',
  newest: 'created_at',
};

const httpError = (status, message) => Object.assign(new Error(message), { status });

const parseId = (raw) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw httpError(400, 'Invalid hotel id');
  return id;
};

// Validates body fields. With partial=true (PUT) only provided fields are checked.
// Returns only the clean, provided fields.
const validateHotel = (body, { partial = false } = {}) => {
  const out = {};
  const errors = [];

  const text = (field, max) => {
    const v = body[field];
    if (v === undefined) {
      if (!partial) errors.push(`${field} is required`);
      return;
    }
    const s = String(v).trim();
    if (!s) errors.push(`${field} cannot be empty`);
    else if (max && s.length > max) errors.push(`${field} must be at most ${max} characters`);
    else out[field] = s;
  };

  const number = (field, min, max) => {
    const v = body[field];
    if (v === undefined || v === '') {
      if (!partial) errors.push(`${field} is required`);
      return;
    }
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) {
      errors.push(`${field} must be a number between ${min} and ${max}`);
    } else out[field] = n;
  };

  // Optional coordinate: empty string clears it (NULL), otherwise must be in range
  const coordinate = (field, min, max) => {
    const v = body[field];
    if (v === undefined) return;
    if (v === '' || v === null || String(v).trim() === '') {
      out[field] = null;
      return;
    }
    const n = Number(v);
    if (!Number.isFinite(n) || n < min || n > max) {
      errors.push(`${field} must be a number between ${min} and ${max}`);
    } else out[field] = n;
  };

  text('name', 150);
  text('location', 150);
  text('description');
  number('price', 0, 99999999);
  number('rating', 0, 5);
  coordinate('latitude', -90, 90);
  coordinate('longitude', -180, 180);

  if (errors.length) throw httpError(400, errors.join(', '));
  return out;
};

const isNum = (v) => v !== undefined && v !== '' && !Number.isNaN(Number(v));

// GET /api/hotels
export const getHotels = async (req, res, next) => {
  try {
    const { name, location, minPrice, maxPrice, minRating, sortBy, order } = req.query;

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 4, 1), 100);
    const offset = (page - 1) * limit;

    // WHERE is built dynamically, but values are always passed as $n parameters
    const where = [];
    const params = [];
    const add = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (typeof name === 'string' && name.trim()) where.push(`name ILIKE ${add(`%${name.trim()}%`)}`);
    if (typeof location === 'string' && location.trim()) where.push(`location ILIKE ${add(`%${location.trim()}%`)}`);
    if (isNum(minPrice)) where.push(`price >= ${add(Number(minPrice))}`);
    if (isNum(maxPrice)) where.push(`price <= ${add(Number(maxPrice))}`);
    if (isNum(minRating)) where.push(`rating >= ${add(Number(minRating))}`);

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const filterParams = [...params];

    // Whitelisted - raw user input is never put into ORDER BY
    const sortColumn = SORTABLE[sortBy] || 'id';
    const direction = String(order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const limitPh = add(limit);
    const offsetPh = add(offset);

    const { rows } = await query(
      `SELECT ${COLUMNS}, COUNT(*) OVER()::int AS total_count
       FROM hotels
       ${whereSql}
       ORDER BY ${sortColumn} ${direction}, id ASC
       LIMIT ${limitPh} OFFSET ${offsetPh}`,
      params
    );

    // Page past the end returns no rows, so count separately to keep totals correct
    let total = rows[0]?.total_count;
    if (total === undefined) {
      const c = await query(`SELECT COUNT(*)::int AS total FROM hotels ${whereSql}`, filterParams);
      total = c.rows[0].total;
    }

    res.json({
      data: rows.map(({ total_count, ...hotel }) => hotel),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/hotels/:id
export const getHotelById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { rows } = await query(`SELECT ${COLUMNS} FROM hotels WHERE id = $1`, [id]);
    if (!rows.length) throw httpError(404, 'Hotel not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

// POST /api/hotels
export const createHotel = async (req, res, next) => {
  const imagePath = toImagePath(req.file);
  try {
    const h = validateHotel(req.body);

    const { rows } = await query(
      `INSERT INTO hotels (name, location, description, price, rating, latitude, longitude, image_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING ${COLUMNS}`,
      [h.name, h.location, h.description, h.price, h.rating, h.latitude ?? null, h.longitude ?? null, imagePath]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    removeImageFile(imagePath); // no orphan file if validation/insert failed
    next(err);
  }
};

// PUT /api/hotels/:id
export const updateHotel = async (req, res, next) => {
  const newImagePath = toImagePath(req.file);
  try {
    const id = parseId(req.params.id);
    const fields = validateHotel(req.body, { partial: true });

    if (newImagePath) fields.image_path = newImagePath;
    if (!Object.keys(fields).length) throw httpError(400, 'Nothing to update');

    const existing = await query('SELECT image_path FROM hotels WHERE id = $1', [id]);
    if (!existing.rows.length) throw httpError(404, 'Hotel not found');
    const oldImagePath = existing.rows[0].image_path;

    const params = [];
    // column names come from validateHotel's fixed whitelist, values are parameters
    const sets = Object.entries(fields).map(([col, val]) => {
      params.push(val);
      return `${col} = $${params.length}`;
    });
    sets.push('updated_at = NOW()');
    params.push(id);

    const { rows } = await query(
      `UPDATE hotels SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${COLUMNS}`,
      params
    );

    if (newImagePath) removeImageFile(oldImagePath); // replace old file with the new one
    res.json(rows[0]);
  } catch (err) {
    removeImageFile(newImagePath);
    next(err);
  }
};

// DELETE /api/hotels/:id
export const deleteHotel = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { rows } = await query('DELETE FROM hotels WHERE id = $1 RETURNING id, image_path', [id]);
    if (!rows.length) throw httpError(404, 'Hotel not found');

    removeImageFile(rows[0].image_path);
    res.json({ message: 'Hotel deleted successfully', id: rows[0].id });
  } catch (err) {
    next(err);
  }
};
