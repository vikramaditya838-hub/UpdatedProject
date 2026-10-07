import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./HotelForm.css";
import { createHotel } from "../api/hotels";

const emptyHotel = {
  name: "",
  location: "",
  description: "",
  price: "",
  rating: "",
  latitude: "",
  longitude: "",
};

function AddHotel() {
  const [hotel, setHotel] = useState(emptyHotel);
  const [imageFile, setImageFile] = useState(null);
  const [fileKey, setFileKey] = useState(0); // used to reset the file input
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setHotel((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // multipart/form-data so the image file can be uploaded
    const formData = new FormData();
    Object.entries(hotel).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append("image", imageFile);

    try {
      await createHotel(formData);
      setMessage({ type: "success", text: "Hotel added successfully!" });
      setHotel(emptyHotel);
      setImageFile(null);
      setFileKey((k) => k + 1);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hotel-form-page">
      <Helmet>
        <title>Add New Hotel | KeySphere</title>
        <meta
          name="description"
          content="Add a new hotel with its price, rating, image and map coordinates to the KeySphere hotel collection."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="hotel-form">

        <h1>Add New Hotel</h1>

        <p>
          Add a new hotel to your hotel collection.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Hotel Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter hotel name"
              value={hotel.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              name="location"
              placeholder="Enter location"
              value={hotel.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Enter hotel description"
              value={hotel.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Price / Night</label>

              <input
                type="number"
                name="price"
                placeholder="2500"
                min="0"
                value={hotel.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Rating</label>

              <input
                type="number"
                name="rating"
                placeholder="4.5"
                min="1"
                max="5"
                step="0.1"
                value={hotel.rating}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="form-row">

            <div className="form-group">
              <label>Latitude</label>

              <input
                type="number"
                name="latitude"
                placeholder="e.g. 19.076090"
                min="-90"
                max="90"
                step="any"
                value={hotel.latitude}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Longitude</label>

              <input
                type="number"
                name="longitude"
                placeholder="e.g. 72.877426"
                min="-180"
                max="180"
                step="any"
                value={hotel.longitude}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-group">
            <label>Hotel Image</label>

            <input
              key={fileKey}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setImageFile(e.target.files[0] || null)}
            />

            {imageFile && (
              <img
                className="image-preview"
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
              />
            )}
          </div>

          {message && (
            <p className={`form-message ${message.type}`}>{message.text}</p>
          )}

          <button
            type="submit"
            className="form-submit"
            disabled={submitting}
          >
            {submitting ? "Adding..." : "Add Hotel"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default AddHotel;
