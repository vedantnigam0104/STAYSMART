import { useContext, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";
import Modal from "./Modal.jsx"; // Import the Modal component

export default function BookingWidget({ place }) {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(''); // State for user email
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email || ''); // Assuming user object contains email
    }
  }, [user]);

  let numberOfNights = 0;
  if (checkIn && checkOut) {
    numberOfNights = differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
  }

  async function bookThisPlace() {
    if (user && place.owner.toString() === user._id.toString()) {
      setShowModal(true); // Show the modal
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/api/bookings', {
        checkIn, checkOut, numberOfGuests, name, phone,
        place: place._id,
        price: numberOfNights * place.price,
        email: user.email,
      });
      const newBookingId = response.data._id;

      // Redirect to payment page with booking ID
      navigate(`/payment/${newBookingId}`);
    } catch (error) {
      console.error('Error booking the place:', error);
      setShowModal(true); // Show the modal for booking failure
    }
  }

  return (
    <div className="bg-white shadow p-4 rounded-2xl">
      <div className="text-2xl text-center">
        Price: ${place.price} / per night
      </div>
      <div className="border rounded-2xl mt-4">
        <div className="flex">
          <div className="py-3 px-4">
            <label>Check in:</label>
            <input type="date"
                   value={checkIn}
                   onChange={ev => setCheckIn(ev.target.value)} />
          </div>
          <div className="py-3 px-4 border-l">
            <label>Check out:</label>
            <input type="date"
                   value={checkOut}
                   onChange={ev => setCheckOut(ev.target.value)} />
          </div>
        </div>
        <div className="py-3 px-4 border-t">
          <label>Number of guests:</label>
          <input type="number"
                 value={numberOfGuests}
                 onChange={ev => setNumberOfGuests(ev.target.value)} />
        </div>
        {numberOfNights > 0 && (
          <div className="py-3 px-4 border-t">
            <label>Your full name:</label>
            <input type="text"
                   value={name}
                   onChange={ev => setName(ev.target.value)} />
            <label>Phone number:</label>
            <input type="tel"
                   value={phone}
                   onChange={ev => setPhone(ev.target.value)} />
            <label>Email:</label>
            <input type="email"
                   value={email}
                   onChange={ev => setEmail(ev.target.value)} />
          </div>
        )}
      </div>
      <button onClick={bookThisPlace} className="primary mt-4">
        Book this place
        {numberOfNights > 0 && (
          <span> ${numberOfNights * place.price}</span>
        )}
      </button>

      {/* Modal for booking error or self-booking prevention */}
      <Modal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Booking Error"
      >
        <p>You cannot book your own place. Please choose another property.</p>
      </Modal>
    </div>
  );
}
