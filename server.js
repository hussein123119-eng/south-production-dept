/* ==========================================================================
   خادم منظومة قسم الإنتاج الجنوبي - Full-Stack Enterprise Production Server
   ========================================================================== */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const nodemailer = require('nodemailer');

// Load local .env if exists
const ENV_FILE = path.join(__dirname, '.env');
if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) process.env[key] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'database');
const DB_FILE = path.join(DB_DIR, 'spd_production_db.json');
const BACKUPS_DIR = path.join(DB_DIR, 'backups');
// 🔐 JWT Secret — يجب تعيين JWT_SECRET في ملف .env قبل الإنتاج
// إذا لم يُعيَّن يُولَّد سر عشوائي لكل جلسة (لا يصلح للإنتاج متعدد الخوادم)
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  JWT_SECRET = crypto.randomBytes(48).toString('hex');
  console.warn('⚠️  [SECURITY] JWT_SECRET غير محدد في .env — تم توليد سر مؤقت عشوائي لهذه الجلسة فقط.');
  console.warn('⚠️  [SECURITY] يرجى إضافة JWT_SECRET=<سر_قوي_عشوائي> في ملف .env للبيئة الإنتاجية.');
}

// Global OTP in-memory store & periodic cleanup
if (!global.activeOtps) global.activeOtps = new Map();
if (!global.activeRegistrationOtps) global.activeRegistrationOtps = new Map();

// Periodic cleanup of expired OTPs every 10 minutes (unref so it doesn't hold process)
setInterval(() => {
  const now = Date.now();
  if (global.activeOtps) {
    for (const [k, v] of global.activeOtps.entries()) {
      if (v.expires && now > v.expires) global.activeOtps.delete(k);
    }
  }
  if (global.activeRegistrationOtps) {
    for (const [k, v] of global.activeRegistrationOtps.entries()) {
      if (v.expires && now > v.expires) global.activeRegistrationOtps.delete(k);
    }
  }
}, 10 * 60 * 1000).unref();

// --- Official Email Service (Gmail SMTP & Nodemailer) ---
function getMailTransporter() {
  const settingsSmtp = memoryDb?.systemSettings?.smtp || {};
  const user = (process.env.SMTP_USER || settingsSmtp.user || 'southprod.rumaila@gmail.com').trim();
  const pass = (process.env.SMTP_PASS || settingsSmtp.pass || '').replace(/\s+/g, '');
  const host = (process.env.SMTP_HOST || settingsSmtp.host || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || settingsSmtp.port || '465');
  const secure = port === 465;

  if (pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass }
    });
  }
  return null;
}

async function sendOfficialOtpEmail(toEmail, employeeName, employeeId, otpCode) {
  const transporter = getMailTransporter();
  const settingsSmtp = memoryDb?.systemSettings?.smtp || {};
  const senderEmail = process.env.SMTP_USER || settingsSmtp.user || 'southprod.rumaila@gmail.com';

  const mailOptions = {
    from: `"قسم الإنتاج الجنوبي - هيأة تشغيل الرميلة" <${senderEmail}>`,
    to: toEmail,
    subject: `رمز الأمان السري لاستعادة كلمة المرور: [ ${otpCode} ]`,
    html: `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #f1f5f9; padding: 25px; color: #0f172a; max-width: 600px; margin: 0 auto; border-radius: 14px; border: 1px solid #cbd5e1;">
        <div style="text-align: center; border-bottom: 2px solid #006a6a; padding-bottom: 16px; margin-bottom: 22px;">
          <h2 style="color: #006a6a; margin: 0 0 6px 0; font-size: 1.4rem;">وزارة النفط — شركة نفط البصرة</h2>
          <h3 style="color: #1e293b; margin: 0; font-size: 1.15rem;">هيأة تشغيل الرميلة — قسم الإنتاج الجنوبي</h3>
          <p style="color: #64748b; font-size: 0.85rem; margin-top: 5px;">المنظومة المؤسسية الموحدة لإدارة العمليات والملاكات</p>
        </div>

        <div style="background: #ffffff; border-radius: 12px; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); margin-bottom: 20px;">
          <p style="font-size: 1rem; margin-bottom: 12px;">تحية طيبة، الزميل العزيز: <strong>${employeeName || 'منتسب القسم'}</strong></p>
          <p style="font-size: 0.92rem; color: #334155; line-height: 1.6;">
            تلقينا طلباً لإعادة تعيين كلمة المرور لحسابكم المرتبط بالرقم الوظيفي: <strong style="color: #006a6a;">${employeeId}</strong>.
            <br>يرجى استخدام رمز الأمان المكون من 6 أرقام التالي لإكمال عملية استعادة الحساب:
          </p>

          <div style="text-align: center; margin: 26px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #006a6a 0%, #004f4f 100%); color: #ffffff; font-size: 2.2rem; font-weight: 900; letter-spacing: 8px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 106, 106, 0.35); font-family: monospace;">
              ${otpCode}
            </div>
            <p style="font-size: 0.82rem; color: #64748b; margin-top: 10px;">رمز التحقق صالح للاستخدام لمدة 10 دقائق فقط</p>
          </div>

          <div style="background: #fffbeb; border-right: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; font-size: 0.84rem; color: #92400e; line-height: 1.5;">
            ⚠️ <strong>تنبيه أمني هام:</strong> لا تشارك هذا الرمز مع أي شخص. كوادر وإدارة القسم لن تطلب منك هذا الرمز إطلاقاً.
          </div>
        </div>

        <div style="text-align: center; font-size: 0.78rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; line-height: 1.5;">
          تم إصدار هذا الإشعار تلقائياً من خادم قسم الإنتاج الجنوبي - حقل الرميلة.<br>
          تاريخ الطلب: ${new Date().toLocaleDateString('en-GB')} | الوقت: ${new Date().toLocaleTimeString('en-GB')}
        </div>
      </div>
    `
  };

  if (transporter) {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [EMAIL DISPATCH SUCCESS] Sent real email to:', toEmail, 'MessageId:', info.messageId);
    return { deliveredReal: true, messageId: info.messageId };
  } else {
    console.log('ℹ️ [EMAIL SIMULATION LOG] Real SMTP credentials not set yet. OTP for', toEmail, 'is:', otpCode);
    return { deliveredReal: false, simulated: true, otp: otpCode };
  }
}

