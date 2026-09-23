import express from 'express';
import path from 'path';
import { getDb, saveDb } from './db';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// Get current prices
app.get('/api/prices', (req, res) => {
  const db = getDb();
  res.json(db.prices);
});

// Admin: Update prices
app.patch('/api/admin/prices', (req, res) => {
  const { normalHalf, normalFull, suvHalf, suvFull } = req.body;
  const db = getDb();
  
  if (normalHalf !== undefined) db.prices.normalHalf = Number(normalHalf);
  if (normalFull !== undefined) db.prices.normalFull = Number(normalFull);
  if (suvHalf !== undefined) db.prices.suvHalf = Number(suvHalf);
  if (suvFull !== undefined) db.prices.suvFull = Number(suvFull);

  saveDb(db);
  res.json({ success: true, prices: db.prices });
});

// Create booking & payment submission
app.post('/api/bookings', (req, res) => {
  const { customerName, phoneNumber, plateNumber, serviceType, vehicleType, amount, paymentMethod, transactionId, bookingDate } = req.body;
  
  if (!customerName || !phoneNumber || !plateNumber || !serviceType || !vehicleType || !bookingDate) {
    return res.status(400).json({ error: 'Required booking fields are missing' });
  }

  const db = getDb();
  const newBooking = {
    id: 'MIG-' + Math.floor(100000 + Math.random() * 900000),
    customerName,
    phoneNumber,
    plateNumber: plateNumber.toUpperCase(),
    serviceType,
    vehicleType,
    amount: Number(amount || 0),
    paymentMethod: paymentMethod || 'none',
    transactionId: transactionId || 'N/A',
    status: 'pending' as const,
    bookingDate,
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  saveDb(db);

  res.json({ success: true, booking: newBooking });
});

// Get bookings by phone number for customer tracking
app.get('/api/bookings/phone/:phone', (req, res) => {
  const db = getDb();
  const phoneQuery = req.params.phone.trim();
  const userBookings = db.bookings.filter(b => b.phoneNumber === phoneQuery);
  res.json(userBookings);
});

// Admin: Get all bookings
app.get('/api/admin/bookings', (req, res) => {
  const db = getDb();
  res.json(db.bookings);
});

// Admin: Verify or reject payment
app.patch('/api/admin/bookings/:id', (req, res) => {
  const { status } = req.body;
  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const db = getDb();
  const booking = db.bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  booking.status = status;
  saveDb(db);

  res.json({ success: true, booking });
});

// Admin PIN login
app.post('/api/admin/login', (req, res) => {
  const { pin } = req.body;
  if (pin === 'MigAdmin2026!') {
    res.json({ success: true, user: { fullName: 'MIG Admin', role: 'admin' } });
  } else {
    res.status(401).json({ error: 'Invalid admin PIN' });
  }
});

app.listen(PORT, () => {
  console.log(`MIG Car Wash server running at http://localhost:${PORT}`);
});