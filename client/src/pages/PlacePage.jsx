import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon
} from "react-share";
import BookingWidget from "../BookingWidget";
import PlaceGallery from "../PlaceGallery";
import AddressLink from "../AddressLink";

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    if (!id) return;

    axios.get(`/api/places/${id}`)
      .then(response => {
        setPlace(response.data);
        console.log('Fetched place data:', response.data);
      })
      .catch(error => {
        console.error('Error fetching place data:', error);
      });
  }, [id]);

  const shareUrl = place ? place.locationUrl : ''; // Construct URL for sharing

  if (!place) return <p>Loading...</p>;

  return (
    <div className="mt-4 bg-gray-100 -mx-8 px-8 pt-8">
      <h1 className="text-3xl">{place.title}</h1>
      <AddressLink>{place.address}</AddressLink>
      <PlaceGallery place={place} />
      <div className="mt-8 mb-8 grid gap-8 grid-cols-1 md:grid-cols-[2fr_1fr]">
        <div>
          <div className="my-4">
            <h2 className="font-semibold text-2xl">Description</h2>
            {place.description}
          </div>
          Check-in: {place.checkIn}<br />
          Check-out: {place.checkOut}<br />
          Max number of guests: {place.maxGuests}
        </div>
        <div>
          <BookingWidget place={place} />
        </div>
      </div>
      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Extra info</h2>
        </div>
        <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.extraInfo}</div>
      </div>
      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Hosted By</h2>
        </div>
        <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.hostedBy}</div>
      </div>
      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Reviews</h2>
        </div>
        <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">{place.reviews}</div>
      </div>
      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <div>
          <h2 className="font-semibold text-2xl">Rating</h2>
        </div>
        <div className="mb-4 mt-2 text-sm text-gray-700 leading-5">
          {Array.from({ length: place.rating }, (_, index) => (
            <FaStar key={index} className="text-yellow-500 inline-block" />
          ))}
        </div>
      </div>
      <div className="bg-white -mx-8 px-8 py-8 border-t">
        <h2 className="font-semibold text-2xl">Share this Place</h2>
        <div className="flex space-x-4 mt-4">
          <FacebookShareButton url={shareUrl} className="bg-blue-600 p-2 rounded-full text-white">
            <FacebookIcon size={32} round />
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} className="bg-blue-400 p-2 rounded-full text-white">
            <TwitterIcon size={32} round />
          </TwitterShareButton>
          <LinkedinShareButton url={shareUrl} className="bg-blue-700 p-2 rounded-full text-white">
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
          <WhatsappShareButton url={shareUrl} className="bg-green-500 p-2 rounded-full text-white">
            <WhatsappIcon size={32} round />
          </WhatsappShareButton>
        </div>
      </div>
    </div>
  );
}
