/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - مصفوفة الصلاحيات المطورة ونظام RBAC المتقدم
   Hierarchical Role, Scope & Granular Permission Groups Architecture
   المستخدم → الدور → النطاق → مجموعة الصلاحيات → الصلاحيات الفرعية
   ========================================================================== */

const ROLES = {
  SUPER_ADMIN: {
    key: 'SUPER_ADMIN',
    name: 'المؤسس / Super Admin',
    level: 100,
    badgeClass: 'badge-founder',
    desc: 'صلاحيات مطلقة ومستقلة على مستوى النظام والمؤسسة'
  },
  DEPT_MANAGER: {
    key: 'DEPT_MANAGER',
    name: 'مدير قسم',
    level: 90,
    badgeClass: 'badge-primary',
    desc: 'أعلى سلطة تشغيلية داخل القسم، مسؤول عن إدارة المستخدمين ومنح الصلاحيات'
  },
  DEPUTY_DEPT_MANAGER: {
    key: 'DEPUTY_DEPT_MANAGER',
    name: 'وكيل مدير قسم',
    level: 80,
    badgeClass: 'badge-primary',
    desc: 'ينوب عن مدير القسم في ممارسة الصلاحيات الإدارية والتشغيلية ومتابعة الشُعب'
  },
  ADMIN_MANAGER: {
    key: 'ADMIN_MANAGER',
    name: 'مدير إدارة',
    level: 75,
    badgeClass: 'badge-secondary',
    desc: 'إدارة العمليات الإدارية، المذكرات الرسمية، شؤون الكوادر والمتابعة المركزية'
  },
  SECTION_MANAGER: {
    key: 'SECTION_MANAGER',
    name: 'مسؤول شعبة',
    level: 65,
    badgeClass: 'badge-secondary',
    desc: 'المسؤولية الإدارية والتشغيلية عن الشعبة المحددة وكوادرها ومحطاتها'
  },
  DEPUTY_SECTION_MANAGER: {
    key: 'DEPUTY_SECTION_MANAGER',
    name: 'وكيل مسؤول شعبة',
    level: 60,
    badgeClass: 'badge-secondary',
    desc: 'ينوب عن مسؤول الشعبة في تسيير أعمال ومتابعة محطات وكادر الشعبة'
  },
  UNIT_MANAGER: {
    key: 'UNIT_MANAGER',
    name: 'مسؤول وحدة',
    level: 55,
    badgeClass: 'badge-info',
    desc: 'المسؤولية عن الوحدة الفنية أو الإدارية التابعة'
  },
  STATION_MANAGER: {
    key: 'STATION_MANAGER',
    name: 'مسؤول موقع',
    level: 50,
    badgeClass: 'badge-warning',
    desc: 'المسؤولية الميدانية عن المحطة الإنتاجية أو الموقع المخصص'
  },
  DEPUTY_STATION_MANAGER: {
    key: 'DEPUTY_STATION_MANAGER',
    name: 'وكيل مسؤول موقع',
    level: 45,
    badgeClass: 'badge-warning',
    desc: 'ينوب عن مسؤول الموقع في إدارة العمليات الميدانية وجداول التشغيل'
  },
  STATION_SUPERVISOR: {
    key: 'STATION_SUPERVISOR',
    name: 'مشرف محطة',
    level: 40,
    badgeClass: 'badge-warning',
    desc: 'الإشراف التشغيلي والميداني على المحطة والكوادر الفنية'
  },
  ADMINISTRATOR: {
    key: 'ADMINISTRATOR',
    name: 'إداري مخول',
    level: 35,
    badgeClass: 'badge-secondary',
    desc: 'صلاحيات إدارية محددة يمنحها له المسؤول الأعلى'
  },
  SHIFT_ENGINEER: {
    key: 'SHIFT_ENGINEER',
    name: 'مهندس مناوب',
    level: 30,
    badgeClass: 'badge-primary',
    desc: 'المتابعة الهندسية والتشغيلية أثناء نوبة العمل والمناوبة'
  },
  SHIFT_SUPERVISOR: {
    key: 'SHIFT_SUPERVISOR',
    name: 'مشرف نوبة',
    level: 25,
    badgeClass: 'badge-info',
    desc: 'الإشراف على مناوبة العمل وحركة الكوادر الميدانية'
  },
  OPERATOR: {
    key: 'OPERATOR',
    name: 'مشغل',
    level: 20,
    badgeClass: 'badge-info',
    desc: 'مشغل موقع أو محطة إنتاجية، متابعة العمليات التشغيلية الميدانية وتسجيل القراءات اليومية'
  },
  AUTHORIZED_DRIVER: {
    key: 'AUTHORIZED_DRIVER',
    name: 'سائق مخول',
    level: 22,
    badgeClass: 'badge-primary',
    desc: 'سائق مخول رسمياً بإدارة وتوثيق حركة الآليات وبدء وإنهاء المهام الميدانية'
  },
  DRIVER: {
    key: 'DRIVER',
    name: 'سائق',
    level: 15,
    badgeClass: 'badge-info',
    desc: 'سائق آلية أو مركبة، متابعة المهام الميدانية والتبليغات الرسمية'
  }
};

