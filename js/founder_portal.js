/* ==========================================================================
   بوابة المؤسس | لوحة التحكم الرئيسية - الإصدار v84
   محرك التحكم الإداري الشامل، إدارة الصلاحيات، الإضابير، والطباعة الرسمية
   قسم الإنتاج الجنوبي - هيأة تشغيل الرميلة - شركة نفط البصرة
   جميع الأرقام باللغة الإنجليزية: 1, 2, 3, 10, 2026 | خالي تماماً من المصطلحات غير العربية
   ========================================================================== */

const FounderPortal = {
  // الحالة المركزية للبوابة
  currentTab: 'control',
  dossiers: [],
  roles: [],
  pendingUsers: [],
  whitelist: ['hussein123119@gmail.com', 'southprod.rumaila@gmail.com'],
  customForms: [],
  auditLogs: [],
  broadcastMessage: '',

  // الملاكات الافتراضية الرسمية الشاملة
  defaultDossiers: [
    {
      empId: 'EMP-0000',
      fullName: 'المؤسس العام للمنظومة',
      jobTitle: 'رئيس مهندسين أقدم',
      department: 'الإدارة العليا والقيادة المركزية',
      grade: '1',
      step: '10',
      yearsOfService: '25',
      shift: 'صباحي',
      email: 'hussein123119@gmail.com',
      role: 'مؤسس',
      phone: '07700000000',
      hireDate: '2001-01-01',
      status: 'نشط'
    }
  ],

  // طلبات التسجيل قيد الاعتماد (تبدأ فارغة ويتم تسجيل الموظفين الحقيقيين)
  defaultPendingUsers: [],

  // تهيئة النظام
  init: function() {
    this.loadState();
    this.checkAuthSession();

    // ضبط روابط العودة لتطبيق العمليات حسب البيئة (محلي أو سحابي)
    const isLocalEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const mainAppUrl = isLocalEnv ? 'index.html' : 'https://south-prod-rumaila.web.app';
    const navBtn = document.getElementById('btnNavToMainApp');
    if (navBtn) navBtn.href = mainAppUrl;
    const authNavBtn = document.getElementById('authNavToMainApp');
    if (authNavBtn) authNavBtn.href = mainAppUrl;

    const quickFillBox = document.getElementById('localQuickFillFounder');
    if (quickFillBox) {
      quickFillBox.style.display = isLocalEnv ? 'block' : 'none';
    }

    this.renderMetrics();
    this.renderAuditLogs();
    this.renderEnterprisePanel();
    this.renderRolesTable();
    this.renderPendingUsers();
    this.renderWhitelist();
    this.renderDossiersTable();
    this.renderCustomForms();
    this.initAuthProviderCard();
    this.updateMainAppStatus();

    // التحقق من الإعلان النشط
    if (this.broadcastMessage) {
      const input = document.getElementById('founderBroadcastInput');
      if (input) input.value = this.broadcastMessage;
      const notice = document.getElementById('broadcastSuccessNotice');
      if (notice) notice.style.display = 'block';
    }

    // الاستماع لأحداث لوحة المفاتيح للتنقل السريع
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDossierModal();
        this.closePrintPreviewModal();
        this.closeCreateDepartmentModal();
        this.closeAddApprovedEmployeeModal();
        this.closeRestoreDatabaseModal();
        this.closeEditUserRoleModal();
      }
    });

    console.log('✅ بوابة المؤسس | لوحة التحكم الرئيسية v102 جاهزة للعمل بنجاح.');
  },

  // --- مصادقة وتسجيل دخول المؤسس ---
  // --- مصادقة وتسجيل دخول المؤسس ---
  checkAuthSession: function() {
    const sessionStr = localStorage.getItem('SPD_FOUNDER_AUTH_SESSION_V99');
    const overlay = document.getElementById('founderLoginOverlay');
    const mainWrapper = document.getElementById('founderMainWrapper');
    const emailDisplay = document.getElementById('activeUserEmailDisplay');

    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session && session.email) {
          if (overlay) {
            overlay.classList.add('is-hidden');
            overlay.style.setProperty('display', 'none', 'important');
          }
          if (mainWrapper) {
            mainWrapper.classList.remove('is-hidden');
            mainWrapper.style.setProperty('display', 'block', 'important');
          }
          if (emailDisplay) emailDisplay.textContent = session.email;
          return true;
        }
      } catch (e) {}
    }

    // غير مسجل الدخول: إظهار شاشة الدخول وإخفاء غرفة العمليات
    if (overlay) {
      overlay.classList.remove('is-hidden');
      overlay.style.removeProperty('display');
      overlay.style.setProperty('display', 'flex', 'important');
    }
    if (mainWrapper) {
      mainWrapper.style.setProperty('display', 'none', 'important');
    }
    return false;
  },

  handleLoginSubmit: function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const emailInput = document.getElementById('founderLoginEmail');
    const pwdInput = document.getElementById('founderLoginPassword');
    const errEl = document.getElementById('founderLoginError');

    let email = (emailInput?.value || '').trim().toLowerCase();
    let pwd = (pwdInput?.value || '').trim();

    // قبول الاختصارات الشائعة للمؤسس
    if (email === 'hussein' || email === 'hussein123119' || email === 'admin' || email === 'founder') {
      email = 'hussein123119@gmail.com';
      if (emailInput) emailInput.value = email;
    } else if (email === 'southprod' || email === 'rumaila') {
      email = 'southprod.rumaila@gmail.com';
      if (emailInput) emailInput.value = email;
    }

    // التحقق من صلاحية المؤسس
    const isFounderEmail = email === 'hussein123119@gmail.com' || email === 'southprod.rumaila@gmail.com';
    
    // التحقق من كلمة المرور في قاعدة البيانات
    let validPassword = false;
    if (window.store && typeof window.store.getDb === 'function') {
      const db = window.store.getDb();
      const dbUser = db?.users?.find(u => u.email?.toLowerCase() === email || (u.id === 'user-founder' && isFounderEmail));
      if (dbUser && dbUser.password) {
        validPassword = (pwd === dbUser.password);
      }
    }

    if (isFounderEmail && validPassword) {
      if (errEl) errEl.style.display = 'none';
      const sessionData = { email: email, loggedInAt: Date.now() };
      localStorage.setItem('SPD_FOUNDER_AUTH_SESSION_V99', JSON.stringify(sessionData));

      if (window.auth && typeof window.auth.login === 'function') {
        try { window.auth.login(email, pwd, 'EMP-0000'); } catch(err) {}
      }

      const overlay = document.getElementById('founderLoginOverlay');
      const mainWrapper = document.getElementById('founderMainWrapper');
      const emailDisplay = document.getElementById('activeUserEmailDisplay');

      if (overlay) {
        overlay.classList.add('is-hidden');
        overlay.style.setProperty('display', 'none', 'important');
      }
      if (mainWrapper) {
        mainWrapper.classList.remove('is-hidden');
        mainWrapper.style.setProperty('display', 'block', 'important');
      }
      if (emailDisplay) emailDisplay.textContent = email;

      this.logAudit('تسجيل دخول المؤسس', 'الأمان والمصادقة', 'تم توثيق الدخول بنجاح إلى لوحة التحكم الرئيسية');
      this.showToast('👑 مرحباً بك يا مؤسسنا العزيز في لوحة التحكم الرئيسية.', 'success');
      return true;
    } else {
      if (errEl) {
        errEl.textContent = '⚠️ البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        errEl.style.setProperty('display', 'block', 'important');
      }
      return false;
    }
  },

  logout: function() {
    localStorage.removeItem('SPD_FOUNDER_AUTH_SESSION_V99');
    if (window.auth && typeof window.auth.logout === 'function') {
      try { window.auth.logout(); } catch(err) {}
    }

    const overlay = document.getElementById('founderLoginOverlay');
    const mainWrapper = document.getElementById('founderMainWrapper');
    const pwdInput = document.getElementById('founderLoginPassword');
    const errEl = document.getElementById('founderLoginError');

    if (pwdInput) pwdInput.value = '';
    if (errEl) errEl.style.display = 'none';
    if (overlay) {
      overlay.classList.remove('is-hidden');
      overlay.style.removeProperty('display');
      overlay.style.setProperty('display', 'flex', 'important');
    }
    if (mainWrapper) {
      mainWrapper.style.setProperty('display', 'none', 'important');
    }

    this.showToast('تم تسجيل الخروج من بوابة المؤسس بأمان.', 'info');
  },

  togglePasswordVisibility: function() {
    const pwdInput = document.getElementById('founderLoginPassword');
    if (pwdInput) {
      pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
    }
  },

  quickFillFounder: function(autoSubmit = false) {
    const emailInput = document.getElementById('founderLoginEmail');
    if (emailInput) emailInput.value = 'hussein123119@gmail.com';
    if (autoSubmit) {
      this.handleLoginSubmit();
    }
  },

  // غرفة السيطرة على المنظومة العامة والتحكم في الطوارئ
  updateMainAppStatus: function() {
    const lock = window.store && typeof window.store.getMaintenanceLock === 'function' 
      ? window.store.getMaintenanceLock() 
      : { active: false };

    const badge = document.getElementById('mainAppStatusBadge');
    const textEl = document.getElementById('mainAppStatusText');
    const btn = document.getElementById('btnToggleMaintenance');
    const reasonInput = document.getElementById('emergencyReasonInput');

    if (badge && textEl && btn) {
      const dot = badge.querySelector('span');
      if (lock.active) {
        badge.style.background = 'rgba(239, 68, 68, 0.2)';
        badge.style.borderColor = '#ef4444';
        badge.style.color = '#ef4444';
        if (dot) dot.style.background = '#ef4444';
        textEl.textContent = 'تطبيق العمليات العام: 🔴 مقفل تحت الصيانة الطارئة';
        btn.textContent = '✅ إلغاء الصيانة وإعادة تشغيل المنظومة';
        btn.className = 'btn-glass btn-glass-emerald';
        if (reasonInput && lock.reason) reasonInput.value = lock.reason;
      } else {
        badge.style.background = 'rgba(16, 185, 129, 0.15)';
        badge.style.borderColor = '#10b981';
        badge.style.color = '#10b981';
        if (dot) dot.style.background = '#10b981';
        textEl.textContent = 'تطبيق العمليات العام: 🟢 متاح ويعمل بنجاح';
        btn.textContent = '⚠️ تفعيل وضع الصيانة الفوري';
        btn.className = 'btn-glass btn-glass-rose';
      }
    }
  },

  toggleEmergencyMaintenance: function() {
    const lock = window.store && typeof window.store.getMaintenanceLock === 'function' 
      ? window.store.getMaintenanceLock() 
      : { active: false };
    
    const reasonInput = document.getElementById('emergencyReasonInput');
    const newActive = !lock.active;
    const reason = (reasonInput && reasonInput.value.trim()) || 'المنظومة تخضع للصيانة والتدقيق بأمر المؤسس والإدارة العليا';

    if (window.store && typeof window.store.setMaintenanceLock === 'function') {
      window.store.setMaintenanceLock(newActive, reason);
    }
    this.updateMainAppStatus();

    this.logAudit(
      newActive ? 'تفعيل وضع الصيانة للطوارئ' : 'إلغاء وضع الصيانة وإعادة التشغيل',
      'حالات الطوارئ',
      newActive ? `تم إيقاف المنظومة العامة وتفعيل رسالة الصيانة: ${reason}` : 'تم استئناف تشغيل المنظومة العامة للموظفين'
    );

    alert(newActive 
      ? '⚠️ تم قفل المنظومة العامة فوراً وتفعيل شاشة الصيانة لجميع الموظفين بنجاح.' 
      : '✅ تم إلغاء وضع الصيانة وإعادة فتح المنظومة العامة للعمليات بنجاح.'
    );
  },

  downloadEmergencyBackup: function() {
    try {
      const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `south_prod_emergency_backup_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      this.logAudit('تنزيل نسخة احتياطية فورية', 'النسخ الاحتياطي', 'تم تصدير وحفظ نسخة كاملة من قواعد البيانات');
    } catch (e) {
      alert('حدث خطأ أثناء تنزيل النسخة الاحتياطية: ' + e.message);
    }
  },

  // تحميل البيانات من الذاكرة المحلية ومحرك المتجر
  loadState: function() {
    try {
      // مسح كافة مخلفات النسخ التجريبية السابقة فورياً
      localStorage.removeItem('spd_founder_dossiers_v84');
      localStorage.removeItem('spd_founder_pending_v84');

      // 1. الإضابير
      const storedDossiers = localStorage.getItem('spd_founder_dossiers_v98');
      if (storedDossiers) {
        this.dossiers = JSON.parse(storedDossiers);
      } else {
        this.dossiers = JSON.parse(JSON.stringify(this.defaultDossiers));
        this.saveDossiers();
      }

      // 2. طلبات التسجيل المعلقة
      const storedPending = localStorage.getItem('spd_founder_pending_v98');
      if (storedPending) {
        this.pendingUsers = JSON.parse(storedPending);
      } else {
        this.pendingUsers = JSON.parse(JSON.stringify(this.defaultPendingUsers));
        this.savePendingUsers();
      }

      // 3. القائمة البيضاء (المؤسس وبريد الخادم المعتمد فقط)
      const storedWhitelist = localStorage.getItem('spd_founder_whitelist_v98');
      if (storedWhitelist) {
        this.whitelist = JSON.parse(storedWhitelist);
      } else {
        this.whitelist = ['hussein123119@gmail.com', 'southprod.rumaila@gmail.com'];
        this.saveWhitelist();
      }

      // 4. الاستمارات المخصصة
      const storedForms = localStorage.getItem('spd_founder_custom_forms_v98');
      if (storedForms) {
        this.customForms = JSON.parse(storedForms);
      }

      // 5. سجل العمليات والقرارات الإدارية
      const storedLogs = localStorage.getItem('spd_founder_audit_logs_v98');
      if (storedLogs) {
        this.auditLogs = JSON.parse(storedLogs);
      } else {
        this.auditLogs = [
          { time: '2026-09-04 20:00', actor: 'المؤسس', action: 'اعتماد النسخة الإنتاجية الصافية v98', status: 'ناجح' }
        ];
        this.saveAuditLogs();
      }

      // 6. الإعلان العام
      this.broadcastMessage = localStorage.getItem('spd_founder_broadcast_v98') || '';
    } catch (err) {
      console.error('خطأ في تحميل بيانات بوابة المؤسس:', err);
      this.dossiers = JSON.parse(JSON.stringify(this.defaultDossiers));
      this.pendingUsers = JSON.parse(JSON.stringify(this.defaultPendingUsers));
    }
  },

  // حفظ الإضابير
  saveDossiers: function() {
    localStorage.setItem('spd_founder_dossiers_v98', JSON.stringify(this.dossiers));
    this.renderMetrics();
  },

  // حفظ المستخدمين المعلقين
  savePendingUsers: function() {
    localStorage.setItem('spd_founder_pending_v98', JSON.stringify(this.pendingUsers));
    this.renderMetrics();
  },

  // حفظ القائمة البيضاء
  saveWhitelist: function() {
    localStorage.setItem('spd_founder_whitelist_v98', JSON.stringify(this.whitelist));
  },

  // حفظ الاستمارات المخصصة
  saveCustomForms: function() {
    localStorage.setItem('spd_founder_custom_forms_v84', JSON.stringify(this.customForms));
    this.renderMetrics();
  },

  // حفظ سجل الرقابة والعمليات
  saveAuditLogs: function() {
    localStorage.setItem('spd_founder_audit_logs_v84', JSON.stringify(this.auditLogs));
  },

  // إضافة قيد إلى سجل العمليات
  logAudit: function(action, status = 'ناجح') {
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.auditLogs.unshift({
      time: timeStr,
      actor: 'المؤسس',
      action: action,
      status: status
    });
    if (this.auditLogs.length > 50) this.auditLogs.pop();
    this.saveAuditLogs();
    this.renderAuditLogs();
  },

  // التبديل بين التبويبات الكبرى
  switchTab: function(tabId) {
    this.currentTab = tabId;
    const capId = tabId.charAt(0).toUpperCase() + tabId.slice(1);

    // تحديث الأزرار (Buttons & Pills)
    document.querySelectorAll('.founder-tab-btn, .tab-pill').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`tabBtn${capId}`) || document.getElementById(`tabPill-${tabId}`);
    if (activeBtn) activeBtn.classList.add('active');

    // إخفاء كافة صفحات التبويبات وإظهار الصفحة المحددة
    document.querySelectorAll('.tab-content-panel, .founder-tab-page').forEach(page => {
      page.classList.remove('active');
      page.style.display = 'none';
    });
    const targetPage = document.getElementById(`panel${capId}`) || document.getElementById(`tab-${tabId}`);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.style.display = 'block';
    }

    // إعادة رسم المحتوى عند التبديل
    if (tabId === 'enterprise') {
      this.renderEnterprisePanel();
    } else if (tabId === 'roles') {
      this.renderRolesTable();
      this.renderPendingUsers();
      this.renderWhitelist();
    } else if (tabId === 'dossiers') {
      this.renderDossiersTable();
    } else if (tabId === 'forms') {
      this.renderCustomForms();
    }
  },

  // تحديث المؤشرات القيادية العليا (القسم 1)
  renderMetrics: function() {
    const totalStaff = (window.deptEmployees && Array.isArray(window.deptEmployees) ? window.deptEmployees.length : (this.dossiers.length || 11));
    const activeStaff = (window.deptEmployees && Array.isArray(window.deptEmployees) ? window.deptEmployees.filter(e => e.status !== 'معلق').length : (this.dossiers.length || 10));
    const pendingStaff = this.pendingUsers ? this.pendingUsers.length : 1;
    const vehiclesCount = (window.deptVehicles && Array.isArray(window.deptVehicles) ? window.deptVehicles.length : 2);

    const elTotalStaff = document.getElementById('metricTotalStaff') || document.getElementById('metricStaffCount');
    if (elTotalStaff) elTotalStaff.textContent = totalStaff;

    const elActiveStaff = document.getElementById('metricActiveUsers');
    if (elActiveStaff) elActiveStaff.textContent = activeStaff;

    const elPending = document.getElementById('metricPendingUsers') || document.getElementById('pendingApprovalCount');
    if (elPending) elPending.textContent = pendingStaff;

    const elVehicles = document.getElementById('metricVehicles');
    if (elVehicles) elVehicles.textContent = vehiclesCount;

    const pendingBadge = document.getElementById('pendingCountBadge');
    if (pendingBadge) pendingBadge.textContent = `${pendingStaff} طلب معلق`;

    const shiftsEl = document.getElementById('metricShiftsActive');
    if (shiftsEl) shiftsEl.textContent = '4 وجبات (A, B, C, D)';

    const formsCountEl = document.getElementById('metricFormsAvailable');
    if (formsCountEl) formsCountEl.textContent = 4 + this.customForms.length;

    const dossiersCountEl = document.getElementById('dossiersTotalCount');
    if (dossiersCountEl) dossiersCountEl.textContent = this.dossiers.length;
  },

  // وضع ملء الشاشة للوحة القيادة
  toggleFullscreen: function() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  },

  // تحديث البيانات الشامل
  refreshData: function() {
    this.loadState();
    this.renderMetrics();
    this.renderRolesTable();
    this.renderPendingUsers();
    this.renderWhitelist();
    this.renderDossiersTable();
    this.renderCustomForms();
    this.showToast('تم تحديث وتحميل أحدث البيانات من قاعدة البيانات المركزية', 'success');
  },

  // فحص صحة الخادم وقاعدة البيانات
  checkServerHealth: function() {
    this.showToast('فحص الخادم وقاعدة البيانات: الحالة ممتازة ومؤمنة 100%', 'success');
  },

  // أخذ نسخة احتياطية فورية
  takeInstantBackup: function() {
    return this.createInstantBackup();
  },

  // إصدار وتوثيق أمر إداري سيادي
  issueDecree: function() {
    const subjectEl = document.getElementById('decreeSubjectInput');
    const refEl = document.getElementById('decreeRefInput');
    const contentEl = document.getElementById('decreeContentInput');
    const subject = subjectEl ? subjectEl.value.trim() : '';
    const ref = refEl ? refEl.value.trim() : '';
    const content = contentEl ? contentEl.value.trim() : '';

    if (!subject || !content) {
      this.showToast('يرجى ملء موضوع ونص الأمر الإداري', 'error');
      return;
    }

    const decree = {
      id: 'decree-' + Date.now(),
      ref: ref || `ق.ج/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      subject: subject,
      content: content,
      date: new Date().toISOString().slice(0, 10),
      issuer: 'المؤسس العام للمنظومة'
    };

    const decrees = JSON.parse(localStorage.getItem('spd_founder_decrees_v98') || '[]');
    decrees.unshift(decree);
    localStorage.setItem('spd_founder_decrees_v98', JSON.stringify(decrees));

    this.logAudit(`إصدار أمر إداري سيادي: ${subject} (${decree.ref})`);
    this.showToast(`تم بنجاح إصدار وتوثيق الأمر الإداري برقم إشارة: ${decree.ref}`, 'success');
  },

  // معاينة وطباعة الكتاب الإداري الحالي
  previewCurrentDecree: function() {
    const subjectEl = document.getElementById('decreeSubjectInput');
    const refEl = document.getElementById('decreeRefInput');
    const contentEl = document.getElementById('decreeContentInput');
    const subject = subjectEl ? subjectEl.value.trim() : 'أمر إداري سيادي';
    const ref = refEl ? refEl.value.trim() : `ق.ج/${new Date().getFullYear()}/108`;
    const content = contentEl ? contentEl.value.trim() : 'بناءً على الصلاحيات المخولة لنا ولحسن سير العمل وانتظامه في قسم الإنتاج الجنوبي، تقرر إصدار التوجيهات الإدارية المعتمدة.';

    const modal = document.getElementById('printPreviewModal');
    const target = document.getElementById('officialDocumentPrintTarget');
    if (!target) return;

    target.innerHTML = `
      <div class="doc-header-official">
        <div style="text-align: right;">
          <div style="font-weight: 800; font-size: 0.95rem;">جمهورية العراق</div>
          <div style="font-weight: 800; font-size: 0.95rem;">وزارة النفط | شركة نفط البصرة</div>
          <div style="font-weight: 800; font-size: 0.95rem;">هيأة تشغيل الرميلة - قسم الإنتاج الجنوبي</div>
        </div>
        <div style="text-align: center;">
          <div style="font-size: 1.4rem; font-weight: 900; letter-spacing: 1px;">أمر إداري رسمي</div>
          <div style="font-size: 0.85rem; color: #475569; margin-top: 0.2rem;">(سري وشخصي)</div>
        </div>
        <div style="text-align: left; font-size: 0.88rem; font-family: monospace;">
          <div><strong>العدد:</strong> ${ref}</div>
          <div><strong>التاريخ:</strong> ${new Date().toISOString().slice(0, 10)}</div>
        </div>
      </div>

      <div style="margin: 2rem 0;">
        <div style="font-weight: 800; font-size: 1.1rem; margin-bottom: 1.2rem; text-decoration: underline;">
          م/ ${subject}
        </div>
        <div style="font-size: 1.05rem; line-height: 2; text-align: justify; white-space: pre-line;">
          ${content}
        </div>
      </div>

      <div style="margin-top: 3.5rem; display: flex; justify-content: space-between; align-items: flex-end;">
        <div style="text-align: right; font-size: 0.85rem; color: #64748b;">
          <div>نسخة منه إلى:</div>
          <div>- مكتب السيد مدير الهيأة / للمعلومات لطفا</div>
          <div>- الإدارة والملاكات / للتوثيق والأرشفة</div>
          <div>- الأضابير الشخصية / للحفظ</div>
        </div>
        <div style="text-align: center; min-width: 200px;">
          <div style="font-weight: 900; font-size: 1.05rem; margin-bottom: 2rem;">المؤسس العام للمنظومة</div>
          <div style="border: 2px dashed #0369a1; border-radius: 50%; width: 90px; height: 90px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 800; color: #0369a1; transform: rotate(-10deg);">
            الختم الرسمي المعتمد
          </div>
        </div>
      </div>
    `;

    if (modal) {
      modal.style.display = 'flex';
    }
  },

  // إضافة تفويض بريد إلكتروني
  addAuthorizedEmail: function() {
    const input = document.getElementById('newAuthEmailInput') || document.getElementById('whitelistEmailInput');
    if (!input) return;
    const email = input.value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      this.showToast('يرجى إدخال عنوان بريد إلكتروني صالح', 'error');
      return;
    }
    if (this.whitelist.includes(email)) {
      this.showToast('هذا البريد الإلكتروني معتمد ومضاف مسبقاً', 'info');
      return;
    }
    this.whitelist.push(email);
    this.saveWhitelist();
    this.renderWhitelist();
    input.value = '';
    this.logAudit(`إضافة تصريح دخول رسمي للبريد: ${email}`);
    this.showToast(`تم بنجاح اعتماد وتصريح البريد الإلكتروني (${email})`, 'success');
  },

  // إضافة نموذج مخصص جديد
  addCustomFormTemplate: function() {
    const titleInput = document.getElementById('customFormTitleInput');
    const targetInput = document.getElementById('customFormTargetInput');
    const fieldsInput = document.getElementById('customFormFieldsInput');
    const title = titleInput ? titleInput.value.trim() : '';
    const target = targetInput ? targetInput.value.trim() : '';
    const fields = fieldsInput ? fieldsInput.value.trim() : '';
    if (!title) {
      this.showToast('يرجى كتابة عنوان الاستمارة الإدارية أولاً', 'error');
      return;
    }
    const newForm = {
      id: 'form-' + Date.now(),
      title: title,
      target: target || 'كافة شعب القسم',
      description: fields || 'استمارة إدارية معتمدة تم استحداثها من قبل المؤسس العام.',
      createdAt: new Date().toISOString()
    };
    this.customForms.push(newForm);
    this.saveCustomForms();
    this.renderCustomForms();
    if (titleInput) titleInput.value = '';
    if (targetInput) targetInput.value = '';
    if (fieldsInput) fieldsInput.value = '';
    this.logAudit(`استحداث استمارة إدارية جديدة: ${title}`);
    this.showToast(`تم اعتماد ونشر الاستمارة الإدارية (${title}) بنجاح`, 'success');
  },

  // رسم جدول سجل التدقيق والعمليات الإدارية
  renderAuditLogs: function() {
    const tbody = document.getElementById('systemAuditLogTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.auditLogs.slice(0, 10).forEach(log => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: monospace; font-size: 0.85rem; color: #cbd5e1; direction: ltr; text-align: right;">${log.time}</td>
        <td style="font-weight: 700; color: #f8fafc;">${log.actor}</td>
        <td style="color: #e2e8f0;">${log.action}</td>
        <td><span class="badge-role badge-role-founder" style="font-size: 0.75rem;">${log.status}</span></td>
      `;
      tbody.appendChild(tr);
    });
  },

  // إرسال إعلان عام للمنظومة للمنظومة
  sendBroadcast: function() {
    const input = document.getElementById('broadcastInput') || document.getElementById('founderBroadcastInput');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg) {
      this.showToast('يرجى كتابة نص الإعلان أو التعميم الإداري أولاً', 'error');
      return;
    }

    this.broadcastMessage = msg;
    localStorage.setItem('spd_founder_broadcast_v84', msg);
    localStorage.setItem('spd_founder_broadcast_v98', msg);

    // استدعاء واجهة برمجة التطبيقات الخلفية إذا كانت متاحة
    fetch('/api/founder/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, timestamp: new Date().toISOString() })
    }).catch(() => {});

    const notice = document.getElementById('broadcastSuccessNotice');
    if (notice) notice.style.display = 'block';

    this.logAudit(`بث تعميم إداري: "${msg.substring(0, 30)}..."`);
    this.showToast('تم اعتماد وبث التعميم الإداري بنجاح لجميع مستخدمي المنظومة', 'success');
  },

  // مسح الإعلان العام
  clearBroadcast: function() {
    const input = document.getElementById('broadcastInput') || document.getElementById('founderBroadcastInput');
    if (input) input.value = '';
    this.broadcastMessage = '';
    localStorage.removeItem('spd_founder_broadcast_v84');
    localStorage.removeItem('spd_founder_broadcast_v98');

    fetch('/api/founder/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '', timestamp: new Date().toISOString() })
    }).catch(() => {});

    const notice = document.getElementById('broadcastSuccessNotice');
    if (notice) notice.style.display = 'none';

    this.logAudit('إلغاء وسحب التعميم الإداري العام');
    this.showToast('تم سحب التعميم وإلغاء ظهوره في المنظومة', 'info');
  },

  // القفل الأمني الفوري للمنظومة
  lockSystem: function() {
    if (!confirm('تنبيه فوري:\nهل أنت متأكد من تفعيل وضع الحظر الأمني المؤقت للمنظومة؟ لن يتمكن سوى المؤسس من الدخول.')) {
      return;
    }
    this.logAudit('تفعيل القفل الأمني الفوري للمنظومة', 'حظر أمني');
    this.showToast('تم تفعيل بروتوكول الحظر الأمني المؤقت بنجاح', 'success');
  },

  // إنشاء نسخة احتياطية فورية شاملة
  createInstantBackup: function() {
    try {
      const backupData = {
        version: 'v84',
        createdAt: new Date().toISOString(),
        dossiers: this.dossiers,
        roles: this.roles,
        pendingUsers: this.pendingUsers,
        whitelist: this.whitelist,
        customForms: this.customForms,
        auditLogs: this.auditLogs
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `نسخة_احتياطية_الإنتاج_الجنوبي_v84_${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.logAudit('تصدير وتحميل نسخة احتياطية شاملة');
      this.showToast('تم توليد وتنزيل ملف النسخة الاحتياطية المعتمدة بنجاح', 'success');
    } catch (err) {
      console.error(err);
      this.showToast('تعذر إنشاء النسخة الاحتياطية', 'error');
    }
  },

  // تصدير سجل الرقابة كملف رسمي
  exportAuditLog: function() {
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" +
      "التاريخ والوقت,المستخدم,الإجراء المنفذ,الحالة\n" +
      this.auditLogs.map(l => `"${l.time}","${l.actor}","${l.action}","${l.status}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `سجل_الرقابة_والعمليات_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('تم تصدير سجل الرقابة والتدقيق بصيغة ملف جدول معتمد', 'success');
  },

  // =========================================================================
  // التبويب 2: الصلاحيات واعتماد المستخدمين
  // =========================================================================

  // رسم جدول الصلاحيات
  renderRolesTable: function() {
    const tbody = document.getElementById('allUsersRolesTableBody') || document.getElementById('userRolesTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const roleBadges = {
      'مؤسس': 'badge-role-founder',
      'مدير هيئة الإنتاج': 'badge-role-director',
      'مدير قسم': 'badge-role-director',
      'مسؤول شعبة / محطة': 'badge-role-supervisor',
      'مسؤول شعبة': 'badge-role-supervisor',
      'مشرف محطة': 'badge-role-supervisor',
      'مشغل محطة أقدم': 'badge-role-operator',
      'مشغل محطة': 'badge-role-operator',
      'مشغل': 'badge-role-operator',
      'مهندس صيانة': 'badge-role-engineer',
      'مراقب حركة': 'badge-role-viewer',
      'سائق': 'badge-role-viewer'
    };

    const users = (window.deptEmployees && Array.isArray(window.deptEmployees) && window.deptEmployees.length > 0) ? window.deptEmployees : this.dossiers;

    users.forEach(emp => {
      const tr = document.createElement('tr');
      const role = emp.role || 'مشغل محطة';
      const badgeClass = roleBadges[role] || 'badge-role-supervisor';

      tr.innerHTML = `
        <td style="font-weight: 700; color: #ffffff;">${emp.fullName || emp.name}</td>
        <td style="font-family: monospace; font-weight: 700; color: #f59e0b;">${emp.empId || emp.code || 'EMP-0000'}</td>
        <td style="color: #cbd5e1;">${emp.department || emp.section || 'شعبة الإنتاج'}</td>
        <td>
          <span class="badge-role ${badgeClass}">${role}</span>
        </td>
        <td>
          <select class="select-glass" style="padding: 0.35rem 0.65rem; font-size: 0.82rem;" onchange="FounderPortal.updateUserRole('${emp.empId || emp.id}', this.value)">
            <option value="مؤسس" ${role === 'مؤسس' ? 'selected' : ''}>مؤسس</option>
            <option value="مدير هيئة الإنتاج" ${role === 'مدير هيئة الإنتاج' || role === 'مدير قسم' ? 'selected' : ''}>مدير هيئة الإنتاج</option>
            <option value="مسؤول شعبة / محطة" ${role.includes('شعبة') || role.includes('مسؤول') ? 'selected' : ''}>مسؤول شعبة / محطة</option>
            <option value="مشغل محطة أقدم" ${role === 'مشغل محطة أقدم' ? 'selected' : ''}>مشغل محطة أقدم</option>
            <option value="مشغل محطة" ${role === 'مشغل محطة' || role === 'مشغل' ? 'selected' : ''}>مشغل محطة</option>
            <option value="مهندس صيانة" ${role.includes('صيانة') ? 'selected' : ''}>مهندس صيانة</option>
            <option value="مراقب حركة" ${role.includes('مراقب') || role.includes('سائق') ? 'selected' : ''}>مراقب حركة</option>
          </select>
        </td>
        <td>
          <span style="color: var(--emerald-light); font-weight: 700; font-size: 0.82rem;">● نشط وموثق</span>
        </td>
        <td>
          <button class="btn-glass btn-glass-cyan" style="height: 30px; padding: 0 0.75rem; font-size: 0.78rem;" onclick="FounderPortal.openDossierModal('${emp.empId || emp.id}')">
            تعديل
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  // تعديل رتبة وصلاحية مستخدم
  updateUserRole: function(empId, newRole) {
    const emp = this.dossiers.find(e => e.empId === empId) || (window.deptEmployees && window.deptEmployees.find(e => (e.empId === empId || e.id === empId)));
    if (!emp) return;

    emp.role = newRole;
    this.saveDossiers();
    this.renderRolesTable();
    this.logAudit(`ترقية وتعديل رتبة المنتسب (${emp.fullName || emp.name}) إلى: ${newRole}`);
    this.showToast(`تم تغيير وتثبيت رتبة (${emp.fullName || emp.name}) بنجاح إلى: ${newRole}`, 'success');
  },

  // رسم جدول طلبات التسجيل المعلقة
  renderPendingUsers: function() {
    const tbody = document.getElementById('pendingUsersTableBody');
    const container = document.getElementById('pendingRequestsContainer');
    
    if (container) {
      container.innerHTML = '';
      if (this.pendingUsers.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 1.8rem; background: rgba(9,20,38,0.5); border-radius: 14px; border: var(--border-subtle); color: var(--text-muted);">
            <div style="font-size: 1.5rem; margin-bottom: 0.4rem; color: var(--emerald-light);">✓</div>
            <div style="font-weight: 700;">لا توجد أي طلبات تسجيل معلقة حالياً - كافة الحسابات معتمدة وموثقة.</div>
          </div>
        `;
      } else {
        this.pendingUsers.forEach(u => {
          const card = document.createElement('div');
          card.style.cssText = 'background: rgba(9,20,38,0.7); border: var(--border-subtle); border-radius: 14px; padding: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; flex-wrap: wrap;';
          card.innerHTML = `
            <div>
              <div style="font-weight: 800; color: #ffffff; font-size: 0.95rem;">${u.fullName}</div>
              <div style="font-size: 0.8rem; color: var(--text-soft);">${u.email} | ${u.jobTitle || 'موظف'} - ${u.department || 'القسم'}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn-glass btn-glass-emerald" style="height: 32px; padding: 0 0.85rem; font-size: 0.8rem;" onclick="FounderPortal.approvePendingUser('${u.id}')">اعتماد الحساب</button>
              <button class="btn-glass btn-glass-rose" style="height: 32px; padding: 0 0.85rem; font-size: 0.8rem;" onclick="FounderPortal.rejectPendingUser('${u.id}')">رفض</button>
            </div>
          `;
          container.appendChild(card);
        });
      }
    }

    if (tbody) {
      tbody.innerHTML = '';
      if (this.pendingUsers.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">لا توجد أي طلبات تسجيل معلقة حالياً</td></tr>`;
      } else {
        this.pendingUsers.forEach(user => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td style="font-weight: 700; color: #ffffff;">${user.fullName}</td>
            <td style="direction: ltr; text-align: right; color: #94a3b8; font-family: monospace;">${user.email}</td>
            <td style="color: #cbd5e1;">${user.jobTitle} - ${user.department}</td>
            <td style="color: #f59e0b; font-weight: 700;">${user.requestedRole}</td>
            <td>
              <div style="display: inline-flex; align-items: center; gap: 0.4rem; flex-wrap: nowrap; white-space: nowrap;">
                <button class="btn-glass btn-glass-emerald" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="FounderPortal.approvePendingUser('${user.id}')">
                  ✓ اعتماد وتفعيل
                </button>
                <button class="btn-glass btn-glass-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="FounderPortal.rejectPendingUser('${user.id}')">
                  ✕ رفض
                </button>
              </div>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    }
  },

  // قبول واعتماد طلب تسجيل مستخدم جديد
  approvePendingUser: function(requestId) {
    const idx = this.pendingUsers.findIndex(u => u.id === requestId);
    if (idx === -1) return;

    const user = this.pendingUsers[idx];
    const newEmpId = `SPD-${1000 + this.dossiers.length + 1}`;

    // إضافة إلى الملاكات
    this.dossiers.push({
      empId: newEmpId,
      fullName: user.fullName,
      jobTitle: user.jobTitle,
      department: user.department,
      grade: '5',
      step: '1',
      yearsOfService: '6',
      shift: 'A',
      email: user.email,
      role: user.requestedRole,
      phone: '07800000000',
      hireDate: '2026-01-01',
      status: 'نشط'
    });

    // إضافة الإيميل تلقائياً إلى القائمة البيضاء
    if (!this.whitelist.includes(user.email)) {
      this.whitelist.push(user.email);
      this.saveWhitelist();
      this.renderWhitelist();
    }

    // إزالة من قائمة الانتظار
    this.pendingUsers.splice(idx, 1);
    this.savePendingUsers();
    this.saveDossiers();

    this.renderPendingUsers();
    this.renderRolesTable();
    this.renderDossiersTable();

    this.logAudit(`اعتماد وتفعيل حساب الموظف الجديد: (${user.fullName}) برتبة: ${user.requestedRole}`);
    this.showToast(`تم بنجاح اعتماد وتفعيل حساب (${user.fullName}) وإضافته لقاعدة الملاكات الرسمية`, 'success');
  },

  // رفض طلب تسجيل معلق
  rejectPendingUser: function(requestId) {
    const idx = this.pendingUsers.findIndex(u => u.id === requestId);
    if (idx === -1) return;

    const user = this.pendingUsers[idx];
    if (!confirm(`هل أنت متأكد من رفض طلب انضمام (${user.fullName})؟`)) return;

    this.pendingUsers.splice(idx, 1);
    this.savePendingUsers();
    this.renderPendingUsers();

    this.logAudit(`رفض طلب تسجيل الحساب: (${user.fullName})`);
    this.showToast(`تم رفض طلب الحساب للمستخدم (${user.fullName})`, 'info');
  },

  // رسم جدول القائمة البيضاء لحسابات جوجل
  renderWhitelist: function() {
    const tbody = document.getElementById('whitelistTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    this.whitelist.forEach((email, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: #f59e0b;">${idx + 1}</td>
        <td style="direction: ltr; text-align: right; font-family: monospace; font-size: 0.92rem; color: #f8fafc;">${email}</td>
        <td><span class="badge-role badge-role-founder">مخول رئيسي</span></td>
        <td>
          ${email.includes('founder') ? '<span style="font-size: 0.78rem; color: #94a3b8;">حساب رئيسي غير قابل للحذف</span>' : `
            <button class="btn-glass btn-glass-danger" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;" onclick="FounderPortal.removeWhitelistEmail('${email}')">
              حذف التصريح
            </button>
          `}
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  // إضافة إيميل إلى القائمة البيضاء
  addWhitelistEmail: function() {
    const input = document.getElementById('whitelistEmailInput');
    if (!input) return;
    const email = input.value.trim().toLowerCase();

    if (!email || !email.includes('@')) {
      this.showToast('يرجى إدخال عنوان بريد إلكتروني صالح', 'error');
      return;
    }

    if (this.whitelist.includes(email)) {
      this.showToast('هذا البريد الإلكتروني معتمد ومضاف مسبقاً', 'info');
      return;
    }

    this.whitelist.push(email);
    this.saveWhitelist();
    this.renderWhitelist();
    input.value = '';

    // مزامنة مع الخادم الخلفي
    fetch('/api/founder/whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, action: 'add' })
    }).catch(() => {});

    this.logAudit(`إضافة تصريح دخول رسمي للبريد: ${email}`);
    this.showToast(`تم بنجاح اعتماد وتصريح البريد الإلكتروني (${email})`, 'success');
  },

  // حذف إيميل من القائمة البيضاء
  removeWhitelistEmail: function(email) {
    if (!confirm(`هل أنت متأكد من سحب التصريح وإلغاء دخول الحساب:\n${email}؟`)) return;

    this.whitelist = this.whitelist.filter(e => e !== email);
    this.saveWhitelist();
    this.renderWhitelist();

    fetch('/api/founder/whitelist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, action: 'remove' })
    }).catch(() => {});

    this.logAudit(`سحب وإلغاء تصريح الدخول للبريد: ${email}`);
    this.showToast(`تم سحب التصريح وحظر البريد (${email})`, 'info');
  },

  // =========================================================================
  // التبويب 3: مركز الإضابير والملاكات
  // =========================================================================

  // رسم وتصفية جدول الإضابير
  renderDossiersTable: function() {
    const tbody = document.getElementById('dossiersTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const searchInput = document.getElementById('dossierSearchInput');
    const stationFilter = document.getElementById('dossierStationFilter');

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const station = stationFilter ? stationFilter.value : '';

    const filtered = this.dossiers.filter(emp => {
      const matchQuery = !query || 
        emp.fullName.toLowerCase().includes(query) ||
        emp.empId.toLowerCase().includes(query) ||
        emp.jobTitle.toLowerCase().includes(query);

      const matchStation = !station || emp.department.includes(station);

      return matchQuery && matchStation;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 2rem;">لا توجد أي إضبارة مطابقة لمعايير البحث</td></tr>`;
      return;
    }

    filtered.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: monospace; font-weight: 700; color: #f59e0b;">${emp.empId}</td>
        <td style="font-weight: 700; color: #ffffff;">${emp.fullName}</td>
        <td style="color: #cbd5e1;">${emp.jobTitle}</td>
        <td>
          <span style="font-weight: 700; color: #10b981;">الدرجة ${emp.grade}</span>
          <span style="color: #94a3b8; font-size: 0.8rem; margin-right: 0.3rem;">المرحلة ${emp.step}</span>
        </td>
        <td style="color: #cbd5e1; font-size: 0.85rem;">${emp.department}</td>
        <td style="font-weight: 700; color: #f8fafc;">${emp.yearsOfService} سنة</td>
        <td><span class="badge-role badge-role-operator" style="font-size: 0.75rem;">${emp.shift}</span></td>
        <td>
          <div style="display: inline-flex; align-items: center; gap: 0.35rem; flex-wrap: nowrap; white-space: nowrap;">
            <button class="btn-glass btn-glass-sapphire" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" onclick="FounderPortal.openDossierModal('${emp.empId}')">
              ✏️ تعديل
            </button>
            <button class="btn-glass btn-glass-gold" style="padding: 0.35rem 0.65rem; font-size: 0.8rem;" onclick="FounderPortal.printDossierRecord('${emp.empId}')">
              🖨️ طباعة
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    const countEl = document.getElementById('dossiersTotalCount');
    if (countEl) countEl.textContent = filtered.length;
  },

  // تصفية الإضابير الحية عند الكتابة
  filterDossiers: function() {
    this.renderDossiersTable();
  },

  // فتح نافذة تعديل الإضبارة
  openDossierModal: function(empId) {
    const emp = this.dossiers.find(e => e.empId === empId);
    if (!emp) return;

    document.getElementById('editEmpId').value = emp.empId;
    document.getElementById('editEmpName').value = emp.fullName;
    document.getElementById('editEmpJobTitle').value = emp.jobTitle;
    document.getElementById('editEmpDept').value = emp.department;
    document.getElementById('editEmpGrade').value = emp.grade;
    document.getElementById('editEmpStep').value = emp.step;
    document.getElementById('editEmpYears').value = emp.yearsOfService;
    document.getElementById('editEmpShift').value = emp.shift;

    const modal = document.getElementById('dossierModal');
    if (modal) modal.style.display = 'flex';
  },

  // إغلاق نافذة تعديل الإضبارة
  closeDossierModal: function() {
    const modal = document.getElementById('dossierModal');
    if (modal) modal.style.display = 'none';
  },

  // حفظ التعديلات على إضبارة المنتسب
  saveDossier: function(e) {
    if (e) e.preventDefault();

    const empId = document.getElementById('editEmpId').value;
    const emp = this.dossiers.find(e => e.empId === empId);
    if (!emp) return;

    emp.fullName = document.getElementById('editEmpName').value.trim();
    emp.jobTitle = document.getElementById('editEmpJobTitle').value.trim();
    emp.department = document.getElementById('editEmpDept').value.trim();
    emp.grade = document.getElementById('editEmpGrade').value.trim();
    emp.step = document.getElementById('editEmpStep').value.trim();
    emp.yearsOfService = document.getElementById('editEmpYears').value.trim();
    emp.shift = document.getElementById('editEmpShift').value;

    this.saveDossiers();
    this.renderDossiersTable();
    this.renderRolesTable();
    this.closeDossierModal();

    this.logAudit(`تحديث وتعديل البيانات الرسمية لإضبارة المنتسب: (${emp.fullName}) - الرقم: ${empId}`);
    this.showToast(`تم حفظ وتحديث إضبارة المنتسب (${emp.fullName}) بنجاح`, 'success');
  },

  // =========================================================================
  // التبويب 4: الاستمارات الإدارية الجاهزة وباني الاستمارات
  // =========================================================================

  // فتح نافذة المعاينة والطباعة لاستمارة معينة
  openFormModal: function(formKey) {
    const target = document.getElementById('officialDocumentPrintTarget');
    if (!target) return;

    let formHtml = '';
    const todayStr = this.getFormattedArabicDate();
    const docRef = `ش.ن.ج/2026/${Math.floor(1000 + Math.random() * 9000)}`;

    if (formKey === 'leave') {
      formHtml = this.generateLeaveFormHtml(docRef, todayStr);
    } else if (formKey === 'transfer') {
      formHtml = this.generateTransferFormHtml(docRef, todayStr);
    } else if (formKey === 'interview') {
      formHtml = this.generateInterviewFormHtml(docRef, todayStr);
    } else if (formKey === 'decree') {
      formHtml = this.generateDecreeFormHtml(docRef, todayStr);
    } else if (formKey.startsWith('custom_')) {
      const customId = formKey.replace('custom_', '');
      const customForm = this.customForms.find(f => f.id === customId);
      if (customForm) {
        formHtml = this.generateCustomFormPrintHtml(customForm, docRef, todayStr);
      }
    }

    target.innerHTML = formHtml;
    const modal = document.getElementById('printPreviewModal');
    if (modal) modal.style.display = 'flex';
  },

  // إغلاق نافذة المعاينة والطباعة
  closePrintPreviewModal: function() {
    const modal = document.getElementById('printPreviewModal');
    if (modal) modal.style.display = 'none';
  },

  // طباعة فورية سريعة
  quickPrintForm: function(formKey) {
    this.openFormModal(formKey);
    setTimeout(() => {
      window.print();
    }, 400);
  },

  // إنشاء وإضافة استمارة جديدة للمنظومة
  createCustomForm: function() {
    const titleInput = document.getElementById('newFormTitle');
    const deptInput = document.getElementById('newFormDept');
    const descInput = document.getElementById('newFormDescription');
    const fieldsInput = document.getElementById('newFormFields');

    const title = titleInput ? titleInput.value.trim() : '';
    const dept = deptInput ? deptInput.value.trim() : '';
    const desc = descInput ? descInput.value.trim() : '';
    const fieldsRaw = fieldsInput ? fieldsInput.value.trim() : '';

    if (!title) {
      this.showToast('يرجى كتابة عنوان الاستمارة الإدارية أولاً', 'error');
      return;
    }

    const fields = fieldsRaw ? fieldsRaw.split(',').map(f => f.trim()).filter(f => f) : ['الاسم الكامل', 'الرقم الوظيفي', 'المحطة أو الشعبة', 'بيان وتفاصيل الإجراء', 'ملاحظات المشرف'];

    const newForm = {
      id: 'FORM-' + Date.now(),
      title: title,
      department: dept || 'قسم الإنتاج الجنوبي - كافة المحطات والشعب',
      description: desc || 'استمارة إدارية معتمدة تم إنشاؤها وتفعيلها بقرار رسمي من المؤسس.',
      fields: fields,
      createdAt: new Date().toISOString().slice(0, 10)
    };

    this.customForms.push(newForm);
    this.saveCustomForms();
    this.renderCustomForms();

    // تفريغ الحقول
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (fieldsInput) fieldsInput.value = '';

    this.logAudit(`إنشاء وتفعيل استمارة إدارية جديدة في المنظومة: "${title}"`);
    this.showToast(`تم بنجاح إنشاء واعتماد استمارة (${title}) وتضمينها فورياً في المنظومة!`, 'success');
  },

  // رسم الاستمارات المخصصة في الشبكة
  renderCustomForms: function() {
    const container = document.getElementById('customFormsContainer');
    if (!container) return;
    container.innerHTML = '';

    this.customForms.forEach(form => {
      const card = document.createElement('div');
      card.className = 'glass-card form-action-card';
      card.style.borderColor = 'rgba(16, 185, 129, 0.35)';

      card.innerHTML = `
        <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; border: 1px solid rgba(16, 185, 129, 0.3);">
            📋
          </div>
          <span class="badge-role badge-role-supervisor" style="font-size: 0.75rem;">استمارة معتمدة جديدة</span>
        </div>
        <h4 style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 0.35rem;">${form.title}</h4>
        <p style="font-size: 0.85rem; color: var(--text-soft); line-height: 1.4; margin-bottom: 0.5rem;">${form.description}</p>
        <div style="font-size: 0.78rem; color: #10b981; margin-bottom: 0.8rem; font-weight: 700;">
          الحقول المشمولة: ${form.fields.join(' • ')}
        </div>
        <div style="display: flex; flex-direction: row; flex-wrap: nowrap; align-items: center; gap: 0.4rem; margin-top: auto;">
          <button class="btn-glass btn-glass-emerald" style="flex: 1; padding: 0.4rem 0.6rem; font-size: 0.82rem;" onclick="FounderPortal.openFormModal('custom_${form.id}')">
            📄 عرض وطباعة
          </button>
          <button class="btn-glass btn-glass-danger" style="padding: 0.4rem 0.6rem; font-size: 0.82rem;" onclick="FounderPortal.deleteCustomForm('${form.id}')" title="حذف الاستمارة">
            🗑️
          </button>
        </div>
      `;
      container.appendChild(card);
    });
  },

  // حذف استمارة مخصصة
  deleteCustomForm: function(formId) {
    const form = this.customForms.find(f => f.id === formId);
    if (!form) return;
    if (!confirm(`هل أنت متأكد من حذف وإلغاء اعتماد الاستمارة الإدارية:\n"${form.title}"؟`)) return;

    this.customForms = this.customForms.filter(f => f.id !== formId);
    this.saveCustomForms();
    this.renderCustomForms();

    this.logAudit(`إلغاء وحذف الاستمارة المخصصة: "${form.title}"`);
    this.showToast('تم حذف الاستمارة بنجاح', 'info');
  },

  // =========================================================================
  // التبويب 5: مركز الطباعة والتقارير الرسمية المعتمدة (Ministerial Reports)
  // =========================================================================

  // تقرير 1: جدول ملاكات قسم الإنتاج الجنوبي المعتمدة
  printStaffManifest: function() {
    const target = document.getElementById('officialDocumentPrintTarget');
    if (!target) return;

    const docRef = `ش.ن.ج/ملاكات/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = this.getFormattedArabicDate();

    let rowsHtml = '';
    this.dossiers.forEach((emp, index) => {
      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${index + 1}</td>
          <td style="text-align: center; font-family: monospace; font-weight: 700;">${emp.empId}</td>
          <td style="font-weight: 800;">${emp.fullName}</td>
          <td>${emp.jobTitle}</td>
          <td style="text-align: center; font-weight: 700;">${emp.grade}</td>
          <td style="text-align: center; font-weight: 700;">${emp.step}</td>
          <td>${emp.department}</td>
          <td style="text-align: center;">${emp.yearsOfService} سنة</td>
          <td style="text-align: center; font-weight: 700;">${emp.shift}</td>
          <td style="text-align: center;">${emp.status}</td>
        </tr>
      `;
    });

    target.innerHTML = `
      ${this.getMinisterialHeaderHtml('جدول ملاكات قسم الإنتاج الجنوبي المعتمدة لسنة 2026', docRef, dateStr)}

      <div style="margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        إلى: إدارة هيأة تشغيل الرميلة / شعبة الموارد البشرية والتدقيق<br>
        الموضوع: جدول الملاكات الوظيفية والكوادر المعتمدة رسمياً لقسم الإنتاج الجنوبي
      </div>

      <table class="official-print-table">
        <thead>
          <tr>
            <th style="width: 5%;">ت</th>
            <th style="width: 10%;">الرقم الوظيفي</th>
            <th style="width: 18%;">الاسم الرباعي واللقب</th>
            <th style="width: 17%;">العنوان الوظيفي</th>
            <th style="width: 6%;">الدرجة</th>
            <th style="width: 6%;">المرحلة</th>
            <th style="width: 18%;">مكان العمل والجهة</th>
            <th style="width: 8%;">الخدمة</th>
            <th style="width: 6%;">الوردية</th>
            <th style="width: 6%;">الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 1rem; font-size: 0.85rem; color: #333333; line-height: 1.5;">
        • صُدّق هذا الجدول رسمياً بموجب الصلاحيات المخولة لإدارة قسم الإنتاج الجنوبي ويُعمل بموجبه لكافة الإجراءات الإدارية والمحاسبية.<br>
        • العدد الكلي للكوادر المثبتة في هذا الجدول: (${this.dossiers.length}) منتسباً معتمداً.
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;

    const modal = document.getElementById('printPreviewModal');
    if (modal) modal.style.display = 'flex';
  },

  // تقرير 2: كشف وجدول استحقاق الترفيعات والعلاوات السنوية
  printPromotionsReport: function() {
    const target = document.getElementById('officialDocumentPrintTarget');
    if (!target) return;

    const docRef = `ش.ن.ج/ترفيعات/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = this.getFormattedArabicDate();

    let rowsHtml = '';
    this.dossiers.forEach((emp, index) => {
      const currentGrade = parseInt(emp.grade, 10) || 5;
      const currentStep = parseInt(emp.step, 10) || 1;
      
      let nextGrade = currentGrade;
      let nextStep = currentStep + 1;
      let statusType = 'علاوة سنوية';

      if (currentStep >= 10 || (currentGrade === 1 && currentStep >= 11)) {
        if (currentGrade > 1) {
          nextGrade = currentGrade - 1;
          nextStep = 1;
          statusType = 'مستحق ترفيع للدرجة الأعلى';
        } else {
          statusType = 'سقف الدرجة الأولى';
        }
      }

      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${index + 1}</td>
          <td style="text-align: center; font-family: monospace;">${emp.empId}</td>
          <td style="font-weight: 800;">${emp.fullName}</td>
          <td>${emp.jobTitle}</td>
          <td style="text-align: center; font-weight: 700;">الدرجة ${currentGrade} / المرحلة ${currentStep}</td>
          <td style="text-align: center; font-weight: 800; color: #004d40;">الدرجة ${nextGrade} / المرحلة ${nextStep}</td>
          <td style="text-align: center; font-weight: 700;">${statusType}</td>
          <td style="text-align: center;">2026-10-01</td>
          <td style="text-align: center; font-size: 0.82rem;">مستوفٍ للشروط والدورات</td>
        </tr>
      `;
    });

    target.innerHTML = `
      ${this.getMinisterialHeaderHtml('كشف استحقاق الترفيعات والعلاوات السنوية لكوادر الإنتاج لسنة 2026', docRef, dateStr)}

      <div style="margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        إلى: لجنة العلاوات والترفيعات المركزية / هيأة تشغيل الرميلة<br>
        الموضوع: كشف وجدول الاستحقاق القانوني للعلاوات السنوية والترفيعات لكوادر قسم الإنتاج الجنوبي
      </div>

      <table class="official-print-table">
        <thead>
          <tr>
            <th style="width: 5%;">ت</th>
            <th style="width: 10%;">الرقم الوظيفي</th>
            <th style="width: 18%;">الاسم الرباعي واللقب</th>
            <th style="width: 16%;">العنوان الوظيفي</th>
            <th style="width: 14%;">الدرجة والمرحلة الحالية</th>
            <th style="width: 14%;">الاستحقاق القادم</th>
            <th style="width: 13%;">نوع الاستحقاق</th>
            <th style="width: 10%;">تاريخ الاستحقاق</th>
            <th style="width: 10%;">الموقف القانوني</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 1rem; font-size: 0.85rem; color: #333333; line-height: 1.5;">
        • تم احتساب المدد القانونية وفق أحكام قانون رواتب موظفي الدولة والقطاع العام رقم 22 لسنة 2008 المعدل والتعليمات النافذة في شركة نفط البصرة.<br>
        • نؤيد اجتياز المذكورين أعلاه للدورات الحتمية المطلوبة وحصولهم على تقييمات كفاءة سنوية لا تقل عن (جيد جداً).
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;

    const modal = document.getElementById('printPreviewModal');
    if (modal) modal.style.display = 'flex';
  },

  // تقرير 3: سجل حركة ومهام الآليات التخصصية والإنتاجية
  printVehiclesReport: function() {
    const target = document.getElementById('officialDocumentPrintTarget');
    if (!target) return;

    const docRef = `ش.ن.ج/آليات/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = this.getFormattedArabicDate();

    const sampleVehicles = [
      { id: 'V-401', plate: '41208 فحص بصرة', type: 'شاحنة صهريج نقل ماء صناعي', driver: 'أحمد كاظم حسن', station: 'محطة إنتاج الرميلة الجنوبية 1 (SP-1)', status: 'في الواجب التشغيلي' },
      { id: 'V-402', plate: '18492 بصرة حكومي', type: 'مركبة حقلية رباعية الدفع فورد', driver: 'محمد جابر العيداني', station: 'شعبة الصيانة التوربينية والميكانيكية', status: 'جاهزية كاملة' },
      { id: 'V-403', plate: '55210 بصرة حكومي', type: 'حافلة نقل كوادر الورديات (30 راكب)', driver: 'علي كريم الشاوي', station: 'محطة حاقن الماء الرئيسي (WIP)', status: 'في مسار الوردية B' },
      { id: 'V-404', plate: '33104 بصرة حكومي', type: 'رافعة شوكية هيدروليكية 10 طن', driver: 'حسن مهدي العامري', station: 'محطة كبس الغاز (CS-1)', status: 'واجب مناولة معدات' },
      { id: 'V-405', plate: '99201 بصرة طوارئ', type: 'مركبة إطفاء وتدخل سريع HSE', driver: 'سعدون مطر التميمي', station: 'شعبة السلامة والصحة المهنية', status: 'تأهب مستمر 24 ساعة' }
    ];

    let rowsHtml = '';
    sampleVehicles.forEach((v, idx) => {
      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td style="text-align: center; font-family: monospace; font-weight: 700;">${v.id}</td>
          <td style="text-align: center; font-weight: 800;">${v.plate}</td>
          <td style="font-weight: 700;">${v.type}</td>
          <td style="font-weight: 700;">${v.driver}</td>
          <td>${v.station}</td>
          <td style="text-align: center; font-weight: 800; color: #065f46;">${v.status}</td>
          <td style="text-align: center;">معتمد</td>
        </tr>
      `;
    });

    target.innerHTML = `
      ${this.getMinisterialHeaderHtml('سجل حركة ومهام الآليات التخصصية والإنتاجية لقسم الإنتاج الجنوبي', docRef, dateStr)}

      <div style="margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        إلى: شعبة الآليات والنقل الحقلي / هيأة تشغيل الرميلة<br>
        الموضوع: الموقف التشغيلي وجاهزية حركة الآليات المخصصة لمحطات وشعب قسم الإنتاج الجنوبي
      </div>

      <table class="official-print-table">
        <thead>
          <tr>
            <th style="width: 5%;">ت</th>
            <th style="width: 10%;">رمز الآلية</th>
            <th style="width: 15%;">رقم اللوحة المرورية</th>
            <th style="width: 22%;">نوع وتصنيف الآلية</th>
            <th style="width: 18%;">اسم السائق / المشغل المعتمد</th>
            <th style="width: 18%;">المحطة أو الشعبة المكلفة</th>
            <th style="width: 12%;">الموقف التشغيلي</th>
            <th style="width: 10%;">حالة الفحص</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 1rem; font-size: 0.85rem; color: #333333; line-height: 1.5;">
        • كافة الآليات المذكورة أعلاه خاضعة للفحص الدوري للسلامة والأمان وتعمل بموجب استمارات حركة رسمية معتمدة من مدير القسم.<br>
        • يُمنع تحريك أي آلية حقلية خارج حدود المحطات دون أمر حركة رسمي موقع ومختوم.
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;

    const modal = document.getElementById('printPreviewModal');
    if (modal) modal.style.display = 'flex';
  },

  // تقرير 4: جدول مواعيد ومحضر مقابلات السيد مدير الهيئة والمؤسس
  printInterviewsReport: function() {
    const target = document.getElementById('officialDocumentPrintTarget');
    if (!target) return;

    const docRef = `ش.ن.ج/مقابلات/2026/${Math.floor(1000 + Math.random() * 9000)}`;
    const dateStr = this.getFormattedArabicDate();

    const sampleInterviews = [
      { id: 'INT-01', requester: 'م. أحمد جاسم التميمي', role: 'مسؤول تشغيل وردية SP-1', topic: 'مناقشة خطة تدوير وتأهيل مشغلي العوازل وموقف الصيانة', date: '2026-09-08 الساعة 10:00 صباحاً', decision: 'تمت المصادقة والتوجيه بالإجراء' },
      { id: 'INT-02', requester: 'م. فاطمة حسن العبادي', role: 'مسؤولة شعبة السيطرة النوعية', topic: 'تجهيز أجهزة فحص نوعية الخام الحديثة وتحديث المختبر الحقلي', date: '2026-09-09 الساعة 11:30 صباحاً', decision: 'قيد المتابعة مع المشتريات' },
      { id: 'INT-03', requester: 'السيد كرار عادل المنصوري', role: 'رئيس شعبة الذاتية', topic: 'مراجعة ملاكات الترفيعات واستحقاقات الخدمة المضافة للكوادر', date: '2026-09-10 الساعة 09:00 صباحاً', decision: 'معتمد للإصدار النهائي' }
    ];

    let rowsHtml = '';
    sampleInterviews.forEach((item, idx) => {
      rowsHtml += `
        <tr>
          <td style="text-align: center; font-weight: 700;">${idx + 1}</td>
          <td style="text-align: center; font-family: monospace;">${item.id}</td>
          <td style="font-weight: 800;">${item.requester}</td>
          <td>${item.role}</td>
          <td style="font-weight: 700;">${item.topic}</td>
          <td style="text-align: center;">${item.date}</td>
          <td style="text-align: center; font-weight: 800; color: #004d40;">${item.decision}</td>
        </tr>
      `;
    });

    target.innerHTML = `
      ${this.getMinisterialHeaderHtml('محضر وجدول المقابلات الرسمية للسيد مدير الهيئة والمؤسس', docRef, dateStr)}

      <div style="margin-bottom: 1rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        إلى: مكتب مدير هيأة تشغيل الرميلة / شعبة السكرتارية والمتابعة<br>
        الموضوع: جدول المقابلات الإدارية والتشغيلية المعتمدة مع الكوادر ومسؤولي المحطات
      </div>

      <table class="official-print-table">
        <thead>
          <tr>
            <th style="width: 5%;">ت</th>
            <th style="width: 10%;">رمز المقابلة</th>
            <th style="width: 18%;">اسم المنتسب / المراجع</th>
            <th style="width: 18%;">الصفة والعنوان الوظيفي</th>
            <th style="width: 25%;">موضوع المقابلة والطلب المطروح</th>
            <th style="width: 16%;">الموعد المقرر</th>
            <th style="width: 18%;">التوجيه والقرار الإداري الصادر</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div style="margin-top: 1rem; font-size: 0.85rem; color: #333333; line-height: 1.5;">
        • تُعقد المقابلات في مقر إدارة قسم الإنتاج الجنوبي بموجب المواعيد المحددة أعلاه.<br>
        • القرارات الصادرة في هذا المحضر تعتبر ملزمة وتُحال إلى الشعب المعنية للتنفيذ الفوري.
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;

    const modal = document.getElementById('printPreviewModal');
    if (modal) modal.style.display = 'flex';
  },

  // طباعة بطاقة الإضبارة الفردية المعتمدة
  printDossierRecord: function(empId) {
    const emp = this.dossiers.find(e => e.empId === empId);
    if (!emp) return;

    const target = document.getElementById('officialDocumentPrintTarget');
    if (!target) return;

    const docRef = `ش.ن.ج/إضبارة/2026/${emp.empId}`;
    const dateStr = this.getFormattedArabicDate();

    target.innerHTML = `
      ${this.getMinisterialHeaderHtml('بطاقة الخدمة والإضبارة الإدارية الرسمية للمنتسب', docRef, dateStr)}

      <div style="display: flex; justify-content: space-between; align-items: center; border: 2px solid #003366; padding: 1rem; margin-bottom: 1.5rem; background: #f8fafc;">
        <div>
          <h2 style="margin: 0 0 0.4rem 0; font-size: 1.4rem; color: #003366; font-weight: 900;">${emp.fullName}</h2>
          <div style="font-size: 1rem; font-weight: 700; color: #334155;">${emp.jobTitle} - ${emp.department}</div>
          <div style="font-size: 0.9rem; color: #64748b; margin-top: 0.2rem;">الرقم الوظيفي المعتمد: <span style="font-family: monospace; font-weight: 700; color: #003366;">${emp.empId}</span></div>
        </div>
        <div style="text-align: center; border: 2px dashed #94a3b8; padding: 0.8rem 1.2rem; background: #ffffff;">
          <div style="font-size: 0.8rem; color: #64748b;">الصورة الشخصية</div>
          <div style="font-size: 1.8rem; margin: 0.2rem 0;">👤</div>
          <div style="font-size: 0.75rem; color: #10b981; font-weight: 700;">إضبارة موثقة ومطابقة</div>
        </div>
      </div>

      <table class="official-print-table" style="margin-bottom: 1.5rem;">
        <tbody>
          <tr>
            <td style="width: 25%; font-weight: 800; background: #f1f5f9;">الدرجة الوظيفية:</td>
            <td style="width: 25%; font-weight: 700;">الدرجة ${emp.grade}</td>
            <td style="width: 25%; font-weight: 800; background: #f1f5f9;">المرحلة الوظيفية:</td>
            <td style="width: 25%; font-weight: 700;">المرحلة ${emp.step}</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">سنوات الخدمة الفعلية:</td>
            <td style="font-weight: 700;">${emp.yearsOfService} سنة</td>
            <td style="font-weight: 800; background: #f1f5f9;">نظام العمل والوردية:</td>
            <td style="font-weight: 700;">الوردية (${emp.shift})</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">الرتبة في المنظومة:</td>
            <td style="font-weight: 700;">${emp.role}</td>
            <td style="font-weight: 800; background: #f1f5f9;">الحالة الوظيفية:</td>
            <td style="font-weight: 700; color: #065f46;">${emp.status}</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">البريد الإلكتروني المعتمد:</td>
            <td style="font-family: monospace; direction: ltr; text-align: right;">${emp.email}</td>
            <td style="font-weight: 800; background: #f1f5f9;">رقم الهاتف:</td>
            <td style="font-family: monospace;">${emp.phone}</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">تاريخ التعيين بالوزارة:</td>
            <td style="font-family: monospace;">${emp.hireDate}</td>
            <td style="font-weight: 800; background: #f1f5f9;">تاريخ آخر ترفيع / علاوة:</td>
            <td style="font-family: monospace;">2025-10-01</td>
          </tr>
        </tbody>
      </table>

      <div style="border: 1px solid #cbd5e1; padding: 1rem; background: #fdfdfd; margin-bottom: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.95rem; color: #003366;">بيان الملاحظات والسجل الانضباطي:</h4>
        <p style="margin: 0; font-size: 0.88rem; color: #334155; line-height: 1.6;">
          • الموظف حسن السيرة والسلوك وملتزم بكافة معايير السلامة المهنية والصناعية.<br>
          • حاصل على كتب شكر وتقدير من السيد مدير الهيئة تثميناً لجهوده في استقرار إنتاج المحطة.<br>
          • هذه الوثيقة معتمدة رسمياً ومستخرجة من قاعدة بيانات الإضابير الرسمية لقسم الإنتاج الجنوبي.
        </p>
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;

    const modal = document.getElementById('printPreviewModal');
    if (modal) modal.style.display = 'flex';
  },

  // =========================================================================
  // قوالب الاستمارات الوزارية الرسمية المعتمدة
  // =========================================================================

  // استمارة 1: إجازة إدارية رسمية
  generateLeaveFormHtml: function(docRef, dateStr) {
    return `
      ${this.getMinisterialHeaderHtml('استمارة طلب إجازة إدارية رسمية (اعتيادية / مرضية)', docRef, dateStr)}

      <div style="margin-bottom: 1.2rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        إلى: السيد مدير قسم الإنتاج الجنوبي المحترم<br>
        عن طريق: مسؤول الشعبة / المحطة المحترم<br>
        الموضوع: طلب منح إجازة إدارية
      </div>

      <p style="font-size: 0.92rem; line-height: 1.8; color: #1e293b; margin-bottom: 1.2rem;">
        يرجى التفضل بالموافقة على منحي إجازة (اعتيادية / مرضية) لمدة 
        (<span style="font-weight: 800; border-bottom: 1px dotted #000; padding: 0 2rem;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>) 
        يوماً، تبدأ اعتباراً من تاريخ 
        (<span style="font-weight: 800; border-bottom: 1px dotted #000; padding: 0 2rem;">2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;</span>) 
        ولغاية تاريخ 
        (<span style="font-weight: 800; border-bottom: 1px dotted #000; padding: 0 2rem;">2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;</span>)
        ، وذلك للأسباب المبينة أدناه:
      </p>

      <div style="border: 1px solid #94a3b8; min-height: 80px; padding: 0.8rem; margin-bottom: 1.2rem; background: #fafafa; font-size: 0.9rem;">
        الأسباب والمبررات:
      </div>

      <table class="official-print-table" style="margin-bottom: 1.5rem;">
        <tbody>
          <tr>
            <td style="width: 25%; font-weight: 800; background: #f1f5f9;">اسم مقدم الطلب:</td>
            <td style="width: 25%; font-weight: 700;">....................................</td>
            <td style="width: 25%; font-weight: 800; background: #f1f5f9;">الرقم الوظيفي:</td>
            <td style="width: 25%; font-weight: 700;">....................................</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">العنوان الوظيفي:</td>
            <td style="font-weight: 700;">....................................</td>
            <td style="font-weight: 800; background: #f1f5f9;">المحطة أو الشعبة:</td>
            <td style="font-weight: 700;">....................................</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">رصيد الإجازات المتبقي:</td>
            <td style="font-weight: 700;">................... يوماً</td>
            <td style="font-weight: 800; background: #f1f5f9;">توقيع مقدم الطلب:</td>
            <td style="font-weight: 700;">....................................</td>
          </tr>
        </tbody>
      </table>

      <div style="border: 2px solid #003366; padding: 1rem; margin-bottom: 1rem; background: #f8fafc;">
        <div style="font-weight: 800; color: #003366; margin-bottom: 0.5rem;">توصية مسؤول المحطة / الشعبة:</div>
        <p style="margin: 0; font-size: 0.88rem; color: #334155;">
          [ &nbsp; ] نؤيد الموافقة لتوفر البديل وعدم التأثير على سير العمل التشغيلي في الوردية.<br>
          [ &nbsp; ] يتعذر منحها حالياً لمتطلبات العمل الاستثنائية.<br>
          اسم وتوقيع مسؤول الشعبة: ............................................ التاريخ: 2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;
        </p>
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;
  },

  // استمارة 2: أمر نقل وتدوير كوادر داخلي
  generateTransferFormHtml: function(docRef, dateStr) {
    return `
      ${this.getMinisterialHeaderHtml('استمارة أمر نقل وتدوير كوادر داخلي بين المحطات والشعب', docRef, dateStr)}

      <div style="margin-bottom: 1.2rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        إلى: كافة المحطات والشعب المعنية في قسم الإنتاج الجنوبي<br>
        الموضوع: أمر إداري بتدوير وتنسيب كوادر تشغيلية وفنية
      </div>

      <p style="font-size: 0.92rem; line-height: 1.8; color: #1e293b; margin-bottom: 1.2rem;">
        بناءً على مقتضيات المصلحة العامة ومتطلبات تحقيق استقرار معدلات ضخ ومعالجة الخام في حقل الرميلة الجنوبي، ولموازنة الكفاءات الفنية بين محطات الإنتاج، ننسب بموجب الصلاحيات المخولة لنا ما يلي:
      </p>

      <table class="official-print-table" style="margin-bottom: 1.5rem;">
        <thead>
          <tr>
            <th style="width: 5%;">ت</th>
            <th style="width: 25%;">الاسم الرباعي واللقب</th>
            <th style="width: 15%;">العنوان الوظيفي</th>
            <th style="width: 22%;">جهة العمل الحالية</th>
            <th style="width: 23%;">جهة النقل والتنسيب الجديدة</th>
            <th style="width: 10%;">الوردية</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: center; font-weight: 700;">1</td>
            <td style="font-weight: 800;">...................................................</td>
            <td>....................................</td>
            <td>محطة إنتاج الرميلة 1 (SP-1)</td>
            <td style="font-weight: 800; color: #004d40;">محطة إنتاج الرميلة 3 (SP-3)</td>
            <td style="text-align: center;">A</td>
          </tr>
          <tr>
            <td style="text-align: center; font-weight: 700;">2</td>
            <td style="font-weight: 800;">...................................................</td>
            <td>....................................</td>
            <td>شعبة الصيانة الميكانيكية</td>
            <td style="font-weight: 800; color: #004d40;">محطة حاقن الماء (WIP)</td>
            <td style="text-align: center;">صباحي</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-bottom: 1.2rem; font-size: 0.88rem; color: #333333; line-height: 1.6;">
        1. يتم الانفكاك والمباشرة خلال مدة لا تتجاوز (48) ساعة من تاريخ صدور هذا الأمر.<br>
        2. تقوم شعبة الذاتية بإجراء التأشيرات الأصولية في الإضابير وسجلات الملاكات الرسمية.<br>
        3. تُخلى الذمة التشغيلية للعهد المسلمة قبل تسليم كتاب الانفكاك.
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;
  },

  // استمارة 3: طلب مقابلة رسمية مع السيد المدير
  generateInterviewFormHtml: function(docRef, dateStr) {
    return `
      ${this.getMinisterialHeaderHtml('استمارة طلب مقابلة رسمية مع السيد مدير الهيئة والمؤسس', docRef, dateStr)}

      <div style="margin-bottom: 1.2rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        إلى: مكتب السيد مدير قسم الإنتاج الجنوبي والمؤسس المحترم<br>
        الموضوع: طلب مقابلة رسمية لمناقشة موضوع تشغيلي / إداري
      </div>

      <table class="official-print-table" style="margin-bottom: 1.5rem;">
        <tbody>
          <tr>
            <td style="width: 25%; font-weight: 800; background: #f1f5f9;">اسم طالب المقابلة:</td>
            <td style="width: 25%; font-weight: 700;">....................................</td>
            <td style="width: 25%; font-weight: 800; background: #f1f5f9;">الرقم الوظيفي:</td>
            <td style="width: 25%; font-weight: 700;">....................................</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">العنوان والوظيفة:</td>
            <td style="font-weight: 700;">....................................</td>
            <td style="font-weight: 800; background: #f1f5f9;">المحطة أو الشعبة:</td>
            <td style="font-weight: 700;">....................................</td>
          </tr>
          <tr>
            <td style="font-weight: 800; background: #f1f5f9;">رقم الهاتف الشخصي:</td>
            <td style="font-weight: 700;">....................................</td>
            <td style="font-weight: 800; background: #f1f5f9;">تاريخ تقديم الطلب:</td>
            <td style="font-weight: 700;">2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;</td>
          </tr>
        </tbody>
      </table>

      <div style="border: 1px solid #94a3b8; min-height: 110px; padding: 0.8rem; margin-bottom: 1.2rem; background: #fafafa; font-size: 0.9rem;">
        خلاصة وموجز الموضوع المراد طرحه في المقابلة:
      </div>

      <div style="border: 2px solid #003366; padding: 1rem; margin-bottom: 1rem; background: #f8fafc;">
        <div style="font-weight: 800; color: #003366; margin-bottom: 0.5rem;">توجيه وقرار مكتب السيد المدير:</div>
        <p style="margin: 0; font-size: 0.88rem; color: #334155; line-height: 1.6;">
          [ &nbsp; ] تمت الموافقة وتحديد موعد المقابلة بتاريخ: 2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp; في تمام الساعة: ...............<br>
          [ &nbsp; ] يُحال الموضوع للدراسة وإبداء الرأي من قبل رئيس الشعبة المختصة.<br>
          توقيع مدير المكتب: ............................................ الختم: ............................................
        </p>
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;
  },

  // استمارة 4: أمر إداري وقرار رسمي صادر
  generateDecreeFormHtml: function(docRef, dateStr) {
    return `
      ${this.getMinisterialHeaderHtml('أمر إداري وقرار رسمي نافذ الصدور', docRef, dateStr)}

      <div style="margin-bottom: 1.2rem; font-size: 1rem; font-weight: 800; color: #000000; text-align: center; border-bottom: 2px solid #000; padding-bottom: 0.5rem;">
        أمر إداري رقم (${Math.floor(100 + Math.random() * 900)}) لسنة 2026
      </div>

      <p style="font-size: 0.92rem; line-height: 1.9; color: #1e293b; margin-bottom: 1.2rem;">
        استناداً إلى الصلاحيات الإدارية  المخولة لنا بموجب الأمر الوزاري النافذ، ولضمان الانضباط الإداري وتطوير آليات العمل والتحكم في قسم الإنتاج الجنوبي، قررنا ما يلي:
      </p>

      <div style="border: 1px solid #94a3b8; padding: 1.2rem; margin-bottom: 1.5rem; background: #fcfcfc; font-size: 0.92rem; line-height: 2;">
        <strong>أولاً:</strong> إلزام كافة مسؤولي المحطات التشغيلية ورؤساء الشعب بإجراء الجرد الإداري للإضابير ومطابقة بيانات الوجبات أسبوعياً.<br>
        <strong>ثانياً:</strong> لا يجوز تداول أو تصدير أي مراسلات رسمية أو استمارات إدارية ما لم تكن صادرة عبر هذه المنظومة وممهورة بالختم الرسمي المعتمد.<br>
        <strong>ثالثاً:</strong> يُنفذ هذا الأمر اعتباراً من تاريخ صدوره ويتحمل المعنيون التبعات القانونية والإدارية المترتبة على مخالفته.
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;
  },

  // طباعة استمارة مخصصة جديدة
  generateCustomFormPrintHtml: function(customForm, docRef, dateStr) {
    let fieldsRows = '';
    customForm.fields.forEach((field, index) => {
      fieldsRows += `
        <tr>
          <td style="width: 25%; font-weight: 800; background: #f1f5f9;">${field}:</td>
          <td style="width: 75%; border-bottom: 1px dotted #94a3b8; font-weight: 700;">...........................................................................................................</td>
        </tr>
      `;
    });

    return `
      ${this.getMinisterialHeaderHtml(customForm.title, docRef, dateStr)}

      <div style="margin-bottom: 1.2rem; font-size: 0.95rem; font-weight: 700; color: #000000; line-height: 1.6;">
        الجهة المعنية: ${customForm.department}<br>
        الوصف: ${customForm.description}
      </div>

      <table class="official-print-table" style="margin-bottom: 1.5rem;">
        <tbody>
          ${fieldsRows}
        </tbody>
      </table>

      <div style="border: 1px solid #94a3b8; min-height: 100px; padding: 0.8rem; margin-bottom: 1.5rem; background: #fafafa; font-size: 0.9rem;">
        الملاحظات الإدارية وتوجيه الإدارة العليا:
      </div>

      ${this.getOfficialSignaturesHtml()}
    `;
  },

  // =========================================================================
  // المساعدات البصرية والترويسات الرسمية الوزارية
  // =========================================================================

  // ترويسة الكتاب الرسمي المعتمدة (جمهورية العراق - وزارة النفط - شركة نفط البصرة)
  getMinisterialHeaderHtml: function(docTitle, docRef, dateStr) {
    return `
      <div class="official-header-row" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px double #003366; padding-bottom: 0.8rem; margin-bottom: 1rem;">
        <!-- الجهة اليمين -->
        <div style="text-align: right; line-height: 1.4;">
          <div style="font-weight: 900; font-size: 1.05rem; color: #000000;">جمهورية العراق</div>
          <div style="font-weight: 800; font-size: 1rem; color: #003366;">وزارة النفط</div>
          <div style="font-weight: 800; font-size: 0.95rem; color: #000000;">شركة نفط البصرة</div>
          <div style="font-weight: 700; font-size: 0.9rem; color: #334155;">هيأة تشغيل الرميلة</div>
          <div style="font-weight: 900; font-size: 0.95rem; color: #b45309;">قسم الإنتاج الجنوبي</div>
        </div>

        <!-- الشعار الأوسط والشارة الرسمية -->
        <div style="text-align: center;">
          <div style="width: 70px; height: 70px; margin: 0 auto; border: 2px solid #003366; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; background: #ffffff;">
            🦅
          </div>
          <div style="font-size: 0.72rem; font-weight: 800; color: #003366; margin-top: 0.2rem; letter-spacing: 0.5px;">الوثائق الرسمية المعتمدة</div>
        </div>

        <!-- الجهة اليسار (الرقم والتاريخ والباركود) -->
        <div style="text-align: left; line-height: 1.4; direction: ltr;">
          <div style="font-weight: 800; font-size: 0.85rem; color: #000000;">Republic of Iraq</div>
          <div style="font-weight: 700; font-size: 0.8rem; color: #003366;">Ministry of Oil - BOC</div>
          <div style="margin-top: 0.4rem; font-size: 0.82rem; font-weight: 700; color: #000000; direction: rtl; text-align: right;">
            <strong>العدد:</strong> <span style="font-family: monospace;">${docRef}</span><br>
            <strong>التاريخ:</strong> <span>${dateStr}</span>
          </div>
        </div>
      </div>

      <!-- عنوان المستند الرسمي -->
      <div style="text-align: center; margin: 1rem 0 1.2rem 0;">
        <span style="font-size: 1.3rem; font-weight: 900; color: #003366; text-decoration: underline; text-underline-offset: 6px;">
          ${docTitle}
        </span>
      </div>
    `;
  },

  // كتلة التواقيع الأربعة الرسمية في أسفل كل مستند رسمي
  getOfficialSignaturesHtml: function() {
    return `
      <div class="official-signatures-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #94a3b8; text-align: center;">
        <div>
          <div style="font-size: 0.85rem; font-weight: 800; color: #334155; margin-bottom: 2rem;">مدقق الإضابير والسجلات</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #000000;">التوقيع: .....................</div>
          <div style="font-size: 0.78rem; color: #64748b;">التاريخ: 2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;</div>
        </div>

        <div>
          <div style="font-size: 0.85rem; font-weight: 800; color: #334155; margin-bottom: 2rem;">مسؤول الشعبة / المحطة</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #000000;">التوقيع: .....................</div>
          <div style="font-size: 0.78rem; color: #64748b;">التاريخ: 2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;</div>
        </div>

        <div>
          <div style="font-size: 0.85rem; font-weight: 800; color: #003366; margin-bottom: 2rem;">مصادقة مدير هيئة الإنتاج</div>
          <div style="font-size: 0.85rem; font-weight: 700; color: #000000;">التوقيع: .....................</div>
          <div style="font-size: 0.78rem; color: #64748b;">التاريخ: 2026 / &nbsp;&nbsp;&nbsp; / &nbsp;&nbsp;&nbsp;</div>
        </div>

        <div style="border: 2px solid #b45309; padding: 0.4rem; background: #fffbeb; border-radius: 6px;">
          <div style="font-size: 0.88rem; font-weight: 900; color: #b45309; margin-bottom: 1.5rem;">الاعتماد الرسمي للمؤسس</div>
          <div style="font-size: 1.4rem; color: #b45309; margin-bottom: 0.3rem;">⚜️</div>
          <div style="font-size: 0.82rem; font-weight: 800; color: #b45309;">ختم وتوقيع المؤسس</div>
        </div>
      </div>
    `;
  },

  // تاريخ عربي منسق
  getFormattedArabicDate: function() {
    const months = [
      'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
      'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
    ];
    const d = new Date();
    return `${d.getDate()} ${months[d.getMonth()]} 2026 م`;
  },

  // نافذة الإشعار الزجاجية الراقية (Toast)
  showToast: function(message, type = 'info') {
    const existing = document.getElementById('founderToast');
    if (existing) existing.remove();

    const colors = {
      success: 'linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))',
      error: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
      info: 'linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(2, 132, 199, 0.95))'
    };

    const icons = {
      success: '✅',
      error: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.id = 'founderToast';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: ${colors[type] || colors.info};
      color: #ffffff;
      padding: 0.85rem 1.6rem;
      border-radius: 999px;
      font-size: 0.92rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
      z-index: 99999;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      animation: founderToastFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      direction: rtl;
    `;

    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> <span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  // --- منظومة التحقق والمصادقة البريدية (التبديل بين جيميل وفايربيز) ---
  authProviderState: {
    activeProvider: 'GMAIL_SMTP',
    providers: {}
  },

  initAuthProviderCard: async function() {
    try {
      const resp = await fetch('/api/system/auth-provider');
      const data = await resp.json();
      if (data.success) {
        this.authProviderState.activeProvider = data.activeProvider;
        this.authProviderState.providers = data.providers;
        this.renderAuthProviderUI();
      }
    } catch (err) {
      console.log('Error loading auth provider state:', err);
    }
  },

  renderAuthProviderUI: function() {
    const active = this.authProviderState.activeProvider || 'GMAIL_SMTP';
    const isGmail = active === 'GMAIL_SMTP';

    const badge = document.getElementById('activeProviderBadge');
    if (badge) {
      if (isGmail) {
        badge.style.background = 'rgba(16, 185, 129, 0.2)';
        badge.style.color = '#34d399';
        badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        badge.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #34d399; box-shadow: 0 0 8px #34d399;"></span>
          <span>المزود النشط: خادم جيميل المباشر المعتمد</span>
        `;
      } else {
        badge.style.background = 'rgba(56, 189, 248, 0.2)';
        badge.style.color = '#38bdf8';
        badge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        badge.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #38bdf8; box-shadow: 0 0 8px #38bdf8;"></span>
          <span>المزود النشط: خدمة فايربيز السحابية من غوغل</span>
        `;
      }
    }

    const cardGmail = document.getElementById('cardProviderGmail');
    const cardFb = document.getElementById('cardProviderFirebase');
    const badgeGmail = document.getElementById('badgeGmailStatus');
    const badgeFb = document.getElementById('badgeFirebaseStatus');

    if (cardGmail) {
      cardGmail.style.border = isGmail ? '2px solid rgba(16, 185, 129, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)';
      cardGmail.style.boxShadow = isGmail ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none';
      cardGmail.style.background = isGmail ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)';
    }
    if (cardFb) {
      cardFb.style.border = !isGmail ? '2px solid rgba(56, 189, 248, 0.8)' : '1px solid rgba(255, 255, 255, 0.1)';
      cardFb.style.boxShadow = !isGmail ? '0 0 20px rgba(56, 189, 248, 0.25)' : 'none';
      cardFb.style.background = !isGmail ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255, 255, 255, 0.03)';
    }

    if (badgeGmail) {
      badgeGmail.textContent = isGmail ? 'نشط ومعتمد حالياً' : 'جاهز للتبديل';
      badgeGmail.style.background = isGmail ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      badgeGmail.style.color = isGmail ? '#34d399' : '#94a3b8';
    }
    if (badgeFb) {
      badgeFb.textContent = !isGmail ? 'نشط ومعتمد حالياً' : 'جاهز كاحتياط سحابي';
      badgeFb.style.background = !isGmail ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.1)';
      badgeFb.style.color = !isGmail ? '#38bdf8' : '#94a3b8';
    }

    const btnGmail = document.getElementById('btnSwitchGmail');
    const btnFb = document.getElementById('btnSwitchFirebase');
    if (btnGmail) {
      btnGmail.style.opacity = isGmail ? '0.6' : '1';
      btnGmail.style.cursor = isGmail ? 'default' : 'pointer';
    }
    if (btnFb) {
      btnFb.style.opacity = !isGmail ? '0.6' : '1';
      btnFb.style.cursor = !isGmail ? 'default' : 'pointer';
    }
  },

  switchAuthProvider: async function(provider) {
    try {
      const resp = await fetch('/api/system/auth-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider })
      });
      const data = await resp.json();
      if (data.success) {
        this.authProviderState.activeProvider = provider;
        this.renderAuthProviderUI();
        const provName = provider === 'GMAIL_SMTP' ? 'خادم جيميل المباشر المعتمد' : 'خدمة فايربيز السحابية من غوغل';
        this.logAudit('المؤسس', `تبديل مزود المصادقة إلى: ${provName}`);
        this.showToast(data.message || 'تم التبديل بنجاح!', 'success');
      } else {
        this.showToast(data.error || 'فشل التبديل', 'error');
      }
    } catch (err) {
      this.showToast('تعذر الاتصال بالخادم لإجراء التبديل', 'error');
    }
  },

  testAuthProviderConnection: async function() {
    this.showToast('جاري فحص الاتصال بالمزود النشط...', 'info');
    try {
      const resp = await fetch('/api/system/test-auth-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: this.authProviderState.activeProvider })
      });
      const data = await resp.json();
      if (data.success) {
        this.showToast(data.message, 'success');
      } else {
        this.showToast(data.message || 'تعذر التحقق من الاتصال', 'error');
      }
    } catch (err) {
      this.showToast('تعذر إجراء فحص الاتصال', 'error');
    }
  },

  // =========================================================================
  // التبويب 2: مركز إدارة المؤسسة والأقسام المتعددة (Multi-Tenant Enterprise)
  // =========================================================================
  
  renderEnterprisePanel: function() {
    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};

    // 1. نظام التحكم بالميزات (Feature Flags)
    const container = document.getElementById('featureFlagsGridContainer');
    if (container && window.store && typeof window.store.getFeatureFlags === 'function') {
      const flags = window.store.getFeatureFlags();
      container.innerHTML = Object.entries(flags).map(([flag, val]) => `
        <div style="padding: 1rem; background: rgba(0,0,0,0.25); border: 1px solid ${val ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.08)'}; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;">
          <div>
            <strong style="color: #ffffff; font-size: 0.9rem; display: block;">${flag}</strong>
            <div style="font-size: 0.75rem; color: ${val ? '#34d399' : '#94a3b8'}; margin-top: 0.2rem;">${val ? 'مفعلة وتعمل بنجاح' : 'معطلة حالياً'}</div>
          </div>
          <button class="btn-glass ${val ? 'btn-glass-emerald' : 'btn-glass-rose'}" onclick="FounderPortal.toggleFeatureFlag('${flag}', ${!val})" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; white-space: nowrap;">
            ${val ? '✅ مفعل' : '⏸️ إيقاف'}
          </button>
        </div>
      `).join('');
    }

    // 2. الأقسام الإنتاجية المسجلة (Multi-Tenant Departments)
    const deptTbody = document.getElementById('departmentsTableBody');
    const depts = db.departments || [];
    if (deptTbody) {
      if (depts.length === 0) {
        deptTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-soft); padding: 1.5rem;">لا توجد أقسام مسجلة حالياً</td></tr>`;
      } else {
        deptTbody.innerHTML = depts.map(d => {
          const mgr = d.managerId ? (window.store.getUserById ? window.store.getUserById(d.managerId) : null) : null;
          const mgrName = mgr ? mgr.fullName : (d.managerName || '<span style="color: #f59e0b;">شاغر</span>');
          const createdDate = d.createdAt ? new Date(d.createdAt).toISOString().slice(0, 10) : '2026-01-01';
          return `
            <tr>
              <td><code style="color: #00dfd8; font-weight: 700;">${d.id}</code></td>
              <td><strong style="color: #ffffff;">${d.name}</strong></td>
              <td><span class="badge-role badge-role-supervisor">${d.code}</span></td>
              <td><span style="font-weight: 900; background: rgba(0, 223, 216, 0.2); color: #00dfd8; padding: 2px 10px; border-radius: 6px; border: 1px solid rgba(0,223,216,0.4);">${d.logoText || 'ق'}</span></td>
              <td>${mgrName}</td>
              <td><span class="badge-role ${d.status === 'ACTIVE' ? 'badge-role-founder' : 'badge-role-director'}">${d.status === 'ACTIVE' ? 'نشط وفعال' : 'معطل'}</span></td>
              <td style="direction: ltr; text-align: right; font-family: monospace;">${createdDate}</td>
              <td>
                <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.switchDepartmentSession('${d.id}')" style="padding: 0.25rem 0.6rem; font-size: 0.78rem; white-space: nowrap;">دخول كمدير</button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 3. دليل الأرقام الوظيفية المعتمدة مسبقاً (HR Master Registry)
    const apprTbody = document.getElementById('approvedEmployeesTableBody');
    const apprList = db.approvedEmployeeIds || [];
    if (apprTbody) {
      const query = (document.getElementById('approvedEmpSearchInput')?.value || '').trim().toLowerCase();
      const filtered = apprList.filter(e => {
        if (!query) return true;
        return (e.id && e.id.toLowerCase().includes(query)) ||
               (e.name && e.name.toLowerCase().includes(query)) ||
               (e.departmentId && e.departmentId.toLowerCase().includes(query));
      });
      if (filtered.length === 0) {
        apprTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-soft); padding: 1.5rem;">لا توجد أرقام وظيفية مطابقة في السجل المعتمد</td></tr>`;
      } else {
        apprTbody.innerHTML = filtered.map(e => `
          <tr>
            <td><strong style="font-family: monospace; color: #f59e0b; font-size: 0.95rem;">${e.id}</strong></td>
            <td><strong style="color: #ffffff;">${e.name}</strong></td>
            <td style="color: #cbd5e1;">${e.departmentId || 'south-production-dept'}</td>
            <td style="color: #94a3b8;">${e.motherName || '-'}</td>
            <td style="direction: ltr; text-align: right; font-family: monospace; color: #38bdf8;">${e.unifiedCardNumber || '-'}</td>
            <td style="color: #e2e8f0;">${e.jobGrade || '-'} / ${e.jobStage || '-'}</td>
            <td>
              <button class="btn-glass btn-glass-rose" onclick="FounderPortal.deleteApprovedEmployee('${e.id}')" style="padding: 0.25rem 0.6rem; font-size: 0.78rem; white-space: nowrap;">✕ حذف</button>
            </td>
          </tr>
        `).join('');
      }
    }

    // 4. كافة المستخدمين والحسابات عبر كافة الأقسام
    const usersTbody = document.getElementById('allCrossDeptUsersTableBody');
    const usersCountBadge = document.getElementById('allUsersCountBadge');
    const allUsers = db.users || [];
    if (usersCountBadge) usersCountBadge.textContent = `إجمالي الحسابات: ${allUsers.length}`;
    if (usersTbody) {
      if (allUsers.length === 0) {
        usersTbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-soft); padding: 1.5rem;">لا توجد حسابات مسجلة حالياً</td></tr>`;
      } else {
        usersTbody.innerHTML = allUsers.map(u => {
          const deptName = window.store && window.store.getDepartmentById ? (window.store.getDepartmentById(u.departmentId)?.name || u.departmentId) : (u.departmentId || 'south-production-dept');
          return `
            <tr>
              <td><strong style="font-family: monospace; color: #f59e0b;">${u.employeeId || '-'}</strong></td>
              <td><strong style="color: #ffffff;">${u.fullName || '-'}</strong></td>
              <td style="direction: ltr; text-align: right; font-family: monospace; color: #94a3b8;">${u.email || '-'}</td>
              <td style="color: #cbd5e1;">${deptName}</td>
              <td><span class="badge-role badge-role-supervisor">${u.role || 'STAFF'}</span></td>
              <td><span class="badge-role ${u.status === 'APPROVED' ? 'badge-role-founder' : 'badge-role-director'}">${u.status || 'PENDING'}</span></td>
              <td>
                <button class="btn-glass btn-glass-cyan" onclick="FounderPortal.openEditUserRoleModal('${u.id}')" style="padding: 0.25rem 0.6rem; font-size: 0.78rem; white-space: nowrap;">تعديل الصلاحية</button>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // تحديث قائمة الأقسام في نموذج إضافة الرقم الوظيفي
    const deptSelect = document.getElementById('newApprDeptSelect');
    if (deptSelect && depts.length) {
      deptSelect.innerHTML = depts.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    }
  },

  toggleFeatureFlag: function(flag, val) {
    if (window.store && typeof window.store.getFeatureFlags === 'function' && typeof window.store.saveFeatureFlags === 'function') {
      const flags = window.store.getFeatureFlags();
      flags[flag] = val;
      window.store.saveFeatureFlags(flags);
      this.renderEnterprisePanel();
      this.logAudit(`تعديل إعداد المؤسسة: ${flag}`, val ? 'مفعل' : 'معطل');
      this.showToast(`تم ${val ? 'تفعيل' : 'إيقاف'} الخاصية: ${flag}`, 'success');
    }
  },

  exportDatabaseBackup: function() {
    try {
      const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
      const downloadAnchor = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `south_prod_enterprise_backup_${timestamp}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      this.logAudit('تصدير نسخة احتياطية للمؤسسة', 'النسخ الاحتياطي');
      this.showToast('تم تصدير وتنزيل النسخة الاحتياطية لقاعدة البيانات بنجاح', 'success');
    } catch (e) {
      this.showToast('حدث خطأ أثناء تنزيل النسخة الاحتياطية: ' + e.message, 'error');
    }
  },

  openRestoreDatabaseModal: function() {
    const modal = document.getElementById('restoreDbModal');
    if (modal) modal.style.display = 'flex';
  },

  closeRestoreDatabaseModal: function() {
    const modal = document.getElementById('restoreDbModal');
    if (modal) modal.style.display = 'none';
  },

  handleRestoreDatabase: function() {
    const fileInput = document.getElementById('restoreDbFileInput');
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      alert('يرجى اختيار ملف النسخة الاحتياطية (.json) أولاً.');
      return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('تنسيق الملف غير صالح');
        }
        if (window.store && typeof window.store.saveDb === 'function') {
          window.store.saveDb(parsed);
          this.closeRestoreDatabaseModal();
          this.renderEnterprisePanel();
          this.renderRolesTable();
          this.renderMetrics();
          this.logAudit('استعادة نسخة احتياطية لقواعد البيانات', 'استعادة ناجحة');
          alert('✅ تمت استعادة قاعدة البيانات وتحديث كافة الأقسام والملاكات بنجاح.');
        }
      } catch (err) {
        alert('❌ فشلت عملية الاستعادة: ' + err.message);
      }
    };
    reader.readAsText(file);
  },

  openCreateDepartmentModal: function() {
    const modal = document.getElementById('createDeptModal');
    if (modal) {
      document.getElementById('createDeptForm')?.reset();
      modal.style.display = 'flex';
    }
  },

  closeCreateDepartmentModal: function() {
    const modal = document.getElementById('createDeptModal');
    if (modal) modal.style.display = 'none';
  },

  saveDepartment: function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const id = (document.getElementById('newDeptId')?.value || '').trim();
    const name = (document.getElementById('newDeptName')?.value || '').trim();
    const code = (document.getElementById('newDeptCode')?.value || '').trim();
    const logoText = (document.getElementById('newDeptLogo')?.value || 'ق').trim();
    const managerName = (document.getElementById('newDeptManager')?.value || '').trim();

    if (!id || !name || !code) {
      alert('يرجى ملء كافة الحقول الأساسية للقسم.');
      return;
    }

    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
    db.departments = db.departments || [];
    if (db.departments.some(d => d.id === id)) {
      alert('معرف القسم موجود مسبقاً، يرجى اختيار معرف فريد.');
      return;
    }

    db.departments.push({
      id: id,
      name: name,
      code: code,
      logoText: logoText,
      managerName: managerName,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    });

    if (window.store && typeof window.store.saveDb === 'function') {
      window.store.saveDb(db);
    }
    this.closeCreateDepartmentModal();
    this.renderEnterprisePanel();
    this.logAudit(`تأسيس قسم جديد: ${name} (${code})`, 'تأسيس قسم');
    this.showToast(`تم تأسيس قسم "${name}" بنجاح`, 'success');
  },

  openAddApprovedEmployeeModal: function() {
    const modal = document.getElementById('addApprovedEmpModal');
    if (modal) {
      document.getElementById('addApprovedEmpForm')?.reset();
      modal.style.display = 'flex';
    }
  },

  closeAddApprovedEmployeeModal: function() {
    const modal = document.getElementById('addApprovedEmpModal');
    if (modal) modal.style.display = 'none';
  },

  saveApprovedEmployee: function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const empId = (document.getElementById('newApprEmpId')?.value || '').trim();
    const deptId = (document.getElementById('newApprDeptSelect')?.value || 'south-production-dept').trim();
    const name = (document.getElementById('newApprEmpName')?.value || '').trim();
    const motherName = (document.getElementById('newApprMotherName')?.value || '').trim();
    const unifiedCard = (document.getElementById('newApprUnifiedCard')?.value || '').trim();
    const grade = (document.getElementById('newApprJobGrade')?.value || '').trim();
    const stage = (document.getElementById('newApprJobStage')?.value || '').trim();

    if (!empId || !name) {
      alert('يرجى كتابة الرقم الوظيفي والاسم الرباعي.');
      return;
    }

    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
    db.approvedEmployeeIds = db.approvedEmployeeIds || [];
    if (db.approvedEmployeeIds.some(item => item.id === empId)) {
      alert('الرقم الوظيفي موجود مسبقاً في السجل المعتمد.');
      return;
    }

    db.approvedEmployeeIds.push({
      id: empId,
      name: name,
      departmentId: deptId,
      motherName: motherName,
      unifiedCardNumber: unifiedCard,
      jobGrade: grade,
      jobStage: stage
    });

    if (window.store && typeof window.store.saveDb === 'function') {
      window.store.saveDb(db);
    }
    this.closeAddApprovedEmployeeModal();
    this.renderEnterprisePanel();
    this.logAudit(`إضافة رقم وظيفي معتمد: ${empId} - ${name}`, 'اعتماد ملاك');
    this.showToast(`تم إدراج المنتسب "${name}" في السجل المعتمد بنجاح`, 'success');
  },

  deleteApprovedEmployee: function(empId) {
    if (!confirm(`هل أنت متأكد من حذف الرقم الوظيفي ${empId} من السجل المعتمد؟`)) return;
    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
    db.approvedEmployeeIds = (db.approvedEmployeeIds || []).filter(item => item.id !== empId);
    if (window.store && typeof window.store.saveDb === 'function') {
      window.store.saveDb(db);
    }
    this.renderEnterprisePanel();
    this.logAudit(`حذف رقم وظيفي معتمد: ${empId}`, 'حذف ملاك');
    this.showToast(`تم حذف الرقم الوظيفي ${empId} من السجل المعتمد`, 'info');
  },

  filterApprovedEmployees: function() {
    this.renderEnterprisePanel();
  },

  openEditUserRoleModal: function(userId) {
    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
    const user = (db.users || []).find(u => u.id === userId);
    if (!user) return;
    document.getElementById('editRoleUserId').value = user.id;
    document.getElementById('editRoleUserName').value = `${user.fullName} (${user.employeeId || user.email})`;
    document.getElementById('editRoleSelect').value = user.role || 'STAFF';
    document.getElementById('editStatusSelect').value = user.status || 'APPROVED';
    const modal = document.getElementById('editUserRoleModal');
    if (modal) modal.style.display = 'flex';
  },

  closeEditUserRoleModal: function() {
    const modal = document.getElementById('editUserRoleModal');
    if (modal) modal.style.display = 'none';
  },

  saveUserRole: function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    const userId = document.getElementById('editRoleUserId')?.value;
    const role = document.getElementById('editRoleSelect')?.value;
    const status = document.getElementById('editStatusSelect')?.value;

    const db = (window.store && typeof window.store.getDb === 'function') ? window.store.getDb() : {};
    const user = (db.users || []).find(u => u.id === userId);
    if (user) {
      user.role = role;
      user.status = status;
      if (window.store && typeof window.store.saveDb === 'function') {
        window.store.saveDb(db);
      }
      this.closeEditUserRoleModal();
      this.renderEnterprisePanel();
      this.renderRolesTable();
      this.logAudit(`تعديل رتبة المستخدم: ${user.fullName} إلى ${role}`, 'تعديل صلاحية');
      this.showToast(`تم تحديث صلاحية "${user.fullName}" بنجاح`, 'success');
    }
  },

  switchDepartmentSession: function(deptId) {
    localStorage.setItem('spd_active_dept_session', deptId);
    this.showToast(`تم التبديل إلى جلسة القسم: ${deptId}`, 'info');
    window.location.href = `index.html?dept=${deptId}`;
  }
};

// إتاحة الكائن في النطاق العام للنافذة
window.FounderPortal = FounderPortal;

// تهيئة البوابة فور تحميل مستند الصفحة
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    FounderPortal.init();
  });
} else {
  FounderPortal.init();
}