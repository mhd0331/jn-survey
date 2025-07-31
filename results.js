// 전역 변수
let surveyData = null;
let responseData = [];
let charts = {};
let currentFilters = {
    age: '',
    gender: '',
    location: ''
};

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', async () => {
    await loadSurveyData();
    await loadResults();
    initializeFilters();
    updateLastUpdateTime();
});

// 설문 구조 데이터 로드
async function loadSurveyData() {
    try {
        const response = await fetch('./data.json');
        surveyData = await response.json();
    } catch (error) {
        console.error('설문 데이터 로드 실패:', error);
    }
}

// 결과 데이터 로드
async function loadResults() {
    showLoading(true);
    
    try {
        // 실제 환경에서는 서버에서 데이터를 가져옴
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // 개발 환경: 더미 데이터 생성
            responseData = generateDummyData(500);
        } else {
            // 프로덕션: 서버에서 데이터 로드
            const response = await fetch('/api/surveys/results');
            responseData = await response.json();
        }
        
        // 데이터 처리 및 차트 그리기
        processAndDisplayResults();
        
    } catch (error) {
        console.error('결과 로드 실패:', error);
        alert('결과 데이터를 불러올 수 없습니다.');
    } finally {
        showLoading(false);
    }
}

// 더미 데이터 생성 (개발용)
function generateDummyData(count) {
    const data = [];
    const locations = ['jinan_eup', 'maryeong_myeon', 'bugwi_myeon', 'sangjeon_myeon', 'jochon_myeon', 
                      'jucheon_myeon', 'yongdam_myeon', 'jeongcheon_myeon', 'baekun_myeon', 
                      'seongsu_myeon', 'ancheon_myeon', 'donghyang_myeon'];
    const ages = ['under_20', '20s', '30s', '40s', '50s', '60s', 'over_70'];
    const genders = ['male', 'female', 'other', 'prefer_not_to_say'];
    const occupations = ['agriculture', 'self_employed', 'office_worker', 'professional', 
                        'housewife', 'student', 'unemployed', 'other'];
    
    for (let i = 0; i < count; i++) {
        const response = {
            id: `RES-${Date.now()}-${i}`,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            responses: {
                // 기본정보
                gender: weightedRandom(genders, [0.45, 0.45, 0.05, 0.05]),
                age: weightedRandom(ages, [0.05, 0.15, 0.20, 0.25, 0.20, 0.10, 0.05]),
                location: locations[Math.floor(Math.random() * locations.length)],
                occupation: occupations[Math.floor(Math.random() * occupations.length)],
                
                // 정책 참여
                policy_interest: Math.floor(Math.random() * 5) + 1,
                participation_experience: randomMultiSelect(['town_meeting', 'public_hearing', 
                    'online_opinion', 'offline_opinion', 'council_observation', 
                    'resident_committee', 'village_meeting', 'no_experience'], 0.3),
                info_source: randomMultiSelect(['official_website', 'social_media', 'local_media',
                    'village_broadcast', 'word_of_mouth', 'offline_notice', 
                    'mobile_message', 'rarely_access'], 0.4),
                
                // 디지털 인식
                digital_skills: Math.floor(Math.random() * 5) + 1,
                online_survey_experience: weightedRandom(['frequent', 'sometimes', 'rarely', 'never'], 
                    [0.1, 0.3, 0.4, 0.2]),
                survey_necessity: Math.floor(Math.random() * 5) + 1,
                survey_preference: weightedRandom(['digital_only', 'offline_only', 'hybrid', 
                    'phone', 'mail'], [0.3, 0.1, 0.4, 0.15, 0.05]),
                digital_advantages: randomMultiSelect(['flexibility', 'accessibility', 'honest_opinion',
                    'quick_results', 'cost_effective', 'eco_friendly', 
                    'youth_participation', 'easy_analysis'], 0.5),
                digital_concerns: randomMultiSelect(['privacy_concern', 'digital_divide', 
                    'manipulation_risk', 'duplicate_participation', 'lack_discussion',
                    'elderly_difficulty', 'technical_issues'], 0.4),
                
                // 개선방안
                participation_methods: randomMultiSelect(['incentives', 'education_program', 
                    'simple_interface', 'diverse_promotion', 'leader_encouragement',
                    'offline_support', 'mobile_app', 'result_feedback'], 0.5),
                expected_effect: Math.floor(Math.random() * 5) + 1,
                priority_area: weightedRandom(['agriculture_policy', 'tourism_culture', 
                    'transportation', 'welfare_health', 'education_youth',
                    'environment_energy', 'economy_jobs', 'budget_planning'], 
                    [0.2, 0.15, 0.15, 0.15, 0.1, 0.1, 0.1, 0.05]),
                additional_comments: Math.random() > 0.7 ? generateRandomComment() : null
            }
        };
        
        data.push(response);
    }
    
    return data;
}

