import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Image from "../Image.jsx";
import Footer from "../Footer.jsx";
import { UserContext } from "../UserContext.jsx";
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Ensure that this element exists in your HTML

export default function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const { user, ready } = useContext(UserContext);

  useEffect(() => {
    if (!ready) return; // Wait until context is ready

    const fetchData = async () => {
      try {
        // Fetch places
        const placesResponse = await axios.get('http://localhost:4000/api/places');
        setPlaces(placesResponse.data);

        // Fetch reminders only if user is logged in
        if (user && user._id) {
          setProfileLoading(true);
          try {
            const remindersResponse = await axios.get(`http://localhost:4000/api/reminders/${user._id}`);
            setReminders(remindersResponse.data);

            // Check if the modal should be shown
            const sessionModalShown = sessionStorage.getItem('modalShown');
            if (remindersResponse.data.length > 0 && !sessionModalShown) {
              setShowModal(true); // Show modal if there are reminders and it hasn't been shown in this session
              sessionStorage.setItem('modalShown', 'true'); // Set flag to indicate modal has been shown in this session
            }
          } catch (error) {
            console.error('Error fetching reminders:', error.response?.data || error.message);
          } finally {
            setProfileLoading(false);
          }
        } else {
          console.log('User not logged in or userId not available');
        }
      } catch (error) {
        console.error('Error fetching places:', error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, ready]); // Dependencies include 'user' and 'ready' to refetch data if either changes

  const closeModal = () => {
    setShowModal(false);
  };

  if (profileLoading) {
    return <div>Loading profile...</div>;
  }

  if (profileError) {
    return <div>Error fetching profile: {profileError}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="mt-8 max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md flex-grow">
        <h1 className="text-3xl font-semibold mb-6">Available Places</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid gap-x-6 gap-y-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
            {places.length > 0 && places.map(place => (
              <Link to={'/place/' + place._id} key={place._id}>
                <div className="bg-gray-500 mb-2 rounded-2xl flex">
                  {place.photos?.[0] && (
                    <Image className="rounded-2xl object-cover aspect-square" src={place.photos?.[0]} alt="" />
                  )}
                </div>
                <h2 className="font-bold">{place.address}</h2>
                <h3 className="text-sm text-gray-500">{place.title}</h3>
                <div className="mt-1">
                  <span className="font-bold">${place.price}</span> per night
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <Modal
        isOpen={showModal}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center justify-center p-4"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Reminders this month</h2>
          {reminders.length > 0 ? (
            <ul className="list-disc pl-5">
              {reminders.map(reminder => (
                <li key={reminder._id} className="mb-2">
                  Reminder for booking: {reminder.bookingId} on {new Date(reminder.reminderDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <div>No reminders</div>
          )}
          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