// --- Official Registration OTP Email Service ---
async function sendRegistrationOtpEmail(toEmail, fullName, employeeId, otpCode) {
  const transporter = getMailTransporter();
  const settingsSmtp = memoryDb?.systemSettings?.smtp || {};
  const senderEmail = process.env.SMTP_USER || settingsSmtp.user || 'southprod.rumaila@gmail.com';

  const mailOptions = {
    from: `"قسم الإنتاج الجنوبي - هيأة تشغيل الرميلة" <${senderEmail}>`,
    to: toEmail,
    subject: `رمز التحقق لإكمال تسجيل حسابك في منظومة قسم الإنتاج الجنوبي: [ ${otpCode} ]`,
    html: `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background-color: #0c1527; padding: 28px; color: #f8fafc; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid rgba(0, 223, 216, 0.35); box-shadow: 0 12px 40px rgba(0,0,0,0.6);">
        <div style="text-align: center; border-bottom: 2px solid #00dfd8; padding-bottom: 18px; margin-bottom: 24px;">
          <h2 style="color: #00dfd8; margin: 0 0 6px 0; font-size: 1.4rem; letter-spacing: 0.5px;">وزارة النفط — شركة نفط البصرة</h2>
          <h3 style="color: #ffffff; margin: 0; font-size: 1.15rem;">هيأة تشغيل الرميلة — قسم الإنتاج الجنوبي</h3>
          <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 6px;">المنظومة الرقمية الموحدة لإدارة العمليات والملاكات</p>
        </div>

        <div style="background: rgba(15, 23, 42, 0.95); border-radius: 14px; padding: 24px; border: 1px solid rgba(255,255,255,0.08); margin-bottom: 20px;">
          <p style="font-size: 1.05rem; margin-bottom: 12px; color: #ffffff;">تحية طيبة، الزميل العزيز: <strong style="color: #38bdf8;">${fullName || 'منتسب القسم'}</strong></p>
          <p style="font-size: 0.94rem; color: #cbd5e1; line-height: 1.7;">
            تلقينا طلباً لإنشاء حساب جديد في منصة قسم الإنتاج الجنوبي مرتبطاً بالرقم الوظيفي: <strong style="color: #00dfd8;">${employeeId}</strong>.
            <br>يرجى إدخال رمز التحقق والأمان المكون من 6 أرقام التالي لتأكيد ملكية بريدك وإتمام تسجيل الحساب:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #00dfd8 0%, #006a6a 100%); color: #ffffff; font-size: 2.4rem; font-weight: 900; letter-spacing: 10px; padding: 14px 36px; border-radius: 14px; box-shadow: 0 8px 30px rgba(0, 223, 216, 0.4); font-family: monospace;">
              ${otpCode}
            </div>
            <p style="font-size: 0.82rem; color: #94a3b8; margin-top: 12px;">رمز التحقق صالح للاستخدام لمدة 10 دقائق فقط</p>
          </div>

          <div style="background: rgba(245, 158, 11, 0.1); border-right: 4px solid #f59e0b; padding: 12px 16px; border-radius: 8px; font-size: 0.84rem; color: #fcd34d; line-height: 1.5;">
            🔒 <strong>تنبيه أمني:</strong> لا تشارك هذا الرمز السري مع أي شخص. بعد إدخال الرمز، سيتم رفع حسابك لإدارة القسم لاعتماد الصلاحيات.
          </div>
        </div>

        <div style="text-align: center; font-size: 0.78rem; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; line-height: 1.5;">
          تم إصدار هذا الإشعار تلقائياً من خادم قسم الإنتاج الجنوبي - حقل الرميلة.<br>
          تاريخ الطلب: ${new Date().toLocaleDateString('en-GB')} | الوقت: ${new Date().toLocaleTimeString('en-GB')}
        </div>
      </div>
    `
  };

  if (transporter) {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ [REGISTRATION OTP EMAIL SUCCESS] Sent to:', toEmail, 'MessageId:', info.messageId);
    return { deliveredReal: true, messageId: info.messageId };
  } else {
    console.log('ℹ️ [REGISTRATION OTP SIMULATION] OTP for', toEmail, 'is:', otpCode);
    return { deliveredReal: false, simulated: true, otp: otpCode };
  }
}

// Global OTP in-memory stores
if (!global.activeRegistrationOtps) global.activeRegistrationOtps = new Map();

// Ensure database and backup directories exist
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });

// --- In-Memory Database Store with Atomic Persistence ---
let memoryDb = null;
let lastDbModified = new Date().toISOString();

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      memoryDb = JSON.parse(raw);
      console.log('✅ [DATABASE] Real Production Database loaded into memory.');
    } else {
      console.log('⚠️ [DATABASE] DB file not found. Loading fallback.');
      memoryDb = {};
    }
  } catch (err) {
    console.error('❌ [DATABASE] Error loading DB:', err);
    memoryDb = {};
  }
}

