import { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import './HeroSection.css';

interface Destination {
  id: number;
  name: string;
  country: string;
  image: string;
  price: string;
  rating: number;
}

const HERO_DESTINATIONS = [
  {
    name: 'INDONESIA',
    tagline: 'Discover Paradise',
    description: 'Explore breathtaking landscapes, ancient temples, and pristine beaches across 17,000 islands.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1920&h=1080&fit=crop'
  },
  {
    name: 'GOA',
    tagline: 'Beach Vibes',
    description: 'Sun, sand, and soul - experience India\'s party paradise with stunning beaches and vibrant nightlife.',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1920&h=1080&fit=crop'
  },
  {
    name: 'GREECE',
    tagline: 'Ancient Wonders',
    description: 'Walk through history in the land of gods, from Santorini sunsets to Athens\' ancient ruins.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1920&h=1080&fit=crop'
  },
  {
    name: 'MALDIVES',
    tagline: 'Tropical Paradise',
    description: 'Crystal-clear waters, overwater villas, and the most stunning coral reefs in the world.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&h=1080&fit=crop'
  },
  {
    name: 'THAILAND',
    tagline: 'Land of Smiles',
    description: 'From bustling Bangkok to serene temples and pristine islands - a journey of flavors and culture.',
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1920&h=1080&fit=crop'
  }
];

const FEATURED_CARDS: Destination[] = [
  {
    id: 1,
    name: 'Tanah Lot Temple',
    country: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=400&h=300&fit=crop',
    price: '₹45,000',
    rating: 4.9
  },
  {
    id: 2,
    name: 'Phi Phi Islands',
    country: 'Thailand',
    image: 'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=400&h=300&fit=crop',
    price: '₹38,000',
    rating: 4.8
  },
  {
    id: 3,
    name: 'Santorini Sunset',
    country: 'Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400&h=300&fit=crop',
    price: '₹85,000',
    rating: 4.9
  }
];

interface HeroSectionProps {
  onExplore?: () => void;
  onDestinationClick?: (destination: string) => void;
}

export default function HeroSection({ onExplore, onDestinationClick }: HeroSectionProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 8000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + HERO_DESTINATIONS.length) % HERO_DESTINATIONS.length);
      setIsTransitioning(false);
    }, 300);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_DESTINATIONS.length);
      setIsTransitioning(false);
    }, 300);
  };

  const currentDestination = HERO_DESTINATIONS[currentSlide];

  return (
    <section className="hero-section">
      {/* Background */}
      <div 
        className={`hero-background ${isTransitioning ? 'transitioning' : ''}`}
        style={{ backgroundImage: `url(${currentDestination.image})` }}
      />
      <div className="hero-gradient-overlay" />
      
      {/* Main Content */}
      <div className="hero-content">
        {/* Left Side */}
        <div className="hero-left">
          <p className={`hero-tagline ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            {currentDestination.tagline}
          </p>
          <h1 className={`hero-destination-name ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            {currentDestination.name}
          </h1>
          <p className={`hero-description ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
            {currentDestination.description}
          </p>
          
          <button className="explore-btn" onClick={onExplore}>
            <span>{t('hero.explore')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          {/* Navigation Arrows & Indicators */}
          <div className="hero-navigation">
            <button className="nav-arrow prev" onClick={handlePrev} aria-label="Previous">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="hero-indicators">
              {HERO_DESTINATIONS.map((dest, idx) => (
                <button
                  key={idx}
                  className={`indicator ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => {
                    if (!isTransitioning && idx !== currentSlide) {
                      setIsTransitioning(true);
                      setTimeout(() => {
                        setCurrentSlide(idx);
                        setIsTransitioning(false);
                      }, 300);
                    }
                  }}
                >
                  <span className="indicator-label">{dest.name}</span>
                </button>
              ))}
            </div>

            <button className="nav-arrow next" onClick={handleNext} aria-label="Next">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right Side - Destination Cards - RTL Diagonal Stack */}
        <div className="hero-right">
          <div className="destination-cards-stack">
            {FEATURED_CARDS.map((dest, idx) => (
              <div 
                key={dest.id} 
                className={`destination-card card-${idx + 1}`}
                onClick={() => onDestinationClick?.(dest.country.split(',')[0])}
              >
                <div className="card-image-container">
                  <img src={dest.image} alt={dest.name} loading="lazy" />
                  <div className="card-overlay" />
                  <button className="card-bookmark">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                    </svg>
                  </button>
                </div>
                <div className="card-content">
                  <div className="card-footer">
                    <span className="card-name">{dest.country}</span>
                    <span className="price-value">{dest.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
