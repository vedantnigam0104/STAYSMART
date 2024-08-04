import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AccountNav from "../AccountNav";
import PlaceImg from "../PlaceImg";
import BookingDates from "../BookingDates";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext"; // Import UserContext

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [reminders, setReminders] = useState([]);
  const [bookingReminderStatus, setBookingReminderStatus] = useState({});
  const [message, setMessage] = useState('');

  const { user } = useContext(UserContext); // Get user from context

  useEffect(() => {
    // Fetch bookings
    axios.get('http://localhost:4000/api/bookings')
      .then(response => {
        setBookings(response.data);
        setLoading(false);
        if (response.data.length === 0) {
          setShowPopup(true);
        }
      })
      .catch(() => {
        setLoading(false);
        setShowPopup(true);
      });

    // Fetch reminders for the current user
    if (user && user._id) {
      axios.get(`http://localhost:4000/api/reminders/${user._id}`)
        .then(response => {
          setReminders(response.data);
          const reminderStatus = {};
          response.data.forEach(reminder => {
            reminderStatus[reminder.bookingId] = true;
          });
          setBookingReminderStatus(reminderStatus);
        })
        .catch(error => {
          console.error('Error fetching reminders:', error);
        });
    }
  }, [user]);

  const handleSetReminder = async (bookingId) => {
    if (!reminderDate) {
      setMessage('Please set a reminder date.');
      return;
    }

    if (bookingReminderStatus[bookingId]) {
      setMessage('Reminder already set for this booking.');
      setReminderDate('');
      return;
    }

    try {
      const response = await axios.post('/api/reminders', {
        userId: user._id, // Include userId
        bookingId,
        reminderDate,
      });
      if (response.status === 201) {
        alert('Reminder set successfully!');
        setReminderDate('');
        setSelectedBooking(null);

        // Update state to reflect that reminder is now set
        setBookingReminderStatus(prevStatus => ({
          ...prevStatus,
          [bookingId]: true,
        }));
      } else {
        alert('Failed to set reminder');
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
      setMessage('Failed to set reminder');
    } finally {
      // Clear message after action is completed
      setTimeout(() => {
        setMessage('');
      }, 3000); // Clear message after 3 seconds
    }
  };

  const closeModal = () => {
    setSelectedBooking(null);
    setMessage(''); // Clear message when modal is closed
  };

  return (
    <div>
      <AccountNav />
      <div className="mt-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold mb-6">My Bookings</h1>
        
        {loading ? (
          <div>Loading bookings...</div>
        ) : (
          bookings.length > 0 ? (
            bookings.map(booking => (
              <div 
                key={booking._id} 
                className="flex flex-col gap-4 bg-gray-200 rounded-2xl overflow-hidden mb-4 p-4"
              >
                <Link 
                  to={`/account/bookings/${booking._id}`} 
                  className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden"
                >
                  <div className="w-48">
                    <PlaceImg place={booking.place} />
                  </div>
                  <div className="py-3 pr-3 grow">
                    <h2 className="text-xl">{booking.place.title}</h2>
                    <div className="text-xl">
                      <BookingDates booking={booking} className="mb-2 mt-4 text-gray-500" />
                      <div className="flex gap-1">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-8 h-8"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" 
                          />
                        </svg>
                        <span className="text-2xl">
                          Total price: ${booking.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Set Reminder
                </button>
              </div>
            ))
          ) : (
            <div>No bookings found.</div>
          )
        )}

        {selectedBooking && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-4">Set Reminder for {selectedBooking.place.title}</h2>
              <label htmlFor="reminderDate" className="block text-gray-700 mb-2">Reminder Date</label>
              <input
                type="date" // Change to date input
                id="reminderDate"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              />
              <button
                onClick={() => handleSetReminder(selectedBooking._id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg"
              >
                Set Reminder
              </button>
              <button
                onClick={closeModal}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg mt-4"
              >
                Close
              </button>
              {message && (
                <div className="mt-4 p-4 border border-gray-300 rounded-lg bg-gray-100 text-gray-700">
                  {message}
                </div>
              )}
            </div>
          </div>
        )}

        {showPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">No bookings found</h2>
              <button
                onClick={() => setShowPopup(false)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