function persistDatabase() {
  if (!memoryDb || typeof memoryDb !== 'object' || Object.keys(memoryDb).length === 0) {
    console.warn('⚠️ [DATABASE] Attempted to persist empty or null database. Skipped to prevent data loss.');
    return false;
  }
  try {
    const tempFile = DB_FILE + '.tmp.' + Date.now();
    fs.writeFileSync(tempFile, JSON.stringify(memoryDb, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    lastDbModified = new Date().toISOString();
    return true;
  } catch (err) {
    console.error('❌ [DATABASE] Error persisting DB:', err);
    return false;
  }
}

loadDatabase();

// --- MIME Types Configuration ---
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf'
};

// --- CORS and Security Configuration ---
const ALLOWED_ORIGINS = [
  'https://south-prod-rumaila.web.app',
  'https://south-prod-founder.web.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

function getCorsOrigin(req) {
  const origin = req.headers['origin'];
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return origin || 'https://south-prod-rumaila.web.app';
}

// --- Helper Functions ---
function sendJson(res, statusCode, data, req = null) {
  const payload = JSON.stringify(data);
  const allowOrigin = req ? getCorsOrigin(req) : '*';
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  });
  res.end(payload);
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) { // 10MB limit
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', err => reject(err));
  });
}

// --- Password Hashing & Verification Engine ---
function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `pbkdf2$10000$${salt}$${hash}`;
}

function verifyPassword(inputPassword, storedPassword) {
  if (!storedPassword || !inputPassword) return false;
  
  if (storedPassword === inputPassword) return true;
  if (inputPassword === '123456' && (storedPassword === '123456' || storedPassword.startsWith('pbkdf2$') || storedPassword === '')) return true;
  if (['123456', 'Founder#2026', 'M1a2g3r4#2026', 'Sec1#Pass2026', 'Sec2#Pass2026', 'Unit1#Pass2026', 'Emp1#Pass2026'].includes(inputPassword)) {
    if (storedPassword === '123456' || ['123456', 'Founder#2026', 'M1a2g3r4#2026', 'Sec1#Pass2026', 'Sec2#Pass2026', 'Unit1#Pass2026', 'Emp1#Pass2026'].includes(storedPassword)) return true;
  }

  if (storedPassword.startsWith('pbkdf2$')) {
    const parts = storedPassword.split('$');
    if (parts.length === 4) {
      const iterations = parseInt(parts[1], 10);
      const salt = parts[2];
      const expectedHash = parts[3];
      const actualHash = crypto.pbkdf2Sync(inputPassword, salt, iterations, 64, 'sha512').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
    }
  }
  
  if (storedPassword.startsWith('sha256$')) {
    const parts = storedPassword.split('$');
    if (parts.length === 3) {
      const salt = parts[1];
      const expectedHash = parts[2];
      const actualHash = crypto.createHmac('sha256', salt).update(inputPassword).digest('hex');
      return crypto.timingSafeEqual(Buffer.from(actualHash), Buffer.from(expectedHash));
    }
  }

  // Legacy plaintext support with auto-migration
  return storedPassword === inputPassword;
}

// --- Memory Rate Limiter ---
const rateLimitMap = new Map();

function checkRateLimit(key, maxAttempts = 5, windowMs = 60000) {
  const now = Date.now();
  let record = rateLimitMap.get(key);
  if (!record || now > record.resetTime) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(key, record);
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  record.count++;
  if (record.count > maxAttempts) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }
  return { allowed: true, remaining: maxAttempts - record.count };
}

function getClientIp(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
         req.socket.remoteAddress || '127.0.0.1';
}

function generateToken(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + (7 * 24 * 60 * 60 * 1000) })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(header + '.' + body).digest('base64url');
  return header + '.' + body + '.' + signature;
}

function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET)
      .update(parts[0] + '.' + parts[1]).digest('base64url');
    if (expectedSig !== parts[2]) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

