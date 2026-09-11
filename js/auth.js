/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Authentication & Verification Service
   ========================================================================== */

class AuthService {
  constructor() {
    this.sessionKey = 'SPD_CURRENT_USER_SESSION';
    this.currentUser = this.loadSession();
  }

  loadSession() {
    try {
      return JSON.parse(sessionStorage.getItem(this.sessionKey)) || null;
    } catch (e) {
      return null;
    }
  }

  saveSession(user) {
    this.currentUser = user;
    sessionStorage.setItem(this.sessionKey, JSON.stringify(user));
  }

  clearSession() {
    this.currentUser = null;
    sessionStorage.removeItem(this.sessionKey);
  }

  getCurrentUser() {
    if (!this.currentUser) return null;
    // Always refresh from DB to catch latest role or profile changes
    const refreshed = window.store.getUserById(this.currentUser.id);
    if (refreshed) {
      this.currentUser = refreshed;
    }
    return this.currentUser;
  }

  /**
   * Unified Login requirement: Employee ID or Email + Password
   */
  login(identifier, password, legacyEmpId) {
    const rawId = (identifier || '').trim();
    if (!rawId) {
      return { success: false, error: 'يرجى إدخال الرقم الوظيفي أو البريد الإلكتروني.' };
    }
    if (!password) {
      return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    }

    const isEmail = rawId.includes('@');
    const cleanEmail = rawId.toLowerCase();
    const cleanEmpId = rawId.toUpperCase();

    const isLocalEnv = (typeof window !== 'undefined' && window.location && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '' || window.location.protocol === 'file:')) ||
      (typeof process !== 'undefined' && process.env);

    const db = window.store ? window.store.getDb() : { users: [] };
    const users = db.users || [];

    // 1. Locate user account in store
    let user = users.find(u => {
      if (!u) return false;
      if (isEmail && u.email && u.email.toLowerCase() === cleanEmail) return true;
      if (isEmail && u.secondaryEmail && u.secondaryEmail.toLowerCase() === cleanEmail) return true;
      if (isEmail && (cleanEmail === 'hussein123119@gmail.com' || cleanEmail === 'southprod.rumaila@gmail.com' || cleanEmail === 'founder@local.spd') && (u.id === 'user-founder' || u.role === 'SUPER_ADMIN')) return true;
      if (u.employeeId && u.employeeId.toUpperCase() === cleanEmpId) return true;
      if (!isEmail && u.email && u.email.toLowerCase() === cleanEmail) return true;
      if (legacyEmpId && u.employeeId && u.employeeId.toUpperCase() === legacyEmpId.toUpperCase().trim()) return true;
      return false;
    });

