import { useState } from 'react';
import VoiceInputButton from './VoiceInputButton';

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

const TRIP_STYLES = [
  { value: 'leisure-budget', label: '🏖️ Relaxed & Budget-friendly' },
  { value: 'leisure-comfort', label: '🌴 Relaxed & Comfortable' },
  { value: 'adventure-budget', label: '🏔️ Adventure & Budget' },
  { value: 'adventure-premium', label: '⛰️ Adventure & Premium' },
  { value: 'cultural-budget', label: '🏛️ Cultural & Budget' },
  { value: 'cultural-premium', label: '🎭 Cultural & Premium' },
  { value: 'romantic-comfort', label: '💑 Romantic Getaway' },
  { value: 'romantic-luxury', label: '💕 Romantic & Luxury' },
  { value: 'family-moderate', label: '👨‍👩‍👧‍👦 Family-friendly' },
  { value: 'business-premium', label: '💼 Business + Leisure' },
  { value: 'spiritual-budget', label: '🙏 Spiritual & Simple' },
  { value: 'luxury-all', label: '👑 All-out Luxury' },
];

const TRAVELER_OPTIONS = [
  { value: '1-solo', label: '🧳 Solo traveler' },
  { value: '2-couple', label: '💑 Couple (2)' },
  { value: '3-small', label: '👨‍👩‍👧 Small group (3-4)' },
  { value: '5-medium', label: '👥 Medium group (5-6)' },
  { value: '7-large', label: '👪 Large group (7+)' },
];

const POPULAR_CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Goa', 'Jaipur', 'Kerala', 'Manali', 'Udaipur', 'Rishikesh', 'Andaman', 'Ladakh'
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
  const [travelerStyle, setTravelerStyle] = useState('2-couple');
  const [tripStyle, setTripStyle] = useState('leisure-comfort');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTravelerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTravelerStyle(value);
    const travelers = parseInt(value.split('-')[0]) || 2;
    setFormData(prev => ({ ...prev, travelers }));
  };

  const handleTripStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setTripStyle(value);
    const [tripType, budget] = value.split('-');
    setFormData(prev => ({ 
      ...prev, 
      tripType: tripType || 'leisure',
      budget: budget || 'moderate'
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
    <form onSubmit={handleSubmit} className="trip-form-compact">
      {/* Row 1: Route (From → To) */}
      <div className="form-row">
        <div className="form-field">
          <label>From</label>
          <input
            type="text"
            name="source"
            value={formData.source}
            onChange={handleChange}
            placeholder="Origin city"
            required
            list="all-cities"
          />
        </div>
        <span className="field-connector">→</span>
        <div className="form-field">
          <label>To</label>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            placeholder="Destination"
            required
            list="all-cities"
          />
        </div>
        <datalist id="all-cities">
          {POPULAR_CITIES.map(city => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      {/* Row 2: Dates (Start → End) */}
      <div className="form-row">
        <div className="form-field">
          <label>Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            min={minDate}
            required
          />
        </div>
        <span className="field-connector">→</span>
        <div className="form-field">
          <label>End Date</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={formData.startDate || minDate}
            required
          />
        </div>
      </div>

      {/* Row 3: Options (Travelers & Trip Style) */}
      <div className="form-row">
        <div className="form-field">
          <label>Travelers</label>
          <select value={travelerStyle} onChange={handleTravelerChange}>
            {TRAVELER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Trip Style</label>
          <select value={tripStyle} onChange={handleTripStyleChange}>
            {TRIP_STYLES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 4: Preferences (Optional) */}
      <div className="form-row preferences-row">
        <div className="form-field full-width">
          <label>Special Requests <span className="optional-tag">(optional)</span></label>
          <div className="input-with-icon">
            <input
              type="text"
              name="preferences"
              value={formData.preferences}
              onChange={handleChange}
              placeholder="Vegetarian, wheelchair access, pet-friendly..."
            />
            <VoiceInputButton 
              onTranscript={(text) => setFormData(prev => ({ 
                ...prev, 
                preferences: prev.preferences ? `${prev.preferences} ${text}` : text 
              }))}
              disabled={isPlanning}
              size="small"
              className="input-voice-btn"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <button type="submit" className="btn submit-btn" disabled={isPlanning}>
        {isPlanning ? 'Planning...' : 'Plan My Trip'}
      </button>
    </form>
  );
}
