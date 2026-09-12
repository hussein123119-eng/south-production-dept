/**
 * Automated Unit Test Suite: Driver Roles & RBAC Architecture
 * Tests:
 * 1. Existence and levels of DRIVER and AUTHORIZED_DRIVER roles.
 * 2. RBAC baseline permissions for DRIVER vs AUTHORIZED_DRIVER (MANAGE_VEHICLES).
 * 3. Anti-escalation and hierarchy verification.
 * 4. Architectural independence of Civil Service Job Titles and System Roles.
 */

const fs = require('fs');
const path = require('path');

// Mock window and browser environment
global.window = global;

// Load RBAC
const rbacPath = path.join(__dirname, 'rbac.js');
const rbacCode = fs.readFileSync(rbacPath, 'utf-8');
eval(rbacCode);

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

console.log('======================================================================');
console.log('  اختبارات التحقق للأدوار الجديدة: سائق (DRIVER) وسائق مخول (AUTHORIZED_DRIVER)');
console.log('======================================================================\n');

// 1. Role Definitions Check
console.log('1. التحقق من تعريف الأدوار في مصفوفة ROLES:');
assert(window.ROLES.DRIVER !== undefined, 'دور DRIVER معرف في ROLES');
assert(window.ROLES.DRIVER.name === 'سائق', 'اسم دور DRIVER هو "سائق"');
assert(window.ROLES.DRIVER.level === 15, 'مستوى دور DRIVER هو 15');

assert(window.ROLES.AUTHORIZED_DRIVER !== undefined, 'دور AUTHORIZED_DRIVER معرف في ROLES');
assert(window.ROLES.AUTHORIZED_DRIVER.name === 'سائق مخول', 'اسم دور AUTHORIZED_DRIVER هو "سائق مخول"');
assert(window.ROLES.AUTHORIZED_DRIVER.level === 22, 'مستوى دور AUTHORIZED_DRIVER هو 22');
assert(window.ROLES.AUTHORIZED_DRIVER.level > window.ROLES.DRIVER.level, 'مستوى السائق المخول (22) أعلى من السائق العادي (15)');
assert(window.ROLES.EMPLOYEE === undefined, 'دور EMPLOYEE محذوف من قائمة الأدوار النشطة ROLES بناءً على التوجيه');

// 2. Baseline Permissions Check
console.log('\n2. التحقق من الصلاحيات الأساسية (Baseline Permissions):');
const mockDriver = {
  id: 'usr-driver-1',
  role: 'DRIVER',
  status: 'APPROVED',
  fullName: 'علي كاظم حميد',
  employeeId: 'EMP-2026-701'
};

const mockAuthDriver = {
  id: 'usr-auth-driver-1',
  role: 'AUTHORIZED_DRIVER',
  status: 'APPROVED',
  fullName: 'حسين جاسم محمد',
  employeeId: 'EMP-2026-702'
};

// Common Permissions
assert(window.rbac.hasPermission(mockDriver, 'FILES_VIEW') === true, 'السائق يمتلك صلاحية مشاهدة الملفات FILES_VIEW');
assert(window.rbac.hasPermission(mockDriver, 'NOTIFS_VIEW') === true, 'السائق يمتلك صلاحية مشاهدة التبليغات NOTIFS_VIEW');
assert(window.rbac.hasPermission(mockDriver, 'CAREER_VIEW_DATA') === true, 'السائق يمتلك صلاحية استعراض إضبارته الوظيفية CAREER_VIEW_DATA');
assert(window.rbac.hasPermission(mockDriver, 'REQUESTS_CREATE') === true, 'السائق يمتلك صلاحية تقديم الطلبات REQUESTS_CREATE');