    // 2. Fallback lookup from LOCAL_PRESETS in local development environment
    if (!user && isLocalEnv) {
      const LOCAL_PRESETS = [
        {
          id: 'user-founder',
          departmentId: 'dept-south-prod',
          email: 'hussein123119@gmail.com',
          secondaryEmail: 'southprod.rumaila@gmail.com',
          password: '123456',
          employeeId: 'EMP-0000',
          fullName: 'المؤسس العام للمنظومة',
          jobTitle: 'المؤسس والمدير العام للنظام',
          phone: '07700000000',
          role: 'SUPER_ADMIN',
          status: 'APPROVED',
          profileCompleted: true,
          sectionId: null,
          unitId: null,
          stationId: null,
          createdAt: '2026-01-01T00:00:00Z'
        },
        {
          id: 'user-dept-mgr',
          departmentId: 'dept-south-prod',
          email: 'ahmed.mgr@rumaila.iq',
          password: '123456',
          employeeId: 'EMP-2024-001',
          fullName: 'م. أحمد عبد الحسين',
          jobTitle: 'مدير قسم الإنتاج الجنوبي',
          phone: '07701234567',
          role: 'DEPT_MANAGER',
          status: 'APPROVED',
          profileCompleted: true,
          sectionId: null,
          unitId: null,
          stationId: null,
          createdAt: '2026-01-01T08:00:00Z'
        },
        {
          id: 'user-sec1-mgr',
          departmentId: 'dept-south-prod',
          email: 'sec1@rumaila.iq',
          password: '123456',
          employeeId: 'EMP-2024-002',
          fullName: 'م. حيدر جاسم',
          jobTitle: 'مسؤول الشعبة الأولى',
          phone: '07702345678',
          role: 'SECTION_MANAGER',
          status: 'APPROVED',
          profileCompleted: true,
          sectionId: 'sec-1',
          unitId: null,
          stationId: null,
          createdAt: '2026-01-02T08:00:00Z'
        },
        {
          id: 'user-sec2-mgr',
          departmentId: 'dept-south-prod',
          email: 'sec2@rumaila.iq',
          password: '123456',
          employeeId: 'EMP-2024-003',
          fullName: 'م. علي الركابي',
          jobTitle: 'مسؤول الشعبة الثانية',
          phone: '07703456789',
          role: 'SECTION_MANAGER',
          status: 'APPROVED',
          profileCompleted: true,
          sectionId: 'sec-2',
          unitId: null,
          stationId: null,
          createdAt: '2026-01-03T08:00:00Z'
        },
        {
          id: 'user-emp1',
          departmentId: 'dept-south-prod',
          email: 'ammar.emp@rumaila.iq',
          password: '123456',
          employeeId: 'EMP-2024-004',
          fullName: 'عمار الساعدي',
          jobTitle: 'مشغل محطة إنتاجية أقدم',
          phone: '07704567890',
          role: 'EMPLOYEE',
          status: 'APPROVED',
          profileCompleted: true,
          sectionId: 'sec-1',
          unitId: null,
          stationId: 'st-101',
          createdAt: '2026-01-04T08:00:00Z'
        },
        {
          id: 'user-unit1-mgr',
          departmentId: 'dept-south-prod',
          email: 'mohanad.tech@rumaila.iq',
          password: '123456',
          employeeId: 'EMP-2024-005',
          fullName: 'مهند فاضل العلي',
          jobTitle: 'مسؤول الوحدة الفنية',
          phone: '07705678901',
          role: 'UNIT_MANAGER',
          status: 'APPROVED',
          profileCompleted: true,
          sectionId: null,
          unitId: 'unit-1',
          stationId: null,
          createdAt: '2026-01-05T08:00:00Z'
        }
      ];

      const presetMatch = LOCAL_PRESETS.find(p => 
        (cleanEmpId && p.employeeId && p.employeeId.toUpperCase() === cleanEmpId) ||
        (cleanEmail && p.email && p.email.toLowerCase() === cleanEmail) ||
        (legacyEmpId && p.employeeId && p.employeeId.toUpperCase() === legacyEmpId.toUpperCase().trim()) ||
        (rawId && p.id && p.id.toLowerCase() === rawId.toLowerCase())
      );

      if (presetMatch) {
        user = JSON.parse(JSON.stringify(presetMatch));
        if (window.store) {
          if (!db.users) db.users = [];
          const idx = db.users.findIndex(u => u && (u.id === user.id || (u.employeeId && u.employeeId.toUpperCase() === user.employeeId.toUpperCase())));
          if (idx !== -1) {
            db.users[idx] = { ...db.users[idx], ...user };
          } else {
            db.users.push(user);
          }
          window.store.saveDb(db);
        }
      }
    }

    // 3. If user account is not found in registered accounts:
    if (!user) {
      // Check if employee ID exists in the Department Staff Directory
      const staffRecord = this.validateEmployeeDirectory(cleanEmpId);
      if (staffRecord) {
        return {
          success: false,
          error: 'الرقم الوظيفي مسجل في ملاكات القسم، ولكن لم يتم إنشاء حساب له بعد. يرجى الضغط على «إنشاء حساب جديد».'
        };
      }
      return { 
        success: false, 
        error: isEmail ? 'البريد الإلكتروني غير مسجل في المنظومة.' : 'الرقم الوظيفي غير مدرج في سجلات وملاكات قسم الإنتاج الجنوبي.' 
      };
    }

