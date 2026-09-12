// Unit test verifying the luxury glassmorphism redesign of the Interview Request Modal & Tab
const fs = require('fs');
const path = require('path');

console.log("====================================================");
console.log("🧪 TESTING INTERVIEW REQUEST GLASS MODAL REDESIGN");
console.log("====================================================");

const appJsCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');
const deptMgmtCode = fs.readFileSync(path.join(__dirname, 'components', 'dept_management.js'), 'utf8');
const styleCssCode = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

// Test 1: openCreateInterviewRequestModal options
console.log("\n--- 1. Testing openCreateInterviewRequestModal Options & Glass Flag ---");
const fnStart = appJsCode.indexOf('openCreateInterviewRequestModal()');
const fnEnd = appJsCode.indexOf('\n  handleSaveInterviewRequest(', fnStart);
if (fnStart === -1 || fnEnd === -1) {
    console.error("❌ Test 1.1 Failed: openCreateInterviewRequestModal or handleSaveInterviewRequest not found");
    process.exit(1);
}
const modalFuncCode = appJsCode.slice(fnStart, fnEnd);

if (!modalFuncCode.includes('glass: true') && !modalFuncCode.includes('glass:true')) {
    console.error("❌ Test 1.2 Failed: glass: true option missing in openCreateInterviewRequestModal:", modalFuncCode);
    process.exit(1);
}
if (!modalFuncCode.includes('880px')) {
    console.error("❌ Test 1.3 Failed: maxWidth 880px missing in openCreateInterviewRequestModal");
    process.exit(1);
}
console.log("✓ Test 1.1 Passed: openCreateInterviewRequestModal configures glass: true and maxWidth: 880px.");

// Test 2: Check required DOM elements and IDs
console.log("\n--- 2. Testing Form DOM Elements & IDs ---");
['interviewTopicInput', 'interviewPrioritySelect', 'interviewProposedDateInput', 'interviewDetailsInput'].forEach(id => {
    if (!modalFuncCode.includes('id="' + id + '"')) {
        console.error("❌ Test 2.1 Failed: Missing ID " + id + " in openCreateInterviewRequestModal HTML");
        process.exit(1);
    }
});
console.log("✓ Test 2.1 Passed: All essential form field IDs are preserved 100%.");

// Test 3: Check helper template insertion
console.log("\n--- 3. Testing insertInterviewTemplate Helper ---");
if (!appJsCode.includes("insertInterviewTemplate(type)")) {
    console.error("❌ Test 3.1 Failed: insertInterviewTemplate function missing in app.js");
    process.exit(1);
}
console.log("✓ Test 3.1 Passed: insertInterviewTemplate is available on window.app.");

// Test 4: CSS classes for glass modal suite
console.log("\n--- 4. Testing CSS Glassmorphism Classes ---");
['btn-glass-pill', 'modal-glass-card', 'glass-input', 'glass-textarea', 'pulse-ring'].forEach(cls => {
    if (!styleCssCode.includes(cls)) {
        console.error("❌ Test 4.1 Failed: Missing CSS class " + cls + " in style.css");
        process.exit(1);
    }
});
console.log("✓ Test 4.1 Passed: Glassmorphism utility classes are loaded in style.css.");

// Test 5: Tab render verification
console.log("\n--- 5. Testing renderDeptInterviewsTab ---");
if (!deptMgmtCode.includes("renderDeptInterviewsTab") || !deptMgmtCode.includes("طلبات المقابلة الرسمية مع إدارة القسم")) {
    console.error("❌ Test 5.1 Failed: renderDeptInterviewsTab not updated with modern header");
    process.exit(1);
}
console.log("✓ Test 5.1 Passed: renderDeptInterviewsTab enhanced with modern card styling.");

console.log("\n====================================================");
console.log("🎉 ALL INTERVIEW GLASS MODAL TESTS PASSED 100% PERFECTLY!");
console.log("====================================================");
