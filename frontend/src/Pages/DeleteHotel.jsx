import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import "./HotelForm.css";
import { fetchHotels, deleteHotel } from "../api/hotels";

function DeleteHotel() {
  const [hotelList, setHotelList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState(null);

  const loadList = () =>
    fetchHotels({ limit: 100, sortBy: "name", order: "asc" })
      .then((res) => setHotelList(res.data))
      .catch((err) => setMessage({ type: "error", text: err.message }));

  useEffect(() => {
    loadList();
  }, []);

  const handleDelete = async () => {
    if (!selectedId) {
      setMessage({ type: "error", text: "Please select a hotel first." });
      return;
    }

    const hotel = hotelList.find((h) => String(h.id) === selectedId);
    if (!window.confirm(`Delete "${hotel?.name}"? This cannot be undone.`)) return;

    setDeleting(true);
    setMessage(null);

    try {
      await deleteHotel(selectedId);
      setMessage({ type: "success", text: "Hotel deleted successfully!" });
      setSelectedId("");
      loadList();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="hotel-form-page">
      <Helmet>
        <title>Delete Hotel | KeySphere</title>
        <meta name="description" content="Remove a hotel from the KeySphere hotel collection." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>


      <div className="hotel-form">

        <h1>Delete Hotel</h1>

        <p>
          Select the hotel you want to delete.
        </p>

        <div className="form-group">

          <label>Select Hotel</label>

          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">Select a hotel</option>

            {hotelList.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}

          </select>

        </div>

        {message && (
          <p className={`form-message ${message.type}`}>{message.text}</p>
        )}

        <button
          className="form-submit delete-button"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete Hotel"}
        </button>

      </div>

    </div>
  );
}

export default DeleteHotel;
