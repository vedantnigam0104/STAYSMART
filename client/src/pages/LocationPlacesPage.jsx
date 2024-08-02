// LocationPlacesPage.jsx
import { useLocation } from 'react-router-dom';
import PlaceCard from '../PlaceCard'; // Adjust import path as necessary

export default function LocationPlacesPage() {
  const location = useLocation();
  const places = location.state?.places || []; // Retrieve places from state

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Places</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.length > 0 ? (
          places.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))
        ) : (
          <p>No places found.</p>
        )}
      </div>
    </div>
  );
}
