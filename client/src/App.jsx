//import './App.css'
import {Route, Routes} from "react-router-dom";
import IndexPage from "./pages/IndexPage.jsx";
import LoginPage from "./pages/LoginPage";
import Layout from "./Layout";
import RegisterPage from "./pages/RegisterPage";
import axios from "axios";
import {UserContextProvider} from "./UserContext";
import ProfilePage from "./pages/ProfilePage.jsx";
import PlacesPage from "./pages/PlacesPage";
import PlacesFormPage from "./pages/PlacesFormPage";
import PaymentPage from './pages/PaymentPage';
import PlacePage from "./pages/PlacePage";
import BookingsPage from "./pages/BookingsPage";
import BookingPage from "./pages/BookingPage";
///import LocationPlacesPage from "./pages/LocationPlacesPage";

import {loadStripe} from '@stripe/stripe-js';
import {Elements} from '@stripe/react-stripe-js';
import LocationPlacesPage from "./pages/LocationPlacesPage.jsx";

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

const stripePromise = loadStripe('pk_test_51MyDjZSCrQadYtMEy5sPPkCCGqHfzcVLPG1dA0Mm6eh11v8Qxzj2YYm5wTDtYgmxhHaz2Q3u7wtEG8VV23XtO8LO00mCYd95OX'); // Replace 'your_publishable_key' with your actual publishable key

function App() {
  return (
    <UserContextProvider>
      <Elements stripe={stripePromise}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/account" element={<ProfilePage />} />
            <Route path="/account/places" element={<PlacesPage />} />
            <Route path="/account/places/new" element={<PlacesFormPage />} />
            <Route path="/account/places/:id" element={<PlacesFormPage />} />
            <Route path="/place/:id" element={<PlacePage />} />
            <Route path="/account/bookings" element={<BookingsPage />} />
            <Route path="/account/bookings/:id" element={<BookingPage />} />
            <Route path="/payment/:bookingId" element={<PaymentPage />} />
            <Route path="/places" element={<LocationPlacesPage />} />
          </Route>
        </Routes>
      </Elements>
    </UserContextProvider>
  )
}

export default App;
