# 설문조사 앱 확장 데이터베이스 설계

## 1. 시스템 분석

### 핵심 요구사항
- 다양한 주제의 설문조사 생성 및 관리
- 관리자 CMS를 통한 CRUD 기능
- 동적 질문 유형 및 조건부 로직 지원
- 응답 수집, 분석 및 리포팅
- 템플릿 기반 설문 생성
- 알림 및 이메일 발송
- 다국어 지원

### 확장된 엔티티 구조
**기본 엔티티**: 설문조사, 질문, 선택지, 응답자, 응답, 답변, 관리자
**확장 엔티티**: 템플릿, 테마, 로직, 알림, 파일, 다국어, 태그, 대시보드

## 2. 핵심 데이터베이스 스키마

### 2.1 관리자 테이블 (admins)
```sql
CREATE TABLE admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'admin', 'editor', 'viewer') DEFAULT 'admin',
    permissions JSON NULL, -- 세밀한 권한 설정
    avatar_url VARCHAR(500) NULL,
    department VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified_at TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'ko',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2.2 설문조사 테이블 (surveys)
```sql
CREATE TABLE surveys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL, -- 공개 URL용
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    tags JSON NULL, -- 태그 배열
    status ENUM('draft', 'active', 'paused', 'closed', 'archived') DEFAULT 'draft',
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    max_responses INT NULL,
    allow_anonymous BOOLEAN DEFAULT TRUE,
    allow_multiple_responses BOOLEAN DEFAULT FALSE,
    require_login BOOLEAN DEFAULT FALSE,
    collect_email BOOLEAN DEFAULT FALSE,
    collect_phone BOOLEAN DEFAULT FALSE,
    welcome_message TEXT,
    thank_you_message TEXT,
    redirect_url VARCHAR(500) NULL,
    password_protected BOOLEAN DEFAULT FALSE,
    access_password VARCHAR(255) NULL,
    template_id BIGINT NULL,
    theme_id BIGINT NULL,
    language VARCHAR(10) DEFAULT 'ko',
    seo_title VARCHAR(200) NULL,
    seo_description TEXT NULL,
    social_share_image VARCHAR(500) NULL,
    estimated_time INT NULL, -- 예상 소요시간(분)
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id),
    FOREIGN KEY (template_id) REFERENCES survey_templates(id),
    FOREIGN KEY (theme_id) REFERENCES survey_themes(id)
);
```

### 2.3 질문 테이블 (questions)
```sql
CREATE TABLE questions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    survey_id BIGINT NOT NULL,
    section_id BIGINT NULL, -- 섹션 그룹핑
    question_text TEXT NOT NULL,
    question_type ENUM('text', 'textarea', 'radio', 'checkbox', 'dropdown', 'scale', 'date', 'email', 'number', 'file', 'matrix', 'ranking', 'slider') NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    order_index INT NOT NULL,
    placeholder TEXT NULL,
    help_text TEXT NULL,
    validation_rules JSON NULL,
    scale_min INT NULL,
    scale_max INT NULL,
    scale_step DECIMAL(3,2) DEFAULT 1.00,
    scale_labels JSON NULL,
    matrix_rows JSON NULL, -- 매트릭스 질문의 행
    matrix_columns JSON NULL, -- 매트릭스 질문의 열
    file_types JSON NULL, -- 허용 파일 타입
    max_file_size INT NULL, -- KB 단위
    randomize_options BOOLEAN DEFAULT FALSE,
    display_logic JSON NULL, -- 표시 조건
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (section_id) REFERENCES question_sections(id)
);
```

### 2.4 질문 섹션 테이블 (question_sections)
```sql
CREATE TABLE question_sections (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    survey_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE
);
```

### 2.5 선택지 테이블 (options)
```sql
CREATE TABLE options (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    option_text VARCHAR(500) NOT NULL,
    option_value VARCHAR(100) NULL,
    order_index INT NOT NULL,
    is_other BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500) NULL, -- 이미지 선택지
    color_code VARCHAR(7) NULL, -- 색상 코드
    score_value INT NULL, -- 점수 계산용
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);
```

### 2.6 응답자 테이블 (respondents)
```sql
CREATE TABLE respondents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    email VARCHAR(100) NULL,
    name VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    age_range VARCHAR(20) NULL,
    gender ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
    location VARCHAR(100) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    session_id VARCHAR(100) NULL,
    referrer_url VARCHAR(500) NULL,
    utm_source VARCHAR(100) NULL,
    utm_medium VARCHAR(100) NULL,
    utm_campaign VARCHAR(100) NULL,
    device_type ENUM('desktop', 'mobile', 'tablet') NULL,
    browser VARCHAR(50) NULL,
    os VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.7 응답 테이블 (responses)
