/**
 * Test Suite: Test Accounts Login Verification (علاء حسن عبادان & فؤاد ماجد شمخي)
 * Verifies that the test accounts can successfully log in using either their Employee ID (1001, 1002)
 * or Email with password containing 'test' (test123456).
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Starting Test Accounts Login Verification ---');

// Mock browser environment
global.window = {
  location: { hostname: 'south-prod-rumaila.web.app', protocol: 'https:' },
  dispatchEvent: () => {}
};
global.localStorage = {
  data: {},
  getItem: function(k) { return this.data[k] || null; },
  setItem: function(k, v) { this.data[k] = v; },
  removeItem: function(k) { delete this.data[k]; }
};
global.sessionStorage = {
  data: {},
  getItem: function(k) { return this.data[k] || null; },
  setItem: function(k, v) { this.data[k] = v; },
  removeItem: function(k) { delete this.data[k]; }
};

// Load Store and Auth
eval(fs.readFileSync(path.join(__dirname, 'store.js'), 'utf8'));
eval(fs.readFileSync(path.join(__dirname, 'auth.js'), 'utf8'));

// 1. Verify 1001 (علاء حسن عبادان - مدير قسم) Login by Employee ID
const res1 = window.auth.login('1001', 'test123456');
assert.ok(res1.success, 'Login with Employee ID 1001 must succeed: ' + (res1.error || ''));
assert.strictEqual(res1.user.employeeId, '1001');
assert.strictEqual(res1.user.fullName, 'علاء حسن عبادان');
assert.strictEqual(res1.user.role, 'DEPT_MANAGER');
assert.strictEqual(res1.user.jobTitle, 'رئيس مهندسين أقدم');
console.log('✓ 1001 (علاء حسن عبادان) logged in successfully via Employee ID.');

// 2. Verify 1001 Login by Email
const res1Email = window.auth.login('alaa.abdan@gmail.com', 'test123456');
assert.ok(res1Email.success, 'Login with Email alaa.abdan@gmail.com must succeed');
assert.strictEqual(res1Email.user.fullName, 'علاء حسن عبادان');
console.log('✓ 1001 (علاء حسن عبادان) logged in successfully via Email.');

// 3. Verify 1002 (فؤاد ماجد شمخي - وكيل مدير قسم) Login by Employee ID
const res2 = window.auth.login('1002', 'test123456');
assert.ok(res2.success, 'Login with Employee ID 1002 must succeed: ' + (res2.error || ''));
assert.strictEqual(res2.user.employeeId, '1002');
assert.strictEqual(res2.user.fullName, 'فؤاد ماجد شمخي');
assert.strictEqual(res2.user.role, 'DEPT_MANAGER');
assert.strictEqual(res2.user.jobTitle, 'رئيس مهندسين أقدم');
console.log('✓ 1002 (فؤاد ماجد شمخي) logged in successfully via Employee ID.');

// 4. Verify 1002 Login by Email
const res2Email = window.auth.login('fouad.shamkhi@gmail.com', 'test123456');
assert.ok(res2Email.success, 'Login with Email fouad.shamkhi@gmail.com must succeed');
assert.strictEqual(res2Email.user.fullName, 'فؤاد ماجد شمخي');
console.log('✓ 1002 (فؤاد ماجد شمخي) logged in successfully via Email.');

console.log('=====================================================');
console.log('ALL TEST ACCOUNTS VERIFICATIONS PASSED 100% PERFECTLY!');
console.log('=====================================================');
