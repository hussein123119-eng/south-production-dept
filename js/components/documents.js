/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Documents Component (DMS)
   نظام إدارة وأرشفة المستندات والكتب الرسمية والفحوصات
   ========================================================================== */

function renderDocumentsView() {
  const user = window.auth.getCurrentUser();
  const db = window.store.getDb();
  const allDocumentsRaw = window.store.getDocuments(user.departmentId) || [];
  
  // Categorize active vs archived
  const activeDocs = allDocumentsRaw.filter(d => !d.isArchived && d.status !== 'ARCHIVED');
  const archivedDocs = allDocumentsRaw.filter(d => d.isArchived === true || d.status === 'ARCHIVED');
  
  const allActiveCount = activeDocs.length;
  const wordCount = activeDocs.filter(d => d.category === 'WORD').length;
  const excelCount = activeDocs.filter(d => d.category === 'EXCEL').length;
  const archivedCount = archivedDocs.length;

  const activeCategory = window.app.currentDocCategoryFilter || 'ALL';
  const searchQuery = (window.app.currentDocSearchQuery || '').trim().toLowerCase();

  let documents = activeDocs;
  if (activeCategory === 'WORD') {
    documents = activeDocs.filter(d => d.category === 'WORD');
  } else if (activeCategory === 'EXCEL') {
    documents = activeDocs.filter(d => d.category === 'EXCEL');
  } else if (activeCategory === 'ARCHIVED') {
    documents = archivedDocs;
  }

  if (searchQuery) {
    documents = documents.filter(d => {
      const title = (d.title || '').toLowerCase();
      const num = (d.docNumber || d.documentNumber || '').toLowerCase();
      const creator = (d.createdByName || '').toLowerCase();
      const sec = d.sectionId ? window.store.getSectionById(d.sectionId) : null;
      const st = d.stationId ? window.store.getStationById(d.stationId) : null;
      const un = d.unitId ? window.store.getUnitById(d.unitId) : null;
      const scope = (st ? st.name : (sec ? sec.name : (un ? un.name : 'إدارة القسم'))).toLowerCase();
      return title.includes(searchQuery) || num.includes(searchQuery) || creator.includes(searchQuery) || scope.includes(searchQuery);
    });
  }

  return `
    <div style="margin-bottom: 1.75rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
      <div>
        <h2 style="font-size: 1.6rem; font-weight: 800; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.5rem; margin-bottom: 4px;">
          📄 <span>نظام إدارة وأرشفة المستندات (DMS)</span>
        </h2>
        <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.9rem;">
          التقارير اليومية، جداول البيانات، الكتب والمراسلات الرسمية، ومحاضر الفحص الفني.
        </p>
      </div>
      <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; align-items: center;">
        ${window.rbac.hasPermission(user, 'CREATE_DOCUMENT') || window.rbac.hasPermission(user, 'FILES_UPLOAD') || ['SUPER_ADMIN', 'DEPT_MANAGER'].includes(user.role) ? `
          <button class="btn btn-glass-primary" onclick="window.app.openCreateWordDocModal()" title="إنشاء كتاب أو مستند نصي رسمي جديد">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            <span>+ مستند Word / كتاب رسمي</span>
            <span style="font-size: 1.05rem;">📝</span>
          </button>
          <button class="btn btn-glass-emerald" onclick="window.app.openCreateExcelSheetModal()" title="إنشاء جدول بيانات أو فحص إكسل جديد">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
            <span>+ جدول بيانات Excel</span>
            <span style="font-size: 1.05rem;">📊</span>
          </button>
        ` : ''}
      </div>
    </div>

    <!-- Category Filters Tabs & Search Bar Container -->
    <div style="background: var(--md-sys-color-surface); padding: 1rem 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; border: 1.5px solid var(--md-sys-color-surface-variant); box-shadow: 0 2px 10px rgba(0,0,0,0.03);">
      
      <!-- Subtabs Row (All, Word, Excel, Archived) -->
      <div class="tabs-header" style="margin-bottom: 1rem; border-bottom: 1px solid var(--md-sys-color-surface-variant); padding-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        
        <!-- Tab 1: جميع المستندات -->
        <button class="tab-btn ${activeCategory === 'ALL' ? 'active' : ''}" onclick="window.app.setDocCategoryFilter('ALL')" style="font-size: 0.88rem;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
          </svg>
          <span>جميع المستندات</span>
          <span class="tab-count-badge">${allActiveCount}</span>
        </button>

        <!-- Tab 2: المستندات النصية والكتب -->
        <button class="tab-btn ${activeCategory === 'WORD' ? 'active' : ''}" onclick="window.app.setDocCategoryFilter('WORD')" style="font-size: 0.88rem;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>المستندات النصية والكتب</span>
          <span class="tab-count-badge">${wordCount}</span>
        </button>

        <!-- Tab 3: جداول البيانات والفحوصات -->
        <button class="tab-btn ${activeCategory === 'EXCEL' ? 'active' : ''}" onclick="window.app.setDocCategoryFilter('EXCEL')" style="font-size: 0.88rem;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
          </svg>
          <span>جداول البيانات والفحوصات</span>
          <span class="tab-count-badge">${excelCount}</span>
        </button>

        <!-- Tab 4: الكتب والمستندات المؤرشفة -->
        <button class="tab-btn ${activeCategory === 'ARCHIVED' ? 'active' : ''}" onclick="window.app.setDocCategoryFilter('ARCHIVED')" style="font-size: 0.88rem;">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"></polyline>
            <rect x="1" y="3" width="22" height="5"></rect>
            <line x1="10" y1="12" x2="14" y2="12"></line>
          </svg>
          <span>الكتب والمستندات المؤرشفة</span>
          <span class="tab-count-badge">${archivedCount}</span>
        </button>

      </div>

      <!-- Search Toolbar Row -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem;">
        <div style="flex: 1 1 340px; max-width: 580px; position: relative;">
          <input type="text" id="dmsSearchInput" class="form-control" placeholder="🔍 بحث فوري بالعنوان، الرقم الإشاري، الكلمات المفتاحية، أو جهة الإصدار..." value="${window.app.currentDocSearchQuery || ''}" oninput="window.app.handleDocSearch(event)" style="font-size: 0.88rem; padding: 0.55rem 0.85rem; border-radius: var(--radius-sm);">
          ${window.app.currentDocSearchQuery ? `
            <button type="button" onclick="window.app.clearDocSearch()" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; color: #94a3b8; font-size: 1rem;" title="إلغاء البحث">✖</button>
          ` : ''}
        </div>
        <div style="font-size: 0.84rem; font-weight: 700; color: var(--md-sys-color-primary); display: flex; align-items: center; gap: 0.35rem;">
          <span>${activeCategory === 'ARCHIVED' ? '🗄️ الأرشيف الدائم' : '📂 السجلات المطابقة'}:</span>
          <span class="badge badge-primary" style="font-size: 0.8rem;">${documents.length} مستند</span>
        </div>
      </div>

    </div>

    <!-- Documents Data Table Card -->
    <div class="card">
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>عنوان الوثيقة والمستند</th>
              <th>التصنيف</th>
              <th>الارتباط التنظيمي</th>
              <th>الإصدار</th>
              <th>الحالة</th>
              <th>المنشئ والمحرر</th>
              <th>تاريخ التحديث</th>
              <th style="text-align: center; min-width: 170px;">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            ${documents.map(d => {
              const sec = d.sectionId ? window.store.getSectionById(d.sectionId) : null;
              const st = d.stationId ? window.store.getStationById(d.stationId) : null;
              const un = d.unitId ? window.store.getUnitById(d.unitId) : null;
              const scope = st ? st.name : (sec ? sec.name : (un ? un.name : 'إدارة القسم'));
              const isArchivedDoc = d.isArchived === true || d.status === 'ARCHIVED';

              return `
                <tr class="dms-doc-row" data-title="${(d.title || '').toLowerCase()}" data-docnumber="${(d.docNumber || d.documentNumber || '').toLowerCase()}" data-scope="${scope.toLowerCase()}" data-creator="${(d.createdByName || '').toLowerCase()}">
                  <td>
                    <a href="#" onclick="window.app.openViewDocumentModal('${d.id}')" style="font-weight: 700; color: var(--md-sys-color-primary); font-size: 0.92rem; text-decoration: none;">
                      ${d.title}
                    </a>
                    ${d.docNumber ? `<div style="font-size: 0.75rem; color: var(--md-sys-color-outline); font-family: monospace;"># ${d.docNumber}</div>` : ''}
                  </td>
                  <td>
                    <span class="badge ${d.category === 'WORD' ? 'badge-info' : (d.category === 'EXCEL' ? 'badge-success' : 'badge-warning')}">
                      ${d.category === 'WORD' ? 'Word مستند' : (d.category === 'EXCEL' ? 'Excel جدول' : d.category)}
                    </span>
                  </td>
                  <td><span class="badge badge-info" style="background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface); font-size: 0.78rem;">${scope}</span></td>
                  <td>v${d.version || '1.0'}</td>
                  <td>
                    ${isArchivedDoc ? `
                      <span class="badge badge-secondary" style="background: rgba(217, 119, 6, 0.15); color: #d97706; font-weight: 800;">
                        📁 مؤرشف بالأرشيف
                      </span>
                    ` : `
                      <span class="badge ${d.status === 'PUBLISHED' ? 'badge-success' : 'badge-warning'}">
                        ${d.status === 'PUBLISHED' ? 'معتمد ومنشور' : 'مسودة قيد المراجعة'}
                      </span>
                    `}
                  </td>
                  <td>${d.createdByName || '-'}</td>
                  <td style="direction: ltr; text-align: right; font-size: 0.82rem;">${new Date(d.updatedAt || d.createdAt).toLocaleDateString('en-GB')}</td>
                  <td style="text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 0.35rem; flex-wrap: wrap;">
                      <button class="btn-action-view" onclick="window.app.openViewDocumentModal('${d.id}')" title="معاينة المستند">معاينة</button>
                      <button class="btn-action-export" onclick="window.app.exportDocumentFile('${d.id}')" title="تصدير المستند">تصدير</button>
                      
                      ${isArchivedDoc ? `
                        <button class="btn-action-export" onclick="window.app.unarchiveDocument('${d.id}')" title="استعادة المستند وإلغاء الأرشفة" style="background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);">
                          🔄 استعادة
                        </button>
                      ` : `
                        <button class="btn-action-export" onclick="window.app.archiveDocument('${d.id}')" title="أرشفة المستند ونقله للأرشيف الدائم" style="background: rgba(217, 119, 6, 0.12); color: #d97706; border: 1px solid rgba(217, 119, 6, 0.3);">
                          📁 أرشفة
                        </button>
                      `}

                      <button class="btn-share-whatsapp" onclick="window.app.shareViaWhatsApp('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة المستند عبر واتساب">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8.6.26 1.07.42 1.44.53.61.19 1.16.17 1.6-.1.49-.3 1.47-1.2 1.68-1.68.21-.48.21-.89.15-.98-.06-.09-.23-.15-.48-.27z"/>
                        </svg>
                      </button>
                      <button class="btn-share-email" onclick="window.app.shareViaOutlook('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة المستند عبر البريد الإلكتروني">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
            ${documents.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align: center; padding: 3rem 1.5rem; color: var(--md-sys-color-outline);">
                  <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📂</div>
                  <div style="font-weight: 700; font-size: 1rem; color: var(--md-sys-color-on-surface);">لا توجد وثائق مطابقة في هذا التصنيف.</div>
                  <div style="font-size: 0.82rem; margin-top: 4px;">يمكنك إنشاء مستند جديد أو تغيير عبارة البحث.</div>
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.renderDocumentsView = renderDocumentsView;