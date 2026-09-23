import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Booking {
  id: string;
  customerName: string;
  phoneNumber: string;
  plateNumber: string;
  serviceType: string;
  vehicleType: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'verified' | 'rejected';
  bookingDate: string;
  createdAt: string;
}

interface Prices {
  normalHalf: number;
  normalFull: number;
  suvHalf: number;
  suvFull: number;
}

interface DatabaseSchema {
  bookings: Booking[];
  prices: Prices;
}

export function getDb(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      bookings: [],
      prices: {
        normalHalf: 300,
        normalFull: 350,
        suvHalf: 350,
        suvFull: 450 // Default adjustable SUV full price
      }
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    const data = JSON.parse(fileContent);
    if (!data.prices) {
      data.prices = { normalHalf: 300, normalFull: 350, suvHalf: 350, suvFull: 450 };
    }
    return data;
  } catch (e) {
    return {
      bookings: [],
      prices: { normalHalf: 300, normalFull: 350, suvHalf: 350, suvFull: 450 }
    };
  }
}

export function saveDb(data: DatabaseSchema): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}