```sql
CREATE TABLE responses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    survey_id BIGINT NOT NULL,
    respondent_id BIGINT NULL,
    status ENUM('started', 'in_progress', 'completed', 'abandoned', 'partial') DEFAULT 'started',
    current_question_id BIGINT NULL, -- 현재 위치
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    time_spent INT DEFAULT 0, -- 초 단위
    submission_source VARCHAR(50) DEFAULT 'web',
    quality_score DECIMAL(3,2) NULL, -- 응답 품질 점수
    is_test BOOLEAN DEFAULT FALSE,
    metadata JSON NULL,
    FOREIGN KEY (survey_id) REFERENCES surveys(id),
    FOREIGN KEY (respondent_id) REFERENCES respondents(id),
    FOREIGN KEY (current_question_id) REFERENCES questions(id)
);
```

### 2.8 답변 테이블 (answers)
```sql
CREATE TABLE answers (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    response_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    answer_text TEXT NULL,
    selected_options JSON NULL,
    scale_value DECIMAL(10,2) NULL,
    matrix_answers JSON NULL, -- 매트릭스 답변
    ranking_order JSON NULL, -- 순위 답변
    other_text TEXT NULL,
    file_paths JSON NULL, -- 업로드된 파일 경로들
    answer_time INT DEFAULT 0, -- 답변 소요시간(초)
    revision_count INT DEFAULT 0, -- 수정 횟수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE KEY unique_response_question (response_id, question_id)
);
```

## 3. 확장 기능 테이블

### 3.1 설문 템플릿 (survey_templates)
```sql
CREATE TABLE survey_templates (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    preview_image VARCHAR(500) NULL,
    template_data JSON NOT NULL, -- 설문 구조 JSON
    is_public BOOLEAN DEFAULT FALSE,
    usage_count INT DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);
```

### 3.2 설문 테마 (survey_themes)
```sql
CREATE TABLE survey_themes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    css_variables JSON NOT NULL, -- CSS 변수들
    custom_css TEXT NULL,
    logo_url VARCHAR(500) NULL,
    background_image VARCHAR(500) NULL,
    font_family VARCHAR(100) DEFAULT 'inherit',
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);
```

### 3.3 조건부 로직 (survey_logic)
```sql
CREATE TABLE survey_logic (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    survey_id BIGINT NOT NULL,
    trigger_question_id BIGINT NOT NULL,
    trigger_condition JSON NOT NULL, -- 조건 정의
    action_type ENUM('show_question', 'hide_question', 'jump_to_question', 'end_survey', 'show_section', 'hide_section') NOT NULL,
    target_question_id BIGINT NULL,
    target_section_id BIGINT NULL,
    action_data JSON NULL, -- 추가 액션 데이터
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (trigger_question_id) REFERENCES questions(id),
    FOREIGN KEY (target_question_id) REFERENCES questions(id),
    FOREIGN KEY (target_section_id) REFERENCES question_sections(id)
);
```

