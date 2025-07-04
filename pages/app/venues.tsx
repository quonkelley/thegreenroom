import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import AppNavigation from '../../components/AppNavigation';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Music, 
  Building, 
  Coffee, 
  Star, 
  Users, 
  Mail, 
  Globe, 
  Phone,
  Filter,
  X,
  Heart,
  Share2,
  Calendar,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';

// Add custom styles for venue discovery page
const venuePageStyles = `
  .venue-page * {
    color: inherit !important;
  }
  .venue-page input,
  .venue-page select,
  .venue-page button {
    color: #111827 !important;
    background-color: white !important;
  }
  .venue-page input::placeholder {
    color: #6B7280 !important;
  }
`;

interface Venue {
  id: string;
  name: string;
  city: string;
  state?: string;
  country?: string;
  email?: string;
  website?: string;
  phone?: string;
  capacity?: number;
  genres?: string[];
  contact_person?: string;
  booking_email?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'verified';
  created_at: string;
  updated_at: string;
}

interface VenueType {
  id: string;
  name: string;
  icon: any;
  description: string;
}

const VENUE_TYPES: VenueType[] = [
  { id: 'all', name: 'All Venues', icon: Building, description: 'All venue types' },
  { id: 'jazz', name: 'Jazz Clubs', icon: Music, description: 'Jazz and blues venues' },
  { id: 'rock', name: 'Rock Venues', icon: Building, description: 'Rock and indie venues' },
  { id: 'coffee', name: 'Coffee Shops', icon: Coffee, description: 'Coffee shops and cafes' },
  { id: 'restaurant', name: 'Restaurants', icon: Star, description: 'Restaurants and bars' }
];

const GENRE_OPTIONS = [
  'jazz', 'blues', 'rock', 'indie', 'folk', 'country', 'electronic', 'pop', 'soul', 'r&b', 'hip-hop', 'classical', 'world', 'experimental'
];

export default function VenueDiscovery() {
  const { user } = useAuth();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedVenueType, setSelectedVenueType] = useState('all');
  const [capacityRange, setCapacityRange] = useState<[number, number]>([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchVenues();
    fetchCities();
  }, []);

  const fetchVenues = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedGenres.length > 0) params.append('genres', selectedGenres.join(','));
      if (selectedVenueType !== 'all') params.append('venue_type', selectedVenueType);
      if (capacityRange[0] > 0) params.append('min_capacity', capacityRange[0].toString());
      if (capacityRange[1] < 2000) params.append('max_capacity', capacityRange[1].toString());

      const response = await fetch(`/api/venues?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setVenues(data.venues || []);
      } else {
        console.error('Failed to fetch venues:', data.error);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/venues/cities');
      const data = await response.json();
      
      if (response.ok) {
        setCities(data.cities || []);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const handleSearch = () => {
    fetchVenues();
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleVenueTypeChange = (type: string) => {
    setSelectedVenueType(type);
  };

  const toggleFavorite = (venueId: string) => {
    setFavorites(prev => 
      prev.includes(venueId) 
        ? prev.filter(id => id !== venueId)
        : [...prev, venueId]
    );
  };

  const getVenueTypeIcon = (venue: Venue) => {
    const genres = venue.genres || [];
    if (genres.some(g => ['jazz', 'blues'].includes(g))) return Music;
    if (genres.some(g => ['rock', 'indie', 'alternative'].includes(g))) return Building;
    if (venue.capacity && venue.capacity < 100) return Coffee;
    return Star;
  };

  const getVenueTypeName = (venue: Venue) => {
    const genres = venue.genres || [];
    if (genres.some(g => ['jazz', 'blues'].includes(g))) return 'Jazz Club';
    if (genres.some(g => ['rock', 'indie', 'alternative'].includes(g))) return 'Rock Venue';
    if (venue.capacity && venue.capacity < 100) return 'Coffee Shop';
    return 'Restaurant';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCity('');
    setSelectedGenres([]);
    setSelectedVenueType('all');
    setCapacityRange([0, 2000]);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 text-gray-900 venue-page">
        <style jsx global>{venuePageStyles}</style>
        <AppNavigation />
        <div className="max-w-7xl mx-auto py-8 px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Venue Discovery</h1>
            <p className="text-gray-600">Find the perfect venues for your music</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="p-6">
              {/* Search Bar */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search venues by name, city, or genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 bg-white"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              {/* Venue Type Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {VENUE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleVenueTypeChange(type.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                      selectedVenueType === type.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.name}
                  </button>
                ))}
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 pt-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* City Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 bg-white"
                      >
                        <option value="">All Cities</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    </div>

                    {/* Capacity Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacity: {capacityRange[0]} - {capacityRange[1]}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          value={capacityRange[0]}
                          onChange={(e) => setCapacityRange([parseInt(e.target.value), capacityRange[1]])}
                          className="flex-1 accent-blue-600"
                        />
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          value={capacityRange[1]}
                          onChange={(e) => setCapacityRange([capacityRange[0], parseInt(e.target.value)])}
                          className="flex-1 accent-blue-600"
                        />
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  {/* Genre Filter */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Genres</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRE_OPTIONS.map(genre => (
                        <button
                          key={genre}
                          onClick={() => handleGenreToggle(genre)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            selectedGenres.includes(genre)
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {loading ? 'Loading venues...' : `${venues.length} venues found`}
              </h2>
              {venues.length > 0 && (
                <div className="text-sm text-gray-500">
                  Showing {venues.length} of {venues.length} venues
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : venues.length === 0 ? (
              <div className="text-center py-12">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => {
                  const VenueIcon = getVenueTypeIcon(venue);
                  const venueTypeName = getVenueTypeName(venue);
                  
                  return (
                    <motion.div
                      key={venue.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
                    >
                      {/* Venue Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <VenueIcon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {venue.name}
                            </h3>
                            <p className="text-sm text-gray-500">{venueTypeName}</p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(venue.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Heart className={`w-5 h-5 ${favorites.includes(venue.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      {/* Venue Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {venue.city}{venue.state && `, ${venue.state}`}
                        </div>
                        
                        {venue.capacity && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            Capacity: {venue.capacity}
                          </div>
                        )}

                        {venue.genres && venue.genres.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Music className="w-4 h-4" />
                            <span>{venue.genres.slice(0, 3).join(', ')}{venue.genres.length > 3 && '...'}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        {venue.booking_email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{venue.booking_email}</span>
                          </div>
                        )}
                        
                        {venue.website && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Globe className="w-4 h-4" />
                            <a 
                              href={venue.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-500 truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Visit Website
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Navigate to pitch generator with venue pre-filled
                            window.location.href = `/app/pitch?venue=${encodeURIComponent(venue.name)}&city=${encodeURIComponent(venue.city)}&email=${encodeURIComponent(venue.booking_email || '')}`;
                          }}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          Create Pitch
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Share venue info
                            navigator.clipboard.writeText(`${venue.name} - ${venue.city}${venue.website ? ` - ${venue.website}` : ''}`);
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 