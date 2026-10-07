// All calls go through the Vite proxy (/api -> http://localhost:5000).
// For production set VITE_API_URL (e.g. https://api.example.com) when building.
const BASE = import.meta.env.VITE_API_URL || "";

export const imageUrl = (path) => (path ? `${BASE}${path}` : "");

async function request(url, options) {
  const res = await fetch(`${BASE}${url}`, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Something went wrong");
  return body;
}

// GET /api/hotels  -> { data: [...], pagination: { page, limit, total, totalPages } }
export function fetchHotels(params = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) qs.append(key, value);
  });
  return request(`/api/hotels?${qs.toString()}`);
}

export const fetchHotel = (id) => request(`/api/hotels/${id}`);

// formData must contain the text fields and (optionally) a file under the key "image"
export const createHotel = (formData) =>
  request("/api/hotels", { method: "POST", body: formData });

export const updateHotel = (id, formData) =>
  request(`/api/hotels/${id}`, { method: "PUT", body: formData });

export const deleteHotel = (id) =>
  request(`/api/hotels/${id}`, { method: "DELETE" });
