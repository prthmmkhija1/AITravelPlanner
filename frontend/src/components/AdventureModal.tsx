import { useState } from 'react';

interface AdventureModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectAdventure: (adventure: string) => void;
}

const adventures = [
  {
    id: 1,
    title: "Himalayan Trek",
    category: "Trekking",
    description: "Experience breathtaking views on guided mountain trails",
    price: "₹15,000",
    duration: "5 Days",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400"
  },
  {
    id: 2,
    title: "Goa Beach Paradise",
    category: "Beach",
    description: "Sun, sand, and surf at India's favorite beach destination",
    price: "₹12,000",
    duration: "4 Days",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400"
  },
  {
    id: 3,
    title: "Kerala Backwaters",
    category: "Nature",
    description: "Serene houseboat cruise through scenic waterways",
    price: "₹18,000",
    duration: "3 Days",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400"
  },
  {
    id: 4,
    title: "Rajasthan Heritage",
    category: "Culture",
    description: "Explore majestic forts and royal palaces",
    price: "₹25,000",
    duration: "6 Days",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400"
  },
  {
    id: 5,
    title: "Rishikesh Adventure",
    category: "Adventure",
    description: "Rafting, bungee jumping, and spiritual experiences",
    price: "₹10,000",
    duration: "3 Days",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400"
  },
  {
    id: 6,
    title: "Andaman Islands",
    category: "Beach",
    description: "Crystal clear waters and exotic marine life",
    price: "₹35,000",
    duration: "5 Days",
    image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400"
  },
  {
    id: 7,
    title: "Ladakh Road Trip",
    category: "Adventure",
    description: "Epic road journey through world's highest passes",
    price: "₹40,000",
    duration: "8 Days",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400"
  },
  {
    id: 8,
    title: "Wildlife Safari",
    category: "Wildlife",
    description: "Spot tigers and exotic wildlife in national parks",
    price: "₹20,000",
    duration: "4 Days",
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=400"
  }
];

const categories = ["All", "Trekking", "Beach", "Nature", "Culture", "Adventure", "Wildlife"];

export default function AdventureModal({ isVisible, onClose, onSelectAdventure }: AdventureModalProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  if (!isVisible) return null;

  const filteredAdventures = activeCategory === "All" 
    ? adventures 
    : adventures.filter(a => a.category === activeCategory);

  const handleSelectAdventure = (adventure: typeof adventures[0]) => {
    onSelectAdventure(`Plan a ${adventure.duration.toLowerCase()} ${adventure.title.toLowerCase()} trip`);
    onClose();
  };

  return (
    <div className="adventure-overlay" onClick={onClose}>
      <div className="adventure-modal" onClick={(e) => e.stopPropagation()}>
        <div className="adventure-header">
          <h2>🏔️ Adventure Awaits</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="adventure-content">
          <div className="adventure-categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`adventure-category-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="adventure-grid">
            {filteredAdventures.map(adventure => (
              <div 
                key={adventure.id} 
                className="adventure-card"
                onClick={() => handleSelectAdventure(adventure)}
              >
                <div 
                  className="adventure-card-image"
                  style={{ backgroundImage: `url(${adventure.image})` }}
                >
                  <span className="adventure-card-badge">{adventure.category}</span>
                </div>
                <div className="adventure-card-content">
                  <h4>{adventure.title}</h4>
                  <p>{adventure.description}</p>
                  <div className="adventure-card-footer">
                    <span className="adventure-price">From {adventure.price}</span>
                    <span className="adventure-duration">{adventure.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
