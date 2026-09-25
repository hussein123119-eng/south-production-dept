/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Official Financial Incentive Calculator (القسم المالي)
   استناداً إلى وثيقة وتعليمات وضوابط احتساب الحوافز الرسمية (2- الحافز.pdf)
   المعتمدة في شركة نفط البصرة والقطاع النفطي
   ========================================================================== */

(function() {
  'use strict';

  // Default Incentive Calculation State with Dual-Mode Support
  window.incentiveState = window.incentiveState || {
    calcMode: 'auto', // 'auto' (الوضع التلقائي من الملاكات) | 'manual' (الوضع اليدوي / المحاكاة)
    activeTab: 'calculator', // calculator, matrix, rules, point_price
    employeeId: '',
    employeeName: 'مهندس تشغيل موقعي (نموذج افتراضي)',
    jobTitle: 'مهندس تشغيل موقعي',
    section: 'الشعبة الأولى',
    degree: 'bachelor_high_diploma',
    evaluation: 'excellent',
    serviceYears: 10,
    leadership: 'unit_head_shift_eng',
    category: 'shift_tech_prod',
    pointPrice: 10000,
    leaveDays: 0,
    absenceDays: 0,
    deputationDays: 0,
    penalty: 'none',
    withholdingCase: 'none',
    
    // Central Point Price Calculator state
    centralNominalSalaries: 450000000,
    centralFamilyAllowances: 65000000,
    centralDegreeAllowances: 48000000,
    centralTotalStaffPoints: 56300,
    centralDirectPoolAmount: 563000000,
    centralMode: 'detailed' // 'detailed' or 'direct'
  };

  // Search and Filter State
  window.incentiveSearchState = window.incentiveSearchState || {
    searchQuery: '',
    selectedSection: 'ALL'
  };

  // Official Standards & Matrices Definitions
  const CERTIFICATE_MATRIX = [
    { id: 'phd', title: 'دكتوراه', points: 10.0, weight: 0.150, score: 1.500, desc: 'شهادة الدكتوراه المعترف بها' },
    { id: 'master', title: 'ماجستير', points: 9.5, weight: 0.150, score: 1.425, desc: 'شهادة الماجستير في الاختصاص' },
    { id: 'bachelor_high_diploma', title: 'دبلوم عالي / بكالوريوس', points: 9.0, weight: 0.150, score: 1.350, desc: 'البكالوريوس الأكاديمي أو الدبلوم العالي' },
    { id: 'diploma', title: 'دبلوم معهد فني / تقني', points: 8.5, weight: 0.150, score: 1.275, desc: 'خريجو المعاهد الفنية والتقنية (سنتان بعد الإعدادية)' },
    { id: 'preparatory', title: 'إعدادية (علمي / أدبي / مهني)', points: 8.0, weight: 0.150, score: 1.200, desc: 'شهادة الدراسة الثانوية أو المهنية' },
    { id: 'intermediate', title: 'متوسطة', points: 7.0, weight: 0.150, score: 1.050, desc: 'شهادة الدراسة المتوسطة' },
    { id: 'below_intermediate', title: 'دون المتوسطة (ابتدائية / يقرأ ويكتب)', points: 6.0, weight: 0.150, score: 0.900, desc: 'الشهادة الابتدائية أو محو الأمية' }
  ];

  const EVALUATION_MATRIX = [
    { id: 'excellent', title: 'ممتاز (90% - 100%)', points: 10.0, weight: 0.225, score: 2.250, quota: '25% كحد أقصى من كادر القسم', desc: 'أداء استثنائي وإنجاز متميز للمهام' },
    { id: 'very_good', title: 'جيد جداً (80% - 89%)', points: 9.0, weight: 0.225, score: 2.025, quota: '35% كحد أقصى من كادر القسم', desc: 'أداء يفوق المعايير المطلوبة' },
    { id: 'good', title: 'جيد (70% - 79%)', points: 8.0, weight: 0.225, score: 1.800, quota: '25% كحد أقصى من كادر القسم', desc: 'أداء يلبي كافة متطلبات العمل بدقة' },
    { id: 'medium', title: 'متوسط (60% - 69%)', points: 7.0, weight: 0.225, score: 1.575, quota: '15% كحد أقصى من كادر القسم', desc: 'أداء يفي بالحدود المقبولة للمهام' },
    { id: 'acceptable', title: 'مقبول (50% - 59%)', points: 5.0, weight: 0.225, score: 1.125, quota: 'بدون تحديد نسبة', desc: 'أداء يحتاج إلى متابعة وتحسين' },
    { id: 'poor', title: 'ضعيف (أقل من 50%)', points: 0.0, weight: 0.225, score: 0.000, quota: 'حجب الحافز 100%', desc: 'أداء غير مرضٍ - حجب كامل للحافز' }
  ];

  const LEADERSHIP_MATRIX = [
    { id: 'director_general', title: 'مدير عام', points: 30.0, weight: 0.150, score: 4.500, desc: 'إدارة تشكيلات الشركة الرئيسية' },
    { id: 'deputy_director_general', title: 'وكيل / معاون مدير عام', points: 25.0, weight: 0.150, score: 3.750, desc: 'معاونو الإدارة العامة' },
    { id: 'authority_director', title: 'مدير هيأة', points: 20.0, weight: 0.150, score: 3.000, desc: 'إدارة هيأة تشغيلية أو إدارية' },
    { id: 'vertical_dept_manager', title: 'مدير قسم رأسي', points: 15.0, weight: 0.150, score: 2.250, desc: 'إدارة الأقسام الإنتاجية والفنية الرأسية' },
    { id: 'expert_exec_director', title: 'خبير / مدير تنفيذي', points: 12.0, weight: 0.150, score: 1.800, desc: 'العناوين الاستشارية والتنفيذية' },
    { id: 'non_vertical_dept_manager', title: 'مدير قسم غير رأسي', points: 10.0, weight: 0.150, score: 1.500, desc: 'إدارة الأقسام المساندة والإدارية' },
    { id: 'deputy_dept_section_vertical', title: 'وكيل مدير قسم / مسؤول شعبة رأسي', points: 8.0, weight: 0.150, score: 1.200, desc: 'مسؤولو الشعب الإنتاجية والهندسية الرأسية' },
    { id: 'section_head', title: 'مسؤول شعبة اعتيادي', points: 6.0, weight: 0.150, score: 0.900, desc: 'مسؤولو الشعب الساندة والإدارية' },
    { id: 'unit_head_shift_eng', title: 'مناوب عنوان هندسي / مسؤول وحدة', points: 4.0, weight: 0.150, score: 0.600, desc: 'مسؤولو الوحدات ومناوبو المواقع من حملة العناوين الهندسية' },
    { id: 'regular_employee', title: 'كادر اعتيادي / موظف', points: 0.0, weight: 0.150, score: 0.000, desc: 'كافة المنتسبين والموظفين دون تكليف إداري' }
  ];

  const CATEGORY_MATRIX = [
    { id: 'shift_tech_prod', title: 'مناوب فني إنتاجي (مواقع التشغيل المباشر)', multiplier: 10.0, desc: 'نظام مناوبة (شفتات) في المحطات وحقول الإنتاج الفعلي' },
    { id: 'shift_tech_nonprod', title: 'مناوب فني غير إنتاجي', multiplier: 9.5, desc: 'نظام مناوبة فني في المواقع الخدمية المساندة' },
    { id: 'shift_admin_prod', title: 'مناوب إداري إنتاجي', multiplier: 9.0, desc: 'كوادر إدارية مناوبة في مواقع العمليات والحقول' },
    { id: 'shift_admin_nonprod', title: 'مناوب إداري غير إنتاجي', multiplier: 8.5, desc: 'كوادر إدارية مناوبة في المواقع الخدمية والمكاتب' },
    { id: 'morning_tech_prod', title: 'صباحي فني إنتاجي', multiplier: 8.8, desc: 'دوام صباحي للملاكات الهندسية والفنية في مواقع الإنتاج' },
    { id: 'morning_admin_prod', title: 'صباحي إداري إنتاجي', multiplier: 8.5, desc: 'دوام صباحي للكوادر الإدارية في مقار الهيئات الإنتاجية' },
    { id: 'morning_tech_nonprod', title: 'صباحي فني غير إنتاجي', multiplier: 8.4, desc: 'دوام صباحي فني في الورش والمخازن والدوائر الساندة' },
    { id: 'morning_admin_nonprod', title: 'صباحي إداري غير إنتاجي', multiplier: 8.25, desc: 'دوام صباحي للملاكات الإدارية والمالية والمكتبية العامة' }
  ];

  const WITHHOLDING_CASES = [
    { id: 'none', label: 'لا يوجد حجب كامل (الوضع الطبيعي المستحق)' },
    { id: 'maternity', label: 'إجازة أمومة (حجب 100%)' },
    { id: 'birth', label: 'إجازة وضع / ولادة (حجب 100%)' },
    { id: 'study_leave', label: 'إجازة دراسية (حجب 100%)' },
    { id: 'leaves_over_19', label: 'إجازات اعتيادية أو مرضية تجاوزت 19 يوماً في الشهر (حجب 100%)' },
    { id: 'death', label: 'الوفاة (حجب 100%)' },
    { id: 'mourning_period', label: 'العدة الشرعية لوفاة الزوج (حجب 100%)' },
    { id: 'deputation_over_19', label: 'تفرغ أو إيفاد دراسي تجاوز 19 يوماً في الشهر (حجب 100%)' },
    { id: 'without_allowances', label: 'موظف بدون مخصصات (حجب 100%)' },
    { id: 'out_of_service_q', label: 'خارج الخدمة - الرمز Q (حجب 100%)' },
    { id: 'penalty_warning', label: 'عقوبة إنذار أو عقوبة أشد للشهر المعني (حجب 100%)' }
  ];

  // Calculation Engine
  function calculateIncentive(state) {
    const cert = CERTIFICATE_MATRIX.find(c => c.id === state.degree) || CERTIFICATE_MATRIX[2];
    const evalItem = EVALUATION_MATRIX.find(e => e.id === state.evaluation) || EVALUATION_MATRIX[0];
    const leader = LEADERSHIP_MATRIX.find(l => l.id === state.leadership) || LEADERSHIP_MATRIX[9];
    const category = CATEGORY_MATRIX.find(cat => cat.id === state.category) || CATEGORY_MATRIX[0];

    const serviceYears = Math.min(40, Math.max(0, parseInt(state.serviceYears, 10) || 0));
    const pointPrice = Math.max(0, parseFloat(state.pointPrice) || 10000);
    const leaveDays = Math.max(0, parseInt(state.leaveDays, 10) || 0);
    const absenceDays = Math.max(0, parseInt(state.absenceDays, 10) || 0);
    const deputationDays = Math.max(0, parseInt(state.deputationDays, 10) || 0);
    const penalty = state.penalty || 'none';
    const withholdingCase = state.withholdingCase || 'none';

    // Step 1: Sub-scores
    const certScore = cert.points * 0.150;
    const evalScore = evalItem.points * 0.225;
    const serviceScore = serviceYears * 0.100;
    const leaderScore = leader.points * 0.150;

    // Step 2: Internal Sum
    const internalSum = certScore + evalScore + serviceScore + leaderScore;

    // Step 3: Total Employee Points
    const totalPoints = category.multiplier * internalSum;

    // Step 4: Gross Incentive Amount
    const grossIncentive = totalPoints * pointPrice;

    // Step 5: Check Full Withholding Cases
    let isWithheld = false;
    let withholdingReason = '';

    if (withholdingCase !== 'none') {
      isWithheld = true;
      const found = WITHHOLDING_CASES.find(w => w.id === withholdingCase);
      withholdingReason = found ? found.label : 'حالة حجب قانوني كامل';
    } else if (evalItem.id === 'poor') {
      isWithheld = true;
      withholdingReason = 'حجب الحافز بالكامل (100%) بسبب التقييم السنوي الضعيف (أقل من 50%)';
    } else if (absenceDays > 2) {
      isWithheld = true;
      withholdingReason = 'حجب الحافز بالكامل (100%) لتجاوز الغياب غير المبرر يومين (' + absenceDays + ' يوم)';
    } else if (penalty === 'warning') {
      isWithheld = true;
      withholdingReason = 'حجب الحافز بالكامل (100%) لصدور عقوبة إنذار أو عقوبة أشد خلال الشهر';
    } else if (leaveDays > 19) {
      isWithheld = true;
      withholdingReason = 'حجب الحافز بالكامل (100%) لتجاوز مجموع الإجازات 19 يوماً خلال الشهر';
    } else if (deputationDays > 19) {
      isWithheld = true;
      withholdingReason = 'حجب الحافز بالكامل (100%) لتجاوز أيام التفرغ / الإيفاد الدراسي 19 يوماً';
    }

    if (isWithheld) {
      return {
        cert, evalItem, leader, category, serviceYears, pointPrice,
        certScore, evalScore, serviceScore, leaderScore, internalSum,
        totalPoints, grossIncentive,
        isWithheld: true,
        withholdingReason,
        leaveDays, leaveDeduction: 0, leaveDeductedDays: 0,
        absenceDays, absenceDeduction: 0,
        deputationDays, deputationDeduction: 0, deputationDeductedDays: 0,
        penalty, penaltyDeduction: 0,
        totalDeductions: grossIncentive,
        netPayable: 0,
        statusLabel: 'محجوب بالكامل (100%)',
        statusClass: 'status-danger'
      };
    }

    // Step 6: Deductions Calculations
    const dailyIncentiveRate = grossIncentive / 30.0;

    // 6.a Leaves: if > 4 days, deduct 2 days for each extra day
    let leaveDeductedDays = 0;
    let leaveDeduction = 0;
    if (leaveDays > 4) {
      const extraLeave = leaveDays - 4;
      leaveDeductedDays = extraLeave * 2;
      leaveDeduction = leaveDeductedDays * dailyIncentiveRate;
    }

    // 6.b Absences: 1 day = 1/3 incentive, 2 days = 2/3 incentive
    let absenceDeduction = 0;
    if (absenceDays === 1) {
      absenceDeduction = grossIncentive * (1.0 / 3.0);
    } else if (absenceDays === 2) {
      absenceDeduction = grossIncentive * (2.0 / 3.0);
    }

    // 6.c Deputation: if > 4 days, deduct 2 days for each extra day
    let deputationDeductedDays = 0;
    let deputationDeduction = 0;
    if (deputationDays > 4) {
      const extraDep = deputationDays - 4;
      deputationDeductedDays = extraDep * 2;
      deputationDeduction = deputationDeductedDays * dailyIncentiveRate;
    }

    // 6.d Penalties: attention = 50%
    let penaltyDeduction = 0;
    if (penalty === 'attention') {
      penaltyDeduction = grossIncentive * 0.50;
    }

    // Step 7: Totals & Net Payable
    let totalDeductions = leaveDeduction + absenceDeduction + deputationDeduction + penaltyDeduction;
    if (totalDeductions > grossIncentive) {
      totalDeductions = grossIncentive;
    }

    const netPayable = Math.max(0, grossIncentive - totalDeductions);

    let statusLabel = 'استحقاق كامل 100%';
    let statusClass = 'status-success';
    if (totalDeductions > 0 && netPayable > 0) {
      statusLabel = 'خاضع للاستقطاعات القانونية';
      statusClass = 'status-warning';
    } else if (netPayable === 0) {
      statusLabel = 'مستنفد بالكامل بالاستقطاعات';
      statusClass = 'status-danger';
    }

    return {
      cert, evalItem, leader, category, serviceYears, pointPrice,
      certScore, evalScore, serviceScore, leaderScore, internalSum,
      totalPoints, grossIncentive,
      isWithheld: false,
      withholdingReason: '',
      leaveDays, leaveDeductedDays, leaveDeduction,
      absenceDays, absenceDeduction,
      deputationDays, deputationDeductedDays, deputationDeduction,
      penalty, penaltyDeduction,
      totalDeductions, netPayable,
      statusLabel, statusClass
    };
  }

  // Format Currency & Points
  function formatIQD(num) {
    return Math.round(num).toLocaleString('en-US') + ' د.ع';
  }

  function formatPoints(num) {
    return Number(num).toFixed(3);
  }

  // Global actions for UI
  window.setIncentiveTab = function(tab) {
    window.incentiveState.activeTab = tab;
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.setIncentiveCalcMode = function(mode) {
    if (!window.incentiveState) window.incentiveState = {};
    window.incentiveState.calcMode = mode;
    if (mode === 'auto') {
      const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {};
      const actorUser = user || { role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
      const employees = (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function')
        ? window.store.getUnifiedEmployeeRoster(actorUser)
        : ((window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : []);
      if (!window.incentiveState.employeeId && employees && employees.length > 0) {
        window.loadEmployeeToIncentive(employees[0].employeeId || employees[0].id);
        return;
      }
    }
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.updateIncentiveField = function(field, value) {
    window.incentiveState[field] = value;
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.handleIncentiveEmployeeSearch = function(query) {
    if (!window.incentiveSearchState) {
      window.incentiveSearchState = { searchQuery: '', selectedSection: 'ALL' };
    }
    window.incentiveSearchState.searchQuery = query;
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
      setTimeout(() => {
        const inp = document.getElementById('incEmployeeSearchInput');
        if (inp) {
          if (typeof inp.focus === 'function') inp.focus();
          const valLen = inp.value ? inp.value.length : 0;
          if (typeof inp.setSelectionRange === 'function') inp.setSelectionRange(valLen, valLen);
        }
      }, 30);
    }
  };

  window.handleIncentiveSectionFilter = function(section) {
    if (!window.incentiveSearchState) {
      window.incentiveSearchState = { searchQuery: '', selectedSection: 'ALL' };
    }
    window.incentiveSearchState.selectedSection = section;
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.clearIncentiveEmployeeSearch = function() {
    if (!window.incentiveSearchState) {
      window.incentiveSearchState = { searchQuery: '', selectedSection: 'ALL' };
    }
    window.incentiveSearchState.searchQuery = '';
    window.incentiveSearchState.selectedSection = 'ALL';
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.loadEmployeeToIncentive = function(empId) {
    if (!window.incentiveState) window.incentiveState = {};
    if (!empId) {
      window.incentiveState.employeeId = '';
      window.incentiveState.employeeName = 'إدخال يدوي مخصص';
      if (window.app && typeof window.app.render === 'function') window.app.render();
      return;
    }

    const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {};
    const actorUser = user || { role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
    const employees = (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function')
      ? window.store.getUnifiedEmployeeRoster(actorUser)
      : ((window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : []);

    const emp = employees.find(e => String(e.id) === String(empId) || String(e.employeeId) === String(empId));
    if (!emp) return;

    window.incentiveState.employeeId = emp.employeeId || emp.id;
    window.incentiveState.employeeName = emp.name || emp.fullName || 'منتسب';
    window.incentiveState.jobTitle = emp.jobTitle || 'موظف';
    window.incentiveState.section = emp.section || emp.station || 'إدارة القسم';

    // Map Degree
    const dStr = (emp.qualification || emp.degree || '').toLowerCase();
    if (dStr.includes('دكتور') || dStr.includes('phd')) window.incentiveState.degree = 'phd';
    else if (dStr.includes('ماجستير') || dStr.includes('master')) window.incentiveState.degree = 'master';
    else if (dStr.includes('عالي') || dStr.includes('بكالوريوس') || dStr.includes('بكلوريوس') || dStr.includes('bachelor')) window.incentiveState.degree = 'bachelor_high_diploma';
    else if (dStr.includes('دبلوم') || dStr.includes('معهد')) window.incentiveState.degree = 'diploma';
    else if (dStr.includes('إعداد') || dStr.includes('اعداد') || dStr.includes('ثانوي')) window.incentiveState.degree = 'preparatory';
    else if (dStr.includes('متوسط')) window.incentiveState.degree = 'intermediate';
    else if (dStr.includes('ابتدائ') || dStr.includes('محو') || dStr.includes('يقرأ')) window.incentiveState.degree = 'below_intermediate';
    else window.incentiveState.degree = 'bachelor_high_diploma';

    // Map Years of Service
    const joinDate = emp.hireDate || emp.appointmentDate;
    const currYear = new Date().getFullYear();
    let serviceYears = 10;
    if (joinDate) {
      const jYear = new Date(joinDate).getFullYear();
      if (!isNaN(jYear) && jYear > 1950 && jYear <= currYear) {
        serviceYears = Math.max(0, Math.min(40, currYear - jYear));
      }
    } else if (emp.joinYear) {
      serviceYears = Math.max(0, Math.min(40, currYear - parseInt(emp.joinYear, 10)));
    } else if (emp.serviceYears !== undefined && emp.serviceYears !== null) {
      serviceYears = Math.max(0, Math.min(40, parseInt(emp.serviceYears, 10) || 0));
    }
    window.incentiveState.serviceYears = serviceYears;

    // Deduce Leadership
    const titleLower = (emp.jobTitle || '').toLowerCase();
    const roleLower = (emp.role || '').toLowerCase();
    if (titleLower.includes('مدير عام')) {
      window.incentiveState.leadership = 'director_general';
    } else if (titleLower.includes('معاون مدير عام') || titleLower.includes('وكيل مدير عام')) {
      window.incentiveState.leadership = 'deputy_director_general';
    } else if (titleLower.includes('مدير هيأة') || titleLower.includes('مدير هيئة')) {
      window.incentiveState.leadership = 'authority_director';
    } else if (titleLower.includes('مدير قسم') || roleLower === 'dept_manager') {
      window.incentiveState.leadership = 'vertical_dept_manager';
    } else if (titleLower.includes('خبير') || titleLower.includes('مدير تنفيذي')) {
      window.incentiveState.leadership = 'expert_exec_director';
    } else if (titleLower.includes('مسؤول شعبة') || roleLower === 'section_manager') {
      window.incentiveState.leadership = 'deputy_dept_section_vertical';
    } else if (titleLower.includes('مسؤول وحدة') || (titleLower.includes('مناوب') && titleLower.includes('مهندس'))) {
      window.incentiveState.leadership = 'unit_head_shift_eng';
    } else {
      window.incentiveState.leadership = 'regular_employee';
    }

    // Deduce Category
    const secLower = (emp.section || emp.station || '').toLowerCase();
    const isShift = (emp.workSystem === 'shift') || titleLower.includes('مناوب') || titleLower.includes('مشغل');
    const isTech = !(secLower.includes('إدار') || secLower.includes('حسابات') || secLower.includes('مالي') || secLower.includes('قانون'));

    if (isShift) {
      window.incentiveState.category = isTech ? 'shift_tech_prod' : 'shift_admin_prod';
    } else {
      window.incentiveState.category = isTech ? 'morning_tech_prod' : 'morning_admin_nonprod';
    }

    if (!window.incentiveState.evaluation) {
      window.incentiveState.evaluation = 'excellent';
    }

    // Reset deductions for pristine fresh calculation
    window.incentiveState.leaveDays = 0;
    window.incentiveState.absenceDays = 0;
    window.incentiveState.deputationDays = 0;
    window.incentiveState.penalty = 'none';
    window.incentiveState.withholdingCase = 'none';

    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.applyIncentivePreset = function(preset) {
    if (!window.incentiveState) window.incentiveState = {};
    window.incentiveState.calcMode = 'manual'; // switch to manual simulation so preset is fully visible and tweakable
    if (preset === 'prod_engineer') {
      window.incentiveState.employeeName = 'مهندس تشغيل موقعي (مناوب)';
      window.incentiveState.jobTitle = 'مهندس تشغيل';
      window.incentiveState.section = 'الشعبة الأولى';
      window.incentiveState.degree = 'bachelor_high_diploma';
      window.incentiveState.evaluation = 'excellent';
      window.incentiveState.serviceYears = 12;
      window.incentiveState.leadership = 'unit_head_shift_eng';
      window.incentiveState.category = 'shift_tech_prod';
      window.incentiveState.leaveDays = 0;
      window.incentiveState.absenceDays = 0;
      window.incentiveState.penalty = 'none';
      window.incentiveState.withholdingCase = 'none';
    } else if (preset === 'section_manager') {
      window.incentiveState.employeeName = 'مسؤول شعبة إنتاجية رأسية';
      window.incentiveState.jobTitle = 'مسؤول شعبة';
      window.incentiveState.section = 'الشعبة الثانية';
      window.incentiveState.degree = 'bachelor_high_diploma';
      window.incentiveState.evaluation = 'very_good';
      window.incentiveState.serviceYears = 18;
      window.incentiveState.leadership = 'deputy_dept_section_vertical';
      window.incentiveState.category = 'morning_tech_prod';
      window.incentiveState.leaveDays = 2;
      window.incentiveState.absenceDays = 0;
      window.incentiveState.penalty = 'none';
      window.incentiveState.withholdingCase = 'none';
    } else if (preset === 'leave_deduction') {
      window.incentiveState.employeeName = 'حالة موظف مجاز (6 أيام إجازة)';
      window.incentiveState.jobTitle = 'فني تشغيل';
      window.incentiveState.section = 'شعبة المختبرات';
      window.incentiveState.degree = 'diploma';
      window.incentiveState.evaluation = 'good';
      window.incentiveState.serviceYears = 8;
      window.incentiveState.leadership = 'regular_employee';
      window.incentiveState.category = 'shift_tech_prod';
      window.incentiveState.leaveDays = 6;
      window.incentiveState.absenceDays = 0;
      window.incentiveState.penalty = 'none';
      window.incentiveState.withholdingCase = 'none';
    } else if (preset === 'absence_deduction') {
      window.incentiveState.employeeName = 'حالة موظف لديه غياب (يومان غياب)';
      window.incentiveState.jobTitle = 'كاتب حسابات';
      window.incentiveState.section = 'إدارة القسم';
      window.incentiveState.degree = 'preparatory';
      window.incentiveState.evaluation = 'medium';
      window.incentiveState.serviceYears = 5;
      window.incentiveState.leadership = 'regular_employee';
      window.incentiveState.category = 'morning_admin_nonprod';
      window.incentiveState.leaveDays = 0;
      window.incentiveState.absenceDays = 2;
      window.incentiveState.penalty = 'none';
      window.incentiveState.withholdingCase = 'none';
    } else if (preset === 'penalty_attention') {
      window.incentiveState.employeeName = 'حالة موظف صادر بحقه لفت نظر';
      window.incentiveState.jobTitle = 'فني صيانة';
      window.incentiveState.section = 'شعبة العدادات';
      window.incentiveState.degree = 'bachelor_high_diploma';
      window.incentiveState.evaluation = 'good';
      window.incentiveState.serviceYears = 9;
      window.incentiveState.leadership = 'regular_employee';
      window.incentiveState.category = 'shift_tech_prod';
      window.incentiveState.leaveDays = 0;
      window.incentiveState.absenceDays = 0;
      window.incentiveState.penalty = 'attention';
      window.incentiveState.withholdingCase = 'none';
    } else if (preset === 'total_withholding') {
      window.incentiveState.employeeName = 'حالة حجب كامل (إجازة دراسية)';
      window.incentiveState.jobTitle = 'مهندس أقدم';
      window.incentiveState.section = 'الوحدة الفنية';
      window.incentiveState.degree = 'bachelor_high_diploma';
      window.incentiveState.evaluation = 'very_good';
      window.incentiveState.serviceYears = 14;
      window.incentiveState.leadership = 'regular_employee';
      window.incentiveState.category = 'shift_tech_prod';
      window.incentiveState.withholdingCase = 'study_leave';
    }

    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.printIncentiveVoucher = function() {
    window.print();
  };

  window.setPointPriceMode = function(mode) {
    window.incentiveState.centralMode = mode;
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.autoCalculateDepartmentTotalPoints = function() {
    const employees = (window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : [];
    if (!employees || employees.length === 0) {
      alert('لا يوجد موظفون مسجلون في كادر القسم لاحتساب نقاطهم.');
      return;
    }

    let totalPointsSum = 0;
    const currYear = new Date().getFullYear();

    employees.forEach(emp => {
      // 1. Degree
      const dStr = (emp.qualification || emp.degree || '').toLowerCase();
      let certPts = 9.0;
      if (dStr.includes('دكتور') || dStr.includes('phd')) certPts = 10.0;
      else if (dStr.includes('ماجستير') || dStr.includes('master')) certPts = 9.5;
      else if (dStr.includes('عالي') || dStr.includes('بكالوريوس')) certPts = 9.0;
      else if (dStr.includes('دبلوم')) certPts = 8.5;
      else if (dStr.includes('إعداد') || dStr.includes('اعداد')) certPts = 8.0;
      else if (dStr.includes('متوسط')) certPts = 7.0;
      else certPts = 6.0;

      // 2. Eval (Default Good/Very Good)
      const evalPts = 9.0;

      // 3. Service
      const joinYear = emp.hireDate ? new Date(emp.hireDate).getFullYear() : (emp.joinYear || 2015);
      const serviceYears = Math.max(1, Math.min(40, currYear - joinYear));

      // 4. Leadership
      let leaderPts = 0;
      const title = (emp.jobTitle || '').toLowerCase();
      if (title.includes('مدير قسم')) leaderPts = 15.0;
      else if (title.includes('مسؤول شعبة')) leaderPts = 8.0;
      else if (title.includes('مسؤول وحدة') || title.includes('مهندس')) leaderPts = 4.0;

      // 5. Category multiplier
      let multiplier = 10.0;
      const sec = (emp.section || '').toLowerCase();
      if (sec.includes('إدار') || sec.includes('حسابات')) multiplier = 8.5;
      else if (sec.includes('مختبر') || sec.includes('صيان')) multiplier = 9.5;

      const internalSum = (certPts * 0.150) + (evalPts * 0.225) + (serviceYears * 0.100) + (leaderPts * 0.150);
      totalPointsSum += (multiplier * internalSum);
    });

    const roundedSum = Math.round(totalPointsSum);
    window.incentiveState.centralTotalStaffPoints = roundedSum;
    alert('✅ تم احتساب إجمالي نقاط كادر القسم تلقائياً!\nعدد موظفي الكادر: ' + employees.length + ' موظف\nمجموع النقاط الكلي = ' + roundedSum.toLocaleString('en-US') + ' نقطة.');
    
    if (window.app && typeof window.app.render === 'function') {
      window.app.render();
    }
  };

  window.calculateAndApplyCentralPointPrice = function() {
    let totalPool = 0;
    if (window.incentiveState.centralMode === 'direct') {
      totalPool = parseFloat(window.incentiveState.centralDirectPoolAmount) || 0;
    } else {
      const nom = parseFloat(window.incentiveState.centralNominalSalaries) || 0;
      const fam = parseFloat(window.incentiveState.centralFamilyAllowances) || 0;
      const deg = parseFloat(window.incentiveState.centralDegreeAllowances) || 0;
      totalPool = nom + fam + deg;
    }

    const pts = parseFloat(window.incentiveState.centralTotalStaffPoints) || 1;
    const computedPrice = totalPool / pts;

    window.incentiveState.pointPrice = Math.round(computedPrice);
    alert('تم احتساب سعر النقطة بنجاح: ' + Math.round(computedPrice).toLocaleString('en-US') + ' د.ع وتم تعميمه على الحاسبة التفاعلية.');
    window.setIncentiveTab('calculator');
  };

  // Main View Renderer
  window.renderIncentiveCalculatorView = function() {
    const state = window.incentiveState;
    const activeTab = state.activeTab || 'calculator';
    const calc = calculateIncentive(state);

    const user = (window.auth && typeof window.auth.getCurrentUser === 'function') ? window.auth.getCurrentUser() : {};
    const actorUser = user || { role: 'SUPER_ADMIN', departmentId: 'dept-south-prod' };
    const employees = (window.store && typeof window.store.getUnifiedEmployeeRoster === 'function')
      ? window.store.getUnifiedEmployeeRoster(actorUser)
      : ((window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : []);

    return `
    <div style="width: 100%; margin-bottom: 2.5rem;" class="incentive-calculator-container">
      
      <!-- Top Title & Enterprise Seal -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
        <div>
          <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
            <div style="width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, #0d6efd, #0b5ed7); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 1.25rem; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.25);">
              🧮
            </div>
            <div>
              <h2 style="font-size: 1.5rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0; letter-spacing: -0.3px;">
                حاسبة وضوابط الحوافز المالية والتشغيلية الرسمية
              </h2>
              <p style="color: var(--md-sys-color-outline); margin: 0; font-size: 0.85rem; font-weight: 600;">
                القسم المالي والتشغيلي | استناداً لوثيقة وضوابط احتساب وتوزيع الحوافز الرسمية (2- الحافز.pdf) في شركة نفط البصرة
              </p>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <span class="badge badge-primary" style="font-size: 0.82rem; padding: 0.45rem 0.95rem; font-weight: 800; border-radius: 999px; background: rgba(13, 110, 253, 0.1); color: #0d6efd; border: 1px solid rgba(13, 110, 253, 0.25);">
            🏛️ المعيار الوزاري المعتمد
          </span>
          <button onclick="window.printIncentiveVoucher()" class="btn btn-outline" style="font-size: 0.82rem; padding: 0.4rem 0.85rem; display: flex; align-items: center; gap: 0.35rem; font-weight: 700;">
            🖨️ طباعة سند الاستحقاق
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="tabs-header" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; border-bottom: 2px solid var(--md-sys-color-outline-variant); padding-bottom: 0.25rem; overflow-x: auto;">
        <button class="tab-btn ${activeTab === 'calculator' ? 'active' : ''}" onclick="window.setIncentiveTab('calculator')" style="padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.92rem; border-radius: 8px 8px 0 0; cursor: pointer; border: none; background: ${activeTab === 'calculator' ? 'var(--md-sys-color-primary)' : 'transparent'}; color: ${activeTab === 'calculator' ? '#fff' : 'var(--md-sys-color-on-surface)'}; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s ease;">
          <span>🧮</span> الحاسبة التفاعلية المباشرة
        </button>
        <button class="tab-btn ${activeTab === 'matrix' ? 'active' : ''}" onclick="window.setIncentiveTab('matrix')" style="padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.92rem; border-radius: 8px 8px 0 0; cursor: pointer; border: none; background: ${activeTab === 'matrix' ? 'var(--md-sys-color-primary)' : 'transparent'}; color: ${activeTab === 'matrix' ? '#fff' : 'var(--md-sys-color-on-surface)'}; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s ease;">
          <span>📊</span> مصفوفة المعايير والأوزان الرسمية
        </button>
        <button class="tab-btn ${activeTab === 'rules' ? 'active' : ''}" onclick="window.setIncentiveTab('rules')" style="padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.92rem; border-radius: 8px 8px 0 0; cursor: pointer; border: none; background: ${activeTab === 'rules' ? 'var(--md-sys-color-primary)' : 'transparent'}; color: ${activeTab === 'rules' ? '#fff' : 'var(--md-sys-color-on-surface)'}; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s ease;">
          <span>📜</span> ضوابط الاستقطاع والحجب الكامل
        </button>
        <button class="tab-btn ${activeTab === 'point_price' ? 'active' : ''}" onclick="window.setIncentiveTab('point_price')" style="padding: 0.6rem 1.25rem; font-weight: 700; font-size: 0.92rem; border-radius: 8px 8px 0 0; cursor: pointer; border: none; background: ${activeTab === 'point_price' ? 'var(--md-sys-color-primary)' : 'transparent'}; color: ${activeTab === 'point_price' ? '#fff' : 'var(--md-sys-color-on-surface)'}; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s ease;">
          <span>🏢</span> حاسبة سعر النقطة للقسم
        </button>
      </div>

      <!-- Tab Content Rendering -->
      ${activeTab === 'calculator' ? renderInteractiveCalculator(state, calc, employees, user) : ''}
      ${activeTab === 'matrix' ? renderMatrixTab() : ''}
      ${activeTab === 'rules' ? renderRulesTab() : ''}
      ${activeTab === 'point_price' ? renderPointPriceTab(state) : ''}

    </div>
    `;
  };

  // 1. Interactive Calculator Tab (Ultra-Modern, Jewel Frosted Glass & RBAC Scoped)
  function renderInteractiveCalculator(state, calc, employees, user) {
    const isAutoMode = (state.calcMode !== 'manual');
    const curUser = (user && typeof user === 'object') ? user : {};
    const curRole = curUser.role || '';

    // RBAC Permission Resolution
    const canBrowseAll = (window.rbac && typeof window.rbac.hasPermission === 'function' && window.rbac.hasPermission(curUser, 'CAREER_EDIT_INFO')) 
      || ['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(curRole);
    const canBrowseSection = !canBrowseAll && ['SECTION_MANAGER', 'DEPUTY_SECTION_MANAGER', 'UNIT_MANAGER', 'STATION_MANAGER', 'DEPUTY_STATION_MANAGER', 'STATION_SUPERVISOR'].includes(curRole);
    const isRegularEmployee = !canBrowseAll && !canBrowseSection;

    // Filter allowed employees by role scope
    let allowedEmployees = employees || [];
    if (isRegularEmployee) {
      if (curUser && (curUser.id || curUser.employeeId)) {
        const found = employees.find(e => 
          (curUser.employeeId && String(e.employeeId) === String(curUser.employeeId)) ||
          (curUser.id && (String(e.id) === String(curUser.id) || String(e.userId) === String(curUser.id)))
        );
        allowedEmployees = found ? [found] : (employees.length > 0 ? employees.slice(0, 1) : []);
      } else {
        allowedEmployees = (employees && employees.length > 0) ? employees.slice(0, 1) : [];
      }
    } else if (canBrowseSection && curUser) {
      const secFiltered = employees.filter(e => {
        const matchesSec = curUser.section && (e.section === curUser.section);
        const matchesSta = (curUser.station || curUser.stationId) && (e.station === curUser.station || e.stationId === curUser.stationId || e.station === curUser.stationId);
        const isSelf = (curUser.employeeId && String(e.employeeId) === String(curUser.employeeId)) || (curUser.id && String(e.id) === String(curUser.id));
        return matchesSec || matchesSta || isSelf;
      });
      allowedEmployees = secFiltered.length > 0 ? secFiltered : employees;
    }

    // Live search query & section filter
    const searchState = window.incentiveSearchState || { searchQuery: '', selectedSection: 'ALL' };
    const searchQuery = (searchState.searchQuery || '').trim();
    const selectedSection = searchState.selectedSection || 'ALL';
    const isActivelyFiltering = !!searchQuery || selectedSection !== 'ALL';
    const uniqueSections = Array.from(new Set(allowedEmployees.map(e => e.section || e.station).filter(Boolean))).sort();

    const filteredEmployees = isActivelyFiltering ? allowedEmployees.filter(e => {
      if (selectedSection !== 'ALL') {
        const eSec = e.section || e.station || '';
        if (eSec !== selectedSection) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameStr = (e.name || e.fullName || '').toLowerCase();
        const idStr = String(e.employeeId || e.id || '').toLowerCase();
        const titleStr = (e.jobTitle || '').toLowerCase();
        const secStr = (e.section || e.station || '').toLowerCase();
        return nameStr.includes(q) || idStr.includes(q) || titleStr.includes(q) || secStr.includes(q);
      }
      return true;
    }) : [];

    // Current target employee metadata
    const currentEmp = allowedEmployees.find(e => String(e.employeeId || e.id) === String(state.employeeId))
      || allowedEmployees.find(e => (e.name || e.fullName) === state.employeeName)
      || (allowedEmployees.length > 0 ? allowedEmployees[0] : null);

    const currentEmpId = currentEmp ? (currentEmp.employeeId || currentEmp.id) : (state.employeeId || '—');
    const currentEmpName = currentEmp ? (currentEmp.name || currentEmp.fullName) : (state.employeeName || 'منتسب');
    const currentEmpTitle = currentEmp ? (currentEmp.jobTitle || 'موظف') : (state.jobTitle || 'موظف');
    const currentEmpSec = currentEmp ? (currentEmp.section || currentEmp.station || 'قسم الإنتاج الجنوبي') : (state.section || 'قسم الإنتاج الجنوبي');
    const currentEmpHire = currentEmp ? (currentEmp.hireDate || currentEmp.appointmentDate || '—') : '—';

    return `
    <div style="display: flex; flex-direction: column; gap: 1.25rem;">
      
      <!-- Segmented Dual-Mode Switcher -->
      <div class="inc-mode-switcher-wrap">
        <div class="inc-mode-switcher">
          <button type="button" class="inc-mode-btn ${isAutoMode ? 'active-auto' : ''}" onclick="window.setIncentiveCalcMode('auto')">
            <span>⚡</span>
            <span>الوضع التلقائي (الملاكات الرسمية)</span>
          </button>
          <button type="button" class="inc-mode-btn ${!isAutoMode ? 'active-manual' : ''}" onclick="window.setIncentiveCalcMode('manual')">
            <span>🛠️</span>
            <span>المحاكاة والاحتساب اليدوي الحر</span>
          </button>
        </div>
      </div>

      <!-- Presets Bar (Always Available in Both Modes) -->
      <div class="card" style="padding: 0.85rem 1.15rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 800; color: var(--md-sys-color-outline);">
            <span>⚡</span>
            <span>نماذج سريعة جاهزة للاختبار والمحاكاة:</span>
          </div>
          <div class="inc-presets-container">
            <button onclick="window.applyIncentivePreset('prod_engineer')" class="btn btn-sm inc-preset-btn" style="background: rgba(13, 110, 253, 0.08); color: #0d6efd; border-color: rgba(13, 110, 253, 0.25);">
              ⚙️ مهندس تشغيل مناوب
            </button>
            <button onclick="window.applyIncentivePreset('section_manager')" class="btn btn-sm inc-preset-btn" style="background: rgba(25, 135, 84, 0.08); color: #198754; border-color: rgba(25, 135, 84, 0.25);">
              🏢 مسؤول شعبة رأسي
            </button>
            <button onclick="window.applyIncentivePreset('leave_deduction')" class="btn btn-sm inc-preset-btn" style="background: rgba(255, 193, 7, 0.12); color: #b78103; border-color: rgba(255, 193, 7, 0.35);">
              🏖️ إجازة (6 أيام)
            </button>
            <button onclick="window.applyIncentivePreset('absence_deduction')" class="btn btn-sm inc-preset-btn" style="background: rgba(220, 53, 69, 0.08); color: #dc3545; border-color: rgba(220, 53, 69, 0.25);">
              ⚠️ غياب (يومان)
            </button>
            <button onclick="window.applyIncentivePreset('penalty_attention')" class="btn btn-sm inc-preset-btn" style="background: rgba(108, 117, 125, 0.1); color: #6c757d; border-color: rgba(108, 117, 125, 0.3);">
              📝 لفت نظر (-50%)
            </button>
            <button onclick="window.applyIncentivePreset('total_withholding')" class="btn btn-sm inc-preset-btn" style="background: rgba(220, 53, 69, 0.15); color: #dc3545; border-color: rgba(220, 53, 69, 0.35); font-weight: 850;">
              🚫 حجب كامل (100%)
            </button>
          </div>
        </div>
      </div>

      <!-- 4 Jewel Frosted Glass KPI Cards (Top Metrics) -->
      <div class="inc-crystal-grid">
        
        <!-- Crystal 1: Total Points -->
        <div class="inc-crystal-card inc-crystal-points">
          <div class="inc-card-title">
            <span>🎯 مجموع نقاط الموظف:</span>
          </div>
          <div class="inc-card-value">
            ${formatPoints(calc.totalPoints)} <span style="font-size: 0.85rem; font-weight: 750;">نقطة</span>
          </div>
          <div class="inc-card-detail">
            <span>معامل الموقع: <strong>× ${calc.category.multiplier}</strong></span>
            <span>المجموع الداخلي: <strong>${formatPoints(calc.internalSum)}</strong></span>
          </div>
        </div>

        <!-- Crystal 2: Gross Incentive Amount -->
        <div class="inc-crystal-card inc-crystal-gross">
          <div class="inc-card-title">
            <span>💵 الحافز الإجمالي الخام:</span>
          </div>
          <div class="inc-card-value">
            ${formatIQD(calc.grossIncentive)}
          </div>
          <div class="inc-card-detail">
            <span>سعر النقطة:</span>
            <span><strong>${calc.pointPrice.toLocaleString()} د.ع</strong></span>
          </div>
        </div>

        <!-- Crystal 3: Total Deductions -->
        <div class="inc-crystal-card inc-crystal-deductions">
          <div class="inc-card-title">
            <span>⚖️ الاستقطاعات القانونية:</span>
          </div>
          <div class="inc-card-value">
            ${calc.totalDeductions > 0 ? ('- ' + formatIQD(calc.totalDeductions)) : '0 د.ع'}
          </div>
          <div class="inc-card-detail">
            <span>حالة الاستحقاق:</span>
            <span style="font-weight: 800;">${calc.statusLabel}</span>
          </div>
        </div>

        <!-- Crystal 4: Net Payable -->
        <div class="inc-crystal-card inc-crystal-net">
          <div class="inc-card-title">
            <span>✅ صافي الحافز المستحق:</span>
          </div>
          <div class="inc-card-value">
            ${formatIQD(calc.netPayable)}
          </div>
          <div class="inc-card-detail">
            <span>جاهز للصرف المالي</span>
            <span>${calc.isWithheld ? '🚫 محجوب' : (calc.netPayable > 0 ? '✓ مستحق' : '0 د.ع')}</span>
          </div>
        </div>

      </div>

      <!-- Withholding Alert Banner if Triggered -->
      ${calc.isWithheld ? `
      <div style="padding: 1rem 1.25rem; border-radius: 12px; background: rgba(220, 53, 69, 0.08); border: 1.5px solid rgba(220, 53, 69, 0.3); color: #dc3545; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <span style="font-size: 1.4rem;">🚫</span>
          <div>
            <strong style="font-size: 0.95rem;">تم حجب الحافز بالكامل (100%) عن هذا الشهر</strong>
            <p style="margin: 0; font-size: 0.84rem; font-weight: 600;">سبب الحجب القانوني: ${calc.withholdingReason}</p>
          </div>
        </div>
        <span class="badge badge-danger" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; border-radius: 999px;">
          حجب كامل 100%
        </span>
      </div>
      ` : ''}

      <!-- Main Two-Column Organized Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1.5rem; align-items: start;">
        
        <!-- ======================= Column 1: Employee Data & Calculation Inputs ======================= -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Card 1: Employee Identity & Smart Lookup -->
          <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; border-bottom: 1px solid var(--md-sys-color-outline-variant); padding-bottom: 0.65rem;">
              <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0; display: flex; align-items: center; gap: 0.45rem;">
                <span>👤</span>
                <span>بيانات الموظف والبحث الذكي</span>
              </h3>
              <div>
                ${isAutoMode ? `
                  <span class="badge ${canBrowseAll ? 'badge-primary' : (canBrowseSection ? 'badge-success' : 'badge-info')}" style="font-size: 0.74rem; padding: 0.25rem 0.65rem; border-radius: 999px;">
                    ${canBrowseAll ? '🌐 صلاحية شاملة' : (canBrowseSection ? '🔒 نطاق الشعبة' : '🔒 حساب شخصي')}
                  </span>
                ` : `
                  <span class="badge badge-warning" style="font-size: 0.74rem; padding: 0.25rem 0.65rem; border-radius: 999px;">
                    🛠️ محاكاة يدوية
                  </span>
                `}
              </div>
            </div>

            ${isAutoMode ? `
              <!-- Auto Mode: Roster Lookup & Scoped Search -->
              ${isRegularEmployee ? `
                <div class="inc-privacy-banner">
                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <span style="font-size: 1.35rem;">🔒</span>
                    <div>
                      <strong style="font-size: 0.88rem; color: #0284c7;">إضبارتك وسجلك الوظيفي الشخصي | شركة نفط البصرة</strong>
                      <p style="margin: 0; font-size: 0.76rem; color: var(--md-sys-color-outline);">
                        يتم احتساب حافزك الشهري وفق مؤهلك وسنوات خدمتك المسجلة رسمياً مع الحفاظ التام على الخصوصية.
                      </p>
                    </div>
                  </div>
                  <span class="badge badge-primary" style="font-size: 0.74rem; padding: 0.25rem 0.65rem; border-radius: 999px;">
                    ✓ مؤمن
                  </span>
                </div>
              ` : `
                <!-- Manager/Admin Smart Search Controls -->
                <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 0.65rem; margin-bottom: 0.65rem; align-items: center;">
                  
                  <!-- Live Search Input -->
                  <div style="position: relative; width: 100%;">
                    <div style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--md-sys-color-outline); display: flex; align-items: center;">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                    </div>
                    <input type="text" 
                           id="incEmployeeSearchInput" 
                           class="form-control" 
                           style="padding-right: 32px; padding-left: 30px; font-size: 0.82rem; height: 36px; border-radius: 8px; border: 1.5px solid rgba(11, 87, 208, 0.25); font-weight: 700; background: var(--md-sys-color-background); color: var(--md-sys-color-on-surface);" 
                           placeholder="🔍 بحث فوري بالاسم أو الرقم الوظيفي..." 
                           value="${searchQuery}" 
                           oninput="window.handleIncentiveEmployeeSearch(this.value)">
                    ${searchQuery ? `
                      <button type="button" 
                              onclick="window.clearIncentiveEmployeeSearch()" 
                              style="position: absolute; left: 8px; top: 50%; transform: translateY(-50%); border: none; background: transparent; cursor: pointer; color: var(--md-sys-color-outline); font-size: 0.85rem; padding: 2px 5px; font-weight: 900;" 
                              title="مسح البحث">✕</button>
                    ` : ''}
                  </div>

                  <!-- Section / Station Filter Dropdown -->
                  <div>
                    <select class="form-control" 
                            id="incSectionFilterSelect"
                            style="width: 100%; font-size: 0.82rem; height: 36px; border-radius: 8px; border: 1.5px solid rgba(11, 87, 208, 0.25); font-weight: 700; background: var(--md-sys-color-background); color: var(--md-sys-color-on-surface);" 
                            onchange="window.handleIncentiveSectionFilter(this.value)">
                      <option value="ALL" ${selectedSection === 'ALL' ? 'selected' : ''}>🏢 كافة الشُعب والمحطات</option>
                      ${uniqueSections.map(sec => `<option value="${sec}" ${selectedSection === sec ? 'selected' : ''}>📍 ${sec}</option>`).join('')}
                    </select>
                  </div>

                </div>

                <!-- Dynamic Employee Dropdown Selector -->
                <div style="margin-bottom: 0.85rem;">
                  <select class="form-control" 
                          id="incEmployeeSelect"
                          onchange="window.loadEmployeeToIncentive(this.value)" 
                          style="width: 100%; font-size: 0.86rem; padding: 0.5rem 0.85rem; border-radius: 8px; border: 1.8px solid #0d6efd; background: var(--md-sys-color-background); font-weight: 750; color: var(--md-sys-color-on-surface); box-shadow: 0 2px 6px rgba(13, 110, 253, 0.08);">
                    ${!isActivelyFiltering ? `
                      <option value="${currentEmpId}" selected>
                        👤 ${currentEmpName} [الرقم: ${currentEmpId || '—'}] - ${currentEmpTitle} (${currentEmpSec})
                      </option>
                      <option value="" disabled style="color: var(--md-sys-color-outline); font-style: italic;">
                        💡 اكتب الاسم أو الرقم الوظيفي في البحث أعلاه لاختيار منتسب آخر...
                      </option>
                    ` : (filteredEmployees.length === 0 ? `
                      <option value="">⚠️ لا توجد نتائج مطابقة لمعايير البحث الحالية</option>
                    ` : `
                      <option value="">-- اختر موظفاً من النتائج المطابقة (${filteredEmployees.length} نتيجة) --</option>
                      ${filteredEmployees.slice(0, 30).map(e => {
                        const empIdVal = e.employeeId || e.id;
                        const isSel = (String(state.employeeId) === String(empIdVal) || String(state.employeeId) === String(e.id));
                        return `<option value="${empIdVal}" ${isSel ? 'selected' : ''}>${e.name || e.fullName || 'بدون اسم'} [الرقم: ${empIdVal}] - ${e.jobTitle || 'موظف'} (${e.section || e.station || 'قسم الإنتاج الجنوبي'})</option>`;
                      }).join('')}
                      ${filteredEmployees.length > 30 ? `<option value="" disabled>... والمزيد (${filteredEmployees.length - 30} موظف إضافي) - حدد اسم الموظف بدقة أكبر في البحث</option>` : ''}
                    `)}
                  </select>
                </div>
              `}

              <!-- Selected Employee Profile Mini-Dossier -->
              <div class="inc-dossier-card">
                <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.65rem;">
                  <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <div style="width: 44px; height: 44px; min-width: 44px; border-radius: 12px; background: linear-gradient(135deg, #0d6efd 0%, #0284c7 100%); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; font-weight: 900; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);">
                      ${(currentEmpName || 'م').charAt(0)}
                    </div>
                    <div>
                      <div style="font-weight: 850; font-size: 0.98rem; color: var(--md-sys-color-primary);">
                        ${currentEmpName}
                      </div>
                      <div style="font-size: 0.78rem; color: var(--md-sys-color-outline); font-weight: 600;">
                        <span>${currentEmpTitle}</span> | <span>${currentEmpSec}</span>
                      </div>
                    </div>
                  </div>
                  <div style="display: flex; gap: 0.35rem; align-items: center; flex-wrap: wrap;">
                    <span class="badge badge-info" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 6px;">
                      الرقم: ${currentEmpId}
                    </span>
                    <span class="badge badge-primary" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; border-radius: 6px;">
                      الخدمة: ${state.serviceYears} سنة
                    </span>
                  </div>
                </div>
              </div>
            ` : `
              <!-- Manual Mode: Free Form Text Input for Simulation -->
              <div style="margin-bottom: 0.5rem;">
                <label style="display: block; font-size: 0.82rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                  الاسم الكامل أو الصفة (للتجربة والطباعة):
                </label>
                <input type="text" 
                       class="form-control" 
                       value="${state.employeeName || ''}" 
                       placeholder="مثال: مهندس تشغيل مناوب / مسؤول قاطع..." 
                       oninput="window.updateIncentiveField('employeeName', this.value)" 
                       style="width: 100%; font-size: 0.88rem; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1.5px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                <div style="font-size: 0.72rem; color: var(--md-sys-color-outline); margin-top: 0.35rem;">
                  💡 <em>في وضع المحاكاة، يمكنك كتابة أي اسم أو صفة وظيفية لإجراء اختبارات تقديرية وطباعة سند الحافز.</em>
                </div>
              </div>
            `}

          </div>

          <!-- Card 2: Qualifications & Service & Appraisal -->
          <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.45rem;">
              <span>🎓</span>
              <span>المؤهلات الدراسية والخدمة والتقييم السنوي</span>
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem; margin-bottom: 1rem;">
              
              <!-- Degree Selector -->
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                  🎓 التحصيل الدراسي (الشهادة):
                </label>
                <select class="form-control" onchange="window.updateIncentiveField('degree', this.value)" style="width: 100%; font-size: 0.84rem; padding: 0.45rem 0.65rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                  ${CERTIFICATE_MATRIX.map(c => `<option value="${c.id}" ${state.degree === c.id ? 'selected' : ''}>${c.title} (${c.points} نقطة)</option>`).join('')}
                </select>
                <span style="font-size: 0.7rem; color: var(--md-sys-color-outline);">الوزن المعتمد = 0.150</span>
              </div>

              <!-- Annual Evaluation -->
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                  ⭐ درجة التقييم السنوي:
                </label>
                <select class="form-control" onchange="window.updateIncentiveField('evaluation', this.value)" style="width: 100%; font-size: 0.84rem; padding: 0.45rem 0.65rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                  ${EVALUATION_MATRIX.map(e => `<option value="${e.id}" ${state.evaluation === e.id ? 'selected' : ''}>${e.title} (${e.points} نقطة)</option>`).join('')}
                </select>
                <span style="font-size: 0.7rem; color: var(--md-sys-color-outline);">الوزن المعتمد = 0.225</span>
              </div>

            </div>

            <!-- Service Years Input -->
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                ⏳ سنوات الخدمة الفعلية المحسوبة:
              </label>
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <input type="number" min="0" max="40" class="form-control" value="${state.serviceYears || 0}" oninput="window.updateIncentiveField('serviceYears', this.value)" style="width: 100%; font-size: 0.95rem; font-weight: 800; padding: 0.45rem 0.75rem; border-radius: 8px; border: 1.5px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                <span style="font-size: 0.84rem; font-weight: 800; color: var(--md-sys-color-outline); white-space: nowrap;">سنة</span>
              </div>
              <div style="font-size: 0.7rem; color: var(--md-sys-color-outline); margin-top: 0.25rem;">
                وزن الخدمة = 0.100 لكل سنة | الناتج الجزئي = ${(state.serviceYears * 0.100).toFixed(3)} نقطة
              </div>
            </div>

          </div>

          <!-- Card 3: Leadership & Category & Point Price -->
          <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.45rem;">
              <span>👔</span>
              <span>المسؤولية القيادية وطبيعة العمل وسعر النقطة</span>
            </h3>

            <!-- Leadership Selector -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                👔 المستوى القيادي والمسؤولية الإدارية:
              </label>
              <select class="form-control" onchange="window.updateIncentiveField('leadership', this.value)" style="width: 100%; font-size: 0.84rem; padding: 0.45rem 0.65rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                ${LEADERSHIP_MATRIX.map(l => `<option value="${l.id}" ${state.leadership === l.id ? 'selected' : ''}>${l.title} (${l.points} نقطة)</option>`).join('')}
              </select>
              <span style="font-size: 0.7rem; color: var(--md-sys-color-outline);">الوزن المعتمد = 0.150</span>
            </div>

            <!-- Category Selector -->
            <div style="margin-bottom: 1rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                📍 الفئة وموقع وطبيعة العمل (المعامل المضروب):
              </label>
              <select class="form-control" onchange="window.updateIncentiveField('category', this.value)" style="width: 100%; font-size: 0.84rem; padding: 0.45rem 0.65rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                ${CATEGORY_MATRIX.map(cat => `<option value="${cat.id}" ${state.category === cat.id ? 'selected' : ''}>${cat.title} [× ${cat.multiplier}]</option>`).join('')}
              </select>
            </div>

            <!-- Point Price Box -->
            <div style="background: rgba(13, 110, 253, 0.03); border: 1.5px solid rgba(13, 110, 253, 0.25); border-radius: 12px; padding: 0.85rem 1rem;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; flex-wrap: wrap; gap: 0.35rem;">
                <label style="font-size: 0.84rem; font-weight: 800; color: #0d6efd; margin: 0;">
                  💵 سعر النقطة الواحدة للشهر (د.ع):
                </label>
                <button type="button" onclick="window.setIncentiveTab('point_price')" class="btn btn-sm" style="font-size: 0.72rem; padding: 0.2rem 0.55rem; background: rgba(13, 110, 253, 0.1); color: #0d6efd; border: 1px solid rgba(13, 110, 253, 0.25); border-radius: 6px; font-weight: 800;">
                  🏢 حاسبة سعر النقطة للقسم
                </button>
              </div>
              
              <div style="display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.4rem;">
                <input type="number" step="100" class="form-control" value="${state.pointPrice || 10000}" oninput="window.updateIncentiveField('pointPrice', this.value)" style="width: 100%; font-size: 1rem; font-weight: 850; padding: 0.45rem 0.75rem; border-radius: 8px; border: 1.5px solid #0d6efd; background: var(--md-sys-color-surface); color: var(--md-sys-color-primary); font-family: monospace;">
                <span style="font-size: 0.82rem; font-weight: 800; color: var(--md-sys-color-outline); white-space: nowrap;">د.ع</span>
              </div>

              <div style="display: flex; flex-wrap: wrap; gap: 0.25rem; align-items: center;">
                <span style="font-size: 0.7rem; font-weight: 700; color: var(--md-sys-color-outline);">أسعار شائعة:</span>
                <button type="button" onclick="window.updateIncentiveField('pointPrice', 10000)" class="btn btn-sm" style="font-size: 0.7rem; padding: 0.1rem 0.45rem; border-radius: 5px; background: ${parseInt(state.pointPrice, 10) === 10000 ? '#0d6efd' : 'var(--md-sys-color-surface)'}; color: ${parseInt(state.pointPrice, 10) === 10000 ? '#fff' : 'inherit'}; border: 1px solid var(--md-sys-color-outline-variant); font-weight: 800;">10,000 (القياسي)</button>
                <button type="button" onclick="window.updateIncentiveField('pointPrice', 9500)" class="btn btn-sm" style="font-size: 0.7rem; padding: 0.1rem 0.45rem; border-radius: 5px; background: ${parseInt(state.pointPrice, 10) === 9500 ? '#0d6efd' : 'var(--md-sys-color-surface)'}; color: ${parseInt(state.pointPrice, 10) === 9500 ? '#fff' : 'inherit'}; border: 1px solid var(--md-sys-color-outline-variant); font-weight: 700;">9,500</button>
                <button type="button" onclick="window.updateIncentiveField('pointPrice', 9000)" class="btn btn-sm" style="font-size: 0.7rem; padding: 0.1rem 0.45rem; border-radius: 5px; background: ${parseInt(state.pointPrice, 10) === 9000 ? '#0d6efd' : 'var(--md-sys-color-surface)'}; color: ${parseInt(state.pointPrice, 10) === 9000 ? '#fff' : 'inherit'}; border: 1px solid var(--md-sys-color-outline-variant); font-weight: 700;">9,000</button>
                <button type="button" onclick="window.updateIncentiveField('pointPrice', 10500)" class="btn btn-sm" style="font-size: 0.7rem; padding: 0.1rem 0.45rem; border-radius: 5px; background: ${parseInt(state.pointPrice, 10) === 10500 ? '#0d6efd' : 'var(--md-sys-color-surface)'}; color: ${parseInt(state.pointPrice, 10) === 10500 ? '#fff' : 'inherit'}; border: 1px solid var(--md-sys-color-outline-variant); font-weight: 700;">10,500</button>
              </div>
            </div>

          </div>

        </div>

        <!-- ======================= Column 2: Deductions, Equation Breakdown & Voucher ======================= -->
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          
          <!-- Card 4: Deductions & Penalties & Withholding Controls -->
          <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.03);">
            <h3 style="font-size: 1.05rem; font-weight: 800; color: #dc3545; margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.45rem;">
              <span>⚖️</span>
              <span>ضوابط الاستقطاع والغياب والحالات الانضباطية</span>
            </h3>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                  🏖️ أيام الإجازات (الاعتيادية + المرضية):
                </label>
                <input type="number" min="0" max="31" class="form-control" value="${state.leaveDays || 0}" oninput="window.updateIncentiveField('leaveDays', this.value)" style="width: 100%; font-size: 0.88rem; padding: 0.45rem 0.75rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                <span style="font-size: 0.7rem; color: var(--md-sys-color-outline);">> 4 أيام: يستقطع يومان لكل يوم زائد</span>
              </div>

              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                  🚫 الغياب بدون عذر (بالأيام):
                </label>
                <input type="number" min="0" max="31" class="form-control" value="${state.absenceDays || 0}" oninput="window.updateIncentiveField('absenceDays', this.value)" style="width: 100%; font-size: 0.88rem; padding: 0.45rem 0.75rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                <span style="font-size: 0.7rem; color: var(--md-sys-color-outline);">يوم: 1/3 | يومان: 2/3 | أكثر: حجب 100%</span>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1rem;">
              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                  🎓 أيام التفرغ / الإيفاد الدراسي:
                </label>
                <input type="number" min="0" max="31" class="form-control" value="${state.deputationDays || 0}" oninput="window.updateIncentiveField('deputationDays', this.value)" style="width: 100%; font-size: 0.88rem; padding: 0.45rem 0.75rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                <span style="font-size: 0.7rem; color: var(--md-sys-color-outline);">> 4 أيام: يستقطع يومان لكل يوم زائد</span>
              </div>

              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
                  📝 العقوبة الانضباطية خلال الشهر:
                </label>
                <select class="form-control" onchange="window.updateIncentiveField('penalty', this.value)" style="width: 100%; font-size: 0.84rem; padding: 0.45rem 0.65rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
                  <option value="none" ${state.penalty === 'none' ? 'selected' : ''}>لا توجد عقوبة (0%)</option>
                  <option value="attention" ${state.penalty === 'attention' ? 'selected' : ''}>لفت نظر (استقطاع 50% لشهر)</option>
                  <option value="warning" ${state.penalty === 'warning' ? 'selected' : ''}>إنذار أو أشد (حجب 100% لشهر)</option>
                </select>
              </div>
            </div>

            <div style="margin-bottom: 0.25rem;">
              <label style="display: block; font-size: 0.78rem; font-weight: 750; margin-bottom: 0.35rem; color: #dc3545;">
                🛑 حالات الحجب الكلي المباشر (100%):
              </label>
              <select class="form-control" onchange="window.updateIncentiveField('withholdingCase', this.value)" style="width: 100%; font-size: 0.84rem; padding: 0.45rem 0.65rem; border-radius: 8px; border: 1px solid #dc3545; background: rgba(220, 53, 69, 0.03);">
                ${WITHHOLDING_CASES.map(w => `<option value="${w.id}" ${state.withholdingCase === w.id ? 'selected' : ''}>${w.label}</option>`).join('')}
              </select>
            </div>

          </div>

          <!-- Card 5: Step-by-Step Equation Breakdown -->
          <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;">
            <h3 style="font-size: 1rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.85rem 0; display: flex; align-items: center; gap: 0.4rem;">
              <span>📐</span> تفكيك المعادلة الحسابية المعتمدة
            </h3>

            <div style="font-family: monospace; font-size: 0.82rem; background: var(--md-sys-color-surface-container-low); padding: 0.85rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); line-height: 1.7; direction: ltr; text-align: left; overflow-x: auto; margin-bottom: 0.85rem;">
              <div><strong>Formula:</strong> Points = CategoryMultiplier × [(Degree × 0.150) + (Eval × 0.225) + (ServiceYears × 0.100) + (Leader × 0.150)]</div>
              <div style="color: #0d6efd; margin-top: 0.35rem;"><strong>Degree Score:</strong> ${calc.cert.points} × 0.150 = ${formatPoints(calc.certScore)}</div>
              <div style="color: #0d6efd;"><strong>Eval Score:</strong> ${calc.evalItem.points} × 0.225 = ${formatPoints(calc.evalScore)}</div>
              <div style="color: #0d6efd;"><strong>Service Score:</strong> ${calc.serviceYears} × 0.100 = ${formatPoints(calc.serviceScore)}</div>
              <div style="color: #0d6efd;"><strong>Leader Score:</strong> ${calc.leader.points} × 0.150 = ${formatPoints(calc.leaderScore)}</div>
              <div style="border-top: 1px dashed #ccc; margin: 0.35rem 0; padding-top: 0.25rem;"><strong>Internal Sum:</strong> ${formatPoints(calc.certScore)} + ${formatPoints(calc.evalScore)} + ${formatPoints(calc.serviceScore)} + ${formatPoints(calc.leaderScore)} = <strong>${formatPoints(calc.internalSum)}</strong></div>
              <div style="color: #198754;"><strong>Total Points:</strong> ${calc.category.multiplier} (Category) × ${formatPoints(calc.internalSum)} = <strong>${formatPoints(calc.totalPoints)} Points</strong></div>
              <div style="color: #198754;"><strong>Gross Incentive:</strong> ${formatPoints(calc.totalPoints)} × ${calc.pointPrice.toLocaleString()} IQD = <strong>${Math.round(calc.grossIncentive).toLocaleString()} IQD</strong></div>
            </div>

            <!-- Deductions Details Breakdown List -->
            <div style="font-size: 0.82rem; border-top: 1px solid var(--md-sys-color-outline-variant); padding-top: 0.75rem;">
              <div style="font-weight: 700; margin-bottom: 0.5rem; color: var(--md-sys-color-on-surface);">تفاصيل الاستقطاعات المطبقة:</div>
              <ul style="margin: 0; padding-right: 1.25rem; line-height: 1.6; color: var(--md-sys-color-on-surface-variant);">
                ${calc.leaveDeduction > 0 ? `
                  <li style="color: #d9534f;">استقطاع إجازات تجاوزت 4 أيام (${state.leaveDays} يوم إجازة = استقطاع ${calc.leaveDeductedDays} يوم حافز): <strong>-${formatIQD(calc.leaveDeduction)}</strong></li>
                ` : '<li>لا يوجد استقطاع إجازات (الإجازات ضمن الحد المسموح 4 أيام أو أقل)</li>'}

                ${calc.absenceDeduction > 0 ? `
                  <li style="color: #d9534f;">استقطاع غياب بدون عذر (${state.absenceDays} يوم = استقطاع ${state.absenceDays === 1 ? 'ثلث الحافز' : 'ثلثي الحافز'}): <strong>-${formatIQD(calc.absenceDeduction)}</strong></li>
                ` : '<li>لا يوجد استقطاع غياب</li>'}

                ${calc.deputationDeduction > 0 ? `
                  <li style="color: #d9534f;">استقطاع تفرغ / إيفاد دراسي تجاوز 4 أيام (${state.deputationDays} يوم = استقطاع ${calc.deputationDeductedDays} يوم حافز): <strong>-${formatIQD(calc.deputationDeduction)}</strong></li>
                ` : ''}

                ${calc.penaltyDeduction > 0 ? `
                  <li style="color: #d9534f;">استقطاع عقوبة لفت نظر (50% من الحافز): <strong>-${formatIQD(calc.penaltyDeduction)}</strong></li>
                ` : ''}
              </ul>
            </div>

            <!-- Action Button: Print Voucher -->
            <div style="margin-top: 1rem; text-align: left;">
              <button onclick="window.printIncentiveVoucher()" class="btn btn-outline" style="font-size: 0.84rem; padding: 0.5rem 1rem; font-weight: 750; display: inline-flex; align-items: center; gap: 0.4rem;">
                <span>🖨️</span>
                <span>طباعة قسيمة وسند الاستحقاق الرسمي</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
    `;
  }

  // 2. Matrix Tab Renderer
  function renderMatrixTab() {
    return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      
      <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.5rem 0;">
          🎓 1. مصفوفة التحصيل الدراسي (الوزن المعتمد = 0.150)
        </h3>
        <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0 0 1rem 0;">
          تحدد النقاط الممنوحة وفق آخر شهادة معترف بها رسمياً ومضافة في الإضبارة الشخصية للمنتسب.
        </p>
        <div style="overflow-x: auto;">
          <table class="table" style="width: 100%; font-size: 0.86rem; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--md-sys-color-surface-container-low); border-bottom: 2px solid var(--md-sys-color-outline-variant); text-align: right;">
                <th style="padding: 0.6rem 0.85rem;">الشهادة الدراسية</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">النقاط الأساسية</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">معامل الوزن</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">الناتج الجزئي</th>
                <th style="padding: 0.6rem 0.85rem;">الملاحظات والوصف</th>
              </tr>
            </thead>
            <tbody>
              ${CERTIFICATE_MATRIX.map(c => `
                <tr style="border-bottom: 1px solid var(--md-sys-color-outline-variant);">
                  <td style="padding: 0.6rem 0.85rem; font-weight: 700;">${c.title}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 800; color: #0d6efd;">${c.points}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-family: monospace;">× ${c.weight}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 800; color: #198754; font-family: monospace;">${c.score.toFixed(3)}</td>
                  <td style="padding: 0.6rem 0.85rem; color: var(--md-sys-color-on-surface-variant); font-size: 0.8rem;">${c.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.5rem 0;">
          ⭐ 2. مصفوفة التقييم السنوي للموظف (الوزن المعتمد = 0.225) والنسب المسموحة للكادر
        </h3>
        <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0 0 1rem 0;">
          وفق الضوابط، يجب ألا تتجاوز نسبة المتميزين الحدود المحددة لكل قسم وهيأة تشغيلية.
        </p>
        <div style="overflow-x: auto;">
          <table class="table" style="width: 100%; font-size: 0.86rem; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--md-sys-color-surface-container-low); border-bottom: 2px solid var(--md-sys-color-outline-variant); text-align: right;">
                <th style="padding: 0.6rem 0.85rem;">درجة التقييم السنوي</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">النقاط الأساسية</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">معامل الوزن</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">الناتج الجزئي</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">النسبة القصوى للكادر</th>
                <th style="padding: 0.6rem 0.85rem;">الأثر على الحافز</th>
              </tr>
            </thead>
            <tbody>
              ${EVALUATION_MATRIX.map(e => `
                <tr style="border-bottom: 1px solid var(--md-sys-color-outline-variant);">
                  <td style="padding: 0.6rem 0.85rem; font-weight: 700;">${e.title}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 800; color: #0d6efd;">${e.points}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-family: monospace;">× ${e.weight}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 800; color: #198754; font-family: monospace;">${e.score.toFixed(3)}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 700; color: #6f42c1;">${e.quota}</td>
                  <td style="padding: 0.6rem 0.85rem; color: ${e.points === 0 ? '#dc3545' : 'var(--md-sys-color-on-surface-variant)'}; font-size: 0.8rem;">${e.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.5rem 0;">
          👔 3. مصفوفة المستويات القيادية والمسؤوليات (الوزن المعتمد = 0.150)
        </h3>
        <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0 0 1rem 0;">
          تمنح استناداً للأوامر الإدارية الوزارية أو الصادرة من إدارة الشركة بالتكليف الفعلي بالمنصب.
        </p>
        <div style="overflow-x: auto;">
          <table class="table" style="width: 100%; font-size: 0.86rem; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--md-sys-color-surface-container-low); border-bottom: 2px solid var(--md-sys-color-outline-variant); text-align: right;">
                <th style="padding: 0.6rem 0.85rem;">المستوى القيادي / المنصب الإداري</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">النقاط الأساسية</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">معامل الوزن</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">الناتج الجزئي</th>
                <th style="padding: 0.6rem 0.85rem;">نطاق المسؤولية</th>
              </tr>
            </thead>
            <tbody>
              ${LEADERSHIP_MATRIX.map(l => `
                <tr style="border-bottom: 1px solid var(--md-sys-color-outline-variant);">
                  <td style="padding: 0.6rem 0.85rem; font-weight: 700;">${l.title}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 800; color: #0d6efd;">${l.points}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-family: monospace;">× ${l.weight}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 800; color: #198754; font-family: monospace;">${l.score.toFixed(3)}</td>
                  <td style="padding: 0.6rem 0.85rem; color: var(--md-sys-color-on-surface-variant); font-size: 0.8rem;">${l.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;">
        <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.5rem 0;">
          📍 4. مصفوفة فئات ومواقع العمل وطبيعة الدوام (المعاملات المضروبة)
        </h3>
        <p style="color: var(--md-sys-color-outline); font-size: 0.82rem; margin: 0 0 1rem 0;">
          هذا المعامل يضرب في كامل ناتج مجموع الأوزان الأربعة الداخلية ليعطي إجمالي نقاط الموظف.
        </p>
        <div style="overflow-x: auto;">
          <table class="table" style="width: 100%; font-size: 0.86rem; border-collapse: collapse;">
            <thead>
              <tr style="background: var(--md-sys-color-surface-container-low); border-bottom: 2px solid var(--md-sys-color-outline-variant); text-align: right;">
                <th style="padding: 0.6rem 0.85rem;">فئة وطبيعة العمل والموقع</th>
                <th style="padding: 0.6rem 0.85rem; text-align: center;">المعامل المضروب (Multiplier)</th>
                <th style="padding: 0.6rem 0.85rem;">الوصف التشغيلي</th>
              </tr>
            </thead>
            <tbody>
              ${CATEGORY_MATRIX.map(cat => `
                <tr style="border-bottom: 1px solid var(--md-sys-color-outline-variant);">
                  <td style="padding: 0.6rem 0.85rem; font-weight: 700;">${cat.title}</td>
                  <td style="padding: 0.6rem 0.85rem; text-align: center; font-weight: 900; color: #d63384; font-size: 1rem;">× ${cat.multiplier}</td>
                  <td style="padding: 0.6rem 0.85rem; color: var(--md-sys-color-on-surface-variant); font-size: 0.8rem;">${cat.desc}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    `;
  }

  // 3. Rules & Regulations Tab Renderer
  function renderRulesTab() {
    return `
    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
      
      <!-- Statutory Guidelines Card -->
      <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.4rem;">
          <span>⚖️</span> القواعد والضوابط القانونية لحساب الاستقطاعات الشهرية
        </h3>
        <p style="color: var(--md-sys-color-outline); font-size: 0.84rem; margin: 0 0 1rem 0;">
          تحسب قيمة اليوم الواحد المستقطع من الحافز وفق القاعدة: <strong>(حافز الشهر ÷ 30)</strong>.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          
          <div style="padding: 1rem; border-radius: 10px; background: rgba(13, 110, 253, 0.04); border: 1px solid rgba(13, 110, 253, 0.2);">
            <div style="font-weight: 800; font-size: 0.92rem; color: #0d6efd; margin-bottom: 0.35rem;">
              🏖️ 1. الإجازات (الاعتيادية + المرضية + بدون راتب)
            </div>
            <div style="font-size: 0.82rem; line-height: 1.6; color: var(--md-sys-color-on-surface);">
              • الحد المسموح به دون أي استقطاع هو <strong>(4) أيام</strong> في الشهر.<br>
              • إذا تجاوزت الإجازات 4 أيام، يستقطع <strong>يومان من الحافز عن كل يوم إجازة زائد</strong>.<br>
              • <em>مثال:</em> إجازة 6 أيام = (6 - 4) × 2 = يستقطع 4 أيام من الحافز.
            </div>
          </div>

          <div style="padding: 1rem; border-radius: 10px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.2);">
            <div style="font-weight: 800; font-size: 0.92rem; color: #dc3545; margin-bottom: 0.35rem;">
              🚫 2. الغياب بدون عذر رسمي
            </div>
            <div style="font-size: 0.82rem; line-height: 1.6; color: var(--md-sys-color-on-surface);">
              • غياب يوم واحد: يستقطع <strong>ثلث (1/3) الحافز</strong> بالكامل.<br>
              • غياب يومين: يستقطع <strong>ثلثا (2/3) الحافز</strong> بالكامل.<br>
              • غياب أكثر من يومين: <strong>حجب الحافز بالكامل (100%)</strong> عن ذلك الشهر.
            </div>
          </div>

          <div style="padding: 1rem; border-radius: 10px; background: rgba(255, 193, 7, 0.08); border: 1px solid rgba(255, 193, 7, 0.3);">
            <div style="font-weight: 800; font-size: 0.92rem; color: #b78103; margin-bottom: 0.35rem;">
              🎓 3. التفرغ والإيفاد للدراسة
            </div>
            <div style="font-size: 0.82rem; line-height: 1.6; color: var(--md-sys-color-on-surface);">
              • إذا كان التفرغ أو الإيفاد أكثر من 4 أيام وحتى 19 يوماً: يستقطع <strong>يومان عن كل يوم زائد</strong>.<br>
              • إذا تجاوز التفرغ 19 يوماً: <strong>يحجب الحافز بالكامل (100%)</strong>.
            </div>
          </div>

          <div style="padding: 1rem; border-radius: 10px; background: rgba(108, 117, 125, 0.06); border: 1px solid rgba(108, 117, 125, 0.25);">
            <div style="font-weight: 800; font-size: 0.92rem; color: #495057; margin-bottom: 0.35rem;">
              📝 4. العقوبات الانضباطية
            </div>
            <div style="font-size: 0.82rem; line-height: 1.6; color: var(--md-sys-color-on-surface);">
              • عقوبة لفت نظر: يستقطع <strong>50%</strong> من حافز شهر واحد.<br>
              • عقوبة إنذار أو أي عقوبة أشد: <strong>حجب الحافز بالكامل (100%)</strong> عن ذلك الشهر.
            </div>
          </div>

        </div>
      </div>

      <!-- 11 Cases of Total Withholding -->
      <div class="card" style="padding: 1.25rem; background: var(--md-sys-color-surface); border: 1.5px solid rgba(220, 53, 69, 0.3); border-radius: 14px;">
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #dc3545; margin: 0 0 0.75rem 0; display: flex; align-items: center; gap: 0.4rem;">
          <span>🛑</span> الحالات الإحدى عشرة (11) لحجب الحافز بالكامل (100%)
        </h3>
        <p style="color: var(--md-sys-color-outline); font-size: 0.84rem; margin: 0 0 1rem 0;">
          الحالات الحصرية المعتمدة قانونياً والتي تمنع استحقاق أي مبلغ من الحافز للموظف خلال الشهر:
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0.75rem;">
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            1️⃣ إجازة الأمومة
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            2️⃣ إجازة الوضع / الولادة
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            3️⃣ الإجازة الدراسية
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            4️⃣ إجازات اعتيادية/مرضية تتجاوز 19 يوماً
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            5️⃣ التفرغ أو الإيفاد الذي يتجاوز 19 يوماً
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            6️⃣ العدة الشرعية لوفاة الزوج
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            7️⃣ الغياب غير المبرر لأكثر من يومين
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            8️⃣ صدور عقوبة إنذار أو أشد
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            9️⃣ التقييم السنوي الضعيف (أقل من 50%)
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            🔟 موظف بدون مخصصات أو الوفاة
          </div>
          <div style="padding: 0.65rem 0.85rem; border-radius: 8px; background: rgba(220, 53, 69, 0.04); border: 1px solid rgba(220, 53, 69, 0.15); font-size: 0.82rem; font-weight: 700;">
            1️⃣1️⃣ الموظف خارج الخدمة (الرمز Q)
          </div>
        </div>
      </div>

    </div>
    `;
  }

  // 4. Central Point Price Calculator Tab (Simplified, Crystal Clear & 100% Accurate)
  function renderPointPriceTab(state) {
    const isDirect = (state.centralMode === 'direct');
    const nom = parseFloat(state.centralNominalSalaries) || 0;
    const fam = parseFloat(state.centralFamilyAllowances) || 0;
    const deg = parseFloat(state.centralDegreeAllowances) || 0;
    const directPool = parseFloat(state.centralDirectPoolAmount) || 0;
    const pts = parseFloat(state.centralTotalStaffPoints) || 1;

    const totalPool = isDirect ? directPool : (nom + fam + deg);
    const computedPrice = totalPool / pts;

    const employees = (window.store && typeof window.store.getEmployees === 'function') ? window.store.getEmployees() : [];

    return `
    <div style="max-width: 850px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.25rem;">
      
      <!-- Explanatory Master Banner: How to know Point Price -->
      <div class="card" style="padding: 1.25rem; background: linear-gradient(135deg, rgba(13, 110, 253, 0.06), rgba(11, 87, 208, 0.02)); border: 1.5px solid rgba(13, 110, 253, 0.25); border-radius: 14px;">
        <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.65rem;">
          <div style="width: 34px; height: 34px; border-radius: 8px; background: #0d6efd; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 900;">
            ❓
          </div>
          <div>
            <h3 style="margin: 0; font-size: 1.1rem; font-weight: 800; color: var(--md-sys-color-primary);">
              كيف تعرف سعر النقطة الواحدة لشهر معين بدقة؟
            </h3>
            <p style="margin: 0; font-size: 0.8rem; color: var(--md-sys-color-outline);">
              دليل المحاسب والمنتسب لمعرفة وتحديد سعر النقطة وفق تعليمات وضوابط شركة نفط البصرة (ملف 2- الحافز.pdf):
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem; margin-top: 0.75rem;">
          
          <div style="padding: 0.75rem; border-radius: 10px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant);">
            <div style="font-weight: 800; font-size: 0.84rem; color: #0d6efd; margin-bottom: 0.25rem;">
              📜 1. الإشعار المالي الشهري (الأسهل والأسرع)
            </div>
            <div style="font-size: 0.78rem; color: var(--md-sys-color-on-surface-variant); line-height: 1.45;">
              يصدر القسم المالي / شعبة الحسابات كتاباً رسمياً في نهاية كل شهر يحدد سعر النقطة المعتمد (مثال: 10,000 د.ع أو 9,800 د.ع). اكتب هذا الرقم مباشرة في الحاسبة.
            </div>
          </div>

          <div style="padding: 0.75rem; border-radius: 10px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant);">
            <div style="font-weight: 800; font-size: 0.84rem; color: #198754; margin-bottom: 0.25rem;">
              ⭐ 2. السعر القياسي التقديري (10,000 د.ع)
            </div>
            <div style="font-size: 0.78rem; color: var(--md-sys-color-on-surface-variant); line-height: 1.45;">
              إذا لم يصل كتاب إشعار الشهر بعد، فإن السعر القياسي التقديري الأكثر دقة وتطابقاً في الحسابات الشهرية هو <strong>10,000 دينار لكل نقطة</strong>.
            </div>
          </div>

          <div style="padding: 0.75rem; border-radius: 10px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant);">
            <div style="font-weight: 800; font-size: 0.84rem; color: #d63384; margin-bottom: 0.25rem;">
              📐 3. الحساب المركزي بالمعادلة الرسمية
            </div>
            <div style="font-size: 0.78rem; color: var(--md-sys-color-on-surface-variant); line-height: 1.45;">
              سعر النقطة = (إجمالي مبالغ الحوافز) ÷ (مجموع نقاط جميع منتسبي القسم). يمكنك حسابه أدناه بدقة متناهية.
            </div>
          </div>

        </div>
      </div>

      <!-- Main Central Point Price Calculator Card -->
      <div class="card" style="padding: 1.5rem; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant); border-radius: 14px;">
        
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--md-sys-color-outline-variant); padding-bottom: 0.75rem;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: var(--md-sys-color-primary); margin: 0;">
              🏢 حاسبة سعر النقطة المركزية للقسم والشركة (أداة الحساب الذكي)
            </h3>
            <p style="color: var(--md-sys-color-outline); font-size: 0.8rem; margin: 0;">
              اختر أسلوب إدخال كتلة المبالغ المخصصة للقسم، وسيقوم النظام بحساب سعر النقطة بدقة فلس واحد.
            </p>
          </div>

          <!-- Mode Toggle Buttons -->
          <div style="display: flex; gap: 0.35rem; background: var(--md-sys-color-surface-container-low); padding: 0.25rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant);">
            <button type="button" onclick="window.setPointPriceMode('direct')" class="btn btn-sm" style="font-size: 0.78rem; padding: 0.3rem 0.75rem; border-radius: 6px; font-weight: 800; background: ${isDirect ? '#0d6efd' : 'transparent'}; color: ${isDirect ? '#fff' : 'inherit'}; border: none;">
              ⚡ إدخال المبلغ الإجمالي مباشرة (سريع)
            </button>
            <button type="button" onclick="window.setPointPriceMode('detailed')" class="btn btn-sm" style="font-size: 0.78rem; padding: 0.3rem 0.75rem; border-radius: 6px; font-weight: 800; background: ${!isDirect ? '#0d6efd' : 'transparent'}; color: ${!isDirect ? '#fff' : 'inherit'}; border: none;">
              📋 تفكيك المعادلة (اسمية + زوجية + شهادة)
            </button>
          </div>
        </div>

        ${isDirect ? `
        <!-- Mode 1: Direct Total Pool Input -->
        <div style="margin-bottom: 1.25rem; background: rgba(13, 110, 253, 0.03); border: 1.5px solid rgba(13, 110, 253, 0.2); border-radius: 12px; padding: 1rem;">
          <label style="display: block; font-size: 0.84rem; font-weight: 800; margin-bottom: 0.4rem; color: #0d6efd;">
            💰 إجمالي المخصص المالي / كتلة حوافز القسم لهذا الشهر (د.ع):
          </label>
          <input type="number" step="1000000" class="form-control" value="${state.centralDirectPoolAmount || 563000000}" oninput="window.updateIncentiveField('centralDirectPoolAmount', this.value)" style="width: 100%; font-size: 1.1rem; font-weight: 900; padding: 0.6rem 0.85rem; border-radius: 8px; border: 1.5px solid #0d6efd; background: var(--md-sys-color-surface); font-family: monospace;">
          <div style="display: flex; gap: 0.35rem; margin-top: 0.45rem; flex-wrap: wrap;">
            <span style="font-size: 0.72rem; color: var(--md-sys-color-outline); font-weight: 700;">أمثلة جاهزة:</span>
            <button type="button" onclick="window.updateIncentiveField('centralDirectPoolAmount', 500000000)" class="btn btn-sm" style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 5px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant);">500 مليون د.ع</button>
            <button type="button" onclick="window.updateIncentiveField('centralDirectPoolAmount', 563000000)" class="btn btn-sm" style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 5px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant);">563 مليون د.ع</button>
            <button type="button" onclick="window.updateIncentiveField('centralDirectPoolAmount', 600000000)" class="btn btn-sm" style="font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 5px; background: var(--md-sys-color-surface); border: 1px solid var(--md-sys-color-outline-variant);">600 مليون د.ع</button>
          </div>
        </div>
        ` : `
        <!-- Mode 2: Detailed Breakdown Input -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
              1. إجمالي الرواتب الاسمية للقسم (د.ع):
            </label>
            <input type="number" class="form-control" value="${state.centralNominalSalaries || 0}" oninput="window.updateIncentiveField('centralNominalSalaries', this.value)" style="width: 100%; font-size: 0.9rem; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
              2. مخصصات الزوجية والأطفال (د.ع):
            </label>
            <input type="number" class="form-control" value="${state.centralFamilyAllowances || 0}" oninput="window.updateIncentiveField('centralFamilyAllowances', this.value)" style="width: 100%; font-size: 0.9rem; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem; color: var(--md-sys-color-on-surface);">
              3. مخصصات الشهادة لكادر القسم (د.ع):
            </label>
            <input type="number" class="form-control" value="${state.centralDegreeAllowances || 0}" oninput="window.updateIncentiveField('centralDegreeAllowances', this.value)" style="width: 100%; font-size: 0.9rem; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid var(--md-sys-color-outline-variant); background: var(--md-sys-color-surface);">
          </div>
        </div>
        `}

        <!-- Total Points Section with Auto-Calculation Feature -->
        <div style="background: rgba(25, 135, 84, 0.04); border: 1.5px solid rgba(25, 135, 84, 0.25); border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem;">
            <label style="font-size: 0.84rem; font-weight: 800; color: #198754; margin: 0;">
              👥 مجموع نقاط جميع منتسبي القسم (المقام):
            </label>
            <button type="button" onclick="window.autoCalculateDepartmentTotalPoints()" class="btn btn-sm" style="font-size: 0.76rem; padding: 0.25rem 0.75rem; background: #198754; color: #fff; border: none; border-radius: 6px; font-weight: 800; display: flex; align-items: center; gap: 0.35rem; box-shadow: 0 2px 6px rgba(25, 135, 84, 0.25);">
              <span>⚡</span> حساب تلقائي من كادر القسم (${employees.length} موظف)
            </button>
          </div>

          <input type="number" class="form-control" value="${state.centralTotalStaffPoints || 0}" oninput="window.updateIncentiveField('centralTotalStaffPoints', this.value)" style="width: 100%; font-size: 1.1rem; font-weight: 900; padding: 0.55rem 0.85rem; border-radius: 8px; border: 1.5px solid #198754; background: var(--md-sys-color-surface); font-family: monospace;">
          <div style="font-size: 0.72rem; color: var(--md-sys-color-outline); margin-top: 0.35rem;">
            يمكنك كتابة مجموع النقاط يدوياً أو الضغط على زر الحساب التلقائي ليقوم النظام باحتساب نقاط كل موظف مسجل بالقسم وجمعها فوراً.
          </div>
        </div>

        <!-- Grand Result Calculation Box -->
        <div style="padding: 1.25rem; border-radius: 12px; background: linear-gradient(135deg, rgba(13, 110, 253, 0.08), rgba(25, 135, 84, 0.06)); border: 2px solid #0d6efd; text-align: center;">
          <div style="font-size: 0.82rem; font-weight: 800; color: var(--md-sys-color-outline);">
            إجمالي كتلة حوافز القسم = ${Math.round(totalPool).toLocaleString('en-US')} د.ع | إجمالي النقاط = ${pts.toLocaleString('en-US')} نقطة
          </div>
          <div style="font-size: 2.1rem; font-weight: 900; color: #0d6efd; margin: 0.4rem 0; letter-spacing: -0.5px;">
            سعر النقطة المحسوب = ${Math.round(computedPrice).toLocaleString('en-US')} <span style="font-size: 1.1rem;">د.ع / نقطة</span>
          </div>
          <p style="font-size: 0.8rem; font-weight: 700; color: #198754; margin: 0 0 1rem 0; font-family: monospace;">
            (${Math.round(totalPool).toLocaleString()} د.ع ÷ ${pts.toLocaleString()} نقطة = ${computedPrice.toFixed(2)} د.ع)
          </p>
          <button onclick="window.calculateAndApplyCentralPointPrice()" class="btn btn-primary" style="font-weight: 900; font-size: 0.95rem; padding: 0.65rem 1.75rem; border-radius: 8px; box-shadow: 0 4px 14px rgba(13, 110, 253, 0.3);">
            ✅ اعتماد وتطبيق سعر النقطة (${Math.round(computedPrice).toLocaleString('en-US')} د.ع) على الحاسبة فوراً
          </button>
        </div>

      </div>
    </div>
    `;
  }

})();