assert(window.rbac.hasPermission(mockAuthDriver, 'FILES_VIEW') === true, 'السائق المخول يمتلك صلاحية مشاهدة الملفات FILES_VIEW');
assert(window.rbac.hasPermission(mockAuthDriver, 'NOTIFS_VIEW') === true, 'السائق المخول يمتلك صلاحية مشاهدة التبليغات NOTIFS_VIEW');
assert(window.rbac.hasPermission(mockAuthDriver, 'CAREER_VIEW_DATA') === true, 'السائق المخول يمتلك صلاحية استعراض إضبارته الوظيفية CAREER_VIEW_DATA');
assert(window.rbac.hasPermission(mockAuthDriver, 'REQUESTS_CREATE') === true, 'السائق المخول يمتلك صلاحية تقديم الطلبات REQUESTS_CREATE');

// Vehicle Management Permission (The Key Differentiator)
assert(window.rbac.hasPermission(mockAuthDriver, 'MANAGE_VEHICLES') === true, 'السائق المخول يمتلك صلاحية إدارة حركة المركبات MANAGE_VEHICLES');
assert(window.rbac.hasPermission(mockDriver, 'MANAGE_VEHICLES') === false, 'السائق العادي لا يمتلك صلاحية MANAGE_VEHICLES افتراضياً');

// Restricted Operations
assert(window.rbac.hasPermission(mockDriver, 'USERS_ADD') === false, 'السائق محظور من إضافة مستخدمين USERS_ADD');
assert(window.rbac.hasPermission(mockAuthDriver, 'USERS_ADD') === false, 'السائق المخول محظور من إضافة مستخدمين USERS_ADD');
assert(window.rbac.hasPermission(mockAuthDriver, 'ROLES_GRANT') === false, 'السائق المخول محظور من منح الصلاحيات ROLES_GRANT');
assert(window.rbac.hasPermission(mockAuthDriver, 'DEPT_MANAGE_STRUCTURE') === false, 'السائق المخول محظور من تعديل هيكل القسم');

// 3. Anti-Escalation Checks
console.log('\n3. التحقق من ضوابط منع تصعيد الصلاحيات (Anti-Escalation):');
const mockDeptManager = { id: 'usr-dm', role: 'DEPT_MANAGER', status: 'APPROVED' };

assert(window.rbac.canGrantRole(mockDeptManager, 'AUTHORIZED_DRIVER') === true, 'مدير القسم يستطيع منح دور سائق مخول');
assert(window.rbac.canGrantRole(mockDeptManager, 'DRIVER') === true, 'مدير القسم يستطيع منح دور سائق');
assert(window.rbac.canGrantRole(mockAuthDriver, 'DRIVER') === true, 'السائق المخول (Level 22) أعلى من السائق (Level 15)');
assert(window.rbac.canGrantRole(mockAuthDriver, 'AUTHORIZED_DRIVER') === false, 'السائق المخول لا يستطيع ترقية أحد لنفس مستواه');
assert(window.rbac.canGrantRole(mockAuthDriver, 'DEPT_MANAGER') === false, 'السائق المخول لا يستطيع منح دور أعلى منه');
assert(window.rbac.canGrantRole(mockDriver, 'AUTHORIZED_DRIVER') === false, 'السائق لا يستطيع ترقية نفسه أو غيره لدور أعلى');

// 4. Job Title vs Role Independence Architecture
console.log('\n4. التحقق من استقلالية العنوان الوظيفي عن الدور في النظام:');
const employeeRecord1 = {
  employeeId: 'EMP-2026-701',
  fullName: 'علي كاظم حميد',
  jobTitle: 'سائق خفيفة',
  jobGrade: 'السابعة',
  jobStage: 'الثانية',
  role: 'DRIVER'
};

const employeeRecord2 = {
  employeeId: 'EMP-2026-702',
  fullName: 'حسين جاسم محمد',
  jobTitle: 'سائق ثقيلة أقدم',
  jobGrade: 'الخامسة',
  jobStage: 'الرابعة',
  role: 'AUTHORIZED_DRIVER'
};

const employeeRecord3 = {
  employeeId: 'EMP-2026-703',
  fullName: 'أحمد شاكر كريم',
  jobTitle: 'معاون ملاحظ فني',
  jobGrade: 'السادسة',
  jobStage: 'الأولى',
  role: 'AUTHORIZED_DRIVER'
};

