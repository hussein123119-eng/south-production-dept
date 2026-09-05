const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'spd_super_secret_jwt_key_2024';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/south_production_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'رمز الدخول مطلوب' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'جلسة الدخول منتهية أو غير صالحة' });
    req.user = user;
    next();
  });
};

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', timestamp: new Date().toISOString(), app: 'إدارة قسم الإنتاج الجنوبي API' });
});

// 1. Auth: Login with Triple Check (Email + Password + Employee ID)
app.post('/api/auth/login', async (req, res) => {
  const { email, password, employeeId } = req.body;
  try {
    const userRes = await pool.query(
      'SELECT u.*, a.job_grade, a.job_stage, a.degree, a.specialization FROM users u LEFT JOIN approved_employees a ON u.employee_id = a.employee_id WHERE LOWER(u.email) = LOWER($1) AND UPPER(u.employee_id) = UPPER($2)',
      [email, employeeId]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'البريد الإلكتروني أو الرقم الوظيفي غير مسجل في قاعدة البيانات' });
    }

    const user = userRes.rows[0];
    if (user.status !== 'APPROVED') {
      return res.status(403).json({ error: `الحساب بحالة (${user.status}) ويحتاج موافقة مسؤول الإدارة` });
    }

    const validPass = await bcrypt.compare(password, user.password_hash);
    if (!validPass) {
      return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, departmentId: user.department_id, employeeId: user.employee_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password_hash;
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: 'خطأ في الخادم: ' + err.message });
  }
});

// 2. Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, employeeId, fullName, phone } = req.body;
  try {
    // Check if employee ID is pre-approved in master HR table
    const hrCheck = await pool.query('SELECT * FROM approved_employees WHERE UPPER(employee_id) = UPPER($1)', [employeeId]);
    const isApproved = hrCheck.rows.length > 0;
    const initialStatus = isApproved ? 'APPROVED' : 'PENDING';

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, employee_id, full_name, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, 'EMPLOYEE', $6) RETURNING id, email, employee_id, full_name, role, status`,
      [email, hash, employeeId, fullName, phone, initialStatus]
    );

    res.json({ message: 'تم إنشاء الحساب بنجاح', user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: 'تعذر إنشاء الحساب: ' + err.message });
  }
});

// 3. Sections & Units & Stations
app.get('/api/sections', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM sections ORDER BY name ASC');
  res.json(result.rows);
});

app.get('/api/units', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM units ORDER BY name ASC');
  res.json(result.rows);
});

app.get('/api/stations', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM stations ORDER BY name ASC');
  res.json(result.rows);
});

// 4. Technical Status Reports
app.get('/api/technical-status', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM technical_status_reports ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/technical-status', authenticateToken, async (req, res) => {
  const { id, departmentId, sectionId, stationId, stationName, status, topic, description, ongoingWorks } = req.body;
  const result = await pool.query(
    `INSERT INTO technical_status_reports (id, department_id, section_id, station_id, station_name, status, topic, description, ongoing_works, created_by_name, created_by_employee_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [id, departmentId, sectionId, stationId, stationName, status, topic, description, ongoingWorks, req.user.email, req.user.employeeId]
  );
  res.json(result.rows[0]);
});

// 5. Vehicles & Movements
app.get('/api/vehicles', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM vehicle_movements ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/vehicles', authenticateToken, async (req, res) => {
  const { id, departmentId, sectionId, sideNumber, vehicleType, plateNumber, driverName, destination, purpose, departureTime, expectedReturnTime, operationalState } = req.body;
  const result = await pool.query(
    `INSERT INTO vehicle_movements (id, department_id, section_id, side_number, vehicle_type, plate_number, driver_name, destination, purpose, departure_time, expected_return_time, operational_state)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [id, departmentId, sectionId, sideNumber, vehicleType, plateNumber, driverName, destination, purpose, departureTime, expectedReturnTime, operationalState || 'OPERATIONAL']
  );
  res.json(result.rows[0]);
});

// 6. Documents DMS
app.get('/api/documents', authenticateToken, async (req, res) => {
  const result = await pool.query('SELECT * FROM documents ORDER BY created_at DESC');
  res.json(result.rows);
});

app.post('/api/documents', authenticateToken, async (req, res) => {
  const { id, departmentId, sectionId, title, docNumber, type, content, gridData } = req.body;
  const result = await pool.query(
    `INSERT INTO documents (id, department_id, section_id, title, doc_number, type, content, grid_data, created_by_id, created_by_name)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [id, departmentId, sectionId, title, docNumber, type, content, gridData, req.user.id, req.user.email]
  );
  res.json(result.rows[0]);
});

// 7. Announcements
app.get('/api/announcements', async (req, res) => {
  const result = await pool.query('SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC');
  res.json(result.rows);
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 South Production Dept API Server running on port ${PORT}`);
});
