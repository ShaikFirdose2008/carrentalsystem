/* ==========================================================================
   ApexDrive - LocalStorage Data Engine (db.js)
   Persistent Storage for Users, Cars Fleet, Bookings & Maintenance Records
   Strictly HTML5, CSS3, JavaScript (SDC Project Review-1)
   ========================================================================== */

const STORAGE_KEYS = {
  USERS: 'apexdrive_users',
  CARS: 'apexdrive_cars',
  BOOKINGS: 'apexdrive_bookings',
  MAINTENANCE: 'apexdrive_maintenance',
  CURRENT_USER: 'apexdrive_current_user'
};

// Seed Cars Dataset (High Resolution Unsplash Vehicles)
const DEFAULT_CARS = [
  {
    id: 'CAR-101',
    name: 'Porsche 911 Carrera S',
    brand: 'Porsche',
    category: 'Sports',
    pricePerDay: 12500,
    rating: 4.9,
    reviewsCount: 42,
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    acceleration: '3.5s',
    topSpeed: '308 km/h',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=900&q=80',
    description: 'Iconic twin-turbo flat-six engine delivering pure sports car thrills with supreme German precision engineering.',
    features: ['Sport Chrono', 'Bose Surround', 'Carbon Brakes', 'Apple CarPlay']
  },
  {
    id: 'CAR-102',
    name: 'Tesla Model S Plaid',
    brand: 'Tesla',
    category: 'Electric',
    pricePerDay: 9800,
    rating: 4.8,
    reviewsCount: 38,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    acceleration: '1.99s',
    topSpeed: '322 km/h',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
    description: 'Tri-motor all-wheel drive with unmatched electric torque, full self-driving capability, and cinematic 17-inch display.',
    features: ['Autopilot', 'Glass Roof', 'Wireless Charging', 'Tri-Zone Climate']
  },
  {
    id: 'CAR-103',
    name: 'BMW X7 xDrive40i M Sport',
    brand: 'BMW',
    category: 'SUV',
    pricePerDay: 11000,
    rating: 4.9,
    reviewsCount: 56,
    seats: 7,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    acceleration: '5.8s',
    topSpeed: '250 km/h',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
    description: 'The pinnacle of luxury SUVs. 7 seats with executive captain chairs, panoramic skylounge and adaptive air suspension.',
    features: ['7 Seats', 'Sky Lounge', 'Gesture Control', 'Harman Kardon']
  },
  {
    id: 'CAR-104',
    name: 'Mercedes-Benz E-Class Sedan',
    brand: 'Mercedes',
    category: 'Luxury',
    pricePerDay: 8500,
    rating: 4.7,
    reviewsCount: 64,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    acceleration: '6.2s',
    topSpeed: '250 km/h',
    status: 'Rented',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
    description: 'The executive benchmark with MBUX dual displays, massage seats, and quiet acoustic insulation for high-profile journeys.',
    features: ['MBUX Displays', 'Burmester Audio', 'Ambient Lighting', 'Active Park Assist']
  },
  {
    id: 'CAR-105',
    name: 'Ford Mustang GT Fastback',
    brand: 'Ford',
    category: 'Sports',
    pricePerDay: 7500,
    rating: 4.8,
    reviewsCount: 51,
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    acceleration: '4.3s',
    topSpeed: '260 km/h',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=900&q=80',
    description: '5.0-liter V8 beast delivering deep exhaust rumble and muscular retro American performance with modern cockpit tech.',
    features: ['5.0L V8 Engine', 'Active Valve Exhaust', 'Track Apps', 'Recaro Seats']
  },
  {
    id: 'CAR-106',
    name: 'Range Rover Velar R-Dynamic',
    brand: 'Land Rover',
    category: 'SUV',
    pricePerDay: 10500,
    rating: 4.8,
    reviewsCount: 29,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Diesel',
    acceleration: '5.5s',
    topSpeed: '240 km/h',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1541348263662-e0c82661ac74?auto=format&fit=crop&w=900&q=80',
    description: 'Avant-garde styling with flush deployable door handles, all-terrain response system, and acoustic sanctuary interior.',
    features: ['All-Terrain Response', 'Dual Touchscreens', 'Meridian Sound', 'Matrix LED']
  },
  {
    id: 'CAR-107',
    name: 'Audi RS6 Avant',
    brand: 'Audi',
    category: 'Sports',
    pricePerDay: 13500,
    rating: 5.0,
    reviewsCount: 33,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    acceleration: '3.6s',
    topSpeed: '305 km/h',
    status: 'Maintenance',
    image: 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=900&q=80',
    description: 'Twin-turbo V8 super-wagon that effortlessly blends supercar acceleration with family-sized luggage utility.',
    features: ['Quattro AWD', 'RS Ceramic Brakes', 'Sport Air Suspension', 'Bang & Olufsen']
  },
  {
    id: 'CAR-108',
    name: 'Hyundai Ioniq 5 Lounge',
    brand: 'Hyundai',
    category: 'Electric',
    pricePerDay: 6200,
    rating: 4.7,
    reviewsCount: 25,
    seats: 5,
    transmission: 'Automatic',
    fuelType: 'Electric',
    acceleration: '5.2s',
    topSpeed: '185 km/h',
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
    description: 'Ultra-fast 800V charging retro-futuristic EV crossover with relaxed lounge relaxation seating and vehicle-to-load supply.',
    features: ['800V Charging', 'V2L Power Outlet', 'Relaxation Seats', 'Bose System']
  }
];