// 가중치 기반 랜덤 선택
function weightedRandom(options, weights) {
    const total = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < options.length; i++) {
        random -= weights[i];
        if (random <= 0) return options[i];
    }
    
    return options[options.length - 1];
}

// 다중 선택 랜덤
function randomMultiSelect(options, probability) {
    const selected = [];
    options.forEach(option => {
        if (Math.random() < probability) {
            selected.push(option);
        }
    });
    
    // 최소 1개는 선택
    if (selected.length === 0) {
        selected.push(options[Math.floor(Math.random() * options.length)]);
    }
    
    return selected;
}

// 랜덤 코멘트 생성
function generateRandomComment() {
    const comments = [
        "디지털 여론조사 도입으로 더 많은 군민의 의견을 들을 수 있었으면 좋겠습니다.",
        "어르신들을 위한 교육 프로그램이 꼭 필요할 것 같습니다.",
        "개인정보 보호에 대한 확실한 대책이 필요합니다.",
        "모바일 앱으로 쉽게 참여할 수 있으면 좋겠어요.",
        "결과가 실제 정책에 반영되는지 투명하게 공개해주세요.",
        "오프라인 지원센터를 각 면마다 운영하면 좋겠습니다.",
        "젊은 세대도 관심을 가질 수 있도록 홍보가 필요합니다.",
        "설문 시간이 너무 길지 않았으면 좋겠습니다.",
        "참여 인센티브보다는 실질적인 정책 반영이 더 중요합니다.",
        "정기적으로 여론조사를 실시해서 지속적인 소통이 되면 좋겠습니다."
    ];
    
    return comments[Math.floor(Math.random() * comments.length)];
}

// 결과 처리 및 표시
function processAndDisplayResults() {
    // 필터 적용
    const filteredData = applyDataFilters(responseData);
    
    // 요약 통계 업데이트
    updateSummaryCards(filteredData);
    
    // 차트 업데이트
    updateAllCharts(filteredData);
    
    // 인사이트 생성
    generateInsights(filteredData);
    
    // 코멘트 분석
    analyzeComments(filteredData);
}

// 데이터 필터링
function applyDataFilters(data) {
    return data.filter(response => {
        if (currentFilters.age && response.responses.age !== currentFilters.age) return false;
        if (currentFilters.gender && response.responses.gender !== currentFilters.gender) return false;
        if (currentFilters.location && response.responses.location !== currentFilters.location) return false;
        return true;
    });
}

// 요약 카드 업데이트
function updateSummaryCards(data) {
    // 전체 응답자
    document.getElementById('totalResponses').textContent = data.length.toLocaleString();
    
    // 응답률 (목표 대비)
    const targetResponses = surveyData.survey.maxResponses;
    const responseRate = (data.length / targetResponses * 100).toFixed(1);
    document.getElementById('responseRate').textContent = responseRate;
    
    // 평균 소요시간 (더미)
    document.getElementById('avgTime').textContent = '7.3';
    
    // 수집 기간
    if (data.length > 0) {
        const dates = data.map(r => new Date(r.timestamp));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
        document.getElementById('collectionDays').textContent = days;
    }
}

