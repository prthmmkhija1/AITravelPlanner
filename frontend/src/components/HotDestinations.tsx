export default function HotDestinations() {
  const destinations = [
    {
      id: 1,
      name: 'Desert Safari',
      location: 'Rajasthan',
      image: '/Assets/download%20(4).jpg',
      description: 'Experience the golden sands and rich culture',
      price: 'From ₹25,000',
      rating: 4.8,
      type: 'desert'
    },
    {
      id: 2,
      name: 'Mountain Retreat',
      location: 'Himalayas',
      image: '/Assets/Majestic%20Rocky%20Arch%20by%20the%20Sea,%20a%20Nature%20Photo%20by%20Virgo%20Studio.jpg',
      description: 'Majestic peaks and serene valleys await',
      price: 'From ₹35,000',
      rating: 4.9,
      type: 'mountain'
    },
    {
      id: 3,
      name: 'Beach Paradise',
      location: 'Bali',
      image: '/Assets/15%20Top%20Tours%20in%20Bali_%20A%20Guide%20To%20The%20Best%20Activities%20-%20Goats%20On%20The%20Road.jpg',
      description: 'Crystal clear waters and tropical vibes',
      price: 'From ₹45,000',
      rating: 4.7,
      type: 'beach'
    },
    {
      id: 4,
      name: 'Coastal Adventure',
      location: 'Kerala Backwaters',
      image: '/Assets/download%20(5).jpg',
      description: 'Houseboats and lush greenery',
      price: 'From ₹28,000',
      rating: 4.6,
      type: 'coastal'
    }
  ];

  return (
    <section className="hot-destinations-section">
      <div className="section-header-centered">
        <h2>🔥 Hot Destinations</h2>
        <p>Trending travel experiences curated just for you</p>
      </div>

      <div className="destinations-grid">
        {destinations.map((dest) => (
          <div key={dest.id} className="destination-card">
            <div className="destination-image-wrapper">
              <img
                src={dest.image}
                alt={dest.name}
                className="destination-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x300?text=Destination';
                }}
              />
              <div className="destination-badge">{dest.type}</div>
              <div className="destination-overlay">
                <button className="explore-btn">
                  Explore Now
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="destination-content">
              <div className="destination-header">
                <h3>{dest.name}</h3>
                <div className="destination-rating">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {dest.rating}
                </div>
              </div>

              <div className="destination-location">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {dest.location}
              </div>

              <p className="destination-description">{dest.description}</p>

              <div className="destination-footer">
                <span className="destination-price">{dest.price}</span>
                <button className="btn-icon-heart">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
