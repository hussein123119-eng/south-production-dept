$tests = @(
  "js/test_import_tab_redesign.js",
  "js/test_user_management_search_filter.js",
  "js/test_phone_whatsapp_email_actions.js",
  "js/test_active_shift_pulse.js",
  "js/test_career_and_bulk_thanks.js",
  "js/test_e2e_dept.js",
  "js/test_rbac_runner.js",
  "js/test_registry.js"
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
  Write-Host "====================================================" -ForegroundColor Green
  Write-Host "ALL 8 REGRESSION TEST SUITES PASSED 100% PERFECTLY!" -ForegroundColor Green
  Write-Host "====================================================" -ForegroundColor Green
} else {
  Write-Host "$failed tests failed!" -ForegroundColor Red
  exit 1
}
