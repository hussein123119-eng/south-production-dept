/**
 * ==============================================================================
 * Suite 34: Section-to-Station Directives Forwarding & Station Notifications Tabs
 * فحص نظام تعميم ونشر تبليغات القسم على المحطات وتبويبات تبليغات المحطات المزدوجة
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

// 1. إعداد بيئة وهمية للمتصفح (Mock Browser Environment)
const mockStorage = {};
global.localStorage = {
  getItem: (key) => (key in mockStorage ? mockStorage[key] : null),
  setItem: (key, val) => { mockStorage[key] = String(val); },
  removeItem: (key) => { delete mockStorage[key]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

global.window = {
  location: { hostname: 'localhost', protocol: 'http:' },
  addEventListener: () => {},
  dispatchEvent: () => true
};

global.document = {
  documentElement: {
    getAttribute: (attr) => (attr === 'data-theme' ? 'light' : null),
    setAttribute: () => {}
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => ({
    id,
    innerHTML: '',
    className: '',
    value: '',
    style: {},
    appendChild: () => {},
    remove: () => {},
    focus: () => {}
  }),
  createElement: (tag) => ({
    id: '',
    className: '',
    innerHTML: '',
    style: {},
    setAttribute: () => {},
    appendChild: () => {},
    remove: () => {},
    onclick: null
  }),
  body: {
    appendChild: () => {}
  }
};
global.navigator = { onLine: true };
global.alert = (msg) => {};
global.confirm = () => true;

console.log('======================================================================');
console.log('🧪 اختبارات تعميم تبليغات القسم على المحطات وتبويب تبليغات المحطة المزدوج');
console.log('======================================================================\n');

// 2. تحميل ملفات النظام والمحرك ومكونات مساحة عمل المحطة والشعبة
const storeCode = fs.readFileSync(path.join(__dirname, 'store.js'), 'utf8');
eval(storeCode);
global.store = global.window.store;

const rbacCode = fs.readFileSync(path.join(__dirname, 'rbac.js'), 'utf8');
eval(rbacCode);

const authCode = fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8');
eval(authCode);

const sectionWorkspaceCode = fs.readFileSync(path.join(__dirname, 'components/section_workspace.js'), 'utf8');
eval(sectionWorkspaceCode);

const stationWorkspaceCode = fs.readFileSync(path.join(__dirname, 'components/station_workspace.js'), 'utf8');
eval(stationWorkspaceCode);

const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
eval(appCode);

// Get fresh DB
const db = global.store.getDb();

// Setup Mock Current Users
const superAdminUser = {
  id: 'user-01',
  employeeId: 'EMP-001',
  fullName: 'المدير العام المشرف',
  role: 'SUPER_ADMIN',
  departmentId: 'dept-south-prod',
  sectionId: null,
  stationId: null
};

const sectionMgrUser = {
  id: 'user-sec1-mgr',
  employeeId: 'EMP-SEC1',
  fullName: 'م. حيدر جاسم',
  role: 'SECTION_MANAGER',
  departmentId: 'dept-south-prod',
  sectionId: 'sec-1',
  stationId: null
};

const stationMgrUser = {
  id: 'user-st01-mgr',
  employeeId: 'EMP-ST01',
  fullName: 'م. عباس فاضل',
  role: 'STATION_MANAGER',
  departmentId: 'dept-south-prod',
  sectionId: 'sec-1',
  stationId: 'st-101'
};

const stationStaffUser = {
  id: 'user-st01-staff',
  employeeId: 'EMP-ST01-02',
  fullName: 'فني تشغيل نوبة',
  role: 'EMPLOYEE',
  departmentId: 'dept-south-prod',
  sectionId: 'sec-1',
  stationId: 'st-101'
};

global.window.auth = {
  getCurrentUser: () => sectionMgrUser
};

const app = global.window.app;

// --------------------------------------------------------------------------
// 1. فحص دوال قاعدة البيانات والتخزين (Store Notification Functions)
// --------------------------------------------------------------------------
console.log('--- 1. التحقق من محرك قاعدة البيانات وتبليغات المحطات وتعميم القسم ---');

assert(typeof global.store.getStationNotifications === 'function', 'دالة getStationNotifications متوفرة في Store');
assert(typeof global.store.addStationNotification === 'function', 'دالة addStationNotification متوفرة في Store');
assert(typeof global.store.deleteStationNotification === 'function', 'دالة deleteStationNotification متوفرة في Store');
assert(typeof global.store.forwardDeptNotificationToStations === 'function', 'دالة forwardDeptNotificationToStations متوفرة في Store');

// Test adding a station notification
const newStationNotif = global.store.addStationNotification({
  stationId: 'st-101',
  targetScope: 'ALL_STAFF',
  title: 'تأكيد فحص صمامات العزل في محطة الرميلة الشمالية',
  content: 'يرجى من كافة الوجبات إتمام الفحص الفني لصمامات الدخول وتوثيقه.',
  priority: 'URGENT'
}, stationMgrUser);

assert(newStationNotif && newStationNotif.id && newStationNotif.id.startsWith('st-notif-'), 'إضافة تبليغ المحطة وتوليد معرف فريد st-notif- بنجاح');
assert(newStationNotif.stationId === 'st-101', 'ربط التبليغ الموقعي بالمحطة st-101 بدقة');
assert(newStationNotif.priority === 'URGENT', 'تسجيل درجة الأولوية URGENT بدقة');

const stationNotifsList = global.store.getStationNotifications('st-101', stationStaffUser);
assert(stationNotifsList.some(n => n.id === newStationNotif.id), 'استرجاع تبليغ المحطة الجديد بنجاح لكادر المحطة');

// Test forwarding a department notification to stations
const sampleDeptNotif = (db.officialNotifications && db.officialNotifications[0]) || {
  id: 'dept-notif-test-101',
  title: 'تعليمات وإجراءات السلامة الصيفية',
  content: 'توجيه صادر من إدارة القسم لكافة المواقع النفطية.',
  importance: 'HIGH',
  departmentId: 'dept-south-prod'
};

if (!db.officialNotifications) db.officialNotifications = [sampleDeptNotif];

const forwarded = global.store.forwardDeptNotificationToStations(sampleDeptNotif.id, 'sec-1', {
  targetStationId: 'st-101',
  targetStationName: 'محطة الرميلة الشمالية',
  sectionDirective: 'يرجى الالتزام الصارم بما ورد وتزويدنا بالموقف غداً.',
  priority: 'HIGH'
}, sectionMgrUser);

assert(forwarded && forwarded.sourceType === 'FORWARDED_FROM_DEPT', 'تعميم ونشر تبليغ القسم بنوع مصدر FORWARDED_FROM_DEPT بنجاح');
assert(forwarded.isForwardedFromDept === true, 'تحديد علامة isForwardedFromDept بنجاح');
assert(forwarded.originalDeptNotifId === sampleDeptNotif.id, 'ربط التبليغ المعمم بكود التبليغ الوزاري الأصلي');
assert(forwarded.sectionDirective.includes('يرجى الالتزام الصارم'), 'حفظ وتثبيت هامش وتوجيه مسؤول الشعبة بدقة');

// --------------------------------------------------------------------------
// 2. فحص واجهة مساحة عمل الشعبة (Section Workspace Component)
// --------------------------------------------------------------------------
console.log('\n--- 2. التحقق من أداة النشر والتعميم في مساحة عمل الشعبة ---');

global.window.auth.getCurrentUser = () => sectionMgrUser;
global.window.app.currentSectionSubTab = 'notifs';
global.window.app.currentSectionNotifSubTab = 'dept';

const sectionWorkspaceHtml = global.window.renderSectionWorkspaceView('sec-1');
assert(sectionWorkspaceHtml.includes('نشر وتعميم على المحطات') || sectionWorkspaceHtml.includes('openForwardDeptNotificationToStationsModal'), 'توفر زر وأداة (نشر وتعميم على المحطات) في تبليغات القسم الواردة للشعبة');
assert(sectionWorkspaceHtml.includes('تم التعميم على المحطات') || sectionWorkspaceHtml.includes('openForwardDeptNotificationToStationsModal'), 'توفر شارة أو حالة التعميم على المحطات في واجهة الشعبة');

// --------------------------------------------------------------------------
// 3. فحص واجهة مساحة عمل المحطات القياسية (Standard Station Workspace)
// --------------------------------------------------------------------------
console.log('\n--- 3. التحقق من تبويب التبليغات في مساحة عمل المحطات القياسية ---');

global.window.auth.getCurrentUser = () => stationStaffUser;
global.window.app.currentStationSubTab = 'notifs';
global.window.app.currentStationNotifSubTab = 'section';

const standardStationHtml = global.window.renderStationWorkspaceView('st-101');

// Main Tab Verification
assert(standardStationHtml.includes('التبليغات'), 'ظهور تبويب (التبليغات) في التبويبات الرئيسية للمحطة');
assert(standardStationHtml.includes('التبليغات الواردة من الشعبة'), 'ظهور التبويب الفرعي الأول: (التبليغات الواردة من الشعبة)');
assert(standardStationHtml.includes('التبليغات الصادرة من المحطة'), 'ظهور التبويب الفرعي الثاني: (التبليغات الصادرة من المحطة)');

// Received from Section content verification
assert(standardStationHtml.includes('تعميم رسمي صادر من إدارة القسم') || standardStationHtml.includes('توجيه مسؤول الشعبة'), 'عرض التوجيهات المعممة وهوامش مسؤول الشعبة في التبليغات الواردة للمحطة');

// Station-issued subtab verification
global.window.app.currentStationNotifSubTab = 'station';
const stationIssuedHtml = global.window.renderStationWorkspaceView('st-101');
assert(stationIssuedHtml.includes('تأكيد فحص صمامات العزل في محطة الرميلة الشمالية'), 'عرض التبليغات الصادرة موقعياً من المحطة لكادرها بدقة');

// --------------------------------------------------------------------------
// 4. فحص واجهة مساحة عمل المحطات التخصصية (Specialized Station Workspace)
// --------------------------------------------------------------------------
console.log('\n--- 4. التحقق من تبويب التبليغات في المحطات التخصصية (المختبرات والعدادات) ---');

const specializedStation = (db.stations || []).find(s => s.sectionId === 'sec-3' || s.sectionId === 'sec-4') || {
  id: 'st-spec-01',
  name: 'موقع مختبر الرميلة المركزي',
  code: 'LAB-RUM',
  sectionId: 'sec-3',
  departmentId: 'dept-south-prod'
};

if (!db.stations.some(s => s.id === specializedStation.id)) {
  db.stations.push(specializedStation);
}

global.window.app.currentStationSubTab = 'notifs';
const specStationHtml = global.window.renderStationWorkspaceView(specializedStation.id);
assert(specStationHtml.includes('التبليغات'), 'ظهور تبويب التبليغات في المحطات التخصصية');
assert(specStationHtml.includes('التبليغات الواردة من الشعبة'), 'توفر التبويب الفرعي للتبليغات الواردة في المحطات التخصصية');
assert(specStationHtml.includes('التبليغات الصادرة من المحطة'), 'توفر التبويب الفرعي للتبليغات الصادرة في المحطات التخصصية');

// --------------------------------------------------------------------------
// 5. فحص دوال التحكم والنوافذ المنبثقة (App Controller Methods)
// --------------------------------------------------------------------------
console.log('\n--- 5. التحقق من دوال AppController الخاصة بتبليغات المحطات وتعميم الشعبة ---');

assert(typeof global.window.app.openForwardDeptNotificationToStationsModal === 'function', 'دالة openForwardDeptNotificationToStationsModal متوفرة ومعرفة في AppController');
assert(typeof global.window.app.closeForwardDeptNotifModal === 'function', 'دالة closeForwardDeptNotifModal متوفرة ومعرفة في AppController');
assert(typeof global.window.app.handleForwardDeptNotificationSubmit === 'function', 'دالة handleForwardDeptNotificationSubmit متوفرة ومعرفة في AppController');
assert(typeof global.window.app.openCreateStationNotificationModal === 'function', 'دالة openCreateStationNotificationModal متوفرة ومعرفة في AppController');
assert(typeof global.window.app.closeStationNotificationModal === 'function', 'دالة closeStationNotificationModal متوفرة ومعرفة في AppController');
assert(typeof global.window.app.handleCreateStationNotificationSubmit === 'function', 'دالة handleCreateStationNotificationSubmit متوفرة ومعرفة في AppController');
assert(typeof global.window.app.handleDeleteStationNotification === 'function', 'دالة handleDeleteStationNotification متوفرة ومعرفة في AppController');
assert(typeof global.window.app.viewStationNotificationDetails === 'function', 'دالة viewStationNotificationDetails متوفرة ومعرفة في AppController');
assert(typeof global.window.app.printStationNotification === 'function', 'دالة printStationNotification متوفرة ومعرفة في AppController');
assert(typeof global.window.app.setStationNotifSubTab === 'function', 'دالة setStationNotifSubTab متوفرة ومعرفة في AppController');

// Test subtab switcher
global.window.app.setStationNotifSubTab('station');
assert(global.window.app.currentStationNotifSubTab === 'station', 'تبديل التبويب الفرعي لتبليغات المحطة إلى station بنجاح');
global.window.app.setStationNotifSubTab('section');
assert(global.window.app.currentStationNotifSubTab === 'section', 'تبديل التبويب الفرعي لتبليغات المحطة إلى section بنجاح');

// Test deletion of station notification
global.store.deleteStationNotification(newStationNotif.id, stationMgrUser);
const afterDeleteList = global.store.getStationNotifications('st-101', stationStaffUser);
assert(!afterDeleteList.some(n => n.id === newStationNotif.id), 'حذف تبليغ المحطة بنجاح وتحديث القائمة');

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedTests} ناجح | ${totalTests - passedTests} راسب`);
console.log('----------------------------------------------------------------------\n');

if (totalTests === passedTests) {
  console.log('🎉 جميع اختبارات تعميم تبليغات القسم وتبويبات تبليغات المحطة نجحت بنسبة 100%!');
  process.exit(0);
} else {
  console.error('❌ بعض الاختبارات فشلت.');
  process.exit(1);
}
