require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || 'admin123';

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meal-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Mongoose Schemas
const MealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mode: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner'],
    required: true
  },
  status: {
    type: String,
    enum: ['In', 'Out'],
    required: true
  },
  type: {
    type: String,
    enum: ['Veg', 'Non-Veg'],
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const AdminSchema = new mongoose.Schema({
  passkey: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Meal = mongoose.model('Meal', MealSchema);
const Admin = mongoose.model('Admin', AdminSchema);

// Helper function to determine the correct date for breakfast
const getBreakfastDate = () => {
  const now = new Date();
  const hour = now.getHours();
  
  // Breakfast is always for NEXT DAY if current time is >= 6 AM
  // Breakfast is for SAME DAY if current time is < 6 AM (midnight to 6 AM)
  const targetDate = new Date();
  
  if (hour >= 6) {
    // From 6 AM onwards (including 8 PM), breakfast is for next day
    targetDate.setDate(targetDate.getDate() + 1);
  }
  // For times between midnight and 6 AM, breakfast is for same day
  
  // Set to start of day for consistent grouping
  targetDate.setHours(0, 0, 0, 0);
  return targetDate;
};

// Middleware to verify JWT token
const authenticateAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(400).json({ success: false, message: 'Invalid token.' });
  }
};

// Routes

// Submit meal data
app.post('/api/meals', async (req, res) => {
  try {
    const { name, mode, status, type } = req.body;
    
    // Validation
    if (!name || !mode || !status) {
      return res.status(400).json({
        success: false,
        message: 'Name, mode, and status are required'
      });
    }
    
    if (status === 'In' && !type) {
      return res.status(400).json({
        success: false,
        message: 'Food type is required when status is "In"'
      });
    }
    
    // Set the correct date based on meal type
    let targetDate;
    
    if (mode === 'Breakfast') {
      targetDate = getBreakfastDate();
    } else {
      // For Lunch and Dinner, use current date
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }
    
    const meal = new Meal({
      name: name.trim(),
      date: targetDate,
      mode,
      status,
      type: status === 'In' ? type : null
    });
    
    await meal.save();
    
    res.status(201).json({
      success: true,
      message: 'Meal data submitted successfully',
      data: meal
    });
  } catch (error) {
    console.error('Error submitting meal:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { passkey } = req.body;
    
    if (!passkey) {
      return res.status(400).json({
        success: false,
        message: 'Passkey is required'
      });
    }
    
    if (passkey !== ADMIN_PASSKEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid passkey'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { isAdmin: true, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token
    });
  } catch (error) {
    console.error('Error in admin login:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all meals for admin (protected route)
app.get('/api/admin/meals', authenticateAdmin, async (req, res) => {
  try {
    const meals = await Meal.find()
      .sort({ date: -1, timestamp: -1 })
      .lean();
    
    res.json({
      success: true,
      data: meals
    });
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get meals grouped by date
app.get('/api/admin/meals/grouped', authenticateAdmin, async (req, res) => {
  try {
    const groupedMeals = await Meal.aggregate([
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            mode: "$mode"
          },
          totalIn: {
            $sum: { $cond: [{ $eq: ["$status", "In"] }, 1, 0] }
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ["$status", "Out"] }, 1, 0] }
          },
          vegCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$status", "In"] }, { $eq: ["$type", "Veg"] }] }, 1, 0] }
          },
          nonVegCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$status", "In"] }, { $eq: ["$type", "Non-Veg"] }] }, 1, 0] }
          },
          meals: { $push: "$$ROOT" }
        }
      },
      {
        $sort: { "_id.date": -1, "_id.mode": 1 }
      }
    ]);
    
    res.json({
      success: true,
      data: groupedMeals
    });
  } catch (error) {
    console.error('Error fetching grouped meals:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get summary statistics
app.get('/api/admin/summary/:date', authenticateAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const summary = await Meal.aggregate([
      {
        $match: {
          date: {
            $gte: targetDate,
            $lt: nextDay
          }
        }
      },
      {
        $group: {
          _id: "$mode",
          totalIn: {
            $sum: { $cond: [{ $eq: ["$status", "In"] }, 1, 0] }
          },
          totalOut: {
            $sum: { $cond: [{ $eq: ["$status", "Out"] }, 1, 0] }
          },
          vegCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$status", "In"] }, { $eq: ["$type", "Veg"] }] }, 1, 0] }
          },
          nonVegCount: {
            $sum: { $cond: [{ $and: [{ $eq: ["$status", "In"] }, { $eq: ["$type", "Non-Veg"] }] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Excel export with breakfast support
app.get('/api/admin/export-excel', async (req, res) => {
  try {
    const { date } = req.query; // format: YYYY-MM-DD

    if (!date) {
      return res.status(400).send('Date is required');
    }

    // Start and end time for that day
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    // Get only "in" meals for that date
    const meals = await Meal.find({
      date: { $gte: start, $lt: end },
      status: 'In' // exclude out
    }).sort({ mode: 1, name: 1 }); // Sort by meal type, then name

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Meals Data');

    worksheet.addRow(['Name', 'Date', 'Mode', 'Preference']);

    meals.forEach(meal => {
      worksheet.addRow([
        meal.name,
        meal.date ? meal.date.toISOString().split('T')[0] : '',
        meal.mode,
        meal.type 
      ]);
    });

    // Send Excel file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=meals_${date}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating Excel');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Admin passkey: ${ADMIN_PASSKEY}`);
});