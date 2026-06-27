const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');

const dns = require('dns');
dns.setServers(['1.1.1.1','8.8.8.8'])

const app = express();

dotenv.config();


app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes );
app.use('/api/bookings', bookingRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

  const port = process.env.PORT || 3000;




app.listen(port, () => console.log(`Server running on port ${port}`));