// ==========================================================================
// مجموعات الصلاحيات المنظمة (Organized Permission Groups Architecture)
// ==========================================================================
const PERMISSION_GROUPS = [
  {
    id: 'group_files',
    name: 'إدارة الملفات',
    icon: '📄',
    desc: 'المجموعة المركزية والشاملة لإدارة الوثائق، المستندات، والتقارير وسلة المحذوفات',
    permissions: [
      { key: 'FILES_VIEW', name: 'مشاهدة الملفات', desc: 'عرض واستعراض قائمة المستندات والملفات في النطاق' },
      { key: 'FILES_OPEN', name: 'فتح الملفات', desc: 'معاينة وقراءة محتوى المستندات والتقارير' },
      { key: 'FILES_UPLOAD', name: 'رفع الملفات', desc: 'رفع وإضافة مستندات وتقارير جديدة' },
      { key: 'FILES_EDIT', name: 'تعديل الملفات', desc: 'تحديث بيانات ومحتوى المستندات الرسمية' },
      { key: 'FILES_DELETE', name: 'حذف الملفات', desc: 'حذف المستندات ونقلها لسلة المحذوفات' },
      { key: 'FILES_DOWNLOAD', name: 'تنزيل الملفات', desc: 'تنزيل وحفظ المستندات والملفات على الجهاز' },
      { key: 'FILES_EXPORT', name: 'تصدير الملفات', desc: 'تصدير الوثائق والتقارير بصيغ متعددة' },
      { key: 'FILES_PRINT', name: 'طباعة الملفات', desc: 'طباعة المستندات والتقارير الرسمية' },
      { key: 'FILES_SHARE', name: 'مشاركة الملفات', desc: 'مشاركة المستندات والروابط مع المستخدمين' },
      { key: 'FILES_SEND', name: 'إرسال الملفات', desc: 'إرسال الملفات في المذكرات والتبليغات الرسمية' },
      { key: 'FILES_PUBLISH', name: 'نشر الملفات', desc: 'نشر وتعميم المستندات على مستوى القسم أو الشعبة' },
      { key: 'FILES_ARCHIVE', name: 'أرشفة الملفات', desc: 'نقل المستندات إلى الأرشيف الدائم للقسم' },
      { key: 'FILES_RESTORE', name: 'استعادة الملفات', desc: 'استعادة المستندات المحذوفة من سلة المهملات' }
    ]
  },
  {
    id: 'group_users',
    name: 'إدارة المستخدمين',
    icon: '👥',
    desc: 'إدارة حسابات المنتسبين، السجل الموحد، وطلبات القبول والاعتماد',
    permissions: [
      { key: 'USERS_VIEW', name: 'مشاهدة المستخدمين', desc: 'استعراض قائمة حسابات المستخدمين في النطاق' },
      { key: 'USERS_ADD', name: 'إضافة مستخدم', desc: 'إنشاء وتسجيل حساب مستخدم جديد' },
      { key: 'USERS_EDIT', name: 'تعديل بيانات المستخدم', desc: 'تعديل البيانات الأساسية لحساب المستخدم' },
      { key: 'USERS_DISABLE', name: 'تعطيل/تجميد المستخدم', desc: 'تجميد أو تعطيل حساب المستخدم مؤقتاً' },
      { key: 'USERS_ENABLE', name: 'إعادة تفعيل المستخدم', desc: 'إلغاء تجميد وتفعيل الحسابات المعطلة' },
      { key: 'USERS_ACCOUNT_MANAGE', name: 'إدارة حساب المستخدم', desc: 'إدارة كامل إعدادات الحساب وحالة الدخول' },
      { key: 'USERS_APPROVE', name: 'الموافقة على المستخدم', desc: 'اعتماد وقبول طلبات تسجيل المستخدمين الجدد' },
      { key: 'USERS_REJECT', name: 'رفض المستخدم', desc: 'رفض طلبات التسجيل غير المطابقة' },
      { key: 'USERS_MANAGE_EMPLOYEE_DATA', name: 'إدارة بيانات الموظف المرتبط', desc: 'تحديث بيانات إضبارة الموظف المرتبطة بالحساب' },
      { key: 'USERS_CHANGE_EMP_ID', name: 'تغيير الرقم الوظيفي', desc: 'تعديل الرقم الوظيفي مع التحقق ومنع التكرار' },
      { key: 'USERS_RESET_PASSWORD', name: 'تعيين كلمة السر', desc: 'إعادة تعيين كلمة مرور المستخدم بأمان' },
      { key: 'USERS_IMPORT_ROSTER', name: 'استيراد سجلات الموظفين', desc: 'استيراد الأرقام الوظيفية من Excel/CSV' }
    ]
  },
  {
    id: 'group_roles_perms',
    name: 'إدارة الأدوار والصلاحيات',
    icon: '🎛️',
    desc: 'توزيع وتعديل الأدوار، تعيين المسؤولين، وإدارة مصفوفة الصلاحيات',
    permissions: [
      { key: 'ROLES_VIEW', name: 'مشاهدة الصلاحيات', desc: 'الاطلاع على مصفوفة الصلاحيات والأدوار الممنوحة' },
      { key: 'ROLES_GRANT', name: 'منح الصلاحيات', desc: 'منح صلاحيات فرعية مخصصة للمستخدمين' },
      { key: 'ROLES_REVOKE', name: 'سحب الصلاحيات', desc: 'سحب صلاحيات محددة من حسابات المستخدمين' },
      { key: 'ROLES_EDIT_ROLE', name: 'تعديل الدور', desc: 'تغيير الدور الإداري للمستخدم' },
      { key: 'ROLES_ASSIGN_SECTION_MGR', name: 'تعيين مسؤول شعبة', desc: 'تكليف وتعيين مسؤولي الشعب' },
      { key: 'ROLES_ASSIGN_UNIT_MGR', name: 'تعيين مسؤول وحدة', desc: 'تكليف وتعيين مسؤولي الوحدات' },
      { key: 'ROLES_ASSIGN_STATION_MGR', name: 'تعيين مسؤول موقع', desc: 'تكليف وتعيين مسؤولي المواقع والمحطات الميدانية' },
      { key: 'ROLES_ASSIGN_ADMIN', name: 'تعيين إداري', desc: 'منح رتبة إداري مخول للمستخدمين' },
      { key: 'ROLES_CHANGE_SCOPE', name: 'تغيير نطاق الصلاحية', desc: 'تعديل النطاق الإداري المرتبط بصلاحيات المستخدم' }
    ]
  },
  {
    id: 'group_tech_status',
    name: 'إدارة الموقف الفني',
    icon: '⚙️',
    desc: 'تسجيل ومتابعة واعتماد ونشر المواقف الفنية والتشغيلية للشعب والمواقع',
    permissions: [
      { key: 'TECH_STATUS_VIEW', name: 'مشاهدة الموقف الفني', desc: 'استعراض سجل المواقف الفنية ضمن النطاق الإداري المخصص' },
      { key: 'TECH_STATUS_ADD', name: 'إضافة موقف فني', desc: 'تسجيل وإدخال موقف فني جديد للموقع أو الشعبة' },
      { key: 'TECH_STATUS_EDIT', name: 'تعديل الموقف الفني', desc: 'تحديث بيانات ووصف وإجراءات الموقف الفني' },
      { key: 'TECH_STATUS_DELETE', name: 'حذف الموقف الفني', desc: 'حذف سجلات الموقف الفني من المنظومة' },
      { key: 'TECH_STATUS_PUBLISH', name: 'نشر الموقف الفني', desc: 'اعتماد ونشر الموقف الفني ليظهر رسمياً في لوحة الموقف' },
      { key: 'TECH_STATUS_ARCHIVE', name: 'أرشفة الموقف الفني', desc: 'نقل المواقف الفنية المنتهية إلى الأرشيف الدائم' },
      { key: 'MANAGE_SHIFTS', name: 'إدارة مواعيد النوبات', desc: 'ضبط وتعديل ساعات وأوقات تدوير النوبات التشغيلية (A/B/C/D)' }
    ]
  },
  {
    id: 'group_career_dossier',
    name: 'إدارة البيانات الوظيفية',
    icon: '📋',
    desc: 'إدارة السجل الموحد، الإضبارة الأصلية، الحقول والمعلومات الديناميكية',
    permissions: [
      { key: 'CAREER_VIEW_DATA', name: 'مشاهدة البيانات الوظيفية', desc: 'الاطلاع على إضبارة الموظف وسجل المسار الوظيفي' },
      { key: 'CAREER_ADD_INFO', name: 'إضافة معلومة للإضبارة', desc: 'إضافة معلومات وملاحظات جديدة لإضبارة الموظف' },
      { key: 'CAREER_EDIT_INFO', name: 'تعديل معلومة بالإضبارة', desc: 'تعديل البيانات الأساسية والمدنية في السجل الموحد' },
      { key: 'CAREER_DELETE_INFO', name: 'حذف معلومة', desc: 'حذف بيانات أو معلومات فرعية من الإضبارة' },
      { key: 'CAREER_ADD_DYNAMIC_FIELD', name: 'إضافة حقل ديناميكي', desc: 'إنشاء وتخصيص حقول ومعلومات جديدة في النظام' },
      { key: 'CAREER_EDIT_DYNAMIC_FIELD', name: 'تعديل الحقول الديناميكية', desc: 'تعديل إعدادات وتصنيف الحقول المخصصة' },
      { key: 'CAREER_VIEW_SENSITIVE', name: 'مشاهدة البيانات الحساسة', desc: 'الاطلاع على أرقام المستمسكات والوثائق المدنية' },
      { key: 'CAREER_TRANSFER_EMPLOYEE', name: 'نقل الموظف بين الشعب', desc: 'نقل ارتباط الموظف وتوثيق سجل الانتقال' }
    ]
  },
  {
    id: 'group_notifications',
    name: 'إدارة التبليغات',
    icon: '🔔',
    desc: 'إصدار وإدارة التبليغات الإدارية الرسمية والإعلانات العامة',
    permissions: [
      { key: 'NOTIFS_VIEW', name: 'مشاهدة التبليغات', desc: 'الاطلاع على التبليغات الإدارية الصادرة' },
      { key: 'NOTIFS_CREATE', name: 'إنشاء تبليغ', desc: 'تحرير وصياغة تبليغات إدارية جديدة' },
      { key: 'NOTIFS_EDIT', name: 'تعديل تبليغ', desc: 'تحديث بيانات ومحتوى التبليغات الإدارية' },
      { key: 'NOTIFS_DELETE', name: 'حذف تبليغ', desc: 'حذف التبليغات الإدارية وأرشفتها' },
      { key: 'NOTIFS_PUBLISH', name: 'نشر التبليغات', desc: 'اعتماد ونشر التبليغ لعموم المستخدمين' },
      { key: 'NOTIFS_UNPUBLISH', name: 'إلغاء النشر', desc: 'إيقاف تعميم أو إلغاء نشر التبليغ الإداري' },
      { key: 'ANNOUNCEMENTS_PUBLISH', name: 'نشر الإعلانات العامة', desc: 'نشر وتثبيت الإعلانات في شريط الأخبار' }
    ]
  },
  {
    id: 'group_dept_management',
    name: 'إدارة القسم',
    icon: '🏛️',
    desc: 'الإشراف المركزي والتحكم في فضاء إدارة قسم الإنتاج، الكوادر، والمذكرات المركزية',
    permissions: [
      { key: 'DEPT_VIEW', name: 'مشاهدة إدارة القسم', desc: 'الوصول واستعراض لوحة وتبويبات إدارة القسم المركزية' },
      { key: 'DEPT_MANAGE_STRUCTURE', name: 'إدارة الهيكل الإداري للقسم', desc: 'تنظيم واستحداث الشعب والوحدات والارتباطات الإدارية' },
      { key: 'DEPT_MANAGE_STAFF', name: 'إدارة كادر القسم', desc: 'استعراض وإدارة وتحديث سجلات جميع كادر ومنتسبي القسم' },
      { key: 'DEPT_MANAGE_INTERVIEWS', name: 'إدارة طلبات المقابلات', desc: 'مراجعة وتدقيق واعتماد طلبات مقابلات الإدارة وجدولتها' },
      { key: 'DEPT_MANAGE_NOTIFS', name: 'إصدار تبليغات إدارة القسم', desc: 'تحرير ونشر التوجيهات والتبليغات الرسمية الصادرة من إدارة القسم' },
      { key: 'DEPT_MANAGE_DOCS', name: 'إدارة وثائق وتقارير القسم', desc: 'إضافة وأرشفة التقارير والمستندات والكتب الرسمية للقسم' },
      { key: 'DEPT_MANAGE_FLEET', name: 'إدارة حركة عجلات القسم', desc: 'تسجيل ومتابعة حركة وحالات أسطول عجلات قسم الإنتاج' }
    ]
  },
  {
    id: 'group_sections',
    name: 'إدارة الشعب',
    icon: '🏢',
    desc: 'إدارة واستحداث وهيكلية شعب قسم الإنتاج الجنوبي ومسؤوليها وكوادرها',
    permissions: [
      { key: 'SECTIONS_VIEW', name: 'مشاهدة الشعب', desc: 'استعراض قائمة الشعب الإنتاجية والفنية وبياناتها وهيكليتها' },
      { key: 'SECTIONS_ADD', name: 'إضافة / استحداث شعبة', desc: 'استحداث وإنشاء شعبة جديدة في الهيكل الإداري للقسم' },
      { key: 'SECTIONS_EDIT', name: 'تعديل بيانات الشعبة', desc: 'تحديث بيانات ومقر واختصاص ومسؤول الشعبة' },
      { key: 'SECTIONS_DISABLE', name: 'تعطيل/أرشفة شعبة', desc: 'تعطيل أو إلغاء تفعيل الشعبة وأرشفتها' },
      { key: 'SECTIONS_MANAGE_STAFF', name: 'إدارة كادر الشعبة', desc: 'تحديث وإدارة بيانات وسجلات كادر ومنتسبي الشعبة' },
      { key: 'SECTIONS_NOTIFS_CREATE', name: 'إصدار تبليغات للشعبة', desc: 'إصدار وتوجيه التبليغات لمحطات ومنتسبي الشعبة' }
    ]
  },
  {
    id: 'group_units',
    name: 'إدارة الوحدات',
    icon: '⚡',
    desc: 'إدارة الوحدات التابعة للقسم وهيكليتها',
    permissions: [
      { key: 'UNITS_VIEW', name: 'مشاهدة الوحدات', desc: 'استعراض قائمة الوحدات التابعة وبياناتها' },
      { key: 'UNITS_ADD', name: 'إضافة وحدة', desc: 'إنشاء وحدة إدارية أو فنية جديدة' },
      { key: 'UNITS_EDIT', name: 'تعديل وحدة', desc: 'تحديث بيانات ووصف ومسؤول الوحدة' },
      { key: 'UNITS_DISABLE', name: 'تعطيل/حذف وحدة', desc: 'تعطيل أو إلغاء تفعيل الوحدة الإدارية' }
    ]
  },
  {
    id: 'group_stations',
    name: 'إدارة المحطات والمواقع',
    icon: '🛢️',
    desc: 'إدارة المحطات الإنتاجية والمجمعات والمواقع الميدانية',
    permissions: [
      { key: 'STATIONS_VIEW', name: 'مشاهدة المحطات والمواقع', desc: 'الاطلاع على قائمة المحطات والمجمعات الإنتاجية' },
      { key: 'STATIONS_ADD', name: 'إضافة موقع / محطة', desc: 'إضافة محطة إنتاجية أو موقع جديد للشعبة' },
      { key: 'STATIONS_EDIT', name: 'تعديل موقع / محطة', desc: 'تحديث بيانات وطاقة وموقع المحطة' },
      { key: 'STATIONS_DISABLE', name: 'تعطيل/حذف موقع', desc: 'تعطيل الموقع أو إخراجه من الخدمة' }
    ]
  },
  {
    id: 'group_requests',
    name: 'إدارة الطلبات',
    icon: '📝',
    desc: 'سلسلة اعتماد ومراجعة وتدقيق الطلبات الإدارية والاستمارات',
    permissions: [
      { key: 'REQUESTS_VIEW', name: 'مشاهدة الطلبات', desc: 'استعراض الطلبات الإدارية المقدمة في النطاق' },
      { key: 'REQUESTS_CREATE', name: 'إنشاء طلب', desc: 'تقديم استمارة أو طلب إداري جديد' },
      { key: 'REQUESTS_EDIT', name: 'تعديل الطلب', desc: 'تعديل بيانات واستمارات الطلبات' },
      { key: 'REQUESTS_REVIEW', name: 'مراجعة الطلب', desc: 'تدقيق ومراجعة الطلبات قبل الاعتماد' },
      { key: 'REQUESTS_APPROVE', name: 'اعتماد الطلب', desc: 'الموافقة الرسمية واعتماد الطلب الإداري' },
      { key: 'REQUESTS_REJECT', name: 'رفض الطلب', desc: 'رفض الطلب الإداري مع ذكر الأسباب' },
      { key: 'REQUESTS_ARCHIVE', name: 'أرشفة الطلب', desc: 'نقل الطلبات المنجزة للأرشيف' },
      { key: 'REQUESTS_EXPORT', name: 'تصدير الطلبات', desc: 'تصدير سجل الطلبات والاعتمادات' }
    ]
  },
  {
    id: 'group_reports_audit',
    name: 'إدارة التقارير',
    icon: '📊',
    desc: 'استخراج التقارير الإحصائية، سجل التدقيق الأمني، وحركة المركبات',
    permissions: [
      { key: 'REPORTS_VIEW', name: 'مشاهدة التقارير', desc: 'الاطلاع على التقارير والمؤشرات الإحصائية' },
      { key: 'REPORTS_CREATE', name: 'إنشاء التقارير', desc: 'توليد تقارير إدارية وتشغيلية جديدة' },
      { key: 'REPORTS_EXPORT', name: 'تصدير التقارير', desc: 'تصدير التقارير بصيغة PDF وWord' },
      { key: 'REPORTS_PRINT', name: 'طباعة التقارير', desc: 'طباعة التقارير والجداول الإحصائية' },
      { key: 'REPORTS_EXCEL', name: 'استخراج Excel', desc: 'تصدير الجداول والبيانات إلى ملفات Excel/CSV' },
      { key: 'VIEW_AUDIT_LOGS', name: 'استعراض سجلات التدقيق', desc: 'الاطلاع على سجل التدقيق الأمني للعمليات' },
      { key: 'MANAGE_VEHICLES', name: 'إدارة حركة المركبات', desc: 'تسجيل ومتابعة حركة وحالات آليات القسم' }
    ]
  },
  {
    id: 'group_global_scope',
    name: 'صلاحيات الوصول الشامل',
    icon: '🌐',
    desc: 'تخطي النطاق المحدد والوصول الشامل على مستوى القسم والجهات التابعة',
    permissions: [
      { key: 'SCOPE_ALL_SECTIONS', name: 'الوصول لجميع الشعب', desc: 'صلاحية الوصول لكافة الشعب دون تقييد' },
      { key: 'SCOPE_ALL_UNITS', name: 'الوصول لجميع الوحدات', desc: 'صلاحية الوصول لكافة الوحدات دون تقييد' },
      { key: 'SCOPE_ALL_STATIONS', name: 'الوصول لجميع المحطات', desc: 'صلاحية الوصول لكافة المحطات الميدانية' },
      { key: 'SCOPE_DEPT_LEVEL_USERS', name: 'إدارة المستخدمين على مستوى القسم', desc: 'إدارة حسابات مستخدمي القسم ككل' },
      { key: 'SCOPE_DEPT_LEVEL_FILES', name: 'إدارة الملفات على مستوى القسم', desc: 'إدارة أرشيف وملفات القسم المركزي بالكامل' },
      { key: 'SCOPE_ALL_DOSSIERS', name: 'الاطلاع على إضبارات كافة الكوادر', desc: 'معاينة وإدارة وتصدير إضبارات وسجلات جميع كوادر القسم دون التقيد بالشعبة' }
    ]
  }
];