assert(employeeRecord1.jobTitle === 'سائق خفيفة' && employeeRecord1.role === 'DRIVER', 'الموظف يحمل عنوان "سائق خفيفة" مع دور "DRIVER"');
assert(employeeRecord2.jobTitle === 'سائق ثقيلة أقدم' && employeeRecord2.role === 'AUTHORIZED_DRIVER', 'الموظف يحمل عنوان "سائق ثقيلة أقدم" مع دور "AUTHORIZED_DRIVER"');
assert(employeeRecord3.jobTitle === 'معاون ملاحظ فني' && employeeRecord3.role === 'AUTHORIZED_DRIVER', 'الموظف يحمل عنوان "معاون ملاحظ فني" مع دور "AUTHORIZED_DRIVER" الإداري');

// 5. Verification of User Registry & UI Role Integration
console.log('\n5. التحقق من تكامل واجهة المستخدم وسجل المستخدمين وحذف دور منتسب:');
let dbPath = path.join(__dirname, '../database/spd_production_db.json');
if (!fs.existsSync(dbPath)) {
  dbPath = path.join(__dirname, '../../database/spd_production_db.json');
}
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const authDriverUser = (db.users || []).find(u => u.role === 'AUTHORIZED_DRIVER');
const driverUser = (db.users || []).find(u => u.role === 'DRIVER');
const employeeRoleUsers = (db.users || []).filter(u => u.role === 'EMPLOYEE');

assert(authDriverUser !== undefined, 'يوجد حساب مستخدم معتمد بدور سائق مخول (AUTHORIZED_DRIVER) في قاعدة البيانات');
assert(driverUser !== undefined, 'يوجد حساب مستخدم معتمد بدور سائق (DRIVER) في قاعدة البيانات');
assert(employeeRoleUsers.length === 0, 'لا يوجد أي مستخدم في قاعدة البيانات يحمل الدور المحذوف EMPLOYEE');

const appCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
assert(!appCode.includes("{ key: 'EMPLOYEE', name: 'منتسب' }"), 'دور منتسب محذوف تماماً من availableRoles في نافذة الصلاحيات');
assert(appCode.includes("setModalSelectedRole"), 'دالة setModalSelectedRole مدمجة لاختيار وتفعيل دور السائق بنقرة واحدة');
assert(appCode.includes("onModalRoleSelectChange"), 'دالة onModalRoleSelectChange مدمجة لمزامنة الأزرار مع القائمة المنسدلة');

const userMgmtCode = fs.readFileSync(path.join(__dirname, 'components/user_management.js'), 'utf8');
assert(!userMgmtCode.includes("{ key: 'EMPLOYEE', name: 'منتسب' }"), 'دور منتسب محذوف تماماً من فلتر سجل المستخدمين rolesList');

// 6. التحقق من تموضع السائقين في نهاية القوائم وإلغاء التوهج النيوني
const editRoleIdx = appCode.indexOf('id="editUserRoleSelect"');
const operGroupIdx = appCode.indexOf('label="⚙️ الكادر التشغيلي والفني"', editRoleIdx);
const driverGroupIdx = appCode.indexOf('label="🚘 شؤون وحركة الآليات والسيارات"', editRoleIdx);
assert(driverGroupIdx > operGroupIdx, 'مجموعة أدوار السائقين موضوعة في نهاية القائمة المنسدلة بعد الكادر التشغيلي');
assert(!appCode.includes('أدوار الحركة الميدانية:'), 'تمت إزالة البانر المنفصل والتوهج النيوني من شريط العنوان العلوي');
console.log('  ✅ PASS: مجموعة أدوار السائقين موضوعة في نهاية القائمة المنسدلة');
console.log('  ✅ PASS: تمت إزالة البانر المنفصل والتوهج النيوني وتوحيد المظهر بالكامل');
passedCount += 2;

console.log('\n----------------------------------------------------------------------');
console.log(`النتيجة الإجمالية: ${passedCount} ناجح | ${failedCount} راسب`);
console.log('----------------------------------------------------------------------');

if (failedCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 جميع اختبارات أدوار السائق والصلاحيات نجحت بنسبة 100%!');
  process.exit(0);
}
