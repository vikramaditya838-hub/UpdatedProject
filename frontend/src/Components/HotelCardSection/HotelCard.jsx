import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HotelCard.css";
import Pagination from "../Pagination/Pagination";
import { fetchHotels, imageUrl } from "../../api/hotels";

const HOTELS_PER_PAGE = 4;

// App.jsx gives this component a new `key` for every search, so it remounts
// (page 1, loading state) automatically whenever the filters change.
function HotelCard({ filters = {} }) {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handlePageChange = (page) => {
    setLoading(true);
    setError("");
    setCurrentPage(page);
  };

  // Fetch hotels (search + filters + pagination all handled by the backend)
  useEffect(() => {
    let ignore = false;

    fetchHotels({ ...filters, page: currentPage, limit: HOTELS_PER_PAGE })
      .then((res) => {
        if (ignore) return;
        setHotels(res.data);
        setTotalPages(res.pagination.totalPages);
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [filters, currentPage]);

  return (
    <div className="card">
      <h1>Our Popular Hotels</h1>

      <p>
        Explore one of our top-rated hotels with the best facilities and
        services
      </p>

      {loading && <p>Loading hotels...</p>}

      {error && <p style={{ color: "#dc3545" }}>{error}</p>}

      {!loading && !error && hotels.length === 0 && (
        <p>No hotels found. Try changing your search.</p>
      )}

      <div className="hotel-container">
        {hotels.map((hotel) => (
          <div className="hotel-card" key={hotel.id}>
            <img src={imageUrl(hotel.image)} alt={hotel.name} />

            <div className="hotel-content">
              <p>⭐ {hotel.rating}</p>

              <h2>{hotel.name}</h2>

              <p>📍 {hotel.location}</p>

              <p>{hotel.description}</p>

              <h3>₹{hotel.price} / Night</h3>

              <button onClick={() => navigate(`/hotel/${hotel.id}`)}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

export default HotelCard;
