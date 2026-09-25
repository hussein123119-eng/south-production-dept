/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - نظام الصادر والوارد وتتبع الكتب الرسمية
   (Correspondence Tracking System - CTS Engine)
   الثلاثي القانوني المعتمد: العدد الصريح المقروء + التاريخ الرسمي الكامل + الباركود ورمز التحقق
   ========================================================================== */

(function () {
  'use strict';

  let currentTab = 'OUTWARD'; // 'OUTWARD' | 'INWARD' | 'VERIFIER'
  let searchQuery = '';
  let priorityFilter = 'ALL';
  let categoryFilter = 'ALL';

  function renderCorrespondenceView() {
    const user = window.auth ? window.auth.getCurrentUser() : null;
    const deptId = user ? user.departmentId : 'dept-south-prod';
    const store = window.store;

    if (!store || typeof store.getCorrespondence !== 'function') {
      return `
        <div class="card" style="padding: 2.5rem; text-align: center;">
          <h3>⚠️ جاري تهيئة محرك الصادر والوارد...</h3>
          <p>يرجى الانتظار ثوانٍ أو إعادة تحميل الصفحة.</p>
        </div>
      `;
    }

    const allRecords = store.getCorrespondence(deptId, { type: 'ALL' });
    const outwardCount = allRecords.filter(r => r.type === 'OUTWARD').length;
    const inwardCount = allRecords.filter(r => r.type === 'INWARD').length;
    const urgentCount = allRecords.filter(r => r.priority === 'URGENT' || r.priority === 'HIGH').length;

    // تصفية السجلات المعروضة حسب التبويب النشط
    const filteredRecords = store.getCorrespondence(deptId, {
      type: currentTab === 'VERIFIER' ? 'ALL' : currentTab,
      priority: priorityFilter,
      search: searchQuery
    }).filter(r => {
      if (categoryFilter !== 'ALL' && r.category !== categoryFilter) return false;
      return true;
    });

    return `
      <div class="correspondence-module-container" style="display: flex; flex-direction: column; gap: 1.5rem; padding-bottom: 2.5rem;">
        
        <!-- الترويسة الرئيسية للنظام مع بطاقات الإحصاء السريع -->
        <div class="card" style="background: linear-gradient(135deg, rgba(0, 51, 102, 0.95) 0%, rgba(2, 44, 76, 0.98) 100%); color: #ffffff; border: 1.5px solid rgba(197, 160, 89, 0.4); border-radius: 16px; padding: 1.5rem 1.8rem; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 1.2rem;">
              <div style="width: 58px; height: 58px; border-radius: 14px; background: linear-gradient(135deg, #c5a059 0%, #9a782a 100%); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 4px 14px rgba(0,0,0,0.3); border: 1.5px solid rgba(255,255,255,0.3);">
                📋
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
                  <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0;">نظام الصادر والوارد وقيد المعاملات</h2>
                  <span style="font-size: 0.76rem; background: rgba(197, 160, 89, 0.25); color: #fde68a; border: 1px solid #c5a059; padding: 0.2rem 0.65rem; border-radius: 9999px; font-weight: 800;">
                    المعيار المعتمد: العدد + التاريخ + الباركود
                  </span>
                </div>
                <p style="font-size: 0.86rem; color: #cbd5e1; margin: 0.4rem 0 0 0; line-height: 1.5;">
                  المنظومة الإدارية المتطورة لتوثيق وتتبع المراسلات، الأوامر الإدارية، الكتب الرسمية والتعاميم بالثلاثي القانوني المعتمد والمحقق الرقمي الفوري.
                </p>
              </div>
            </div>

            <!-- أزرار الإجراءات الإدارية السريعة -->
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center;">
              <button type="button" class="btn btn-primary" onclick="window.app.openCreateOutwardModal()" style="background: linear-gradient(135deg, #c5a059 0%, #b45309 100%); border-color: #fde68a; color: #ffffff; font-weight: 800; display: inline-flex; align-items: center; gap: 0.45rem;">
                <span>➕</span>
                <span>قيد كتاب صادر جديد</span>
              </button>

              <button type="button" class="btn" onclick="window.app.openCreateInwardModal()" style="background: rgba(255, 255, 255, 0.12); border: 1.5px solid rgba(255, 255, 255, 0.3); color: #ffffff; font-weight: 700; display: inline-flex; align-items: center; gap: 0.45rem;">
                <span>📥</span>
                <span>تسجيل كتاب وارد</span>
              </button>

              <button type="button" class="btn" onclick="window.app.setCorrespondenceTab('VERIFIER')" style="background: rgba(56, 189, 248, 0.15); border: 1.5px solid #38bdf8; color: #7dd3fc; font-weight: 700; display: inline-flex; align-items: center; gap: 0.45rem;">
                <span>🔍</span>
                <span>محقق صحة الصدور</span>
              </button>
            </div>
          </div>

          <!-- البطاقات الإحصائية الأربع -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 1.2rem;">
            <div style="background: rgba(255,255,255,0.06); padding: 0.9rem 1.1rem; border-radius: 10px; border-right: 4px solid #38bdf8;">
              <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">سجل الكتب الصادرة</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: #ffffff; margin-top: 0.2rem;">${outwardCount} <span style="font-size: 0.8rem; font-weight: 600; color: #38bdf8;">كتاب رسمي</span></div>
            </div>

            <div style="background: rgba(255,255,255,0.06); padding: 0.9rem 1.1rem; border-radius: 10px; border-right: 4px solid #34d399;">
              <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">سجل المعاملات الواردة</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: #ffffff; margin-top: 0.2rem;">${inwardCount} <span style="font-size: 0.8rem; font-weight: 600; color: #34d399;">معاملة مقيدة</span></div>
            </div>

            <div style="background: rgba(255,255,255,0.06); padding: 0.9rem 1.1rem; border-radius: 10px; border-right: 4px solid #f87171;">
              <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">معاملات هامة وعاجلة</div>
              <div style="font-size: 1.6rem; font-weight: 900; color: #ffffff; margin-top: 0.2rem;">${urgentCount} <span style="font-size: 0.8rem; font-weight: 600; color: #f87171;">قيد عاجل</span></div>
            </div>

            <div style="background: rgba(255,255,255,0.06); padding: 0.9rem 1.1rem; border-radius: 10px; border-right: 4px solid #fbbf24;">
              <div style="font-size: 0.8rem; color: #94a3b8; font-weight: 600;">توليد الباركود والرقم</div>
              <div style="font-size: 1.1rem; font-weight: 800; color: #fde68a; margin-top: 0.5rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>⚡ تسلسلي مؤمّن</span>
              </div>
            </div>
          </div>
        </div>

        <!-- شريط التبويبات الثلاثة وأدوات البحث والتصفية -->
        <div class="card" style="padding: 1.2rem; border-radius: 14px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; border-bottom: 1px solid var(--md-sys-color-outline-variant); padding-bottom: 1rem;">
            
            <!-- أزرار التبويبات -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="btn ${currentTab === 'OUTWARD' ? 'btn-primary' : 'btn-outline'}" onclick="window.app.setCorrespondenceTab('OUTWARD')" style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 800;">
                <span>📤</span>
                <span>سجل الصادر (${outwardCount})</span>
              </button>

              <button type="button" class="btn ${currentTab === 'INWARD' ? 'btn-primary' : 'btn-outline'}" onclick="window.app.setCorrespondenceTab('INWARD')" style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 800;">
                <span>📥</span>
                <span>سجل الوارد (${inwardCount})</span>
              </button>

              <button type="button" class="btn ${currentTab === 'VERIFIER' ? 'btn-primary' : 'btn-outline'}" onclick="window.app.setCorrespondenceTab('VERIFIER')" style="display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 800;">
                <span>🔍</span>
                <span>محقق صحة الصدور والباركود</span>
              </button>
            </div>

            <!-- زر تصدير وطباعة السجل -->
            <div>
              <button type="button" class="btn btn-outline" onclick="window.app.printCorrespondenceRegister('${currentTab}')" style="display: inline-flex; align-items: center; gap: 0.4rem; font-weight: 700;">
                <span>🖨️</span>
                <span>طباعة السجل الحالي</span>
              </button>
            </div>
          </div>

          <!-- شريط الفلاتر والبحث -->
          ${currentTab !== 'VERIFIER' ? `
            <div style="display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; margin-top: 1rem;">
              <div style="flex: 1; min-width: 250px;">
                <input type="text" id="corrSearchInput" class="form-control" placeholder="🔍 ابحث بالعدد، الموضوع، الجهة، أو الرمز..." value="${searchQuery}" oninput="window.app.filterCorrespondence()" style="font-size: 0.9rem;">
              </div>

              <div style="min-width: 160px;">
                <select id="corrPriorityFilter" class="form-control" onchange="window.app.filterCorrespondence()" style="font-size: 0.88rem;">
                  <option value="ALL" ${priorityFilter === 'ALL' ? 'selected' : ''}>-- كافة درجات الأسبقية --</option>
                  <option value="NORMAL" ${priorityFilter === 'NORMAL' ? 'selected' : ''}>عادي</option>
                  <option value="HIGH" ${priorityFilter === 'HIGH' ? 'selected' : ''}>هام</option>
                  <option value="URGENT" ${priorityFilter === 'URGENT' ? 'selected' : ''}>عاجل وفوري</option>
                </select>
              </div>

              <div style="min-width: 170px;">
                <select id="corrCategoryFilter" class="form-control" onchange="window.app.filterCorrespondence()" style="font-size: 0.88rem;">
                  <option value="ALL" ${categoryFilter === 'ALL' ? 'selected' : ''}>-- كافة أنواع المحررات --</option>
                  <option value="OFFICIAL_LETTER" ${categoryFilter === 'OFFICIAL_LETTER' ? 'selected' : ''}>كتاب رسمي</option>
                  <option value="ADMINISTRATIVE_ORDER" ${categoryFilter === 'ADMINISTRATIVE_ORDER' ? 'selected' : ''}>أمر إداري</option>
                  <option value="MEMORANDUM" ${categoryFilter === 'MEMORANDUM' ? 'selected' : ''}>مذكرة داخلية</option>
                  <option value="CIRCULAR" ${categoryFilter === 'CIRCULAR' ? 'selected' : ''}>إعمام</option>
                </select>
              </div>

              ${(searchQuery || priorityFilter !== 'ALL' || categoryFilter !== 'ALL') ? `
                <button type="button" class="btn btn-outline" onclick="window.app.resetCorrespondenceFilters()" style="font-size: 0.85rem;">
                  إعادة ضبط
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- محتوى التبويب النشط -->
        ${currentTab === 'VERIFIER' ? renderVerifierTab() : renderRegisterTable(filteredRecords, currentTab)}
      </div>
    `;
  }

  // جدول عرض سجلات الصادر أو الوارد
  function renderRegisterTable(records, tabType) {
    if (!records || records.length === 0) {
      return `
        <div class="card" style="padding: 3rem 1.5rem; text-align: center; background: var(--md-sys-color-surface); border: 1px dashed var(--md-sys-color-outline-variant); border-radius: 14px;">
          <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">📭</div>
          <h4 style="font-weight: 800; color: var(--md-sys-color-on-surface); margin-bottom: 0.4rem;">لا توجد معاملات مسجلة تطابق معايير البحث</h4>
          <p style="color: var(--md-sys-color-outline); font-size: 0.88rem; max-width: 480px; margin: 0 auto 1.2rem auto;">
            ${tabType === 'OUTWARD' ? 'يمكنك قيد كتاب صادر جديد بالضغط على زر "قيد كتاب صادر جديد" أعلاه وتوليد العدد الرسمي والباركود تلقائياً.' : 'يمكنك قيد المعاملات والكتب الواردة بالضغط على زر "تسجيل كتاب وارد".'}
          </p>
          <button type="button" class="btn btn-primary" onclick="${tabType === 'OUTWARD' ? 'window.app.openCreateOutwardModal()' : 'window.app.openCreateInwardModal()'}">
            ${tabType === 'OUTWARD' ? '➕ قيد كتاب صادر جديد' : '📥 تسجيل كتاب وارد'}
          </button>
        </div>
      `;
    }

    return `
      <div class="card" style="padding: 0; overflow: hidden; border-radius: 14px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
        <div style="overflow-x: auto;">
          <table class="table" style="width: 100%; border-collapse: collapse; text-align: right; margin: 0;">
            <thead style="background: rgba(0, 51, 102, 0.05); border-bottom: 2px solid var(--md-sys-color-outline-variant);">
              <tr>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); width: 60px;">#</th>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); min-width: 180px;">العدد والباركود</th>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); min-width: 120px;">التاريخ الرسمي</th>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); min-width: 240px;">الموضوع والنوع</th>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); min-width: 180px;">${tabType === 'OUTWARD' ? 'الجهة المستلمة' : 'الجهة الصادر منها'}</th>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); min-width: 110px;">الأسبقية والسرية</th>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); min-width: 100px;">الحالة</th>
                <th style="padding: 0.9rem 1rem; font-weight: 800; font-size: 0.85rem; color: var(--md-sys-color-primary); text-align: center; min-width: 150px;">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              ${records.map((item, idx) => {
                const priorityBadge = getPriorityBadge(item.priority);
                const categoryLabel = getCategoryLabel(item.category);
                const statusBadge = getStatusBadge(item.status);
                const barcodeThumb = window.exporter ? window.exporter.generateBarcodeSvg(item.docNumber, 125, 28) : '';

                return `
                  <tr style="border-bottom: 1px solid var(--md-sys-color-outline-variant); transition: background 0.15s ease;" onmouseover="this.style.background='rgba(0,0,0,0.015)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--md-sys-color-outline); font-size: 0.85rem;">
                      ${idx + 1}
                    </td>

                    <!-- العدد الصريح المقروء + الباركود المتجهي -->
                    <td style="padding: 0.85rem 1rem;">
                      <div style="font-weight: 900; font-family: monospace; font-size: 0.96rem; color: #003366; direction: ltr; display: inline-block; background: rgba(0,51,102,0.06); padding: 0.15rem 0.5rem; border-radius: 6px; border: 1px solid rgba(0,51,102,0.2);">
                        ${item.docNumber}
                      </div>
                      ${item.externalDocNumber ? `
                        <div style="font-size: 0.76rem; color: #b45309; margin-top: 0.25rem;">
                          <span>كتابهم ذي العدد:</span> <strong style="font-family: monospace;">${item.externalDocNumber}</strong>
                        </div>
                      ` : ''}
                      <div style="margin-top: 0.35rem; cursor: pointer;" title="انقر لعرض وتكبير الباركود" onclick="window.app.viewCorrespondenceDetails('${item.id}')">
                        ${barcodeThumb}
                      </div>
                    </td>

                    <!-- التاريخ الرسمي الكامل -->
                    <td style="padding: 0.85rem 1rem;">
                      <div style="font-weight: 800; color: var(--md-sys-color-on-surface); font-size: 0.88rem;">
                        ${formatDateArabic(item.docDate)}
                      </div>
                      <div style="font-size: 0.74rem; color: var(--md-sys-color-outline); font-family: monospace;">
                        ${item.docDate}
                      </div>
                    </td>

                    <!-- الموضوع ونوع المحرر -->
                    <td style="padding: 0.85rem 1rem;">
                      <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.25rem;">
                        <span style="font-size: 0.72rem; padding: 0.1rem 0.45rem; border-radius: 4px; background: rgba(0,51,102,0.08); color: #003366; font-weight: 800;">
                          ${categoryLabel}
                        </span>
                        ${item.attachmentsCount > 0 ? `
                          <span style="font-size: 0.7rem; color: #047857; font-weight: 700; background: rgba(4,120,87,0.1); padding: 0.1rem 0.4rem; border-radius: 4px;">
                            📎 ${item.attachmentsCount} مرفق
                          </span>
                        ` : ''}
                      </div>
                      <div style="font-weight: 800; font-size: 0.92rem; color: var(--md-sys-color-on-surface); line-height: 1.4;">
                        ${item.subject}
                      </div>
                      ${item.executiveRouting ? `
                        <div style="font-size: 0.75rem; color: #0284c7; margin-top: 0.3rem;">
                          <strong>التوجيه:</strong> ${item.executiveRouting}
                        </div>
                      ` : ''}
                    </td>

                    <!-- الجهة المعنية -->
                    <td style="padding: 0.85rem 1rem;">
                      <div style="font-size: 0.86rem; font-weight: 700; color: var(--md-sys-color-on-surface);">
                        ${tabType === 'OUTWARD' ? (item.recipientDept || 'كافة التشكيلات') : (item.senderDept || '-')}
                      </div>
                      ${tabType === 'OUTWARD' && item.senderSigner ? `
                        <div style="font-size: 0.74rem; color: var(--md-sys-color-outline); margin-top: 0.2rem;">
                          بإمضاء: ${item.senderSigner.split('-')[0]}
                        </div>
                      ` : ''}
                    </td>

                    <!-- الأسبقية والسرية -->
                    <td style="padding: 0.85rem 1rem;">
                      <div style="margin-bottom: 0.25rem;">
                        ${priorityBadge}
                      </div>
                      <div style="font-size: 0.72rem; color: var(--md-sys-color-outline); font-weight: 700;">
                        ${getSecurityLabel(item.securityClassification)}
                      </div>
                    </td>

                    <!-- الحالة -->
                    <td style="padding: 0.85rem 1rem;">
                      ${statusBadge}
                    </td>

                    <!-- أزرار الإجراءات -->
                    <td style="padding: 0.85rem 1rem; text-align: center;">
                      <div style="display: inline-flex; gap: 0.35rem; align-items: center;">
                        <button type="button" class="btn btn-sm btn-outline" onclick="window.app.viewCorrespondenceDetails('${item.id}')" title="عرض التفاصيل الكاملة" style="padding: 0.35rem 0.55rem; font-size: 0.8rem;">
                          👁️
                        </button>
                        <button type="button" class="btn btn-sm btn-primary" onclick="window.app.printCorrespondenceDocument('${item.id}')" title="طباعة الوثيقة الرسمية بالترويسة المعتمدة" style="padding: 0.35rem 0.55rem; font-size: 0.8rem;">
                          🖨️
                        </button>
                        <button type="button" class="btn btn-sm" onclick="window.app.openVerifyCorrespondenceModal('${item.docNumber}')" title="فحص صحة الصدور والباركود" style="padding: 0.35rem 0.55rem; font-size: 0.8rem; background: rgba(56, 189, 248, 0.12); color: #0284c7; border: 1px solid rgba(56, 189, 248, 0.3);">
                          🔍
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // تبويب محقق صحة الصدور والباركود
  function renderVerifierTab() {
    return `
      <div class="card" style="padding: 2rem; border-radius: 16px; background: var(--md-sys-color-surface); border: 1.5px solid var(--md-sys-color-outline-variant); max-width: 860px; margin: 0 auto; box-shadow: 0 8px 24px rgba(0,0,0,0.06);">
        <div style="text-align: center; margin-bottom: 2rem;">
          <div style="width: 64px; height: 64px; margin: 0 auto 1rem auto; border-radius: 16px; background: linear-gradient(135deg, #003366 0%, #0284c7 100%); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ffffff; box-shadow: 0 6px 18px rgba(0, 51, 102, 0.25);">
            🔍
          </div>
          <h3 style="font-weight: 900; color: var(--md-sys-color-on-surface); margin-bottom: 0.5rem; font-size: 1.35rem;">
            محقق صحة الصدور والتحقق الرقمي من الوثائق
          </h3>
          <p style="color: var(--md-sys-color-outline); font-size: 0.88rem; max-width: 580px; margin: 0 auto; line-height: 1.6;">
            أدخل <strong>العدد الصريح المقروء</strong> للكتاب، أو قم بمسح <strong>رمز الباركود</strong> للتحقق الفوري من مطابقة السجلات الرسمية والتأكد من عدم التلاعب بالوثيقة.
          </p>
        </div>

        <div style="display: flex; gap: 0.6rem; max-width: 620px; margin: 0 auto 2rem auto; flex-wrap: wrap;">
          <input type="text" id="verifierInputQuery" class="form-control" placeholder="مثال: ق.ج/ص/2026/101 أو رمز الباركود SPD-OUT-2026-101" style="flex: 1; min-width: 260px; font-size: 0.95rem; font-family: monospace; font-weight: 700;" onkeypress="if(event.key==='Enter') window.app.executeCorrespondenceVerification()">
          <button type="button" class="btn btn-primary" onclick="window.app.executeCorrespondenceVerification()" style="padding: 0.6rem 1.4rem; font-weight: 800; font-size: 0.95rem; background: linear-gradient(135deg, #003366 0%, #004d40 100%);">
            فحص وتحقق
          </button>
        </div>

        <!-- منطقة نتيجة التحقق التفاعلية -->
        <div id="verifierResultArea">
          <div style="border: 1.5px dashed var(--md-sys-color-outline-variant); border-radius: 12px; padding: 2rem; text-align: center; color: var(--md-sys-color-outline); font-size: 0.88rem;">
            أدخل رمز أو عدد أي وثيقة أعلاه للبدء بالفحص الرقمي الفوري...
          </div>
        </div>
      </div>
    `;
  }

  // دوال مساعدة لتنسيق البيانات والشارات
  function getPriorityBadge(priority) {
    switch (priority) {
      case 'URGENT':
        return '<span style="font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(220, 38, 38, 0.12); color: #dc2626; border: 1px solid rgba(220, 38, 38, 0.3);">⚡ عاجل وفوري</span>';
      case 'HIGH':
        return '<span style="font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(245, 158, 11, 0.12); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.3);">🔥 هام</span>';
      default:
        return '<span style="font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(100, 116, 139, 0.1); color: #475569; border: 1px solid rgba(100, 116, 139, 0.2);">عادي</span>';
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'ISSUED':
        return '<span style="font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);">✓ صادر معتمد</span>';
      case 'PROCESSED':
        return '<span style="font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.3);">✓ منجز ومحفوظ</span>';
      case 'UNDER_PROCESS':
        return '<span style="font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(59, 130, 246, 0.12); color: #2563eb; border: 1px solid rgba(59, 130, 246, 0.3);">قيد الإجراء</span>';
      default:
        return '<span style="font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px; background: rgba(100, 116, 139, 0.1); color: #475569; border: 1px solid rgba(100, 116, 139, 0.2);">مقيد في السجل</span>';
    }
  }

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'ADMINISTRATIVE_ORDER': return 'أمر إداري';
      case 'OFFICIAL_LETTER': return 'كتاب رسمي';
      case 'MEMORANDUM': return 'مذكرة داخلية';
      case 'CIRCULAR': return 'إعمام';
      default: return 'محرر رسمي';
    }
  }

  function getSecurityLabel(sec) {
    switch (sec) {
      case 'CONFIDENTIAL': return '🔒 سري';
      case 'STRICTLY_CONFIDENTIAL': return '⛔ سري للغاية';
      default: return '📄 رسمي اعتيادي';
    }
  }

  function formatDateArabic(dateStr) {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  }

  // تصدير دالة العرض
  window.renderCorrespondenceView = renderCorrespondenceView;

  // تسجيل دوال الـ App التفاعلية
  function registerCorrespondenceAppMethods(app) {
    if (!app) return;

    app.setCorrespondenceTab = function (tab) {
      currentTab = tab;
      if (typeof app.render === 'function') app.render();
    };

    app.filterCorrespondence = function () {
      const sInput = document.getElementById('corrSearchInput');
      const pFilter = document.getElementById('corrPriorityFilter');
      const cFilter = document.getElementById('corrCategoryFilter');
      if (sInput) searchQuery = sInput.value;
      if (pFilter) priorityFilter = pFilter.value;
      if (cFilter) categoryFilter = cFilter.value;
      if (typeof app.render === 'function') app.render();
    };

    app.resetCorrespondenceFilters = function () {
      searchQuery = '';
      priorityFilter = 'ALL';
      categoryFilter = 'ALL';
      if (typeof app.render === 'function') app.render();
    };

    // --- نافذة قيد كتاب صادر جديد ---
    app.openCreateOutwardModal = function () {
      const store = window.store;
      const nextNum = store.getNextCorrespondenceNumber ? store.getNextCorrespondenceNumber('OUTWARD') : 'ق.ج/ص/2026/103';
      const today = new Date().toISOString().split('T')[0];

      const existing = document.getElementById('correspondenceModal');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'correspondenceModal';
      overlay.setAttribute('style', 'position:fixed; inset:0; z-index:10000; background:rgba(2,6,23,0.88); backdrop-filter:blur(16px); padding:1rem; overflow-y:auto; display:flex; align-items:center; justify-content:center;');
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

      const barcodePreview = window.exporter ? window.exporter.generateBarcodeSvg(nextNum, 160, 36) : '';

      overlay.innerHTML = `
        <div style="background: linear-gradient(180deg, #0b152d 0%, #080e1e 100%); border: 1.5px solid #c5a059; border-radius: 20px; max-width: 820px; width: 95vw; max-height: 90vh; overflow-y: auto; color: #ffffff; padding: 1.8rem; box-shadow: 0 25px 60px rgba(0,0,0,0.7); direction: rtl; font-family: 'Cairo', 'Segoe UI', sans-serif;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(197, 160, 89, 0.3); padding-bottom: 1rem; margin-bottom: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span style="font-size: 1.6rem;">📤</span>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">قيد وتصدير كتاب صادر جديد</h3>
                <span style="font-size: 0.78rem; color: #fde68a;">الثلاثي القانوني: العدد الصريح المقروء + التاريخ الرسمي + الباركود</span>
              </div>
            </div>
            <button type="button" onclick="document.getElementById('correspondenceModal').remove()" style="background: none; border: none; color: #cbd5e1; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <form onsubmit="event.preventDefault(); window.app.handleSaveCorrespondence('OUTWARD');">
            <!-- الحقل الثلاثي: العدد والتاريخ والباركود -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(197, 160, 89, 0.25); border-radius: 12px; padding: 1rem; margin-bottom: 1.2rem;">
              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #fde68a; margin-bottom: 0.3rem;">العدد الصريح المقروء (توليد تلقائي)</label>
                <input type="text" id="corrOutDocNumber" class="form-control" value="${nextNum}" required style="font-family: monospace; font-weight: 800; color: #00dfd8; background: rgba(0,0,0,0.3); border-color: #c5a059;" oninput="window.app.updateOutwardBarcodePreview(this.value)">
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #fde68a; margin-bottom: 0.3rem;">التاريخ الرسمي الكامل</label>
                <input type="date" id="corrOutDocDate" class="form-control" value="${today}" required style="background: rgba(0,0,0,0.3); color: #ffffff; border-color: #c5a059;">
              </div>

              <div style="text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #94a3b8; margin-bottom: 0.2rem;">معاينة الباركود المتجهي الفوري</label>
                <div id="corrOutBarcodePreviewBox" style="background: #ffffff; padding: 4px 8px; border-radius: 6px;">
                  ${barcodePreview}
                </div>
              </div>
            </div>

            <!-- الحقول الإدارية الأساسية -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">نوع المحرر الرسمي</label>
                <select id="corrOutCategory" class="form-control" style="background: rgba(0,0,0,0.3); color: #ffffff;">
                  <option value="OFFICIAL_LETTER">كتاب رسمي</option>
                  <option value="ADMINISTRATIVE_ORDER">أمر إداري</option>
                  <option value="MEMORANDUM">مذكرة داخلية</option>
                  <option value="CIRCULAR">إعمام</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">إلى / الجهة المعنون إليها</label>
                <input type="text" id="corrOutRecipient" class="form-control" placeholder="مثال: هيأة تشغيل الرميلة / قسم الصيانة" required style="background: rgba(0,0,0,0.3); color: #ffffff;">
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">الأسبقية والسرية</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                  <select id="corrOutPriority" class="form-control" style="background: rgba(0,0,0,0.3); color: #ffffff;">
                    <option value="NORMAL">عادي</option>
                    <option value="HIGH">هام</option>
                    <option value="URGENT">عاجل وفوري</option>
                  </select>
                  <select id="corrOutSecurity" class="form-control" style="background: rgba(0,0,0,0.3); color: #ffffff;">
                    <option value="OFFICIAL">رسمي</option>
                    <option value="CONFIDENTIAL">سري</option>
                    <option value="STRICTLY_CONFIDENTIAL">سري للغاية</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- الموضوع -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">م / الموضوع الرسمي</label>
              <input type="text" id="corrOutSubject" class="form-control" placeholder="اكتب موضوع الكتاب بوضوح ودقة..." required style="background: rgba(0,0,0,0.3); color: #ffffff; font-weight: 700;">
            </div>

            <!-- نص الكتاب والمضمون -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">نص ومضمون الكتاب الإداري</label>
              <textarea id="corrOutContent" class="form-control" rows="4" placeholder="تحية طيبة... إشارة إلى... نود إعلامكم..." style="background: rgba(0,0,0,0.3); color: #ffffff; font-size: 0.9rem; line-height: 1.6;"></textarea>
            </div>

            <!-- المرفقات والجهة المصدرة -->
            <div style="display: grid; grid-template-columns: 120px 1fr; gap: 1rem; margin-bottom: 1.5rem;">
              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">عدد المرفقات</label>
                <input type="number" id="corrOutAttachments" class="form-control" value="0" min="0" style="background: rgba(0,0,0,0.3); color: #ffffff;">
              </div>
              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">الجهة الصادر عنها / الشعبة</label>
                <input type="text" id="corrOutSenderDept" class="form-control" value="قسم الإنتاج الجنوبي / الإدارة" style="background: rgba(0,0,0,0.3); color: #ffffff;">
              </div>
            </div>

            <!-- أزرار الإجراء -->
            <div style="display: flex; justify-content: flex-end; gap: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.2rem;">
              <button type="button" class="btn btn-outline" onclick="document.getElementById('correspondenceModal').remove()" style="color: #cbd5e1; border-color: rgba(255,255,255,0.2);">
                إلغاء
              </button>
              <button type="submit" class="btn btn-primary" style="background: linear-gradient(135deg, #c5a059 0%, #b45309 100%); border-color: #fde68a; color: #ffffff; font-weight: 800; padding: 0.6rem 1.6rem;">
                ✓ تصدير وقيد رسمي معتمد
              </button>
            </div>
          </form>
        </div>
      `;

      document.body.appendChild(overlay);
    };

    app.updateOutwardBarcodePreview = function (val) {
      const box = document.getElementById('corrOutBarcodePreviewBox');
      if (box && window.exporter) {
        box.innerHTML = window.exporter.generateBarcodeSvg(val || 'N/A', 160, 36);
      }
    };

    // --- نافذة تسجيل كتاب وارد جديد ---
    app.openCreateInwardModal = function () {
      const store = window.store;
      const nextNum = store.getNextCorrespondenceNumber ? store.getNextCorrespondenceNumber('INWARD') : 'ق.ج/و/2026/090';
      const today = new Date().toISOString().split('T')[0];

      const existing = document.getElementById('correspondenceModal');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'correspondenceModal';
      overlay.setAttribute('style', 'position:fixed; inset:0; z-index:10000; background:rgba(2,6,23,0.88); backdrop-filter:blur(16px); padding:1rem; overflow-y:auto; display:flex; align-items:center; justify-content:center;');
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

      overlay.innerHTML = `
        <div style="background: linear-gradient(180deg, #0b152d 0%, #080e1e 100%); border: 1.5px solid #34d399; border-radius: 20px; max-width: 820px; width: 95vw; max-height: 90vh; overflow-y: auto; color: #ffffff; padding: 1.8rem; box-shadow: 0 25px 60px rgba(0,0,0,0.7); direction: rtl; font-family: 'Cairo', 'Segoe UI', sans-serif;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid rgba(52, 211, 153, 0.3); padding-bottom: 1rem; margin-bottom: 1.2rem;">
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <span style="font-size: 1.6rem;">📥</span>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #ffffff; margin: 0;">تسجيل وقيد كتاب وارد جديد</h3>
                <span style="font-size: 0.78rem; color: #a7f3d0;">توثيق رقم الوارد الداخلي ومطابقة كتاب الجهة الأصلية</span>
              </div>
            </div>
            <button type="button" onclick="document.getElementById('correspondenceModal').remove()" style="background: none; border: none; color: #cbd5e1; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <form onsubmit="event.preventDefault(); window.app.handleSaveCorrespondence('INWARD');">
            <!-- أرقام القيد المزدوجة: رقم الوارد + رقم كتاب الجهة -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(52, 211, 153, 0.25); border-radius: 12px; padding: 1rem; margin-bottom: 1.2rem;">
              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #a7f3d0; margin-bottom: 0.3rem;">رقم القيد في سجل الوارد الداخلي</label>
                <input type="text" id="corrInDocNumber" class="form-control" value="${nextNum}" required style="font-family: monospace; font-weight: 800; color: #34d399; background: rgba(0,0,0,0.3); border-color: #34d399;">
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #a7f3d0; margin-bottom: 0.3rem;">تاريخ الاستلام والقيد بالوارد</label>
                <input type="date" id="corrInDocDate" class="form-control" value="${today}" required style="background: rgba(0,0,0,0.3); color: #ffffff; border-color: #34d399;">
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #fde68a; margin-bottom: 0.3rem;">رقم كتاب الجهة الوارد الأصلي</label>
                <input type="text" id="corrInExternalDocNumber" class="form-control" placeholder="مثال: هـ.ت.ر/م/4491" required style="font-family: monospace; font-weight: 700; background: rgba(0,0,0,0.3); color: #ffffff;">
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #fde68a; margin-bottom: 0.3rem;">تاريخ كتاب الجهة الأصلي</label>
                <input type="date" id="corrInExternalDocDate" class="form-control" value="${today}" style="background: rgba(0,0,0,0.3); color: #ffffff;">
              </div>
            </div>

            <!-- الحقول الإدارية الأساسية -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">الجهة الصادر منها الكتاب الوارد</label>
                <input type="text" id="corrInSenderDept" class="form-control" placeholder="مثال: هيأة تشغيل الرميلة / قسم السلامة" required style="background: rgba(0,0,0,0.3); color: #ffffff;">
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">نوع المحرر الوارد</label>
                <select id="corrInCategory" class="form-control" style="background: rgba(0,0,0,0.3); color: #ffffff;">
                  <option value="OFFICIAL_LETTER">كتاب رسمي</option>
                  <option value="CIRCULAR">إعمام</option>
                  <option value="ADMINISTRATIVE_ORDER">أمر إداري</option>
                  <option value="MEMORANDUM">مذكرة داخلية</option>
                </select>
              </div>

              <div>
                <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">الأسبقية والسرية</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                  <select id="corrInPriority" class="form-control" style="background: rgba(0,0,0,0.3); color: #ffffff;">
                    <option value="NORMAL">عادي</option>
                    <option value="HIGH">هام</option>
                    <option value="URGENT">عاجل وفوري</option>
                  </select>
                  <select id="corrInSecurity" class="form-control" style="background: rgba(0,0,0,0.3); color: #ffffff;">
                    <option value="OFFICIAL">رسمي</option>
                    <option value="CONFIDENTIAL">سري</option>
                    <option value="STRICTLY_CONFIDENTIAL">سري للغاية</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- الموضوع -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">م / الموضوع</label>
              <input type="text" id="corrInSubject" class="form-control" placeholder="موضوع الكتاب الوارد..." required style="background: rgba(0,0,0,0.3); color: #ffffff; font-weight: 700;">
            </div>

            <!-- التوجيه والإحالة الإدارية -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.3rem;">التوجيه والإحالة الإدارية (Executive Routing)</label>
              <input type="text" id="corrInExecutiveRouting" class="form-control" placeholder="مثال: إلى شعبة العمليات / للمتابعة وتزويدنا بالموقف خلال 48 ساعة" style="background: rgba(0,0,0,0.3); color: #ffffff; border-color: #38bdf8;">
            </div>

            <!-- ملخص المحتوى والمرفقات -->
            <div style="margin-bottom: 1.5rem;">
              <label style="display: block; font-size: 0.84rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.3rem;">ملخص مضمون الكتاب الوارد والمرفقات</label>
              <textarea id="corrInContent" class="form-control" rows="3" placeholder="ملخص ما ورد في الكتاب أو توجيهات المتابعة..." style="background: rgba(0,0,0,0.3); color: #ffffff; font-size: 0.9rem; line-height: 1.6;"></textarea>
            </div>

            <!-- أزرار الإجراء -->
            <div style="display: flex; justify-content: flex-end; gap: 0.8rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.2rem;">
              <button type="button" class="btn btn-outline" onclick="document.getElementById('correspondenceModal').remove()" style="color: #cbd5e1; border-color: rgba(255,255,255,0.2);">
                إلغاء
              </button>
              <button type="submit" class="btn btn-primary" style="background: linear-gradient(135deg, #059669 0%, #047857 100%); border-color: #34d399; color: #ffffff; font-weight: 800; padding: 0.6rem 1.6rem;">
                ✓ قيد وتسجيل في سجل الوارد
              </button>
            </div>
          </form>
        </div>
      `;

      document.body.appendChild(overlay);
    };

    // حفظ المعاملة في الـ Store
    app.handleSaveCorrespondence = function (type) {
      const store = window.store;
      const user = window.auth ? window.auth.getCurrentUser() : null;

      let item = { type };
      if (type === 'OUTWARD') {
        item.docNumber = document.getElementById('corrOutDocNumber').value.trim();
        item.docDate = document.getElementById('corrOutDocDate').value;
        item.category = document.getElementById('corrOutCategory').value;
        item.recipientDept = document.getElementById('corrOutRecipient').value.trim();
        item.priority = document.getElementById('corrOutPriority').value;
        item.securityClassification = document.getElementById('corrOutSecurity').value;
        item.subject = document.getElementById('corrOutSubject').value.trim();
        item.content = document.getElementById('corrOutContent').value.trim();
        item.attachmentsCount = parseInt(document.getElementById('corrOutAttachments').value, 10) || 0;
        item.senderDept = document.getElementById('corrOutSenderDept').value.trim();
      } else {
        item.docNumber = document.getElementById('corrInDocNumber').value.trim();
        item.docDate = document.getElementById('corrInDocDate').value;
        item.externalDocNumber = document.getElementById('corrInExternalDocNumber').value.trim();
        item.externalDocDate = document.getElementById('corrInExternalDocDate').value;
        item.senderDept = document.getElementById('corrInSenderDept').value.trim();
        item.category = document.getElementById('corrInCategory').value;
        item.priority = document.getElementById('corrInPriority').value;
        item.securityClassification = document.getElementById('corrInSecurity').value;
        item.subject = document.getElementById('corrInSubject').value.trim();
        item.executiveRouting = document.getElementById('corrInExecutiveRouting').value.trim();
        item.content = document.getElementById('corrInContent').value.trim();
      }

      const saved = store.addCorrespondence(item, user);
      const modal = document.getElementById('correspondenceModal');
      if (modal) modal.remove();

      alert(`✅ تم قيد وتوثيق المعاملة الرسمية بنجاح!\nالعدد المعتمد: ${saved.docNumber}\nالتاريخ: ${saved.docDate}`);

      if (typeof app.render === 'function') {
        app.render();
      }
    };

    // --- عرض تفاصيل المعاملة والباركود بالحجم الكامل ---
    app.viewCorrespondenceDetails = function (id) {
      const store = window.store;
      const item = store.getCorrespondenceById ? store.getCorrespondenceById(id) : null;
      if (!item) return;

      const existing = document.getElementById('correspondenceDetailsModal');
      if (existing) existing.remove();

      const overlay = document.createElement('div');
      overlay.id = 'correspondenceDetailsModal';
      overlay.setAttribute('style', 'position:fixed; inset:0; z-index:10000; background:rgba(2,6,23,0.88); backdrop-filter:blur(16px); padding:1rem; overflow-y:auto; display:flex; align-items:center; justify-content:center;');
      overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

      const officialHeader = window.exporter ? window.exporter.renderOfficialHeader({
        docNumber: item.docNumber,
        docDate: formatDateArabic(item.docDate),
        sectionName: item.senderDept
      }) : '';

      overlay.innerHTML = `
        <div style="background: #ffffff; border-radius: 20px; max-width: 820px; width: 95vw; max-height: 92vh; overflow-y: auto; color: #0f172a; padding: 2rem; box-shadow: 0 25px 60px rgba(0,0,0,0.7); direction: rtl; font-family: 'Cairo', 'Segoe UI', sans-serif;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 0.8rem; margin-bottom: 1.2rem;">
            <div style="font-weight: 800; font-size: 1.15rem; color: #003366;">
              📄 بطاقة الوثيقة الرسمية المعتمدة
            </div>
            <button type="button" onclick="document.getElementById('correspondenceDetailsModal').remove()" style="background: none; border: none; color: #64748b; font-size: 1.4rem; cursor: pointer;">✕</button>
          </div>

          <!-- الترويسة الوزارية الرسمية بالثلاثي المعتمد -->
          ${officialHeader}

          <!-- محتوى وتفاصيل الوثيقة -->
          <div style="margin: 1.5rem 0; line-height: 1.8;">
            <div style="font-size: 1rem; font-weight: 800; color: #003366; margin-bottom: 0.4rem;">
              <strong>إلى /</strong> ${item.type === 'OUTWARD' ? (item.recipientDept || 'كافة التشكيلات المعنية') : (item.recipientDept || 'قسم الإنتاج الجنوبي')}
            </div>

            <div style="font-size: 1.05rem; font-weight: 900; color: #b45309; margin-bottom: 1rem; border-bottom: 1px dashed #cbd5e1; padding-bottom: 0.4rem;">
              <strong>م /</strong> ${item.subject}
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 1.2rem; font-size: 0.95rem; color: #1e293b; min-height: 120px; white-space: pre-wrap; margin-bottom: 1.2rem;">
              ${item.content || 'لا يوجد نص إضافي.'}
            </div>

            ${item.executiveRouting ? `
              <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 1rem; font-size: 0.88rem; color: #166534;">
                <strong>التوجيه والمتابعة الإدارية:</strong> ${item.executiveRouting}
              </div>
            ` : ''}

            <!-- التوقيع الرسمي -->
            <div style="text-align: left; margin-top: 2rem; margin-left: 1rem;">
              <div style="font-weight: 900; color: #003366; font-size: 1rem;">علاء حسن عبادان</div>
              <div style="font-weight: 800; color: #004d40; font-size: 0.88rem;">رئيس مهندسين أقدم</div>
              <div style="font-weight: 800; color: #b45309; font-size: 0.85rem;">مدير قسم الإنتاج الجنوبي</div>
            </div>
          </div>

          <!-- شريط الإجراءات والطباعة -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1.5px solid #cbd5e1; padding-top: 1.2rem; flex-wrap: wrap; gap: 0.8rem;">
            <div style="font-size: 0.8rem; color: #64748b;">
              رمز التحقق الرقمي: <code style="font-weight: 800;">${item.verificationHash}</code>
            </div>

            <div style="display: flex; gap: 0.6rem;">
              <button type="button" class="btn btn-primary" onclick="window.app.printCorrespondenceDocument('${item.id}')" style="background: #003366; color: #ffffff; font-weight: 800;">
                🖨️ طباعة الوثيقة
              </button>
              <button type="button" class="btn btn-outline" onclick="window.app.openVerifyCorrespondenceModal('${item.docNumber}')" style="border-color: #0284c7; color: #0284c7; font-weight: 700;">
                🔍 فحص صحة الصدور
              </button>
              <button type="button" class="btn btn-outline" onclick="document.getElementById('correspondenceDetailsModal').remove()">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
    };

    // --- طباعة الوثيقة الرسمية بهيئة كتاب وزارة النفط المعتمد ---
    app.printCorrespondenceDocument = function (id) {
      const store = window.store;
      const item = store.getCorrespondenceById ? store.getCorrespondenceById(id) : null;
      if (!item) return;

      const officialHeader = window.exporter ? window.exporter.renderOfficialHeader({
        docNumber: item.docNumber,
        docDate: formatDateArabic(item.docDate),
        sectionName: item.senderDept
      }) : '';

      const printWindow = window.open('', '_blank', 'width=900,height=900');
      if (!printWindow) {
        alert('يرجى السماح بفتح النوافذ المنبثقة لإتمام الطباعة.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>كتاب رسمي - ${item.docNumber}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4;
              margin: 15mm 15mm 15mm 15mm;
            }
            body {
              font-family: 'Cairo', 'Segoe UI', sans-serif;
              color: #0f172a;
              background: #ffffff;
              margin: 0;
              padding: 10px;
              direction: rtl;
            }
            .doc-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 10px;
            }
            .doc-body {
              margin: 25px 0;
              font-size: 15px;
              line-height: 2;
              text-align: justify;
            }
            .signature-block {
              margin-top: 50px;
              text-align: left;
              margin-left: 30px;
            }
            .footer-strip {
              border-top: 1.5px solid #cbd5e1;
              padding-top: 10px;
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #64748b;
            }
            @media print {
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="doc-container">
            ${officialHeader}

            <div style="font-size: 16px; font-weight: 800; color: #003366; margin-top: 20px;">
              إلى / ${item.type === 'OUTWARD' ? (item.recipientDept || 'كافة التشكيلات المعنية') : (item.recipientDept || 'قسم الإنتاج الجنوبي')}
            </div>

            <div style="font-size: 17px; font-weight: 900; color: #b45309; margin: 15px 0 25px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
              م / ${item.subject}
            </div>

            <div class="doc-body">
              ${item.content || 'يرجى التفضل بالاطلاع والتوجيه بإجراء اللازم مع التقدير...'}
            </div>

            ${item.attachmentsCount > 0 ? `
              <div style="font-size: 13px; font-weight: 700; color: #475569; margin-top: 15px;">
                <strong>المرفقات:</strong> (${item.attachmentsCount}) مرفق رسمي.
              </div>
            ` : ''}

            <div class="signature-block">
              <div style="font-size: 16px; font-weight: 900; color: #003366;">علاء حسن عبادان</div>
              <div style="font-size: 14px; font-weight: 800; color: #004d40;">رئيس مهندسين أقدم</div>
              <div style="font-size: 14px; font-weight: 800; color: #b45309;">مدير قسم الإنتاج الجنوبي</div>
            </div>

            <div class="footer-strip">
              <div>نسخة منه إلى: سجل الصادر والوارد العام · الأرشفة الإلكترونية</div>
              <div>رمز التحقق: ${item.verificationHash} · طبع بتاريخ: ${new Date().toLocaleDateString('ar-IQ')}</div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    };

    // --- محقق صحة الصدور المباشر ---
    app.openVerifyCorrespondenceModal = function (code) {
      app.setCorrespondenceTab('VERIFIER');
      setTimeout(() => {
        const input = document.getElementById('verifierInputQuery');
        if (input && code) {
          input.value = code;
          app.executeCorrespondenceVerification();
        }
      }, 100);
    };

    app.executeCorrespondenceVerification = function () {
      const input = document.getElementById('verifierInputQuery');
      const resultArea = document.getElementById('verifierResultArea');
      if (!input || !resultArea) return;

      const query = input.value.trim();
      const res = window.store.verifyCorrespondence(query);

      if (res.verified && res.item) {
        const item = res.item;
        const barcodeBig = window.exporter ? window.exporter.generateBarcodeSvg(item.docNumber, 240, 52) : '';
        const qrBig = window.exporter ? window.exporter.generateQrCodeSvg(item.docNumber, 72) : '';

        resultArea.innerHTML = `
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.04) 100%); border: 2px solid #10b981; border-radius: 14px; padding: 1.5rem; text-align: right; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.1);">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid rgba(16, 185, 129, 0.25); padding-bottom: 0.8rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="font-size: 1.8rem; color: #10b981;">✅</span>
                <div>
                  <h4 style="font-size: 1.15rem; font-weight: 900; color: #047857; margin: 0;">وثيقة رسمية معتمدة ومطابقة للسجلات</h4>
                  <span style="font-size: 0.78rem; color: #059669; font-weight: 700;">تم التحقق من صحة الصدور والتوقيع المعتمد بنجاح</span>
                </div>
              </div>
              <span style="background: #10b981; color: #ffffff; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 800;">
                صحيح ومعتمد
              </span>
            </div>

            <!-- بطاقة الثلاثي القانوني المعتمد -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px; padding: 1rem; margin-bottom: 1rem;">
              <div>
                <div style="font-size: 0.78rem; color: #64748b; font-weight: 700;">العدد الصريح المقروء:</div>
                <div style="font-size: 1.1rem; font-weight: 900; color: #003366; font-family: monospace; direction: ltr; display: inline-block;">${item.docNumber}</div>
              </div>
              <div>
                <div style="font-size: 0.78rem; color: #64748b; font-weight: 700;">التاريخ الرسمي المسجل:</div>
                <div style="font-size: 1rem; font-weight: 800; color: #047857;">${formatDateArabic(item.docDate)} (${item.docDate})</div>
              </div>
              <div>
                <div style="font-size: 0.78rem; color: #64748b; font-weight: 700;">نوع المعاملة والقيد:</div>
                <div style="font-size: 0.95rem; font-weight: 800; color: #b45309;">${item.type === 'OUTWARD' ? '📤 كتاب صادر رسمي' : '📥 كتاب وارد مقيد'}</div>
              </div>
            </div>

            <div style="line-height: 1.8; margin-bottom: 1rem;">
              <div style="font-size: 0.92rem; color: #1e293b;">
                <strong>الموضوع:</strong> ${item.subject}
              </div>
              <div style="font-size: 0.88rem; color: #475569;">
                <strong>الجهة المعنية:</strong> ${item.type === 'OUTWARD' ? item.recipientDept : item.senderDept}
              </div>
              <div style="font-size: 0.88rem; color: #475569;">
                <strong>الموقع المعتمد:</strong> ${item.senderSigner || 'علاء حسن عبادان - رئيس مهندسين أقدم / مدير القسم'}
              </div>
            </div>

            <!-- عرض الباركود ورمز التحقق QR -->
            <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0.8rem 1.2rem; flex-wrap: wrap; gap: 1rem;">
              <div style="flex: 1; min-width: 200px;">
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; margin-bottom: 0.2rem;">الباركود الرقمي المتجهي (Vector SVG)</div>
                ${barcodeBig}
              </div>
              <div style="display: flex; align-items: center; gap: 0.8rem;">
                ${qrBig}
                <div style="font-size: 0.75rem; color: #64748b; font-weight: 700;">
                  رمز التحقق:<br>
                  <code style="font-weight: 800; color: #003366;">${item.verificationHash}</code>
                </div>
              </div>
            </div>

            <div style="margin-top: 1rem; text-align: left;">
              <button type="button" class="btn btn-sm btn-primary" onclick="window.app.printCorrespondenceDocument('${item.id}')" style="font-weight: 800;">
                🖨️ طباعة نسخة طبق الأصل
              </button>
            </div>
          </div>
        `;
      } else {
        resultArea.innerHTML = `
          <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(185, 28, 28, 0.04) 100%); border: 2px solid #ef4444; border-radius: 14px; padding: 1.8rem; text-align: center;">
            <div style="font-size: 2.2rem; color: #ef4444; margin-bottom: 0.5rem;">⚠️</div>
            <h4 style="font-size: 1.2rem; font-weight: 900; color: #b91c1c; margin-bottom: 0.4rem;">لم يتم العثور على وثيقة رسمية مسجلة بهذا الرمز</h4>
            <p style="color: #7f1d1d; font-size: 0.88rem; max-width: 520px; margin: 0 auto 1.2rem auto; line-height: 1.6;">
              العدد أو رمز الباركود المدخل غير مقيد في سجلات الصادر والوارد المعتمدة لقسم الإنتاج الجنوبي. يرجى التأكد من كتابة العدد بدقة بما في ذلك الفواصل (مثل: <code>ق.ج/ص/2026/101</code>).
            </p>
            <button type="button" class="btn btn-outline" onclick="document.getElementById('verifierInputQuery').focus()">
              إعادة المحاولة
            </button>
          </div>
        `;
      }
    };

    // --- طباعة السجل الكامل ---
    app.printCorrespondenceRegister = function (tabType) {
      const store = window.store;
      const records = store.getCorrespondence('dept-south-prod', { type: tabType === 'VERIFIER' ? 'ALL' : tabType });
      
      const printWindow = window.open('', '_blank', 'width=1000,height=900');
      if (!printWindow) {
        alert('يرجى السماح بفتح النوافذ المنبثقة.');
        return;
      }

      const rows = records.map((r, i) => `
        <tr style="border-bottom: 1px solid #cbd5e1;">
          <td style="padding: 8px; text-align: center;">${i + 1}</td>
          <td style="padding: 8px; font-family: monospace; font-weight: 800; direction: ltr; text-align: center;">${r.docNumber}</td>
          <td style="padding: 8px; text-align: center;">${formatDateArabic(r.docDate)}</td>
          <td style="padding: 8px; font-weight: 700;">${r.subject}</td>
          <td style="padding: 8px;">${r.type === 'OUTWARD' ? r.recipientDept : r.senderDept}</td>
          <td style="padding: 8px; text-align: center;">${r.priority === 'URGENT' ? 'عاجل' : (r.priority === 'HIGH' ? 'هام' : 'عادي')}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>سجل الصادر والوارد الرسمي</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: 'Cairo', sans-serif; direction: rtl; color: #0f172a; padding: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
            th { background: #003366; color: #ffffff; padding: 8px; text-align: center; }
            td { padding: 6px 8px; }
          </style>
        </head>
        <body>
          <div style="text-align: center; border-bottom: 2px solid #003366; padding-bottom: 10px;">
            <h2 style="margin: 0; color: #003366;">جمهورية العراق - وزارة النفط - شركة نفط البصرة</h2>
            <h3 style="margin: 4px 0; color: #004d40;">قسم الإنتاج الجنوبي · سجل ${tabType === 'INWARD' ? 'الوارد' : 'الصادر'} العام</h3>
            <div style="font-size: 12px; color: #64748b;">تاريخ استخراج السجل: ${new Date().toLocaleDateString('ar-IQ')}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>ت</th>
                <th>العدد الرسمي</th>
                <th>التاريخ</th>
                <th>موضوع المعاملة</th>
                <th>الجهة المعنية</th>
                <th>الأسبقية</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); };</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    };
  }

  window.registerCorrespondenceAppMethods = registerCorrespondenceAppMethods;

  // تسجيل فوري إذا كان كائن app متاحاً مسبقاً
  if (typeof window.app !== 'undefined' && window.app) {
    registerCorrespondenceAppMethods(window.app);
  }

})();
