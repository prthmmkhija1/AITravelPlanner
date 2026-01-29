type HeroSlide = {
  url?: string;
  embedCode?: string;
  videoSrc?: string;
  heading: string;
  subtext: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    videoSrc: "/hero%201.mp4",
    heading: "Discover Your Next Adventure",
    subtext: "AI-powered trip planning for flights, hotels, and attractions"
  },
  {
    videoSrc: "/hero%202.mp4",
    heading: "Smart Destination Planning",
    subtext: "Tell us where you want to go—we'll handle the rest"
  },
  {
    videoSrc: "/hero%203.mp4",
    heading: "Budget-Aware Suggestions",
    subtext: "Get personalized itineraries that fit your budget"
  },
  {
    videoSrc: "/hero%204.mp4",
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
          style={s.url ? { backgroundImage: `url('${s.url}')` } : {}}
          aria-hidden={!s.embedCode}
        >
          {s.videoSrc ? (
            <video
              className="hero-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            >
              <source src={s.videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : null}
          {s.embedCode ? (
            <div className="hero-embed-container" dangerouslySetInnerHTML={{ __html: s.embedCode }} />
          ) : null}
          <div className="hero-overlay">
            <h1 className="hero-heading">{s.heading}</h1>
            <p className="hero-subtext">{s.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

