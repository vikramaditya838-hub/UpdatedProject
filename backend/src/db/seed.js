import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..', '..');
const uploadsDir = path.join(root, 'uploads');
const seedDir = path.join(root, 'seed-images');

const hotels = [
  ['Grand Palace Hotel', 'Mumbai, India', 'Enjoy a comfortable stay with modern facilities and great service.', 2500, 4.5, 'hotel-1.jpg'],
  ['Sea View Resort', 'Goa, India', 'Beautiful sea view rooms with premium amenities.', 3200, 4.3, 'hotel-2.webp'],
  ['Hilltop Luxury Hotel', 'Manali, India', 'Perfect stay for your vacation with amazing mountain views.', 2800, 4.7, 'hotel-3.jpg'],
  ['Royal Garden Hotel', 'Bangalore, India', 'Stay in the heart of the city with top class services.', 2000, 4.4, 'hotel-4.jpg'],
  ['Royal Stay Hotel', 'Delhi, India', 'Comfortable rooms with modern facilities.', 2200, 4.2, 'hotel-5.avif'],
  ['Sunset Paradise Hotel', 'Kerala, India', 'Relax and unwind with beautiful sunset views.', 3000, 4.6, 'hotel-6.jpg'],
  ['Mountain Retreat Hotel', 'Shimla, India', 'Escape to the mountains for a peaceful stay.', 3500, 4.8, 'hotel-7.jpg'],
  ['City Lights Hotel', 'Pune, India', 'Experience the vibrant city life with comfort.', 1800, 4.1, 'hotel-8.avif'],
];

try {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM hotels');
  if (rows[0].count > 0) {
    console.log(`hotels table already has ${rows[0].count} rows - seed skipped`);
  } else {
    fs.mkdirSync(uploadsDir, { recursive: true });
    for (const [name, location, description, price, rating, file] of hotels) {
      fs.copyFileSync(path.join(seedDir, file), path.join(uploadsDir, file));
      await pool.query(
        `INSERT INTO hotels (name, location, description, price, rating, image_path)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, location, description, price, rating, `/uploads/${file}`]
      );
    }
    console.log(`Seeded ${hotels.length} hotels`);
  }
} catch (err) {
  console.error('Seeding failed:', err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
