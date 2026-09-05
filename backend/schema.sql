-- ============================================================================
-- قاعدة بيانات إدارة قسم الإنتاج الجنوبي - PostgreSQL Production Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. جدول الأقسام والإدارات (Multi-Tenant Departments)
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    manager_id VARCHAR(64),
    status VARCHAR(32) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. جدول الشُعب (Sections)
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    manager_id VARCHAR(64),
    manager_name VARCHAR(255),
    location VARCHAR(255),
    station_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. جدول الوحدات التابعة للقسم (Units)
CREATE TABLE IF NOT EXISTS units (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    manager_id VARCHAR(64),
    manager_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. جدول المحطات الإنتاجية والمواقع (Stations)
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(64) PRIMARY KEY,
    section_id VARCHAR(64) REFERENCES sections(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) NOT NULL,
    manager_name VARCHAR(255),
    design_capacity VARCHAR(128),
    current_production VARCHAR(128),
    scada_status VARCHAR(64) DEFAULT 'ONLINE',
    operational_status VARCHAR(64) DEFAULT 'OPERATIONAL',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. جدول الأرقام الوظيفية المعتمدة للمنتسبين (Approved HR Master Registry)
CREATE TABLE IF NOT EXISTS approved_employees (
    employee_id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    department_id VARCHAR(64) REFERENCES departments(id),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    job_grade VARCHAR(64),
    job_stage VARCHAR(64),
    degree VARCHAR(128),
    specialization VARCHAR(255),
    university VARCHAR(255),
    graduation_year VARCHAR(32),
    hire_date DATE,
    dept_join_date DATE,
    unified_card_number VARCHAR(64),
    passport_number VARCHAR(64),
    residence_card_number VARCHAR(64),
    ration_card_number VARCHAR(64),
    safety_passport_number VARCHAR(64),
    work_shift VARCHAR(64) DEFAULT 'صباحي',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. جدول المستخدمين والحسابات (Users & Authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    department_id VARCHAR(64) REFERENCES departments(id),
    section_id VARCHAR(64) REFERENCES sections(id),
    unit_id VARCHAR(64) REFERENCES units(id),
    station_id VARCHAR(64) REFERENCES stations(id),
    employee_id VARCHAR(64) UNIQUE REFERENCES approved_employees(employee_id),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(64) NOT NULL DEFAULT 'EMPLOYEE',
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    phone VARCHAR(64),
    profile_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. جدول الموقف الفني والتشغيلي (Technical Status Reports)
CREATE TABLE IF NOT EXISTS technical_status_reports (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES departments(id),
    section_id VARCHAR(64) REFERENCES sections(id),
    station_id VARCHAR(64) REFERENCES stations(id),
    station_name VARCHAR(255) NOT NULL,
    status VARCHAR(64) NOT NULL, -- OPERATIONAL, PARTIAL, STOPPED
    topic VARCHAR(255) NOT NULL,
    description TEXT,
    ongoing_works TEXT,
    created_by_name VARCHAR(255),
    created_by_employee_id VARCHAR(64),
    handling_status VARCHAR(64) DEFAULT 'UNDER_REVIEW',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. جدول حركة الآليات والمركبات (Vehicle Movements & Fleet)
CREATE TABLE IF NOT EXISTS vehicle_movements (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES departments(id),
    section_id VARCHAR(64) REFERENCES sections(id),
    side_number VARCHAR(64) NOT NULL,
    vehicle_type VARCHAR(128) NOT NULL,
    plate_number VARCHAR(64) NOT NULL,
    driver_name VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    purpose TEXT,
    departure_time TIMESTAMP WITH TIME ZONE,
    expected_return_time TIMESTAMP WITH TIME ZONE,
    actual_return_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(64) DEFAULT 'DEPARTED',
    operational_state VARCHAR(64) DEFAULT 'OPERATIONAL',
    odometer_out INT,
    odometer_in INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. جدول المستندات والأرشيف الإلكتروني (Documents & DMS)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES departments(id),
    section_id VARCHAR(64) REFERENCES sections(id),
    unit_id VARCHAR(64) REFERENCES units(id),
    station_id VARCHAR(64) REFERENCES stations(id),
    title VARCHAR(255) NOT NULL,
    doc_number VARCHAR(128),
    type VARCHAR(32) NOT NULL, -- WORD, EXCEL
    status VARCHAR(32) DEFAULT 'PUBLISHED',
    version INT DEFAULT 1,
    content TEXT,
    grid_data JSONB,
    created_by_id VARCHAR(64) REFERENCES users(id),
    created_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. جدول الإعلانات المركزية (Central Announcements)
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES departments(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    importance VARCHAR(32) DEFAULT 'NORMAL',
    is_pinned BOOLEAN DEFAULT FALSE,
    is_active_ticker BOOLEAN DEFAULT FALSE,
    published_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. جدول التبليغات والتوجيهات الإدارية الرسمية (Official Notifications)
CREATE TABLE IF NOT EXISTS official_notifications (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) REFERENCES departments(id),
    reference_number VARCHAR(128) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(32) DEFAULT 'NORMAL',
    issued_by_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. جدول الطلبات الإدارية والاستمارات الديناميكية (Administrative Requests)
CREATE TABLE IF NOT EXISTS requests (
    id VARCHAR(64) PRIMARY KEY,
    type_id VARCHAR(64) NOT NULL,
    type_title VARCHAR(255) NOT NULL,
    user_id VARCHAR(64) REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    user_employee_id VARCHAR(64) NOT NULL,
    department_id VARCHAR(64) REFERENCES departments(id),
    payload JSONB NOT NULL,
    status VARCHAR(32) DEFAULT 'PENDING',
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. جدول سجل الأمان والتدقيق العام (Security Audit Logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64),
    user_id VARCHAR(64),
    employee_id VARCHAR(64),
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(128) NOT NULL,
    details TEXT,
    ip_address VARCHAR(64),
    result VARCHAR(32) DEFAULT 'SUCCESS',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. جدول سلة المحذوفات (Recycle Bin)
CREATE TABLE IF NOT EXISTS recycle_bin (
    id VARCHAR(64) PRIMARY KEY,
    original_id VARCHAR(64) NOT NULL,
    item_type VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    deleted_by_name VARCHAR(255),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    payload JSONB NOT NULL
);