// 모든 차트 업데이트
function updateAllCharts(data) {
    // 기존 차트 제거
    Object.values(charts).forEach(chart => chart.destroy());
    charts = {};
    
    // 1. 기본정보 차트
    charts.gender = createPieChart('genderChart', data, 'gender', {
        male: '남성',
        female: '여성',
        other: '기타',
        prefer_not_to_say: '미응답'
    });
    
    charts.age = createBarChart('ageChart', data, 'age', {
        under_20: '20세 미만',
        '20s': '20대',
        '30s': '30대',
        '40s': '40대',
        '50s': '50대',
        '60s': '60대',
        over_70: '70세 이상'
    });
    
    charts.location = createHorizontalBarChart('locationChart', data, 'location', {
        jinan_eup: '진안읍',
        maryeong_myeon: '마령면',
        bugwi_myeon: '부귀면',
        sangjeon_myeon: '상전면',
        jochon_myeon: '조촌면',
        jucheon_myeon: '주천면',
        yongdam_myeon: '용담면',
        jeongcheon_myeon: '정천면',
        baekun_myeon: '백운면',
        seongsu_myeon: '성수면',
        ancheon_myeon: '안천면',
        donghyang_myeon: '동향면'
    });
    
    charts.occupation = createDoughnutChart('occupationChart', data, 'occupation', {
        agriculture: '농업/축산업/임업',
        self_employed: '자영업/소상공인',
        office_worker: '회사원/공무원',
        professional: '전문직',
        housewife: '주부',
        student: '학생',
        unemployed: '무직/은퇴',
        other: '기타'
    });
    
    // 2. 정책 참여 차트
    charts.interest = createScaleChart('interestChart', data, 'policy_interest');
    charts.participation = createMultiBarChart('participationChart', data, 'participation_experience', {
        town_meeting: '주민설명회',
        public_hearing: '공청회',
        online_opinion: '온라인 의견',
        offline_opinion: '전화/서면',
        council_observation: '군의회 방청',
        resident_committee: '주민자치위',
        village_meeting: '마을회의',
        no_experience: '경험 없음'
    });
    
    // 2. 정보 획득 경로 차트 추가
    charts.infoSource = createMultiBarChart('infoSourceChart', data, 'info_source', {
        official_website: '진안군 홈페이지',
        social_media: '소셜미디어',
        local_media: '지역 언론',
        village_broadcast: '마을 방송',
        word_of_mouth: '이웃/지인',
        offline_notice: '현수막/게시판',
        mobile_message: '문자/카카오톡',
        rarely_access: '거의 접하지 않음'
    });
    
    // 3. 디지털 인식 차트 (추가 차트 포함)
    charts.digitalSkills = createScaleChart('digitalSkillsChart', data, 'digital_skills');
    charts.surveyExperience = createPieChart('surveyExperienceChart', data, 'online_survey_experience', {
        frequent: '자주 참여',
        sometimes: '가끔 참여',
        rarely: '거의 안함',
        never: '경험 없음'
    });
    charts.necessity = createScaleChart('necessityChart', data, 'survey_necessity');
    charts.preference = createPieChart('preferenceChart', data, 'survey_preference', {
        digital_only: '온라인만',
        offline_only: '대면만',
        hybrid: '병행',
        phone: '전화',
        mail: '우편'
    });
    
    // 디지털 조사의 장점 차트
    charts.advantages = createMultiBarChart('advantagesChart', data, 'digital_advantages', {
        flexibility: '시간/장소 자유',
        accessibility: '많은 참여 가능',
        honest_opinion: '솔직한 의견',
        quick_results: '빠른 결과',
        cost_effective: '비용 절약',
        eco_friendly: '환경 친화적',
        youth_participation: '젊은 세대 참여',
        easy_analysis: '분석 용이',
        no_advantage: '장점 없음'
    });
    
    // 디지털 조사의 우려사항 차트
    charts.concerns = createMultiBarChart('concernsChart', data, 'digital_concerns', {
        privacy_concern: '개인정보 보안',
        digital_divide: '디지털 격차',
        manipulation_risk: '조작 가능성',
        duplicate_participation: '중복 참여',
        lack_discussion: '토론 부족',
        elderly_difficulty: '고령층 어려움',
        technical_issues: '기술적 문제',
        no_concern: '우려 없음'
    });
    
    // 4. 개선방안 차트
    charts.methods = createMultiBarChart('methodsChart', data, 'participation_methods', {
        incentives: '인센티브',
        education_program: '교육 프로그램',
        simple_interface: '간단한 시스템',
        diverse_promotion: '다양한 홍보',
        leader_encouragement: '리더 독려',
        offline_support: '오프라인 지원',
        mobile_app: '모바일 앱',
        result_feedback: '결과 공개'
    });
    
    charts.effect = createScaleChart('effectChart', data, 'expected_effect');
    charts.priority = createPieChart('priorityChart', data, 'priority_area', {
        agriculture_policy: '농업/축산업',
        tourism_culture: '관광/문화',
        transportation: '교통/도로',
        welfare_health: '복지/보건',
        education_youth: '교육/청소년',
        environment_energy: '환경/에너지',
        economy_jobs: '경제/일자리',
        budget_planning: '예산 편성'
    });
}

