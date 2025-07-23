# 진안군 행정정책 입안 시 대규모 여론조사 필요성 설문조사

## 설문조사 기본 정보 (surveys 테이블)

```sql
INSERT INTO surveys (
    uuid, title, description, category, 
    status, start_date, end_date, max_responses,
    allow_anonymous, allow_multiple_responses, require_login,
    collect_email, collect_phone,
    welcome_message, thank_you_message,
    estimated_time, difficulty_level, language,
    seo_title, seo_description, created_by
) VALUES (
    'jinan-policy-survey-2025',
    '진안군 행정정책 입안 시 대규모 여론조사 필요성 조사',
    '진안군에서 행정정책을 수립할 때 핸드폰이나 컴퓨터를 활용한 대규모 여론조사의 필요성과 효과성에 대한 군민 의견을 수렴하는 설문조사입니다.',
    '정책조사',
    'active',
    '2025-07-21 09:00:00',
    '2025-08-20 23:59:59',
    10000,
    true,
    false,
    false,
    true,
    true,
    '안녕하세요. 진안군입니다.\n\n본 설문조사는 진안군의 행정정책 수립 과정에서 디지털 기반 여론조사 도입에 대한 군민 여러분의 소중한 의견을 듣고자 실시됩니다.\n\n여러분의 참여가 더 나은 진안군을 만드는 데 큰 도움이 됩니다.',
    '설문조사에 참여해 주셔서 감사합니다.\n\n여러분의 소중한 의견은 진안군의 정책 수립에 반영될 예정입니다.\n\n더 나은 진안군을 위해 함께해 주세요!',
    7,
    'easy',
    'ko',
    '진안군 대규모 여론조사 필요성 설문',
    '진안군 행정정책 입안 시 디지털 여론조사 필요성에 대한 군민 의견 수렴',
    1
);
```

## 질문 섹션 구성 (question_sections 테이블)

### 섹션 1: 응답자 기본정보
```sql
INSERT INTO question_sections (survey_id, title, description, order_index) VALUES 
(1, '응답자 기본정보', '설문 분석을 위한 기본적인 정보를 수집합니다.', 1);
```

### 섹션 2: 현재 정책 참여 현황
```sql
INSERT INTO question_sections (survey_id, title, description, order_index) VALUES 
(1, '현재 정책 참여 현황', '진안군 정책에 대한 현재 참여도와 관심도를 조사합니다.', 2);
```

### 섹션 3: 디지털 여론조사에 대한 인식
```sql
INSERT INTO question_sections (survey_id, title, description, order_index) VALUES 
(1, '디지털 여론조사에 대한 인식', '핸드폰/컴퓨터를 활용한 여론조사에 대한 생각을 조사합니다.', 3);
```

### 섹션 4: 정책 분야별 여론조사 필요성
```sql
INSERT INTO question_sections (survey_id, title, description, order_index) VALUES 
(1, '정책 분야별 여론조사 필요성', '구체적인 정책 분야별로 여론조사의 필요성을 평가합니다.', 4);
```

### 섹션 5: 개선 방안 및 기대효과
```sql
INSERT INTO question_sections (survey_id, title, description, order_index) VALUES 
(1, '개선 방안 및 기대효과', '대규모 여론조사 도입 시 개선방안과 기대효과를 조사합니다.', 5);
```

## 상세 질문 구성 (questions 테이블)

### 섹션 1: 응답자 기본정보

#### Q1. 성별
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 1, '귀하의 성별은 무엇입니까?', 'radio', true, 1,
    '통계 분석을 위한 정보입니다.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(1, '남성', 'male', 1),
(1, '여성', 'female', 2),
(1, '기타', 'other', 3),
(1, '응답하지 않음', 'prefer_not_to_say', 4);
```

#### Q2. 연령대
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index
) VALUES (
    1, 1, '귀하의 연령대는 어떻게 됩니까?', 'radio', true, 2
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(2, '20세 미만', 'under_20', 1),
(2, '20-29세', '20s', 2),
(2, '30-39세', '30s', 3),
(2, '40-49세', '40s', 4),
(2, '50-59세', '50s', 5),
(2, '60-69세', '60s', 6),
(2, '70세 이상', 'over_70', 7);
```

#### Q3. 거주지역
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 1, '귀하가 거주하고 계신 지역은 어디입니까?', 'dropdown', true, 3,
    '현재 주민등록상 주소지를 기준으로 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(3, '진안읍', 'jinan_eup', 1),
