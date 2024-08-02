import { useParams , useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import AddressLink from "../AddressLink";
import PlaceGallery from "../PlaceGallery";
import BookingDates from "../BookingDates";

export default function BookingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [cancellationStatus, setCancellationStatus] = useState('');

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:4000/api/bookings/${id}`)
        .then(response => {
          setBooking(response.data);
        })
        .catch(err => {
          console.error('Error fetching booking:', err);
          setError('Failed to fetch booking details');
        });
    }
  }, [id]);

  async function handleCancelBooking() {
    try {
      await axios.post('http://localhost:4000/api/cancel-booking', { bookingId: id });
      setCancellationStatus('Booking canceled successfully');
      
      // To reflect changes on the bookings page and redirect after a short delay
      setTimeout(() => {
        navigate('/account/bookings');
      }, 2000);
    } catch (err) {
      console.error('Error canceling booking:', err);
      setError('Failed to cancel booking');
    }
  }


  if (!booking) {
    return <div>{error || 'Loading booking details...'}</div>;
  }

  return (
    <div className="my-8">
      <h1 className="text-3xl">{booking.place.title}</h1>
      <AddressLink className="my-2 block">{booking.place.address}</AddressLink>
      <div className="bg-gray-200 p-6 my-6 rounded-2xl flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-4">Your booking information:</h2>
          <BookingDates booking={booking} />
          {booking.status !== 'canceled' && booking.status !== 'completed' && (
            <button onClick={handleCancelBooking} className="primary mt-4">
              Cancel Booking
            </button>
          )}
          {cancellationStatus && <div className="text-green-500 mt-2">{cancellationStatus}</div>}
        </div>
        <div className="bg-primary p-6 text-white rounded-2xl">
          <div>Total price</div>
          <div className="text-3xl">${booking.price}</div>
        </div>
      </div>
      <PlaceGallery place={booking.place} />
    </div>
  );
}
