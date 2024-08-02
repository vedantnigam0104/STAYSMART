import { useEffect, useState } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import AccountNav from "../AccountNav";
import PhotosUploader from "../PhotosUploader";
import Perks from "../Perks";
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';
import moment from 'moment'; // Import moment

export default function PlacesFormPage() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [locationUrl, setLocationUrl] = useState(''); // New state for locationUrl
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('14:00');
  const [checkOut, setCheckOut] = useState('11:00');
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);

  // New state variables for hostedBy, reviews, and rating
  const [hostedBy, setHostedBy] = useState('');
  const [reviews, setReviews] = useState('');
  const [rating, setRating] = useState('1.0');

  useEffect(() => {
    if (!id) {
      return;
    }
    axios.get(`http://localhost:4000/api/places/${id}`).then(response => {
      const { data } = response;
      setTitle(data.title);
      setAddress(data.address);
      setLocation(data.location);
      setLocationUrl(data.locationUrl || ''); // Handle locationUrl
      setAddedPhotos(data.photos);
      setDescription(data.description);
      setPerks(data.perks);
      setExtraInfo(data.extraInfo);
      setCheckIn(normalizeTime(data.checkIn));
      setCheckOut(normalizeTime(data.checkOut));
      setMaxGuests(data.maxGuests);
      setPrice(data.price);
      setHostedBy(data.hostedBy);
      setReviews(data.reviews);
      setRating(data.rating);
    });
  }, [id]);

  function normalizeTime(time) {
    return moment(time, ["HH:mm", "hh:mm A"]).format("HH:mm");
  }

  function inputHeader(text) {
    return (
      <h2 className="text-2xl mt-4">{text}</h2>
    );
  }

  function inputDescription(text) {
    return (
      <p className="text-gray-500 text-sm">{text}</p>
    );
  }

  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = {
      title, address, location, locationUrl, addedPhotos,
      description, perks, extraInfo,
      checkIn: normalizeTime(checkIn),
      checkOut: normalizeTime(checkOut),
      maxGuests, price,
      hostedBy,
      reviews,
      rating,
    };
    if (id) {
      // update
      await axios.put('http://localhost:4000/api/places', {
        id, ...placeData
      });
      setRedirect(true);
    } else {
      // new place
      await axios.post('http://localhost:4000/api/places', placeData);
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={'/account/places'} />
  }

  return (
    <div>
      <AccountNav />
      <form onSubmit={savePlace}>
        {preInput('Title', 'Title for your place. should be short and catchy as in advertisement')}
        <input type="text" value={title} onChange={ev => setTitle(ev.target.value)} placeholder="title, for example: My lovely apt" />
        {preInput('Address', 'Address to this place')}
        <input type="text" value={address} onChange={ev => setAddress(ev.target.value)} placeholder="address" />
        {preInput('Location', 'Location of the place (country)')}
        <input type="text" value={location} onChange={ev => setLocation(ev.target.value)} placeholder="location, for example: India" />
        {preInput('Location URL', 'URL for the location')}
        <input type="text" value={locationUrl} onChange={ev => setLocationUrl(ev.target.value)} placeholder="location URL" />
        {preInput('Photos', 'more = better')}
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />
        {preInput('Description', 'description of the place')}
        <textarea value={description} onChange={ev => setDescription(ev.target.value)} />
        {preInput('Perks', 'select all the perks of your place')}
        <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Perks selected={perks} onChange={setPerks} />
        </div>
        {preInput('Extra info', 'house rules, etc')}
        <textarea value={extraInfo} onChange={ev => setExtraInfo(ev.target.value)} />
        {preInput('Check in&out times', 'add check in and out times, remember to have some time window for cleaning the room between guests')}
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mt-2 -mb-1">Check in time</h3>
            <TimePicker
              onChange={setCheckIn}
              value={checkIn}
              format="HH:mm"
              className="w-full"
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Check out time</h3>
            <TimePicker
              onChange={setCheckOut}
              value={checkOut}
              format="HH:mm"
              className="w-full"
            />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max number of guests</h3>
            <input type="number" value={maxGuests}
                   onChange={ev => setMaxGuests(ev.target.value)} />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Price per night</h3>
            <input type="number" value={price}
                   onChange={ev => setPrice(ev.target.value)} />
          </div>
        </div>
        {preInput('Hosted by', 'Name of the host')}
        <input type="text" value={hostedBy} onChange={ev => setHostedBy(ev.target.value)} placeholder="Host name" />
        {preInput('Reviews', 'Add reviews for the place')}
        <textarea value={reviews} onChange={ev => setReviews(ev.target.value)} placeholder="Reviews" />
        {preInput('Rating', 'Rating for the place')}
        <select value={rating} onChange={ev => setRating(ev.target.value)}>
          <option value={1.0}>1.0</option>
          <option value={2.0}>2.0</option>
          <option value={3.0}>3.0</option>
          <option value={4.0}>4.0</option>
          <option value={5.0}>5.0</option>
        </select>
        <button className="primary my-4">Save</button>
      </form>
    </div>
  );
}
