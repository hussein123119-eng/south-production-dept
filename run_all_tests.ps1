$tests = @(
  "js/test_import_tab_redesign.js",
  "js/test_user_management_search_filter.js",
  "js/test_phone_whatsapp_email_actions.js",
  "js/test_active_shift_pulse.js",
  "js/test_career_and_bulk_thanks.js",
  "js/test_e2e_dept.js",
  "js/test_rbac_runner.js",
  "js/test_registry.js",
  "js/test_mail_system.js",
  "js/test_tab_order.js",
  "js/test_custom_export_scoping.js",
  "js/test_space_search_preservation.js",
  "js/test_mail_recipient_selection.js",
  "js/test_modal_redesign.js",
  "js/test_interview_modal_glass.js",
  "js/test_compose_mail_modal_wide.js",
  "js/test_section_staff_data_entry.js",
  "js/test_driver_roles_rbac.js",
  "js/test_shift_handover_engine.js",
  "js/test_delegation_and_auto_roles.js",
  "js/test_civil_service_job_titles.js",
  "js/test_document_archive.js",
  "js/test_mail_attachment_icons.js",
  "js/test_founder_theme_modes.js"
)

$failed = 0
foreach ($t in $tests) {
  Write-Host "Running $t..." -ForegroundColor Cyan
  node $t
  if ($LASTEXITCODE -ne 0) {
    Write-Host "FAILED: $t" -ForegroundColor Red
    $failed++
  } else {
    Write-Host "PASSED: $t" -ForegroundColor Green
  }
}

if ($failed -eq 0) {
  Write-Host "=====================================================" -ForegroundColor Green
  Write-Host "ALL 24 REGRESSION TEST SUITES PASSED 100% PERFECTLY!" -ForegroundColor Green
  Write-Host "=====================================================" -ForegroundColor Green
} else {
  Write-Host "$failed tests failed!" -ForegroundColor Red
  exit 1
}
