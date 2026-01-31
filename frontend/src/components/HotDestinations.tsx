import { useState } from "react";

export default function HotDestinations() {
  const destinations = [
    {
      id: 1,
      name: "Desert Safari",
      location: "Rajasthan",
      image: "/Assets/download%20(4).jpg",
      description: "Experience the golden sands and rich culture",
      price: "From ₹25,000",
      rating: 4.8,
      type: "desert"
    },
    {
      id: 2,
      name: "Mountain Retreat",
      location: "Himalayas",
      image: "/Assets/Majestic%20Rocky%20Arch%20by%20the%20Sea,%20a%20Nature%20Photo%20by%20Virgo%20Studio.jpg",
      description: "Majestic peaks and serene valleys await",
      price: "From ₹35,000",
      rating: 4.9,
      type: "mountain"
    },
    {
      id: 3,
      name: "Beach Paradise",
      location: "Bali",
      image: "/Assets/15%20Top%20Tours%20in%20Bali_%20A%20Guide%20To%20The%20Best%20Activities%20-%20Goats%20On%20The%20Road.jpg",
      description: "Crystal clear waters and tropical vibes",
      price: "From ₹45,000",
      rating: 4.7,
      type: "beach"
    },
    {
      id: 4,
      name: "Coastal Adventure",
      location: "Kerala Backwaters",
      image: "/Assets/download%20(5).jpg",
      description: "Houseboats and lush greenery",
      price: "From ₹28,000",
      rating: 4.6,
      type: "coastal"
    }
  ];

  const [active, setActive] = useState(1);

  return (
    <section className="hot-destinations-3d">
      <div className="section-header-centered">
        <h2>🔥 Hot Destinations</h2>
        <p>Trending travel experiences curated just for you</p>
      </div>

      <div className="carousel-wrapper">
        <button onClick={() => setActive((active - 1 + destinations.length) % destinations.length)}>
          ‹
        </button>

        <div className="carousel">
          {destinations.map((dest, index) => {
            const offset = index - active;

            return (
              <div
                key={dest.id}
                className="carousel-card"
                style={{
                  transform: `
                    translateX(${offset * 260}px)
                    translateZ(${offset === 0 ? 120 : -80}px)
                    rotateY(${offset * -30}deg)
                    scale(${offset === 0 ? 1 : 0.85})
                  `,
                  opacity: Math.abs(offset) > 2 ? 0 : 1,
                  zIndex: 10 - Math.abs(offset)
                }}
              >
                <img src={dest.image} alt={dest.name} />
                <div className="card-overlay">
                  <h3>{dest.name}</h3>
                  <p>{dest.location}</p>
                  <span>{dest.price}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button onClick={() => setActive((active + 1) % destinations.length)}>
          ›
        </button>
      </div>

      <style>{`
        .hot-destinations-3d {
          padding: 80px 20px;
          background: radial-gradient(circle at top, #111827, #000);
          color: white;
          overflow: hidden;
        }

        .carousel-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .carousel {
          position: relative;
          width: 900px;
          height: 420px;
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .carousel-card {
          position: absolute;
          top: 0;
          left: 50%;
          width: 260px;
          height: 380px;
          transform-style: preserve-3d;
          transition: transform 0.6s ease, opacity 0.6s ease;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        }

        .carousel-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.75), transparent);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 20px;
        }

        .card-overlay h3 {
          margin: 0;
          font-size: 1.2rem;
        }

        .card-overlay p {
          margin: 4px 0;
          font-size: 0.9rem;
          opacity: 0.85;
        }

        .card-overlay span {
          font-weight: 600;
          margin-top: 6px;
        }

        .carousel-wrapper button {
          background: none;
          border: none;
          color: white;
          font-size: 3rem;
          cursor: pointer;
          opacity: 0.6;
          transition: opacity 0.3s;
        }

        .carousel-wrapper button:hover {
          opacity: 1;
        }

        @media (max-width: 900px) {
          .carousel {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
