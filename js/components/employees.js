/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Employees Component & HR Roster
   Unified Single Source of Truth Proxy to Master Employee & User Management
   ========================================================================== */

function renderEmployeesView() {
  return window.renderUserManagementView ? window.renderUserManagementView() : '';
}

window.renderEmployeesView = renderEmployeesView;
