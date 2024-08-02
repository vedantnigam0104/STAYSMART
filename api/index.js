require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_KEY);
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
//const uploadAvatarMiddleware = multer({ dest: 'uploads/' });

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';

const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Stripe Secret Key:', process.env.STRIPE_KEY);

app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}.`
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}

//const jwt = require('jsonwebtoken');
///const jwtSecret = process.env.JWT_SECRET; // Make sure this is correctly set in your environment

function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies.token; // Ensure this is how you're storing the JWT token

    if (!token) {
      return reject(new Error('No token provided'));
    }

    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        console.error('Error verifying token:', err);
        return reject(new Error('Invalid token'));
      }
      
      resolve(userData);
    });
  });
}


app.get('/api/test', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json('test ok');
});

app.post('/api/register', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {name,email,password} = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post('/api/login', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

app.get('/api/profile', (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const { token } = req.cookies;

  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' }); // Handle JWT errors
      }

      try {
        const user = await User.findById(userData.id)
          .select('name email avatar _id'); // Specify the fields to return

        if (!user) {
          return res.status(404).json({ error: 'User not found' }); // Handle user not found
        }

        res.json(user);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' }); // Handle other errors
      }
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // Handle missing token
  }
});


app.put('/api/profile', upload.none(), async (req, res) => {
  console.log('Request Body:', req.body); // Debug log
  const { token } = req.cookies;
  const { name, email, newPassword } = req.body;

  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
        return res.status(401).json({ error: 'Unauthorized' }); // Handle JWT errors
      }

      try {
        const user = await User.findById(userData.id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' }); // Handle user not found
        }

        // Update user fields if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (newPassword) user.password = bcrypt.hashSync(newPassword, 10); // Assuming bcrypt is used for hashing

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully' });
      } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal server error' }); // Handle other errors
      }
    });
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // Handle missing token
  }
});



app.post('/api/logout', (req,res) => {
  res.cookie('token', '').json(true);
});

app.post('/api/upload-by-link', async (req, res) => {
  const { link } = req.body;

  if (!link) {
    return res.status(400).json({ error: 'No link provided' });
  }

  const newName = 'photo' + Date.now() + '.jpg';
  const uploadDir = path.join(__dirname, 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  try {
    await imageDownloader.image({
      url: link,
      dest: path.join(uploadDir, newName),
    });

    res.json(newName);
  } catch (error) {
    console.error('Error downloading image:', error);
    res.status(500).json({ error: 'Error downloading image' });
  }
});

const photoMiddleware = multer({ dest: 'uploads/' });

app.post('/api/uploads', photoMiddleware.array('photos', 100), (req, res) => {
  const uploadedFiles = [];

  for (let i = 0; i < req.files.length; i++) {
    const { path: tempPath, originalname } = req.files[i];
    const ext = path.extname(originalname);
    const newName = path.basename(tempPath) + ext;
    const newPath = path.join('uploads', newName);

    console.log('Temp path:', tempPath);
    console.log('New path:', newPath);

    fs.renameSync(tempPath, newPath);

    uploadedFiles.push(newPath.replace(/\\/g, '/'));
  }

  res.json(uploadedFiles);
});

app.post('/api/places', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    title,address,location,locationUrl,addedPhotos,description,price,
    perks,extraInfo,checkIn,checkOut,maxGuests,hostedBy,reviews,rating
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner:userData.id,price,
      title,address,location,locationUrl,photos:addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,hostedBy,reviews,rating
    });
    res.json(placeDoc);
  });
});

app.get('/api/user-places', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const {id} = userData;
    res.json( await Place.find({owner:id}) );
  });
});

app.get('/api/places/:id', async (req, res) => {
  const { id } = req.params;

  try {
    //console.log(`Received request for /api/places/${id}`);
    const place = await Place.findById(id);
    
    if (!place) {
      console.log(`Place with ID ${id} not found`);
      return res.status(404).json({ error: 'Place not found' });
    }
    
    console.log('Fetched place:', place);
    res.json(place);
  } catch (error) {
    console.error('Error fetching place:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.put('/api/places', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    id, title,address,location,locationUrl,addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,price,hostedBy,reviews,rating
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,address,location,locationUrl,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,hostedBy,reviews,rating
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
});

app.get('/api/places', async (req, res) => {
  try {
   // console.log('Received request for /api/places');
    const places = await Place.find();
    //console.log('Fetched places:', places);
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/bookings', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);

  try {
    const userData = await getUserDataFromReq(req);

    if (!userData || !userData.id) {
      return res.status(400).json({ error: 'User information is missing or invalid' });
    }

    const {
      place, checkIn, checkOut, numberOfGuests, name, phone, price, email
    } = req.body;

    const booking = await Booking.create({
      place,
      user: userData.id,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      email
    });

    res.json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ error: 'Error creating booking' });
  }
});



app.get('/api/bookings', async (req, res) => {
  try {
    const userData = await getUserDataFromReq(req);

    if (!userData || !userData.id) {
      return res.status(400).json({ error: 'User information is missing or invalid' });
    }

    // Fetch bookings and populate the 'place' field
    const bookings = await Booking.find({ user: userData.id, status: 'confirmed' })
      .populate('place')  // Populate the 'place' field
      .exec();

    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Error fetching bookings' });
  }
});




app.get('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid booking ID format' });
  }

  try {
    const booking = await Booking.findById(id).populate('place').exec();
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    console.log('Booking details:', booking);
    res.json(booking);
  } catch (err) {
    console.error('Error fetching booking:', err);
    res.status(500).json({ error: 'Error fetching booking' });
  }
});


app.post('/api/finalize-booking', async (req, res) => {
  const { bookingId } = req.body;
  try {
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'confirmed'; // Update status to confirmed
    await booking.save();

    res.json({ success: true });
  } catch (err) {
    console.error('Error finalizing booking:', err);
    res.status(500).json({ error: 'Failed to finalize booking' });
  }
});


app.post('/api/create-payment-intent', async (req, res) => {
  // Log the entire request body to see its structure
  console.log("Request body:", req.body);

  // Destructure the request body
  const { amount, description, name, address, email } = req.body;
  
  // Log each variable after destructuring
  console.log("Amount:", amount);
  console.log("Description:", description);
  console.log("Name:", name);
  console.log("Address:", address);
  console.log("Email before Stripe API call:", email);

  if (!email) {
    console.error("Error: Email is missing in the request body.");
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency: 'usd',
      description,
      payment_method_types: ['card'],
      metadata: {
        name
      },
      receipt_email: email // Use the logged email
    });

    console.log("PaymentIntent created successfully:", paymentIntent.id);

    const otp = otpGenerator.generate(6, { digits: true, upperCase: false, specialChars: false });

    console.log("Generated OTP:", otp);

    await sendOtpEmail(email, otp);
    console.log("OTP sent to:", email);

    req.app.locals.otps = req.app.locals.otps || {};
    req.app.locals.otps[email] = otp;

    res.json({ clientSecret: paymentIntent.client_secret, otp });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (req.app.locals.otps && req.app.locals.otps[email] === otp) {
    delete req.app.locals.otps[email];
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: 'Invalid OTP' });
  }
});

app.post('/api/cancel-booking', async (req, res) => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).send('Booking ID is required');

    const result = await Booking.deleteOne({ _id: bookingId });
    if (result.deletedCount === 0) return res.status(404).send('Booking not found');

    res.send('Booking canceled successfully');
  } catch (error) {
    console.error('Error canceling booking:', error);
    res.status(500).send('Server error');
  }
});

// Example of an Express.js route for searching places by location



app.get('/api/search', async (req, res) => {
  try {
    const { location } = req.query;

    console.log(`Received location: ${location}`);

    // Perform search logic based on the location
    const places = await Place.find({location});

    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.get('/api/places/:location', async (req, res) => {
  try {
    const { location } = req.params;

    console.log(`Received location: ${location}`);

    // Perform case-insensitive search
    const places = await PlaceModel.find({
      location: { $regex: new RegExp(location, 'i') }
    });

    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

app.listen(4000,()=>
{
  console.log('Server running on port 4000');
});
