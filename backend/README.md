# 🚀 دليل تشغيل خادم الباكند (Backend Setup Guide)

## 📌 المتطلبات
- **Node.js** (الإصدار 18 أو أحدث)
- **قاعدة بيانات PostgreSQL** (محلية أو سحابية مجانية عبر [Neon.tech](https://neon.tech) أو [Supabase.com](https://supabase.com))

---

## 🛠️ خطوات التشغيل المحلي

### 1. تثبيت الحزم:
```bash
cd backend
npm install
```

### 2. إعداد قاعدة البيانات:
* أنشئ قاعدة بيانات باسم `south_production_db`.
* نفّذ ملف المخطط `schema.sql` داخل قاعدة البيانات لإنشاء كافة الجداول.

### 3. إعداد متغيرات البيئة:
* أنشئ ملف `.env` وانسخ المحتوى من `.env.example` مع تعديل رابط الاتصال `DATABASE_URL`.

### 4. تشغيل السيرفر:
```bash
npm start
```
سيعمل الخادم على: `http://localhost:5000`

---

## ☁️ النشر السحابي المجاني في 5 دقائق

1. **قاعدة البيانات:** أنشئ حساب مجاني في [Neon.tech](https://neon.tech) وانسخ رابط الـ `DATABASE_URL`.
2. **الخادم:** ارفع مجلد `backend` إلى [Render.com](https://render.com) أو [Railway.app](https://railway.app) وضع رابط قاعدة البيانات في الـ Environment Variables.
3. **الواجهة:** انشر الواجهة على [Netlify.com](https://netlify.com) أو [Vercel.com](https://vercel.com).
