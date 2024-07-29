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
//const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
//const mime = require('mime-types');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';
//const bucket = 'dawid-booking-app';

app.use(express.json());

app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(cors({
  credentials: true,
  origin: 'http://localhost:5173',
}));




function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
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

app.get('/api/profile', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {
    res.json(null);
  }
});

app.post('/api/logout', (req,res) => {
  res.cookie('token', '').json(true);
});


app.post('/api/upload-by-link', async (req, res) => {
  const { link } = req.body;

  // Validate the link
  if (!link) {
    return res.status(400).json({ error: 'No link provided' });
  }

  const newName = 'photo' + Date.now() + '.jpg';
  const uploadDir = path.join(__dirname, 'uploads');

  // Ensure the uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  try {
    await imageDownloader.image({
      url: link,
      dest: path.join(uploadDir, newName), // Save to uploads directory
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
    const ext = path.extname(originalname); // Get the file extension
    const newName = path.basename(tempPath) + ext; // Create new file name with extension
    const newPath = path.join('uploads', newName); // Final path

    console.log('Temp path:', tempPath);
    console.log('New path:', newPath);

    // Rename the file
    fs.renameSync(tempPath, newPath);

    // Store the relative path for serving
    uploadedFiles.push(newPath.replace(/\\/g, '/')); // Ensure paths use forward slashes
  }

  res.json(uploadedFiles);
});

app.post('/api/places', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    title,address,addedPhotos,description,price,
    perks,extraInfo,checkIn,checkOut,maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner:userData.id,price,
      title,address,photos:addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,
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
    console.log(`Received request for /api/places/${id}`);
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
    id, title,address,addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
});

app.get('/api/places', async (req, res) => {
  try {
    console.log('Received request for /api/places');
    const places = await Place.find();
    console.log('Fetched places:', places);
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/bookings', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  const {
    place,checkIn,checkOut,numberOfGuests,name,phone,price,
  } = req.body;
  Booking.create({
    place,checkIn,checkOut,numberOfGuests,name,phone,price,
    user:userData.id,
  }).then((doc) => {
    res.json(doc);
  }).catch((err) => {
    throw err;
  });
});

app.get('/api/bookings', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  res.json( await Booking.find({user:userData.id}).populate('place') );
});


app.listen(4000,()=>
{
  console.log('Server running on port 4000')
});