// Flattened Catalog & Backward-Compatibility Key Mapping
const PERMISSION_FLAGS = {};
const PERMISSIONS_CATALOG = [];

// Legacy key aliases mapping
const LEGACY_KEY_ALIASES = {
  MANAGE_USERS: 'USERS_VIEW',
  ASSIGN_MANAGERS: 'ROLES_ASSIGN_SECTION_MGR',
  APPROVE_LOGINS: 'USERS_APPROVE',
  RESET_PASSWORDS: 'USERS_RESET_PASSWORD',
  CHANGE_EMPLOYEE_ID: 'USERS_CHANGE_EMP_ID',
  IMPORT_EMPLOYEE_IDS: 'USERS_IMPORT_ROSTER',
  ALL_SECTIONS_UNITS_ACCESS: 'SCOPE_ALL_SECTIONS',
  UPLOAD_MANAGE_FILES: 'FILES_UPLOAD',
  DELETE_FILES: 'FILES_DELETE',
  PUBLISH_ANNOUNCEMENTS: 'ANNOUNCEMENTS_PUBLISH',
  MANAGE_OFFICIAL_NOTIFICATIONS: 'NOTIFS_CREATE',
  MANAGE_REQUESTS: 'REQUESTS_APPROVE',
  VIEW_REQUESTS: 'REQUESTS_VIEW',
  CREATE_REQUEST: 'REQUESTS_CREATE',
  REVIEW_REQUEST: 'REQUESTS_REVIEW',
  APPROVE_REQUEST: 'REQUESTS_APPROVE',
  REJECT_REQUEST: 'REQUESTS_REJECT',
  DELETE_REQUEST: 'REQUESTS_ARCHIVE',
  EXPORT_REQUESTS: 'REQUESTS_EXPORT',
  VIEW_EMPLOYEE_INFO: 'CAREER_VIEW_DATA',
  ADD_EMPLOYEE_INFO: 'CAREER_ADD_INFO',
  EDIT_EMPLOYEE_INFO: 'CAREER_EDIT_INFO',
  DELETE_EMPLOYEE_INFO: 'CAREER_DELETE_INFO',
  MANAGE_DYNAMIC_FIELDS: 'CAREER_ADD_DYNAMIC_FIELD',
  VIEW_SENSITIVE_INFO: 'CAREER_VIEW_SENSITIVE',
  TRANSFER_EMPLOYEE: 'CAREER_TRANSFER_EMPLOYEE',
  MANAGE_VEHICLES: 'MANAGE_VEHICLES',
  MANAGE_SECTIONS: 'SECTIONS_ADD',
  MANAGE_DEPT: 'DEPT_VIEW',
  MANAGE_DEPT_MGMT: 'DEPT_VIEW',
  DEPT_MANAGEMENT: 'DEPT_VIEW',
  MANAGE_UNITS: 'UNITS_ADD',
  MANAGE_STATIONS: 'STATIONS_ADD',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  SUPER_ADMIN_ACCESS: 'SUPER_ADMIN_ACCESS'
};

