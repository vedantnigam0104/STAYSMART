import Image from "./Image.jsx";

export default function PlaceImg({ place, index = 0, className = 'object-cover' }) {
  if (!place?.photos?.length) {
    return null; // Return null instead of an empty string
  }
  const imageUrl = place.photos[index];
  console.log('PlaceImg image URL:', imageUrl); // Debugging line
  return (
    <Image className={className} src={imageUrl} alt={`Image of ${place.title}`} />
  );
}
