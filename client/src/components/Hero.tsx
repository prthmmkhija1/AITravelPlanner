type HeroSlide = {
  url: string;
  heading: string;
  subtext: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    url: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600",
    heading: "Discover Your Next Adventure",
    subtext: "AI-powered trip planning for flights, hotels, and attractions"
  },
  {
    url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600",
    heading: "Smart Destination Planning",
    subtext: "Tell us where you want to go—we'll handle the rest"
  },
  {
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600",
    heading: "Budget-Aware Suggestions",
    subtext: "Get personalized itineraries that fit your budget"
  }
];

export default function Hero() {
  return (
    <div className="hero-slider" aria-label="Hero slider">
      {HERO_SLIDES.map((s, idx) => (
        <div
          key={idx}
          className="hero-slide"
          style={{ backgroundImage: `url('${s.url}')` }}
          aria-hidden="true"
        >
          <div className="hero-overlay">
            <h1 className="hero-heading">{s.heading}</h1>
            <p className="hero-subtext">{s.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

