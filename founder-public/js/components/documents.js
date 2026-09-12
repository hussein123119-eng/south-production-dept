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

                      <button class="btn-circle-whatsapp btn-share-whatsapp" onclick="window.app.shareViaWhatsApp('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة المستند عبر واتساب">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="#ffffff">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                      </button>
                      <button class="btn-circle-email btn-share-email" onclick="window.app.shareViaOutlook('${(d.title || '').replace(/'/g, "\\'")}')" title="مشاركة المستند عبر البريد الإلكتروني">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="2" y="4" width="20" height="16" rx="3"></rect>
                          <path d="M22 7l-10 7L2 7"></path>
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