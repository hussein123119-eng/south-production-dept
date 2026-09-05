const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function buildCss() {
  const css = `/* ==============================================================================
   بوابة المؤسس والقيادة الإدارية السيادية - التصميم الزجاجي الملكي الفاخر
   South Production Department - Sovereign Founder Administrative Command Stylesheet
   النسخة المعتمدة: v84 | المتوافقة 100% مع القاعدة الذهبية
   ============================================================================== */

:root {
  --bg-deep: #070e1c;
  --bg-radial: radial-gradient(circle at 50% 0%, #152744 0%, #0a1424 45%, #050a14 100%);
  --glass-card: rgba(18, 34, 62, 0.75);
  --glass-card-hover: rgba(26, 48, 86, 0.88);
  --glass-inner: rgba(9, 20, 38, 0.7);
  --glass-border: 1.2px solid rgba(56, 189, 248, 0.25);
  --glass-border-subtle: 1px solid rgba(255, 255, 255, 0.1);
  --glass-border-gold: 1.2px solid rgba(245, 158, 11, 0.4);
  --glass-border-emerald: 1.2px solid rgba(16, 185, 129, 0.4);
  
  --gold-primary: #f59e0b;
  --gold-glow: rgba(245, 158, 11, 0.3);
  --emerald-primary: #10b981;
  --emerald-glow: rgba(16, 185, 129, 0.28);
  --cyan-primary: #06b6d4;
  --sky-primary: #38bdf8;
  --rose-primary: #f43f5e;
  
  --text-pure: #ffffff;
  --text-bright: #f8fafc;
  --text-soft: #cbd5e1;
  --text-muted: #94a3b8;
  
  --shadow-crystal: 0 10px 35px 0 rgba(0, 0, 0, 0.45);
  --shadow-gold: 0 0 25px rgba(245, 158, 11, 0.25);
  --font-main: 'Segoe UI', Tahoma, Arial, sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }

body {
  font-family: var(--font-main);
  direction: rtl;
  text-align: right;
  background: var(--bg-deep);
  background-image: var(--bg-radial);
  background-attachment: fixed;
  color: var(--text-bright);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* خلفية حيوية خافتة */
body::before {
  content: '';
  position: fixed;
  top: -20%;
  right: 10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.08) 0%, rgba(16, 185, 129, 0.04) 40%, transparent 70%);
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
}

.founder-wrapper {
  position: relative;
  z-index: 1;
  max-width: 1720px;
  margin: 0 auto;
  padding: 1.2rem 1.8rem 3rem 1.8rem;
}

/* 1. الترويسة السيادية الفخمة */
.founder-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.8rem;
  background: var(--glass-card);
  backdrop-filter: blur(25px) saturate(190%);
  -webkit-backdrop-filter: blur(25px) saturate(190%);
  border: var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--shadow-crystal);
  margin-bottom: 1.4rem;
}

.brand-box {
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.brand-emblem {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #065f46 0%, #0369a1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
}

.brand-text h1 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.3px;
}

.brand-subtitle-line {
  font-size: 0.86rem;
  color: var(--sky-primary);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--emerald-primary);
  box-shadow: 0 0 10px var(--emerald-primary);
  display: inline-block;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.3); }
}

/* شريط أزرار الترويسة في صف واحد */
.header-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.65rem;
  white-space: nowrap;
}

.founder-identity-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(9, 20, 38, 0.8);
  border: var(--glass-border-subtle);
  padding: 0.4rem 0.9rem;
  border-radius: 12px;
  font-size: 0.84rem;
  color: var(--text-soft);
}

.founder-identity-pill strong {
  color: var(--gold-primary);
  direction: ltr;
}

/* الأزرار الزجاجية السيادية الموحدة */
.btn-glass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 38px;
  padding: 0 1.15rem;
  border-radius: 10px;
  font-size: 0.88rem;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: all 0.22s ease;
  border: 1.2px solid rgba(255, 255, 255, 0.15);
  background: rgba(20, 40, 72, 0.7);
  color: #ffffff;
}

.btn-glass:hover {
  background: rgba(30, 60, 108, 0.9);
  border-color: var(--sky-primary);
  transform: translateY(-1px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.35);
}

.btn-glass-gold {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.35) 100%);
  border-color: rgba(245, 158, 11, 0.5);
  color: #fef08a;
}
.btn-glass-gold:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.4) 0%, rgba(217, 119, 6, 0.5) 100%);
  color: #ffffff;
  box-shadow: var(--shadow-gold);
}

.btn-glass-emerald {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.35) 100%);
  border-color: rgba(16, 185, 129, 0.5);
  color: #a7f3d0;
}
.btn-glass-emerald:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.5) 100%);
  color: #ffffff;
}

.btn-glass-cyan {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 116, 144, 0.35) 100%);
  border-color: rgba(6, 182, 212, 0.5);
  color: #a5f3fc;
}
.btn-glass-cyan:hover {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.4) 0%, rgba(14, 116, 144, 0.5) 100%);
  color: #ffffff;
}

.btn-glass-rose {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.3) 100%);
  border-color: rgba(244, 63, 94, 0.45);
  color: #fecdd3;
}
.btn-glass-rose:hover {
  background: linear-gradient(135deg, rgba(244, 63, 94, 0.35) 0%, rgba(225, 29, 72, 0.45) 100%);
  color: #ffffff;
}

/* 2. شريط التبويبات الإدارية الخمسة */
.founder-nav-tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 0.75rem;
  background: rgba(12, 24, 46, 0.85);
  padding: 0.55rem;
  border-radius: 16px;
  border: var(--glass-border-subtle);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-crystal);
  overflow-x: auto;
}

.founder-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  padding: 0.75rem 1.1rem;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: var(--text-soft);
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.founder-tab-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
}

.founder-tab-btn.active {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(16, 185, 129, 0.3) 100%);
  color: #ffffff;
  border: 1.2px solid rgba(56, 189, 248, 0.45);
  box-shadow: 0 4px 15px rgba(6, 182, 212, 0.2);
}

/* 3. حاويات التبويبات والمحتوى */
.tab-content-panel {
  display: none;
  flex-direction: column;
  gap: 1.5rem;
  animation: fadeIn 0.3s ease;
}

.tab-content-panel.active {
  display: flex;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* البطاقات الإحصائية الإدارية الأربع */
.admin-metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.admin-metric-card {
  background: var(--glass-card);
  backdrop-filter: blur(20px);
  border: var(--glass-border);
  border-radius: 18px;
  padding: 1.4rem 1.6rem;
  box-shadow: var(--shadow-crystal);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: transform 0.25s ease;
}

.admin-metric-card:hover {
  transform: translateY(-2px);
  border-color: var(--sky-primary);
}

.metric-info h3 {
  font-size: 0.88rem;
  color: var(--text-muted);
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.metric-huge-num {
  font-size: 2.3rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
}

.metric-icon-box {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(9, 20, 38, 0.85);
  border: var(--glass-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

/* البطاقات الرئيسية */
.glass-panel {
  background: var(--glass-card);
  backdrop-filter: blur(22px);
  border: var(--glass-border);
  border-radius: 20px;
  padding: 1.6rem;
  box-shadow: var(--shadow-crystal);
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.panel-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 1rem;
}

.panel-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.split-grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.3rem;
}

/* الجداول الزجاجية الملكية */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.crystal-table {
  width: 100%;
  border-collapse: collapse;
  text-align: right;
}

.crystal-table th {
  background: rgba(9, 20, 38, 0.85);
  color: var(--text-soft);
  font-size: 0.84rem;
  font-weight: 800;
  padding: 0.9rem 1.1rem;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.12);
  white-space: nowrap;
}

.crystal-table td {
  padding: 0.95rem 1.1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.9rem;
  color: var(--text-bright);
  vertical-align: middle;
}

.crystal-table tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.badge-role {
  display: inline-block;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 800;
  background: rgba(6, 182, 212, 0.18);
  color: #a5f3fc;
  border: 1px solid rgba(6, 182, 212, 0.35);
}

.badge-role.dept-mgr {
  background: rgba(245, 158, 11, 0.18);
  color: #fef08a;
  border-color: rgba(245, 158, 11, 0.4);
}

.badge-role.super-admin {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.45);
}

/* حقول الإدخال الزجاجية */
.input-glass {
  background: rgba(9, 20, 38, 0.85);
  border: 1.2px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  padding: 0.6rem 0.95rem;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.input-glass:focus {
  border-color: var(--cyan-primary);
  box-shadow: 0 0 12px rgba(6, 182, 212, 0.25);
}

.select-glass {
  background: rgba(9, 20, 38, 0.95);
  border: 1.2px solid rgba(255, 255, 255, 0.14);
  border-radius: 10px;
  padding: 0.6rem 0.85rem;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.9rem;
  outline: none;
}

.textarea-glass {
  background: rgba(9, 20, 38, 0.85);
  border: 1.2px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.92rem;
  outline: none;
  min-height: 90px;
  resize: vertical;
}

.textarea-glass:focus {
  border-color: var(--gold-primary);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.25);
}

/* 4. بطاقات النماذج والاستمارات الجاهزة */
.forms-suite-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.3rem;
}

.form-suite-card {
  background: rgba(14, 28, 52, 0.8);
  border: var(--glass-border);
  border-radius: 18px;
  padding: 1.4rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  transition: all 0.25s ease;
}

.form-suite-card:hover {
  background: var(--glass-card-hover);
  border-color: var(--gold-primary);
  transform: translateY(-2px);
}

.form-card-head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.form-card-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(9, 20, 38, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: var(--glass-border-subtle);
}

.form-card-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #ffffff;
}

.form-card-desc {
  font-size: 0.85rem;
  color: var(--text-soft);
  line-height: 1.5;
}

/* 5. ورقة الطباعة الرسمية والمودال */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(3, 7, 18, 0.88);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1.5rem;
}

.modal-crystal-box {
  background: rgba(14, 28, 52, 0.96);
  border: 1.5px solid rgba(56, 189, 248, 0.35);
  border-radius: 22px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 2rem;
  box-shadow: 0 25px 60px rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}

.printable-official-document {
  background: #ffffff;
  color: #000000;
  border-radius: 8px;
  padding: 2.5rem;
  font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
  direction: rtl;
  box-shadow: 0 5px 25px rgba(0,0,0,0.3);
}

.doc-header-official {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #000000;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
}

.doc-title-main {
  font-size: 1.3rem;
  font-weight: 900;
  text-align: center;
  margin: 1.2rem 0;
  text-decoration: underline;
}

.doc-table-print {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2rem 0;
}

.doc-table-print th, .doc-table-print td {
  border: 1px solid #000000;
  padding: 0.6rem 0.8rem;
  font-size: 0.92rem;
  text-align: right;
}

.doc-table-print th {
  background: #f1f5f9;
  font-weight: 800;
}

@media print {
  body * { visibility: hidden; }
  .printable-official-document, .printable-official-document * {
    visibility: visible;
  }
  .printable-official-document {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 20mm;
    box-shadow: none;
    border: none;
  }
}

@media (max-width: 1024px) {
  .admin-metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .split-grid-two { grid-template-columns: 1fr; }
  .forms-suite-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .founder-header { flex-direction: column; gap: 1rem; align-items: stretch; }
  .header-actions { justify-content: center; flex-wrap: wrap; }
  .admin-metrics-grid { grid-template-columns: 1fr; }
}
`;
  fs.writeFileSync(path.join(ROOT, 'css', 'founder.css'), css, 'utf8');
  console.log('✅ css/founder.css generated!');
}