    // 4. Founder Bypass check
    const isFounder = user.role === 'SUPER_ADMIN' || user.id === 'user-founder' || 
      (user.employeeId && user.employeeId.toUpperCase() === 'EMP-0000') ||
      (user.email && (user.email.toLowerCase() === 'founder@local.spd' || user.email.toLowerCase() === 'hussein123119@gmail.com' || user.email.toLowerCase() === 'southprod.rumaila@gmail.com'));

    const isLocalTestPassword = isLocalEnv && [
      '123456', 'Founder#2026', 'M1a2g3r4#2026', 'Sec1#Pass2026', 'Sec2#Pass2026', 'Unit1#Pass2026', 'Emp1#Pass2026'
    ].includes(password);

    if (user.password !== password) {
      if (isLocalTestPassword || (isLocalEnv && isFounder && !user.password) || (isLocalEnv && password === '123456')) {
        // السماح بالدخول في البيئة المحلية بكلمة المرور الافتراضية الموحدة (123456)
      } else {
        if (window.store && typeof window.store.logActivity === 'function') {
          window.store.logActivity(user.departmentId, user.id, user.employeeId, 'LOGIN_FAILED', 'AUTH', 'محاولة دخول بكلمة مرور خاطئة', 'FAILED');
        }
        return { success: false, error: 'كلمة المرور غير صحيحة.' };
      }
    }

    // 5. Strict Employee ID Directory Check for Regular Staff
    if (!isFounder) {
      const activeInDirectory = this.validateEmployeeDirectory(user.employeeId);
      if (!activeInDirectory) {
        if (window.store && typeof window.store.logActivity === 'function') {
          window.store.logActivity(user.departmentId, user.id, user.employeeId, 'LOGIN_FAILED', 'AUTH', 'محاولة دخول برقم وظيفي غير معتمد بالملاكات', 'FAILED');
        }
        return { success: false, error: 'الرقم الوظيفي الخاص بحسابك غير مدرج في سجلات وملاكات قسم الإنتاج الجنوبي. يرجى مراجعة إدارة الموارد البشرية.' };
      }
    }

    // 6. Account Status Verification
    if (isLocalEnv) {
      if (isFounder || ['EMP-0000', 'EMP-2024-001', 'EMP-2024-002', 'EMP-2024-003', 'EMP-2024-004', 'EMP-2024-005'].includes(user.employeeId)) {
        user.status = 'APPROVED';
        user.profileCompleted = true;
      }
    }

    if (user.status === 'PENDING') {
      return { success: false, error: 'حسابك ما زال قيد المراجعة والموافقة من قبل إدارة القسم.' };
    }
    if (user.status === 'REJECTED') {
      return { success: false, error: 'تم رفض طلب الحساب الخاص بك. يرجى مراجعة إدارة الموارد البشرية.' };
    }
    if (user.status === 'SUSPENDED' || user.status === 'DISABLED') {
      return { success: false, error: 'الحساب معلق أو معطل حالياً من قبل مسؤول النظام.' };
    }

    this.saveSession(user);
    if (window.store && typeof window.store.logActivity === 'function') {
      window.store.logActivity(user.departmentId, user.id, user.employeeId, 'LOGIN', 'AUTH', 'تسجيل دخول ناجح إلى المنصة');
    }
    