PERMISSION_GROUPS.forEach(grp => {
  grp.permissions.forEach(p => {
    PERMISSION_FLAGS[p.key] = p.key;
    PERMISSIONS_CATALOG.push({
      ...p,
      groupId: grp.id,
      category: grp.name,
      icon: grp.icon
    });
  });
});

// Also register legacy flags
Object.keys(LEGACY_KEY_ALIASES).forEach(k => {
  if (!PERMISSION_FLAGS[k]) {
    PERMISSION_FLAGS[k] = k;
  }
});

class RBACService {
  constructor() {
    this.roles = ROLES;
    this.groups = PERMISSION_GROUPS;
    this.permissions = PERMISSION_FLAGS;
    this.catalog = PERMISSIONS_CATALOG;
    this.aliases = LEGACY_KEY_ALIASES;
  }

  getRoleInfo(roleKey) {
    if (roleKey && this.roles[roleKey]) return this.roles[roleKey];
    if (roleKey === 'EMPLOYEE') {
      return { key: 'STAFF', name: 'كادر', level: 10, badgeClass: 'badge-secondary', desc: 'كادر القسم' };
    }
    return this.roles.DRIVER || { key: 'STAFF', name: 'كادر', level: 10, badgeClass: 'badge-secondary', desc: 'كادر القسم' };
  }

