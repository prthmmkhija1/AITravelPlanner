import { useState, useEffect, useRef } from "react";
import './HotDestinations.css';

interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
  price: number;
  currency: string;
  rating: number;
  reviews: number;
  tag?: string;
  isPinned?: boolean;
}

const destinations: Destination[] = [
  {
    id: 1,
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=800&fit=crop",
    price: 45000,
    currency: "₹",
    rating: 4.9,
    reviews: 2847,
    tag: "🔥 Most Popular",
    isPinned: true
  },
  {
    id: 2,
    name: "Goa",
    country: "India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&h=800&fit=crop",
    price: 15000,
    currency: "₹",
    rating: 4.7,
    reviews: 3521,
    tag: "✨ Budget Friendly",
    isPinned: true
  },
  {
    id: 3,
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=800&fit=crop",
    price: 95000,
    currency: "₹",
    rating: 4.9,
    reviews: 1893,
    tag: "💎 Luxury",
    isPinned: true
  },
  {
    id: 4,
    name: "Maldives",
    country: "Indian Ocean",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=600&h=800&fit=crop",
    price: 125000,
    currency: "₹",
    rating: 5.0,
    reviews: 4201,
    tag: "🏝️ Paradise",
    isPinned: true
  },
  {
    id: 5,
    name: "Phuket",
    country: "Thailand",
    image: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&h=800&fit=crop",
    price: 38000,
    currency: "₹",
    rating: 4.8,
    reviews: 2156
  },
  {
    id: 6,
    name: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=800&fit=crop",
    price: 65000,
    currency: "₹",
    rating: 4.8,
    reviews: 3892,
    tag: "🌆 Modern Marvel"
  },
  {
    id: 7,
    name: "Kerala",
    country: "India",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=800&fit=crop",
    price: 22000,
    currency: "₹",
    rating: 4.7,
    reviews: 1756
  }
];

export default function HotDestinations() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  const totalItems = destinations.length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-IN');
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % totalItems);
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Get position class for carousel item
  const getPositionClass = (index: number) => {
    const diff = (index - currentIndex + totalItems) % totalItems;
    
    if (diff === 0) return 'center';
    if (diff === 1 || diff === totalItems - 1) {
      return diff === 1 ? 'right' : 'left';
    }
    if (diff === 2 || diff === totalItems - 2) {
      return diff === 2 ? 'far-right' : 'far-left';
    }
    return 'hidden';
  };

  const handleCardClick = (index: number) => {
    if (index === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <section className="hot-destinations" ref={sectionRef}>
      {/* Animated Background */}
      <div className="hot-destinations-bg">
        <div className="bg-gradient"></div>
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`shape shape-${i + 1}`}></div>
          ))}
        </div>
      </div>

      <div className="hot-destinations-content">
        <div className="section-header">
          <div className="header-badge">
            <span className="fire-icon">🔥</span>
            <span>Trending Now</span>
          </div>
          <h2>Hot Destinations</h2>
          <p>Discover the world's most sought-after travel experiences</p>
        </div>

        {/* 3D Tilted Carousel */}
        <div className={`carousel-3d-container ${isVisible ? 'visible' : ''}`}>
          {/* Prev Button */}
          <button className="carousel-3d-nav carousel-3d-prev" onClick={handlePrev} aria-label="Previous">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="carousel-3d-track">
            {destinations.map((dest, index) => {
              const positionClass = getPositionClass(index);
              
              return (
                <div
                  key={dest.id}
                  className={`carousel-3d-card ${positionClass}`}
                  onClick={() => handleCardClick(index)}
                >
                  {/* Card Image */}
                  <div className="card-3d-image">
                    <img src={dest.image} alt={dest.name} loading="lazy" />
                    <div className="card-3d-overlay"></div>
                    
                    {/* Tag */}
                    {dest.tag && positionClass === 'center' && (
                      <div className="card-3d-tag">{dest.tag}</div>
                    )}

                    {/* Rating Badge */}
                    <div className="card-3d-rating">
                      <span className="star">★</span>
                      <span>{dest.rating}</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="card-3d-content">
                    <div className="card-3d-location">
                      <h3>{dest.name}</h3>
                      <span className="country">{dest.country}</span>
                    </div>

                    <div className="card-3d-price">
                      <span className="price-label">From</span>
                      <span className="price-value">{dest.currency}{formatPrice(dest.price)}</span>
                    </div>

                    {positionClass === 'center' && (
                      <button className="card-3d-explore-btn">
                        <span>Explore</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Next Button */}
          <button className="carousel-3d-nav carousel-3d-next" onClick={handleNext} aria-label="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="carousel-3d-indicators">
          {destinations.map((_, idx) => (
            <button
              key={idx}
              className={`indicator-3d-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => {
                if (!isAnimating) {
                  setIsAnimating(true);
                  setCurrentIndex(idx);
                  setTimeout(() => setIsAnimating(false), 500);
                }
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="view-all-wrapper">
          <button className="view-all-btn" onClick={() => setShowAllDestinations(!showAllDestinations)}>
            <span>{showAllDestinations ? 'Show Carousel' : 'View All Destinations'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={showAllDestinations ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"}/>
            </svg>
          </button>
        </div>

        {/* All Destinations Grid View */}
        {showAllDestinations && (
          <div className="all-destinations-grid">
            {destinations.map((dest) => (
              <div key={dest.id} className="destination-grid-card">
                <div className="grid-card-image">
                  <img src={dest.image} alt={dest.name} loading="lazy" />
                  <div className="grid-card-overlay"></div>
                  {dest.tag && <div className="grid-card-tag">{dest.tag}</div>}
                  <div className="grid-card-rating">
                    <span className="star">★</span>
                    <span>{dest.rating}</span>
                  </div>
                </div>
                <div className="grid-card-content">
                  <h3>{dest.name}</h3>
                  <span className="country">{dest.country}</span>
                  <div className="grid-card-price">
                    <span className="price-label">From</span>
                    <span className="price-value">{dest.currency}{formatPrice(dest.price)}</span>
                  </div>
                  <button className="grid-card-explore-btn">
                    <span>Explore</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
