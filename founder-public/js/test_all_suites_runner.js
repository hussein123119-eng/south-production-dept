const { execSync } = require('child_process');

const tests = [
  'js/test_import_tab_redesign.js',
  'js/test_user_management_search_filter.js',
  'js/test_phone_whatsapp_email_actions.js',
  'js/test_active_shift_pulse.js',
  'js/test_career_and_bulk_thanks.js',
  'js/test_e2e_dept.js',
  'js/test_rbac_runner.js',
  'js/test_registry.js'
];

let allPassed = true;
console.log('🚀 RUNNING ALL SYSTEM TEST SUITES (GOLDEN CHARTER VERIFICATION)...\n');

for (const test of tests) {
  try {
    const out = execSync(`node ${test}`, { encoding: 'utf8' });
    console.log(`✅ PASSED: ${test}`);
  } catch (err) {
    console.error(`❌ FAILED: ${test}`);
    console.error(err.stdout || err.message);
    allPassed = false;
  }
}

console.log('\n====================================================');
if (allPassed) {
  console.log('🎉🎉🎉 100% OF ALL SYSTEM TEST SUITES PASSED FLAWLESSLY! 🎉🎉🎉');
} else {
  console.log('❌ SOME TESTS FAILED. PLEASE FIX BEFORE PROCEEDING.');
  process.exit(1);
}
console.log('====================================================');