  getPermissionGroups() {
    return this.groups;
  }

  getPermissionsCatalog() {
    return this.catalog;
  }

  /**
   * Resolve permission key to support both new and legacy formats
   */
  resolvePermissionKey(permKey) {
    if (this.aliases[permKey]) {
      return this.aliases[permKey];
    }
    return permKey;
  }

  /**
   * Check if user has specific permission considering scope, role, and granular customPermissions
   * Follows Principle of Least Privilege: Role does not equal all permissions automatically!
   */
  hasPermission(user, permission, targetEntity = null) {
    if (!user) return false;

    // 1. Super Admin has unrestricted access to everything
    if (user.role === 'SUPER_ADMIN') return true;

    // 2. Status check - Suspended or Disabled users have NO permissions
    if (['SUSPENDED', 'DISABLED', 'REJECTED', 'PENDING'].includes(user.status)) {
      return false;
    }

    const resolvedPerm = this.resolvePermissionKey(permission);

    // 3. Department Manager & Deputy Department Manager: Has operational authority within the department
    if (user.role === 'DEPT_MANAGER' || user.role === 'DEPUTY_DEPT_MANAGER') {
      if (resolvedPerm === 'SUPER_ADMIN_ACCESS') return false;
      return true;
    }

    // 4. Granular Custom Permissions Check
    const customPerms = Array.isArray(user.customPermissions) ? user.customPermissions : [];
    const hasExplicitCustom = customPerms.includes(permission) || customPerms.includes(resolvedPerm);

    // Global scope overrides
    const hasGlobalScope = customPerms.includes('SCOPE_ALL_SECTIONS') ||
                           customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') ||
                           user.hasGlobalAccess === true;

    // 5. Default Role Baseline Permissions (Strict Principle of Least Privilege)
    let roleBaseline = false;

    if (user.role === 'ADMIN_MANAGER') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_EDIT', 'FILES_DOWNLOAD', 'FILES_PRINT', 'FILES_EXPORT', 'FILES_SHARE', 'FILES_SEND', 'FILES_PUBLISH', 'FILES_ARCHIVE',
        'USERS_VIEW', 'USERS_ADD', 'USERS_EDIT', 'USERS_APPROVE', 'USERS_DISABLE', 'USERS_ENABLE', 'USERS_ACCOUNT_MANAGE', 'USERS_CHANGE_EMP_ID', 'USERS_RESET_PASSWORD', 'USERS_IMPORT_ROSTER',
        'ROLES_VIEW', 'ROLES_GRANT', 'ROLES_EDIT_ROLE', 'ROLES_CHANGE_SCOPE', 'ROLES_ASSIGN_SECTION_MGR', 'ROLES_ASSIGN_UNIT_MGR', 'ROLES_ASSIGN_STATION_MGR', 'ROLES_ASSIGN_ADMIN',
        'CAREER_VIEW_DATA', 'CAREER_ADD_INFO', 'CAREER_EDIT_INFO', 'CAREER_TRANSFER_EMPLOYEE',
        'NOTIFS_VIEW', 'NOTIFS_CREATE', 'NOTIFS_EDIT', 'NOTIFS_PUBLISH', 'ANNOUNCEMENTS_PUBLISH',
        'TECH_STATUS_VIEW',
        'REQUESTS_VIEW', 'REQUESTS_CREATE', 'REQUESTS_REVIEW', 'REQUESTS_APPROVE', 'REQUESTS_REJECT', 'REQUESTS_EXPORT',
        'DEPT_VIEW', 'DEPT_MANAGE_STAFF', 'DEPT_MANAGE_INTERVIEWS', 'DEPT_MANAGE_NOTIFS', 'DEPT_MANAGE_DOCS', 'DEPT_MANAGE_FLEET',
        'SECTIONS_VIEW', 'UNITS_VIEW', 'STATIONS_VIEW', 'MANAGE_VEHICLES',
        'REPORTS_VIEW', 'REPORTS_EXPORT', 'REPORTS_PRINT', 'REPORTS_EXCEL', 'VIEW_AUDIT_LOGS',
        'SCOPE_ALL_SECTIONS', 'SCOPE_ALL_UNITS', 'SCOPE_ALL_STATIONS', 'SCOPE_DEPT_LEVEL_USERS', 'SCOPE_ALL_DOSSIERS'
      ].includes(resolvedPerm);
    } else if (user.role === 'SECTION_MANAGER' || user.role === 'DEPUTY_SECTION_MANAGER') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_EDIT', 'FILES_DOWNLOAD', 'FILES_PRINT', 'FILES_EXPORT', 'FILES_SHARE', 'FILES_ARCHIVE', 'FILES_RESTORE',
        'USERS_VIEW', 'USERS_ADD', 'USERS_EDIT', 'USERS_APPROVE', 'USERS_MANAGE_EMPLOYEE_DATA',
        'ROLES_VIEW', 'ROLES_GRANT', 'ROLES_EDIT_ROLE',
        'CAREER_VIEW_DATA', 'CAREER_ADD_INFO',
        'NOTIFS_VIEW', 'NOTIFS_CREATE', 'SECTIONS_NOTIFS_CREATE',
        'TECH_STATUS_VIEW', 'TECH_STATUS_ADD', 'TECH_STATUS_EDIT', 'TECH_STATUS_DELETE', 'TECH_STATUS_PUBLISH', 'TECH_STATUS_ARCHIVE', 'MANAGE_TECHNICAL_STATUS',
        'REQUESTS_VIEW', 'REQUESTS_CREATE', 'REQUESTS_REVIEW', 'REQUESTS_APPROVE', 'REQUESTS_REJECT',
        'DEPT_VIEW', 'SECTIONS_VIEW', 'SECTIONS_MANAGE_STAFF', 'STATIONS_VIEW', 'MANAGE_VEHICLES',
        'REPORTS_VIEW', 'REPORTS_EXPORT', 'REPORTS_PRINT'
      ].includes(resolvedPerm);
    } else if (user.role === 'UNIT_MANAGER') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_EDIT', 'FILES_DOWNLOAD', 'FILES_PRINT', 'FILES_EXPORT', 'FILES_SHARE', 'FILES_ARCHIVE', 'FILES_RESTORE',
        'USERS_VIEW', 'ROLES_VIEW', 'ROLES_GRANT', 'ROLES_EDIT_ROLE',
        'CAREER_VIEW_DATA',
        'NOTIFS_VIEW',
        'TECH_STATUS_VIEW',
        'REQUESTS_VIEW', 'REQUESTS_CREATE', 'REQUESTS_REVIEW', 'REQUESTS_APPROVE', 'REQUESTS_REJECT',
        'DEPT_VIEW', 'UNITS_VIEW', 'REPORTS_VIEW'
      ].includes(resolvedPerm);
    } else if (user.role === 'STATION_MANAGER' || user.role === 'DEPUTY_STATION_MANAGER' || user.role === 'STATION_SUPERVISOR') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_DOWNLOAD',
        'USERS_VIEW', 'ROLES_VIEW', 'ROLES_GRANT', 'ROLES_EDIT_ROLE',
        'CAREER_VIEW_DATA',
        'NOTIFS_VIEW',
        'TECH_STATUS_VIEW', 'TECH_STATUS_ADD', 'TECH_STATUS_EDIT', 'TECH_STATUS_PUBLISH', 'MANAGE_TECHNICAL_STATUS',
        'REQUESTS_VIEW', 'REQUESTS_CREATE',
        'STATIONS_VIEW', 'MANAGE_VEHICLES'
      ].includes(resolvedPerm);
    } else if (user.role === 'ADMINISTRATOR') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_EDIT', 'FILES_DOWNLOAD', 'FILES_PRINT', 'FILES_EXPORT',
        'USERS_VIEW', 'USERS_ADD', 'USERS_EDIT', 'USERS_APPROVE',
        'ROLES_VIEW', 'ROLES_GRANT', 'ROLES_EDIT_ROLE',
        'CAREER_VIEW_DATA', 'CAREER_ADD_INFO', 'CAREER_EDIT_INFO',
        'NOTIFS_VIEW', 'NOTIFS_CREATE', 'ANNOUNCEMENTS_PUBLISH',
        'TECH_STATUS_VIEW', 'TECH_STATUS_ADD', 'TECH_STATUS_EDIT', 'TECH_STATUS_PUBLISH',
        'REQUESTS_VIEW', 'REQUESTS_CREATE', 'REQUESTS_REVIEW', 'REQUESTS_APPROVE', 'REQUESTS_REJECT',
        'DEPT_VIEW', 'DEPT_MANAGE_STAFF', 'DEPT_MANAGE_NOTIFS', 'DEPT_MANAGE_DOCS',
        'SECTIONS_VIEW', 'SECTIONS_ADD', 'SECTIONS_EDIT', 'UNITS_VIEW', 'UNITS_ADD', 'UNITS_EDIT', 'STATIONS_VIEW',
        'REPORTS_VIEW', 'REPORTS_EXPORT', 'REPORTS_PRINT', 'VIEW_AUDIT_LOGS'
      ].includes(resolvedPerm);
    } else if (user.role === 'SHIFT_ENGINEER' || user.role === 'SHIFT_SUPERVISOR') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_DOWNLOAD',
        'CAREER_VIEW_DATA',
        'NOTIFS_VIEW',
        'TECH_STATUS_VIEW', 'TECH_STATUS_ADD', 'TECH_STATUS_EDIT',
        'REQUESTS_VIEW', 'REQUESTS_CREATE',
        'STATIONS_VIEW'
      ].includes(resolvedPerm);
    } else if (user.role === 'OPERATOR') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_DOWNLOAD',
        'CAREER_VIEW_DATA',
        'NOTIFS_VIEW',
        'TECH_STATUS_VIEW', 'TECH_STATUS_ADD', 'TECH_STATUS_EDIT',
        'REQUESTS_VIEW', 'REQUESTS_CREATE',
        'STATIONS_VIEW'
      ].includes(resolvedPerm);
    } else if (user.role === 'AUTHORIZED_DRIVER') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_DOWNLOAD',
        'CAREER_VIEW_DATA',
        'NOTIFS_VIEW',
        'TECH_STATUS_VIEW',
        'REQUESTS_VIEW', 'REQUESTS_CREATE',
        'MANAGE_VEHICLES', 'STATIONS_VIEW'
      ].includes(resolvedPerm);
    } else if (user.role === 'DRIVER') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_DOWNLOAD',
        'CAREER_VIEW_DATA',
        'NOTIFS_VIEW',
        'TECH_STATUS_VIEW',
        'REQUESTS_VIEW', 'REQUESTS_CREATE'
      ].includes(resolvedPerm);
    } else if (user.role === 'EMPLOYEE') {
      roleBaseline = [
        'FILES_VIEW', 'FILES_OPEN', 'FILES_UPLOAD', 'FILES_DOWNLOAD',
        'CAREER_VIEW_DATA',
        'NOTIFS_VIEW',
        'TECH_STATUS_VIEW',
        'REQUESTS_VIEW', 'REQUESTS_CREATE'
      ].includes(resolvedPerm);
    }

    if (!hasExplicitCustom && !roleBaseline) {
      return false;
    }

    // 6. Scope Validation (Permission + Scope)
    if (hasGlobalScope) {
      return true;
    }

    if (targetEntity) {
      if (targetEntity.sectionId && user.sectionId && targetEntity.sectionId !== user.sectionId) {
        return false;
      }
      if (targetEntity.unitId && user.unitId && targetEntity.unitId !== user.unitId) {
        return false;
      }
      if (targetEntity.stationId && user.stationId && targetEntity.stationId !== user.stationId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Anti-Escalation Check: User cannot manage a target with equal or higher role level
   */
  canManageTargetUser(actorUser, targetUser) {
    if (!actorUser) return false;
    if (actorUser.role === 'SUPER_ADMIN') return true;
    if (!targetUser || !targetUser.role) return true;
    if (targetUser.role === 'SUPER_ADMIN') return false;

    // DEPT_MANAGER and DEPUTY_DEPT_MANAGER have general department authority
    if (actorUser.role === 'DEPT_MANAGER' || actorUser.role === 'DEPUTY_DEPT_MANAGER') {
      return targetUser.role !== 'SUPER_ADMIN';
    }

    // ADMIN_MANAGER has general administrative delegation across the entire department
    if (actorUser.role === 'ADMIN_MANAGER') {
      return !['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER'].includes(targetUser.role);
    }

    const actorLevel = this.getRoleInfo(actorUser.role).level;
    const targetLevel = this.getRoleInfo(targetUser.role).level;

    // Cannot modify someone with equal or higher level
    if (actorLevel <= targetLevel && actorUser.id !== targetUser.id) {
      return false;
    }

    // Scope check: If actor is restricted to section, target must be in same section
    if (actorUser.sectionId && targetUser.sectionId && actorUser.sectionId !== targetUser.sectionId) {
      const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
      if (!customPerms.includes('SCOPE_ALL_SECTIONS') && !customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') && !actorUser.hasGlobalAccess) {
        return false;
      }
    }

    // Scope check: If actor is restricted to unit, target must be in same unit
    if (actorUser.unitId && targetUser.unitId && actorUser.unitId !== targetUser.unitId) {
      const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
      if (!customPerms.includes('SCOPE_ALL_UNITS') && !customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') && !actorUser.hasGlobalAccess) {
        return false;
      }
    }

    // Scope check: If actor is restricted to station, target must be in same station
    if (actorUser.stationId && targetUser.stationId && actorUser.stationId !== targetUser.stationId) {
      const customPerms = Array.isArray(actorUser.customPermissions) ? actorUser.customPermissions : [];
      if (!customPerms.includes('SCOPE_ALL_STATIONS') && !customPerms.includes('ALL_SECTIONS_UNITS_ACCESS') && !actorUser.hasGlobalAccess) {
        return false;
      }
    }

    return true;
  }

  /**
   * Anti-Escalation Check: User cannot grant a role higher than or equal to their own level
   */
  canGrantRole(actorUser, roleKey) {
    if (!actorUser) return false;
    if (actorUser.role === 'SUPER_ADMIN') return true;
    if (['DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER'].includes(actorUser.role)) {
      return !['SUPER_ADMIN', 'DEPT_MANAGER'].includes(roleKey);
    }
    if (actorUser.role === 'ADMIN_MANAGER') {
      return !['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(roleKey);
    }

    const actorLevel = this.getRoleInfo(actorUser.role).level;
    const targetRoleLevel = this.getRoleInfo(roleKey).level;

    return actorLevel > targetRoleLevel;
  }

  /**
   * Anti-Escalation Check: User cannot grant a permission they themselves do not possess
   */
  canGrantPermission(actorUser, permissionKey) {
    if (!actorUser) return false;
    if (['SUPER_ADMIN', 'DEPT_MANAGER', 'DEPUTY_DEPT_MANAGER', 'ADMIN_MANAGER'].includes(actorUser.role)) return true;

    return this.hasPermission(actorUser, permissionKey);
  }

  /**
   * Auto-Role Resolver: Assigns role based on Job Title and default baseline
   */
  resolveDefaultRole(jobTitle = '', requestedRole = null) {
    if (requestedRole && this.roles[requestedRole] && requestedRole !== 'EMPLOYEE') {
      return requestedRole;
    }
    const t = (jobTitle || '').toLowerCase();
    if (t.includes('سائق') || t.includes('آليات') || t.includes('مركبات')) {
      return t.includes('مخول') ? 'AUTHORIZED_DRIVER' : 'DRIVER';
    }
    if (t.includes('مدير قسم')) return 'DEPT_MANAGER';
    if (t.includes('وكيل مدير قسم')) return 'DEPUTY_DEPT_MANAGER';
    if (t.includes('مدير إدارة') || t.includes('رئيس إدارة')) return 'ADMIN_MANAGER';
    if (t.includes('مسؤول شعبة') || t.includes('رئيس شعبة')) return 'SECTION_MANAGER';
    if (t.includes('وكيل شعبة') || t.includes('وكيل مسؤول شعبة')) return 'DEPUTY_SECTION_MANAGER';
    if (t.includes('مسؤول وحدة') || t.includes('رئيس وحدة')) return 'UNIT_MANAGER';
    if (t.includes('مسؤول موقع') || t.includes('مسؤول محطة')) return 'STATION_MANAGER';
    if (t.includes('مشرف محطة') || t.includes('مشرف موقع')) return 'STATION_SUPERVISOR';
    if (t.includes('مهندس مناوب')) return 'SHIFT_ENGINEER';
    if (t.includes('مشرف نوبة') || t.includes('مسؤول نوبة')) return 'SHIFT_SUPERVISOR';
    if (t.includes('إداري مخول')) return 'ADMINISTRATOR';

    // Baseline lowest entry role is OPERATOR (مشغل)
    return 'OPERATOR';
  }
}

const rbac = new RBACService();
window.rbac = rbac;
window.ROLES = ROLES;
window.PERMISSION_FLAGS = PERMISSION_FLAGS;
window.PERMISSION_GROUPS = PERMISSION_GROUPS;
window.PERMISSIONS_CATALOG = PERMISSIONS_CATALOG;
