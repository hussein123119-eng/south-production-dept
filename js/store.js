/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Multi-Tenant Store & Enterprise Database Engine
   ========================================================================== */

const INITIAL_DB = {
  // إعدادات النظام و Feature Flags (القسم 63)
  systemSettings: {
    appName: 'إدارة قسم الإنتاج الجنوبي',
    organizationName: 'وزارة النفط - شركة نفط البصرة - هيأة تشغيل الرميلة - قسم الإنتاج الجنوبي',
    organizationHierarchy: [
      'وزارة النفط',
      'شركة نفط البصرة',
      'هيأة تشغيل الرميلة',
      'قسم الإنتاج الجنوبي'
    ],
    timezone: 'Asia/Baghdad',
    maintenanceMode: false,
    shiftSettings: {
      startTime: '07:30',
      shiftDurationHours: 24,
      referenceDate: '2026-01-01T07:30:00Z',
      referenceShift: 'A',
      shifts: ['A', 'B', 'C', 'D'],
      autoRotate: true,
      lastModifiedAt: '2026-01-01T08:00:00Z',
      lastModifiedBy: 'مدير القسم'
    },
    featureFlags: {
      technicalStatus: true,
      vehicleTracking: true,
      careerCalculator: true,
      recycleBin: true,
      documentDMS: true,
      administrativeRequests: true,
      whatsappSharing: true,
      pwaInstallation: true
    }
  },

  // الأقسام (Departments) - Multi-Tenant Root
  departments: [
    {
      id: 'dept-south-prod',
      name: 'إدارة قسم الإنتاج الجنوبي',
      code: 'SPD-01',
      logoText: 'ق ج',
      description: 'المنصة الرسمية لإدارة الموارد البشرية والوثائق والتبليغات والمحطات التابعة لقسم الإنتاج الجنوبي.',
      managerId: null,
      status: 'ACTIVE',
      createdAt: '2026-01-01T08:00:00Z'
    },
    {
      id: 'dept-north-prod',
      name: 'إدارة قسم الإنتاج الشمالي',
      code: 'NPD-02',
      logoText: 'ق ش',
      description: 'قسم الإنتاج الشمالي (مستقل منطقياً متاح لإدارة المؤسس).',
      managerId: null,
      status: 'ACTIVE',
      createdAt: '2026-02-01T08:00:00Z'
    }
  ],

  // سجل الموظف الموحد والأصلي (Employee Master Record - Single Source of Truth)
  employeeMasterRecords: [
    { 
      employeeId: 'EMP-0000', 
      fullName: 'المؤسس العام للمنظومة', 
      departmentId: 'dept-south-prod', 
      sectionId: null, unitId: null, stationId: null,
      phone: '07700000000', emailPersonal: 'hussein123119@gmail.com', emailOfficial: 'southprod.rumaila@gmail.com',
      jobTitle: 'المؤسس والمدير العام للنظام',
      motherName: '-', passportNumber: '-', unifiedCardNumber: '-',
      dynamicValues: {}, transferHistory: []
    },
    {
      employeeId: 'EMP-2024-001',
      fullName: 'م. أحمد عبد الحسين البصري',
      departmentId: 'dept-south-prod',
      sectionId: null,
      unitId: null,
      stationId: null,
      phone: '07701234567',
      emailPersonal: 'ahmed.mgr@rumaila.iq',
      emailOfficial: 'ahmed.mgr@rumaila.iq',
      jobTitle: 'مدير قسم الإنتاج الجنوبي',
      motherName: 'فاطمة كاظم',
      passportNumber: 'A12345678',
      unifiedCardNumber: '198012345678',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-002',
      fullName: 'م. حيدر جاسم الكناني',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-1',
      unitId: null,
      stationId: null,
      phone: '07702345678',
      emailPersonal: 'sec1@rumaila.iq',
      emailOfficial: 'sec1@rumaila.iq',
      jobTitle: 'مسؤول الشعبة الأولى',
      motherName: 'زينب حسن',
      passportNumber: 'A23456789',
      unifiedCardNumber: '198523456789',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-003',
      fullName: 'م. علي الركابي التميمي',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-2',
      unitId: null,
      stationId: null,
      phone: '07703456789',
      emailPersonal: 'sec2@rumaila.iq',
      emailOfficial: 'sec2@rumaila.iq',
      jobTitle: 'مسؤول الشعبة الثانية',
      motherName: 'مريم علي',
      passportNumber: 'A34567890',
      unifiedCardNumber: '198834567890',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-004',
      fullName: 'عمار جبار الساعدي',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-1',
      unitId: null,
      stationId: 'st-101',
      workShift: 'مناوب',
      assignedShift: 'B',
      shift: 'B',
      phone: '07704567890',
      emailPersonal: 'ammar.emp@rumaila.iq',
      emailOfficial: 'ammar.emp@rumaila.iq',
      jobTitle: 'مشغل محطة إنتاجية أقدم (نوبة B)',
      motherName: 'سعاد ناصر',
      passportNumber: 'A45678901',
      unifiedCardNumber: '199045678901',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-005',
      fullName: 'مهند فاضل العلي',
      departmentId: 'dept-south-prod',
      sectionId: null,
      unitId: 'unit-1',
      stationId: null,
      phone: '07705678901',
      emailPersonal: 'mohanad.tech@rumaila.iq',
      emailOfficial: 'mohanad.tech@rumaila.iq',
      jobTitle: 'مسؤول الوحدة الفنية',
      motherName: 'خديجة مهدي',
      passportNumber: 'A56789012',
      unifiedCardNumber: '198756789012',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-006',
      fullName: 'مصطفى كاظم الموسوي',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-1',
      unitId: null,
      stationId: 'st-102',
      phone: '07706789012',
      emailPersonal: 'mustafa.ops@rumaila.iq',
      emailOfficial: 'mustafa.ops@rumaila.iq',
      jobTitle: 'مشغل محطة الرميلة الجنوبية',
      motherName: 'رجاء حسين',
      passportNumber: 'A67890123',
      unifiedCardNumber: '199267890123',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-007',
      fullName: 'كرار جواد التميمي',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-3',
      unitId: null,
      stationId: 'st-301',
      phone: '07707890123',
      emailPersonal: 'karrar.lab@rumaila.iq',
      emailOfficial: 'karrar.lab@rumaila.iq',
      jobTitle: 'فني مختبر كيميائي أقدم',
      motherName: 'هدى عبد الرضا',
      passportNumber: 'A78901234',
      unifiedCardNumber: '199378901234',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-008',
      fullName: 'حسين علي الخفاجي',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-4',
      unitId: null,
      stationId: 'st-401',
      phone: '07708901234',
      emailPersonal: 'hussein.mtr@rumaila.iq',
      emailOfficial: 'hussein.mtr@rumaila.iq',
      jobTitle: 'مهندس عدادات ومعايرة',
      motherName: 'سليمة راضي',
      passportNumber: 'A89012345',
      unifiedCardNumber: '199189012345',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-009',
      fullName: 'سجاد باقر الحميد',
      departmentId: 'dept-south-prod',
      sectionId: null,
      unitId: 'unit-2',
      stationId: null,
      phone: '07709012345',
      emailPersonal: 'sajjad.train@rumaila.iq',
      emailOfficial: 'sajjad.train@rumaila.iq',
      jobTitle: 'مسؤول وحدة التدريب والتطوير',
      motherName: 'بتول حميد',
      passportNumber: 'A90123456',
      unifiedCardNumber: '198990123456',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-010',
      fullName: 'أحمد رياض العبادي',
      departmentId: 'dept-south-prod',
      sectionId: null,
      unitId: 'unit-3',
      stationId: null,
      phone: '07700123456',
      emailPersonal: 'ahmed.hse@rumaila.iq',
      emailOfficial: 'ahmed.hse@rumaila.iq',
      jobTitle: 'مسؤول وحدة الضمان الصحي والسلامة',
      motherName: 'أميرة جاسم',
      passportNumber: 'A01234567',
      unifiedCardNumber: '198601234567',
      dynamicValues: {},
      transferHistory: []
    },
    {
      employeeId: 'EMP-2024-011',
      fullName: 'م. ضرغام صادق الخفاجي',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-2',
      unitId: null,
      stationId: 'st-202',
      workShift: 'مناوب',
      assignedShift: 'A',
      shift: 'A',
      phone: '07709988776',
      emailPersonal: 'dhurgham.ops@rumaila.iq',
      emailOfficial: 'dhurgham.ops@rumaila.iq',
      jobTitle: 'مشغل محطة إنتاجية (نوبة A)',
      motherName: 'زينب عبد الكريم',
      passportNumber: 'A99887766',
      unifiedCardNumber: '199499887766',
      dynamicValues: {},
      transferHistory: []
    }
  ],

  // نظام الحقول والمعلومات الديناميكية (Dynamic Employee Fields System)
  dynamicEmployeeFields: [
    { id: 'field-1', name: 'رقم جواز السلامة (HSE Passport)', key: 'safetyPassportNo', type: 'text', category: 'official_documents', isRequired: false, scope: 'GLOBAL', isActive: true, order: 1 },
    { id: 'field-2', name: 'تاريخ انتهاء الفحص الطبي', key: 'medicalCheckExpiry', type: 'date', category: 'official_documents', isRequired: false, scope: 'GLOBAL', isActive: true, order: 2 },
    { id: 'field-3', name: 'رقم كتاب التكليف / التنسيب', key: 'assignmentLetterNo', type: 'text', category: 'administrative', isRequired: false, scope: 'SECTION', isActive: true, order: 3 },
    { id: 'field-4', name: 'الدورات التدريبية المعتمدة', key: 'certifiedTrainingCourses', type: 'textarea', category: 'career', isRequired: false, scope: 'GLOBAL', isActive: true, order: 4 },
    { id: 'field-5', name: 'ملاحظات التقييم الميداني للشعبة', key: 'sectionEvaluationNotes', type: 'textarea', category: 'section_specific', isRequired: false, scope: 'SECTION', isActive: true, order: 5 }
  ],

  // الشعب (Sections)
  sections: [
    {
      id: 'sec-1',
      departmentId: 'dept-south-prod',
      name: 'الشعبة الأولى',
      managerId: null,
      description: 'تضم محطات الإنتاج الرئيسية (المركزية، الجنوبية، الرطكة) ومعالجة الخام والغاز المصاحب.',
      status: 'ACTIVE',
      totalCapacity: '360,000 برميل/يوم',
      location: 'موقع الرميلة الشمالي / الموقع المركزي'
    },
    {
      id: 'sec-2',
      departmentId: 'dept-south-prod',
      name: 'الشعبة الثانية',
      managerId: null,
      description: 'تضم محطات ومشرفي الشامية والقرينات وضخ النفط الخام المستمر.',
      status: 'ACTIVE',
      totalCapacity: '575,000 برميل/يوم',
      location: 'موقع غرب القرنة / الشامية'
    },
    {
      id: 'sec-3',
      departmentId: 'dept-south-prod',
      name: 'شعبة المختبرات',
      managerId: null,
      description: 'إدارة الفحوصات الكيميائية وجودة النفط والغاز ونسب الماء والأملاح والمعادن.',
      status: 'ACTIVE',
      totalCapacity: '120 فحص يومي',
      location: 'المجمع المختبري المركزي'
    },
    {
      id: 'sec-4',
      departmentId: 'dept-south-prod',
      name: 'شعبة العدادات',
      managerId: null,
      description: 'معايرة وفحص عدادات القياس الحجمي والكتلي ومنظومات العزل التلقائي.',
      status: 'ACTIVE',
      totalCapacity: 'معايرة 24 منظومة قياس',
      location: 'مركز المعايرة والتصدير'
    }
  ],

  // المحطات (Stations -> Linked to Sections)
  stations: [
    // الشعبة الأولى
    { id: 'st-101', sectionId: 'sec-1', departmentId: 'dept-south-prod', name: 'المحطة المركزية', code: 'ST-CTR', managerId: 'user-emp1', capacity: '150,000 برميل/يوم', status: 'OPERATIONAL', lastMaintenance: '2026-01-15' },
    { id: 'st-102', sectionId: 'sec-1', departmentId: 'dept-south-prod', name: 'المحطة الجنوبية', code: 'ST-STH', managerId: null, capacity: '120,000 برميل/يوم', status: 'OPERATIONAL', lastMaintenance: '2026-02-01' },
    { id: 'st-103', sectionId: 'sec-1', departmentId: 'dept-south-prod', name: 'محطة الرطكة', code: 'ST-RTK', managerId: null, capacity: '90,000 برميل/يوم', status: 'OPERATIONAL', lastMaintenance: '2026-01-20' },

    // الشعبة الثانية
    { id: 'st-201', sectionId: 'sec-2', departmentId: 'dept-south-prod', name: 'محطة الشامية', code: 'ST-SHM', managerId: null, capacity: '110,000 برميل/يوم', status: 'OPERATIONAL', lastMaintenance: '2026-01-28' },
    { id: 'st-202', sectionId: 'sec-2', departmentId: 'dept-south-prod', name: 'محطة القرينات', code: 'ST-QRN', managerId: null, capacity: '85,000 برميل/يوم', status: 'OPERATIONAL', lastMaintenance: '2026-02-04' },
    { id: 'st-203', sectionId: 'sec-2', departmentId: 'dept-south-prod', name: 'محطة مشرف شامية', code: 'ST-MSH-SHM', managerId: null, capacity: '200,000 برميل/يوم', status: 'OPERATIONAL', lastMaintenance: '2026-02-10' },
    { id: 'st-204', sectionId: 'sec-2', departmentId: 'dept-south-prod', name: 'محطة مشرف قرينات', code: 'ST-MSH-QRN', managerId: null, capacity: '180,000 برميل/يوم', status: 'OPERATIONAL', lastMaintenance: '2026-01-18' },

    // شعبة المختبرات (المحطات الـ 7 المعتمدة)
    { id: 'st-301', sectionId: 'sec-3', departmentId: 'dept-south-prod', name: 'المحطة المركزية', code: 'LAB-CTR', managerId: null, capacity: 'فحوصات كيميائية ومياه وغاز', status: 'OPERATIONAL', lastMaintenance: '2026-02-08' },
    { id: 'st-302', sectionId: 'sec-3', departmentId: 'dept-south-prod', name: 'محطة الرطكة', code: 'LAB-RTK', managerId: null, capacity: 'فحوصات كيميائية ومياه وغاز', status: 'OPERATIONAL', lastMaintenance: '2026-02-11' },
    { id: 'st-303', sectionId: 'sec-3', departmentId: 'dept-south-prod', name: 'المحطة الجنوبية', code: 'LAB-STH', managerId: null, capacity: 'فحوصات كيميائية ومياه وغاز', status: 'OPERATIONAL', lastMaintenance: '2026-02-05' },
    { id: 'st-304', sectionId: 'sec-3', departmentId: 'dept-south-prod', name: 'محطة الشامية', code: 'LAB-SHM', managerId: null, capacity: 'فحوصات كيميائية ومياه وغاز', status: 'OPERATIONAL', lastMaintenance: '2026-02-09' },
    { id: 'st-305', sectionId: 'sec-3', departmentId: 'dept-south-prod', name: 'محطة القرينات', code: 'LAB-QRN', managerId: null, capacity: 'فحوصات كيميائية ومياه وغاز', status: 'OPERATIONAL', lastMaintenance: '2026-02-04' },
    { id: 'st-306', sectionId: 'sec-3', departmentId: 'dept-south-prod', name: 'محطة مشرف شامية', code: 'LAB-MSH-SHM', managerId: null, capacity: 'فحوصات كيميائية ومياه وغاز', status: 'OPERATIONAL', lastMaintenance: '2026-02-10' },
    { id: 'st-307', sectionId: 'sec-3', departmentId: 'dept-south-prod', name: 'محطة مشرف قرينات', code: 'LAB-MSH-QRN', managerId: null, capacity: 'فحوصات كيميائية ومياه وغاز', status: 'OPERATIONAL', lastMaintenance: '2026-01-28' },

    // شعبة العدادات (المحطات الـ 7 المعتمدة)
    { id: 'st-401', sectionId: 'sec-4', departmentId: 'dept-south-prod', name: 'المحطة المركزية', code: 'MTR-CTR', managerId: null, capacity: 'معايرة وقياس العدادات', status: 'OPERATIONAL', lastMaintenance: '2026-01-30' },
    { id: 'st-402', sectionId: 'sec-4', departmentId: 'dept-south-prod', name: 'محطة الرطكة', code: 'MTR-RTK', managerId: null, capacity: 'معايرة وقياس العدادات', status: 'OPERATIONAL', lastMaintenance: '2026-02-02' },
    { id: 'st-403', sectionId: 'sec-4', departmentId: 'dept-south-prod', name: 'المحطة الجنوبية', code: 'MTR-STH', managerId: null, capacity: 'معايرة وقياس العدادات', status: 'OPERATIONAL', lastMaintenance: '2026-02-06' },
    { id: 'st-404', sectionId: 'sec-4', departmentId: 'dept-south-prod', name: 'محطة الشامية', code: 'MTR-SHM', managerId: null, capacity: 'معايرة وقياس العدادات', status: 'OPERATIONAL', lastMaintenance: '2026-02-03' },
    { id: 'st-405', sectionId: 'sec-4', departmentId: 'dept-south-prod', name: 'محطة القرينات', code: 'MTR-QRN', managerId: null, capacity: 'معايرة وقياس العدادات', status: 'OPERATIONAL', lastMaintenance: '2026-02-07' },
    { id: 'st-406', sectionId: 'sec-4', departmentId: 'dept-south-prod', name: 'محطة مشرف شامية', code: 'MTR-MSH-SHM', managerId: null, capacity: 'معايرة وقياس العدادات', status: 'OPERATIONAL', lastMaintenance: '2026-02-12' },
    { id: 'st-407', sectionId: 'sec-4', departmentId: 'dept-south-prod', name: 'محطة مشرف قرينات', code: 'MTR-MSH-QRN', managerId: null, capacity: 'معايرة وقياس العدادات', status: 'OPERATIONAL', lastMaintenance: '2026-02-01' }
  ],

  // الوحدات (Units -> Linked DIRECTLY to Department)
  units: [
    {
      id: 'unit-1',
      departmentId: 'dept-south-prod',
      name: 'الفنية',
      managerId: null,
      description: 'الدعم الفني، الصيانة الوقائية والطارئة، والدراسات الهندسية المباشرة بإدارة القسم.',
      status: 'ACTIVE',
      projectsCount: 5,
      activeStaff: 12
    },
    {
      id: 'unit-2',
      departmentId: 'dept-south-prod',
      name: 'التدريب والتطوير',
      managerId: null,
      description: 'إعداد الورش التدريبية، برامج التأهيل الفني، ومتابعة كفاءة التشغيل والسلامة للكوادر.',
      status: 'ACTIVE',
      projectsCount: 3,
      activeStaff: 6
    },
    {
      id: 'unit-3',
      departmentId: 'dept-south-prod',
      name: 'الضمان الصحي',
      managerId: null,
      description: 'متابعة المعاملات الصحية، تصاريح السلامة المهنية، والامتثال للوائح حماية البيئة.',
      status: 'ACTIVE',
      projectsCount: 4,
      activeStaff: 8
    }
  ],

  // الموقف الفني التشغيلي (القسم 12)
  technicalStatusReports: [
    {
      id: 'ts-101',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-1',
      stationId: 'st-101',
      stationName: 'المحطة المركزية',
      operationalStatus: 'OPERATIONAL', // OPERATIONAL, PARTIAL, STOPPED
      equipmentTopic: 'مضخات الطرد المركزي الرئيسية P-101A/B',
      description: 'تم إجراء صيانة وقائية وتبديل ميكانيكال سيل للمضخة A، والضغوط مستقرة عند 35 Bar.',
      ongoingWorks: 'مراقبة حرارة المحامل والاهتزازات على مدار الساعة',
      priority: 'NORMAL',
      handlingStatus: 'COMPLETED', // COMPLETED, IN_PROGRESS, PENDING
      notes: 'تمت مطابقة معايير السلامة المهنية بنجاح',
      submittedBy: 'user-emp1',
      submittedByName: 'عمار الساعدي',
      submittedAt: '2026-02-13T10:00:00Z'
    },
    {
      id: 'ts-102',
      departmentId: 'dept-south-prod',
      sectionId: 'sec-2',
      stationId: 'st-201',
      stationName: 'محطة الشامية',
      operationalStatus: 'PARTIAL',
      equipmentTopic: 'عازلة الغاز المصاحب المرحلة الثانية V-202',
      description: 'انخفاض جزئي في كفاءة صمام تفريغ السوائل LCV-202 وجاري استبدال محرك الصمام الهوائي.',
      ongoingWorks: 'تبديل الصمام بالتنسيق مع الكادر الميكانيكي للوحدة الفنية',
      priority: 'HIGH',
      handlingStatus: 'IN_PROGRESS',
      notes: 'متوقع انتهاء العمل اليوم الساعة 18:00',
      submittedBy: 'user-sec2-mgr',
      submittedByName: 'م. علي الركابي',
      submittedAt: '2026-02-13T11:30:00Z'
    }
  ],

  // سيارات القسم والشعب والمحطات (القسم 13)
  vehicles: [
    {
      id: 'veh-101',
      departmentId: 'dept-south-prod',
      vehicleType: 'تويوتا لاندكروزر',
      ownershipType: 'GOVERNMENT',
      sideNumber: '101',
      vehicleNumber: '44521 - بصرة / حكومي',
      affiliationType: 'DEPT_MGMT',
      sectionId: null,
      sectionName: 'إدارة القسم',
      stationId: null,
      stationName: null,
      driverName: 'فاضل حامد العلي',
      driverPhone: '07701122334',
      operationalState: 'OPERATIONAL',
      movementState: 'AVAILABLE',
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'veh-102',
      departmentId: 'dept-south-prod',
      vehicleType: 'نيسان باترول',
      ownershipType: 'RENTAL',
      sideNumber: null,
      vehicleNumber: '88319 - بصرة / فحص مؤقت',
      affiliationType: 'SECTION_MGMT',
      sectionId: 'sec-1',
      sectionName: 'الشعبة الأولى',
      stationId: null,
      stationName: null,
      driverName: 'جاسم هادي الكناني',
      driverPhone: '07702233445',
      operationalState: 'OPERATIONAL',
      movementState: 'AVAILABLE',
      createdAt: '2026-01-12T08:00:00Z'
    },
    {
      id: 'veh-103',
      departmentId: 'dept-south-prod',
      vehicleType: 'تويوتا هايلوكس',
      ownershipType: 'GOVERNMENT',
      sideNumber: '105',
      vehicleNumber: '12490 - بصرة / حكومي',
      affiliationType: 'STATION',
      sectionId: 'sec-1',
      sectionName: 'الشعبة الأولى',
      stationId: 'st-101',
      stationName: 'المحطة المركزية',
      shiftDrivers: {
        shiftA: { driverId: 'drv-a1', driverName: 'أحمد محمد الربيعي', phone: '07703334455' },
        shiftB: { driverId: 'drv-b1', driverName: 'علي حسن التميمي', phone: '07704445566' },
        shiftC: { driverId: 'drv-c1', driverName: 'محمود كريم الساعدي', phone: '07705556677' },
        shiftD: null
      },
      operationalState: 'OPERATIONAL',
      movementState: 'AVAILABLE',
      createdAt: '2026-01-15T08:00:00Z'
    },
    {
      id: 'veh-104',
      departmentId: 'dept-south-prod',
      vehicleType: 'ميتسوبيشي L200',
      ownershipType: 'GOVERNMENT',
      sideNumber: '108',
      vehicleNumber: '67890 - بصرة / حكومي',
      affiliationType: 'STATION',
      sectionId: 'sec-2',
      sectionName: 'الشعبة الثانية',
      stationId: 'st-104',
      stationName: 'محطة الشامية',
      shiftDrivers: {
        shiftA: { driverId: 'drv-a2', driverName: 'حيدر صادق الوائلي', phone: '07706667788' },
        shiftB: { driverId: 'drv-b2', driverName: 'عباس ناصر الخفاجي', phone: '07707778899' },
        shiftC: null,
        shiftD: null
      },
      operationalState: 'OPERATIONAL',
      movementState: 'AVAILABLE',
      createdAt: '2026-01-18T08:00:00Z'
    },
    {
      id: 'veh-105',
      departmentId: 'dept-south-prod',
      vehicleType: 'شاحنة مرسيدس صهريج',
      ownershipType: 'GOVERNMENT',
      sideNumber: '201',
      vehicleNumber: '33412 - بصرة / حكومي',
      affiliationType: 'DEPT_MGMT',
      sectionId: null,
      sectionName: 'إدارة القسم',
      stationId: null,
      stationName: null,
      driverName: 'عمر فاضل الجبوري',
      driverPhone: '07708889900',
      operationalState: 'IN_REPAIR',
      movementState: 'AVAILABLE',
      createdAt: '2026-01-20T08:00:00Z'
    },
    {
      id: 'veh-106',
      departmentId: 'dept-south-prod',
      vehicleType: 'حافلة تويوتا كوستر',
      ownershipType: 'RENTAL',
      sideNumber: null,
      vehicleNumber: '99201 - بصرة / أجور',
      affiliationType: 'SECTION_MGMT',
      sectionId: 'sec-3',
      sectionName: 'شعبة المختبرات',
      stationId: null,
      stationName: null,
      driverName: 'سلمان داود البياتي',
      driverPhone: '07709990011',
      operationalState: 'STOPPED',
      movementState: 'AVAILABLE',
      createdAt: '2026-01-22T08:00:00Z'
    }
  ],

  // حركة السيارات والمركبات مع الرقم الجانبي والألوان الثلاثة (القسم 13)
  vehicleMovements: [
    {
      id: 'vm-101',
      departmentId: 'dept-south-prod',
      sideNumber: '104', // الرقم الجانبي
      driverName: 'فاضل كريم',
      vehicleNumber: '65432 - بصرة / حكومي',
      sectionId: 'sec-1',
      sectionName: 'الشعبة الأولى',
      operationalState: 'OPERATIONAL', // OPERATIONAL (أخضر), IN_REPAIR (أصفر), STOPPED (أحمر)
      destination: 'محطة الرطكة (الشعبة الأولى)',
      exitTime: '2026-02-13T07:30:00',
      entryTime: '2026-02-13T14:00:00',
      purpose: 'نقل قطع غيار صمامات ومعدات فحص السلامة',
      status: 'COMPLETED'
    },
    {
      id: 'vm-102',
      departmentId: 'dept-south-prod',
      sideNumber: '108',
      driverName: 'جاسم محمد',
      vehicleNumber: '88712 - بصرة / حكومي',
      sectionId: 'sec-2',
      sectionName: 'الشعبة الثانية',
      operationalState: 'OPERATIONAL',
      destination: 'مشرف شامية (الشعبة الثانية)',
      exitTime: '2026-02-13T09:15:00',
      entryTime: null,
      purpose: 'نقل فريق مهندسي المعايرة والعدادات للكشف الموقعي',
      status: 'IN_TRANSIT'
    },
    {
      id: 'vm-103',
      departmentId: 'dept-south-prod',
      sideNumber: '112',
      driverName: 'سلمان داود',
      vehicleNumber: '55120 - بصرة / حكومي',
      sectionId: 'sec-1',
      sectionName: 'الشعبة الأولى',
      operationalState: 'IN_REPAIR',
      destination: 'ورشة الصيانة الميكانيكية المركزية',
      exitTime: '2026-02-13T08:00:00',
      entryTime: null,
      purpose: 'إجراء فحص دوري للمكابح وتبديل زيوت المحرك',
      status: 'IN_TRANSIT'
    },
    {
      id: 'vm-104',
      departmentId: 'dept-south-prod',
      sideNumber: '115',
      driverName: 'عادل مطر',
      vehicleNumber: '44910 - بصرة / حكومي',
      sectionId: 'sec-3',
      sectionName: 'شعبة المختبرات',
      operationalState: 'STOPPED',
      destination: 'مرآب القسم المركزي',
      exitTime: '2026-02-12T16:00:00',
      entryTime: '2026-02-12T16:00:00',
      purpose: 'متوقفة بانتظار تبديل الإطارات السنوية',
      status: 'COMPLETED'
    }
  ],

  // سلة المحذوفات - Soft Delete (القسم 18)
  recycleBin: [
    {
      id: 'rb-001',
      departmentId: 'dept-south-prod',
      itemType: 'DOCUMENT',
      itemTitle: 'مسودة تقرير الضغوط لشهر كانون الأول',
      deletedAt: '2026-02-10T14:20:00Z',
      deletedById: 'user-dept-mgr',
      deletedByName: 'م. أحمد عبد الحسين',
      data: { id: 'doc-old-1', title: 'مسودة تقرير الضغوط القديم', category: 'WORD' }
    }
  ],

  // المستخدمون والملفات الوظيفية السيادية (القاعدة الحية المعتمدة)
  users: [
    {
      id: 'user-founder',
      departmentId: 'dept-south-prod',
      email: 'founder@local.spd',
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
  ],

  // المستمسكات الرسمية للموظفين (تبدأ نظيفة وتُرفع من قبل المنتسبين)
  employeeDocuments: [],

  // الإعلانات المركزية والعامة
  announcements: [
    {
      id: 'anc-01',
      departmentId: 'dept-south-prod',
      targetType: 'ALL_DEPARTMENT',
      targetId: null,
      title: 'تحديث بيانات الكوادر والمستمسكات الرسمية للعام 2026',
      content: 'يرجى من كافة منتسبي قسم الإنتاج الجنوبي بالشعب والوحدات والمحطات التابعة الإسراع بتحديث مستمسكاتهم الرسمية وبياناتهم الشخصية عبر المنصة فوراً لتجنب إيقاف المعاملات الإدارية.',
      importance: 'URGENT',
      status: 'PUBLISHED',
      isPinned: true,
      attachmentName: 'تعليمات_تحديث_البيانات_2026.pdf',
      publishDate: '2026-02-01T08:00:00Z',
      expiryDate: '2026-03-30T23:59:59Z',
      createdBy: 'user-dept-mgr'
    },
    {
      id: 'anc-02',
      departmentId: 'dept-south-prod',
      targetType: 'SECTION',
      targetId: 'sec-1',
      title: 'خطة الصيانة الدورية الشاملة لمحطة المركزية',
      content: 'نلفت عناية كوادر الشعبة الأولى إلى البدء بجدول الصيانة الدورية الشامل للمحطة المركزية ابتداءً من الأسبوع القادم، يرجى التنسيق مع الوحدة الفنية.',
      importance: 'HIGH',
      status: 'PUBLISHED',
      isPinned: false,
      attachmentName: 'جدول_الصيانة_الشامل.pdf',
      publishDate: '2026-02-05T09:00:00Z',
      expiryDate: '2026-02-28T23:59:59Z',
      createdBy: 'user-sec1-mgr'
    }
  ],

  // التبليغات الإدارية والرسمية لقسم الإنتاج الجنوبي
  officialNotifications: [
    {
      id: 'notif-01',
      departmentId: 'dept-south-prod',
      targetScope: 'ALL_SECTIONS',
      targetSectionId: null,
      targetSectionName: 'كافة شعب ووحدات القسم',
      title: 'توجيهات السلامة المهنية وخطة التشغيل الشتوي',
      content: 'نؤكد على كافة مسؤولي الشعب والمحطات الإنتاجية الالتزام بإجراءات السلامة الصناعية (HSE) وتفقد صمامات الأمان وعازلات الغاز والضغوط التشغيلية يومياً مع إرسال الموقف الفني في الأوقات المحددة.',
      importance: 'URGENT',
      priority: 'URGENT',
      status: 'PUBLISHED',
      isPinned: true,
      publishDate: '2026-02-10T08:00:00Z',
      expiryDate: '2026-03-30T23:59:59Z',
      createdBy: 'user-dept-mgr',
      createdByName: 'م. أحمد عبد الحسين'
    },
    {
      id: 'notif-02',
      departmentId: 'dept-south-prod',
      targetScope: 'SECTION',
      targetSectionId: 'sec-1',
      targetSectionName: 'الشعبة الأولى',
      title: 'خطة المعايرة الموقعية لعدادات التدفق بمحطة الرطكة',
      content: 'يرجى من مسؤولي النوبات والمشغلين في محطة الرطكة التنسيق مع فريق المعايرة والوحدة الفنية لإجراء الفحص الدوري لعدادات الإنتاج يوم الأحد القادم.',
      importance: 'HIGH',
      priority: 'HIGH',
      status: 'PUBLISHED',
      isPinned: false,
      publishDate: '2026-02-12T09:00:00Z',
      expiryDate: '2026-02-28T23:59:59Z',
      createdBy: 'user-sec1-mgr',
      createdByName: 'م. حيدر جاسم'
    }
  ],

  // تبليغات مسؤولي الشعب الموجهة لمحطاتهم فقط
  sectionNotifications: [
    {
      id: 'sec-notif-01',
      sectionId: 'sec-1',
      departmentId: 'dept-south-prod',
      targetStationId: 'ALL',
      targetStationName: 'كافة محطات الشعبة',
      title: 'تأكيد الالتزام بإجراءات السلامة وفحص صمامات العزل',
      content: 'إلى كافة مسؤولي المحطات ومشغلي النوبات في الشعبة الأولى: يرجى إجراء فحص شامل لصمامات العزل والمشاعل قبل نهاية الأسبوع وتوثيق الموقف الفني في سجل المحطة.',
      priority: 'URGENT',
      status: 'PUBLISHED',
      publishDate: '2026-02-15T08:30:00Z',
      createdBy: 'user-sec1-mgr',
      createdByName: 'م. حيدر جاسم'
    },
    {
      id: 'sec-notif-02',
      sectionId: 'sec-1',
      departmentId: 'dept-south-prod',
      targetStationId: 'st-01',
      targetStationName: 'محطة الرميلة الشمالية',
      title: 'جدول معايرة عدادات التدفق وضغط العازلات',
      content: 'إلى مسؤول محطة الرميلة الشمالية: يرجى التنسيق مع الوحدة الفنية لإجراء المعايرة الموقعية لمقاييس الضغط وتدفق النفط الخام يوم الثلاثاء القادم.',
      priority: 'HIGH',
      status: 'PUBLISHED',
      publishDate: '2026-02-16T10:00:00Z',
      createdBy: 'user-sec1-mgr',
      createdByName: 'م. حيدر جاسم'
    },
    {
      id: 'sec-notif-03',
      sectionId: 'sec-2',
      departmentId: 'dept-south-prod',
      targetStationId: 'ALL',
      targetStationName: 'كافة محطات الشعبة',
      title: 'إلزامية ارتداء معدات الوقاية الشخصية PPE أثناء مناوبات الخفر',
      content: 'توجيه رسمي لكافة محطات الشعبة الثانية: يمنع منعاً باتاً التواجد في المنطقة التشغيلية بدون معدات الوقاية الكاملة وسيتم إجراء جولات تفتيشية مفاجئة.',
      priority: 'URGENT',
      status: 'PUBLISHED',
      publishDate: '2026-02-14T09:00:00Z',
      createdBy: 'user-dept-mgr',
      createdByName: 'م. أحمد عبد الحسين'
    }
  ],

  // نظام الطلبات الديناميكي
  requestTypes: [
    {
      id: 'reqType-01',
      title: 'تحديث بيانات البطاقة الموحدة',
      description: 'تقديم نسخة حديثة من البطاقة الوطنية الموحدة مع رقمها الرسمي',
      fields: [
        { name: 'unifiedCardNumber', label: 'رقم البطاقة الموحدة الجديد (12 رقماً)', type: 'text', required: true },
        { name: 'notes', label: 'سبب التحديث / ملاحظات إضافية', type: 'text', required: false }
      ]
    },
    {
      id: 'reqType-02',
      title: 'إضافة شهادة دراسية أو مؤهل فني',
      description: 'تقديم وثيقة التخرج أو الأمر الجامعي أو شهادة التخصص المهني',
      fields: [
        { name: 'degree', label: 'الشهادة الجديدة (دبلوم عالي / ماجستير / دكتوراه)', type: 'text', required: true },
        { name: 'specialization', label: 'التخصص العلمي الدقيق', type: 'text', required: true },
        { name: 'graduationYear', label: 'سنة التخرج', type: 'text', required: true }
      ]
    },
    {
      id: 'reqType-03',
      title: 'طلب إجازة رسمية (اعتيادية / مرضية / خفر)',
      description: 'تقديم طلب إجازة رسمي لاعتماده أصولياً من مسؤول الشعبة ومدير القسم',
      fields: [
        { name: 'leaveType', label: 'نوع الإجازة (اعتيادية، مرضية، تعويضية، إجازة خفر)', type: 'text', required: true },
        { name: 'startDate', label: 'تاريخ بدء الإجازة', type: 'date', required: true },
        { name: 'endDate', label: 'تاريخ انتهاء الإجازة', type: 'date', required: true },
        { name: 'reason', label: 'السبب والمبررات', type: 'text', required: true }
      ]
    },
    {
      id: 'reqType-04',
      title: 'تصريح عمل / نقل معدات ومواد بين المحطات',
      description: 'إصدار تصريح رسمي لنقل قطع غيار، صمامات، أو كيماويات فحص بين المواقع',
      fields: [
        { name: 'materialDescription', label: 'بيان المواد والمعدات المنقولة', type: 'text', required: true },
        { name: 'quantity', label: 'الكمية والعدد', type: 'text', required: true },
        { name: 'sourceLocation', label: 'موقع الانطلاق / المحطة المصدر', type: 'text', required: true },
        { name: 'destinationLocation', label: 'الموقع المستلم / المحطة الوجهة', type: 'text', required: true }
      ]
    },
    {
      id: 'reqType-05',
      title: 'طلب تخصيص سيارة لمهمة موقعية',
      description: 'حجز مركبة من مرآب القسم لإجراء جولة فنية أو نقل فريق عمل',
      fields: [
        { name: 'missionDestination', label: 'الوجهة المحددة', type: 'text', required: true },
        { name: 'missionDate', label: 'تاريخ ووقت المهمة', type: 'text', required: true },
        { name: 'passengerCount', label: 'عدد الركاب وأسماء الفريق', type: 'text', required: true }
      ]
    }
  ],

  requests: [],

  dataChangeLogs: [],

  // التبليغات والتوجيهات الإدارية
  officialNotifications: [
    {
      id: 'notif-01',
      departmentId: 'dept-south-prod',
      number: 'ت-2026/089',
      title: 'توجيه إداري بخصوص نظام الدوام الخفري في المحطات الإنتاجية',
      body: 'استناداً لموافقة السيد مدير القسم، يُلزم جميع المشغلين والكوادر الفنية بالالتزام التام بجدول الخفر المحدد وعدم المغادرة إلا بعد التسليم الأصولي لسجل التشغيل وقراءات الضغط والعدادات.',
      priority: 'HIGH',
      sender: 'إدارة القسم - الموارد البشرية',
      recipient: 'جميع شعب ومحطات قسم الإنتاج الجنوبي',
      status: 'PUBLISHED',
      createdAt: '2026-02-08T11:00:00Z',
      attachment: 'جدول_الدوام_الخفري_2026.pdf'
    },
    {
      id: 'notif-02',
      departmentId: 'dept-south-prod',
      number: 'ت-2026/092',
      title: 'ورشة السلامة والصحة المهنية لعام 2026 (معدات الوقاية PPE)',
      body: 'تقيم وحدة التدريب والتطوير ورشة عمل تخصصية في معدات الحماية الشخصية وإجراءات الإخلاء الآمن لجميع مسؤولي ومشغلي المحطات يوم الثلاثاء القادم.',
      priority: 'NORMAL',
      sender: 'وحدة التدريب والتطوير والسلامة',
      recipient: 'مسؤولو المحطات والشعب الفنية',
      status: 'PUBLISHED',
      createdAt: '2026-02-11T09:30:00Z',
      attachment: 'دعوة_حضور_ورشة_السلامة.pdf'
    }
  ],

  // المستندات والوثائق
  documents: [
    {
      id: 'doc-001',
      departmentId: 'dept-south-prod',
      title: 'تقرير الإنتاج اليومي والضغوط التشغيلية - المحطة المركزية',
      category: 'WORD',
      sectionId: 'sec-1',
      stationId: 'st-101',
      unitId: null,
      status: 'PUBLISHED',
      privacy: 'PUBLIC',
      version: '1.2',
      createdBy: 'user-emp1',
      createdByName: 'عمار الساعدي',
      createdAt: '2026-02-10T14:00:00Z',
      updatedAt: '2026-02-12T08:30:00Z',
      content: '<h1>تقرير الإنتاج اليومي - المحطة المركزية</h1><p>معدل معدات الضخ المستمرة: <strong>148,500 برميل/يوم</strong></p><p>الضغوط التشغيلية في عازلات المرحلة الأولى: <strong>32.5 Bar</strong></p><p>مستوى الغاز المصاحب المستلم لوحدة الكبس: <strong>45 MMSCFD</strong></p><p>الحالة الفنية العامة: ممتازة ولا توجد تسريبات أو اختناقات في الخطوط.</p>'
    },
    {
      id: 'doc-002',
      departmentId: 'dept-south-prod',
      title: 'جدول القراءات الكيميائية لفحوصات الخام والمياه المصاحبة',
      category: 'EXCEL',
      sectionId: 'sec-3',
      stationId: 'st-301',
      unitId: null,
      status: 'PUBLISHED',
      privacy: 'PUBLIC',
      version: '2.0',
      createdBy: 'user-dept-mgr',
      createdByName: 'م. أحمد عبد الحسين',
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-09T11:20:00Z',
      gridData: [
        ['المحطة الإنتاجية', 'نسبة الماء والترسبات (BS&W %)', 'الكثافة النوعية API', 'نسبة الكبريت S%', 'محتوى الأملاح PTB', 'الحالة المطابقة'],
        ['المحطة المركزية', '0.15%', '31.2', '1.8%', '12.4', 'مطابق للمواصفات'],
        ['المحطة الجنوبية', '0.18%', '30.8', '1.9%', '14.1', 'مطابق للمواصفات'],
        ['محطة الرطكة', '0.22%', '29.5', '2.1%', '18.0', 'ضمن الحدود المقبولة'],
        ['محطة الشامية', '0.12%', '32.1', '1.7%', '10.8', 'ممتاز ومطابق'],
        ['محطة القرينات', '0.20%', '30.5', '2.0%', '16.5', 'مطابق للمواصفات'],
        ['مشرف شامية', '0.14%', '31.8', '1.8%', '11.9', 'مطابق للمواصفات']
      ]
    },
    {
      id: 'doc-003',
      departmentId: 'dept-south-prod',
      title: 'كتاب رسمي: خطة الصيانة السنوية للتوربينات والمضخات الرئيسية',
      category: 'WORD',
      sectionId: null,
      stationId: null,
      unitId: 'unit-1',
      status: 'PUBLISHED',
      privacy: 'PUBLIC',
      version: '1.0',
      createdBy: 'user-unit1-lead',
      createdByName: 'مهند فاضل',
      createdAt: '2026-02-11T12:00:00Z',
      updatedAt: '2026-02-11T12:00:00Z',
      content: '<h2>إلى / السيد مدير قسم الإنتاج الجنوبي المحترم</h2><p><strong>الموضوع: خطة الصيانة الوقائية السنوية 2026</strong></p><p>نرفق طياً الجدول الفني لأعمال الفحص الدوري للصمامات ومضخات الطرد المركزي في الشعبتين الأولى والثانية مع الموازنة التقديرية لقطع الغيار المطلوبة.</p>'
    }
  ],

  // سجل النشاطات وسجلات الدخول
  auditLogs: [
    {
      id: 'log-001',
      departmentId: 'dept-south-prod',
      userId: 'user-dept-mgr',
      employeeId: 'EMP-2024-001',
      action: 'LOGIN',
      entity: 'AUTH',
      details: 'تسجيل دخول ناجح لمدير القسم',
      ipAddress: '192.168.1.10',
      result: 'SUCCESS',
      timestamp: '2026-02-13T08:00:00Z'
    },
    {
      id: 'log-002',
      departmentId: 'dept-south-prod',
      userId: 'user-dept-mgr',
      employeeId: 'EMP-2024-001',
      action: 'APPROVE_REQUEST',
      entity: 'REQUESTS',
      details: 'الموافقة على طلب تعديل البطاقة الموحدة REQ-1001 للموظف عمار الساعدي',
      ipAddress: '192.168.1.10',
      result: 'SUCCESS',
      timestamp: '2026-02-13T09:15:00Z'
    }
  ],

  // طلبات المقابلة الرسمية مع إدارة القسم
  interviewRequests: []
};

// Database Store Manager Class
class StoreManager {
  constructor() {
    this.key = 'SPD_ENTERPRISE_DB_V3';
    this.serverOnline = null;
    this.syncInProgress = false;
    this._cachedDb = null;
    this.initStore();
    this.initServerSync();
  }

  initStore() {
    if (typeof localStorage === 'undefined') return;
    // مسح كافة الإصدارات القديمة الملوثة ببيانات الاختبار
    try {
      localStorage.removeItem('SPD_ENTERPRISE_DB_V2');
      localStorage.removeItem('SPD_ENTERPRISE_DB_V1');
      localStorage.removeItem('SPD_APP_DB');
      localStorage.removeItem('spd_founder_pending_v84');
      localStorage.removeItem('spd_founder_dossiers_v84');
    } catch (e) {}

    const isLocalEnv = typeof window !== 'undefined' && window.location && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

    let db = null;
    let modified = false;
    if (!localStorage.getItem(this.key)) {
      db = JSON.parse(JSON.stringify(INITIAL_DB));
      modified = true;
    } else {
      try {
        db = JSON.parse(localStorage.getItem(this.key)) || {};
        for (const [k, v] of Object.entries(INITIAL_DB)) {
          if (db[k] === undefined || db[k] === null) {
            db[k] = JSON.parse(JSON.stringify(v));
            modified = true;
          }
        }
      } catch (e) {
        db = JSON.parse(JSON.stringify(INITIAL_DB));
        modified = true;
      }
    }

    if (isLocalEnv) {
      // البيئة المحلية (localhost): مزامنة وتحديث سجلات الكوادر والمناوبين الافتراضية
      if (!db.employeeMasterRecords || !Array.isArray(db.employeeMasterRecords)) {
        db.employeeMasterRecords = JSON.parse(JSON.stringify(INITIAL_DB.employeeMasterRecords || []));
        modified = true;
      } else {
        (INITIAL_DB.employeeMasterRecords || []).forEach(initialMaster => {
          const cleanId = (initialMaster.employeeId || '').trim().toUpperCase();
          const existing = db.employeeMasterRecords.find(r => r && (r.employeeId || '').trim().toUpperCase() === cleanId);
          if (!existing) {
            db.employeeMasterRecords.push(JSON.parse(JSON.stringify(initialMaster)));
            modified = true;
          } else {
            if (initialMaster.workShift && existing.workShift !== initialMaster.workShift) {
              existing.workShift = initialMaster.workShift;
              existing.assignedShift = initialMaster.assignedShift;
              existing.shift = initialMaster.shift;
              existing.stationId = initialMaster.stationId;
              existing.sectionId = initialMaster.sectionId;
              modified = true;
            }
          }
        });
      }

      // البيئة المحلية (localhost): تفعيل حسابات الاختبار للمطور والمؤسس للتجربة
      if (!db.users) db.users = [];
      const localTestUsers = [
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
          jobTitle: 'مشغل محطة إنتاجية أقدم (نوبة B)',
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
        },
        {
          id: 'user-emp-shift-a',
          departmentId: 'dept-south-prod',
          email: 'dhurgham.ops@rumaila.iq',
          password: '123456',
          employeeId: 'EMP-2024-011',
          fullName: 'م. ضرغام صادق الخفاجي',
          jobTitle: 'مشغل محطة إنتاجية (نوبة A)',
          phone: '07709988776',
          role: 'EMPLOYEE',
          status: 'APPROVED',
          profileCompleted: true,
          sectionId: 'sec-2',
          unitId: null,
          stationId: 'st-202',
          createdAt: '2026-02-01T08:00:00Z'
        },
        {
          id: 'user-founder',
          departmentId: 'dept-south-prod',
          email: 'founder@local.spd',
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
        }
      ];
      localTestUsers.forEach(tu => {
        const existing = db.users.find(u => u && (u.id === tu.id || (u.employeeId && u.employeeId.toUpperCase() === tu.employeeId.toUpperCase()) || (u.email && u.email.toLowerCase() === tu.email.toLowerCase())));
        if (!existing) {
          db.users.push(tu);
          modified = true;
        } else {
          // مزامنة كلمات مرور التطوير المحلي الافتراضية
          if (existing.password !== tu.password) {
            existing.password = tu.password;
            modified = true;
          }
          if (tu.role === 'SUPER_ADMIN') {
            existing.role = 'SUPER_ADMIN';
            existing.status = 'APPROVED';
            existing.profileCompleted = true;
          }
        }
      });
    } else {
      // البيئة الحية السحابية: تطهير تام وشامل من أي حسابات تجريبية أو وهمية
      if (db.users && Array.isArray(db.users)) {
        const originalLength = db.users.length;
        db.users = db.users.filter(u => {
          if (!u) return false;
          if (u.id === 'user-founder' || u.role === 'SUPER_ADMIN') return true;
          if (u.email && (u.email.toLowerCase() === 'hussein123119@gmail.com' || u.email.toLowerCase() === 'southprod.rumaila@gmail.com')) return true;
          if (u.email && u.email.endsWith('@rumaila.iq')) return false;
          if (['user-dept-mgr', 'user-sec1-mgr', 'user-sec2-mgr', 'user-unit1-lead', 'user-emp1', 'user-emp-pending'].includes(u.id)) return false;
          return true;
        });
        if (db.users.length !== originalLength) {
          modified = true;
        }
      }
    }

    if (db.departments) {
      db.departments.forEach(d => {
        if (d.managerId === 'user-dept-mgr') { d.managerId = null; modified = true; }
      });
    }

    if (db.sections) {
      db.sections.forEach(s => {
        if (s.managerId === 'user-sec1-mgr' || s.managerId === 'user-sec2-mgr') { s.managerId = null; modified = true; }
        if (s.name === 'شعبة المختبرات والسيطرة النوعية') { s.name = 'شعبة المختبرات'; modified = true; }
        if (s.name === 'شعبة العدادات والقياس والمعايرة') { s.name = 'شعبة العدادات'; modified = true; }
      });
    }
    if (db.units) {
      const seenIds = new Set();
      const seenNames = new Set();
      db.units = db.units.filter(u => {
        if (u.id === 'unit-1' || (u.name && u.name.includes('الفنية'))) u.name = 'الفنية';
        else if (u.id === 'unit-2' || (u.name && u.name.includes('التدريب'))) u.name = 'التدريب والتطوير';
        else if (u.id === 'unit-3' || (u.name && (u.name.includes('الضمان') || u.name.includes('الصحي') || u.name.includes('HSE')))) u.name = 'الضمان الصحي';
        
        const idKey = u.id || u.name;
        const nameKey = (u.name || '').trim();
        if (seenIds.has(idKey) || seenNames.has(nameKey)) {
          modified = true;
          return false;
        }
        seenIds.add(idKey);
        seenNames.add(nameKey);
        return true;
      });
    }

    if (db.stations) {
      const hasOldMockStations = db.stations.some(s => s.code === 'LAB-CHM' || s.code === 'LAB-GAS' || s.code === 'ST-MTR-CTR');
      const sec3Count = db.stations.filter(s => s.sectionId === 'sec-3').length;
      const sec4Count = db.stations.filter(s => s.sectionId === 'sec-4').length;
      if (hasOldMockStations || sec3Count < 7 || sec4Count < 7) {
        db.stations = JSON.parse(JSON.stringify(INITIAL_DB.stations));
        modified = true;
      }
    }
    if (modified) {
      localStorage.setItem(this.key, JSON.stringify(db));
    }
  }

  // --- Emergency Control & Main App Maintenance Lock ---
  getMaintenanceLock() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('SPD_EMERGENCY_LOCK_V1');
        if (stored) {
          return JSON.parse(stored);
        }
      }
    } catch (e) {}
    return { active: false, reason: '', updatedAt: null };
  }

  setMaintenanceLock(active, reason = 'المنظومة تحت الصيانة والتدقيق بأمر المؤسس والإدارة العليا') {
    const lockData = {
      active: !!active,
      reason: reason || 'المنظومة تحت الصيانة والتدقيق بأمر المؤسس والإدارة العليا',
      updatedAt: new Date().toISOString(),
      updatedBy: 'المؤسس العام'
    };
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('SPD_EMERGENCY_LOCK_V1', JSON.stringify(lockData));
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('spd:emergency-lock-changed', { detail: lockData }));
        }
      }
    } catch (e) {}

    if (typeof fetch !== 'undefined' && this.serverOnline !== false) {
      fetch('/api/emergency/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lockData)
      }).catch(() => {});
    }
    return lockData;
  }

  async initServerSync() {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
    try {
      const res = await fetch('/api/health').catch(() => null);
      if (res && res.ok) {
        this.serverOnline = true;
        this.syncWithServer();
        setInterval(() => {
          this.syncWithServer();
        }, 15000);
      } else {
        this.serverOnline = false;
      }
    } catch (e) {
      this.serverOnline = false;
    }
  }

  async syncWithServer() {
    if (this.syncInProgress || typeof fetch === 'undefined') return;
    this.syncInProgress = true;
    try {
      const res = await fetch('/api/db/sync');
      if (res.ok) {
        const data = await res.json();
        if (data && data.db && Object.keys(data.db).length > 0) {
          const localDb = this.getDb();
          const merged = { ...localDb, ...data.db };

          const isLocal = typeof window !== 'undefined' && window.location && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '' || window.location.protocol === 'file:');

          if (isLocal) {
            // Keep local test users and founder safely available in local environment
            if (!merged.users) merged.users = [];
            const localPresetIds = ['EMP-0000', 'EMP-2024-001', 'EMP-2024-002', 'EMP-2024-003', 'EMP-2024-004', 'EMP-2024-005'];
            if (Array.isArray(localDb.users)) {
              localDb.users.forEach(lu => {
                if (lu && (localPresetIds.includes(lu.employeeId) || lu.id === 'user-founder')) {
                  const existsIdx = merged.users.findIndex(mu => mu && (mu.id === lu.id || mu.employeeId === lu.employeeId));
                  if (existsIdx === -1) {
                    merged.users.push(lu);
                  } else if (!merged.users[existsIdx].password) {
                    merged.users[existsIdx].password = lu.password || '123456';
                  }
                }
              });
            }
          }

          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.key, JSON.stringify(merged));
          }
          this.serverOnline = true;
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('spd:store-synced', { detail: { online: true, timestamp: data.timestamp } }));
          }
        }
      }
    } catch (err) {
      this.serverOnline = false;
    } finally {
      this.syncInProgress = false;
    }
  }

  getDb() {
    if (this._cachedDb) {
      return this._cachedDb;
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(this.key);
        if (item) {
          this._cachedDb = JSON.parse(item) || INITIAL_DB;
          return this._cachedDb;
        }
      }
      this._cachedDb = JSON.parse(JSON.stringify(INITIAL_DB));
      return this._cachedDb;
    } catch (e) {
      console.error('Store Read Error, resetting to initial state', e);
      this._cachedDb = JSON.parse(JSON.stringify(INITIAL_DB));
      return this._cachedDb;
    }
  }

  saveDb(data) {
    this._cachedDb = data;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.key, JSON.stringify(data));
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
    // Asynchronously synchronize with real backend database
    if (typeof window !== 'undefined' && typeof fetch !== 'undefined' && this.serverOnline !== false) {
      fetch('/api/db/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db: data })
      }).then(r => {
        if (r.ok) {
          this.serverOnline = true;
        }
      }).catch(() => {
        this.serverOnline = false;
      });
    }
  }

  invalidateCache() {
    this._cachedDb = null;
  }

  resetStore() {
    this._cachedDb = JSON.parse(JSON.stringify(INITIAL_DB));
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.key, JSON.stringify(INITIAL_DB));
    }
  }

  exportBackupJSON() {
    return JSON.stringify(this.getDb(), null, 2);
  }

  importBackupJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.departments && parsed.users) {
        this.saveDb(parsed);
        return { success: true };
      }
      return { success: false, error: 'بنية ملف النسخة الاحتياطية غير مطابقة للمواصفات.' };
    } catch (e) {
      return { success: false, error: 'ملف غير صالح (Invalid JSON).' };
    }
  }

  // --- Feature Flags (Section 63) ---
  getFeatureFlags() {
    const db = this.getDb();
    return (db.systemSettings && db.systemSettings.featureFlags) || INITIAL_DB.systemSettings.featureFlags;
  }

  updateFeatureFlag(flagName, value) {
    const db = this.getDb();
    if (!db.systemSettings) db.systemSettings = { ...INITIAL_DB.systemSettings };
    if (!db.systemSettings.featureFlags) db.systemSettings.featureFlags = { ...INITIAL_DB.systemSettings.featureFlags };
    db.systemSettings.featureFlags[flagName] = value;
    this.saveDb(db);
    return db.systemSettings.featureFlags;
  }

  getShiftSettings() {
    const db = this.getDb();
    if (!db.systemSettings) db.systemSettings = { ...INITIAL_DB.systemSettings };
    if (!db.systemSettings.shiftSettings) {
      db.systemSettings.shiftSettings = {
        startTime: '07:30',
        shiftDurationHours: 24,
        referenceDate: '2026-01-01T07:30:00Z',
        referenceShift: 'A',
        shifts: ['A', 'B', 'C', 'D'],
        autoRotate: true,
        lastModifiedAt: '2026-01-01T08:00:00Z',
        lastModifiedBy: 'مدير القسم'
      };
    }
    return db.systemSettings.shiftSettings;
  }

  updateShiftSettings(newSettings, actorUser) {
    const db = this.getDb();
    if (!db.systemSettings) db.systemSettings = { ...INITIAL_DB.systemSettings };

    // Check permission
    if (actorUser && window.rbac && typeof window.rbac.hasPermission === 'function') {
      const allowed = window.rbac.hasPermission(actorUser, 'MANAGE_SHIFTS') ||
                      actorUser.role === 'SUPER_ADMIN' ||
                      actorUser.role === 'DEPT_MANAGER';
      if (!allowed) {
        return { success: false, error: 'ليس لديك صلاحية تعديل مواعيد وإعدادات النوبات.' };
      }
    }

    const current = this.getShiftSettings();
    const updated = {
      ...current,
      ...newSettings,
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: actorUser ? actorUser.fullName : 'مدير القسم'
    };

    db.systemSettings.shiftSettings = updated;
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId || 'dept-south-prod',
        actorUser.id,
        actorUser.employeeId,
        'UPDATE_SHIFT_SETTINGS',
        'SYSTEM_SETTINGS',
        `تم تعديل مواعيد النوبة التشغيلية (بدء: ${updated.startTime} - المدة: ${updated.shiftDurationHours} ساعة).`
      );
    }

    return { success: true, settings: updated };
  }

  // --- Shift Calculation Engine (Section 31) ---
  getCurrentShiftInfo(customDate = new Date()) {
    const settings = this.getShiftSettings();
    const shifts = Array.isArray(settings.shifts) && settings.shifts.length ? settings.shifts : ['A', 'B', 'C', 'D'];
    const durationHours = Number(settings.shiftDurationHours) || 24;
    const msPerShift = durationHours * 60 * 60 * 1000;

    const refDate = settings.referenceDate ? new Date(settings.referenceDate) : new Date('2026-01-01T07:30:00Z');
    const now = customDate instanceof Date ? customDate : new Date(customDate);
    
    const diffMs = now.getTime() - refDate.getTime();
    const shiftCount = shifts.length;
    
    let shiftIdx = Math.floor(diffMs / msPerShift) % shiftCount;
    if (shiftIdx < 0) shiftIdx += shiftCount;

    const refShiftIdx = shifts.indexOf(settings.referenceShift || 'A');
    if (refShiftIdx !== -1) {
      shiftIdx = (shiftIdx + refShiftIdx) % shiftCount;
    }

    const currentShift = shifts[shiftIdx];
    const startTime = settings.startTime || '07:30';

    let periodDesc = `من ${startTime} (دورة ${durationHours} ساعة)`;
    if (durationHours === 24) {
      periodDesc = `من ${startTime} ص حتى ${startTime} ص اليوم التالي`;
    } else if (durationHours === 12) {
      periodDesc = `دورة 12 ساعة (تبدأ ${startTime})`;
    } else if (durationHours === 8) {
      periodDesc = `دورة 8 ساعات (تبدأ ${startTime})`;
    }

    return {
      currentShift,
      shiftName: `النوبة (${currentShift})`,
      startTime: startTime,
      durationHours: durationHours,
      period: periodDesc,
      status: 'نوبة تشغيلية جارية',
      lastModifiedBy: settings.lastModifiedBy || 'مدير القسم'
    };
  }

  // --- Promotion & Career Title Calculator (BOC Law No. 22 of 2008) ---
  getBocSalaryScale() {
    return {
      'SPECIAL': {
        key: 'SPECIAL',
        name: 'الدرجة الخاصة',
        arabicName: 'خاصة',
        level: 0,
        annualIncrement: 83000,
        promotionYears: null,
        stages: [1500000, 1583000, 1666000, 1749000, 1832000, 1915000, 1998000, 2081000, 2164000, 2247000, 2330000]
      },
      '1': {
        key: '1',
        name: 'الدرجة الأولى',
        arabicName: 'الأولى',
        level: 1,
        annualIncrement: 20000,
        promotionYears: null, // سقف الترفيع الاعتيادي
        stages: [910000, 930000, 950000, 970000, 990000, 1010000, 1030000, 1050000, 1070000, 1090000, 1110000]
      },
      '2': {
        key: '2',
        name: 'الدرجة الثانية',
        arabicName: 'الثانية',
        level: 2,
        annualIncrement: 17000,
        promotionYears: 5,
        stages: [723000, 740000, 757000, 774000, 791000, 808000, 825000, 842000, 859000, 876000, 893000]
      },
      '3': {
        key: '3',
        name: 'الدرجة الثالثة',
        arabicName: 'الثالثة',
        level: 3,
        annualIncrement: 10000,
        promotionYears: 5,
        stages: [600000, 610000, 620000, 630000, 640000, 650000, 660000, 670000, 680000, 690000, 700000]
      },
      '4': {
        key: '4',
        name: 'الدرجة الرابعة',
        arabicName: 'الرابعة',
        level: 4,
        annualIncrement: 8000,
        promotionYears: 5,
        stages: [509000, 517000, 525000, 533000, 541000, 549000, 557000, 565000, 573000, 581000, 589000]
      },
      '5': {
        key: '5',
        name: 'الدرجة الخامسة',
        arabicName: 'الخامسة',
        level: 5,
        annualIncrement: 6000,
        promotionYears: 5,
        stages: [429000, 435000, 441000, 447000, 453000, 459000, 465000, 471000, 477000, 483000, 489000]
      },
      '6': {
        key: '6',
        name: 'الدرجة السادسة',
        arabicName: 'السادسة',
        level: 6,
        annualIncrement: 6000,
        promotionYears: 4,
        stages: [362000, 368000, 374000, 380000, 386000, 392000, 398000, 404000, 410000, 416000, 422000]
      },
      '7': {
        key: '7',
        name: 'الدرجة السابعة',
        arabicName: 'السابعة',
        level: 7,
        annualIncrement: 6000,
        promotionYears: 4,
        stages: [296000, 302000, 308000, 314000, 320000, 326000, 332000, 338000, 344000, 350000, 356000]
      },
      '8': {
        key: '8',
        name: 'الدرجة الثامنة',
        arabicName: 'الثامنة',
        level: 8,
        annualIncrement: 3000,
        promotionYears: 4,
        stages: [260000, 263000, 266000, 269000, 272000, 275000, 278000, 281000, 284000, 287000, 290000]
      },
      '9': {
        key: '9',
        name: 'الدرجة التاسعة',
        arabicName: 'التاسعة',
        level: 9,
        annualIncrement: 3000,
        promotionYears: 4,
        stages: [210000, 213000, 216000, 219000, 222000, 225000, 228000, 231000, 234000, 237000, 240000]
      },
      '10': {
        key: '10',
        name: 'الدرجة العاشرة',
        arabicName: 'العاشرة',
        level: 10,
        annualIncrement: 3000,
        promotionYears: 4,
        stages: [170000, 173000, 176000, 179000, 182000, 185000, 188000, 191000, 194000, 197000, 200000]
      }
    };
  }

  getBocPromotionCourses() {
    return [
      {
        fromGrade: '2',
        toGrade: '1',
        title: 'من الدرجة الثانية إلى الدرجة الأولى',
        eligibleDegrees: ['بكالوريوس', 'دبلوم عالي', 'ماجستير', 'دكتوراه'],
        durationWeeks: 4,
        courses: [
          { name: 'دورة اختصاص فني / هندسي متقدم', type: 'اختصاص', icon: '⚙️' },
          { name: 'دورة تطويرية إدارية وقيادية متقدمة', type: 'إدارية متقدمة', icon: '🏛️' },
          { name: 'إعداد بحث أو تقرير فني متخصص', type: 'بحث/تقرير فني', icon: '📄' }
        ],
        notes: 'يشترط إكمال البحث أو التقرير الفني للمشمولين بالترقية إلى الدرجة الأولى.'
      },
      {
        fromGrade: '3',
        toGrade: '2',
        title: 'من الدرجة الثالثة إلى الدرجة الثانية',
        eligibleDegrees: ['دبلوم', 'بكالوريوس', 'دبلوم عالي', 'ماجستير', 'دكتوراه'],
        durationWeeks: 4,
        courses: [
          { name: 'دورة اختصاص متقدم في مجال العمل', type: 'اختصاص', icon: '⚙️' },
          { name: 'دورة تطويرية إدارية متقدمة', type: 'إدارية متقدمة', icon: '🏛️' },
          { name: 'إعداد بحث أو تقرير فني متخصص', type: 'بحث/تقرير فني', icon: '📄' }
        ],
        notes: 'يشترط إكمال البحث أو التقرير الفني للمشمولين بالترقية إلى الدرجة الثانية.'
      },
      {
        fromGrade: '4',
        toGrade: '3',
        title: 'من الدرجة الرابعة إلى الدرجة الثالثة',
        eligibleDegrees: ['اعدادية', 'دبلوم', 'بكالوريوس', 'دبلوم عالي', 'ماجستير'],
        durationWeeks: 4,
        courses: [
          { name: 'دورة اختصاص في طبيعة الواجبات', type: 'اختصاص', icon: '⚙️' },
          { name: 'دورة إدارية وتنظيمية', type: 'إدارية', icon: '📋' },
          { name: 'دورة اختيارية معتمدة', type: 'اختيارية', icon: '💡' }
        ],
        notes: 'مشمول للموظفين من حملة الإعدادية لغاية الدبلوم العالي.'
      },
      {
        fromGrade: '5',
        toGrade: '4',
        title: 'من الدرجة الخامسة إلى الدرجة الرابعة',
        eligibleDegrees: ['اعدادية', 'دبلوم', 'بكالوريوس', 'دبلوم عالي'],
        durationWeeks: 4,
        courses: [
          { name: 'دورة اختصاص مهني', type: 'اختصاص', icon: '⚙️' },
          { name: 'دورة السلامة والصحة المهنية والبيئة (HSE)', type: 'سلامة', icon: '🦺' },
          { name: 'دورة اختيارية معتمدة', type: 'اختيارية', icon: '💡' }
        ],
        notes: 'إلزامية دورة السلامة والصحة المهنية.'
      },
      {
        fromGrade: '6',
        toGrade: '5',
        title: 'من الدرجة السادسة إلى الدرجة الخامسة',
        eligibleDegrees: ['اعدادية', 'دبلوم', 'بكالوريوس', 'دبلوم عالي'],
        durationWeeks: 4,
        courses: [
          { name: 'دورة اختصاص في مجال العمل', type: 'اختصاص', icon: '⚙️' },
          { name: 'دورة السلامة المهنية الميدانية (HSE)', type: 'سلامة', icon: '🦺' },
          { name: 'دورة اختيارية', type: 'اختيارية', icon: '💡' }
        ],
        notes: 'إلزامية دورة السلامة المهنية.'
      },
      {
        fromGrade: '7',
        toGrade: '6',
        title: 'من الدرجة السابعة إلى الدرجة السادسة',
        eligibleDegrees: ['اعدادية', 'دبلوم', 'بكالوريوس'],
        durationWeeks: 4,
        courses: [
          { name: 'دورة اختصاص فني / تشغيلي', type: 'اختصاص', icon: '⚙️' },
          { name: 'دورة السلامة المهنية العامة', type: 'سلامة', icon: '🦺' },
          { name: 'دورة اختيارية', type: 'اختيارية', icon: '💡' }
        ],
        notes: 'إلزامية دورة السلامة المهنية.'
      },
      {
        fromGrade: '8',
        toGrade: '7',
        title: 'من الدرجة الثامنة إلى السابعة (حملة الدبلوم - استثناء خاص)',
        eligibleDegrees: ['دبلوم'],
        durationWeeks: 2,
        customYears: 1,
        courses: [
          { name: 'دورة تأهيل المعينين الجدد لحملة الدبلوم', type: 'تأهيل المعينين الجدد', icon: '🎓' }
        ],
        notes: 'يكون انتقال حملة شهادة الدبلوم من الدرجة الثامنة إلى السابعة بعد مرور سنة واحدة على مباشرتهم بعد استيفاء الشروط.'
      },
      {
        fromGrade: '8',
        toGrade: '7',
        title: 'من الدرجة الثامنة إلى السابعة (باقي الشهادات - إعدادية)',
        eligibleDegrees: ['اعدادية', 'متوسطة', 'ابتدائية'],
        durationWeeks: 4,
        courses: [
          { name: 'دورة اختصاص مهني', type: 'اختصاص', icon: '⚙️' },
          { name: 'دورة السلامة المهنية الميدانية', type: 'سلامة', icon: '🦺' },
          { name: 'دورة اختيارية', type: 'اختيارية', icon: '💡' }
        ],
        notes: 'المدة الأصغرية 4 سنوات لحملة الإعدادية وما دون.'
      },
      {
        fromGrade: '10',
        toGrade: '9',
        title: 'من الدرجة العاشرة إلى التاسعة (حملة الابتدائية - استثناء خاص)',
        eligibleDegrees: ['ابتدائية'],
        durationWeeks: 2,
        customYears: 2,
        courses: [
          { name: 'دورة تأهيل مهني وأساسيات السلامة', type: 'تأهيل مهني', icon: '🦺' }
        ],
        notes: 'يكون انتقال حملة شهادة الابتدائية من الدرجة العاشرة إلى التاسعة بعد مرور سنتين على مباشرتهم بعد استيفاء الشروط.'
      }
    ];
  }

  // --- Career Tracks & Job Title Progression Matrix (Iraqi Civil Service & BOC Law No. 22 of 2008) ---
  getCareerTracks() {
    return {
      technical: {
        key: 'technical',
        name: 'المسار الفني والتشغيلي',
        icon: '🔧',
        description: 'المسار الفني والتشغيلي لكادر المعاهد النفطية، الدبلوم التقني، والإعدادية المهنية والعامة',
        titlesByGrade: {
          '8': 'فني',
          '7': 'معاون ملاحظ فني',
          '6': 'ملاحظ فني',
          '5': 'رئيس ملاحظين فني',
          '4': 'معاون مدير فني',
          '3': 'مدير فني',
          '2': 'مدير فني أقدم',
          '1': 'مدير فني أقدم'
        },
        degreeCeilings: {
          'دبلوم': '1',
          'معهد': '1',
          'اعدادية': '4',
          'إعدادية': '4',
          'متوسطة': '5',
          'ابتدائية': '7'
        }
      },
      engineering: {
        key: 'engineering',
        name: 'المسار الهندسي',
        icon: '⚙️',
        description: 'المسار التخصصي لحملة شهادات البكالوريوس والدبلوم العالي والماجستير والدكتوراه الهندسية',
        titlesByGrade: {
          '7': 'معاون مهندس',
          '6': 'مهندس',
          '5': 'مهندس أقدم',
          '4': 'مهندس أقدم',
          '3': 'رئيس مهندسين',
          '2': 'رئيس مهندسين',
          '1': 'رئيس مهندسين أقدم'
        },
        degreeCeilings: {
          'بكالوريوس': '1',
          'دبلوم عالي': '1',
          'ماجستير': '1',
          'دكتوراه': '1'
        }
      },
      administrative: {
        key: 'administrative',
        name: 'المسار الإداري والمالي والقانوني',
        icon: '📋',
        description: 'المسار الإداري والمالي لحملة شهادات الإدارة والاقتصاد والقانون والعلوم الإنسانية والإعدادية',
        titlesByGrade: {
          '8': 'كاتب طابع / معاون ملاحظ',
          '7': 'معاون ملاحظ / معاون محاسب / معاون قانوني',
          '6': 'ملاحظ / محاسب / مشاور قانوني',
          '5': 'ملاحظ أقدم / محاسب أقدم / مشاور قانوني أقدم',
          '4': 'ملاحظ أقدم / محاسب أقدم / مشاور قانوني أقدم',
          '3': 'رئيس ملاحظين / رئيس محاسبين / رئيس مشاورين',
          '2': 'مدير / رئيس محاسبين أقدم / رئيس مشاورين أقدم',
          '1': 'مدير أقدم / خبير إداري ومالي'
        },
        degreeCeilings: {
          'بكالوريوس': '1',
          'دبلوم عالي': '1',
          'ماجستير': '1',
          'دكتوراه': '1',
          'دبلوم': '2',
          'اعدادية': '4',
          'متوسطة': '5',
          'ابتدائية': '7'
        }
      },
      scientific: {
        key: 'scientific',
        name: 'المسار العلمي والجيولوجي والبيئي',
        icon: '🔬',
        description: 'المسار العلمي لكوادر الجيولوجيا، الجيوفيزياء، الكيمياء، الفيزياء، والعلوم البيئية',
        titlesByGrade: {
          '7': 'معاون جيولوجي / معاون كيمياوي / معاون فيزياوي',
          '6': 'جيولوجي / كيمياوي / فيزياوي',
          '5': 'جيولوجي أقدم / كيمياوي أقدم / فيزياوي أقدم',
          '4': 'جيولوجي أقدم / كيمياوي أقدم / فيزياوي أقدم',
          '3': 'رئيس جيولوجيين / رئيس كيمياويين / رئيس فيزياويين',
          '2': 'رئيس جيولوجيين / رئيس كيمياويين / رئيس فيزياويين',
          '1': 'رئيس جيولوجيين أقدم / رئيس كيمياويين أقدم / خبير علمي'
        },
        degreeCeilings: {
          'بكالوريوس': '1',
          'دبلوم عالي': '1',
          'ماجستير': '1',
          'دكتوراه': '1'
        }
      },
      crafts: {
        key: 'crafts',
        name: 'المسار الحرفي والخدمي والمهني',
        icon: '🔨',
        description: 'المسار المهني والحرفي لكوادر الورش، الآليات، السائقين، والخدمات المساندة',
        titlesByGrade: {
          '10': 'حرفي مبتدئ',
          '9': 'حرفي',
          '8': 'حرفي أقدم',
          '7': 'ماهر',
          '6': 'رئيس حرفيين',
          '5': 'رئيس حرفيين أقدم',
          '4': 'مشرف حرفي ومهني'
        },
        degreeCeilings: {
          'اعدادية': '4',
          'متوسطة': '5',
          'ابتدائية': '7',
          'بدون شهادة': '8'
        }
      }
    };
  }

  // --- Bulk Thanks Letter Tool for Department & Roster (أداة إضافة كتاب شكر عام جماعي) ---
  addBulkThanksLetter(deptId, thanksData, scopeFilter = 'ALL', actorUser = null) {
    const db = this.getDb();
    if (!db.employeeMasterRecords) db.employeeMasterRecords = [];
    if (!db.users) db.users = [];
    if (!db.auditLogs) db.auditLogs = [];

    const issuer = thanksData.issuer || 'MINISTER'; // 'MINISTER', 'PM', 'PRESIDENT'
    const letterNumber = (thanksData.letterNumber || 'ش/عام/' + Date.now()).trim();
    const letterDate = thanksData.letterDate || new Date().toISOString().split('T')[0];
    const subject = (thanksData.subject || 'كتاب شكر وتقدير عام لكافة منتسبي القسم').trim();
    const reason = (thanksData.reason || 'تثميناً للجهود المتميزة في استقرار العمليات التشغيلية وتحقيق الأهداف الإنتاجية').trim();
    
    // Determine seniority months based on issuing authority per Iraqi Law & Regulations
    let grantedMonths = 1;
    let issuerName = 'السيد وزير النفط / المدير العام';
    if (issuer === 'PM') {
      grantedMonths = 6;
      issuerName = 'دولة رئيس مجلس الوزراء';
    } else if (issuer === 'PRESIDENT') {
      grantedMonths = 6;
      issuerName = 'فخامة رئيس الجمهورية';
    }

    const thanksEntry = {
      id: 'bulk_thanks_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      letterNumber,
      letterDate,
      issuer,
      issuerName,
      subject,
      reason,
      grantedMonths,
      scope: scopeFilter,
      createdAt: new Date().toISOString(),
      createdBy: actorUser ? (actorUser.name || actorUser.username) : 'إدارة القسم'
    };

    let affectedCount = 0;

    // Filter target employees
    const targetEmployees = db.employeeMasterRecords.filter(emp => {
      if (deptId && emp.departmentId && String(emp.departmentId) !== String(deptId)) return false;
      if (scopeFilter === 'ALL') return true;
      if (scopeFilter.startsWith('SECTION_') && emp.sectionId) {
        const secId = scopeFilter.replace('SECTION_', '');
        return String(emp.sectionId) === String(secId);
      }
      if (scopeFilter.startsWith('STATION_') && emp.stationId) {
        const stId = scopeFilter.replace('STATION_', '');
        return String(emp.stationId) === String(stId);
      }
      return true;
    });

    targetEmployees.forEach(emp => {
      affectedCount++;
      if (!emp.thanksConfig) {
        emp.thanksConfig = { minister: 0, primeMinister: 0, president: 0 };
      }
      if (!emp.thanksHistory) {
        emp.thanksHistory = [];
      }

      if (issuer === 'MINISTER') {
        emp.thanksConfig.minister = (emp.thanksConfig.minister || 0) + 1;
      } else if (issuer === 'PM') {
        emp.thanksConfig.primeMinister = (emp.thanksConfig.primeMinister || 0) + 1;
      } else if (issuer === 'PRESIDENT') {
        emp.thanksConfig.president = Math.min(2, (emp.thanksConfig.president || 0) + 1);
      }

      emp.thanksLettersCount = (emp.thanksConfig.minister || 0) + 
                               ((emp.thanksConfig.primeMinister || 0) * 6) + 
                               (emp.thanksConfig.president === 1 ? 6 : emp.thanksConfig.president >= 2 ? 18 : 0);

      emp.thanksHistory.unshift({
        ...thanksEntry,
        appliedToEmployeeId: emp.id,
        employeeName: emp.name
      });

      // Also mirror to user object if user exists
      const matchedUser = db.users.find(u => u.id === emp.userId || u.employeeId === emp.id || u.id === emp.id);
      if (matchedUser) {
        matchedUser.thanksConfig = { ...emp.thanksConfig };
        matchedUser.thanksLettersCount = emp.thanksLettersCount;
        if (!matchedUser.thanksHistory) matchedUser.thanksHistory = [];
        matchedUser.thanksHistory.unshift({
          ...thanksEntry,
          appliedToEmployeeId: emp.id
        });
      }
    });

    // Save global bulk thanks record in department records
    if (!db.bulkThanksRegistry) db.bulkThanksRegistry = [];
    db.bulkThanksRegistry.unshift({
      ...thanksEntry,
      departmentId: deptId,
      affectedCount
    });

    // Audit Log entry
    db.auditLogs.unshift({
      id: 'log_' + Date.now(),
      action: 'BULK_THANKS_LETTER_ADDED',
      actionName: 'إضافة كتاب شكر جماعي',
      details: `تم توثيق وإضافة كتاب شكر جماعي صادر من (${issuerName}) برقم [${letterNumber}] بتاريخ [${letterDate}]، وتم منح قدم (+${grantedMonths} شهر) لعدد (${affectedCount}) منتسباً بنجاح.`,
      userId: actorUser ? actorUser.id : 'SYSTEM',
      userName: actorUser ? (actorUser.name || actorUser.username) : 'إدارة القسم',
      departmentId: deptId,
      timestamp: new Date().toISOString()
    });

    this.saveDb();

    return {
      success: true,
      affectedCount,
      grantedMonths,
      issuerName,
      letterNumber,
      message: `تم إضافة كتاب الشكر الجماعي بنجاح وتحديث إضبارة وحاسبة استحقاق (${affectedCount}) منتسباً!`
    };
  }

  calculateCareerPromotion(rawGrade, rawStage, lastPromotionDate, thanksLetters = 0, degree = 'بكالوريوس', currentTitle = '', trackKey = 'auto') {
    const scale = this.getBocSalaryScale();
    const coursesList = this.getBocPromotionCourses();
    const tracks = this.getCareerTracks();

    // Standardize Grade key (handle 'الأولى', 'الثانية', '1', '2', etc.)
    let gradeKey = '4';
    const gradeMap = {
      'خاصة': 'SPECIAL', 'الخاصة': 'SPECIAL', 'SPECIAL': 'SPECIAL',
      'الأولى': '1', 'الاولى': '1', '1': '1',
      'الثانية': '2', '2': '2',
      'الثالثة': '3', '3': '3',
      'الرابعة': '4', '4': '4',
      'الخامسة': '5', '5': '5',
      'السادسة': '6', '6': '6',
      'السابعة': '7', '7': '7',
      'الثامنة': '8', '8': '8',
      'التاسعة': '9', '9': '9',
      'العاشرة': '10', '10': '10'
    };

    if (rawGrade && gradeMap[rawGrade.trim()]) {
      gradeKey = gradeMap[rawGrade.trim()];
    }

    const currentGradeObj = scale[gradeKey] || scale['4'];

    // Parse stage number (1 to 11)
    let stageNum = 1;
    if (typeof rawStage === 'number') {
      stageNum = Math.min(Math.max(rawStage, 1), 11);
    } else if (typeof rawStage === 'string') {
      const stageMatch = rawStage.match(/\d+/);
      if (stageMatch) {
        stageNum = Math.min(Math.max(parseInt(stageMatch[0], 10), 1), 11);
      } else {
        const arabicStages = {
          'الأولى': 1, 'الاولى': 1, 'الثانية': 2, 'الثالثة': 3, 'الرابعة': 4,
          'الخامسة': 5, 'السادسة': 6, 'السابعة': 7, 'الثامنة': 8, 'التاسعة': 9,
          'العاشرة': 10, 'الحادية عشر': 11, 'الحادية عشرة': 11
        };
        stageNum = arabicStages[rawStage.trim()] || 1;
      }
    }

    // Determine target next grade
    let nextGradeKey = null;
    let nextGradeObj = null;
    let requiredYears = currentGradeObj.promotionYears || 4;
    let exceptionNote = null;

    // Normalize Degree & Determine Active Track
    const degreeNormalized = (degree || '').trim().toLowerCase();
    const titleNormalized = (currentTitle || '').trim().toLowerCase();

    let resolvedTrackKey = trackKey;
    if (!resolvedTrackKey || resolvedTrackKey === 'auto') {
      if (titleNormalized.includes('فني') || titleNormalized.includes('تشغيل') || titleNormalized.includes('مشغل') || titleNormalized.includes('ملاحظ فني') || titleNormalized.includes('مدير فني')) {
        resolvedTrackKey = 'technical';
      } else if (titleNormalized.includes('مهندس') || degreeNormalized.includes('هندس')) {
        resolvedTrackKey = 'engineering';
      } else if (titleNormalized.includes('جيولوج') || titleNormalized.includes('كيمياو') || titleNormalized.includes('فيزياو') || titleNormalized.includes('بايولوج')) {
        resolvedTrackKey = 'scientific';
      } else if (titleNormalized.includes('حرفي') || titleNormalized.includes('سائق') || titleNormalized.includes('ميكانيك') || titleNormalized.includes('حداد') || titleNormalized.includes('كهربائي')) {
        resolvedTrackKey = 'crafts';
      } else if (degreeNormalized.includes('دبلوم') && !degreeNormalized.includes('عالي')) {
        resolvedTrackKey = 'technical';
      } else if (degreeNormalized.includes('بكالوريوس') && !degreeNormalized.includes('هندس')) {
        resolvedTrackKey = 'administrative';
      } else {
        resolvedTrackKey = 'technical';
      }
    }

    const activeTrack = tracks[resolvedTrackKey] || tracks.technical;

    // Check Degree & Grade Progression Rules (BOC & Iraqi Law 22 of 2008)
    if (gradeKey === '8') {
      if (degreeNormalized.includes('دبلوم') || degreeNormalized.includes('معهد')) {
        requiredYears = 1; // سنة واحدة لحملة الدبلوم الفني والمعاهد من الدرجة 8 إلى 7
        exceptionNote = 'استثناء رسمي (خريجو المعاهد والدبلوم الفني): الترفيع والانتقال من الدرجة الثامنة (فني) إلى الدرجة السابعة (معاون ملاحظ فني) بعد مرور سنة واحدة فقط على المباشرة بعد استيفاء الشروط ودورة تأهيل المعينين الجدد.';
      } else if (degreeNormalized.includes('اعدادية') || degreeNormalized.includes('إعدادية')) {
        requiredYears = 4; // 4 سنوات لحملة الإعدادية
        exceptionNote = 'الضوابط الرسمية (خريجو الإعدادية): الترفيع من الدرجة الثامنة (فني) إلى الدرجة السابعة (معاون ملاحظ فني) بعد إكمال المدة الأصغرية المقررة (4 سنوات).';
      }
    } else if (gradeKey === '10' && degreeNormalized.includes('ابتدائية')) {
      requiredYears = 2; // سنتان لحملة الابتدائية من الدرجة 10 إلى 9
      exceptionNote = 'استثناء رسمي: انتقال حملة شهادة الابتدائية من الدرجة العاشرة إلى التاسعة بعد مرور سنتين على مباشرتهم بعد استيفاء الشروط.';
    }

    if (gradeKey !== 'SPECIAL' && gradeKey !== '1') {
      const numericGrade = parseInt(gradeKey, 10);
      nextGradeKey = String(numericGrade - 1);
      nextGradeObj = scale[nextGradeKey];
    }

    // Degree Ceiling Check (سقف التدرج الوظيفي للشهادة)
    let isAtCeiling = false;
    let degreeCeilingGrade = '1';
    if (degreeNormalized.includes('دكتوراه') || degreeNormalized.includes('ماجستير') || degreeNormalized.includes('دبلوم عالي') || degreeNormalized.includes('بكالوريوس')) {
      degreeCeilingGrade = '1';
    } else if (degreeNormalized.includes('دبلوم') || degreeNormalized.includes('معهد')) {
      degreeCeilingGrade = '1'; // سمحت بها التعديلات الأخيرة للدرجة الثانية/الأولى (مدير فني أقدم)
    } else if (degreeNormalized.includes('اعدادية') || degreeNormalized.includes('إعدادية')) {
      degreeCeilingGrade = '4'; // سقف الإعدادية: الدرجة الرابعة (معاون مدير فني / رئيس ملاحظين)
    } else if (degreeNormalized.includes('متوسطة')) {
      degreeCeilingGrade = '5'; // سقف المتوسطة: الدرجة الخامسة
    } else if (degreeNormalized.includes('ابتدائية')) {
      degreeCeilingGrade = '7'; // سقف الابتدائية: الدرجة السابعة
    }

    const currentGradeNum = gradeKey === 'SPECIAL' ? 0 : parseInt(gradeKey, 10);
    const ceilingGradeNum = parseInt(degreeCeilingGrade, 10);

    if (currentGradeNum <= ceilingGradeNum && gradeKey !== 'SPECIAL') {
      if (currentGradeNum === ceilingGradeNum) {
        isAtCeiling = true;
      }
    }

    // Determine Current Career Title & Next Career Title (العنوان الحالي والعنوان القادم المستحق)
    const isManagerialRole = currentTitle && [
      'مدير قسم', 'مسؤول شعبة', 'مسؤول وحدة', 'مسؤول موقع', 'المؤسس', 'المدير العام', 'مناوب', 'مشغل محطة', 'إدارة'
    ].some(r => currentTitle.includes(r));

    let currentJobTitleResolved = (!isManagerialRole && currentTitle && activeTrack && Object.values(activeTrack.titlesByGrade || {}).includes(currentTitle.trim()) ? currentTitle.trim() : null) || (activeTrack && activeTrack.titlesByGrade && activeTrack.titlesByGrade[gradeKey]) || 'موظف';
    let nextJobTitle = 'أعلى استحقاق وظيفي';

    if (nextGradeKey && !isAtCeiling) {
      nextJobTitle = activeTrack.titlesByGrade[nextGradeKey] || 'ترفيع للدرجة الأعلى';
    } else if (isAtCeiling) {
      nextJobTitle = currentJobTitleResolved + ' (بلغ سقف المؤهل الدراسي)';
      nextGradeKey = null;
      nextGradeObj = null;
    }

    // Determine Required Training Courses for this transition
    const relevantCourseConfig = coursesList.find(c => {
      if (c.fromGrade !== gradeKey) return false;
      if (c.eligibleDegrees) {
        return c.eligibleDegrees.some(deg => degreeNormalized.includes(deg.toLowerCase()));
      }
      return true;
    }) || coursesList.find(c => c.fromGrade === gradeKey);

    const requiredCourses = relevantCourseConfig ? relevantCourseConfig.courses : [];
    const trainingWeeks = relevantCourseConfig ? relevantCourseConfig.durationWeeks : 4;
    const courseNotes = relevantCourseConfig ? relevantCourseConfig.notes : '';

    // Calculate Seniority Credit from Thanks & Appreciation Letters (أحكام كتب الشكر والقدم الوظيفي)
    let ministerCount = 0;
    let pmCount = 0;
    let presCount = 0;

    if (typeof thanksLetters === 'number' || typeof thanksLetters === 'string') {
      ministerCount = Math.max(0, parseInt(thanksLetters, 10) || 0);
    } else if (typeof thanksLetters === 'object' && thanksLetters !== null) {
      ministerCount = Math.max(0, parseInt(thanksLetters.minister || thanksLetters.thanksLettersCount || thanksLetters.ministerCount || 0, 10));
      pmCount = Math.max(0, parseInt(thanksLetters.primeMinister || thanksLetters.pmCount || 0, 10));
      presCount = Math.min(2, Math.max(0, parseInt(thanksLetters.president || thanksLetters.presCount || 0, 10)));
    }

    const ministerSeniorityMonths = ministerCount * 1;
    const pmSeniorityMonths = pmCount * 6;
    let presSeniorityMonths = 0;
    if (presCount === 1) {
      presSeniorityMonths = 6;
    } else if (presCount >= 2) {
      presSeniorityMonths = 6 + 12; // 18 months total
    }

    const totalSeniorityMonths = ministerSeniorityMonths + pmSeniorityMonths + presSeniorityMonths;
    const monthsReduction = totalSeniorityMonths;

    const lastDate = lastPromotionDate ? new Date(lastPromotionDate) : new Date();
    const totalMonthsRequired = requiredYears * 12;
    const netMonthsNeeded = Math.max(0, totalMonthsRequired - monthsReduction);

    const dueDate = new Date(lastDate.getTime());
    dueDate.setMonth(dueDate.getMonth() + netMonthsNeeded);

    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isDue = diffDays <= 0 && !isAtCeiling;

    // Current Basic Salary & Next Basic Salary (الرواتب الاسمية وفق القانون 22)
    const currentSalary = currentGradeObj.stages[stageNum - 1] || currentGradeObj.stages[0];
    const annualIncrement = currentGradeObj.annualIncrement;

    // Next Salary on Annual Increment (نفس الدرجة، المرحلة التالية)
    const nextStageNum = Math.min(stageNum + 1, 11);
    const salaryAfterIncrement = currentGradeObj.stages[nextStageNum - 1] || currentSalary;

    // Next Salary on Promotion (الدرجة الأعلى، المرحلة الأولى أو المرحلة المعادلة)
    let salaryAfterPromotion = currentSalary;
    let nextPromotionStage = 1;
    if (nextGradeObj) {
      const targetMin = currentSalary;
      const foundStageIdx = nextGradeObj.stages.findIndex(s => s >= targetMin);
      if (foundStageIdx !== -1) {
        nextPromotionStage = foundStageIdx + 1;
        salaryAfterPromotion = nextGradeObj.stages[foundStageIdx];
      } else {
        salaryAfterPromotion = nextGradeObj.stages[0];
      }
    }

    return {
      gradeKey,
      gradeName: currentGradeObj.name,
      stageNumber: stageNum,
      degree: degree || 'بكالوريوس',
      currentJobTitle: currentJobTitleResolved,
      nextJobTitle,
      careerTrack: activeTrack,
      isAtCeiling,
      degreeCeilingGrade,
      currentSalary,
      annualIncrement,
      requiredYears,
      totalMonthsRequired,
      netMonthsNeeded,
      thanksLetters: ministerCount,
      thanksDetails: {
        ministerCount,
        ministerSeniorityMonths,
        pmCount,
        pmSeniorityMonths,
        presCount,
        presSeniorityMonths,
        totalSeniorityMonths
      },
      monthsReduction: totalSeniorityMonths,
      dueDate: dueDate.toISOString().split('T')[0],
      daysRemaining: diffDays > 0 ? diffDays : 0,
      isDue,
      status: isAtCeiling ? 'الموظف في سقف الدرجة الوظيفية للمؤهل الدراسي الحالي' : isDue ? 'مستحق الترفيع / تغيير العنوان الآن' : `متبقي ${Math.ceil(diffDays / 30)} شهراً (${diffDays} يوماً)`,
      nextGradeKey,
      nextGradeName: nextGradeObj ? nextGradeObj.name : 'أعلى درجة وظيفية',
      nextPromotionStage,
      salaryAfterPromotion,
      salaryAfterIncrement,
      requiredCourses,
      trainingWeeks,
      courseNotes,
      exceptionNote,
      lawName: 'قانون رواتب موظفي الدولة والقطاع العام رقم 22 لسنة 2008 المعتمد في شركة نفط البصرة',
      scaleTable: scale
    };
  }

  // --- Technical Status Reports (Section 12) ---
  getTechnicalStatusReports(deptId, sectionId) {
    let reports = (this.getDb().technicalStatusReports || []).filter(r => r.departmentId === deptId);
    if (sectionId) {
      reports = reports.filter(r => r.sectionId === sectionId);
    }
    return reports;
  }

  addTechnicalStatusReport(report) {
    const db = this.getDb();
    if (!db.technicalStatusReports) db.technicalStatusReports = [];
    db.technicalStatusReports.unshift(report);
    this.saveDb(db);
    return report;
  }

  // --- Soft Delete / Recycle Bin (Section 18) ---
  getRecycleBin(deptId) {
    return (this.getDb().recycleBin || []).filter(r => r.departmentId === deptId);
  }

  moveToRecycleBin(deptId, itemType, itemTitle, itemData, user) {
    const db = this.getDb();
    if (!db.recycleBin) db.recycleBin = [];
    
    const binItem = {
      id: 'rb-' + Date.now(),
      departmentId: deptId,
      itemType,
      itemTitle,
      deletedAt: new Date().toISOString(),
      deletedById: user.id,
      deletedByName: user.fullName,
      data: itemData
    };

    db.recycleBin.unshift(binItem);
    this.saveDb(db);
    return binItem;
  }

  restoreFromRecycleBin(binId) {
    const db = this.getDb();
    const idx = (db.recycleBin || []).findIndex(r => r.id === binId);
    if (idx === -1) return { success: false, error: 'العنصر غير موجود في سلة المحذوفات' };
    
    const item = db.recycleBin[idx];
    if (item.itemType === 'DOCUMENT') {
      if (!db.documents) db.documents = [];
      db.documents.unshift(item.data);
    } else if (item.itemType === 'ANNOUNCEMENT') {
      if (!db.announcements) db.announcements = [];
      db.announcements.unshift(item.data);
    }

    db.recycleBin.splice(idx, 1);
    this.saveDb(db);
    return { success: true, item };
  }

  permanentDeleteFromRecycleBin(binId) {
    const db = this.getDb();
    db.recycleBin = (db.recycleBin || []).filter(r => r.id !== binId);
    this.saveDb(db);
  }

  // --- Multi-Tenant Departments ---
  getDepartments() {
    return this.getDb().departments || [];
  }

  getDepartmentById(deptId) {
    return this.getDepartments().find(d => d.id === deptId);
  }

  addDepartment(dept) {
    const db = this.getDb();
    if (!db.departments) db.departments = [];
    db.departments.push(dept);
    this.saveDb(db);
    return dept;
  }

  updateDepartment(deptId, patch) {
    const db = this.getDb();
    const idx = db.departments.findIndex(d => d.id === deptId);
    if (idx !== -1) {
      db.departments[idx] = { ...db.departments[idx], ...patch };
      this.saveDb(db);
      return db.departments[idx];
    }
    return null;
  }

  // --- Comprehensive Department Roster Generator (520+ Real Production Employees) ---
  generateFullDepartmentMasterRecords() {
    const firstNames = [
      'أحمد', 'محمد', 'علي', 'حسين', 'حيدر', 'مصطفى', 'كرار', 'سجاد', 'عمار', 'مهند', 
      'ياسر', 'ضياء', 'وسام', 'باقر', 'عباس', 'صادق', 'جعفر', 'كاظم', 'جاسم', 'فلاح', 
      'عقيل', 'ماجد', 'علاء', 'عادل', 'سامر', 'ضرغام', 'ليث', 'حمزة', 'سيف', 'يوسف', 
      'حسن', 'طارق', 'وليد', 'فراس', 'رائد', 'نبيل', 'نبراس', 'حازم', 'باسم', 'شاكر', 
      'منير', 'سلام', 'رافد', 'عدنان', 'ثامر', 'رياض', 'سعد', 'قاسم', 'ناظم', 'هادي',
      'فؤاد', 'ماهر', 'محمود', 'مرتضى', 'أركان', 'قصي', 'لؤي', 'حامد', 'عصام', 'ميثم'
    ];
    const fatherNames = [
      'عبد الحسين', 'جاسم', 'علي', 'جبار', 'فاضل', 'كاظم', 'جواد', 'حسن', 'باقر', 'رياض',
      'حميد', 'ستار', 'كريم', 'محسن', 'صالح', 'رحيم', 'موسى', 'راضي', 'نعمة', 'حمودي',
      'فارس', 'صباح', 'ناجي', 'منصور', 'شبيب', 'طاهر', 'صبيح', 'غانم', 'سلمان', 'عمران',
      'محيي', 'خضير', 'سعود', 'شريف', 'عريبي', 'شنيار', 'طعمة', 'عبد الرضا', 'عبد الزهرة', 'عبد الكريم'
    ];
    const familyNames = [
      'البصري', 'الكناني', 'الركابي', 'الساعدي', 'العلي', 'الموسوي', 'التميمي', 'الخفاجي', 'الحميد', 'العبادي',
      'المياحي', 'الغراوي', 'الحسني', 'الشمري', 'البديري', 'البهادلي', 'الدراجي', 'المالكي', 'الفرطوسي', 'الفتلاوي',
      'الزبيدي', 'العامري', 'الدلفي', 'العيداني', 'العطواني', 'الخزاعي', 'الحلفي', 'البدران', 'الصالحي', 'الجابري',
      'الشاوي', 'العبوسي', 'الحمداوي', 'البوعلوان', 'الصياد', 'المطوري', 'البزوني', 'الشغانبي', 'الشليخي', 'المنصوري'
    ];
    const mothers = [
      'فاطمة كاظم', 'زينب حسن', 'مريم علي', 'سعاد ناصر', 'خديجة مهدي', 'رجاء حسين', 'هدى عبد الرضا',
      'سليمة راضي', 'بتول حميد', 'أميرة جاسم', 'سهام عبد الحسين', 'نجاة كريم', 'وداد ستار', 'إلهام محسن',
      'بشرى صالح', 'عواطف رحيم', 'ناهضة موسى', 'أمل نعمة', 'زهراء حمودي', 'سميرة فارس'
    ];

    const baseList = JSON.parse(JSON.stringify(INITIAL_DB.employeeMasterRecords || []));
    const cleanEmpIds = new Set(baseList.map(e => (e.employeeId || '').trim().toUpperCase()));

    const distribution = [
      // 1. الشعبة الأولى (130 موظف)
      { sectionId: 'sec-1', stationId: 'st-101', unitId: null, count: 50, namePrefix: 'المحطة المركزية', secName: 'الشعبة الأولى', staName: 'المحطة المركزية' },
      { sectionId: 'sec-1', stationId: 'st-102', unitId: null, count: 45, namePrefix: 'المحطة الجنوبية', secName: 'الشعبة الأولى', staName: 'المحطة الجنوبية' },
      { sectionId: 'sec-1', stationId: 'st-103', unitId: null, count: 35, namePrefix: 'محطة الرطكة', secName: 'الشعبة الأولى', staName: 'محطة الرطكة' },

      // 2. الشعبة الثانية (150 موظف)
      { sectionId: 'sec-2', stationId: 'st-201', unitId: null, count: 40, namePrefix: 'محطة الشامية', secName: 'الشعبة الثانية', staName: 'محطة الشامية' },
      { sectionId: 'sec-2', stationId: 'st-202', unitId: null, count: 35, namePrefix: 'محطة القرينات', secName: 'الشعبة الثانية', staName: 'محطة القرينات' },
      { sectionId: 'sec-2', stationId: 'st-203', unitId: null, count: 40, namePrefix: 'مشرف شامية', secName: 'الشعبة الثانية', staName: 'محطة مشرف شامية' },
      { sectionId: 'sec-2', stationId: 'st-204', unitId: null, count: 35, namePrefix: 'مشرف قرينات', secName: 'الشعبة الثانية', staName: 'محطة مشرف قرينات' },

      // 3. شعبة المختبرات (45 موظفاً موزعين على المحطات الـ 7)
      { sectionId: 'sec-3', stationId: 'st-301', unitId: null, count: 7, namePrefix: 'مختبر المركزية', secName: 'شعبة المختبرات', staName: 'المحطة المركزية' },
      { sectionId: 'sec-3', stationId: 'st-302', unitId: null, count: 6, namePrefix: 'مختبر الرطكة', secName: 'شعبة المختبرات', staName: 'محطة الرطكة' },
      { sectionId: 'sec-3', stationId: 'st-303', unitId: null, count: 6, namePrefix: 'مختبر الجنوبية', secName: 'شعبة المختبرات', staName: 'المحطة الجنوبية' },
      { sectionId: 'sec-3', stationId: 'st-304', unitId: null, count: 6, namePrefix: 'مختبر الشامية', secName: 'شعبة المختبرات', staName: 'محطة الشامية' },
      { sectionId: 'sec-3', stationId: 'st-305', unitId: null, count: 6, namePrefix: 'مختبر القرينات', secName: 'شعبة المختبرات', staName: 'محطة القرينات' },
      { sectionId: 'sec-3', stationId: 'st-306', unitId: null, count: 7, namePrefix: 'مختبر مشرف شامية', secName: 'شعبة المختبرات', staName: 'محطة مشرف شامية' },
      { sectionId: 'sec-3', stationId: 'st-307', unitId: null, count: 7, namePrefix: 'مختبر مشرف قرينات', secName: 'شعبة المختبرات', staName: 'محطة مشرف قرينات' },

      // 4. شعبة العدادات (35 موظفاً موزعين على المحطات الـ 7)
      { sectionId: 'sec-4', stationId: 'st-401', unitId: null, count: 5, namePrefix: 'عدادات المركزية', secName: 'شعبة العدادات', staName: 'المحطة المركزية' },
      { sectionId: 'sec-4', stationId: 'st-402', unitId: null, count: 5, namePrefix: 'عدادات الرطكة', secName: 'شعبة العدادات', staName: 'محطة الرطكة' },
      { sectionId: 'sec-4', stationId: 'st-403', unitId: null, count: 5, namePrefix: 'عدادات الجنوبية', secName: 'شعبة العدادات', staName: 'المحطة الجنوبية' },
      { sectionId: 'sec-4', stationId: 'st-404', unitId: null, count: 5, namePrefix: 'عدادات الشامية', secName: 'شعبة العدادات', staName: 'محطة الشامية' },
      { sectionId: 'sec-4', stationId: 'st-405', unitId: null, count: 5, namePrefix: 'عدادات القرينات', secName: 'شعبة العدادات', staName: 'محطة القرينات' },
      { sectionId: 'sec-4', stationId: 'st-406', unitId: null, count: 5, namePrefix: 'عدادات مشرف شامية', secName: 'شعبة العدادات', staName: 'محطة مشرف شامية' },
      { sectionId: 'sec-4', stationId: 'st-407', unitId: null, count: 5, namePrefix: 'عدادات مشرف قرينات', secName: 'شعبة العدادات', staName: 'محطة مشرف قرينات' },

      // 5. الوحدات التنظيمية (120 موظف)
      { sectionId: null, stationId: null, unitId: 'unit-1', count: 60, namePrefix: 'الوحدة الفنية', secName: 'الوحدة الفنية', staName: '' },
      { sectionId: null, stationId: null, unitId: 'unit-2', count: 25, namePrefix: 'التدريب والتطوير', secName: 'وحدة التدريب والتطوير', staName: '' },
      { sectionId: null, stationId: null, unitId: 'unit-3', count: 35, namePrefix: 'الضمان الصحي والسلامة HSE', secName: 'وحدة الضمان الصحي', staName: '' },

      // 6. إدارة القسم والشؤون الإدارية (45 موظف)
      { sectionId: null, stationId: null, unitId: null, count: 45, namePrefix: 'إدارة القسم والذاتية', secName: 'إدارة القسم', staName: '' }
    ];

    let empSeq = 1012;
    const shifts = ['A', 'B', 'C', 'D'];

    distribution.forEach(dist => {
      for (let i = 0; i < dist.count; i++) {
        const empId = 'EMP-' + empSeq;
        empSeq++;
        if (cleanEmpIds.has(empId)) continue;

        const fn = firstNames[(empSeq * 7 + i * 3) % firstNames.length];
        const mn = fatherNames[(empSeq * 11 + i * 5) % fatherNames.length];
        const ln = familyNames[(empSeq * 13 + i * 7) % familyNames.length];
        const fullName = `${fn} ${mn} ${ln}`;
        const motherName = mothers[(empSeq + i) % mothers.length];

        const shiftVal = dist.stationId ? shifts[i % 4] : (i % 5 === 0 ? 'A' : 'نهاري');
        const isShift = (shiftVal !== 'نهاري');

        let track = 'technical';
        let grade = '8';
        let stage = (i % 10) + 1;
        let qualification = 'دبلوم';
        let jobTitle = 'فني تشغيلي';

        const mod = i % 8;
        if (dist.sectionId === 'sec-3') {
          track = 'scientific';
          if (mod === 0) { grade = '3'; qualification = 'ماجستير'; jobTitle = 'رئيس كيمياويين أقدم'; }
          else if (mod === 1 || mod === 2) { grade = '5'; qualification = 'بكالوريوس'; jobTitle = 'كيمياوي أقدم'; }
          else if (mod === 3 || mod === 4) { grade = '6'; qualification = 'بكالوريوس'; jobTitle = 'كيمياوي'; }
          else if (mod === 5) { grade = '7'; qualification = 'بكالوريوس'; jobTitle = 'معاون كيمياوي'; }
          else { grade = '8'; qualification = 'دبلوم'; jobTitle = 'فني مختبر كيميائي'; }
        } else if (dist.sectionId === 'sec-4') {
          if (mod === 0) { track = 'engineering'; grade = '3'; qualification = 'بكالوريوس'; jobTitle = 'رئيس مهندسي قياس ومعايرة'; }
          else if (mod === 1 || mod === 2) { track = 'engineering'; grade = '5'; qualification = 'بكالوريوس'; jobTitle = 'مهندس عدادات أقدم'; }
          else if (mod === 3 || mod === 4) { track = 'technical'; grade = '6'; qualification = 'دبلوم'; jobTitle = 'ملاحظ فني عدادات'; }
          else { track = 'technical'; grade = '8'; qualification = 'دبلوم'; jobTitle = 'فني معايرة عدادات'; }
        } else if (dist.unitId === 'unit-1') {
          if (mod === 0) { track = 'engineering'; grade = '3'; qualification = 'بكالوريوس'; jobTitle = 'رئيس مهندسين صيانة ميكانيكية'; }
          else if (mod === 1) { track = 'engineering'; grade = '4'; qualification = 'بكالوريوس'; jobTitle = 'مهندس صيانة كهربائية أقدم'; }
          else if (mod === 2) { track = 'engineering'; grade = '5'; qualification = 'بكالوريوس'; jobTitle = 'مهندس آلات دقيقة'; }
          else if (mod === 3) { track = 'technical'; grade = '5'; qualification = 'دبلوم'; jobTitle = 'رئيس ملاحظين فني ميكانيك'; }
          else if (mod === 4) { track = 'technical'; grade = '6'; qualification = 'دبلوم'; jobTitle = 'ملاحظ فني كهرباء'; }
          else if (mod === 5) { track = 'technical'; grade = '7'; qualification = 'دبلوم'; jobTitle = 'معاون ملاحظ فني توربينات'; }
          else if (mod === 6) { track = 'technical'; grade = '8'; qualification = 'دبلوم'; jobTitle = 'فني صيانة مضخات نفط'; }
          else { track = 'crafts'; grade = '9'; qualification = 'اعدادية'; jobTitle = 'حرفي أنابيب ولحام ضغط عالي'; }
        } else if (dist.unitId === 'unit-2') {
          if (mod === 0) { track = 'administrative'; grade = '3'; qualification = 'ماجستير'; jobTitle = 'رئيس مدربين فنيين أقدم'; }
          else if (mod <= 2) { track = 'administrative'; grade = '5'; qualification = 'بكالوريوس'; jobTitle = 'ملاحظ تدريب وتطوير'; }
          else { track = 'administrative'; grade = '7'; qualification = 'بكالوريوس'; jobTitle = 'معاون ملاحظ تدريب'; }
        } else if (dist.unitId === 'unit-3') {
          if (mod === 0) { track = 'engineering'; grade = '4'; qualification = 'بكالوريوس'; jobTitle = 'مهندس سلامة وبيئة أقدم'; }
          else if (mod <= 2) { track = 'technical'; grade = '6'; qualification = 'دبلوم'; jobTitle = 'ملاحظ سلامة مهنية وإطفاء'; }
          else { track = 'technical'; grade = '8'; qualification = 'دبلوم'; jobTitle = 'فني سلامة وحماية بيئة'; }
        } else if (!dist.sectionId && !dist.unitId) {
          if (mod === 0) { track = 'administrative'; grade = '2'; qualification = 'بكالوريوس'; jobTitle = 'مدير إدارة وأفراد أقدم'; }
          else if (mod === 1) { track = 'administrative'; grade = '4'; qualification = 'بكالوريوس'; jobTitle = 'ملاحظ ذاتية وقانوني'; }
          else if (mod === 2) { track = 'administrative'; grade = '5'; qualification = 'بكالوريوس'; jobTitle = 'محاسب أقدم'; }
          else if (mod === 3) { track = 'administrative'; grade = '6'; qualification = 'بكالوريوس'; jobTitle = 'مبرمج نظم ومعلومات أقدم'; }
          else if (mod === 4) { track = 'administrative'; grade = '7'; qualification = 'بكالوريوس'; jobTitle = 'معاون ملاحظ إداري'; }
          else { track = 'crafts'; grade = '8'; qualification = 'اعدادية'; jobTitle = 'سائق آليات ونقل موقعي'; }
        } else {
          if (mod === 0) { track = 'engineering'; grade = '4'; qualification = 'بكالوريوس'; jobTitle = `مهندس تشغيل موقعي (${dist.staName})`; }
          else if (mod === 1) { track = 'technical'; grade = '5'; qualification = 'دبلوم'; jobTitle = `رئيس مشغلي محطة (${dist.staName})`; }
          else if (mod === 2) { track = 'technical'; grade = '6'; qualification = 'دبلوم'; jobTitle = `ملاحظ تشغيل محطة (${dist.staName})`; }
          else if (mod === 3 || mod === 4) { track = 'technical'; grade = '7'; qualification = 'دبلوم'; jobTitle = `معاون ملاحظ تشغيل (${dist.staName})`; }
          else if (mod === 5 || mod === 6) { track = 'technical'; grade = '8'; qualification = 'دبلوم'; jobTitle = `مشغل محطة إنتاجية (${dist.staName})`; }
          else { track = 'crafts'; grade = '9'; qualification = 'اعدادية'; jobTitle = `مساعد مشغل محطة عزل غاز (${dist.staName})`; }
        }

        const hireYear = 2012 + (i % 12);
        const hireDate = `${hireYear}-0${(i % 9) + 1}-15`;
        const promoYear = Math.max(hireYear, 2020 + (i % 5));
        const promoDate = `${promoYear}-0${(i % 9) + 1}-01`;
        const minThanks = (i % 4);
        const pmThanks = (i % 11 === 0 ? 1 : 0);

        baseList.push({
          employeeId: empId,
          fullName: fullName,
          departmentId: 'dept-south-prod',
          sectionId: dist.sectionId,
          unitId: dist.unitId,
          stationId: dist.stationId,
          workShift: isShift ? 'مناوب' : 'نهاري',
          assignedShift: isShift ? shiftVal : null,
          shift: isShift ? shiftVal : null,
          phone: `0770${String(1000000 + (empSeq * 37) % 8999999).padStart(7, '0')}`,
          emailPersonal: `emp${empSeq}@rumaila.iq`,
          emailOfficial: `emp${empSeq}@rumaila.iq`,
          jobTitle: jobTitle,
          jobGrade: grade,
          jobStage: stage,
          qualification: qualification,
          degree: qualification,
          careerTrack: track,
          hireDate: hireDate,
          lastPromotionDate: promoDate,
          thanksLettersCount: minThanks + (pmThanks * 6),
          thanksConfig: { minister: minThanks, primeMinister: pmThanks, president: 0 },
          motherName: motherName,
          passportNumber: `A${String(10000000 + (empSeq * 73) % 89999999)}`,
          unifiedCardNumber: `198${String(100000000 + (empSeq * 127) % 899999999)}`,
          dynamicValues: {},
          transferHistory: []
        });
      }
    });

    return baseList;
  }

  // --- Employee Master Records & Dynamic Fields (Single Source of Truth) ---
  getEmployeeMasterRecords(deptId) {
    const db = this.getDb();
    let records = db.employeeMasterRecords;
    if (!records || records.length < 50) {
      records = this.generateFullDepartmentMasterRecords();
      db.employeeMasterRecords = records;
      db.approvedEmployeeIds = records.map(r => ({
        id: r.employeeId,
        employeeId: r.employeeId,
        name: r.fullName,
        fullName: r.fullName,
        ...r
      }));
      this.saveDb(db);
    } else {
      let updated = false;
      (INITIAL_DB.employeeMasterRecords || []).forEach(initialMaster => {
        const cleanId = (initialMaster.employeeId || '').trim().toUpperCase();
        const existing = records.find(r => r && (r.employeeId || '').trim().toUpperCase() === cleanId);
        if (!existing) {
          records.push(JSON.parse(JSON.stringify(initialMaster)));
          updated = true;
        } else if (initialMaster.workShift && existing.workShift !== initialMaster.workShift) {
          existing.workShift = initialMaster.workShift;
          existing.assignedShift = initialMaster.assignedShift;
          existing.shift = initialMaster.shift;
          existing.stationId = initialMaster.stationId;
          existing.sectionId = initialMaster.sectionId;
          updated = true;
        }
      });
      if (updated) {
        db.employeeMasterRecords = records;
        this.saveDb(db);
      }
    }
    return deptId ? records.filter(r => r.departmentId === deptId) : records;
  }

  getEmployeeMasterRecordByEmployeeId(empId) {
    if (!empId) return null;
    const cleanId = empId.trim().toUpperCase();
    const records = this.getEmployeeMasterRecords();
    return records.find(r => (r.employeeId || '').trim().toUpperCase() === cleanId) || null;
  }

  addOrUpdateEmployeeMasterRecord(record, actorUser) {
    const db = this.getDb();
    if (!db.employeeMasterRecords) db.employeeMasterRecords = this.getEmployeeMasterRecords();
    
    const cleanId = (record.employeeId || '').trim().toUpperCase();
    if (!cleanId) return { success: false, error: 'الرقم الوظيفي إلزامي.' };

    const idx = db.employeeMasterRecords.findIndex(r => (r.employeeId || '').trim().toUpperCase() === cleanId);
    
    const masterData = {
      ...record,
      employeeId: cleanId,
      updatedAt: new Date().toISOString()
    };

    if (idx !== -1) {
      db.employeeMasterRecords[idx] = { ...db.employeeMasterRecords[idx], ...masterData };
    } else {
      masterData.createdAt = new Date().toISOString();
      masterData.dynamicValues = masterData.dynamicValues || {};
      masterData.transferHistory = masterData.transferHistory || [];
      db.employeeMasterRecords.push(masterData);
    }

    // Keep approvedEmployeeIds in sync for backward compatibility
    db.approvedEmployeeIds = db.employeeMasterRecords.map(r => ({
      id: r.employeeId,
      employeeId: r.employeeId,
      name: r.fullName,
      fullName: r.fullName,
      ...r
    }));

    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'UPDATE_MASTER_RECORD',
        'HR_MANAGEMENT',
        `تم حفظ وتحديث السجل الأساسي للموظف: ${masterData.fullName} (${masterData.employeeId})`
      );
    }

    return { success: true, record: masterData };
  }

  // --- Employee Transfer Engine (نقل الموظف بين الشعب والوحدات مع توثيق السجل) ---
  transferEmployeeSection(empId, targetSectionId, targetUnitId, targetStationId, notes, actorUser) {
    const master = this.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) return { success: false, error: 'سجل الموظف غير موجود.' };

    const oldSec = this.getSectionById(master.sectionId);
    const newSec = this.getSectionById(targetSectionId);
    const oldSecName = oldSec ? oldSec.name : 'غير محدد';
    const newSecName = newSec ? newSec.name : 'غير محدد';

    const transferEntry = {
      id: 'tr-' + Date.now(),
      fromSectionId: master.sectionId || null,
      toSectionId: targetSectionId || null,
      fromSectionName: oldSecName,
      toSectionName: newSecName,
      targetUnitId: targetUnitId || null,
      targetStationId: targetStationId || null,
      date: new Date().toISOString().split('T')[0],
      transferredById: actorUser ? actorUser.id : 'system',
      transferredByName: actorUser ? actorUser.fullName : 'الإدارة',
      notes: notes || 'نقل إداري معتمد'
    };

    if (!master.transferHistory) master.transferHistory = [];
    master.transferHistory.unshift(transferEntry);

    master.sectionId = targetSectionId || null;
    master.unitId = targetUnitId || null;
    master.stationId = targetStationId || null;
    master.updatedAt = new Date().toISOString();

    // Also update linked user account if exists
    const linkedUser = this.getUserByEmployeeId(empId);
    if (linkedUser) {
      this.updateUser(linkedUser.id, {
        sectionId: targetSectionId || null,
        unitId: targetUnitId || null,
        stationId: targetStationId || null
      });
    }

    this.addOrUpdateEmployeeMasterRecord(master, actorUser);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'TRANSFER_EMPLOYEE',
        'HR_MANAGEMENT',
        `تم نقل ارتباط الموظف [${master.fullName} - ${empId}] من [${oldSecName}] إلى [${newSecName}].`
      );
    }

    return { success: true, master, transferEntry };
  }

  // --- Update Section/Unit-Specific Notes (ملاحظات ومعلومات خاصة بالشعبة أو الوحدة) ---
  updateEmployeeSectionNotes(empId, sectionNotes, actorUser) {
    let master = this.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) {
      const userObj = (this.getUsers() || []).find(u => u.employeeId === empId || u.id === empId);
      if (userObj) {
        master = {
          employeeId: userObj.employeeId || userObj.id || empId,
          fullName: userObj.fullName || userObj.name || 'منتسب',
          jobTitle: userObj.jobTitle || 'موظف',
          role: userObj.role || 'EMPLOYEE',
          sectionId: userObj.sectionId || null,
          unitId: userObj.unitId || null,
          stationId: userObj.stationId || null,
          sectionNotes: sectionNotes,
          departmentId: userObj.departmentId || 'dept-south-prod',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        this.addOrUpdateEmployeeMasterRecord(master, actorUser);
        return { success: true, master };
      }
      return { success: false, error: 'سجل الموظف غير موجود.' };
    }

    master.sectionNotes = sectionNotes;
    master.updatedAt = new Date().toISOString();
    this.addOrUpdateEmployeeMasterRecord(master, actorUser);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'UPDATE_SECTION_NOTES',
        'SECTION_MANAGEMENT',
        `تم تحديث الملاحظات والمعلومات الخاصة بالمستفيد: ${master.fullName} (${empId})`
      );
    }

    return { success: true, master };
  }

  updateEmployeeMaster(empId, patch, actorUser) {
    const master = this.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) return { success: false, error: 'سجل الموظف غير موجود.' };
    Object.assign(master, patch);
    if (patch.dynamicValues) {
      master.dynamicValues = { ...(master.dynamicValues || {}), ...patch.dynamicValues };
    }
    master.updatedAt = new Date().toISOString();
    return this.addOrUpdateEmployeeMasterRecord(master, actorUser);
  }

  // --- Dynamic Employee Fields System ---
  getDynamicEmployeeFields(deptId) {
    const db = this.getDb();
    if (!db.dynamicEmployeeFields || db.dynamicEmployeeFields.length === 0) {
      db.dynamicEmployeeFields = [...INITIAL_DB.dynamicEmployeeFields];
      this.saveDb(db);
    }
    return db.dynamicEmployeeFields.filter(f => f.isActive !== false);
  }

  addDynamicEmployeeField(fieldDef, actorUser) {
    const db = this.getDb();
    if (!db.dynamicEmployeeFields) db.dynamicEmployeeFields = [];

    const newField = {
      id: 'field-' + Date.now(),
      name: fieldDef.name,
      key: fieldDef.key || 'field_' + Date.now(),
      type: fieldDef.type || 'text', // text, number, date, select, multiselect, boolean, file, image, url, textarea
      category: fieldDef.category || 'administrative',
      isRequired: !!fieldDef.isRequired,
      scope: fieldDef.scope || 'GLOBAL', // GLOBAL, DEPARTMENT, SECTION, UNIT, STATION
      scopeId: fieldDef.scopeId || null,
      options: fieldDef.options || [],
      isActive: true,
      order: db.dynamicEmployeeFields.length + 1,
      createdAt: new Date().toISOString()
    };

    db.dynamicEmployeeFields.push(newField);
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'ADD_DYNAMIC_FIELD',
        'HR_MANAGEMENT',
        `تم إنشاء حقل/معلومة ديناميكية جديدة في الإضبارة الموحدة: [${newField.name}] بنطاق (${newField.scope}).`
      );
    }

    return { success: true, field: newField };
  }

  updateDynamicEmployeeField(fieldId, patch, actorUser) {
    const db = this.getDb();
    const idx = (db.dynamicEmployeeFields || []).findIndex(f => f.id === fieldId);
    if (idx !== -1) {
      db.dynamicEmployeeFields[idx] = { ...db.dynamicEmployeeFields[idx], ...patch };
      this.saveDb(db);
      return { success: true, field: db.dynamicEmployeeFields[idx] };
    }
    return { success: false, error: 'الحقل غير موجود' };
  }

  deleteDynamicEmployeeField(fieldId, actorUser) {
    const db = this.getDb();
    const idx = (db.dynamicEmployeeFields || []).findIndex(f => f.id === fieldId);
    if (idx !== -1) {
      const deletedName = db.dynamicEmployeeFields[idx].name;
      db.dynamicEmployeeFields[idx].isActive = false;
      this.saveDb(db);

      if (actorUser) {
        this.logActivity(
          actorUser.departmentId,
          actorUser.id,
          actorUser.employeeId,
          'DELETE_DYNAMIC_FIELD',
          'HR_MANAGEMENT',
          `تم تعطيل الحقل الديناميكي: [${deletedName}] من الإضبارة الموحدة.`
        );
      }
      return { success: true };
    }
    return { success: false, error: 'الحقل غير موجود' };
  }

  setEmployeeDynamicValue(empId, fieldKey, value, scope, actorUser) {
    const master = this.getEmployeeMasterRecordByEmployeeId(empId);
    if (!master) return { success: false, error: 'سجل الموظف غير موجود.' };

    if (!master.dynamicValues) master.dynamicValues = {};
    master.dynamicValues[fieldKey] = {
      value: value,
      scope: scope || 'GLOBAL',
      updatedAt: new Date().toISOString(),
      updatedBy: actorUser ? actorUser.fullName : 'النظام'
    };
    master.updatedAt = new Date().toISOString();

    this.addOrUpdateEmployeeMasterRecord(master, actorUser);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'SET_DYNAMIC_VALUE',
        'HR_MANAGEMENT',
        `تم تحديث قيمة المعلومة [${fieldKey}] لإضبارة الموظف: ${master.fullName} (${empId}).`
      );
    }

    return { success: true, master };
  }

  // --- Unified Employee Roster (دمج سجل الموظفين مع إدارة المستخدمين وطلبات القبول) ---
  getUnifiedEmployeeRoster(actorUser) {
    if (!actorUser) return [];

    const db = this.getDb();
    const masterRecords = this.getEmployeeMasterRecords(actorUser.departmentId);
    const users = db.users || [];

    // Pre-calculate hash maps for instant O(1) lookups
    const sectionsMap = {};
    (db.sections || []).forEach(s => { if (s && s.id) sectionsMap[s.id] = s; });
    const stationsMap = {};
    (db.stations || []).forEach(st => { if (st && st.id) stationsMap[st.id] = st; });
    const unitsMap = {};
    (db.units || []).forEach(u => { if (u && u.id) unitsMap[u.id] = u; });

    // Build map of users by employee ID
    const usersByEmpId = {};
    users.forEach(u => {
      if (u && u.employeeId) {
        usersByEmpId[u.employeeId.trim().toUpperCase()] = u;
      }
    });

    // Merge into Unified Dossier List
    let unifiedList = masterRecords.map(master => {
      const cleanEmpId = (master.employeeId || '').trim().toUpperCase();
      const linkedUser = usersByEmpId[cleanEmpId] || null;

      // Determine Unified Status
      let accountStatus = 'NO_ACCOUNT'; // موظف معتمد في السجل بدون حساب
      let accountStatusLabel = '⚪ بدون حساب مستخدم';
      let role = 'EMPLOYEE';
      let customPermissions = [];
      let userId = null;
      let userEmail = master.emailOfficial || master.emailPersonal || '';

      if (linkedUser) {
        userId = linkedUser.id;
        userEmail = linkedUser.email || userEmail;
        role = linkedUser.role || role;
        customPermissions = linkedUser.customPermissions || [];

        if (linkedUser.status === 'PENDING') {
          accountStatus = 'PENDING';
          accountStatusLabel = '🟡 بانتظار الموافقة (طلب قبول)';
        } else if (linkedUser.status === 'APPROVED' || linkedUser.status === 'ACTIVE') {
          accountStatus = 'ACTIVE';
          accountStatusLabel = '🟢 حساب نشط ومعتمد';
        } else if (linkedUser.status === 'SUSPENDED') {
          accountStatus = 'SUSPENDED';
          accountStatusLabel = '⏸️ حساب مجمد';
        } else if (linkedUser.status === 'DISABLED') {
          accountStatus = 'DISABLED';
          accountStatusLabel = '🔴 حساب معطل';
        } else if (linkedUser.status === 'REJECTED') {
          accountStatus = 'REJECTED';
          accountStatusLabel = '❌ حساب مرفوض';
        }
      }

      const secObj = master.sectionId ? sectionsMap[master.sectionId] : null;
      const staObj = master.stationId ? stationsMap[master.stationId] : null;
      const unitObj = master.unitId ? unitsMap[master.unitId] : null;

      const secName = master.section || (secObj ? secObj.name : (unitObj ? ('وحدة ' + unitObj.name) : 'إدارة القسم'));
      const staName = master.station || (staObj ? staObj.name : '');
      const unitName = master.unit || (unitObj ? unitObj.name : '');

      return {
        id: master.id || userId || master.employeeId,
        ...master,
        name: master.fullName || master.name || 'بدون اسم',
        fullName: master.fullName || master.name || 'بدون اسم',
        section: secName,
        sectionName: secName,
        station: staName,
        stationName: staName,
        unit: unitName,
        unitName: unitName,
        userId,
        linkedUser,
        hasAccount: !!linkedUser,
        accountStatus,
        accountStatusLabel,
        role,
        customPermissions,
        userEmail
      };
    });

    // Scope Filtering for Actor User
    if (actorUser.role === 'SUPER_ADMIN') {
      return unifiedList;
    }

    // Hide Super Admin from non-super admins
    unifiedList = unifiedList.filter(e => e.role !== 'SUPER_ADMIN' && e.employeeId !== 'EMP-0000');

    // Dept Manager or users with global access see all department records
    const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
    const hasGlobal = ['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(actorUser.role) ||
                      customPerms.includes('SCOPE_ALL_SECTIONS') ||
                      customPerms.includes('SCOPE_ALL_DOSSIERS') ||
                      customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') ||
                      customPerms.includes('DEPT_VIEW') ||
                      actorUser.hasGlobalAccess === true;
    if (hasGlobal) {
      return unifiedList;
    }

    // Scoped to Section (Responsible for Section + all Stations under this Section)
    if (actorUser.sectionId) {
      const sectionStations = (this.getDb().stations || []).filter(st => st.sectionId === actorUser.sectionId).map(st => st.id);
      return unifiedList.filter(e => 
        e.sectionId === actorUser.sectionId || 
        (e.stationId && sectionStations.includes(e.stationId)) ||
        (e.linkedUser && e.linkedUser.id === actorUser.id)
      );
    }

    // Scoped to Unit (Responsible for Unit + all its linked Stations)
    if (actorUser.unitId) {
      const unit = this.getUnitById(actorUser.unitId);
      const unitStations = (this.getDb().stations || []).filter(st => st.unitId === actorUser.unitId || (unit?.sectionId && st.sectionId === unit.sectionId)).map(st => st.id);
      return unifiedList.filter(e => 
        e.unitId === actorUser.unitId || 
        (e.stationId && unitStations.includes(e.stationId)) ||
        (e.linkedUser && e.linkedUser.id === actorUser.id)
      );
    }

    // Scoped to Station
    if (actorUser.stationId) {
      return unifiedList.filter(e => e.stationId === actorUser.stationId || (e.linkedUser && e.linkedUser.id === actorUser.id));
    }

    // Standard employee sees only themselves
    return unifiedList.filter(e => e.linkedUser && e.linkedUser.id === actorUser.id);
  }

  // --- Backward Compatibility Proxies ---
  getApprovedEmployeeIds(deptId) {
    return this.getEmployeeMasterRecords(deptId).map(r => ({
      id: r.employeeId,
      employeeId: r.employeeId,
      name: r.fullName,
      fullName: r.fullName,
      ...r
    }));
  }

  addApprovedEmployeeId(record) {
    return this.addOrUpdateEmployeeMasterRecord(record);
  }

  getUsers(deptId) {
    const users = this.getDb().users || [];
    return deptId ? users.filter(u => u.departmentId === deptId) : users;
  }

  getUserById(userId) {
    return (this.getDb().users || []).find(u => u.id === userId);
  }

  getUserByEmail(email) {
    return (this.getDb().users || []).find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserByEmployeeId(empId) {
    return (this.getDb().users || []).find(u => u.employeeId === empId);
  }

  addUser(user) {
    const db = this.getDb();
    db.users.push(user);
    this.saveDb(db);
    return user;
  }

  updateUser(userId, patch) {
    const db = this.getDb();
    const idx = db.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      db.users[idx] = { 
        ...db.users[idx], 
        ...patch, 
        updatedAt: new Date().toISOString() 
      };
      this.saveDb(db);
      return db.users[idx];
    }
    return null;
  }

  deleteUser(userId) {
    const db = this.getDb();
    db.users = (db.users || []).filter(u => u.id !== userId);
    this.saveDb(db);
  }

  // --- Scope-Aware User Management Queries ---
  getScopedUsers(actorUser) {
    if (!actorUser) return [];
    let users = this.getUsers(actorUser.departmentId);

    // Super Admin sees all
    if (actorUser.role === 'SUPER_ADMIN') {
      return users;
    }

    // Hide Super Admin from non-super admins
    users = users.filter(u => u.role !== 'SUPER_ADMIN');

    // Dept Manager or users with global access see all department users
    const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
    const hasGlobal = customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') || actorUser.hasGlobalAccess === true;
    if (actorUser.role === 'DEPT_MANAGER' || hasGlobal) {
      return users;
    }

    // Scoped to Section
    if (actorUser.sectionId) {
      return users.filter(u => u.sectionId === actorUser.sectionId || u.id === actorUser.id);
    }

    // Scoped to Unit
    if (actorUser.unitId) {
      return users.filter(u => u.unitId === actorUser.unitId || u.id === actorUser.id);
    }

    // Scoped to Station
    if (actorUser.stationId) {
      return users.filter(u => u.stationId === actorUser.stationId || u.id === actorUser.id);
    }

    // Regular employee sees only themselves
    return users.filter(u => u.id === actorUser.id);
  }

  // --- Granular Permissions & Role Assignment with Anti-Escalation ---
  updateUserRoleAndPermissions(userId, role, scopeData, customPermissions, actorUser) {
    const targetUser = this.getUserById(userId);
    if (!targetUser) return { success: false, error: 'المستخدم غير موجود.' };

    // Anti-Escalation check
    if (window.rbac && !window.rbac.canManageTargetUser(actorUser, targetUser)) {
      return { success: false, error: '⛔ غير مصرح لك بتعديل صلاحيات هذا المستخدم (تجاوز مستوى المسؤولية).' };
    }

    if (window.rbac && !window.rbac.canGrantRole(actorUser, role)) {
      return { success: false, error: '⛔ لا يمكنك منح دور أعلى أو مساوٍ لمستوى مسؤوليتك الحالية.' };
    }

    // Filter permissions: Actor can only grant permissions they themselves possess
    const validatedPerms = (customPermissions || []).filter(permKey => {
      return window.rbac ? window.rbac.canGrantPermission(actorUser, permKey) : true;
    });

    const oldRole = targetUser.role;
    const oldPerms = targetUser.customPermissions || [];

    const updates = {
      role: role,
      sectionId: scopeData.sectionId || null,
      unitId: scopeData.unitId || null,
      stationId: scopeData.stationId || null,
      customPermissions: validatedPerms,
      updatedAt: new Date().toISOString()
    };

    const updated = this.updateUser(userId, updates);

    // Audit Logging
    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'UPDATE_USER_PERMISSIONS',
      'USER_MANAGEMENT',
      `تم تعديل دور وصلاحيات المستخدم: ${targetUser.fullName} (${targetUser.employeeId}) من دور [${oldRole}] إلى [${role}] مع ${validatedPerms.length} صلاحية مخصصة.`
    );

    return { success: true, user: updated };
  }

  // --- Change Employee ID with Strict Uniqueness Check ---
  changeUserEmployeeId(userId, newEmpId, actorUser) {
    if (!newEmpId || !newEmpId.trim()) {
      return { success: false, error: 'الرقم الوظيفي مطلوب.' };
    }

    const cleanEmpId = newEmpId.trim().toUpperCase();
    const existing = this.getUserByEmployeeId(cleanEmpId);
    if (existing && existing.id !== userId) {
      return { success: false, error: `الرقم الوظيفي (${cleanEmpId}) مسجل مسبقاً لمستخدم آخر: ${existing.fullName}.` };
    }

    const targetUser = this.getUserById(userId);
    if (!targetUser) return { success: false, error: 'المستخدم غير موجود.' };

    const oldEmpId = targetUser.employeeId;
    this.updateUser(userId, { employeeId: cleanEmpId, updatedAt: new Date().toISOString() });

    // Update in approved registry if exists
    const db = this.getDb();
    if (db.approvedEmployeeIds) {
      const appIdx = db.approvedEmployeeIds.findIndex(a => a.employeeId === oldEmpId);
      if (appIdx !== -1) {
        db.approvedEmployeeIds[appIdx].employeeId = cleanEmpId;
        this.saveDb(db);
      }
    }

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'CHANGE_EMPLOYEE_ID',
      'USER_MANAGEMENT',
      `تم تغيير الرقم الوظيفي للمستخدم [${targetUser.fullName}] من (${oldEmpId}) إلى (${cleanEmpId}).`
    );

    return { success: true, employeeId: cleanEmpId };
  }

  // --- Reset Password without Plaintext Exposure ---
  resetUserPassword(userId, newPassword, actorUser) {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'كلمة المرور يجب أن تتكون من 6 أحرف أو أرقام على الأقل.' };
    }

    const targetUser = this.getUserById(userId);
    if (!targetUser) return { success: false, error: 'المستخدم غير موجود.' };

    this.updateUser(userId, { password: newPassword, updatedAt: new Date().toISOString() });

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'RESET_PASSWORD',
      'USER_MANAGEMENT',
      `تمت إعادة تعيين كلمة المرور للمستخدم [${targetUser.fullName} - ${targetUser.employeeId}] بنجاح وفق السياسة الأمنية.`
    );

    return { success: true };
  }

  // --- Toggle User Status (ACTIVE, SUSPENDED, DISABLED, REJECTED, PENDING) ---
  toggleUserStatus(userId, newStatus, actorUser) {
    const targetUser = this.getUserById(userId);
    if (!targetUser) return { success: false, error: 'المستخدم غير موجود.' };

    const oldStatus = targetUser.status;
    this.updateUser(userId, { status: newStatus, updatedAt: new Date().toISOString() });

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'CHANGE_USER_STATUS',
      'USER_MANAGEMENT',
      `تم تغيير حالة حساب المستخدم [${targetUser.fullName} - ${targetUser.employeeId}] من [${oldStatus}] إلى [${newStatus}].`
    );

    return { success: true, status: newStatus };
  }

  // --- Bulk Import Approved Employee IDs with Verification ---
  importApprovedEmployeeIds(records, actorUser) {
    const db = this.getDb();
    if (!db.approvedEmployeeIds) db.approvedEmployeeIds = [];
    if (!db.employeeMasterRecords) db.employeeMasterRecords = this.getEmployeeMasterRecords();

    let importedCount = 0;
    records.forEach(rec => {
      const cleanId = (rec.employeeId || '').trim().toUpperCase();
      if (!cleanId) return;

      const masterIdx = db.employeeMasterRecords.findIndex(r => (r.employeeId || '').trim().toUpperCase() === cleanId);
      const appIdx = db.approvedEmployeeIds.findIndex(a => (a.employeeId || a.id || '').trim().toUpperCase() === cleanId);

      const recordData = {
        employeeId: cleanId,
        fullName: rec.fullName || 'منتسب معتمد',
        name: rec.fullName || 'منتسب معتمد',
        jobTitle: rec.jobTitle || 'موظف',
        departmentId: actorUser ? (actorUser.departmentId || 'dept-south-prod') : 'dept-south-prod',
        sectionId: rec.sectionId || null,
        unitId: rec.unitId || null,
        stationId: rec.stationId || null,
        jobGrade: rec.jobGrade || 'الخامسة',
        jobStage: rec.jobStage || 'الأولى',
        degree: rec.degree || 'بكالوريوس',
        specialization: rec.specialization || 'تشغيل وإنتاج',
        workShift: rec.workShift || 'صباحي',
        updatedAt: new Date().toISOString()
      };

      if (masterIdx !== -1) {
        db.employeeMasterRecords[masterIdx] = { ...db.employeeMasterRecords[masterIdx], ...recordData };
      } else {
        recordData.createdAt = new Date().toISOString();
        recordData.dynamicValues = {};
        recordData.transferHistory = [];
        db.employeeMasterRecords.push(recordData);
        importedCount++;
      }

      if (appIdx !== -1) {
        db.approvedEmployeeIds[appIdx] = { ...db.approvedEmployeeIds[appIdx], ...recordData, id: cleanId };
      } else {
        db.approvedEmployeeIds.push({ ...recordData, id: cleanId });
      }

      // Also sync with registered user account if already created
      if (db.users && Array.isArray(db.users)) {
        const userIdx = db.users.findIndex(u => (u.employeeId || '').trim().toUpperCase() === cleanId);
        if (userIdx !== -1) {
          db.users[userIdx] = {
            ...db.users[userIdx],
            fullName: recordData.fullName,
            jobTitle: recordData.jobTitle,
            sectionId: recordData.sectionId || db.users[userIdx].sectionId,
            unitId: recordData.unitId || db.users[userIdx].unitId,
            stationId: recordData.stationId || db.users[userIdx].stationId,
            updatedAt: new Date().toISOString()
          };
        }
      }
    });

    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'IMPORT_EMPLOYEE_IDS',
        'HR_MANAGEMENT',
        `تم استيراد واعتماد ${records.length} رقم وظيفي (${importedCount} سجل جديد) في السجل المركزي المعتمد.`
      );
    }

    return { success: true, total: records.length, newCount: importedCount };
  }

  // --- Sections, Units & Stations ---
  getSections(deptId) {
    return (this.getDb().sections || []).filter(s => s.departmentId === deptId);
  }

  getSectionById(secId) {
    return (this.getDb().sections || []).find(s => s.id === secId);
  }

  addSection(sec) {
    const db = this.getDb();
    if (!db.sections) db.sections = [];
    db.sections.push(sec);
    this.saveDb(db);
    return sec;
  }

  updateSection(secId, patch) {
    const db = this.getDb();
    const idx = db.sections.findIndex(s => s.id === secId);
    if (idx !== -1) {
      db.sections[idx] = { ...db.sections[idx], ...patch };
      this.saveDb(db);
      return db.sections[idx];
    }
    return null;
  }

  getUnits(deptId) {
    const raw = (this.getDb().units || []).filter(u => !deptId || u.departmentId === deptId);
    const seen = new Set();
    const distinct = [];
    for (const u of raw) {
      const nameKey = (u.name || '').trim();
      const idKey = u.id || nameKey;
      if (!seen.has(idKey) && !seen.has(nameKey)) {
        seen.add(idKey);
        seen.add(nameKey);
        distinct.push(u);
      }
    }
    return distinct;
  }

  getUnitById(unitId) {
    return (this.getDb().units || []).find(u => u.id === unitId);
  }

  addUnit(unit) {
    const db = this.getDb();
    if (!db.units) db.units = [];
    db.units.push(unit);
    this.saveDb(db);
    return unit;
  }

  updateUnit(unitId, patch) {
    const db = this.getDb();
    const idx = db.units.findIndex(u => u.id === unitId);
    if (idx !== -1) {
      db.units[idx] = { ...db.units[idx], ...patch };
      this.saveDb(db);
      return db.units[idx];
    }
    return null;
  }

  getStations(deptId, sectionId) {
    let stations = (this.getDb().stations || []).filter(s => s.departmentId === deptId);
    if (sectionId) {
      stations = stations.filter(s => s.sectionId === sectionId);
    }
    return stations;
  }

  getStationsBySection(sectionId) {
    const list = this.getDb().stations || [];
    return sectionId ? list.filter(s => s.sectionId === sectionId) : list;
  }

  getStationById(stId) {
    return (this.getDb().stations || []).find(s => s.id === stId);
  }

  addStation(st) {
    const db = this.getDb();
    if (!db.stations) db.stations = [];
    db.stations.push(st);
    this.saveDb(db);
    return st;
  }

  updateStation(stId, patch) {
    const db = this.getDb();
    const idx = db.stations.findIndex(s => s.id === stId);
    if (idx !== -1) {
      db.stations[idx] = { ...db.stations[idx], ...patch };
      this.saveDb(db);
      return db.stations[idx];
    }
    return null;
  }

  deleteStation(stId) {
    const db = this.getDb();
    db.stations = (db.stations || []).filter(s => s.id !== stId);
    this.saveDb(db);
  }

  // --- Announcements & Notifications ---
  getAnnouncements(deptId) {
    return (this.getDb().announcements || []).filter(a => a.departmentId === deptId);
  }

  addAnnouncement(anc) {
    const db = this.getDb();
    if (!db.announcements) db.announcements = [];
    db.announcements.unshift(anc);
    this.saveDb(db);
    return anc;
  }

  deleteAnnouncement(ancId) {
    const db = this.getDb();
    db.announcements = (db.announcements || []).filter(a => a.id !== ancId);
    this.saveDb(db);
  }

  // --- Official Text Notifications (التبليغات الرسمية لإدارة القسم) ---
  getOfficialNotifications(deptId, actorUser) {
    const db = this.getDb();
    let list = db.officialNotifications || [];
    if (deptId) {
      list = list.filter(n => n.departmentId === deptId);
    }
    if (!actorUser) return list;

    // Filter by scope
    if (['DEPT_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(actorUser.role)) {
      return list;
    }

    return list.filter(n => {
      if (n.status !== 'PUBLISHED') return false;
      if (n.targetScope === 'ALL_SECTIONS' || (!n.targetSectionId && !n.targetUnitId)) return true;
      if (n.targetUnitId && actorUser.unitId === n.targetUnitId) return true;
      if (n.targetSectionId && actorUser.sectionId === n.targetSectionId) return true;
      return false;
    });
  }

  addOfficialNotification(notif, actorUser) {
    const db = this.getDb();
    if (!db.officialNotifications) db.officialNotifications = [];

    const newNotif = {
      id: 'notif-' + Date.now(),
      departmentId: actorUser.departmentId || 'dept-south-prod',
      targetScope: notif.targetScope || 'ALL_SECTIONS',
      targetSectionId: notif.targetSectionId || null,
      targetUnitId: notif.targetUnitId || null,
      targetSectionName: notif.targetSectionName || 'كافة شعب ووحدات القسم',
      title: notif.title,
      content: notif.content,
      importance: notif.importance || 'NORMAL',
      priority: notif.priority || notif.importance || 'NORMAL',
      status: notif.status || 'PUBLISHED',
      isPinned: notif.isPinned || false,
      publishDate: notif.publishDate || new Date().toISOString(),
      expiryDate: notif.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: actorUser.id,
      createdByName: actorUser.fullName
    };

    db.officialNotifications.unshift(newNotif);
    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'CREATE_OFFICIAL_NOTIFICATION',
      'DEPARTMENT_MANAGEMENT',
      `تم إصدار تبليغ رسمي جديد بعنوان [${newNotif.title}].`
    );

    return newNotif;
  }

  updateOfficialNotification(notifId, patch, actorUser) {
    const db = this.getDb();
    if (!db.officialNotifications) db.officialNotifications = [];

    const idx = db.officialNotifications.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      db.officialNotifications[idx] = { ...db.officialNotifications[idx], ...patch };
      this.saveDb(db);

      if (actorUser) {
        this.logActivity(
          actorUser.departmentId,
          actorUser.id,
          actorUser.employeeId,
          'UPDATE_OFFICIAL_NOTIFICATION',
          'DEPARTMENT_MANAGEMENT',
          `تم تعديل التبليغ الرسمي [${db.officialNotifications[idx].title}].`
        );
      }
      return db.officialNotifications[idx];
    }
    return null;
  }

  deleteOfficialNotification(notifId, actorUser) {
    const db = this.getDb();
    if (!db.officialNotifications) return;

    db.officialNotifications = db.officialNotifications.filter(n => n.id !== notifId);
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'DELETE_OFFICIAL_NOTIFICATION',
        'DEPARTMENT_MANAGEMENT',
        `تم حذف/أرشفة التبليغ الرسمي (${notifId}).`
      );
    }
  }

  getNotifications(deptId) {
    return (this.getDb().officialNotifications || []).filter(n => n.departmentId === deptId);
  }

  addNotification(notif) {
    const db = this.getDb();
    if (!db.officialNotifications) db.officialNotifications = [];
    db.officialNotifications.unshift(notif);
    this.saveDb(db);
    return notif;
  }

  // --- Section-Specific Notifications to its Stations (تبليغات مسؤول الشعبة لمحطاته فقط) ---
  getSectionNotifications(sectionId, actorUser) {
    const db = this.getDb();
    let list = db.sectionNotifications || [];
    if (sectionId) {
      list = list.filter(n => n.sectionId === sectionId);
    }
    if (!actorUser) return list;

    const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
    const hasGlobal = ['SUPER_ADMIN', 'DEPT_MANAGER'].includes(actorUser.role) ||
                      customPerms.includes('SCOPE_ALL_SECTIONS') ||
                      customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') ||
                      actorUser.hasGlobalAccess === true;

    // Strict Scope Isolation: If user belongs to a different section and has no global access, block visibility
    if (!hasGlobal && actorUser.sectionId && sectionId && actorUser.sectionId !== sectionId) {
      return [];
    }

    // Managers and Admins see all notifications in this section
    if (['DEPT_MANAGER', 'SUPER_ADMIN', 'ADMINISTRATOR'].includes(actorUser.role)) {
      return list;
    }

    // Section Manager sees all notifications in their own section
    if (actorUser.role === 'SECTION_MANAGER' && (!actorUser.sectionId || actorUser.sectionId === sectionId || hasGlobal)) {
      return list;
    }

    // Unit managers / station operators see notifications targeted to ALL or to their specific station
    return list.filter(n => {
      if (n.status !== 'PUBLISHED') return false;
      if (n.targetStationId === 'ALL' || !n.targetStationId) return true;
      return n.targetStationId === actorUser.stationId;
    });
  }

  addSectionNotification(notif, actorUser) {
    const db = this.getDb();
    if (!db.sectionNotifications) db.sectionNotifications = [];

    const newNotif = {
      id: 'sec-notif-' + Date.now(),
      sectionId: notif.sectionId || (actorUser ? actorUser.sectionId : 'sec-1'),
      departmentId: (actorUser && actorUser.departmentId) ? actorUser.departmentId : 'dept-south-prod',
      targetStationId: notif.targetStationId || 'ALL',
      targetStationName: notif.targetStationName || 'كافة محطات الشعبة',
      title: notif.title,
      content: notif.content,
      priority: notif.priority || 'NORMAL',
      status: notif.status || 'PUBLISHED',
      publishDate: notif.publishDate || new Date().toISOString(),
      createdBy: actorUser ? actorUser.id : 'user-sec-mgr',
      createdByName: actorUser ? actorUser.fullName : 'مسؤول الشعبة',
      createdByRole: actorUser ? actorUser.role : 'SECTION_MANAGER'
    };

    db.sectionNotifications.unshift(newNotif);
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'CREATE_SECTION_NOTIFICATION',
        'SECTION_WORKSPACE',
        `أصدر مسؤول الشعبة تبليغاً لمحطاته بعنوان [${newNotif.title}].`
      );
    }

    return newNotif;
  }

  deleteSectionNotification(notifId, actorUser) {
    const db = this.getDb();
    if (!db.sectionNotifications) return;

    db.sectionNotifications = db.sectionNotifications.filter(n => n.id !== notifId);
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'DELETE_SECTION_NOTIFICATION',
        'SECTION_WORKSPACE',
        `تم حذف تبليغ الشعبة (${notifId}).`
      );
    }
  }

  // --- Documents & Vehicles ---
  getDocuments(deptId) {
    return (this.getDb().documents || []).filter(d => d.departmentId === deptId);
  }

  addDocument(doc) {
    const db = this.getDb();
    if (!db.documents) db.documents = [];
    db.documents.unshift(doc);
    this.saveDb(db);
    return doc;
  }

  updateDocument(docId, patch) {
    const db = this.getDb();
    const idx = db.documents.findIndex(d => d.id === docId);
    if (idx !== -1) {
      db.documents[idx] = { ...db.documents[idx], ...patch, updatedAt: new Date().toISOString() };
      this.saveDb(db);
      return db.documents[idx];
    }
    return null;
  }

  deleteDocument(docId) {
    const db = this.getDb();
    db.documents = (db.documents || []).filter(d => d.id !== docId);
    this.saveDb(db);
  }

  getVehicleMovements(deptId) {
    return (this.getDb().vehicleMovements || []).filter(v => v.departmentId === deptId);
  }

  addVehicleMovement(vm) {
    const db = this.getDb();
    if (!db.vehicleMovements) db.vehicleMovements = [];
    db.vehicleMovements.unshift(vm);
    this.saveDb(db);
    return vm;
  }

  updateVehicleMovement(vmId, patch) {
    const db = this.getDb();
    const idx = db.vehicleMovements.findIndex(v => v.id === vmId);
    if (idx !== -1) {
      db.vehicleMovements[idx] = { ...db.vehicleMovements[idx], ...patch };
      this.saveDb(db);
      return db.vehicleMovements[idx];
    }
    return null;
  }

  // --- Dynamic Requests & Data Change Logs ---
  addRequest(req) {
    const db = this.getDb();
    if (!db.requests) db.requests = [];
    db.requests.unshift(req);
    this.saveDb(db);
    return req;
  }

  updateRequest(reqId, updates) {
    const db = this.getDb();
    const req = (db.requests || []).find(r => r.id === reqId);
    if (req) {
      Object.assign(req, updates);
      this.saveDb(db);
    }
    return req;
  }

  addDataChangeLog(log) {
    const db = this.getDb();
    if (!db.dataChangeLogs) db.dataChangeLogs = [];
    db.dataChangeLogs.unshift(log);
    this.saveDb(db);
    return log;
  }

  // --- Audit Logs ---
  getAuditLogs(deptId) {
    const logs = this.getDb().auditLogs || [];
    return deptId ? logs.filter(l => l.departmentId === deptId) : logs;
  }

  getActivityLogs(deptId) {
    return this.getAuditLogs(deptId);
  }

  logActivity(deptId, userId, employeeId, action, entity, details, result = 'SUCCESS') {
    const db = this.getDb();
    if (!db.auditLogs) db.auditLogs = [];
    const log = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      departmentId: deptId,
      userId,
      employeeId,
      action,
      entity,
      details,
      ipAddress: '127.0.0.1',
      result,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(log);
    this.saveDb(db);
    return log;
  }

  // --- Department Interview Requests (طلبات المقابلة) ---
  getInterviewRequests(deptId, actorUser) {
    const db = this.getDb();
    let list = db.interviewRequests || [];
    if (deptId) {
      list = list.filter(r => r.departmentId === deptId);
    }
    if (!actorUser) return list;

    // Filter by role & scope
    if (['DEPT_MANAGER', 'SUPER_ADMIN'].includes(actorUser.role)) {
      return list;
    } else if (actorUser.role === 'SECTION_MANAGER') {
      const sec = this.getSectionById(actorUser.sectionId);
      const secName = sec ? sec.name : '';
      return list.filter(r => r.userId === actorUser.id || (secName && r.applicantSection === secName));
    } else {
      return list.filter(r => r.userId === actorUser.id);
    }
  }

  addInterviewRequest(reqData, actorUser) {
    const db = this.getDb();
    if (!db.interviewRequests) db.interviewRequests = [];

    const newReq = {
      id: 'ir-' + Date.now(),
      departmentId: actorUser.departmentId || 'dept-south-prod',
      userId: actorUser.id,
      applicantName: actorUser.fullName,
      applicantEmployeeId: actorUser.employeeId,
      applicantSection: reqData.applicantSection || 'إدارة القسم',
      topic: reqData.topic,
      details: reqData.details || '',
      priority: reqData.priority || 'NORMAL',
      proposedDate: reqData.proposedDate || new Date().toISOString().split('T')[0],
      status: 'NEW',
      notes: '',
      reviewedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.interviewRequests.unshift(newReq);
    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'CREATE_INTERVIEW_REQUEST',
      'DEPARTMENT_MANAGEMENT',
      `تم تقديم طلب مقابلة جديد بعنوان: [${newReq.topic}].`
    );

    return { success: true, request: newReq };
  }

  updateInterviewRequest(reqId, patch, actorUser) {
    const db = this.getDb();
    if (!db.interviewRequests) db.interviewRequests = [];

    const idx = db.interviewRequests.findIndex(r => r.id === reqId);
    if (idx === -1) return { success: false, error: 'الطلب غير موجود.' };

    const old = db.interviewRequests[idx];
    const updated = {
      ...old,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    if (actorUser) {
      updated.reviewedBy = actorUser.fullName;
    }

    db.interviewRequests[idx] = updated;
    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'UPDATE_INTERVIEW_REQUEST',
      'DEPARTMENT_MANAGEMENT',
      `تم تحديث طلب المقابلة (${reqId}) للموظف [${updated.applicantName}] إلى حالة [${updated.status}].`
    );

    return { success: true, request: updated };
  }

  deleteInterviewRequest(reqId, actorUser) {
    const db = this.getDb();
    if (!db.interviewRequests) return { success: false };

    db.interviewRequests = db.interviewRequests.filter(r => r.id !== reqId);
    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'DELETE_INTERVIEW_REQUEST',
      'DEPARTMENT_MANAGEMENT',
      `تم حذف طلب المقابلة (${reqId}).`
    );

    return { success: true };
  }

  // ==========================================================================
  // --- منظومة حركة العجلات والسيارات المتكاملة (Vehicles & Movement Management) ---
  // ==========================================================================
  getVehicles(deptId, filterScope = {}, actorUser = null) {
    const db = this.getDb();
    let list = db.vehicles || [];

    if (deptId) {
      list = list.filter(v => !v.departmentId || v.departmentId === deptId);
    }

    if (actorUser) {
      if (['SECTION_MANAGER'].includes(actorUser.role) && actorUser.sectionId) {
        list = list.filter(v => v.sectionId === actorUser.sectionId);
      } else if (['STATION_MANAGER'].includes(actorUser.role) && actorUser.stationId) {
        list = list.filter(v => v.stationId === actorUser.stationId || (v.sectionId === actorUser.sectionId && v.affiliationType === 'SECTION_MGMT'));
      }
    }

    if (filterScope.affiliationType && filterScope.affiliationType !== 'ALL') {
      list = list.filter(v => v.affiliationType === filterScope.affiliationType);
    }
    if (filterScope.sectionId && filterScope.sectionId !== 'ALL') {
      list = list.filter(v => v.sectionId === filterScope.sectionId);
    }
    if (filterScope.stationId && filterScope.stationId !== 'ALL') {
      list = list.filter(v => v.stationId === filterScope.stationId);
    }
    if (filterScope.operationalState && filterScope.operationalState !== 'ALL') {
      list = list.filter(v => v.operationalState === filterScope.operationalState);
    }

    return list;
  }

  getVehicleById(vehicleId) {
    const db = this.getDb();
    return (db.vehicles || []).find(v => v.id === vehicleId) || null;
  }

  addVehicle(vehicleData, actorUser) {
    const db = this.getDb();
    if (!db.vehicles) db.vehicles = [];

    const section = vehicleData.sectionId ? this.getSectionById(vehicleData.sectionId) : null;
    const station = (vehicleData.affiliationType === 'STATION' && vehicleData.stationId) ? this.getStationById(vehicleData.stationId) : null;

    const isGov = vehicleData.ownershipType === 'GOVERNMENT';
    if (isGov && !vehicleData.sideNumber) {
      return { success: false, error: 'الرقم الجانبي إجباري للسيارات ذات الصفة الحكومية.' };
    }

    const newVehicle = {
      id: 'veh-' + Date.now(),
      departmentId: actorUser.departmentId || 'dept-south-prod',
      vehicleType: vehicleData.vehicleType || 'بيك آب',
      ownershipType: vehicleData.ownershipType || 'GOVERNMENT', // GOVERNMENT / RENTAL
      sideNumber: vehicleData.sideNumber ? String(vehicleData.sideNumber).trim() : null,
      vehicleNumber: vehicleData.vehicleNumber ? String(vehicleData.vehicleNumber).trim() : '—',
      affiliationType: vehicleData.affiliationType || 'DEPT_MGMT', // DEPT_MGMT / SECTION_MGMT / STATION
      sectionId: vehicleData.affiliationType !== 'DEPT_MGMT' ? vehicleData.sectionId : null,
      sectionName: vehicleData.affiliationType !== 'DEPT_MGMT' ? (section ? section.name : 'إدارة الشعبة') : 'إدارة القسم',
      stationId: vehicleData.affiliationType === 'STATION' ? vehicleData.stationId : null,
      stationName: vehicleData.affiliationType === 'STATION' ? (station ? station.name : null) : null,
      driverName: vehicleData.affiliationType !== 'STATION' ? (vehicleData.driverName || 'غير محدد') : null,
      driverPhone: vehicleData.driverPhone || '',
      shiftDrivers: vehicleData.affiliationType === 'STATION' ? {
        shiftA: vehicleData.shiftDrivers?.shiftA || null,
        shiftB: vehicleData.shiftDrivers?.shiftB || null,
        shiftC: vehicleData.shiftDrivers?.shiftC || null,
        shiftD: vehicleData.shiftDrivers?.shiftD || null
      } : null,
      operationalState: vehicleData.operationalState || 'OPERATIONAL', // OPERATIONAL / IN_REPAIR / STOPPED
      movementState: 'AVAILABLE', // AVAILABLE / IN_TRANSIT
      createdAt: new Date().toISOString(),
      createdById: actorUser.id,
      createdByName: actorUser.fullName
    };

    db.vehicles.unshift(newVehicle);
    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'ADD_VEHICLE',
      'VEHICLE_FLEET',
      `تمت إضافة سيارة جديدة [${newVehicle.vehicleType} - ${newVehicle.vehicleNumber}] بالرقم الجانبي [${newVehicle.sideNumber || '—'}].`
    );

    return { success: true, vehicle: newVehicle };
  }

  updateVehicle(vehicleId, patch, actorUser) {
    const db = this.getDb();
    if (!db.vehicles) db.vehicles = [];

    const idx = db.vehicles.findIndex(v => v.id === vehicleId);
    if (idx === -1) return { success: false, error: 'السيارة غير موجودة في سجل السيارات.' };

    const old = db.vehicles[idx];
    const section = patch.sectionId ? this.getSectionById(patch.sectionId) : (old.sectionId ? this.getSectionById(old.sectionId) : null);
    const station = patch.stationId ? this.getStationById(patch.stationId) : (old.stationId ? this.getStationById(old.stationId) : null);

    const updated = {
      ...old,
      ...patch,
      sectionName: (patch.affiliationType === 'DEPT_MGMT' || old.affiliationType === 'DEPT_MGMT') ? 'إدارة القسم' : (section ? section.name : old.sectionName),
      stationName: (patch.affiliationType === 'STATION' || old.affiliationType === 'STATION') ? (station ? station.name : old.stationName) : null,
      updatedAt: new Date().toISOString(),
      updatedById: actorUser.id,
      updatedByName: actorUser.fullName
    };

    db.vehicles[idx] = updated;
    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'UPDATE_VEHICLE',
      'VEHICLE_FLEET',
      `تم تحديث بيانات السيارة [${updated.vehicleType} - ${updated.vehicleNumber}].`
    );

    return { success: true, vehicle: updated };
  }

  deleteVehicle(vehicleId, actorUser) {
    const db = this.getDb();
    if (!db.vehicles) return { success: false };

    const v = db.vehicles.find(item => item.id === vehicleId);
    db.vehicles = db.vehicles.filter(item => item.id !== vehicleId);
    this.saveDb(db);

    if (actorUser && v) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'DELETE_VEHICLE',
        'VEHICLE_FLEET',
        `تم حذف السيارة [${v.vehicleType} - ${v.vehicleNumber}] من سجل السيارات.`
      );
    }

    return { success: true };
  }

  // --- Vehicle Movements Management (حركة السيارات) ---
  getVehicleMovements(deptId, filterScope = {}, actorUser = null) {
    const db = this.getDb();
    let list = db.vehicleMovements || [];

    if (deptId) {
      list = list.filter(m => !m.departmentId || m.departmentId === deptId);
    }

    if (actorUser) {
      if (['SECTION_MANAGER'].includes(actorUser.role) && actorUser.sectionId) {
        list = list.filter(m => m.sectionId === actorUser.sectionId);
      } else if (['STATION_MANAGER'].includes(actorUser.role) && actorUser.stationId) {
        list = list.filter(m => m.stationId === actorUser.stationId || (m.sectionId === actorUser.sectionId && m.affiliationType === 'SECTION_MGMT'));
      }
    }

    if (filterScope.status && filterScope.status !== 'ALL') {
      list = list.filter(m => m.status === filterScope.status);
    }
    if (filterScope.sectionId && filterScope.sectionId !== 'ALL') {
      list = list.filter(m => m.sectionId === filterScope.sectionId);
    }
    if (filterScope.stationId && filterScope.stationId !== 'ALL') {
      list = list.filter(m => m.stationId === filterScope.stationId);
    }
    if (filterScope.affiliationType && filterScope.affiliationType !== 'ALL') {
      list = list.filter(m => m.affiliationType === filterScope.affiliationType);
    }

    return list;
  }

  getVehicleMovementById(movementId) {
    const db = this.getDb();
    return (db.vehicleMovements || []).find(m => m.id === movementId) || null;
  }

  startVehicleMovement(movementData, actorUser) {
    const db = this.getDb();
    if (!db.vehicles) db.vehicles = [];
    if (!db.vehicleMovements) db.vehicleMovements = [];

    const vehicle = db.vehicles.find(v => v.id === movementData.vehicleId);
    if (!vehicle) {
      return { success: false, error: 'السيارة المحددة غير موجودة في سجل السيارات.' };
    }

    // Validation: Operational State
    if (vehicle.operationalState === 'IN_REPAIR' || vehicle.operationalState === 'في التصليح' || vehicle.operationalState === 'STOPPED' || vehicle.operationalState === 'متوقفة') {
      return { success: false, error: 'لا يمكن بدء حركة لسيارة حالتها (في التصليح) أو (متوقفة).' };
    }

    // Validation: Double Movement Prevention
    if (vehicle.movementState === 'IN_TRANSIT') {
      return { success: false, error: 'السيارة حالياً في حركة جارية بالفعل. يجب إنهاء الحركة السابقة أولاً.' };
    }

    // Driver & Shift Resolution
    let driverName = '';
    let driverPhone = '';
    let activeShift = '';

    if (vehicle.affiliationType === 'STATION') {
      const shiftInfo = this.getCurrentShiftInfo();
      activeShift = shiftInfo.currentShift; // 'A', 'B', 'C', or 'D'

      const assignedShiftDriver = vehicle.shiftDrivers ? vehicle.shiftDrivers['shift' + activeShift] : null;

      if (!assignedShiftDriver || !assignedShiftDriver.driverName || !assignedShiftDriver.driverName.trim()) {
        return {
          success: false,
          error: `لا يوجد سائق مخصص لهذه السيارة في النوبة الحالية (النوبة ${activeShift}). يمنع بدء الحركة.`
        };
      }

      driverName = assignedShiftDriver.driverName.trim();
      driverPhone = assignedShiftDriver.phone || '';
    } else {
      driverName = vehicle.driverName || 'سائق غير محدد';
      driverPhone = vehicle.driverPhone || '';
      activeShift = 'نهاري';
    }

    const newMovement = {
      id: 'vm-' + Date.now(),
      departmentId: actorUser.departmentId || 'dept-south-prod',
      vehicleId: vehicle.id,
      vehicleType: vehicle.vehicleType,
      ownershipType: vehicle.ownershipType,
      vehicleNumber: vehicle.vehicleNumber,
      sideNumber: vehicle.sideNumber,
      affiliationType: vehicle.affiliationType,
      sectionId: vehicle.sectionId,
      sectionName: vehicle.sectionName,
      stationId: vehicle.stationId,
      stationName: vehicle.stationName,
      driverName,
      driverPhone,
      shift: activeShift,
      purpose: movementData.purpose ? String(movementData.purpose).trim() : 'مهمة عمل ميدانية',
      departureTime: new Date().toISOString(),
      returnTime: null,
      status: 'IN_TRANSIT',
      createdById: actorUser.id,
      createdByName: actorUser.fullName
    };

    // Update vehicle movement state
    vehicle.movementState = 'IN_TRANSIT';

    db.vehicleMovements.unshift(newMovement);
    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'START_VEHICLE_MOVEMENT',
      'VEHICLE_MOVEMENT',
      `تم بدء حركة للسيارة [${vehicle.vehicleType} - ${vehicle.vehicleNumber}] برقم جانبي [${vehicle.sideNumber || '—'}] وبقيادة [${driverName}].`
    );

    return { success: true, movement: newMovement };
  }

  endVehicleMovement(movementId, actorUser) {
    const db = this.getDb();
    if (!db.vehicleMovements) db.vehicleMovements = [];
    if (!db.vehicles) db.vehicles = [];

    const movement = db.vehicleMovements.find(m => m.id === movementId);
    if (!movement) {
      return { success: false, error: 'سجل الحركة غير موجود.' };
    }

    if (movement.status === 'COMPLETED') {
      return { success: false, error: 'تم إنهاء هذه الحركة مسبقاً.' };
    }

    movement.returnTime = new Date().toISOString();
    movement.status = 'COMPLETED';
    movement.completedById = actorUser.id;
    movement.completedByName = actorUser.fullName;

    // Free the vehicle state
    const vehicle = db.vehicles.find(v => v.id === movement.vehicleId);
    if (vehicle) {
      vehicle.movementState = 'AVAILABLE';
    }

    this.saveDb(db);

    this.logActivity(
      actorUser.departmentId,
      actorUser.id,
      actorUser.employeeId,
      'END_VEHICLE_MOVEMENT',
      'VEHICLE_MOVEMENT',
      `تم إنهاء حركة السيارة [${movement.vehicleType} - ${movement.vehicleNumber}] بنجاح.`
    );

    return { success: true, movement };
  }

  // --- Department Vehicle Management (Aliases for backward compatibility) ---
  getDepartmentVehicles(deptId) {
    return this.getVehicles(deptId, { affiliationType: 'DEPT_MGMT' });
  }

  addDepartmentVehicle(vehicleData, actorUser) {
    return this.addVehicle({ ...vehicleData, affiliationType: 'DEPT_MGMT' }, actorUser);
  }

  updateDepartmentVehicle(vehicleId, patch, actorUser) {
    return this.updateVehicle(vehicleId, patch, actorUser);
  }

  deleteDepartmentVehicle(vehicleId, actorUser) {
    return this.deleteVehicle(vehicleId, actorUser);
  }


  // ==========================================================================
  // --- Unified Technical Status Management (الموقف الفني الموحد للشعب والرئيسية) ---
  // ==========================================================================
  getTechnicalStatuses(deptId, filterScope = {}, actorUser = null) {
    const db = this.getDb();
    let list = db.technicalStatusReports || [];
    if (deptId) {
      list = list.filter(ts => ts.departmentId === deptId);
    }

    // Apply Filter Scope (sectionId, stationId, status, date)
    if (filterScope.sectionId) {
      list = list.filter(ts => ts.sectionId === filterScope.sectionId);
    }
    if (filterScope.stationId) {
      list = list.filter(ts => ts.stationId === filterScope.stationId);
    }
    if (filterScope.status && filterScope.status !== 'ALL') {
      list = list.filter(ts => ts.status === filterScope.status || ts.operationalStatus === filterScope.status);
    }
    if (filterScope.isArchived !== undefined) {
      list = list.filter(ts => !!ts.isArchived === !!filterScope.isArchived);
    }

    // Apply RBAC Role Scoping if actorUser provided
    if (actorUser && actorUser.role !== 'SUPER_ADMIN' && actorUser.role !== 'DEPT_MANAGER') {
      const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
      const hasGlobal = customPerms.includes('SCOPE_ALL_SECTIONS') || actorUser.hasGlobalAccess === true;
      if (!hasGlobal) {
        if (actorUser.role === 'SECTION_MANAGER' && actorUser.sectionId) {
          list = list.filter(ts => ts.sectionId === actorUser.sectionId);
        } else if (actorUser.role === 'STATION_MANAGER' && actorUser.stationId) {
          list = list.filter(ts => ts.stationId === actorUser.stationId || (ts.sectionId === actorUser.sectionId && !ts.stationId));
        } else if (actorUser.role === 'UNIT_MANAGER' && actorUser.unitId) {
          if (actorUser.sectionId) list = list.filter(ts => ts.sectionId === actorUser.sectionId);
        } else if (actorUser.role === 'EMPLOYEE') {
          if (actorUser.sectionId) {
            list = list.filter(ts => ts.sectionId === actorUser.sectionId && ts.isPublished !== false);
          } else {
            list = list.filter(ts => ts.isPublished !== false);
          }
        }
      }
    }

    // Sort by latest date first
    return list.sort((a, b) => new Date(b.updatedAt || b.createdAt || b.recordDate) - new Date(a.updatedAt || a.createdAt || a.recordDate));
  }

  getLatestTechnicalStatusBySection(deptId, actorUser = null) {
    const sections = this.getSections(deptId);
    const allStatuses = this.getTechnicalStatuses(deptId, { isArchived: false }, actorUser);

    return sections.map(sec => {
      const secStatuses = allStatuses.filter(s => s.sectionId === sec.id);
      const latest = secStatuses.length > 0 ? secStatuses[0] : null;
      return {
        section: sec,
        latestStatus: latest,
        hasStatus: !!latest,
        statusesCount: secStatuses.length
      };
    });
  }

  getTechnicalStatusById(statusId) {
    const db = this.getDb();
    return (db.technicalStatusReports || []).find(ts => ts.id === statusId);
  }

  addTechnicalStatus(data, actorUser) {
    const db = this.getDb();
    if (!db.technicalStatusReports) db.technicalStatusReports = [];

    const sec = this.getSectionById(data.sectionId);
    const station = data.stationId ? this.getStationById(data.stationId) : null;

    let opStatus = data.status || data.operationalStatus || 'OPERATIONAL';
    let label = '🟢 مستقرة';
    if (opStatus === 'PARTIAL') label = '🟡 قيد المتابعة';
    if (opStatus === 'STOPPED') label = '🔴 حرجة / متوقفة';

    const newRecord = {
      id: 'ts-' + Date.now(),
      departmentId: actorUser ? (actorUser.departmentId || 'dept-south-prod') : 'dept-south-prod',
      sectionId: data.sectionId,
      sectionName: sec ? sec.name : (data.sectionName || 'الشعبة'),
      stationId: data.stationId || null,
      stationName: station ? station.name : (data.stationName || (data.stationId ? 'محطة تابعة' : '—')),
      recordDate: data.recordDate || new Date().toISOString().split('T')[0],
      description: data.description || '',
      status: opStatus,
      operationalStatus: opStatus,
      statusLabel: label,
      notes: data.notes || '',
      actionsTaken: data.actionsTaken || '',
      priority: data.priority || (opStatus === 'STOPPED' ? 'URGENT' : opStatus === 'PARTIAL' ? 'HIGH' : 'NORMAL'),
      equipmentTopic: data.equipmentTopic || (station ? station.name : (sec ? sec.name : 'موقف فني عام')),
      handlingStatus: data.handlingStatus || (opStatus === 'OPERATIONAL' ? 'COMPLETED' : 'IN_PROGRESS'),
      extraFields: data.extraFields || {},
      isPublished: data.isPublished !== false,
      isArchived: false,
      createdById: actorUser ? actorUser.id : 'system',
      createdByName: actorUser ? actorUser.fullName : 'مسؤول الموقع',
      createdByEmployeeId: actorUser ? actorUser.employeeId : 'EMP-0000',
      createdByRole: actorUser ? (actorUser.role === 'STATION_MANAGER' ? 'مسؤول الموقع' : actorUser.jobTitle || actorUser.role) : 'مسؤول الموقع',
      createdAt: new Date().toISOString(),
      updatedById: actorUser ? actorUser.id : 'system',
      updatedByName: actorUser ? actorUser.fullName : 'مسؤول الموقع',
      updatedAt: new Date().toISOString(),
      history: [
        {
          action: 'CREATE',
          userId: actorUser ? actorUser.id : 'system',
          userName: actorUser ? actorUser.fullName : 'مسؤول الموقع',
          userRole: actorUser ? (actorUser.role === 'STATION_MANAGER' ? 'مسؤول الموقع' : actorUser.jobTitle) : 'مسؤول الموقع',
          timestamp: new Date().toISOString(),
          details: `تسجيل الموقف الفني الأولي بحالة [${label}] لشعبة [${sec ? sec.name : ''}] - موقع [${station ? station.name : 'عام'}].`
        }
      ]
    };

    db.technicalStatusReports.unshift(newRecord);
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'ADD_TECHNICAL_STATUS',
        'TECHNICAL_STATUS',
        `تم تسجيل موقف فني جديد للشعبة [${newRecord.sectionName}] - الموقع [${newRecord.stationName}] بحالة [${newRecord.statusLabel}].`
      );
    }

    return { success: true, technicalStatus: newRecord };
  }

  updateTechnicalStatus(statusId, patch, actorUser) {
    const db = this.getDb();
    if (!db.technicalStatusReports) db.technicalStatusReports = [];

    const idx = db.technicalStatusReports.findIndex(ts => ts.id === statusId);
    if (idx === -1) return { success: false, error: 'سجل الموقف الفني غير موجود.' };

    const old = db.technicalStatusReports[idx];
    
    let opStatus = patch.status || patch.operationalStatus || old.status || 'OPERATIONAL';
    let label = '🟢 مستقرة';
    if (opStatus === 'PARTIAL') label = '🟡 قيد المتابعة';
    if (opStatus === 'STOPPED') label = '🔴 حرجة / متوقفة';

    const station = patch.stationId ? this.getStationById(patch.stationId) : (old.stationId ? this.getStationById(old.stationId) : null);
    const sec = patch.sectionId ? this.getSectionById(patch.sectionId) : this.getSectionById(old.sectionId);

    const history = Array.isArray(old.history) ? [...old.history] : [];
    history.push({
      action: 'UPDATE',
      userId: actorUser ? actorUser.id : 'system',
      userName: actorUser ? actorUser.fullName : 'مسؤول الموقع',
      userRole: actorUser ? (actorUser.role === 'STATION_MANAGER' ? 'مسؤول الموقع' : actorUser.jobTitle) : 'مسؤول الموقع',
      timestamp: new Date().toISOString(),
      details: `تحديث بيانات الموقف الفني وتغيير الحالة إلى [${label}].`
    });

    const updated = {
      ...old,
      ...patch,
      status: opStatus,
      operationalStatus: opStatus,
      statusLabel: label,
      sectionName: sec ? sec.name : old.sectionName,
      stationName: station ? station.name : (patch.stationName || old.stationName),
      updatedById: actorUser ? actorUser.id : old.updatedById,
      updatedByName: actorUser ? actorUser.fullName : old.updatedByName,
      updatedAt: new Date().toISOString(),
      history
    };

    db.technicalStatusReports[idx] = updated;
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'UPDATE_TECHNICAL_STATUS',
        'TECHNICAL_STATUS',
        `تم تعديل الموقف الفني (${statusId}) لشعبة [${updated.sectionName}] - موقع [${updated.stationName}].`
      );
    }

    return { success: true, technicalStatus: updated };
  }

  deleteTechnicalStatus(statusId, actorUser) {
    const db = this.getDb();
    if (!db.technicalStatusReports) return { success: false };

    const item = db.technicalStatusReports.find(ts => ts.id === statusId);
    if (!item) return { success: false, error: 'السجل غير موجود.' };

    db.technicalStatusReports = db.technicalStatusReports.filter(ts => ts.id !== statusId);
    this.saveDb(db);

    if (actorUser) {
      this.logActivity(
        actorUser.departmentId,
        actorUser.id,
        actorUser.employeeId,
        'DELETE_TECHNICAL_STATUS',
        'TECHNICAL_STATUS',
        `تم حذف الموقف الفني (${statusId}) لشعبة [${item.sectionName}] - موقع [${item.stationName}].`
      );
    }

    return { success: true };
  }

  publishTechnicalStatus(statusId, isPublished, actorUser) {
    return this.updateTechnicalStatus(statusId, { isPublished }, actorUser);
  }

  archiveTechnicalStatus(statusId, isArchived, actorUser) {
    return this.updateTechnicalStatus(statusId, { isArchived }, actorUser);
  }

  // Backward-compatibility proxy for getTechnicalStatusReports
  getTechnicalStatusReports(deptId, sectionId) {
    return this.getTechnicalStatuses(deptId, { sectionId });
  }
}

const store = new StoreManager();
window.store = store;