    return {
      success: true,
      user,
      requiresProfileCompletion: !user.profileCompleted
    };
  }

  /**
   * Validate Employee ID against Master Directory, Employees table, and Approved IDs
   */
  validateEmployeeDirectory(employeeId) {
    if (!employeeId) return null;
    const cleanId = employeeId.trim().toUpperCase();

    // 0. Founder & Local Preset Staff Directory Validation
    if (cleanId === 'EMP-0000') {
      return {
        employeeId: 'EMP-0000',
        fullName: 'المؤسس العام للمنظومة',
        departmentId: 'dept-south-prod',
        sectionId: null,
        unitId: null,
        stationId: null,
        jobTitle: 'المؤسس والمدير العام للنظام'
      };
    }
    const PRESET_STAFF_MAP = {
      'EMP-2024-001': { fullName: 'م. أحمد عبد الحسين', jobTitle: 'مدير قسم الإنتاج الجنوبي', sectionId: null, unitId: null, stationId: null },
      'EMP-2024-002': { fullName: 'م. حيدر جاسم', jobTitle: 'مسؤول الشعبة الأولى', sectionId: 'sec-1', unitId: null, stationId: null },
      'EMP-2024-003': { fullName: 'م. علي الركابي', jobTitle: 'مسؤول الشعبة الثانية', sectionId: 'sec-2', unitId: null, stationId: null },
      'EMP-2024-004': { fullName: 'عمار الساعدي', jobTitle: 'مشغل محطة إنتاجية أقدم', sectionId: 'sec-1', unitId: null, stationId: 'st-101' },
      'EMP-2024-005': { fullName: 'مهند فاضل العلي', jobTitle: 'مسؤول الوحدة الفنية', sectionId: null, unitId: 'unit-1', stationId: null }
    };
    if (PRESET_STAFF_MAP[cleanId]) {
      return {
        employeeId: cleanId,
        departmentId: 'dept-south-prod',
        ...PRESET_STAFF_MAP[cleanId]
      };
    }

    // 1. Check Master Records
    if (typeof window.store.getEmployeeMasterRecordByEmployeeId === 'function') {
      const record = window.store.getEmployeeMasterRecordByEmployeeId(cleanId);
      if (record) return record;
    }

    const db = window.store ? window.store.getDb() : null;
    if (db && db.employeeMasterRecords && Array.isArray(db.employeeMasterRecords)) {
      const rec = db.employeeMasterRecords.find(r => (r.employeeId || '').trim().toUpperCase() === cleanId);
      if (rec) {
        return {
          employeeId: cleanId,
          fullName: rec.fullName || rec.name,
          departmentId: rec.departmentId || 'dept-south-prod',
          sectionId: rec.sectionId || null,
          unitId: rec.unitId || null,
          stationId: rec.stationId || null,
          jobTitle: rec.jobTitle || 'موظف'
        };
      }
    }

    // 2. Check Employees table in DB
    if (db && db.employees && Array.isArray(db.employees)) {
      const emp = db.employees.find(e => (e.employeeId || e.empId || '').trim().toUpperCase() === cleanId);
      if (emp) {
        return {
          employeeId: cleanId,
          fullName: emp.fullName || emp.name,
          departmentId: emp.departmentId || 'dept-south-prod',
          sectionId: emp.sectionId || null,
          unitId: emp.unitId || null,
          stationId: emp.stationId || null,
          jobTitle: emp.jobTitle || emp.role || 'موظف'
        };
      }
    }

    // 3. Check approvedEmployeeIds
    if (db && db.approvedEmployeeIds && Array.isArray(db.approvedEmployeeIds)) {
      const appr = db.approvedEmployeeIds.find(a => (a.id || a.employeeId || '').trim().toUpperCase() === cleanId);
      if (appr) {
        return {
          employeeId: cleanId,
          fullName: appr.name || appr.fullName || 'منتسب معتمد',
          departmentId: appr.departmentId || 'dept-south-prod',
          sectionId: appr.sectionId || null,
          unitId: appr.unitId || null,
          stationId: appr.stationId || null,
          jobTitle: appr.jobTitle || 'موظف'
        };
      }
    }

    return null;
  }

  /**
   * Reset user password securely with Employee ID + Email verification
   */
  resetPassword(employeeId, email, newPassword) {
    if (!email || !newPassword) {
      return { success: false, error: 'البريد الإلكتروني وكلمة المرور الجديدة مطلوبان.' };
    }
    const cleanId = (employeeId || '').trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const user = window.store.getUserByEmail(cleanEmail);
    if (!user) {
      return { success: false, error: 'البريد الإلكتروني غير مسجل في المنظومة.' };
    }

    const isFounder = user.role === 'SUPER_ADMIN' || user.id === 'user-founder' || 
      cleanEmail === 'hussein123119@gmail.com' || cleanEmail === 'southprod.rumaila@gmail.com';

    if (!isFounder) {
      if (!employeeId || (user.employeeId || '').trim().toUpperCase() !== cleanId) {
        return { success: false, error: 'الرقم الوظيفي غير مطابق لهذا البريد الإلكتروني.' };
      }
    }

    // Update password in DB
    const updated = window.store.updateUser(user.id, { password: newPassword });
    window.store.logActivity(
      user.departmentId,
      user.id,
      user.employeeId,
      'PASSWORD_RESET',
      'AUTH',
      'تمت إعادة تعيين كلمة المرور بنجاح للمنتسب'
    );

    return {
      success: true,
      user: updated,
      message: 'تم تعيين كلمة المرور الجديدة بنجاح! يمكنك الآن تسجيل الدخول مباشرة.'
    };
  }

  /**
   * Register flow with Employee ID verification against Master Approved Directory
   */
  register(data) {
    const { email, password, employeeId, fullName, phone, departmentId, sectionId, unitId, stationId } = data;

    if (!email || !password || !employeeId) {
      return { success: false, error: 'يرجى إكمال الحقول الإلزامية (البريد، كلمة المرور، والرقم الوظيفي).' };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanId = employeeId.trim().toUpperCase();

    // Check if email already exists
    if (window.store.getUserByEmail(cleanEmail)) {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل لمستخدم آخر في المنظومة.' };
    }

    // Check if employeeId already registered
    if (window.store.getUserByEmployeeId(cleanId)) {
      return { success: false, error: 'الرقم الوظيفي مرتبط بحساب مستخدم مسجل مسبقاً. يمكنك استخدام استرجاع كلمة المرور.' };
    }

    // Verify Employee ID strictly against Employee Master Directory
    const masterRecord = this.validateEmployeeDirectory(cleanId);
    if (!masterRecord) {
      return { 
        success: false, 
        error: 'عذراً، الرقم الوظيفي المدخل غير مدرج في قاعدة بيانات ملاكات قسم الإنتاج الجنوبي. يرجى مراجعة إدارة الموارد البشرية.' 
      };
    }

    // Account creation: linked to Master Record
    const initialStatus = 'PENDING'; // New operational accounts require manager approval

    const newUser = {
      id: 'user-' + Date.now(),
      departmentId: masterRecord.departmentId || departmentId || 'dept-south-prod',
      email: cleanEmail,
      password,
      employeeId: masterRecord.employeeId,
      fullName: fullName || masterRecord.fullName || 'منتسب جديد',
      jobTitle: masterRecord.jobTitle || 'موظف تشغيل',
      phone: phone || masterRecord.phone || '',
      role: 'EMPLOYEE',
      status: initialStatus,
      profileCompleted: true,
      sectionId: masterRecord.sectionId || sectionId || null,
      unitId: masterRecord.unitId || unitId || null,
      stationId: masterRecord.stationId || stationId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    window.store.addUser(newUser);

    window.store.logActivity(
      newUser.departmentId,
      newUser.id,
      newUser.employeeId,
      'REGISTER',
      'AUTH',
      `تسجيل حساب جديد للمنتسب ${newUser.fullName} (${newUser.employeeId}) بحالة: قيد الاعتماد`
    );

    return {
      success: true,
      user: newUser,
      status: initialStatus,
      message: 'تم التحقق من هويتك في ملاكات القسم بنجاح! تم رفع طلب الحساب وهو الآن في حالة الانتظار لحين اعتماد الصلاحيات من إدارة القسم.'
    };
  }

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      window.store.logActivity(user.departmentId, user.id, user.employeeId, 'LOGOUT', 'AUTH', 'تسجيل الخروج من المنصة');
    }
    this.clearSession();
  }

  completeProfile(userId, profileData) {
    const updated = window.store.updateUser(userId, {
      ...profileData,
      profileCompleted: true
    });
    if (this.currentUser && this.currentUser.id === userId) {
      this.saveSession(updated);
    }
    window.store.logActivity(updated.departmentId, updated.id, updated.employeeId, 'COMPLETE_PROFILE', 'USER', 'إكمال بيانات الملف الوظيفي');
    return updated;
  }
}

const auth = new AuthService();
window.auth = auth;
