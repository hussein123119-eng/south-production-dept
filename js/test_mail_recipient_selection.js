// Unit test for mail recipient selection & search
const fs = require('fs');
const path = require('path');

console.log("====================================================");
console.log("🧪 TESTING MAIL RECIPIENT SELECTION & TOKEN SEARCH");
console.log("====================================================");

// Mock DOM
global.window = global;
global.document = {
    addEventListener: () => {},
    getElementById: (id) => {
        if (!global.mockElements) global.mockElements = {};
        if (!global.mockElements[id]) {
            global.mockElements[id] = {
                value: '',
                style: {},
                innerHTML: '',
                focus: () => {}
            };
        }
        return global.mockElements[id];
    }
};

const mockDb = {
    users: [
        { id: 'usr-founder', fullName: 'المؤسس العام للمنظومة', jobTitle: 'المؤسس العام', department: 'القسم' },
        { id: 'usr-dept-1', fullName: 'م. أحمد عبد الحسين', jobTitle: 'مدير قسم شؤون الإنتاج الجنوبي', department: 'قسم شؤون الإنتاج الجنوبي' },
        { id: 'usr-dept-2', fullName: 'م. حيدر جاسم', jobTitle: 'معاون مدير القسم', department: 'قسم شؤون الإنتاج الجنوبي' }
    ]
};

window.store = {
    getDb: () => mockDb
};
window.app = {};

// Load mail_system.js
require('./components/mail_system.js');

if (window.app.registerMailAppMethods) {
    window.app.registerMailAppMethods();
}

// 1. Test searchMailPerson with tokenized multi-word query
console.log("\n--- 1. Testing searchMailPerson with multi-word search ---");
window.app.searchMailPerson('أحمد عبد');
const resultsBox = document.getElementById('mailPersonSearchResults');
console.log('Results HTML generated length:', resultsBox.innerHTML.length);

if (!resultsBox.innerHTML.includes('م. أحمد عبد الحسين')) {
    console.error("❌ Test 1.1 Failed: Result did not include 'م. أحمد عبد الحسين'");
    process.exit(1);
}
console.log("✓ Test 1.1 Passed: Multi-word search successfully matched 'م. أحمد عبد الحسين'.");

// 2. Test button and onclick syntax safety (no JSON.stringify quote collisions)
console.log("\n--- 2. Testing onclick attribute safety and button structure ---");
if (resultsBox.innerHTML.includes('JSON.stringify') || resultsBox.innerHTML.includes('""')) {
    console.error("❌ Test 2.1 Failed: Suspicious quote collisions found in results HTML.");
    process.exit(1);
}

if (!resultsBox.innerHTML.includes('mail-person-select-btn')) {
    console.error("❌ Test 2.2 Failed: Button class 'mail-person-select-btn' not found.");
    process.exit(1);
}

if (!resultsBox.innerHTML.includes("onclick=\"window.app.selectMailPerson('usr-dept-1')\"")) {
    console.error("❌ Test 2.3 Failed: onclick does not pass safe user id.");
    process.exit(1);
}
console.log("✓ Test 2 Passed: Safe onclick and button structure verified.");

// 3. Test selectMailPerson execution
console.log("\n--- 3. Testing selectMailPerson execution ---");
window.app.selectMailPerson('usr-dept-1');

const targetIdInput = document.getElementById('mailTargetPersonId');
const targetNameInput = document.getElementById('mailTargetPersonName');
const displayBox = document.getElementById('mailSelectedPersonDisplay');

if (targetIdInput.value !== 'usr-dept-1') {
    console.error("❌ Test 3.1 Failed: targetIdInput was not set to usr-dept-1, got:", targetIdInput.value);
    process.exit(1);
}
if (!targetNameInput.value.includes('أحمد عبد الحسين')) {
    console.error("❌ Test 3.2 Failed: targetNameInput was not set correctly, got:", targetNameInput.value);
    process.exit(1);
}
if (resultsBox.style.display !== 'none') {
    console.error("❌ Test 3.3 Failed: resultsBox was not hidden after selection.");
    process.exit(1);
}
console.log("✓ Test 3 Passed: selectMailPerson executed cleanly and populated inputs.");

console.log("\n====================================================");
console.log("🎉 ALL MAIL RECIPIENT TESTS PASSED 100% PERFECTLY!");
console.log("====================================================");
process.exit(0);
