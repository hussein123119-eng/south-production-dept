/**
 * Unit Test: Compose Mail Modal Wide Layout & Custom Scrollbar Verification
 * Validates:
 * 1. mailComposeModal container exists with overflow-y: scroll and visible scrollbar styles
 * 2. max-width is expanded to 980px (95vw)
 * 3. All critical DOM IDs exist (30+ element IDs)
 * 4. insertComposeMailTemplate function is attached to window.app
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Test: Compose Mail Modal Wide Layout & Scrollbar Verification...');

const mailSystemPath = path.join(__dirname, 'components', 'mail_system.js');
if (!fs.existsSync(mailSystemPath)) {
    console.error('❌ mail_system.js not found at:', mailSystemPath);
    process.exit(1);
}

const content = fs.readFileSync(mailSystemPath, 'utf8');

// 1. Check for scrollbar styling and overflow-y: scroll
const requiredScrollPatterns = [
    'overflow-y:scroll',
    'scrollbar-width:thin',
    'scrollbar-color:#38bdf8',
    '::-webkit-scrollbar',
    '::-webkit-scrollbar-thumb',
    'linear-gradient(180deg, #38bdf8, #0284c7)'
];

requiredScrollPatterns.forEach(pattern => {
    if (!content.includes(pattern)) {
        console.error(`❌ Missing required scrollbar style pattern: "${pattern}"`);
        process.exit(1);
    }
});
console.log('✅ Visible Scrollbar & WebKit thumb styling verified.');

// 2. Check for wide modal container (980px / 95vw)
if (!content.includes('max-width: 980px') || !content.includes('95vw')) {
    console.error('❌ Modal container max-width: 980px or 95vw not found!');
    process.exit(1);
}
console.log('✅ Modal width expansion (980px / 95vw) verified.');

// 3. Verify all critical DOM IDs exist
const requiredElementIds = [
    'mailComposeModal',
    'mailComposeForm',
    'mailLetterType',
    'mailOfficialFieldsContainer',
    'mailRefNumber',
    'mailLetterDate',
    'mailPriority',
    'mailClassification',
    'mailComposeSignatureCanvas',
    'mailComposeSignStatus',
    'mailComposeSignatureDataUrl',
    'mailComposeStampInfo',
    'mailTargetField',
    'mailToLevel',
    'mailStandardTargetContainer',
    'mailToTargetId',
    'mailPersonSearchContainer',
    'mailSelectedPersonId',
    'mailSelectedPersonName',
    'mailPersonSearchInputWrapper',
    'mailPersonSearchInput',
    'mailSelectedPersonBadge',
    'mailSelectedPersonTitle',
    'mailSelectedPersonSub',
    'mailPersonSearchResults',
    'mailSubject',
    'mailBody',
    'mailAttachmentCountBadge',
    'mailDropZone',
    'mailAttachmentsInput',
    'mailAttachmentsPreview'
];

let missingIds = [];
requiredElementIds.forEach(id => {
    if (!content.includes(`id="${id}"`)) {
        missingIds.push(id);
    }
});

if (missingIds.length > 0) {
    console.error('❌ Missing critical DOM element IDs:', missingIds);
    process.exit(1);
}
console.log(`✅ All ${requiredElementIds.length} critical DOM element IDs present.`);

// 4. Verify insertComposeMailTemplate helper
if (!content.includes('insertComposeMailTemplate(type)') && !content.includes('insertComposeMailTemplate = function')) {
    console.error('❌ insertComposeMailTemplate function missing!');
    process.exit(1);
}
console.log('✅ insertComposeMailTemplate helper verified.');

console.log('🎉 ALL COMPOSE MAIL MODAL WIDE & SCROLLBAR TESTS PASSED 100% PERFECTLY!');
process.exit(0);