(3, '마령면', 'maryeong_myeon', 2),
(3, '부귀면', 'bugwi_myeon', 3),
(3, '상전면', 'sangjeon_myeon', 4),
(3, '조촌면', 'jochon_myeon', 5),
(3, '주천면', 'jucheon_myeon', 6),
(3, '용담면', 'yongdam_myeon', 7),
(3, '정천면', 'jeongcheon_myeon', 8),
(3, '백운면', 'baekun_myeon', 9),
(3, '성수면', 'seongsu_myeon', 10),
(3, '안천면', 'ancheon_myeon', 11),
(3, '동향면', 'donghyang_myeon', 12);
```

#### Q4. 직업
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index
) VALUES (
    1, 1, '귀하의 직업은 무엇입니까?', 'radio', true, 4
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(4, '농업/축산업/임업', 'agriculture', 1),
(4, '자영업/소상공인', 'self_employed', 2),
(4, '회사원/공무원', 'office_worker', 3),
(4, '전문직 (의료진, 교사, 변호사 등)', 'professional', 4),
(4, '주부', 'housewife', 5),
(4, '학생', 'student', 6),
(4, '무직/은퇴', 'unemployed', 7),
(4, '기타', 'other', 8);
```

### 섹션 2: 현재 정책 참여 현황

#### Q5. 진안군 정책 관심도
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    scale_min, scale_max, scale_labels
) VALUES (
    1, 2, '평소 진안군의 행정정책에 대한 관심도는 어느 정도입니까?', 'scale', true, 5,
    1, 5, '{"1": "전혀 관심없음", "2": "관심없음", "3": "보통", "4": "관심있음", "5": "매우 관심있음"}'
);
```

#### Q6. 현재 정책 참여 경험
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 2, '최근 2년간 진안군 정책 수립 과정에 참여한 경험이 있습니까?', 'checkbox', true, 6,
    '해당되는 모든 항목을 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(6, '주민설명회 참석', 'town_meeting', 1),
(6, '공청회 참석', 'public_hearing', 2),
(6, '온라인 의견 제출', 'online_opinion', 3),
(6, '전화/서면 의견 제출', 'offline_opinion', 4),
(6, '군의회 방청', 'council_observation', 5),
(6, '주민자치위원회 활동', 'resident_committee', 6),
(6, '마을회의 참석', 'village_meeting', 7),
(6, '참여 경험 없음', 'no_experience', 8);
```

#### Q7. 정책 정보 취득 경로
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 2, '주로 어떤 경로를 통해 진안군의 정책 정보를 얻으십니까?', 'checkbox', true, 7,
    '가장 많이 이용하는 순서대로 최대 3개까지 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(7, '진안군 홈페이지', 'official_website', 1),
(7, '진안군 소셜미디어 (페이스북, 인스타그램 등)', 'social_media', 2),
(7, '지역 언론 (신문, 방송)', 'local_media', 3),
(7, '마을 방송', 'village_broadcast', 4),
(7, '이웃/지인을 통해', 'word_of_mouth', 5),
(7, '현수막/게시판', 'offline_notice', 6),
(7, '문자메시지/카카오톡', 'mobile_message', 7),
(7, '정책정보를 거의 접하지 않음', 'rarely_access', 8);
```

### 섹션 3: 디지털 여론조사에 대한 인식

#### Q8. 디지털 기기 활용 능력
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    scale_min, scale_max, scale_labels
) VALUES (
    1, 3, '귀하의 스마트폰/컴퓨터 활용 능력은 어느 정도입니까?', 'scale', true, 8,
    1, 5, '{"1": "매우 서툼", "2": "서툼", "3": "보통", "4": "능숙", "5": "매우 능숙"}'
);
```

