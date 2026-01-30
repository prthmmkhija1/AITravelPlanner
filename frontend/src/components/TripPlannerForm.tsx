import { useState } from 'react';

interface TripPlannerFormProps {
  onSubmit: (formData: TripFormData) => void;
  isPlanning: boolean;
}

export interface TripFormData {
  source: string;
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: string;
  tripType: string;
  preferences: string;
}

const TRIP_TYPES = [
  { value: 'leisure', label: '🏖️ Leisure & Relaxation' },
  { value: 'adventure', label: '🏔️ Adventure & Outdoors' },
  { value: 'cultural', label: '🏛️ Cultural & Heritage' },
  { value: 'romantic', label: '💑 Romantic Getaway' },
  { value: 'family', label: '👨‍👩‍👧‍👦 Family Trip' },
  { value: 'business', label: '💼 Business + Leisure' },
  { value: 'spiritual', label: '🙏 Spiritual & Wellness' },
];

const BUDGET_OPTIONS = [
  { value: 'budget', label: '💰 Budget (Under ₹15,000)' },
  { value: 'moderate', label: '💵 Moderate (₹15,000 - ₹40,000)' },
  { value: 'premium', label: '💎 Premium (₹40,000 - ₹80,000)' },
  { value: 'luxury', label: '👑 Luxury (Above ₹80,000)' },
];

const POPULAR_DESTINATIONS = [
  'Goa', 'Jaipur', 'Kerala', 'Manali', 'Udaipur', 'Rishikesh', 
  'Andaman', 'Ladakh', 'Darjeeling', 'Munnar', 'Varanasi', 'Agra'
];

export default function TripPlannerForm({ onSubmit, isPlanning }: TripPlannerFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    source: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: 'moderate',
    tripType: 'leisure',
    preferences: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'travelers' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Get tomorrow's date for min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="trip-form-container">
      <div className="trip-form-grid">
        {/* Source City */}
        <div className="trip-form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            </svg>
            From (City)
          </label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="e.g., Delhi, Mumbai"
            required
            list="source-cities"
          />
          <datalist id="source-cities">
            {['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad'].map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        {/* Destination */}
        <div className="trip-form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            To (Destination)
          </label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="e.g., Goa, Jaipur"
            required
            list="destination-cities"
          />
          <datalist id="destination-cities">
            {POPULAR_DESTINATIONS.map(city => (
              <option key={city} value={city} />
            ))}
          </datalist>
        </div>

        {/* Start Date */}
        <div className="trip-form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Start Date
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={minDate}
            required
          />
        </div>

        {/* End Date */}
        <div className="trip-form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            End Date
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate || minDate}
            required
          />
        </div>

        {/* Number of Travelers */}
        <div className="trip-form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 00-3-3.87"/>
              <path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
            Travelers
          </label>
          <select name="travelers" value={formData.travelers} onChange={handleChange}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
              <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="trip-form-group">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
            Budget (per person)
          </label>
          <select name="budget" value={formData.budget} onChange={handleChange}>
            {BUDGET_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Trip Type */}
        <div className="trip-form-group full-width">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            Trip Type
          </label>
          <select name="tripType" value={formData.tripType} onChange={handleChange}>
            {TRIP_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Additional Preferences */}
        <div className="trip-form-group full-width">
          <label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Additional Preferences (Optional)
          </label>
          <textarea
            name="preferences"
            value={formData.preferences}
            onChange={handleChange}
            placeholder="Any specific requirements? e.g., vegetarian food, wheelchair accessible, pet-friendly hotels..."
            rows={3}
          />
        </div>
      </div>

      <div className="trip-form-submit">
        <button type="submit" className="btn" disabled={isPlanning}>
          {isPlanning ? (
            <>⏳ Planning your trip...</>
          ) : (
            <>✨ Generate My Itinerary</>
          )}
        </button>
      </div>
    </form>
  );
}