// Seed Users Dataset (Admin & Customer Pre-Populated)
const DEFAULT_USERS = [
  {
    id: 'USR-001',
    name: 'Alex Morgan',
    email: 'demo@apex.com',
    password: 'user123',
    role: 'user',
    phone: '+91 98765 43210',
    city: 'Hyderabad',
    createdAt: '2026-08-15T10:00:00.000Z'
  },
  {
    id: 'ADM-001',
    name: 'Super Admin',
    email: 'admin@apex.com',
    password: 'admin123',
    role: 'admin',
    phone: '+91 99999 88888',
    city: 'Bengaluru',
    createdAt: '2026-08-01T09:00:00.000Z'
  }
];

// Seed Sample Bookings (Allows admin dashboard to showcase immediate analytics)
const DEFAULT_BOOKINGS = [
  {
    id: 'BK-9021',
    userId: 'USR-001',
    userEmail: 'demo@apex.com',
    userName: 'Alex Morgan',
    carId: 'CAR-104',
    carName: 'Mercedes-Benz E-Class Sedan',
    carImage: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80',
    pickupDate: '2026-09-24',
    returnDate: '2026-09-27',
    totalDays: 3,
    dailyRate: 8500,
    addonsCost: 1500,
    totalCost: 27000,
    status: 'Active',
    paymentMethod: 'Credit Card',
    createdAt: '2026-09-21T14:30:00.000Z'
  },
  {
    id: 'BK-8750',
    userId: 'USR-001',
    userEmail: 'demo@apex.com',
    userName: 'Alex Morgan',
    carId: 'CAR-102',
    carName: 'Tesla Model S Plaid',
    carImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
    pickupDate: '2026-09-10',
    returnDate: '2026-09-12',
    totalDays: 2,
    dailyRate: 9800,
    addonsCost: 1000,
    totalCost: 20600,
    status: 'Completed',
    paymentMethod: 'UPI',
    createdAt: '2026-09-09T11:15:00.000Z'
  }
];

// Seed Sample Maintenance Records
const DEFAULT_MAINTENANCE = [
  {
    id: 'MNT-101',
    carId: 'CAR-107',
    carName: 'Audi RS6 Avant',
    serviceType: 'Brake Disc & Fluid Inspection',
    serviceCenter: 'Audi Sport Authorized Tech Lab',
    startDate: '2026-09-20',
    estimatedCompletion: '2026-09-26',
    cost: 18500,
    status: 'In Progress'
  }
];

// Storage Engine
window.ApexDB = {
  // Initialize Database with Defaults if empty
  init: function () {
    if (!localStorage.getItem(STORAGE_KEYS.CARS)) {
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(DEFAULT_CARS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(DEFAULT_MAINTENANCE));
    }
  },

  // CARS CRUD
  getCars: function () {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CARS)) || [];
  },

  getCarById: function (id) {
    const cars = this.getCars();
    return cars.find(c => c.id === id) || null;
  },

  saveCar: function (carData) {
    const cars = this.getCars();
    if (carData.id) {
      const idx = cars.findIndex(c => c.id === carData.id);
      if (idx !== -1) {
        cars[idx] = { ...cars[idx], ...carData };
      }
    } else {
      carData.id = 'CAR-' + Math.floor(100 + Math.random() * 900);
      carData.status = carData.status || 'Available';
      carData.rating = carData.rating || 5.0;
      carData.reviewsCount = carData.reviewsCount || 1;
      cars.unshift(carData);
    }
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
    return carData;
  },

  updateCarStatus: function (carId, newStatus) {
    const cars = this.getCars();
    const car = cars.find(c => c.id === carId);
    if (car) {
      car.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
    }
  },

  deleteCar: function (id) {
    let cars = this.getCars();
    cars = cars.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
  },

  // USERS CRUD
  getUsers: function () {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  },

  getUserByEmail: function (email) {
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  saveUser: function (userData) {
    const users = this.getUsers();
    userData.id = 'USR-' + Date.now().toString().slice(-4);
    userData.createdAt = new Date().toISOString();
    users.push(userData);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    return userData;
  },

  // BOOKINGS CRUD
  getBookings: function () {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS)) || [];
  },

  getUserBookings: function (userEmail) {
    const bookings = this.getBookings();
    if (!userEmail) return [];
    return bookings.filter(b => b.userEmail.toLowerCase() === userEmail.toLowerCase());
  },

  createBooking: function (bookingData) {
    const bookings = this.getBookings();
    bookingData.id = 'BK-' + Math.floor(1000 + Math.random() * 9000);
    bookingData.status = 'Active';
    bookingData.createdAt = new Date().toISOString();
    bookings.unshift(bookingData);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

    // Mark car as Rented
    if (bookingData.carId) {
      this.updateCarStatus(bookingData.carId, 'Rented');
    }

    return bookingData;
  },

  updateBookingStatus: function (id, status) {
    const bookings = this.getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      const oldStatus = booking.status;
      booking.status = status;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));

      // Free up car if cancelled or completed
      if ((status === 'Completed' || status === 'Cancelled') && oldStatus === 'Active') {
        this.updateCarStatus(booking.carId, 'Available');
      }
    }
  },

  // MAINTENANCE CRUD
  getMaintenance: function () {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.MAINTENANCE)) || [];
  },

  addMaintenance: function (record) {
    const records = this.getMaintenance();
    record.id = 'MNT-' + Math.floor(100 + Math.random() * 900);
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(records));
    if (record.carId) {
      this.updateCarStatus(record.carId, 'Maintenance');
    }
    return record;
  },

  // System Reset (For demo cleanup during viva review)
  resetToDefault: function () {
    localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(DEFAULT_CARS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(DEFAULT_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify(DEFAULT_MAINTENANCE));
  }
};

// Initialize right away
ApexDB.init();
