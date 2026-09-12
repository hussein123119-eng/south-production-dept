const fs = require('fs');
const path = require('path');
const base = __dirname;

const localStorageData = {};
global.localStorage = {
  getItem: (k) => localStorageData[k] || null,
  setItem: (k, v) => { localStorageData[k] = v; },
  removeItem: (k) => { delete localStorageData[k]; }
};
const sessionStorageData = {};
global.sessionStorage = {
  getItem: (k) => sessionStorageData[k] || null,
  setItem: (k, v) => { sessionStorageData[k] = v; },
  removeItem: (k) => { delete sessionStorageData[k]; }
};
global.window = global;
global.location = { hostname: 'localhost', href: 'http://localhost:3000' };

let lastModalTitle = '';
let lastModalBody = '';

global.document = {
  documentElement: { setAttribute: () => {}, getAttribute: () => 'light' },
  body: { classList: { toggle: () => {}, remove: () => {}, add: () => {} } },
  getElementById: (id) => ({
    id,
    value: id === 'shiftStartTimeInput' ? '07:30' : id === 'shiftReferenceSelect' ? 'B' : id === 'shiftRefDateInput' ? '2026-09-11' : id === 'shiftDurationSelect' ? '24' : '',
    innerHTML: '',
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false }
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {}
};

const scripts = [
  'store.js', 'auth.js', 'rbac.js', 'utils/exporter.js',
  'components/sidebar.js', 'components/topbar.js', 'components/announcement_bar.js',
  'components/dashboard.js', 'components/dept_management.js', 'components/section_workspace.js', 'components/unit_workspace.js',
  'components/user_management.js', 'app.js'
];

for (const s of scripts) {
  const code = fs.readFileSync(path.join(base, s), 'utf8');
  eval(code);
}

window.app.showModal = (title, body) => {
  lastModalTitle = title;
  lastModalBody = body;
};

console.log('====================================================');
console.log('🧪 TESTING SHIFT HANDOVER ENGINE & 24H CYCLE RULES');
console.log('====================================================\n');

// 1. Check calibrated default shift settings
const settings = window.store.getShiftSettings();
console.log('1. Calibrated shift settings:');
console.log('   startTime:', settings.startTime);
console.log('   referenceShift:', settings.referenceShift);
console.log('   referenceDate:', settings.referenceDate);
console.log('   shiftDurationHours:', settings.shiftDurationHours);

if (settings.startTime !== '07:30') throw new Error('Default startTime must be 07:30');
if (settings.referenceShift !== 'B') throw new Error('Default referenceShift must be B');
if (!settings.referenceDate.startsWith('2026-09-11')) throw new Error('Default referenceDate must be 2026-09-11');
console.log('✓ Test 1 Passed: Calibrated shift settings verified.\n');

// 2. Test mathematical calculation on 2026-09-11 at 07:30:00 (Takeover moment)
const t1 = new Date(2026, 8, 11, 7, 30, 0, 0); // 11/09/2026 07:30:00
const s1 = window.store.getCurrentShiftInfo(t1);
console.log('2. Testing 11/09 at 07:30:00:');
console.log('   Active Shift:', s1.currentShift, '(Expected: B)');
console.log('   Handed over from:', s1.handedOverFrom, '(Expected: A)');
console.log('   Handover to:', s1.handoverTo, '(Expected: C)');
console.log('   Shift Day 1 Hours:', s1.shiftDay1Hours, '(Expected: 16.5)');
console.log('   Shift Day 2 Hours:', s1.shiftDay2Hours, '(Expected: 7.5)');

if (s1.currentShift !== 'B') throw new Error(`Expected active shift B, got ${s1.currentShift}`);
if (s1.handedOverFrom !== 'A') throw new Error(`Expected handedOverFrom A, got ${s1.handedOverFrom}`);
if (s1.handoverTo !== 'C') throw new Error(`Expected handoverTo C, got ${s1.handoverTo}`);
if (s1.shiftDay1Hours !== 16.5) throw new Error('Day 1 hours must be 16.5');
if (s1.shiftDay2Hours !== 7.5) throw new Error('Day 2 hours must be 7.5');
console.log('✓ Test 2 Passed: 11/09 07:30:00 verified.\n');

// 3. Test on 2026-09-11 at 23:59:59 (End of day 11, 16.5 hours completed)
const t2 = new Date(2026, 8, 11, 23, 59, 59, 0);
const s2 = window.store.getCurrentShiftInfo(t2);
console.log('3. Testing 11/09 at 23:59:59:');
console.log('   Active Shift:', s2.currentShift, '(Expected: B)');
if (s2.currentShift !== 'B') throw new Error(`Expected active shift B at end of day 11, got ${s2.currentShift}`);
console.log('✓ Test 3 Passed: 11/09 23:59:59 verified (Still Shift B).\n');

// 4. Test on 2026-09-12 at 05:00:00 (Day 12 during the 7.5h morning continuation)
const t3 = new Date(2026, 8, 12, 5, 0, 0, 0);
const s3 = window.store.getCurrentShiftInfo(t3);
console.log('4. Testing 12/09 at 05:00:00:');
console.log('   Active Shift:', s3.currentShift, '(Expected: B)');
if (s3.currentShift !== 'B') throw new Error(`Expected active shift B at 05:00 AM on day 12, got ${s3.currentShift}`);
console.log('✓ Test 4 Passed: 12/09 05:00:00 verified (Still Shift B taking 7.5h on day 12).\n');

// 5. Test on 2026-09-12 at 07:29:59 (Last second before handover to Shift C)
const t4 = new Date(2026, 8, 12, 7, 29, 59, 0);
const s4 = window.store.getCurrentShiftInfo(t4);
console.log('5. Testing 12/09 at 07:29:59:');
console.log('   Active Shift:', s4.currentShift, '(Expected: B)');
if (s4.currentShift !== 'B') throw new Error(`Expected active shift B right before 07:30, got ${s4.currentShift}`);
console.log('✓ Test 5 Passed: 12/09 07:29:59 verified.\n');

// 6. Test on 2026-09-12 at 07:30:00 (Handover moment to Shift C)
const t5 = new Date(2026, 8, 12, 7, 30, 0, 0);
const s5 = window.store.getCurrentShiftInfo(t5);
console.log('6. Testing 12/09 at 07:30:00 (Handover to Shift C):');
console.log('   Active Shift:', s5.currentShift, '(Expected: C)');
console.log('   Handed over from:', s5.handedOverFrom, '(Expected: B)');
console.log('   Handover to:', s5.handoverTo, '(Expected: D)');

if (s5.currentShift !== 'C') throw new Error(`Expected active shift C at 07:30 on 12/09, got ${s5.currentShift}`);
if (s5.handedOverFrom !== 'B') throw new Error(`Expected handedOverFrom B, got ${s5.handedOverFrom}`);
if (s5.handoverTo !== 'D') throw new Error(`Expected handoverTo D, got ${s5.handoverTo}`);
console.log('✓ Test 6 Passed: 12/09 07:30:00 handover to Shift C verified.\n');

// 7. Test on 2026-09-11 at 07:29:59 (Before Shift B took over, Shift A was active)
const t0 = new Date(2026, 8, 11, 7, 29, 59, 0);
const s0 = window.store.getCurrentShiftInfo(t0);
console.log('7. Testing 11/09 at 07:29:59 (Before Shift B takeover):');
console.log('   Active Shift:', s0.currentShift, '(Expected: A)');
if (s0.currentShift !== 'A') throw new Error(`Expected active shift A before 07:30 on 11/09, got ${s0.currentShift}`);
console.log('✓ Test 7 Passed: 11/09 07:29:59 Shift A verified.\n');

// 8. Test Shift Settings Modal UI elements
console.log('8. Testing Shift Settings Modal Rendering:');
window.auth.login('ahmed.mgr@rumaila.iq', 'M1a2g3r4#2026', 'EMP-2024-001');
window.app.openShiftSettingsModal();

const modalChecks = [
  { name: 'Shift modal container', tag: 'shift-modal-container' },
  { name: 'Shift hero banner', tag: 'shift-hero-banner' },
  { name: 'Shift handover ribbon', tag: 'shift-handover-ribbon' },
  { name: 'Handover previous card', tag: 'استلمت من نوبة' },
  { name: 'Handover next card', tag: 'تسلّم إلى نوبة' },
  { name: '16.5h and 7.5h split mention', tag: '16.5' },
  { name: 'Quick calibration chips', tag: 'shift-calib-btn' },
  { name: 'Start time input', tag: 'shiftStartTimeInput' },
  { name: 'Reference select', tag: 'shiftReferenceSelect' },
  { name: 'Reference date input', tag: 'shiftRefDateInput' },
  { name: 'Live preview container', tag: 'shift-live-preview-container' }
];

modalChecks.forEach(c => {
  const ok = lastModalBody.includes(c.tag);
  console.log(`   ${c.name} (${c.tag}):`, ok ? '✓ Present' : '✗ Missing');
  if (!ok) throw new Error(`Missing UI component: ${c.name}`);
});
console.log('✓ Test 8 Passed: Shift settings modal UI verified.\n');

console.log('====================================================');
console.log('🎉 ALL SHIFT HANDOVER ENGINE TESTS PASSED 100%!');
console.log('====================================================');
process.exit(0);
