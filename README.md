# HotelPro (KeySphere) – Full Stack

- `frontend/` – React + Vite (your original UI, now connected to the API)
- `backend/`  – Node.js + Express + PostgreSQL (native SQL via `pg`, images stored on disk)

## 1. Setup the database
```sql
CREATE DATABASE hotelpro;
```

## 2. Backend
```bash
cd backend
npm install
cp .env.example .env        # then put your PostgreSQL password in .env
npm run db:init             # creates the "hotels" table
npm run db:seed             # (optional) inserts your 8 sample hotels + copies their images
npm run dev                 # http://localhost:5000
```

## 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173  (proxies /api and /uploads to :5000)
```

## REST API

| Method | Endpoint          | Purpose                                         |
|--------|-------------------|-------------------------------------------------|
| GET    | /api/hotels       | List hotels with search, filters, pagination    |
| GET    | /api/hotels/:id   | Get one hotel                                   |
| POST   | /api/hotels       | Add a hotel (multipart/form-data, `image` file) |
| PUT    | /api/hotels/:id   | Update a hotel (multipart/form-data, `image` optional) |
| DELETE | /api/hotels/:id   | Delete a hotel (also removes its image file)    |

### GET /api/hotels query params
`name`, `location` (partial, case-insensitive), `minPrice`, `maxPrice`, `minRating`,
`sortBy` (`price|rating|name|newest`), `order` (`asc|desc`), `page` (default 1), `limit` (default 4, max 100)

Response:
```json
{
  "data": [{ "id": 1, "name": "...", "location": "...", "description": "...",
             "price": 2500, "rating": 4.5, "image": "/uploads/abc.jpg" }],
  "pagination": { "page": 1, "limit": 4, "total": 8, "totalPages": 2 }
}
```

### Images
Uploaded files (JPG/PNG/WEBP/AVIF, max 5 MB) are saved in `backend/uploads/`.
Only the path (e.g. `/uploads/1718000000-ab12cd.jpg`) is stored in the `image_path` column.
Old images are deleted when a hotel's image is replaced or the hotel is deleted.
