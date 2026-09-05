/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Profile Component
   ========================================================================== */

function renderProfileView() {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  
  const hrRecord = window.store.getApprovedEmployeeIds(user.departmentId).find(e => e.id === user.employeeId);
  const section = db.sections.find(s => s.id === user.sectionId);
  const unit = db.units.find(u => u.id === user.unitId);
  const station = db.stations.find(st => st.id === user.stationId);

  const empDocs = (db.employeeDocuments || []).filter(d => d.userId === user.id);

  return `
    <div style="max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem;">
      <div class="card">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--md-sys-color-surface-variant);">
          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--md-sys-color-primary), #004f4f); color: white; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; font-weight: 800; box-shadow: var(--shadow-2);">
              ${user.fullName ? user.fullName.charAt(0) : 'م'}
            </div>
            <div>
              <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-on-surface);">${user.fullName}</h2>
              <p style="color: var(--md-sys-color-outline); font-size: 0.95rem; margin-bottom: 0.5rem;">
                ${user.jobTitle} - ${section ? section.name : (unit ? unit.name : 'الإدارة المركزية')}
                ${station ? ` (${station.name})` : ''}
              </p>
              <span class="badge ${window.rbac.getRoleInfo(user.role).badgeClass}">${window.rbac.getRoleInfo(user.role).name}</span>
            </div>
          </div>
          <button class="btn btn-primary" onclick="window.app.openSubmitRequestModal()">
            📝 طلب تعديل بيانات رسمية
          </button>
        </div>

        <div style="margin-top: 1.5rem;">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--md-sys-color-primary);">📌 البيانات الوظيفية والاتصال</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الرقم الوظيفي (ID)</label>
              <div style="font-weight: 700; font-size: 1rem;">${user.employeeId}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">البريد الإلكتروني الرسمي</label>
              <div style="font-weight: 600;">${user.email}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">رقم الهاتف</label>
              <div style="font-weight: 600;">${user.phone || 'غير مسجل'}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الدرجة / المرحلة</label>
              <div style="font-weight: 600;">${user.jobGrade || '-'} / ${user.jobStage || '-'}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">نوع الدوام والنوبة</label>
              <div style="font-weight: 600;">
                ${user.workShift === 'مناوب' 
                  ? `<span class="badge badge-info" style="font-weight: 800;">مناوب (${user.assignedShift ? 'نوبة ' + user.assignedShift : (user.shift ? 'نوبة ' + user.shift : 'A')})</span>` 
                  : '<span class="badge badge-secondary">صباحي (رسمي)</span>'}
              </div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">تاريخ التعيين الرسمي</label>
              <div style="font-weight: 600;">${user.hireDate || '-'}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">تاريخ المباشرة بالقسم</label>
              <div style="font-weight: 600;">${user.deptJoinDate || '-'}</div>
            </div>
          </div>
        </div>

        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--md-sys-color-surface-variant);">
          <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--md-sys-color-primary);">📜 السجل المدني والمستمسكات الشخصية</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">اسم الأب والجد</label>
              <div style="font-weight: 600;">${user.fatherName || '-'} ${user.grandfatherName || ''}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">اسم الأم الثلاثي</label>
              <div style="font-weight: 600;">${user.motherName || '-'}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">رقم البطاقة الوطنية الموحدة</label>
              <div style="font-weight: 600;">${user.unifiedCardNumber || '-'}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">رقم جواز السفر</label>
              <div style="font-weight: 600;">${user.passportNumber || '-'}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">الشهادة والاختصاص</label>
              <div style="font-weight: 600;">${user.degree || '-'} - ${user.specialization || '-'}</div>
            </div>
            <div>
              <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">جواز السلامة والصحة المهنية</label>
              <div style="font-weight: 600;">${user.safetyPassportNumber || '-'}</div>
            </div>
          </div>
        </div>

        ${(() => {
          const allDyn = window.store.getDynamicEmployeeFields ? window.store.getDynamicEmployeeFields(user.departmentId) : [];
          const userFields = (allDyn || []).filter(f => f.isActive !== false && (f.scope === 'GLOBAL' || (f.scope === 'SECTION' && (!f.scopeId || f.scopeId === user.sectionId))));
          if (!userFields.length) return '';
          return `
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--md-sys-color-surface-variant);">
              <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 1.25rem; color: var(--md-sys-color-primary);">🧩 المعلومات والحقول الإضافية المطلوبة</h3>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem;">
                ${userFields.map(f => {
                  const val = (user.dynamicValues && user.dynamicValues[f.key] !== undefined) 
                    ? user.dynamicValues[f.key] 
                    : ((user.customFields && user.customFields[f.key] !== undefined) 
                      ? user.customFields[f.key] 
                      : (user[f.key] || 'غير محدد'));
                  return `
                    <div>
                      <label style="display: block; font-size: 0.8rem; color: var(--md-sys-color-outline); margin-bottom: 4px;">
                        ${f.name} <span style="font-size: 0.7rem; color: var(--md-sys-color-primary);">(${f.scope === 'GLOBAL' ? 'عام' : 'الشعبة'})</span>
                      </label>
                      <div style="font-weight: 600; color: ${val === 'غير محدد' ? 'var(--md-sys-color-outline)' : 'var(--md-sys-color-on-surface)'};">${val}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `;
        })()}
      </div>

      <!-- Employee Uploaded Documents List -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">📁 ملف المستمسكات المرفوعة والموثقة</h3>
          <button class="btn btn-sm btn-outline" onclick="window.app.openUploadEmployeeDocModal()">+ رفع مستمسك جديد</button>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>نوع المستمسك</th>
                <th>اسم الملف</th>
                <th>تاريخ التحديث</th>
                <th>حالة التدقيق</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${empDocs.map(d => `
                <tr>
                  <td><strong>${d.type}</strong></td>
                  <td>${d.fileName}</td>
                  <td>${new Date(d.updatedAt).toLocaleDateString('ar-IQ')}</td>
                  <td>
                    <span class="badge ${d.status === 'APPROVED' ? 'badge-success' : 'badge-warning'}">
                      ${d.status === 'APPROVED' ? 'معتمد ومطابق' : 'قيد التدقيق'}
                    </span>
                  </td>
                  <td>
                    <button class="btn-action-view" onclick="alert('جاري معاينة الوثيقة المعتمدة: ${d.fileName}')" title="معاينة الوثيقة المعتمدة">معاينة</button>
                  </td>
                </tr>
              `).join('')}
              ${empDocs.length === 0 ? '<tr><td colspan="5" style="text-align: center; padding: 1.5rem; color: var(--md-sys-color-outline);">لا توجد ملفات مرفوعة حالياً. يرجى رفع نسخة من البطاقة الموحدة والشهادة الدراسية.</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>

      <!-- بطاقة أمان الحساب وتعيين كلمة مرور دائمة -->
      <div class="card" style="border: 1px solid rgba(0, 106, 106, 0.2);">
        <div class="card-header" style="border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem;">
          <h3 class="card-title" style="color: var(--md-sys-color-primary); font-weight: 800;">🔐 أمان الحساب وتعيين كلمة مرور دائمة</h3>
        </div>
        <p style="font-size: 0.86rem; color: var(--md-sys-color-outline); margin: 0.75rem 0 1rem 0; line-height: 1.5;">
          يمكنك في أي وقت تغيير كلمة المرور المؤقتة إلى كلمة مرور سرية قوية خاصة بك لضمان أمان حسابك الشخصي في المنظومة.
        </p>
        <form onsubmit="window.app.handleChangePasswordSubmit(event)">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">كلمة المرور الحالية</label>
              <input type="password" id="currPassword" class="form-control" placeholder="••••••••" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">كلمة المرور الجديدة</label>
              <input type="password" id="newPassword" class="form-control" placeholder="••••••••" minlength="6" required>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700;">تأكيد كلمة المرور الجديدة</label>
              <input type="password" id="confirmNewPassword" class="form-control" placeholder="••••••••" minlength="6" required>
            </div>
          </div>
          <div id="changePassMsg" style="display: none; font-size: 0.85rem; font-weight: 700; margin-bottom: 1rem;"></div>
          <div style="display: flex; justify-content: flex-end; white-space: nowrap; flex-wrap: nowrap;">
            <button type="submit" class="btn btn-primary" style="white-space: nowrap; display: inline-flex; align-items: center; gap: 0.5rem;">
              <span>💾</span>
              <span>حفظ وتثبيت كلمة المرور الجديدة</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

window.renderProfileView = renderProfileView;