function buildHtml() {
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>بوابة المؤسس والقيادة الإدارية السيادية | قسم الإنتاج الجنوبي</title>
  <link rel="stylesheet" href="css/founder.css?v=84">
</head>
<body>
  <div class="founder-wrapper">
    <!-- الترويسة السيادية الفخمة -->
    <header class="founder-header">
      <div class="brand-box">
        <div class="brand-emblem">🛡️</div>
        <div class="brand-text">
          <h1>بوابة المؤسس والقيادة الإدارية السيادية</h1>
          <div class="brand-subtitle-line">
            <span class="pulse-dot"></span>
            <span>غرفة السيطرة الإدارية والملاكات العليا | قسم الإنتاج الجنوبي</span>
          </div>
        </div>
      </div>

      <div class="header-actions">
        <!-- هوية المؤسس -->
        <div class="founder-identity-pill">
          <span>المؤسس المعتمد:</span>
          <strong id="activeUserEmailDisplay">hussein123119@gmail.com</strong>
        </div>

        <!-- أزرار الإجراءات في صف أحادي واحد -->
        <button class="btn-glass" onclick="FounderPortal.toggleFullscreen()" title="ملء الشاشة">
          ⛶ ملء الشاشة
        </button>
        <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.refreshData()" title="تحديث البيانات">
          🔄 تحديث
        </button>
        <a href="index.html" class="btn-glass" title="الرجوع للمنظومة العامة">
          🏢 المنظومة العامة
        </a>
        <button class="btn-glass btn-glass-rose" onclick="FounderPortal.logout()" title="تسجيل الخروج">
          🚪 خروج
        </button>
      </div>
    </header>

    <!-- شريط التبويبات الإدارية الخمسة العليا -->
    <nav class="founder-nav-tabs">
      <button id="tabBtnControl" class="founder-tab-btn active" onclick="FounderPortal.switchTab('control')">
        🛡️ مركز السيطرة والقرارات العليا
      </button>
      <button id="tabBtnRoles" class="founder-tab-btn" onclick="FounderPortal.switchTab('roles')">
        👥 الصلاحيات واعتماد المستخدمين
      </button>
      <button id="tabBtnDossiers" class="founder-tab-btn" onclick="FounderPortal.switchTab('dossiers')">
        📁 مركز الإضابير والملاكات
      </button>
      <button id="tabBtnForms" class="founder-tab-btn" onclick="FounderPortal.switchTab('forms')">
        📝 الاستمارات الإدارية الجاهزة
      </button>
      <button id="tabBtnPrint" class="founder-tab-btn" onclick="FounderPortal.switchTab('print')">
        🖨️ مركز الطباعة والتقارير الرسمية
      </button>
    </nav>

    <!-- ======================================================================= -->
    <!-- التبويب 1: 🛡️ مركز السيطرة والقرارات العليا -->
    <!-- ======================================================================= -->
    <section id="panelControl" class="tab-content-panel active">
      <!-- 4 بطاقات إحصائية إدارية عليا -->
      <div class="admin-metrics-grid">
        <div class="admin-metric-card">
          <div class="metric-info">
            <h3>إجمالي ملاكات وكوادر القسم</h3>
            <div class="metric-huge-num" id="metricTotalStaff">11</div>
          </div>
          <div class="metric-icon-box">👥</div>
        </div>

        <div class="admin-metric-card">
          <div class="metric-info">
            <h3>الحسابات الإدارية المفعلة</h3>
            <div class="metric-huge-num" id="metricActiveUsers" style="color: var(--emerald-primary);">10</div>
          </div>
          <div class="metric-icon-box">✓</div>
        </div>

        <div class="admin-metric-card">
          <div class="metric-info">
            <h3>طلبات التسجيل المعلقة</h3>
            <div class="metric-huge-num" id="metricPendingUsers" style="color: var(--gold-primary);">1</div>
          </div>
          <div class="metric-icon-box">⏳</div>
        </div>

        <div class="admin-metric-card">
          <div class="metric-info">
            <h3>الآليات والمأموريات بالواجب</h3>
            <div class="metric-huge-num" id="metricVehicles" style="color: var(--sky-primary);">2</div>
          </div>
          <div class="metric-icon-box">🚚</div>
        </div>
      </div>

      <!-- لوحتان متجاورتان: البث السيادي وإصدار أمر إداري -->
      <div class="split-grid-two">
        <!-- مركز البث السيادي والتعميمات -->
        <div class="glass-panel">
          <div class="panel-header-row">
            <h2 class="panel-title">
              <span>📢</span>
              <span>مركز البث والتعميم السيادي اللحظي</span>
            </h2>
            <span style="font-size: 0.8rem; color: var(--gold-primary); font-weight: 700;">يظهر أعلى شاشات جميع الموظفين</span>
          </div>
          <p style="font-size: 0.88rem; color: var(--text-soft); line-height: 1.5;">
            يمكن للمؤسس كتابة تعميم رسمي عاجل يبث فوراً كشريط علوي متوهج في كافة حواسيب وهواتف منتسبي القسم.
          </p>
          <textarea id="broadcastInput" class="textarea-glass" placeholder="اكتب هنا نص التعميم أو التوجيه الإداري السيادي العاجل..."></textarea>
          <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.65rem;">
            <button class="btn-glass btn-glass-emerald" onclick="FounderPortal.sendBroadcast()" style="flex: 1;">
              📡 بث التعميم فوراً لكافة الموظفين
            </button>
            <button class="btn-glass btn-glass-rose" onclick="FounderPortal.clearBroadcast()">
              🗑️ إلغاء التعميم النشط
            </button>
          </div>
        </div>

        <!-- إصدار أمر إداري سيادي معتمد -->
        <div class="glass-panel">
          <div class="panel-header-row">
            <h2 class="panel-title">
              <span>📜</span>
              <span>إصدار أمر إداري سيادي رسمي معتمد</span>
            </h2>
            <span style="font-size: 0.8rem; color: var(--emerald-primary); font-weight: 700;">توثيق رسمي وأرشفة فورية</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.85rem;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <input type="text" id="decreeSubjectInput" class="input-glass" placeholder="موضوع الأمر الإداري (مثال: إعادة توزيع مهام)">
              <input type="text" id="decreeRefInput" class="input-glass" placeholder="رقم الإشارة (مثال: ق.ج/2026/108)">
            </div>
            <textarea id="decreeContentInput" class="textarea-glass" placeholder="نص القرار والأمر الإداري الصادر..."></textarea>
            <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.65rem;">
              <button class="btn-glass btn-glass-gold" onclick="FounderPortal.issueDecree()" style="flex: 1;">
                ✍️ إصدار وتوثيق الأمر الإداري
              </button>
              <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.previewCurrentDecree()">
                👁️ معاينة وطباعة الكتاب
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- صندوق الأمان السيادي والنسخ الاحتياطي -->
      <div class="glass-panel">
        <div class="panel-header-row">
          <h2 class="panel-title">
            <span>💾</span>
            <span>صندوق الأمان السيادي والنسخ الاحتياطي الشامل</span>
          </h2>
          <span style="font-size: 0.82rem; color: var(--sky-primary); font-weight: 700;">حماية وتأمين قاعدة البيانات الحقيقية</span>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
          <p style="font-size: 0.88rem; color: var(--text-soft); max-width: 900px; line-height: 1.5;">
            توليد نقطة استعادة فورية لكافة سجلات القسم وملاكاته والكتب الصادرة والمستندات وحفظها في مجلد النسخ الاحتياطية الدائم بنقرة زر واحدة.
          </p>
          <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.65rem;">
            <button class="btn-glass btn-glass-emerald" onclick="FounderPortal.takeInstantBackup()">
              ⚡ أخذ نسخة احتياطية فورية للمنظومة
            </button>
            <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.checkServerHealth()">
              🩺 فحص صحة قاعدة البيانات والخادم
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- التبويب 2: 👥 الصلاحيات واعتماد المستخدمين -->
    <!-- ======================================================================= -->
    <section id="panelRoles" class="tab-content-panel">
      <div class="split-grid-two">
        <!-- سجل المخولين بالبريد الإلكتروني المعتمد -->
        <div class="glass-panel">
          <div class="panel-header-row">
            <h2 class="panel-title">
              <span>🔑</span>
              <span>سجل المخولين بالوصول السيادي (عبر البريد الإلكتروني)</span>
            </h2>
            <span style="font-size: 0.8rem; color: var(--sky-primary); font-weight: 700;">تحقق حساب غوغل الشخصي</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-soft);">
            إضافة أي بريد إلكتروني لشخص يثق به المؤسس لمنحه حق الدخول أو سحب تفويضه فوراً.
          </p>
          <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.65rem; background: rgba(9,20,38,0.7); padding: 0.65rem; border-radius: 12px; border: var(--glass-border-subtle);">
            <input type="email" id="newAuthEmailInput" class="input-glass" placeholder="أدخل البريد الإلكتروني (Google Email)" style="flex: 1;">
            <select id="newAuthRoleSelect" class="select-glass">
              <option value="معاينة إشرافية">معاينة إشرافية</option>
              <option value="إدارة تنفيذية">إدارة تنفيذية</option>
            </select>
            <button class="btn-glass btn-glass-emerald" onclick="FounderPortal.addAuthorizedEmail()">
              + منح التفويض
            </button>
          </div>
          <div class="table-responsive">
            <table class="crystal-table">
              <thead>
                <tr>
                  <th>البريد الإلكتروني المعتمد</th>
                  <th>نوع الصلاحية</th>
                  <th>تاريخ المنح</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody id="whitelistTableBody"></tbody>
            </table>
          </div>
        </div>

        <!-- طلبات الحسابات المعلقة قيد الموافقة -->
        <div class="glass-panel">
          <div class="panel-header-row">
            <h2 class="panel-title">
              <span>⏳</span>
              <span>طلبات الحسابات المعلقة قيد الاعتماد والموافقة</span>
            </h2>
            <span id="pendingCountBadge" class="badge-role dept-mgr">1 طلب معلق</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-soft);">
            تدقيق طلبات المنتسبين الجدد وقبولهم أو رفضهم ومنحهم الصلاحية الرسمية.
          </p>
          <div id="pendingRequestsContainer" style="display: flex; flex-direction: column; gap: 0.85rem;">
            <!-- توليد الطلبات المعلقة آلياً -->
          </div>
        </div>
      </div>

      <!-- جدول كافة مستخدمي المنظومة وإدارة صلاحياتهم -->
      <div class="glass-panel">
        <div class="panel-header-row">
          <h2 class="panel-title">
            <span>🛡️</span>
            <span>جدول إدارة الصلاحيات العليا لمنتسبي المنظومة</span>
          </h2>
          <span style="font-size: 0.84rem; color: var(--text-soft);">تعديل فوري للرتب مع حفظ مباشر في قاعدة البيانات</span>
        </div>
        <div class="table-responsive">
          <table class="crystal-table">
            <thead>
              <tr>
                <th>الاسم الرباعي للمنتسب</th>
                <th>الرقم الوظيفي</th>
                <th>الشعبة التابع لها</th>
                <th>الصلاحية الحالية في النظام</th>
                <th>تغيير الصلاحية</th>
                <th>حالة الحساب</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody id="allUsersRolesTableBody"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- التبويب 3: 📁 مركز الإضابير والملاكات الإدارية -->
    <!-- ======================================================================= -->
    <section id="panelDossiers" class="tab-content-panel">
      <div class="glass-panel">
        <div class="panel-header-row">
          <h2 class="panel-title">
            <span>📁</span>
            <span>سجل إضابير الملاكات والبيانات الإدارية والوظيفية</span>
          </h2>
          <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.65rem;">
            <input type="text" id="dossierSearchInput" class="input-glass" placeholder="بحث بالاسم أو الرقم الوظيفي..." oninput="FounderPortal.filterDossiers()" style="width: 260px;">
            <select id="dossierSectionFilter" class="select-glass" onchange="FounderPortal.filterDossiers()">
              <option value="ALL">كافة الشعب</option>
              <option value="الإنتاج">شعبة الإنتاج</option>
              <option value="المعالجة والعمليات">شعبة المعالجة والعمليات</option>
              <option value="الصيانة">شعبة الصيانة</option>
              <option value="المتابعة الفنية">شعبة المتابعة الفنية</option>
            </select>
          </div>
        </div>
        <div class="table-responsive">
          <table class="crystal-table">
            <thead>
              <tr>
                <th>الاسم الكامل للمنتسب</th>
                <th>الرقم الوظيفي</th>
                <th>الشعبة والوحدة</th>
                <th>الدرجة والمرحلة</th>
                <th>سنوات الخدمة</th>
                <th>طبيعة الدوام</th>
                <th>الترفيع القادم</th>
                <th>الإضبارة</th>
              </tr>
            </thead>
            <tbody id="dossiersTableBody"></tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- التبويب 4: 📝 الاستمارات والنماذج الإدارية الجاهزة -->
    <!-- ======================================================================= -->
    <section id="panelForms" class="tab-content-panel">
      <div class="glass-panel">
        <div class="panel-header-row">
          <h2 class="panel-title">
            <span>📝</span>
            <span>حزمة الاستمارات والنماذج الإدارية الجاهزة للمنظومة</span>
          </h2>
          <span style="font-size: 0.84rem; color: var(--gold-primary); font-weight: 700;">جاهزة للمعاينة، التعبئة، والطباعة الرسمية</span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-soft); line-height: 1.6;">
          توفر هذه الحزمة استمارات إدارية قياسية معتمدة بقسم الإنتاج الجنوبي يمكن للمؤسس والإدارة استخدامها وطباعتها مباشرة، أو إضافة نماذج واستمارات جديدة وتعميمها على المنظومة.
        </p>

        <div class="forms-suite-grid">
          <!-- 1. استمارة طلب إجازة -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">🏖️</div>
                <div>
                  <div class="form-card-title">استمارة طلب إجازة رسمية</div>
                  <div style="font-size: 0.78rem; color: var(--sky-primary); font-weight: 700;">(اعتيادية / مرضية / دورية حقلية 14/14)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                النموذج الرسمي المعتمد لتقديم طلبات الإجازات لمنتسبي شعب ووحدات القسم مع حقول البديل وموافقة المسؤول المباشر.
              </p>
            </div>
            <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.5rem;">
              <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.openFormModal('leave')" style="flex: 1;">
                👁️ معاينة وتعبئة
              </button>
              <button class="btn-glass btn-glass-gold" onclick="FounderPortal.quickPrintForm('leave')">
                🖨️ طباعة فورية
              </button>
            </div>
          </div>

          <!-- 2. استمارة طلب نقل وتكليف -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">🔄</div>
                <div>
                  <div class="form-card-title">استمارة طلب نقل وتكليف داخلي</div>
                  <div style="font-size: 0.78rem; color: var(--sky-primary); font-weight: 700;">(بين الشعب والوحدات والمحطات)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                الاستمارة المعتمدة لتنظيم حركة الملاكات وتغيير مواقع العمل والمحطات التشغيلية وتكليف الكوادر بالمهام النوعية.
              </p>
            </div>
            <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.5rem;">
              <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.openFormModal('transfer')" style="flex: 1;">
                👁️ معاينة وتعبئة
              </button>
              <button class="btn-glass btn-glass-gold" onclick="FounderPortal.quickPrintForm('transfer')">
                🖨️ طباعة فورية
              </button>
            </div>
          </div>

          <!-- 3. استمارة مقابلة رسمية مع المدير -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">🤝</div>
                <div>
                  <div class="form-card-title">استمارة طلب مقابلة رسمية لمدير القسم</div>
                  <div style="font-size: 0.78rem; color: var(--sky-primary); font-weight: 700;">(المقابلات الدورية والطلبات الخاصة)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                استمارة توثيق وتحديد مواعيد المقابلات الرسمية للمنتسبين مع إدراج سبب المقابلة وتوصية وتوجيه مدير القسم وقراره.
              </p>
            </div>
            <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.5rem;">
              <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.openFormModal('interview')" style="flex: 1;">
                👁️ معاينة وتعبئة
              </button>
              <button class="btn-glass btn-glass-gold" onclick="FounderPortal.quickPrintForm('interview')">
                🖨️ طباعة فورية
              </button>
            </div>
          </div>

          <!-- 4. استمارة أمر إداري صادر -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">📜</div>
                <div>
                  <div class="form-card-title">استمارة أمر إداري سيادي معتمد</div>
                  <div style="font-size: 0.78rem; color: var(--sky-primary); font-weight: 700;">(بالصيغة الوزارية الرسمية الصادرة)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                نموذج رسمي مجهز بالترويسة المعتمدة والختم لإصدار وتوثيق الأوامر الإدارية والقرارات التنظيمية الموجهة للقسم.
              </p>
            </div>
            <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.5rem;">
              <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.openFormModal('decree')" style="flex: 1;">
                👁️ معاينة وتعبئة
              </button>
              <button class="btn-glass btn-glass-gold" onclick="FounderPortal.quickPrintForm('decree')">
                🖨️ طباعة فورية
              </button>
            </div>
          </div>
        </div>

        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 0.5rem 0;">

        <!-- إضافة فورمة إدارية جديدة للمنظومة -->
        <div style="background: rgba(9, 20, 38, 0.7); border: var(--glass-border-subtle); border-radius: 16px; padding: 1.4rem;">
          <h3 style="font-size: 1.1rem; color: var(--gold-primary); font-weight: 800; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>➕</span>
            <span>استحداث وإضافة فورمة أو نموذج إداري جديد للمنظومة</span>
          </h3>
          <p style="font-size: 0.84rem; color: var(--text-soft); margin-bottom: 1rem;">
            تتيح هذه الخاصية للمؤسس إنشاء ونشر استمارة إدارية جديدة لتظهر وتعتمد فوراً في عموم المنظومة.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 0.85rem;">
            <input type="text" id="customFormTitleInput" class="input-glass" placeholder="عنوان الاستمارة الجديدة (مثال: استمارة صرف مواد واحتياجات)">
            <input type="text" id="customFormTargetInput" class="input-glass" placeholder="الجهة المستهدفة (مثال: كافة شعب القسم)">
          </div>
          <textarea id="customFormFieldsInput" class="textarea-glass" placeholder="اكتب وصف الاستمارة وأبرز البنود المطلوبة فيها..." style="min-height: 75px; margin-bottom: 0.85rem;"></textarea>
          <button class="btn-glass btn-glass-emerald" onclick="FounderPortal.addCustomFormTemplate()">
            ✨ اعتماد وإضافة الاستمارة للمنظومة
          </button>
        </div>
      </div>
    </section>

    <!-- ======================================================================= -->
    <!-- التبويب 5: 🖨️ مركز الطباعة والتقارير الإدارية الرسمية -->
    <!-- ======================================================================= -->
    <section id="panelPrint" class="tab-content-panel">
      <div class="glass-panel">
        <div class="panel-header-row">
          <h2 class="panel-title">
            <span>🖨️</span>
            <span>مركز الطباعة الإدارية والاستخراج الرسمي المعتمد</span>
          </h2>
          <span style="font-size: 0.84rem; color: var(--sky-primary); font-weight: 700;">كتب رسمية مختومة بالصيغة المعتمدة</span>
        </div>
        <p style="font-size: 0.88rem; color: var(--text-soft); line-height: 1.6;">
          بنقرة زر واحدة، يقوم النظام بتوليد وتنسيق الكتاب الإداري الرسمي كاملاً مع الترويسة، جدول البيانات، حقول المصادقة، والختم الرسمي جاهزاً للطباعة الفورية على ورق A4 أو الحفظ الرقمي.
        </p>

        <div class="forms-suite-grid">
          <!-- 1. طباعة موقف الملاكات الشامل -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">👥</div>
                <div>
                  <div class="form-card-title">موقف الملاكات والكوادر الشامل</div>
                  <div style="font-size: 0.78rem; color: var(--emerald-primary); font-weight: 700;">(كشف رسمي بكافة منتسبي القسم وتوزيعهم)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                طباعة جدول رسمي شامل يضم الأسماء الرباعية، الأرقام الوظيفية، الشعب والوحدات، وطبيعة الدوام المعتمدة للقسم.
              </p>
            </div>
            <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.printStaffManifest()">
              🖨️ معاينة وطباعة الموقف الرسمي
            </button>
          </div>

          <!-- 2. طباعة جدول الترفيعات والعلاوات -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">📈</div>
                <div>
                  <div class="form-card-title">جدول استحقاقات الترفيع والعلاوات القادمة</div>
                  <div style="font-size: 0.78rem; color: var(--gold-primary); font-weight: 700;">(المستحقين للترفيع والترقية الوظيفية)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                طباعة كشف تدقيقي للمنتسبين الذين استوفوا المدة القانونية للترقية أو الترفيع للدرجة والمرحلة التالية.
              </p>
            </div>
            <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.printPromotionsReport()">
              🖨️ معاينة وطباعة كشف الترفيعات
            </button>
          </div>

          <!-- 3. طباعة كشف حركة الآليات والمأموريات -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">🚚</div>
                <div>
                  <div class="form-card-title">كشف حركة الآليات والمأموريات الميدانية</div>
                  <div style="font-size: 0.78rem; color: var(--sky-primary); font-weight: 700;">(موقف الأسطول والواجبات الميدانية)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                طباعة الموقف الرسمي لحركة الآليات التابعة للقسم وسائقيها ومهامها الميدانية الحالية في حقل الرميلة.
              </p>
            </div>
            <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.printVehiclesReport()">
              🖨️ معاينة وطباعة كشف الآليات
            </button>
          </div>

          <!-- 4. طباعة سجل المقابلات وقرارات المدير -->
          <div class="form-suite-card">
            <div>
              <div class="form-card-head">
                <div class="form-card-icon">🤝</div>
                <div>
                  <div class="form-card-title">سجل المقابلات الرسمية وقرارات الإدارة</div>
                  <div style="font-size: 0.78rem; color: var(--rose-primary); font-weight: 700;">(جدول المقابلات وقرارات مدير القسم)</div>
                </div>
              </div>
              <p class="form-card-desc" style="margin-top: 0.8rem;">
                طباعة محضر رسمي موثق بالمقابلات المنجزة وتوجيهات الإدارة والقرارات الصادرة بشأن طلبات الكوادر.
              </p>
            </div>
            <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.printInterviewsReport()">
              🖨️ معاينة وطباعة سجل المقابلات
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>

  <!-- ========================================================================= -->
  <!-- النوافذ المنبثقة (Modals) -->
  <!-- ========================================================================= -->

  <!-- 1. نافذة تعديل إضبارة المنتسب -->
  <div id="dossierModal" class="modal-overlay" style="display: none;">
    <div class="modal-crystal-box" style="max-width: 650px;">
      <div class="panel-header-row">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
          <span>📁</span>
          <span>تعديل إضبارة المنتسب (البيانات الإدارية)</span>
        </h3>
        <button class="btn-glass" onclick="FounderPortal.closeDossierModal()" style="height: 32px; padding: 0 0.7rem;">✕</button>
      </div>

      <form id="dossierEditForm" onsubmit="FounderPortal.saveDossier(event)" style="display: flex; flex-direction: column; gap: 0.9rem;">
        <input type="hidden" id="editEmpId">
        <div>
          <label style="font-size: 0.82rem; color: var(--text-soft); font-weight: 700; display: block; margin-bottom: 0.3rem;">الاسم الرباعي الكامل:</label>
          <input type="text" id="editEmpName" class="input-glass" style="width: 100%;" required>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.82rem; color: var(--text-soft); font-weight: 700; display: block; margin-bottom: 0.3rem;">الرقم الوظيفي:</label>
            <input type="text" id="editEmpCode" class="input-glass" style="width: 100%;" required>
          </div>
          <div>
            <label style="font-size: 0.82rem; color: var(--text-soft); font-weight: 700; display: block; margin-bottom: 0.3rem;">طبيعة الدوام:</label>
            <select id="editEmpShift" class="select-glass" style="width: 100%;">
              <option value="صباحي">صباحي (مستمر)</option>
              <option value="مناوب">مناوب (12 ساعة)</option>
              <option value="حقلي">حقلي (14/14 يوم)</option>
            </select>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.82rem; color: var(--text-soft); font-weight: 700; display: block; margin-bottom: 0.3rem;">الشعبة:</label>
            <select id="editEmpSection" class="select-glass" style="width: 100%;">
              <option value="الإنتاج">شعبة الإنتاج</option>
              <option value="المعالجة والعمليات">شعبة المعالجة والعمليات</option>
              <option value="الصيانة">شعبة الصيانة</option>
              <option value="المتابعة الفنية">شعبة المتابعة الفنية</option>
            </select>
          </div>
          <div>
            <label style="font-size: 0.82rem; color: var(--text-soft); font-weight: 700; display: block; margin-bottom: 0.3rem;">سنوات الخدمة الوظيفية:</label>
            <input type="number" id="editEmpService" class="input-glass" style="width: 100%;" min="0" max="45" value="5">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div>
            <label style="font-size: 0.82rem; color: var(--text-soft); font-weight: 700; display: block; margin-bottom: 0.3rem;">الدرجة الوظيفية:</label>
            <input type="text" id="editEmpGrade" class="input-glass" style="width: 100%;" placeholder="مثال: الخامسة">
          </div>
          <div>
            <label style="font-size: 0.82rem; color: var(--text-soft); font-weight: 700; display: block; margin-bottom: 0.3rem;">المرحلة:</label>
            <input type="text" id="editEmpStep" class="input-glass" style="width: 100%;" placeholder="مثال: الثانية">
          </div>
        </div>

        <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; justify-content: flex-end; gap: 0.65rem; margin-top: 0.5rem;">
          <button type="button" class="btn-glass" onclick="FounderPortal.closeDossierModal()">إلغاء</button>
          <button type="submit" class="btn-glass btn-glass-emerald">💾 حفظ التعديلات في الإضبارة</button>
        </div>
      </form>
    </div>
  </div>

  <!-- 2. نافذة معاينة وطباعة الاستمارة الرسمية -->
  <div id="printPreviewModal" class="modal-overlay" style="display: none;">
    <div class="modal-crystal-box" style="max-width: 960px;">
      <div class="panel-header-row" style="padding-bottom: 0.5rem;">
        <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff;">📄 معاينة المستند الإداري الرسمي قبل الطباعة</h3>
        <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.5rem;">
          <button class="btn-glass btn-glass-gold" onclick="window.print()">🖨️ بدء الطباعة الآن</button>
          <button class="btn-glass" onclick="FounderPortal.closePrintPreviewModal()">✕ إغلاق</button>
        </div>
      </div>
      <!-- وعاء ورقة الطباعة البيضاء المعتمدة -->
      <div id="officialDocumentPrintTarget" class="printable-official-document"></div>
    </div>
  </div>

  <!-- سكريبتات المنظومة والمحرك -->
  <script src="js/store.js?v=84"></script>
  <script src="js/founder_portal.js?v=84"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'founder.html'), html, 'utf8');
  console.log('✅ founder.html generated!');
}

if (require.main === module) {
  buildCss();
  buildHtml();
  console.log('🎉 Все файлы портала основателя v84 успешно сгенерированы!');
}

module.exports = { buildCss, buildHtml };

