// server
require('dotenv').config(); // Load environment variables normallynode.

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');

const userRoutes = require('./routes/userRoutes');  // API endpoints
const pageRoutes = require('./routes/pageRoutes');  // Page routes

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use method-override to support PUT and DELETE from forms
app.use(methodOverride('_method'));

// Serve static files from the public folder
app.use(express.static('public')); 

// Set EJS as the templating engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Configure express-session
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Load from .env
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1-hour session
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/', pageRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