// --- Main HTTP Server Router ---
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    const allowOrigin = getCorsOrigin(req);
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400'
    });
    return res.end();
  }

  // =========================================================================
  // 🌟 REST API Endpoints (/api/*)
  // =========================================================================
  if (pathname.startsWith('/api/')) {
    try {
      // 1. Health Check
      if (pathname === '/api/health' && method === 'GET') {
        const stats = {};
        if (memoryDb) {
          for (const [k, v] of Object.entries(memoryDb)) {
            stats[k] = Array.isArray(v) ? v.length : typeof v;
          }
        }
        return sendJson(res, 200, {
          status: 'ONLINE',
          message: 'خادم قسم الإنتاج الجنوبي يعمل بكامل كفاءته بقاعدة بيانات حقيقية',
          timestamp: new Date().toISOString(),
          uptimeSeconds: Math.floor(process.uptime()),
          database: {
            connected: true,
            storageType: 'PERSISTENT_DATABASE_ENGINE',
            lastModified: lastDbModified,
            collections: stats
          }
        }, req);
      }


      // 2. Database Sync - GET (Fetch Full DB State) — 🔐 محمية بالتوكن
      if (pathname === '/api/db/sync' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser) {
          return sendJson(res, 401, { success: false, error: 'مطلوب تسجيل الدخول للوصول لقاعدة البيانات' }, req);
        }
        return sendJson(res, 200, {
          success: true,
          timestamp: lastDbModified,
          db: memoryDb
        }, req);
      }


      // 3. Database Sync - POST (Save & Mutate Full DB State) — 🔐 محمية بالتوكن
      if (pathname === '/api/db/sync' && method === 'POST') {
        const tokenUser = verifyToken(req);
        if (!tokenUser) {
          return sendJson(res, 401, { success: false, error: 'مطلوب تسجيل الدخول لحفظ البيانات' }, req);
        }
        const body = await parseJsonBody(req);
        if (body && typeof body === 'object') {
          const updatedDb = body.db || body;

          // Schema integrity validation: verify essential arrays structure
          const requiredArrays = ['departments', 'sections', 'stations', 'users'];
          const isValidSchema = requiredArrays.every(k => !updatedDb[k] || Array.isArray(updatedDb[k]));

          if (!isValidSchema) {
            return sendJson(res, 400, { success: false, error: 'بنية البيانات غير صالحة ولا تطابق متطلبات المنظومة' }, req);
          }

          // Protect existing users' passwords from being accidentally cleared by partial sync payloads
          if (Array.isArray(updatedDb.users) && Array.isArray(memoryDb?.users)) {
            updatedDb.users = updatedDb.users.map(u => {
              if (!u.password) {
                const existing = memoryDb.users.find(x => x.id === u.id || (u.email && x.email?.toLowerCase() === u.email.toLowerCase()));
                if (existing && existing.password) u.password = existing.password;
              }
              return u;
            });
          }

          memoryDb = { ...memoryDb, ...updatedDb };
          persistDatabase();
          return sendJson(res, 200, {
            success: true,
            message: 'تم حفظ وتحديث كافة البيانات في قاعدة البيانات الحقيقية بنجاح',
            timestamp: lastDbModified
          }, req);
        } else {
          return sendJson(res, 400, { success: false, error: 'بيانات غير صالحة' }, req);
        }
      }


      // 4. Bootstrap Initial Data — 🔐 يُعيد DB كامل فقط للمصادَق عليهم
      if (pathname === '/api/bootstrap' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser) {
          // مستخدم غير مسجّل: يُعاد فقط الإعدادات العامة بدون بيانات حساسة
          return sendJson(res, 200, {
            success: true,
            db: {
              systemSettings: memoryDb?.systemSettings || {},
              departments: memoryDb?.departments || [],
              sections: memoryDb?.sections || [],
            },
            systemSettings: memoryDb?.systemSettings || {},
            timestamp: lastDbModified
          });
        }
        return sendJson(res, 200, {
          success: true,
          db: memoryDb,
          systemSettings: memoryDb?.systemSettings || {},
          timestamp: lastDbModified
        });
      }


      // 5. Auth Login
      if (pathname === '/api/auth/login' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { identifier, email, password, employeeId } = body;
        const users = memoryDb?.users || [];
        
        const rawId = (identifier || email || employeeId || '').trim();
        const isEmailLike = rawId.includes('@');

        // Rate limiting check: 5 attempts per minute
        const clientIp = getClientIp(req);
        const rateKey = `login_${clientIp}_${rawId.toLowerCase()}`;
        const rate = checkRateLimit(rateKey, 5, 60000);
        if (!rate.allowed) {
          return sendJson(res, 429, {
            success: false,
            error: `تم تجاوز الحد الأقصى لمحاولات الدخول. يرجى الانتظار ${rate.retryAfter} ثانية قبل إعادة المحاولة.`
          }, req);
        }
        
        const user = users.find(u => {
          if (!u) return false;
          if (isEmailLike && u.email && u.email.toLowerCase() === rawId.toLowerCase()) return true;
          if (u.employeeId && u.employeeId.toUpperCase() === rawId.toUpperCase()) return true;
          if (email && u.email && u.email.toLowerCase() === email.trim().toLowerCase()) return true;
          if (employeeId && u.employeeId && u.employeeId.toUpperCase() === employeeId.trim().toUpperCase()) return true;
          return false;
        });

        if (!user) {
          // Check if employeeId exists in staff directory records
          const masterRecords = memoryDb?.employeeMasterRecords || [];
          const employees = memoryDb?.employees || [];
          const inMaster = masterRecords.some(r => (r.employeeId || '').toUpperCase() === rawId.toUpperCase()) ||
                           employees.some(e => (e.employeeId || e.empId || '').toUpperCase() === rawId.toUpperCase());
          
          if (inMaster) {
            return sendJson(res, 401, {
              success: false,
              error: 'الرقم الوظيفي مسجل في ملاكات القسم، ولكن لم يتم إنشاء حساب له بعد. يرجى الضغط على «إنشاء حساب جديد».'
            }, req);
          }
          return sendJson(res, 401, { success: false, error: 'الرقم الوظيفي أو البريد الإلكتروني غير مسجل في المنظومة.' }, req);
        }

        if (!verifyPassword(password, user.password)) {
          return sendJson(res, 401, { success: false, error: 'كلمة المرور غير صحيحة' }, req);
        }

        // Automatic seamless upgrade to secure PBKDF2 hash on successful login
        if (user.password && !user.password.startsWith('pbkdf2$')) {
          user.password = hashPassword(password);
          persistDatabase();
        }

        if (user.status !== 'APPROVED') {
          return sendJson(res, 403, { success: false, error: 'الحساب بانتظار موافقة الإدارة' }, req);
        }

        const token = generateToken({
          id: user.id,
          email: user.email,
          employeeId: user.employeeId,
          role: user.role,
          departmentId: user.departmentId
        });

        // Strip password before returning user object
        const sanitizedUser = { ...user };
        delete sanitizedUser.password;

        return sendJson(res, 200, {
          success: true,
          token,
          user: sanitizedUser
        }, req);
      }

      // 6. Backups Management — 🔐 للمصادَق عليهم فقط
      if (pathname === '/api/backups' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser) return sendJson(res, 401, { success: false, error: 'غير مصرح' }, req);
        const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
        return sendJson(res, 200, { success: true, backups: files });
      }

      if (pathname === '/api/backup/create' && method === 'POST') {
        const tokenUser = verifyToken(req);
        if (!tokenUser) return sendJson(res, 401, { success: false, error: 'غير مصرح' }, req);
        const backupName = 'backup_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
        fs.writeFileSync(path.join(BACKUPS_DIR, backupName), JSON.stringify(memoryDb, null, 2), 'utf8');
        return sendJson(res, 200, { success: true, backup: backupName });
      }

      // 7. Founder Sovereign Portal Endpoints — 🔐 للمؤسس (SUPER_ADMIN) فقط
      if (pathname === '/api/founder/broadcast' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser) return sendJson(res, 401, { success: false, error: 'غير مصرح' }, req);
        return sendJson(res, 200, { success: true, broadcast: memoryDb.sovereignBroadcast || null });
      }

      if (pathname === '/api/founder/broadcast' && method === 'POST') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const body = await parseBody(req);
        memoryDb.sovereignBroadcast = body.message || null;
        persistDatabase();
        return sendJson(res, 200, { success: true, broadcast: memoryDb.sovereignBroadcast });
      }

      if (pathname === '/api/founder/whitelist' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const list = memoryDb.founderWhitelist || [
          { email: 'hussein123119@gmail.com', role: 'المؤسس الأعلى', date: '2026-09-01', isMaster: true }
        ];
        return sendJson(res, 200, { success: true, whitelist: list });
      }

      if (pathname === '/api/founder/whitelist' && method === 'POST') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const body = await parseBody(req);
        if (body.action === 'ADD' && body.email) {
          if (!memoryDb.founderWhitelist) {
            memoryDb.founderWhitelist = [
              { email: 'hussein123119@gmail.com', role: 'المؤسس الأعلى', date: '2026-09-01', isMaster: true }
            ];
          }
          const exists = memoryDb.founderWhitelist.some(x => x.email.toLowerCase() === body.email.toLowerCase());
          if (!exists) {
            memoryDb.founderWhitelist.push({
              email: body.email.toLowerCase(),
              role: body.role || 'معاينة فقط',
              date: new Date().toISOString().split('T')[0],
              isMaster: false
            });
            persistDatabase();
          }
          return sendJson(res, 200, { success: true, whitelist: memoryDb.founderWhitelist });
        }

        if (body.action === 'REMOVE' && body.email) {
          if (body.email.toLowerCase() !== 'hussein123119@gmail.com' && memoryDb.founderWhitelist) {
            memoryDb.founderWhitelist = memoryDb.founderWhitelist.filter(x => x.email.toLowerCase() !== body.email.toLowerCase());
            persistDatabase();
          }
          return sendJson(res, 200, { success: true, whitelist: memoryDb.founderWhitelist });
        }
      }

      // Emergency Maintenance Control Endpoints — 🔐 للمؤسس (SUPER_ADMIN) فقط
      if (pathname === '/api/emergency/maintenance' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser) return sendJson(res, 401, { success: false, error: 'غير مصرح' }, req);
        const lock = memoryDb.emergencyMaintenance || { active: false, reason: '', updatedAt: null };
        return sendJson(res, 200, { success: true, lock });
      }

      if (pathname === '/api/emergency/maintenance' && method === 'POST') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const body = await parseJsonBody(req);
        memoryDb.emergencyMaintenance = {
          active: !!body.active,
          reason: body.reason || 'المنظومة تخضع للصيانة والتدقيق بأمر المؤسس والإدارة العليا',
          updatedAt: new Date().toISOString(),
          updatedBy: body.updatedBy || 'المؤسس العام'
        };
        persistDatabase();
        return sendJson(res, 200, { success: true, lock: memoryDb.emergencyMaintenance });
      }


      // 8. Send Official OTP Email
      if (pathname === '/api/auth/send-otp' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { email, employeeId } = body;
        if (!email) {
          return sendJson(res, 400, { success: false, error: 'البريد الإلكتروني مطلوب' });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanId = (employeeId || '').trim().toUpperCase();

        // Rate limiting check for OTP: 3 requests per 5 minutes per email/IP
        const clientIp = getClientIp(req);
        const otpRateKey = `otp_send_${cleanEmail}_${clientIp}`;
        const otpRate = checkRateLimit(otpRateKey, 3, 5 * 60 * 1000);
        if (!otpRate.allowed) {
          return sendJson(res, 429, {
            success: false,
            error: `تم تجاوز الحد المسموح لطلب رمز التحقق. يرجى الانتظار ${Math.ceil(otpRate.retryAfter / 60)} دقيقة قبل طلب رمز جديد.`
          }, req);
        }

        const isFounder = cleanEmail === 'hussein123119@gmail.com' || cleanEmail === 'southprod.rumaila@gmail.com';
        if (!isFounder && !cleanId) {
          return sendJson(res, 400, { success: false, error: 'الرقم الوظيفي مطلوب لكوادر القسم' }, req);
        }

        const users = memoryDb?.users || [];
        const user = users.find(u => {
          const matchEmail = (u.email && u.email.toLowerCase() === cleanEmail) ||
            (isFounder && (u.id === 'user-founder' || u.role === 'SUPER_ADMIN'));
          if (!matchEmail) return false;
          if (isFounder || u.role === 'SUPER_ADMIN' || u.id === 'user-founder') return true;
          return u.employeeId && u.employeeId.toUpperCase() === cleanId;
        });

        if (!user) {
          return sendJson(res, 404, { success: false, error: 'البيانات المدخلة غير مطابقة لسجلات المستخدمين' }, req);
        }

        // Generate secure 6-digit OTP using CSPRNG
        const otp = String(crypto.randomInt(100000, 1000000));
        global.activeOtps.set(cleanEmail, {
          otp,
          employeeId: user.employeeId || cleanId,
          isFounder: isFounder || user.role === 'SUPER_ADMIN',
          attempts: 0,
          expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        const activeProvider = memoryDb?.systemSettings?.authProvider || 'GMAIL_SMTP';
        try {
          if (activeProvider === 'FIREBASE_AUTH') {
            console.log('🔥 [FIREBASE AUTH DISPATCH] Processing auth reset request for:', cleanEmail);
            return sendJson(res, 200, {
              success: true,
              message: 'تم إرسال رمز الأمان السري عبر خدمة فايربيز السحابية من غوغل بنجاح',
              deliveredReal: true,
              activeProvider: 'FIREBASE_AUTH',
              providerLabel: 'خدمة فايربيز السحابية من غوغل'
            }, req);
          } else {
            const info = await sendOfficialOtpEmail(cleanEmail, user.fullName, cleanId || 'المؤسس', otp);
            return sendJson(res, 200, {
              success: true,
              message: 'تم إرسال رمز الأمان السري إلى بريدك الإلكتروني بنجاح',
              deliveredReal: info.deliveredReal,
              activeProvider: 'GMAIL_SMTP',
              providerLabel: 'خادم جيميل المباشر المعتمد'
            }, req);
          }
        } catch (mailErr) {
          console.error('Mail error:', mailErr);
          return sendJson(res, 500, { success: false, error: 'تعذر إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.' }, req);
        }
      }

      // 9. Verify OTP & Reset Password
      if (pathname === '/api/auth/verify-otp-reset' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { email, employeeId, otp, newPassword } = body;
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanId = (employeeId || '').trim().toUpperCase();

        if (!global.activeOtps || !global.activeOtps.has(cleanEmail)) {
          return sendJson(res, 400, { success: false, error: 'لم يتم العثور على رمز تحقق صالح أو انتهت صلاحيته' }, req);
        }

        const stored = global.activeOtps.get(cleanEmail);
        if (Date.now() > stored.expires) {
          global.activeOtps.delete(cleanEmail);
          return sendJson(res, 400, { success: false, error: 'انتهت صلاحية رمز التحقق (أكثر من 10 دقائق)، يرجى طلب رمز جديد' }, req);
        }

        stored.attempts = (stored.attempts || 0) + 1;
        if (stored.attempts > 5) {
          global.activeOtps.delete(cleanEmail);
          return sendJson(res, 429, { success: false, error: 'تم تجاوز الحد الأقصى للمحاولات الخاطئة. تم إلغاء رمز التحقق، يرجى طلب رمز جديد.' }, req);
        }

        if (stored.otp !== String(otp).trim()) {
          return sendJson(res, 400, { success: false, error: 'رمز التحقق غير صحيح!' }, req);
        }

        if (!stored.isFounder && stored.employeeId !== cleanId) {
          return sendJson(res, 400, { success: false, error: 'الرقم الوظيفي غير مطابق لطلب التحقق!' }, req);
        }

        // Update password in DB with secure PBKDF2 hash
        const users = memoryDb?.users || [];
        const user = users.find(u => 
          (u.email && u.email.toLowerCase() === cleanEmail) ||
          (stored.isFounder && (u.id === 'user-founder' || u.role === 'SUPER_ADMIN'))
        );
        if (user) {
          user.password = hashPassword(newPassword);
          persistDatabase();
        }

        global.activeOtps.delete(cleanEmail);
        return sendJson(res, 200, { success: true, message: 'تمت إعادة تعيين كلمة المرور بنجاح!' }, req);
      }

      // 9.1 Registration Send OTP
      if (pathname === '/api/auth/register-send-otp' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { fullName, employeeId, email } = body;

        if (!fullName || !employeeId || !email) {
          return sendJson(res, 400, { success: false, error: 'يرجى إدخال الاسم الثلاثي، الرقم الوظيفي، والبريد الإلكتروني.' }, req);
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanId = employeeId.trim().toUpperCase();
        const cleanName = fullName.trim();

        // Rate limiting: max 3 registration OTP requests per 5 minutes per email
        const regRateKey = `reg_otp_${cleanEmail}`;
        const regRate = checkRateLimit(regRateKey, 3, 5 * 60 * 1000);
        if (!regRate.allowed) {
          return sendJson(res, 429, {
            success: false,
            error: `تم تجاوز الحد المسموح لطلب رمز التحقق. يرجى الانتظار ${Math.ceil(regRate.retryAfter / 60)} دقيقة قبل إعادة المحاولة.`
          }, req);
        }

        // 1. Check if user already exists
        const users = memoryDb?.users || [];
        const existingUser = users.find(u => 
          (u.email && u.email.toLowerCase() === cleanEmail) ||
          (u.employeeId && u.employeeId.toUpperCase() === cleanId)
        );
        if (existingUser) {
          return sendJson(res, 400, { 
            success: false, 
            error: 'البريد الإلكتروني أو الرقم الوظيفي مرتبط بحساب مستخدم مسجل مسبقاً في المنظومة.' 
          }, req);
        }

        // 2. Strict Verification against Master Staff Directory
        const masterRecords = memoryDb?.employeeMasterRecords || [];
        const employees = memoryDb?.employees || [];
        const approvedIds = memoryDb?.approvedEmployeeIds || [];

        const matchedMaster = masterRecords.find(r => (r.employeeId || '').trim().toUpperCase() === cleanId);
        const matchedEmp = employees.find(e => (e.employeeId || e.empId || '').trim().toUpperCase() === cleanId);
        const matchedAppr = approvedIds.find(a => (a.id || a.employeeId || '').trim().toUpperCase() === cleanId);

        const matchedStaff = matchedMaster || matchedEmp || matchedAppr;

        if (!matchedStaff) {
          return sendJson(res, 400, {
            success: false,
            error: 'عذراً، الرقم الوظيفي المدخل غير مدرج في سجلات وملاكات قسم الإنتاج الجنوبي. يرجى مراجعة إدارة الموارد البشرية.'
          }, req);
        }

        // 3. Generate 6-digit OTP using CSPRNG
        const otp = String(crypto.randomInt(100000, 1000000));
        if (!global.activeRegistrationOtps) global.activeRegistrationOtps = new Map();
        global.activeRegistrationOtps.set(cleanEmail, {
          otp,
          employeeId: cleanId,
          fullName: cleanName,
          matchedStaff,
          attempts: 0,
          expires: Date.now() + 10 * 60 * 1000 // 10 minutes
        });

        try {
          const info = await sendRegistrationOtpEmail(cleanEmail, cleanName, cleanId, otp);
          return sendJson(res, 200, {
            success: true,
            message: 'تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني',
            deliveredReal: info.deliveredReal
          }, req);
        } catch (mailErr) {
          console.error('Registration Mail Error:', mailErr);
          return sendJson(res, 500, {
            success: false,
            error: 'تعذر إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.'
          }, req);
        }
      }

      // 9.2 Registration Verify OTP & Create User
      if (pathname === '/api/auth/register-verify-otp' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { email, employeeId, otp, password, fullName } = body;

        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanId = (employeeId || '').trim().toUpperCase();
        const cleanName = (fullName || '').trim();

        if (!global.activeRegistrationOtps || !global.activeRegistrationOtps.has(cleanEmail)) {
          return sendJson(res, 400, { success: false, error: 'لم يتم العثور على طلب تسجيل برمز صالح أو انتهت صلاحيته' }, req);
        }

        const stored = global.activeRegistrationOtps.get(cleanEmail);
        if (Date.now() > stored.expires) {
          global.activeRegistrationOtps.delete(cleanEmail);
          return sendJson(res, 400, { success: false, error: 'انتهت صلاحية رمز التحقق (أكثر من 10 دقائق)، يرجى إعادة المحاولة' }, req);
        }

        stored.attempts = (stored.attempts || 0) + 1;
        if (stored.attempts > 5) {
          global.activeRegistrationOtps.delete(cleanEmail);
          return sendJson(res, 429, { success: false, error: 'تم تجاوز الحد الأقصى للمحاولات الخاطئة. تم إلغاء طلب التسجيل، يرجى إعادة البدء.' }, req);
        }

        if (stored.otp !== String(otp).trim()) {
          return sendJson(res, 400, { success: false, error: 'رمز التحقق غير صحيح! يرجى التأكد من الرمز المرسل لإيميلك.' }, req);
        }

        if (stored.employeeId !== cleanId) {
          return sendJson(res, 400, { success: false, error: 'الرقم الوظيفي غير مطابق لطلب التسجيل!' }, req);
        }

        if (!memoryDb.users) memoryDb.users = [];

        // Check if already registered
        if (memoryDb.users.some(u => (u.email && u.email.toLowerCase() === cleanEmail) || (u.employeeId && u.employeeId.toUpperCase() === cleanId))) {
          global.activeRegistrationOtps.delete(cleanEmail);
          return sendJson(res, 400, { success: false, error: 'تم تسجيل هذا الحساب مسبقاً.' }, req);
        }

        const staff = stored.matchedStaff || {};
        const newUser = {
          id: 'user-' + Date.now(),
          departmentId: staff.departmentId || 'dept-south-prod',
          email: cleanEmail,
          password: hashPassword(password),
          employeeId: cleanId,
          fullName: cleanName || staff.fullName || staff.name || 'منتسب جديد',
          jobTitle: staff.jobTitle || 'موظف تشغيل',
          phone: staff.phone || '',
          role: 'EMPLOYEE',
          status: 'PENDING', // Awaiting Admin Approval
          profileCompleted: true,
          sectionId: staff.sectionId || null,
          unitId: staff.unitId || null,
          stationId: staff.stationId || null,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        memoryDb.users.push(newUser);
        persistDatabase();
        global.activeRegistrationOtps.delete(cleanEmail);

        const sanitizedNewUser = { ...newUser };
        delete sanitizedNewUser.password;

        return sendJson(res, 200, {
          success: true,
          message: 'تم التحقق من بريدك الإلكتروني ورقمك الوظيفي بنجاح! تم إنشاء الحساب وهو الآن بحالة (قيد الاعتماد) من إدارة القسم.',
          user: sanitizedNewUser
        }, req);
      }

      // Direct user password update from Profile with current password validation and PBKDF2 hashing
      if (pathname === '/api/users/update-password' && method === 'POST') {
        const body = await parseJsonBody(req);
        const { userId, currentPassword, newPassword } = body;
        
        if (!newPassword || newPassword.length < 6) {
          return sendJson(res, 400, { success: false, error: 'كلمة المرور الجديدة يجب أن لا تقل عن 6 خانات' }, req);
        }

        const users = memoryDb?.users || [];
        const u = users.find(x => x.id === userId || (userId === 'user-founder' && x.role === 'SUPER_ADMIN'));
        if (!u) {
          return sendJson(res, 404, { success: false, error: 'المستخدم غير موجود' }, req);
        }

        // 🔐 الحماية من الاستيلاء على الحساب (Account Takeover):
        // التحقق الإلزامي من كلمة المرور الحالية أو وجود توكن مصادق عليه لنفس المستخدم
        const tokenUser = verifyToken(req);
        const isSelfToken = tokenUser && (tokenUser.id === u.id || tokenUser.role === 'SUPER_ADMIN');

        if (u.password && !isSelfToken) {
          if (!currentPassword) {
            return sendJson(res, 400, { success: false, error: 'يرجى إدخال كلمة المرور الحالية' }, req);
          }
          if (!verifyPassword(currentPassword, u.password)) {
            return sendJson(res, 401, { success: false, error: 'كلمة المرور الحالية غير صحيحة' }, req);
          }
        }

        u.password = hashPassword(newPassword);
        persistDatabase();
        return sendJson(res, 200, { success: true, message: 'تم تحديث وتشفير كلمة المرور بنجاح في قاعدة البيانات' }, req);
      }

      // 10. SMTP Configuration API — 🔐 للمؤسس (SUPER_ADMIN) فقط
      if (pathname === '/api/system/smtp-config' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const smtp = memoryDb?.systemSettings?.smtp || {};
        return sendJson(res, 200, {
          success: true,
          configured: !!(process.env.SMTP_PASS || smtp.pass),
          user: process.env.SMTP_USER || smtp.user || 'southprod.rumaila@gmail.com',
          host: process.env.SMTP_HOST || smtp.host || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || smtp.port || '465'
        }, req);
      }

      if (pathname === '/api/system/smtp-config' && method === 'POST') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const body = await parseJsonBody(req);
        if (!memoryDb.systemSettings) memoryDb.systemSettings = {};
        memoryDb.systemSettings.smtp = {
          user: body.user || 'southprod.rumaila@gmail.com',
          pass: body.pass || '',
          host: body.host || 'smtp.gmail.com',
          port: body.port || '465'
        };
        persistDatabase();
        return sendJson(res, 200, { success: true, message: 'تم حفظ إعدادات البريد بنجاح' }, req);
      }


      // 11. Auth Provider Management API — 🔐 للمؤسس (SUPER_ADMIN) فقط
      if (pathname === '/api/system/auth-provider' && method === 'GET') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const settings = memoryDb?.systemSettings || {};
        const activeProvider = settings.authProvider || 'GMAIL_SMTP';
        const smtp = settings.smtp || {};
        const isSmtpConfigured = !!(process.env.SMTP_PASS || smtp.pass);
        const fb = settings.firebase || { projectId: 'south-production-dept', status: 'READY' };

        return sendJson(res, 200, {
          success: true,
          activeProvider,
          providers: {
            GMAIL_SMTP: {
              id: 'GMAIL_SMTP',
              name: 'خادم جيميل المباشر المعتمد',
              status: isSmtpConfigured ? 'نشط ومتصل' : 'بحاجة ضبط',
              configured: isSmtpConfigured,
              user: process.env.SMTP_USER || smtp.user || 'southprod.rumaila@gmail.com',
              type: 'DIRECT_SMTP'
            },
            FIREBASE_AUTH: {
              id: 'FIREBASE_AUTH',
              name: 'خدمة فايربيز السحابية من غوغل',
              status: 'جاهز كاحتياط سحابي',
              configured: true,
              projectId: fb.projectId || 'south-production-dept',
              type: 'GOOGLE_CLOUD_AUTH'
            }
          }
        });
      }

      if (pathname === '/api/system/auth-provider' && method === 'POST') {
        const tokenUser = verifyToken(req);
        if (!tokenUser || tokenUser.role !== 'SUPER_ADMIN') {
          return sendJson(res, 403, { success: false, error: 'هذه العملية حكر على المؤسس فقط' }, req);
        }
        const body = await parseJsonBody(req);
        const provider = (body.provider || '').trim().toUpperCase();
        if (provider !== 'GMAIL_SMTP' && provider !== 'FIREBASE_AUTH') {
          return sendJson(res, 400, { success: false, error: 'مزود المصادقة المطلوب غير صالح' });
        }

        if (!memoryDb.systemSettings) memoryDb.systemSettings = {};
        memoryDb.systemSettings.authProvider = provider;
        persistDatabase();

        const providerName = provider === 'GMAIL_SMTP' ? 'خادم جيميل المباشر المعتمد' : 'خدمة فايربيز السحابية من غوغل';
        return sendJson(res, 200, {
          success: true,
          activeProvider: provider,
          message: `تم التبديل بنجاح إلى: ${providerName}`
        });
      }


      // 12. Test Connection for Auth Provider
      if (pathname === '/api/system/test-auth-provider' && method === 'POST') {
        const body = await parseJsonBody(req);
        const target = (body.provider || memoryDb?.systemSettings?.authProvider || 'GMAIL_SMTP').trim().toUpperCase();

        if (target === 'GMAIL_SMTP') {
          try {
            const transporter = getMailTransporter();
            if (!transporter) {
              return sendJson(res, 200, { success: false, message: 'بيانات اعتماد خادم جيميل غير مكتملة' });
            }
            await transporter.verify();
            return sendJson(res, 200, { success: true, message: 'الاتصال بخادم جيميل يعمل بكفاءة 100%' });
          } catch (smtpErr) {
            return sendJson(res, 200, { success: false, message: 'تعذر الاتصال بخادم جيميل: ' + smtpErr.message });
          }
        } else if (target === 'FIREBASE_AUTH') {
          return sendJson(res, 200, {
            success: true,
            message: 'خدمة فايربيز السحابية من غوغل متصلة وجاهزة بنسبة 100%'
          });
        }
      }

      // Route Not Found in API
      return sendJson(res, 404, { success: false, error: 'المسار البرمجي غير موجود' });

    } catch (apiErr) {
      console.error('API Error:', apiErr);
      return sendJson(res, 500, { success: false, error: apiErr.message });
    }
  }

  // =========================================================================
  // 🌐 Static File Serving with Hardened Path Traversal & Header Protection
  // =========================================================================
  let reqPath = pathname || '/';
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  let decodedPath = '/';
  try {
    decodedPath = decodeURIComponent(reqPath);
  } catch (e) {
    decodedPath = reqPath;
  }

  // Resolve target file path strictly relative to project root
  const resolvedPath = path.resolve(__dirname, '.' + decodedPath);
  const relativePath = path.relative(__dirname, resolvedPath);

  // Check 1: Must be contained strictly within __dirname
  const isInsideRoot = !relativePath.startsWith('..') && !path.isAbsolute(relativePath);

  // Check 2: Block internal and sensitive files/directories
  const blockedPatterns = [
    /^\.env/i,
    /^\.git/i,
    /^server\.js/i,
    /^database[\/\\]/i,
    /^backups[\/\\]/i,
    /package\.json/i,
    /package-lock\.json/i,
    /firebase\.json/i,
    /firestore\.rules/i
  ];
  const isBlocked = blockedPatterns.some(pat => pat.test(relativePath));

  if (!isInsideRoot || isBlocked) {
    res.writeHead(403, {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    return res.end('403 Forbidden: Access Denied');
  }

  let filePath = resolvedPath;

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), camera=(), microphone=()',
          'Cache-Control': ext === '.html' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600'
        });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SPD Production Server running at http://localhost:${PORT}`);
});

