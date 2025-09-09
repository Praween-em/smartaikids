const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const connectDB = require('./db');
require('dotenv').config();
const path = require('path');

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors());

app.use(express.json());
app.use(express.static('.'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Signup route
app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({
      email,
      password,
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});


const auth = require('./middleware/auth');

app.get('/videos', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'videos.html'));
});

app.get('/api/videos', auth, (req, res) => {
  const videos = [
    { id: 1, title: 'Video 1', description: 'This is the first video.', url: 'video1.mp4' },
    { id: 2, title: 'Video 2', description: 'This is the second video.', url: 'video2.mp4' },
    { id: 3, title: 'Video 3', description: 'This is the third video.', url: 'video3.mp4' },
  ];
  res.json(videos);
});

app.post('/api/videos/:id/purchase', auth, (req, res) => {
  res.json({ message: `Purchase video ${req.params.id} endpoint` });
});

app.get('/api/videos/:id/play', auth, (req, res) => {
  res.json({ message: `Play video ${req.params.id} endpoint` });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');
    app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

startServer();