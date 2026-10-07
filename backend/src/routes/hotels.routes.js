import { Router } from 'express';
import { uploadImage } from '../middleware/upload.js';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotels.controller.js';

const router = Router();

router.get('/', getHotels);                    // GET    /api/hotels?name=&location=&minPrice=&maxPrice=&page=&limit=
router.get('/:id', getHotelById);              // GET    /api/hotels/:id
router.post('/', uploadImage, createHotel);    // POST   /api/hotels      (multipart/form-data, field "image")
router.put('/:id', uploadImage, updateHotel);  // PUT    /api/hotels/:id  (multipart/form-data, "image" optional)
router.delete('/:id', deleteHotel);            // DELETE /api/hotels/:id

export default router;