// 파이 차트 생성
function createPieChart(canvasId, data, field, labels) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const counts = {};
    
    data.forEach(response => {
        const value = response.responses[field];
        counts[value] = (counts[value] || 0) + 1;
    });
    
    return new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(counts).map(key => labels[key] || key),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: [
                    '#2c5aa0',
                    '#667eea',
                    '#f687b3',
                    '#fbbf24',
                    '#34d399',
                    '#a78bfa',
                    '#f59e0b',
                    '#10b981'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 도넛 차트 생성
function createDoughnutChart(canvasId, data, field, labels) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const counts = {};
    
    data.forEach(response => {
        const value = response.responses[field];
        counts[value] = (counts[value] || 0) + 1;
    });
    
    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts).map(key => labels[key] || key),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: [
                    '#2c5aa0',
                    '#667eea',
                    '#f687b3',
                    '#fbbf24',
                    '#34d399',
                    '#a78bfa',
                    '#f59e0b',
                    '#10b981'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 막대 차트 생성
function createBarChart(canvasId, data, field, labels) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const counts = {};
    const order = Object.keys(labels);
    
    order.forEach(key => counts[key] = 0);
    
    data.forEach(response => {
        const value = response.responses[field];
        if (counts.hasOwnProperty(value)) {
            counts[value]++;
        }
    });
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: order.map(key => labels[key]),
            datasets: [{
                label: '응답 수',
                data: order.map(key => counts[key]),
                backgroundColor: '#2c5aa0'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 수평 막대 차트 생성
function createHorizontalBarChart(canvasId, data, field, labels) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const counts = {};
    
    Object.keys(labels).forEach(key => counts[key] = 0);
    
    data.forEach(response => {
        const value = response.responses[field];
        if (counts.hasOwnProperty(value)) {
            counts[value]++;
        }
    });
    
    // 값이 큰 순서로 정렬
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sorted.map(([key]) => labels[key]),
            datasets: [{
                label: '응답 수',
                data: sorted.map(([, value]) => value),
                backgroundColor: '#667eea'
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 척도 차트 생성
function createScaleChart(canvasId, data, field) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
    
    data.forEach(response => {
        const value = response.responses[field];
        if (value >= 1 && value <= 5) {
            counts[value]++;
        }
    });
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['매우 낮음', '낮음', '보통', '높음', '매우 높음'],
            datasets: [{
                label: '응답 수',
                data: [counts[1], counts[2], counts[3], counts[4], counts[5]],
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#eab308',
                    '#22c55e',
                    '#10b981'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 다중 선택 차트 생성
function createMultiBarChart(canvasId, data, field, labels) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const counts = {};
    
    Object.keys(labels).forEach(key => counts[key] = 0);
    
    data.forEach(response => {
        const values = response.responses[field];
        if (Array.isArray(values)) {
            values.forEach(value => {
                if (counts.hasOwnProperty(value)) {
                    counts[value]++;
                }
            });
        }
    });
    
    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(labels).map(key => labels[key]),
            datasets: [{
                label: '선택 수',
                data: Object.keys(labels).map(key => counts[key]),
                backgroundColor: '#34d399'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 인사이트 생성
function generateInsights(data) {
    const insights = [];
    
    // 디지털 활용 능력 분석
    const digitalSkills = data.map(r => r.responses.digital_skills);
    const avgSkill = digitalSkills.reduce((a, b) => a + b, 0) / digitalSkills.length;
    const lowSkillCount = digitalSkills.filter(s => s < 3).length;
    const lowSkillPercent = (lowSkillCount / data.length * 100).toFixed(1);
    
    if (lowSkillPercent > 30) {
        insights.push(`응답자의 ${lowSkillPercent}%가 디지털 활용에 어려움을 겪고 있어 교육 지원이 필요합니다.`);
    }
    
    // 연령대별 디지털 격차
    const youngDigital = data.filter(r => ['20s', '30s'].includes(r.responses.age))
        .map(r => r.responses.digital_skills);
    const oldDigital = data.filter(r => ['60s', 'over_70'].includes(r.responses.age))
        .map(r => r.responses.digital_skills);
    
    if (youngDigital.length > 0 && oldDigital.length > 0) {
        const youngAvg = youngDigital.reduce((a, b) => a + b, 0) / youngDigital.length;
        const oldAvg = oldDigital.reduce((a, b) => a + b, 0) / oldDigital.length;
        
        if (youngAvg - oldAvg > 2) {
            insights.push(`젊은 세대와 고령층 간 디지털 활용 능력 격차가 크게 나타났습니다.`);
        }
    }
    
    // 여론조사 필요성 인식
    const necessityHigh = data.filter(r => r.responses.survey_necessity >= 4).length;
    const necessityPercent = (necessityHigh / data.length * 100).toFixed(1);
    
    if (necessityPercent > 70) {
        insights.push(`응답자의 ${necessityPercent}%가 대규모 여론조사가 필요하다고 응답했습니다.`);
    }
    
    // 선호 방식
    const preferenceCount = {};
    data.forEach(r => {
        const pref = r.responses.survey_preference;
        preferenceCount[pref] = (preferenceCount[pref] || 0) + 1;
    });
    
    const topPreference = Object.entries(preferenceCount)
        .sort((a, b) => b[1] - a[1])[0];
    
    const prefLabels = {
        digital_only: '온라인 조사',
        offline_only: '대면 조사',
        hybrid: '온라인과 대면 병행',
        phone: '전화 조사',
        mail: '우편 조사'
    };
    
    insights.push(`가장 선호하는 조사 방식은 '${prefLabels[topPreference[0]]}'입니다.`);
    
    // 참여 촉진 방안
    const methodCounts = {};
    data.forEach(r => {
        const methods = r.responses.participation_methods;
        if (Array.isArray(methods)) {
            methods.forEach(method => {
                methodCounts[method] = (methodCounts[method] || 0) + 1;
            });
        }
    });
    
    const topMethod = Object.entries(methodCounts)
        .sort((a, b) => b[1] - a[1])[0];
    
    const methodLabels = {
        incentives: '인센티브 제공',
        education_program: '교육 프로그램',
        simple_interface: '간단한 시스템',
        diverse_promotion: '다양한 홍보',
        leader_encouragement: '리더 독려',
        offline_support: '오프라인 지원',
        mobile_app: '모바일 앱',
        result_feedback: '결과 공개'
    };
    
    if (topMethod) {
        insights.push(`참여 촉진을 위해 '${methodLabels[topMethod[0]]}'이 가장 효과적일 것으로 평가되었습니다.`);
    }
    
    // 인사이트 표시
    const insightsList = document.getElementById('digitalInsights');
    insightsList.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
}

// 코멘트 분석
function analyzeComments(data) {
    const comments = data
        .filter(r => r.responses.additional_comments)
        .map(r => r.responses.additional_comments);
    
    if (comments.length === 0) {
        document.getElementById('wordCloud').innerHTML = '<p style="text-align: center; color: #999;">제출된 의견이 없습니다.</p>';
        document.getElementById('topComments').innerHTML = '<p style="color: #999;">제출된 의견이 없습니다.</p>';
        return;
    }
    
    // 워드 클라우드 생성 (간단한 버전)
    const wordCount = {};
    const keywords = ['디지털', '여론조사', '교육', '어르신', '참여', '정책', '온라인', 
                     '홍보', '지원', '개인정보', '투명', '반영', '필요', '프로그램'];
    
    comments.forEach(comment => {
        keywords.forEach(keyword => {
            if (comment.includes(keyword)) {
                wordCount[keyword] = (wordCount[keyword] || 0) + 1;
            }
        });
    });
    
    const wordCloudHTML = Object.entries(wordCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12)
        .map(([word, count], index) => {
            const size = index < 3 ? 'large' : index < 7 ? 'medium' : 'small';
            return `<span class="word-item ${size}">${word}</span>`;
        })
        .join('');
    
    document.getElementById('wordCloud').innerHTML = wordCloudHTML || '<p style="text-align: center; color: #999;">키워드를 추출할 수 없습니다.</p>';
    
    // 대표 의견 표시
    const topCommentsHTML = comments
        .slice(0, 5)
        .map(comment => `<div class="comment-item">${comment}</div>`)
        .join('');
    
    document.getElementById('topComments').innerHTML = topCommentsHTML;
}

// 필터 초기화
function initializeFilters() {
    document.getElementById('filterAge').addEventListener('change', e => {
        currentFilters.age = e.target.value;
    });
    
    document.getElementById('filterGender').addEventListener('change', e => {
        currentFilters.gender = e.target.value;
    });
    
    document.getElementById('filterLocation').addEventListener('change', e => {
        currentFilters.location = e.target.value;
    });
}

// 필터 적용
function applyFilters() {
    processAndDisplayResults();
}

// 필터 초기화
function resetFilters() {
    currentFilters = { age: '', gender: '', location: '' };
    document.getElementById('filterAge').value = '';
    document.getElementById('filterGender').value = '';
    document.getElementById('filterLocation').value = '';
    processAndDisplayResults();
}

// 데이터 내보내기
async function exportData(format) {
    if (format === 'excel') {
        alert('Excel 파일 다운로드 기능은 준비 중입니다.');
        // 실제 구현 시 SheetJS 등을 사용
    } else if (format === 'pdf') {
        alert('PDF 보고서 생성 기능은 준비 중입니다.');
        // 실제 구현 시 jsPDF 등을 사용
    }
}

// 로딩 표시
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

// 마지막 업데이트 시간
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = timeString;
}