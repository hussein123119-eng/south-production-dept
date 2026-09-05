/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Super Admin Enterprise Management Center
   لوحة المؤسس الداخلية والتحكم المركزي المدمج (High-Availability Control Center)
   جميع الأرقام باللغة الإنجليزية: 1, 2, 3, 2026 | خالي تماماً من المصطلحات غير العربية
   ========================================================================== */

function renderSuperAdminView() {
  const user = window.auth.getCurrentUser();
  if (!user || user.role !== 'SUPER_ADMIN') {
    return `
      <div class="card" style="text-align: center; color: var(--md-sys-color-error); padding: 3rem; margin: 2rem auto; max-width: 600px; border-radius: 16px;">
        <h2>⛔ الوصول محظور</h2>
        <p style="margin-top: 0.5rem; color: var(--md-sys-color-outline);">هذه اللوحة مخصصة حصرياً للمؤسس العام للإدارة والتحكم المركزي.</p>
        <button class="btn btn-primary" style="margin-top: 1.5rem;" onclick="window.app.navigate('dashboard')">العودة للرئيسية</button>
      </div>
    `;
  }

  const db = window.store.getDb();
  const departments = db.departments || [];
  const approvedIds = db.approvedEmployeeIds || [];
  const users = db.users || [];
  const featureFlags = window.store.getFeatureFlags ? window.store.getFeatureFlags() : {};
  const activeFlagsCount = Object.values(featureFlags).filter(Boolean).length;

  return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 2rem;">
      <!-- شريط الهوية السيادية والتحكم الاحتياطي المدمج -->
      <div class="card" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)); border: 1.5px solid rgba(245, 158, 11, 0.4); border-radius: 16px; padding: 1.5rem; color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.35);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 1rem;">
            <div style="width: 52px; height: 52px; border-radius: 14px; background: rgba(245, 158, 11, 0.2); border: 1.5px solid #f59e0b; display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
              🛡️
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                <h2 style="font-size: 1.5rem; font-weight: 800; color: #ffffff; margin: 0;">لوحة المؤسس الداخلية والتحكم المركزي</h2>
                <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 800;">جاهز ومدمج داخلياً</span>
              </div>
              <p style="font-size: 0.85rem; color: #94a3b8; margin: 0.35rem 0 0 0; line-height: 1.5;">
                غرفة القيادة والتحكم المدمجة في المنظومة — تضمن استمرار السيطرة الشاملة وإدارة الأقسام والملاكات في كافة الأوقات.
              </p>
            </div>
          </div>

          <!-- أزرار الإجراءات السيادية السريعة -->
          <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
            <a href="founder.html" target="_blank" class="btn" style="background: rgba(0, 223, 216, 0.15); border: 1.5px solid #00dfd8; color: #00dfd8; font-weight: 800; white-space: nowrap;">
              👑 فتح بوابة المؤسس السيادية (المستقلة) ↗
            </a>
            <button class="btn btn-outline" onclick="window.app.exportDatabaseBackup()" style="white-space: nowrap; border-color: rgba(255,255,255,0.25); color: #ffffff;">
              💾 نسخة احتياطية (JSON)
            </button>
            <button class="btn btn-outline" onclick="window.app.openRestoreDatabaseModal()" style="white-space: nowrap; border-color: rgba(255,255,255,0.25); color: #ffffff;">
              📤 استعادة نسخة احتياطية
            </button>
          </div>
        </div>
      </div>

      <!-- 4 بطاقات إحصائية للمؤسس -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
        <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); font-weight: 700;">إجمالي حسابات المستخدمين</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--md-sys-color-primary); margin-top: 0.2rem;">${users.length}</div>
          </div>
          <div style="font-size: 2rem; opacity: 0.8;">👥</div>
        </div>

        <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); font-weight: 700;">الأقسام الإنتاجية المسجلة</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #00dfd8; margin-top: 0.2rem;">${departments.length}</div>
          </div>
          <div style="font-size: 2rem; opacity: 0.8;">🏢</div>
        </div>

        <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); font-weight: 700;">الأرقام الوظيفية المعتمدة (HR)</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b; margin-top: 0.2rem;">${approvedIds.length}</div>
          </div>
          <div style="font-size: 2rem; opacity: 0.8;">📋</div>
        </div>

        <div class="card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 0.82rem; color: var(--md-sys-color-outline); font-weight: 700;">إعدادات وميزات المنظومة النشطة</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #10b981; margin-top: 0.2rem;">${activeFlagsCount} / ${Object.keys(featureFlags).length}</div>
          </div>
          <div style="font-size: 2rem; opacity: 0.8;">⚙️</div>
        </div>
      </div>

      <!-- Feature Flags & System Settings -->
      <div class="card" style="border-top: 4px solid #f59e0b;">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 class="card-title">⚙️ نظام التحكم بالميزات وإعدادات المؤسسة (Feature Flags & Settings)</h3>
            <p style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin: 0.2rem 0 0 0;">التحكم الفوري في إتاحة ميزات التسجيل، التدقيق الأمني، والعمليات الحساسة.</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; padding-top: 0.5rem;">
          ${Object.entries(featureFlags).map(([flag, val]) => `
            <div style="padding: 1rem; border: 1px solid var(--md-sys-color-surface-variant); border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.02);">
              <div>
                <strong style="display: block; font-size: 0.9rem;">${flag}</strong>
                <div style="font-size: 0.75rem; color: ${val ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)'}; margin-top: 0.2rem;">
                  ${val ? '✅ مفعلة وتعمل' : '⏸️ معطلة حالياً'}
                </div>
              </div>
              <button class="btn btn-sm ${val ? 'btn-success' : 'btn-outline'}" onclick="window.app.toggleFeatureFlag('${flag}', ${!val})" style="white-space: nowrap;">
                ${val ? '✅ مفعل' : '⏸️ إيقاف'}
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Multi-Tenant Departments -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h3 class="card-title">🏢 الأقسام الإنتاجية المسجلة في المنظومة (Multi-Tenant Departments)</h3>
            <p style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin: 0.2rem 0 0 0;">إدارة الأقسام المستقلة وبيئات العمل المنفصلة.</p>
          </div>
          <button class="btn btn-sm btn-primary" onclick="window.app.openCreateDepartmentModal()" style="white-space: nowrap;">
            + تأسيس قسم إنتاجي جديد
          </button>
        </div>
        <div class="table-container" style="overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>معرف القسم</th>
                <th>اسم القسم الرسمي</th>
                <th>الرمز الكودي</th>
                <th>الشعار</th>
                <th>مدير القسم الحالي</th>
                <th>حالة القسم</th>
                <th>تاريخ التأسيس</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${departments.length === 0 ? `<tr><td colspan="8" style="text-align:center; padding: 2rem; color: var(--md-sys-color-outline);">لا توجد أقسام مسجلة</td></tr>` : departments.map(d => {
                const mgr = d.managerId ? window.store.getUserById(d.managerId) : null;
                const mgrName = mgr ? mgr.fullName : (d.managerName || '<span style="color: var(--md-sys-color-warning);">شاغر</span>');
                const createdDate = d.createdAt ? new Date(d.createdAt).toISOString().slice(0, 10) : '2026-01-01';
                return `
                  <tr>
                    <td><code style="font-weight: 700; color: var(--md-sys-color-primary);">${d.id}</code></td>
                    <td><strong>${d.name}</strong></td>
                    <td><span class="badge badge-info">${d.code}</span></td>
                    <td><span style="font-weight: 900; background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 2px 8px; border-radius: 4px;">${d.logoText || 'ق'}</span></td>
                    <td>${mgrName}</td>
                    <td><span class="badge ${d.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}">${d.status === 'ACTIVE' ? 'نشط وفعال' : 'معطل'}</span></td>
                    <td style="direction: ltr; text-align: right; font-family: monospace;">${createdDate}</td>
                    <td>
                      <button class="btn btn-sm btn-outline" onclick="window.app.switchDepartmentSession('${d.id}')" style="white-space: nowrap;">دخول كمدير</button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Master Approved Employee IDs Management -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h3 class="card-title">📋 دليل الأرقام الوظيفية المعتمدة مسبقاً (HR Master Registry)</h3>
            <p style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin: 0.2rem 0 0 0;">السجل الرسمي للملاكات المصرح لها بالتسجيل في المنظومة (${approvedIds.length} منتسب).</p>
          </div>
          <button class="btn btn-sm btn-primary" onclick="window.app.openAddApprovedEmployeeModal()" style="white-space: nowrap;">
            + إضافة رقم وظيفي معتمد
          </button>
        </div>
        <div class="table-container" style="max-height: 380px; overflow-y: auto; overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>الرقم الوظيفي</th>
                <th>الاسم المعتمد في السجل</th>
                <th>القسم التابع</th>
                <th>اسم الأم</th>
                <th>رقم البطاقة الموحدة</th>
                <th>الدرجة والمرحلة</th>
              </tr>
            </thead>
            <tbody>
              ${approvedIds.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding: 2rem; color: var(--md-sys-color-outline);">لا توجد أرقام وظيفية مسجلة</td></tr>` : approvedIds.map(e => `
                <tr>
                  <td><strong style="font-family: monospace; color: var(--md-sys-color-primary); font-size: 0.95rem;">${e.id}</strong></td>
                  <td><strong>${e.name}</strong></td>
                  <td>${e.departmentId || 'south-production-dept'}</td>
                  <td>${e.motherName || '-'}</td>
                  <td style="direction: ltr; text-align: right; font-family: monospace;">${e.unifiedCardNumber || '-'}</td>
                  <td>${e.jobGrade || '-'} / ${e.jobStage || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Cross-Department Users Overview -->
      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h3 class="card-title">👥 كافة المستخدمين والحسابات عبر كافة الأقسام (${users.length})</h3>
            <p style="font-size: 0.82rem; color: var(--md-sys-color-outline); margin: 0.2rem 0 0 0;">سجل الحسابات المعتمدة ودرجات الصلاحية الإدارية.</p>
          </div>
        </div>
        <div class="table-container" style="max-height: 380px; overflow-y: auto; overflow-x: auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>الرقم الوظيفي</th>
                <th>الاسم الكامل</th>
                <th>البريد الإلكتروني</th>
                <th>القسم التابع</th>
                <th>مستوى الصلاحية</th>
                <th>الحالة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${users.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--md-sys-color-outline);">لا توجد حسابات مسجلة</td></tr>` : users.map(u => `
                <tr>
                  <td><strong style="font-family: monospace; color: var(--md-sys-color-primary);">${u.employeeId || '-'}</strong></td>
                  <td><strong>${u.fullName || '-'}</strong></td>
                  <td style="direction: ltr; text-align: right; font-family: monospace;">${u.email || '-'}</td>
                  <td>${window.store.getDepartmentById(u.departmentId)?.name || u.departmentId}</td>
                  <td><span class="badge ${window.rbac.getRoleInfo(u.role).badgeClass}">${u.role}</span></td>
                  <td><span class="badge ${u.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}">${u.status}</span></td>
                  <td>
                    <button class="btn btn-sm btn-outline" onclick="window.app.openEditUserRoleModal('${u.id}')" style="white-space: nowrap;">تعديل الصلاحية</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.renderSuperAdminView = renderSuperAdminView;