### 3.4 알림 관리 (notifications)
```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    survey_id BIGINT NULL,
    type ENUM('email', 'sms', 'webhook', 'slack') NOT NULL,
    trigger_event ENUM('survey_created', 'response_received', 'survey_completed', 'goal_reached', 'survey_expired') NOT NULL,
    recipient_type ENUM('admin', 'respondent', 'custom') NOT NULL,
    recipient_email VARCHAR(100) NULL,
    recipient_phone VARCHAR(20) NULL,
    webhook_url VARCHAR(500) NULL,
    message_template TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    send_count INT DEFAULT 0,
    last_sent_at TIMESTAMP NULL,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);
```

### 3.5 파일 관리 (uploaded_files)
```sql
CREATE TABLE uploaded_files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    response_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL, -- bytes
    file_type VARCHAR(100) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    is_processed BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);
```

### 3.6 다국어 지원 (translations)
```sql
CREATE TABLE translations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    entity_type ENUM('survey', 'question', 'option', 'section') NOT NULL,
    entity_id BIGINT NOT NULL,
    field_name VARCHAR(50) NOT NULL, -- title, description, question_text 등
    language VARCHAR(10) NOT NULL,
    translated_text TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id),
    UNIQUE KEY unique_translation (entity_type, entity_id, field_name, language)
);
```

### 3.7 태그 관리 (tags)
```sql
CREATE TABLE tags (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(7) DEFAULT '#007bff',
    description TEXT NULL,
    usage_count INT DEFAULT 0,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id)
);

CREATE TABLE survey_tags (
    survey_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (survey_id, tag_id),
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 3.8 설문 통계 (survey_stats)
```sql
CREATE TABLE survey_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    survey_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total_views INT DEFAULT 0,
    total_started INT DEFAULT 0,
    total_completed INT DEFAULT 0,
    total_abandoned INT DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0.00,
    abandon_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_completion_time INT DEFAULT 0,
    avg_quality_score DECIMAL(3,2) DEFAULT 0.00,
    unique_visitors INT DEFAULT 0,
    returning_visitors INT DEFAULT 0,
    mobile_responses INT DEFAULT 0,
    desktop_responses INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (survey_id) REFERENCES surveys(id) ON DELETE CASCADE,
    UNIQUE KEY unique_survey_date (survey_id, date)
);
```

### 3.9 대시보드 위젯 (dashboard_widgets)
```sql
CREATE TABLE dashboard_widgets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    widget_type ENUM('recent_responses', 'completion_rate', 'popular_surveys', 'stats_chart', 'quick_actions') NOT NULL,
    title VARCHAR(100) NOT NULL,
    configuration JSON NULL,
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    width INT DEFAULT 4,
    height INT DEFAULT 4,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
```

### 3.10 API 키 관리 (api_keys)
```sql
CREATE TABLE api_keys (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT NOT NULL,
    key_name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    permissions JSON NULL,
    rate_limit INT DEFAULT 1000, -- 시간당 요청 수
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
);
```

### 3.11 웹훅 로그 (webhook_logs)
```sql
CREATE TABLE webhook_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    notification_id BIGINT NOT NULL,
    survey_id BIGINT NULL,
    response_id BIGINT NULL,
    webhook_url VARCHAR(500) NOT NULL,
    payload JSON NOT NULL,
    response_status INT NULL,
    response_body TEXT NULL,
    attempt_count INT DEFAULT 1,
    is_successful BOOLEAN DEFAULT FALSE,
    error_message TEXT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id),
    FOREIGN KEY (survey_id) REFERENCES surveys(id),
    FOREIGN KEY (response_id) REFERENCES responses(id)
);
```

## 4. 고급 인덱스 설계

```sql
-- 성능 최적화 인덱스
CREATE INDEX idx_surveys_status_category ON surveys(status, category);
CREATE INDEX idx_surveys_dates_active ON surveys(start_date, end_date, status);
CREATE INDEX idx_surveys_created_by ON surveys(created_by);
CREATE INDEX idx_questions_survey_section_order ON questions(survey_id, section_id, order_index);
CREATE INDEX idx_options_question_order ON options(question_id, order_index);
CREATE INDEX idx_responses_survey_status_completed ON responses(survey_id, status, completed_at);
CREATE INDEX idx_responses_respondent ON responses(respondent_id);
CREATE INDEX idx_answers_response_question ON answers(response_id, question_id);
CREATE INDEX idx_survey_stats_date ON survey_stats(survey_id, date);
CREATE INDEX idx_translations_entity ON translations(entity_type, entity_id, language);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(is_successful, sent_at);
CREATE INDEX idx_uploaded_files_response ON uploaded_files(response_id, question_id);

