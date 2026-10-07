import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import "./HotelForm.css";
import {
  fetchHotels,
  fetchHotel,
  updateHotel,
  imageUrl,
} from "../api/hotels";

const emptyHotel = {
  name: "",
  location: "",
  description: "",
  price: "",
  rating: "",
  latitude: "",
  longitude: "",
};

function UpdateHotel() {
  const [hotelList, setHotelList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [hotel, setHotel] = useState(emptyHotel);
  const [currentImage, setCurrentImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const loadList = () =>
    fetchHotels({ limit: 100, sortBy: "name", order: "asc" })
      .then((res) => setHotelList(res.data))
      .catch((err) => setMessage({ type: "error", text: err.message }));

  // Fill the dropdown with hotels from the database
  useEffect(() => {
    loadList();
  }, []);

  // When a hotel is selected, load its details into the form
  const handleSelect = async (e) => {
    const id = e.target.value;
    setSelectedId(id);
    setMessage(null);
    setImageFile(null);
    setFileKey((k) => k + 1);

    if (!id) {
      setHotel(emptyHotel);
      setCurrentImage("");
      return;
    }

    try {
      const data = await fetchHotel(id);
      setHotel({
        name: data.name,
        location: data.location,
        description: data.description,
        price: data.price,
        rating: data.rating,
        latitude: data.latitude ?? "",
        longitude: data.longitude ?? "",
      });
      setCurrentImage(data.image || "");
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHotel((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!selectedId) {
      setMessage({ type: "error", text: "Please select a hotel first." });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    Object.entries(hotel).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append("image", imageFile);

    try {
      const updated = await updateHotel(selectedId, formData);
      setCurrentImage(updated.image || "");
      setImageFile(null);
      setFileKey((k) => k + 1);
      setMessage({ type: "success", text: "Hotel updated successfully!" });
      loadList();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hotel-form-page">

      <Helmet>
        <title>Update Hotel | KeySphere</title>
        <meta
          name="description"
          content="Update hotel details, price, rating, image and latitude/longitude coordinates on KeySphere."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="hotel-form">

        <h1>Update Hotel</h1>

        <p>
          Select a hotel and update its information.
        </p>

        <div className="form-group">

          <label>Select Hotel</label>

          <select value={selectedId} onChange={handleSelect}>
            <option value="">Select a hotel</option>

            {hotelList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>

        </div>

        <div className="form-group">

          <label>Hotel Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter updated hotel name"
            value={hotel.name}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Location</label>

          <input
            type="text"
            name="location"
            placeholder="Enter updated location"
            value={hotel.location}
            onChange={handleChange}
          />

        </div>

        <div className="form-group">

          <label>Description</label>

          <textarea
            name="description"
            placeholder="Enter updated description"
            value={hotel.description}
            onChange={handleChange}
          />

        </div>

        <div className="form-row">

          <div className="form-group">

            <label>Price / Night</label>

            <input
              type="number"
              name="price"
              placeholder="Enter price"
              min="0"
              value={hotel.price}
              onChange={handleChange}
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

          {currentImage && !imageFile && (
            <img
              className="image-preview"
              src={imageUrl(currentImage)}
              alt="Current hotel"
            />
          )}

          {imageFile && (
            <img
              className="image-preview"
              src={URL.createObjectURL(imageFile)}
              alt="New preview"
            />
          )}

          <input
            key={fileKey}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={(e) => setImageFile(e.target.files[0] || null)}
          />

        </div>

        {message && (
          <p className={`form-message ${message.type}`}>{message.text}</p>
        )}

        <button
          className="form-submit"
          onClick={handleUpdate}
          disabled={submitting}
        >
          {submitting ? "Updating..." : "Update Hotel"}
        </button>

      </div>

    </div>
  );
}

export default UpdateHotel;
