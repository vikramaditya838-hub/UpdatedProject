import { useState } from "react";
import "./Hero.css";

function Hero({ onSearch }) {
  const [searchData, setSearchData] = useState({
    hotelName: "",
    location: "",
    minPrice: "",
    maxPrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSearchData({
      ...searchData,
      [name]: value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();

    onSearch?.({
      name: searchData.hotelName,
      location: searchData.location,
      minPrice: searchData.minPrice,
      maxPrice: searchData.maxPrice,
    });
  };

  return (
    <section className="hero">
      <h1>Your Journey Starts Here</h1>

      <p>Discover comfortable hotels at the best</p>

      <p className="hero-description">
        locations and affordable prices.
      </p>

      <form className="hotel-search" onSubmit={handleSearch}>

        {/* Hotel Name */}
        <div className="search-field">
          <label>Hotel Name</label>

          <input
            type="text"
            name="hotelName"
            placeholder="Search hotel name"
            value={searchData.hotelName}
            onChange={handleChange}
          />
        </div>

        {/* Location */}
        <div className="search-field">
          <label>Location</label>

          <input
            type="text"
            name="location"
            placeholder="Search location"
            value={searchData.location}
            onChange={handleChange}
          />
        </div>

        {/* Minimum Price */}
        <div className="search-field">
          <label>Min Price</label>

          <input
            type="number"
            name="minPrice"
            placeholder="Min price"
            value={searchData.minPrice}
            onChange={handleChange}
          />
        </div>

        {/* Maximum Price */}
        <div className="search-field">
          <label>Max Price</label>

          <input
            type="number"
            name="maxPrice"
            placeholder="Max price"
            value={searchData.maxPrice}
            onChange={handleChange}
          />
        </div>

        {/* Search Button */}
        <button type="submit" className="search-button">
          Search
        </button>

      </form>
    </section>
  );
}

export default Hero;