#### Q9. 온라인 설문조사 참여 경험
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index
) VALUES (
    1, 3, '온라인 설문조사에 참여해 본 경험이 있습니까?', 'radio', true, 9
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(9, '자주 참여한다 (월 1회 이상)', 'frequent', 1),
(9, '가끔 참여한다 (분기 1회 정도)', 'sometimes', 2),
(9, '거의 참여하지 않는다 (년 1-2회)', 'rarely', 3),
(9, '참여해 본 적이 없다', 'never', 4);
```

#### Q10. 대규모 여론조사 필요성 인식
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text, scale_min, scale_max, scale_labels
) VALUES (
    1, 3, '진안군에서 중요한 정책을 결정할 때 많은 군민의 의견을 수렴하는 대규모 여론조사가 필요하다고 생각하십니까?', 'scale', true, 10,
    '1-2명이 아닌 수백-수천명 규모의 의견 수렴을 의미합니다.',
    1, 5, '{"1": "전혀 필요없음", "2": "필요없음", "3": "보통", "4": "필요함", "5": "매우 필요함"}'
);
```

#### Q11. 디지털 여론조사 vs 기존 방식 선호도
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 3, '여론조사 방식으로 어떤 것을 선호하십니까?', 'radio', true, 11,
    '각각의 장단점을 고려하여 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(11, '스마트폰/컴퓨터를 활용한 온라인 조사 (편리하고 빠름)', 'digital_only', 1),
(11, '대면 조사 (설명회, 공청회 등)', 'offline_only', 2),
(11, '온라인과 대면 조사를 병행', 'hybrid', 3),
(11, '전화 조사', 'phone', 4),
(11, '우편 조사', 'mail', 5);
```

#### Q12. 디지털 여론조사의 장점 (복수선택)
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 3, '핸드폰/컴퓨터를 활용한 여론조사의 장점은 무엇이라고 생각하십니까?', 'checkbox', true, 12,
    '해당되는 모든 항목을 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(12, '시간과 장소에 구애받지 않음', 'flexibility', 1),
(12, '더 많은 사람이 참여할 수 있음', 'accessibility', 2),
(12, '솔직한 의견 표현 가능', 'honest_opinion', 3),
(12, '빠른 결과 확인', 'quick_results', 4),
(12, '비용 절약', 'cost_effective', 5),
(12, '환경 친화적 (종이 사용 안함)', 'eco_friendly', 6),
(12, '젊은 세대 참여 증가', 'youth_participation', 7),
(12, '데이터 분석이 용이함', 'easy_analysis', 8),
(12, '장점이 없다고 생각함', 'no_advantage', 9);
```

#### Q13. 디지털 여론조사 우려사항
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 3, '핸드폰/컴퓨터를 활용한 여론조사에 대한 우려사항은 무엇입니까?', 'checkbox', false, 13,
    '우려되는 모든 항목을 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(13, '개인정보 보안 문제', 'privacy_concern', 1),
(13, '디지털 격차로 인한 참여 불평등', 'digital_divide', 2),
(13, '인터넷 조작 가능성', 'manipulation_risk', 3),
(13, '중복 참여 문제', 'duplicate_participation', 4),
(13, '깊이 있는 토론 부족', 'lack_discussion', 5),
(13, '고령층 참여 어려움', 'elderly_difficulty', 6),
(13, '기술적 문제 발생 가능성', 'technical_issues', 7),
(13, '특별한 우려사항 없음', 'no_concern', 8);
```

### 섹션 4: 정책 분야별 여론조사 필요성

#### Q14. 정책 분야별 여론조사 필요성 평가 (매트릭스)
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text, matrix_rows, matrix_columns
) VALUES (
    1, 4, '다음 정책 분야별로 대규모 여론조사의 필요성을 평가해 주세요.', 'matrix', true, 14,
    '각 분야별로 여론조사가 얼마나 필요한지 평가해 주세요.',
    '["농업/축산업 정책", "관광/문화 정책", "교통/도로 정책", "복지/보건 정책", "교육/청소년 정책", "환경/에너지 정책", "경제/일자리 정책", "안전/재난 정책", "주택/도시계획", "예산 편성"]',
    '["매우 불필요", "불필요", "보통", "필요", "매우 필요"]'
);
```

### 섹션 5: 개선 방안 및 기대효과

#### Q15. 참여 유도 방안
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 5, '더 많은 군민이 디지털 여론조사에 참여하도록 하려면 어떤 방안이 필요합니까?', 'checkbox', true, 15,
    '효과적이라고 생각하는 모든 방안을 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(15, '참여자 인센티브 제공 (상품권, 추첨 등)', 'incentives', 1),
(15, '사용법 교육 프로그램 운영', 'education_program', 2),
(15, '간단하고 직관적인 설문 시스템', 'simple_interface', 3),
(15, '다양한 홍보 채널 활용', 'diverse_promotion', 4),
(15, '지역 리더들의 적극적 참여 독려', 'leader_encouragement', 5),
(15, '오프라인 지원센터 운영', 'offline_support', 6),
(15, '모바일 앱 개발', 'mobile_app', 7),
(15, '결과 공개 및 정책 반영 내용 안내', 'result_feedback', 8);
```

#### Q16. 기대효과
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    scale_min, scale_max, scale_labels
) VALUES (
    1, 5, '대규모 디지털 여론조사 도입이 진안군 행정에 긍정적 영향을 줄 것이라고 생각하십니까?', 'scale', true, 16,
    1, 5, '{"1": "전혀 그렇지 않다", "2": "그렇지 않다", "3": "보통이다", "4": "그렇다", "5": "매우 그렇다"}'
);
```

#### Q17. 우선 도입 분야
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text
) VALUES (
    1, 5, '대규모 여론조사를 가장 우선적으로 도입해야 할 정책 분야는 무엇이라고 생각하십니까?', 'radio', true, 17,
    '가장 시급하다고 생각하는 한 분야를 선택해 주세요.'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(17, '농업/축산업 정책', 'agriculture_policy', 1),
(17, '관광/문화 정책', 'tourism_culture', 2),
(17, '교통/도로 정책', 'transportation', 3),
(17, '복지/보건 정책', 'welfare_health', 4),
(17, '교육/청소년 정책', 'education_youth', 5),
(17, '환경/에너지 정책', 'environment_energy', 6),
(17, '경제/일자리 정책', 'economy_jobs', 7),
(17, '예산 편성', 'budget_planning', 8);
```

#### Q18. 추가 의견 및 제안사항
```sql
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text, placeholder
) VALUES (
    1, 5, '진안군의 디지털 여론조사 도입에 대한 추가 의견이나 제안사항이 있으시면 자유롭게 작성해 주세요.', 'textarea', false, 18,
    '건설적인 의견과 제안을 환영합니다.',
    '예: 특정 연령층을 위한 지원 방안, 기술적 개선사항, 운영 방식 제안 등'
);
```

## 조건부 로직 설정 (survey_logic 테이블)

### 로직 1: 디지털 기기 활용 능력이 낮은 경우 추가 질문
```sql
INSERT INTO survey_logic (
    survey_id, trigger_question_id, trigger_condition, 
    action_type, target_question_id, action_data
) VALUES (
    1, 8, '{"scale_value": {"less_than": 3}}',
    'show_question', 19,
    '{"additional_help": true}'
);

