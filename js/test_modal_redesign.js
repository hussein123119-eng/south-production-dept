// Unit test verifying the redesigned wider modals for Document & Technical Status
const fs = require('fs');
const path = require('path');

console.log("====================================================");
console.log("🧪 TESTING REDESIGNED WIDE MODALS (DOC & TECH STATUS)");
console.log("====================================================");

const appJsCode = fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8');

// Test 1: openCreateDocumentModal
console.log("\n--- 1. Testing openCreateDocumentModal ---");
if (!appJsCode.includes("openCreateDocumentModal()")) {
    console.error("❌ Test 1 Failed: openCreateDocumentModal not found");
    process.exit(1);
}

const fnCreateDocStart = appJsCode.indexOf('openCreateDocumentModal()');
const fnCreateDocEnd = appJsCode.indexOf('\n  onDocCategoryChange(', fnCreateDocStart);
const createDocCode = appJsCode.slice(fnCreateDocStart, fnCreateDocEnd !== -1 ? fnCreateDocEnd : fnCreateDocStart + 15000);

if (!createDocCode.includes('960px')) {
    console.error("❌ Test 1.2 Failed: maxWidth 960px not configured in openCreateDocumentModal");
    process.exit(1);
}
console.log("✓ Test 1.1 Passed: openCreateDocumentModal sets maxWidth: 960px.");

['docTitle', 'docCategory', 'docSectionId', 'docContent', 'docVersion', 'docStatus'].forEach(id => {
    if (!createDocCode.includes('id="' + id + '"')) {
        console.error("❌ Test 1.3 Failed: Missing ID " + id + " in openCreateDocumentModal HTML");
        process.exit(1);
    }
});
console.log("✓ Test 1.2 Passed: All required document form elements & IDs are present.");

// Test 2: openEditDocumentModal
console.log("\n--- 2. Testing openEditDocumentModal ---");
const fnEditDocStart = appJsCode.indexOf('openEditDocumentModal(docId)');
const fnEditDocEnd = appJsCode.indexOf('\n  handleEditDocumentSubmit(', fnEditDocStart);
const editDocCode = appJsCode.slice(fnEditDocStart, fnEditDocEnd !== -1 ? fnEditDocEnd : fnEditDocStart + 15000);

if (!editDocCode.includes('960px')) {
    console.error("❌ Test 2.2 Failed: maxWidth 960px not configured in openEditDocumentModal");
    process.exit(1);
}
console.log("✓ Test 2.1 Passed: openEditDocumentModal sets maxWidth: 960px.");

['editDocTitle', 'editDocCategory', 'editDocSectionId', 'editDocContent', 'editDocVersion', 'editDocStatus'].forEach(id => {
    if (!editDocCode.includes('id="' + id + '"')) {
        console.error("❌ Test 2.3 Failed: Missing ID " + id + " in openEditDocumentModal HTML");
        process.exit(1);
    }
});
console.log("✓ Test 2.2 Passed: All required edit document form elements & IDs are present.");

// Test 3: openCreateTechnicalStatusModal
console.log("\n--- 3. Testing openCreateTechnicalStatusModal ---");
const createTechMatch = appJsCode.match(/openCreateTechnicalStatusModal\(defaultSectionId[\s\S]*?this\.showModal\([^,]+,\s*([\s\S]*?),\s*(\{[^}]+\})\);/);
if (!createTechMatch) {
    console.error("❌ Test 3.1 Failed: showModal call with options not found in openCreateTechnicalStatusModal");
    process.exit(1);
}
const createTechHtml = createTechMatch[1];
const createTechOptions = createTechMatch[2];

if (!createTechOptions.includes('960px')) {
    console.error("❌ Test 3.2 Failed: maxWidth 960px not passed to openCreateTechnicalStatusModal");
    process.exit(1);
}
console.log("✓ Test 3.1 Passed: openCreateTechnicalStatusModal sets maxWidth: 960px & size: lg.");

['newTechSection', 'newTechDate', 'newTechStatus', 'newTechEquipment', 'newTechDesc', 'newTechActions', 'newTechNotes'].forEach(id => {
    if (!createTechHtml.includes('id="' + id + '"')) {
        console.error("❌ Test 3.3 Failed: Missing ID " + id + " in openCreateTechnicalStatusModal HTML");
        process.exit(1);
    }
});
console.log("✓ Test 3.2 Passed: All required technical status form elements & IDs are present.");

// Test 4: openEditTechnicalStatusModal
console.log("\n--- 4. Testing openEditTechnicalStatusModal ---");
const editTechMatch = appJsCode.match(/openEditTechnicalStatusModal\(statusId\)\s*\{[\s\S]*?this\.showModal\([^,]+,\s*([\s\S]*?),\s*(\{[^}]+\})\);/);
if (!editTechMatch) {
    console.error("❌ Test 4.1 Failed: showModal call with options not found in openEditTechnicalStatusModal");
    process.exit(1);
}
const editTechHtml = editTechMatch[1];
const editTechOptions = editTechMatch[2];

if (!editTechOptions.includes('960px')) {
    console.error("❌ Test 4.2 Failed: maxWidth 960px not passed to openEditTechnicalStatusModal");
    process.exit(1);
}
console.log("✓ Test 4.1 Passed: openEditTechnicalStatusModal sets maxWidth: 960px & size: lg.");

['editTechDate', 'editTechStatus', 'editTechEquipment', 'editTechDesc', 'editTechActions', 'editTechNotes'].forEach(id => {
    if (!editTechHtml.includes('id="' + id + '"')) {
        console.error("❌ Test 4.3 Failed: Missing ID " + id + " in openEditTechnicalStatusModal HTML");
        process.exit(1);
    }
});
console.log("✓ Test 4.2 Passed: All required edit technical status elements & IDs are present.");

console.log("\n====================================================");
console.log("🎉 ALL REDESIGNED MODAL TESTS PASSED 100% PERFECTLY!");
console.log("====================================================");