-- 전문 검색 인덱스
CREATE FULLTEXT INDEX idx_surveys_search ON surveys(title, description);
CREATE FULLTEXT INDEX idx_questions_search ON questions(question_text);
```

## 5. 뷰(Views) 정의

### 5.1 설문 대시보드 뷰
```sql
CREATE VIEW survey_dashboard AS
SELECT 
    s.id,
    s.title,
    s.status,
    s.created_at,
    COUNT(DISTINCT r.id) as total_responses,
    COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_responses,
    ROUND(COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) * 100.0 / NULLIF(COUNT(DISTINCT r.id), 0), 2) as completion_rate,
    AVG(CASE WHEN r.status = 'completed' THEN r.time_spent END) as avg_completion_time
FROM surveys s
LEFT JOIN responses r ON s.id = r.survey_id AND r.is_test = FALSE
GROUP BY s.id, s.title, s.status, s.created_at;
```

### 5.2 응답 분석 뷰
```sql
CREATE VIEW response_analytics AS
SELECT 
    r.survey_id,
    DATE(r.completed_at) as response_date,
    COUNT(*) as daily_responses,
    AVG(r.time_spent) as avg_time_spent,
    AVG(r.quality_score) as avg_quality_score,
    SUM(CASE WHEN resp.device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_responses,
    SUM(CASE WHEN resp.device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_responses
FROM responses r
LEFT JOIN respondents resp ON r.respondent_id = resp.id
WHERE r.status = 'completed' AND r.is_test = FALSE
GROUP BY r.survey_id, DATE(r.completed_at);
```

## 6. 트리거 예시

### 6.1 통계 업데이트 트리거
```sql
DELIMITER //
CREATE TRIGGER update_survey_stats_after_response
AFTER UPDATE ON responses
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        INSERT INTO survey_stats (survey_id, date, total_completed)
        VALUES (NEW.survey_id, CURDATE(), 1)
        ON DUPLICATE KEY UPDATE 
            total_completed = total_completed + 1,
            completion_rate = ROUND(total_completed * 100.0 / NULLIF(total_started, 0), 2);
    END IF;
END//
DELIMITER ;
```

## 7. 보안 및 성능 고려사항

### 7.1 보안 강화
- 모든 민감 데이터 암호화 (AES-256)
- API 키 해싱 저장
- IP 기반 접근 제한
- RBAC(Role-Based Access Control) 구현
- SQL 인젝션 방지를 위한 파라미터화된 쿼리

### 7.2 성능 최적화
- 읽기 전용 복제본 활용
- Redis 캐싱 레이어
- 대용량 데이터 파티셔닝 (날짜 기준)
- 인덱스 최적화
- 배치 처리를 통한 통계 업데이트

### 7.3 백업 및 복구
- 일일 자동 백업
- 포인트 인 타임 복구 지원
- 지리적 분산 백업
- 정기적인 복구 테스트

## 8. 확장 가능성

이 설계는 다음과 같은 미래 기능들을 쉽게 추가할 수 있도록 구성되었습니다:

- **AI 기반 응답 분석**: 감정 분석, 키워드 추출
- **고급 리포팅**: 크로스탭 분석, 상관관계 분석
- **실시간 협업**: 여러 관리자가 동시에 설문 편집
- **모바일 앱 지원**: 오프라인 응답 수집
- **소셜 미디어 통합**: 공유 및 바이럴 기능
- **결제 시스템**: 유료 설문 기능

이 확장된 데이터베이스 설계는 엔터프라이즈급 설문조사 플랫폼을 구축할 수 있는 완전한 기반을 제공합니다.