-- 추가 질문: 디지털 지원 필요성
INSERT INTO questions (
    survey_id, section_id, question_text, question_type, is_required, order_index,
    help_text, display_logic
) VALUES (
    1, 3, '스마트폰/컴퓨터 사용이 어려우시다면, 어떤 지원이 있으면 도움이 될까요?', 'checkbox', false, 19,
    '해당되는 모든 항목을 선택해 주세요.',
    '{"show_if": {"question_8": {"scale_value": {"less_than": 3}}}}'
);

INSERT INTO options (question_id, option_text, option_value, order_index) VALUES 
(19, '가족/지인의 도움', 'family_help', 1),
(19, '동네 지원센터', 'community_center', 2),
(19, '전화 상담 서비스', 'phone_support', 3),
(19, '방문 교육 서비스', 'home_education', 4),
(19, '간단한 사용법 안내서', 'simple_manual', 5),
(19, '도움이 필요하지 않음', 'no_help_needed', 6);
```

## 알림 설정 (notifications 테이블)

### 응답 완료 시 관리자 알림
```sql
INSERT INTO notifications (
    survey_id, type, trigger_event, recipient_type, 
    recipient_email, message_template, is_active, created_by
) VALUES (
    1, 'email', 'response_received', 'admin',
    'policy@jinan.go.kr',
    '진안군 대규모 여론조사 필요성 설문에 새로운 응답이 접수되었습니다.\n\n응답자 정보:\n- 응답 시간: {{completed_at}}\n- 거주지역: {{location}}\n- 연령대: {{age_group}}\n\n관리자 페이지에서 상세 내용을 확인하실 수 있습니다.',
    true, 1
);
```

### 목표 응답수 달성 시 알림
```sql
INSERT INTO notifications (
    survey_id, type, trigger_event, recipient_type,
    recipient_email, message_template, is_active, created_by
) VALUES (
    1, 'email', 'goal_reached', 'admin',
    'policy@jinan.go.kr',
    '진안군 대규모 여론조사 필요성 설문이 목표 응답수에 도달했습니다.\n\n현재 응답수: {{response_count}}명\n목표 응답수: 1,000명\n\n결과 분석을 시작하실 수 있습니다.',
    true, 1
);
```

## 태그 설정 (tags, survey_tags 테이블)

```sql
INSERT INTO tags (name, color, description, created_by) VALUES 
('정책조사', '#007bff', '행정정책 관련 설문조사', 1),
('여론조사', '#28a745', '군민 여론 수렴 설문', 1),
('디지털정부', '#6f42c1', '디지털 전환 관련 설문', 1),
('진안군', '#dc3545', '진안군 특화 설문', 1);

INSERT INTO survey_tags (survey_id, tag_id) VALUES 
(1, 1), (1, 2), (1, 3), (1, 4);
```

## 예상 분석 결과 활용 방안

### 1. 기본 통계 분석
- 응답자 특성별 (연령, 지역, 직업) 여론조사 필요성 인식 차이
- 디지털 역량과 디지털 여론조사 선호도 상관관계
- 정책 분야별 여론조사 필요성 우선순위

### 2. 교차 분석
- 거주지역별 정책 관심 분야 차이
- 연령대별 디지털 여론조사 장단점 인식 차이
- 정책 참여 경험과 여론조사 필요성 인식 관계

### 3. 정책 활용 방안
- 디지털 여론조사 시스템 도입 로드맵 수립
- 연령별·지역별 맞춤형 참여 증진 방안 마련
- 우선 도입 정책 분야 선정 및 시범 운영 계획 수립

이 설문조사는 진안군의 디지털 정부 구현과 주민 참여 확대를 위한 중요한 기초 자료를 제공할 것입니다.