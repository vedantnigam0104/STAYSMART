// PlaceCard.jsx
import { Link } from 'react-router-dom';
import PlaceImg from "./PlaceImg";

export default function PlaceCard({ place }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
    <div className="flex w-32 h-32 bg-gray-300 grow shrink-0">
    <PlaceImg place={place} />
    </div>
      <div className="p-4">
        <h2 className="text-xl font-semibold">{place.title}</h2>
        <p>{place.address}</p>
        <p>{place.description}</p>
        <Link to={`/place/${place._id}`} className="text-blue-500">View Details</Link>
      </div>
    </div>
  );
}
