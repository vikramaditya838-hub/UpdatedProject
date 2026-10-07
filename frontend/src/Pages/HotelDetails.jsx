import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./HotelDetails.css";
import { fetchHotel, imageUrl } from "../api/hotels";

function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    fetchHotel(id)
      .then((data) => {
        if (!ignore) {
          setError("");
          setHotel(data);
        }
      })
      .catch((err) => {
        if (!ignore) setError(err.message);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (error) {
    return (
      <div className="details-page">
        <Helmet>
          <title>Hotel not found | KeySphere</title>
          <meta name="robots" content="noindex" />
        </Helmet>

        <div className="details-box">
          <p className="details-error">{error}</p>
          <Link className="details-back" to="/">← Back to Home</Link>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="details-page">
        <Helmet>
          <title>Loading hotel... | KeySphere</title>
        </Helmet>

        <div className="details-box">
          <p>Loading hotel...</p>
        </div>
      </div>
    );
  }

  const hasCoords =
    hotel.latitude !== null &&
    hotel.latitude !== undefined &&
    hotel.longitude !== null &&
    hotel.longitude !== undefined;

  // OpenStreetMap embed (no API key needed)
  const d = 0.01;
  const mapSrc = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${hotel.longitude - d}%2C${hotel.latitude - d}%2C${hotel.longitude + d}%2C${hotel.latitude + d}&layer=mapnik&marker=${hotel.latitude}%2C${hotel.longitude}`
    : "";
  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`
    : "";

  // ---------- SEO values (dynamic per hotel) ----------
  const pageTitle = `${hotel.name} – ${hotel.location} | KeySphere`;
  const shortDescription =
    hotel.description.length > 155
      ? `${hotel.description.slice(0, 152)}...`
      : hotel.description;
  const metaDescription = `${hotel.name} in ${hotel.location}. ${shortDescription} From ₹${hotel.price} per night. Rated ${hotel.rating}/5.`;
  const pageUrl = `${window.location.origin}/hotel/${hotel.id}`;
  const absoluteImage = hotel.image
    ? `${window.location.origin}${imageUrl(hotel.image)}`
    : "";

  // Structured data so search engines understand this page is a hotel
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: hotel.name,
    description: hotel.description,
    url: pageUrl,
    ...(absoluteImage && { image: absoluteImage }),
    priceRange: `₹${hotel.price}`,
    address: { "@type": "PostalAddress", addressLocality: hotel.location },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: hotel.rating,
      bestRating: 5,
    },
    ...(hasCoords && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: hotel.latitude,
        longitude: hotel.longitude,
      },
    }),
  };

  return (
    <div className="details-page">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Open Graph (Facebook, WhatsApp, LinkedIn) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={pageUrl} />
        {absoluteImage && <meta property="og:image" content={absoluteImage} />}

        {/* Twitter card */}
        <meta
          name="twitter:card"
          content={absoluteImage ? "summary_large_image" : "summary"}
        />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {absoluteImage && <meta name="twitter:image" content={absoluteImage} />}

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="details-box">
        <Link className="details-back" to="/">← Back to Home</Link>

        {hotel.image && (
          <img
            className="details-image"
            src={imageUrl(hotel.image)}
            alt={`${hotel.name} in ${hotel.location}`}
          />
        )}

        <h1>{hotel.name}</h1>

        <p className="details-meta">📍 {hotel.location}</p>
        <p className="details-meta">⭐ {hotel.rating}</p>

        <p className="details-description">{hotel.description}</p>

        <h2 className="details-price">₹{hotel.price} / Night</h2>

        <div className="details-coords">
          <h3>Coordinates</h3>
          {hasCoords ? (
            <>
              <p>Latitude: {hotel.latitude}</p>
              <p>Longitude: {hotel.longitude}</p>

              <iframe
                className="details-map"
                title={`${hotel.name} map`}
                src={mapSrc}
                loading="lazy"
              />

              <a
                className="details-maplink"
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in Google Maps
              </a>
            </>
          ) : (
            <p>Location coordinates have not been added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HotelDetails;
