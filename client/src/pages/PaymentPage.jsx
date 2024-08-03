import { useEffect, useState ,useContext} from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { UserContext } from '../UserContext';
export default function PaymentPage() {
  const { bookingId } = useParams();
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('credit'); // Default to credit card
  const [paymentStatus, setPaymentStatus] = useState('');
  const [otp, setOtp] = useState(''); // State for OTP
  const [otpSent, setOtpSent] = useState(false); // State to track if OTP was sent
  const [email, setEmail] = useState(''); // State for user email
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    if (bookingId) {
      console.log('Fetching booking details for ID:', bookingId);
      axios.get(`http://localhost:4000/api/bookings/${bookingId}`)
        .then(response => {
          console.log('Booking data:', response.data);
          setAmount(response.data.price); // Adjust according to actual response structure
          setEmail(response.data.email); // Ensure email is part of the response
        })
        .catch(err => {
          console.error('Error fetching booking details:', err);
          setPaymentStatus('Error fetching booking details');
        });
    }
  }, [bookingId]);
  
  async function handlePayment() {
    if (!user || !user.email) {
      setPaymentStatus('User email is missing');
      return;
    }

    try {
      const paymentResponse = await axios.post('http://localhost:4000/api/create-payment-intent', {
        amount: amount * 100, // Amount in cents
        description: 'Hotel booking for place XYZ', // Replace with actual description
        name: user.name, // Replace with actual customer name
        address: {
          line1: 'Street Address',
          city: 'City',
          state: 'State',
          postal_code: 'Postal Code',
          country: 'IN' // Country code for India
        },
        email: user.email
      });
      console.log('Payment response:', paymentResponse.data);

      const { clientSecret } = paymentResponse.data;

      // Confirm the card payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name, // Replace with actual customer name
            address: {
              line1: 'Street Address',
              city: 'City',
              state: 'State',
              postal_code: 'Postal Code',
              country: 'IN' // Country code for India
            }
          },
        },
      });

      if (result.error) {
        setPaymentStatus('Payment failed: ' + result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        setOtpSent(true);
        setPaymentStatus('please enter the OTP sent to your email');

        await axios.post('http://localhost:4000/api/finalize-booking', { bookingId });
      }

    } catch (err) {
      setPaymentStatus('Error processing payment');
      console.error('Error processing payment:', err);
    }
  }

  async function verifyOtp() {
    try {
      const response = await axios.post('http://localhost:4000/api/verify-otp', {
        email: user.email, // Use the actual email of the customer
        otp,
        bookingId
      });

      if (response.data.success) {
        navigate(`/account/bookings/${bookingId}`);
      } else {
        setPaymentStatus('Invalid OTP');
      }
    } catch (err) {
      setPaymentStatus('Error verifying OTP');
      console.error('Error verifying OTP:', err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 py-6">
      <div className="max-w-lg w-full bg-blue-50 shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-center mb-6">Payment Page</h1>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                value="credit"
                checked={paymentMethod === 'credit'}
                onChange={() => setPaymentMethod('credit')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Credit Card</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                value="debit"
                checked={paymentMethod === 'debit'}
                onChange={() => setPaymentMethod('debit')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Debit Card</span>
            </div>
          </div>

          {paymentMethod && (
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <CardElement className="p-2 bg-white rounded-lg border border-gray-300" />
            </div>
          )}

          <button
            onClick={handlePayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
          >
            Pay ${amount}
          </button>

          {otpSent && (
            <div className="mt-4">
              <label className="block text-gray-700 mb-2" htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={verifyOtp}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg mt-4 transition duration-200"
              >
                Verify OTP
              </button>
            </div>
          )}

          {paymentStatus && (
            <div className="text-center text-red-500 mt-4">{paymentStatus}</div>
          )}
        </div>
      </div>
    </div>
  );
}
