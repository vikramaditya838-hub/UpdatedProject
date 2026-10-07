import { useState } from "react";
import { Helmet } from "react-helmet-async";
import "./App.css";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Navbar from "./Components/Navbar/Navbar";
import Hero from "./Components/Hero/Hero";
import HotelCard from "./Components/HotelCardSection/HotelCard";
import AddHotel from "./Pages/AddHotel";
import UpdateHotel from "./Pages/UpdateHotel";
import DeleteHotel from "./Pages/DeleteHotel";
import HotelDetails from "./Pages/HotelDetails";


function Home() {
  // Filters submitted from the Hero search form; HotelCard fetches from the API with them
  const [filters, setFilters] = useState({});

  return (
    <>
      <Helmet>
        <title>KeySphere – Hotel Management | Find Top-Rated Hotels</title>
        <meta
          name="description"
          content="Search and compare top-rated hotels by location, price and rating. Explore hotel details, photos and map location on KeySphere."
        />
        <link rel="canonical" href={window.location.origin + "/"} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="KeySphere – Hotel Management" />
        <meta
          property="og:description"
          content="Search and compare top-rated hotels by location, price and rating."
        />
      </Helmet>

      <Hero onSearch={setFilters} />

      <HotelCard key={JSON.stringify(filters)} filters={filters} />

    </>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/add-hotel"
          element={<AddHotel />}
        />

        <Route
          path="/update-hotel"
          element={<UpdateHotel />}
        />

        <Route
          path="/delete-hotel"
          element={<DeleteHotel />}
        />

        <Route
          path="/hotel/:id"
          element={<HotelDetails />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;