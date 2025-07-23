// 전역 변수
let surveyData = null;
let deferredPrompt = null;
let responses = {};

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', async () => {
    // Service Worker 등록 (프로덕션 환경에서만)
    if (window.location.protocol === 'https:') {
        registerServiceWorker();
    }
    
    // 설치 프롬프트 이벤트 리스너
    setupInstallPrompt();
    
    // 오프라인 감지
    setupOfflineDetection();
    
    // 설문 데이터 로드
    await loadSurveyData();
    
    // 이벤트 리스너 초기화
    initializeEventListeners();
    
    // 저장된 응답 복원
    restoreSavedResponses();
    
    // 초기 진행률 업데이트
    updateProgress();
});

// Service Worker 등록
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker 등록 성공');
        } catch (error) {
            console.log('Service Worker 등록 건너뜀:', error.message);
        }
    }
}

// 설치 프롬프트 설정
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        const installPrompt = document.getElementById('installPrompt');
        installPrompt.style.display = 'block';
        
        document.getElementById('installNow').addEventListener('click', async () => {
            installPrompt.style.display = 'none';
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`설치 ${outcome === 'accepted' ? '수락' : '거절'}`);
            deferredPrompt = null;
        });
        
        document.getElementById('installLater').addEventListener('click', () => {
            installPrompt.style.display = 'none';
        });
    });
}

// 오프라인 감지 설정
function setupOfflineDetection() {
    const offlineNotice = document.getElementById('offlineNotice');
    
    function checkNetworkStatus() {
        if (!navigator.onLine && window.location.protocol !== 'file:') {
            offlineNotice.classList.add('show');
        } else {
            offlineNotice.classList.remove('show');
        }
    }
    
    window.addEventListener('online', () => {
        offlineNotice.classList.remove('show');
        syncResponses();
    });
    
    window.addEventListener('offline', () => {
        checkNetworkStatus();
    });
    
    // 초기 상태 확인
    checkNetworkStatus();
}

// 설문 데이터 로드
async function loadSurveyData() {
    try {
        // data.json 파일 로드 시도
        const response = await fetch('./data.json');
        
        if (response.ok) {
            surveyData = await response.json();
            console.log('data.json 파일 로드 성공');
        } else {
            throw new Error('data.json 파일을 찾을 수 없습니다');
        }
        
        // 데이터 유효성 검증
        if (!surveyData.survey || !surveyData.sections || !surveyData.questions) {
            throw new Error('잘못된 데이터 형식');
        }
        
        buildSurvey(surveyData);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('surveyContainer').style.display = 'block';
        
    } catch (error) {
        console.error('설문 데이터 로드 오류:', error);
        
        // 기본 데이터로 폴백
        console.log('기본 데이터 사용');
        surveyData = getDefaultSurveyData();
        buildSurvey(surveyData);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('surveyContainer').style.display = 'block';
    }
}

// 기본 설문 데이터
function getDefaultSurveyData() {
    return {
        "survey": {
            "id": "jinan-policy-survey-2025",
            "title": "진안군 행정정책 입안 시 대규모 여론조사 필요성 조사",
            "description": "진안군에서 행정정책을 수립할 때 핸드폰이나 컴퓨터를 활용한 대규모 여론조사의 필요성과 효과성에 대한 군민 의견을 수렴하는 설문조사입니다.",
            "category": "정책조사",
            "estimatedTime": 7,
            "maxResponses": 10000,
            "period": {
                "start": "2025.07.21",
                "end": "2025.08.20"
            },
            "welcomeMessage": {
                "title": "안녕하세요, 진안군입니다.",
                "content": [
                    "본 설문조사는 진안군의 행정정책 수립 과정에서 디지털 기반 여론조사 도입에 대한 군민 여러분의 소중한 의견을 듣고자 실시됩니다.",
                    "여러분의 참여가 더 나은 진안군을 만드는 데 큰 도움이 됩니다.",
                    "※ 모든 응답은 통계 목적으로만 사용되며, 개인정보는 철저히 보호됩니다."
                ]
            },
            "thankYouMessage": {
                "title": "설문조사 완료",
                "content": [
                    "설문조사에 참여해 주셔서 감사합니다.",
                    "여러분의 소중한 의견은 진안군의 정책 수립에 반영될 예정입니다.",
                    "더 나은 진안군을 위해 함께해 주세요!"
                ]
            }
        },
        "sections": [
            {
                "id": "demographics",
                "title": "📝 1. 응답자 기본정보",
                "description": "통계 분석을 위한 기본적인 정보를 수집합니다",
                "order": 1
            },
            {
                "id": "policy_participation",
                "title": "🏛️ 2. 현재 정책 참여 현황",
                "description": "진안군 정책에 대한 현재 참여도와 관심도를 조사합니다",
                "order": 2
            }
        ],
        "questions": [
            {
                "id": "gender",
                "sectionId": "demographics",
                "order": 1,
                "text": "귀하의 성별은 무엇입니까?",
                "type": "radio",
                "required": true,
                "helpText": "통계 분석을 위한 정보입니다.",
                "options": [
                    { "value": "male", "text": "남성", "order": 1 },
                    { "value": "female", "text": "여성", "order": 2 },
                    { "value": "other", "text": "기타", "order": 3 },
                    { "value": "prefer_not_to_say", "text": "응답하지 않음", "order": 4 }
                ]
            },
            {
                "id": "age",
                "sectionId": "demographics",
                "order": 2,
                "text": "귀하의 연령대는 어떻게 됩니까?",
                "type": "radio",
                "required": true,
                "options": [
                    { "value": "under_20", "text": "20세 미만", "order": 1 },
                    { "value": "20s", "text": "20-29세", "order": 2 },
                    { "value": "30s", "text": "30-39세", "order": 3 },
                    { "value": "40s", "text": "40-49세", "order": 4 },
                    { "value": "50s", "text": "50-59세", "order": 5 },
                    { "value": "60s", "text": "60-69세", "order": 6 },
                    { "value": "over_70", "text": "70세 이상", "order": 7 }
                ]
            },
            {
                "id": "policy_interest",
                "sectionId": "policy_participation",
                "order": 3,
                "text": "평소 진안군의 행정정책에 대한 관심도는 어느 정도입니까?",
                "type": "scale",
                "required": true,
                "scaleConfig": {
                    "min": 1,
                    "max": 5,
                    "labels": {
                        "1": "전혀<br>관심없음",
                        "2": "관심없음",
                        "3": "보통",
                        "4": "관심있음",
                        "5": "매우<br>관심있음"
                    }
                }
            }
        ]
    };
}

// 설문조사 UI 구성
function buildSurvey(data) {
    // 헤더 정보 설정
    document.getElementById('surveyTitle').textContent = data.survey.title;
    document.getElementById('surveyDescription').textContent = data.survey.description;
    
    // 설문 정보 생성
    const surveyInfo = document.getElementById('surveyInfo');
    surveyInfo.innerHTML = `
        <div>📅 ${data.survey.period.start} ~ ${data.survey.period.end}</div>
        <div>⏱️ 약 ${data.survey.estimatedTime}분</div>
        <div>🎯 목표 ${data.survey.maxResponses.toLocaleString()}명</div>
    `;
    
    // 환영 메시지
    const welcomeSection = document.getElementById('welcomeSection');
    const welcome = data.survey.welcomeMessage;
    welcomeSection.innerHTML = `
        <h2>${welcome.title}</h2>
        ${welcome.content.map(p => `<p>${p}</p>`).join('')}
    `;
    
    // 감사 메시지
    const thankYouContent = document.getElementById('thankYouContent');
    const thankYou = data.survey.thankYouMessage;
    thankYouContent.innerHTML = `
        <h2>${thankYou.title}</h2>
        ${thankYou.content.map(p => `<p>${p}</p>`).join('')}
    `;
    
    // 섹션과 질문 생성
    buildSections(data);
}

// 섹션 구성
function buildSections(data) {
    const sectionsContainer = document.getElementById('sectionsContainer');
    sectionsContainer.innerHTML = ''; // 기존 내용 제거
    
    const sections = data.sections.sort((a, b) => a.order - b.order);
    
    sections.forEach(section => {
        const sectionElement = createSectionElement(section, data.questions);
        sectionsContainer.appendChild(sectionElement);
    });
}

// 섹션 요소 생성
function createSectionElement(section, questions) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section';
    sectionDiv.innerHTML = `
        <div class="section-header">
            ${section.title}
        </div>
        <div class="section-content" id="section-${section.id}">
        </div>
    `;
    
    const sectionContent = sectionDiv.querySelector('.section-content');
    const sectionQuestions = questions
        .filter(q => q.sectionId === section.id)
        .sort((a, b) => a.order - b.order);
    
    sectionQuestions.forEach(question => {
        const questionElement = createQuestionElement(question);
        sectionContent.appendChild(questionElement);
    });
    
    return sectionDiv;
}

// 질문 요소 생성
function createQuestionElement(question) {
    const questionDiv = document.createElement('div');
    questionDiv.className = `question ${question.conditional ? 'conditional' : ''}`;
    questionDiv.id = `question-${question.id}`;
    questionDiv.dataset.questionId = question.id;
    
    let questionHTML = `
        <div class="question-label">
            ${question.text}
            ${question.required ? '<span class="required">*</span>' : ''}
        </div>
    `;
    
    if (question.helpText) {
        questionHTML += `<div class="help-text">${question.helpText}</div>`;
    }
    
    // 질문 타입별 입력 요소 생성
    switch (question.type) {
        case 'radio':
            questionHTML += createRadioGroup(question);
            break;
        case 'checkbox':
            questionHTML += createCheckboxGroup(question);
            break;
        case 'dropdown':
            questionHTML += createDropdown(question);
            break;
        case 'scale':
            questionHTML += createScale(question);
            break;
        case 'matrix':
            questionHTML += createMatrix(question);
            break;
        case 'textarea':
            questionHTML += createTextarea(question);
            break;
        default:
            questionHTML += createTextInput(question);
    }
    
    questionHTML += '<div class="error-message">이 항목을 입력해 주세요.</div>';
    questionDiv.innerHTML = questionHTML;
    
    return questionDiv;
}

// 라디오 그룹 생성
function createRadioGroup(question) {
    const options = question.options.sort((a, b) => a.order - b.order);
    return `
        <div class="radio-group">
            ${options.map(option => `
                <label class="radio-item">
                    <input type="radio" 
                           name="${question.id}" 
                           value="${option.value}"
                           ${question.required ? 'required' : ''}>
                    ${option.text}
                </label>
            `).join('')}
        </div>
    `;
}

// 체크박스 그룹 생성
function createCheckboxGroup(question) {
    const options = question.options.sort((a, b) => a.order - b.order);
    return `
        <div class="checkbox-group">
            ${options.map(option => `
                <label class="checkbox-item">
                    <input type="checkbox" 
                           name="${question.id}" 
                           value="${option.value}"
                           data-question-id="${question.id}">
                    ${option.text}
                </label>
            `).join('')}
        </div>
    `;
}

// 드롭다운 생성
function createDropdown(question) {
    const options = question.options.sort((a, b) => a.order - b.order);
    return `
        <select name="${question.id}" 
                class="form-control" 
                ${question.required ? 'required' : ''}>
            <option value="">${question.placeholder || '선택해 주세요'}</option>
            ${options.map(option => `
                <option value="${option.value}">${option.text}</option>
            `).join('')}
        </select>
    `;
}

// 척도 생성
function createScale(question) {
    const config = question.scaleConfig;
    let scaleHTML = '<div class="scale-container">';
    
    for (let i = config.min; i <= config.max; i++) {
        scaleHTML += `
            <div class="scale-item">
                <input type="radio" 
                       name="${question.id}" 
                       value="${i}" 
                       id="${question.id}_${i}"
                       class="scale-radio" 
                       ${question.required ? 'required' : ''}>
                <label for="${question.id}_${i}" class="scale-label">
                    ${config.labels[i] || i}
                </label>
            </div>
        `;
    }
    
    scaleHTML += '</div>';
    return scaleHTML;
}

// 매트릭스 생성
function createMatrix(question) {
    const config = question.matrixConfig;
    let matrixHTML = `
        <div class="table-responsive">
            <table class="matrix-table">
                <thead>
                    <tr>
                        <th>항목</th>
                        ${config.columns.map(col => `<th>${col.text}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
    `;
    
    config.rows.forEach(row => {
        matrixHTML += `
            <tr>
                <td class="matrix-row-label">${row.text}</td>
                ${config.columns.map(col => `
                    <td>
                        <input type="radio" 
                               name="${row.id}" 
                               value="${col.value}"
                               ${question.required ? 'required' : ''}>
                    </td>
                `).join('')}
            </tr>
        `;
    });
    
    matrixHTML += '</tbody></table></div>';
    return matrixHTML;
}

// 텍스트 영역 생성
function createTextarea(question) {
    return `
        <textarea name="${question.id}" 
                  class="form-control" 
                  rows="${question.rows || 5}"
                  placeholder="${question.placeholder || ''}"
                  ${question.required ? 'required' : ''}></textarea>
    `;
}

// 텍스트 입력 생성
function createTextInput(question) {
    return `
        <input type="text" 
               name="${question.id}" 
               class="form-control"
               placeholder="${question.placeholder || ''}"
               ${question.required ? 'required' : ''}>
    `;
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    const form = document.getElementById('surveyForm');
    
    // 폼 입력 이벤트
    form.addEventListener('input', handleFormInput);
    form.addEventListener('change', handleFormChange);
    
    // 폼 제출
    form.addEventListener('submit', handleFormSubmit);
    
    // 리셋 버튼
    document.getElementById('resetBtn').addEventListener('click', handleReset);
}

// 폼 입력 핸들러
function handleFormInput(event) {
    const { name, value } = event.target;
    
    // 응답 저장
    if (name) {
        responses[name] = value;
        saveResponsesToLocal();
    }
    
    // 오류 상태 제거
    const questionDiv = event.target.closest('.question');
    if (questionDiv && questionDiv.classList.contains('error')) {
        questionDiv.classList.remove('error');
    }
    
    updateProgress();
}

// 폼 변경 핸들러
function handleFormChange(event) {
    const { name, value, type, checked } = event.target;
    
    // 체크박스 처리
    if (type === 'checkbox') {
        if (!responses[name]) responses[name] = [];
        
        if (checked) {
            responses[name].push(value);
        } else {
            responses[name] = responses[name].filter(v => v !== value);
        }
    } else {
        responses[name] = value;
    }
    
    // 조건부 로직 처리
    handleConditionalLogic(name, value);
    
    saveResponsesToLocal();
    updateProgress();
}

// 조건부 로직 처리
function handleConditionalLogic(questionId, value) {
    // digital_skills 질문의 조건부 로직
    if (questionId === 'digital_skills') {
        const digitalSupportQuestion = document.getElementById('question-digital_support');
        if (digitalSupportQuestion) {
            if (parseInt(value) < 3) {
                digitalSupportQuestion.style.display = 'block';
                digitalSupportQuestion.classList.add('show');
            } else {
                digitalSupportQuestion.style.display = 'none';
                digitalSupportQuestion.classList.remove('show');
                delete responses['digital_support'];
            }
        }
    }
}

// 진행률 업데이트
function updateProgress() {
    const requiredQuestions = surveyData.questions.filter(q => q.required && !q.conditional);
    let completedCount = 0;
    
    requiredQuestions.forEach(question => {
        if (isQuestionCompleted(question)) {
            completedCount++;
        }
    });
    
    const progress = requiredQuestions.length > 0 
        ? Math.round((completedCount / requiredQuestions.length) * 100) 
        : 0;
    
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${progress}% 완료`;
}

// 질문 완료 확인
function isQuestionCompleted(question) {
    const questionDiv = document.getElementById(`question-${question.id}`);
    if (!questionDiv || questionDiv.style.display === 'none') return true;
    
    const response = responses[question.id];
    
    switch (question.type) {
        case 'checkbox':
            return response && response.length > 0;
        case 'matrix':
            if (!question.matrixConfig || !question.matrixConfig.rows) return true;
            return question.matrixConfig.rows.every(row => responses[row.id]);
        default:
            return response && response.toString().trim() !== '';
    }
}

// 폼 검증
function validateForm() {
    let isValid = true;
    let firstError = null;
    
    // 오류 스타일 초기화
    document.querySelectorAll('.question.error').forEach(q => q.classList.remove('error'));
    
    surveyData.questions.forEach(question => {
        if (!question.required || question.conditional) return;
        
        const questionDiv = document.getElementById(`question-${question.id}`);
        if (!questionDiv || questionDiv.style.display === 'none') return;
        
        if (!isQuestionCompleted(question)) {
            questionDiv.classList.add('error');
            if (!firstError) {
                firstError = questionDiv;
                questionDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            isValid = false;
        }
    });
    
    return isValid;
}

// 폼 제출 처리
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        showNotification('필수 항목을 모두 입력해 주세요.', 'warning');
        return;
    }
    
    // 제출 버튼 비활성화
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> 제출 중...';
    
    try {
        // 응답 데이터 준비
        const submissionData = {
            surveyId: surveyData.survey.id,
            responses: responses,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`
        };
        
        // 서버로 전송 시도
        if (navigator.onLine) {
            await submitToServer(submissionData);
            
            // 성공 화면 표시
            showThankYou();
            
            // 로컬 스토리지 정리
            clearLocalResponses();
            
            // 성공 알림
            showNotification('설문이 성공적으로 제출되었습니다!', 'success');
        } else {
            // 오프라인일 경우 로컬에 저장
            saveForLaterSync(submissionData);
            
            // 오프라인 안내 메시지
            showNotification('오프라인 상태입니다. 인터넷 연결 시 자동으로 제출됩니다.', 'info');
            
            // 임시로 감사 화면 표시
            showThankYou();
            clearLocalResponses();
        }
        
    } catch (error) {
        console.error('제출 오류:', error);
        
        // 사용자 친화적인 에러 메시지 표시
        showNotification(error.message || '제출 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.', 'error');
        
        // 버튼 복구
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">✓</span> 설문 제출';
        
        // 로컬 저장 옵션 제공
        if (confirm('제출에 실패했습니다. 응답을 임시 저장하시겠습니까?')) {
            saveResponsesToLocal();
            showNotification('응답이 임시 저장되었습니다. 나중에 다시 제출할 수 있습니다.', 'info');
        }
    }
}

// 서버로 데이터 전송 (로컬 개발 환경용)
async function submitToServer(data) {
    try {
        // 로컬 개발 환경에서는 실제 서버가 없으므로 시뮬레이션
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' || 
            window.location.protocol === 'file:') {
            
            // 2초 지연 후 성공 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // 콘솔에 제출 데이터 출력
            console.log('설문 제출 데이터:', data);
            
            // 성공 응답 시뮬레이션
            return {
                success: true,
                message: '설문이 성공적으로 제출되었습니다.',
                submissionId: `SUB-${Date.now()}`
            };
        }
        
        // 실제 서버 환경
        const response = await fetch('/api/surveys/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            let errorMessage;
            switch (response.status) {
                case 404:
                    errorMessage = '서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
                    break;
                case 500:
                case 502:
                case 503:
                    errorMessage = '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.';
                    break;
                case 400:
                    errorMessage = '입력하신 정보에 문제가 있습니다. 다시 확인해 주세요.';
                    break;
                case 401:
                case 403:
                    errorMessage = '권한이 없습니다. 페이지를 새로고침 후 다시 시도해 주세요.';
                    break;
                case 405:
                    errorMessage = '서버 설정에 문제가 있습니다. 관리자에게 문의해 주세요.';
                    break;
                default:
                    errorMessage = '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
            }
            throw new Error(errorMessage);
        }
        
        return await response.json();
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('인터넷 연결을 확인해 주세요.');
        }
        throw error;
    }
}

// 오프라인 동기화를 위한 저장
function saveForLaterSync(data) {
    const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    pendingSubmissions.push(data);
    localStorage.setItem('pendingSubmissions', JSON.stringify(pendingSubmissions));
}

// 온라인 복귀 시 동기화
async function syncResponses() {
    const pendingSubmissions = JSON.parse(localStorage.getItem('pendingSubmissions') || '[]');
    
    if (pendingSubmissions.length === 0) return;
    
    for (const submission of pendingSubmissions) {
        try {
            await submitToServer(submission);
        } catch (error) {
            console.error('동기화 실패:', error);
            return;
        }
    }
    
    // 성공적으로 동기화되면 삭제
    localStorage.removeItem('pendingSubmissions');
}

// 감사 화면 표시
function showThankYou() {
    document.getElementById('surveyForm').style.display = 'none';
    document.getElementById('welcomeSection').style.display = 'none';
    document.querySelector('.progress-container').style.display = 'none';
    document.getElementById('thankYou').style.display = 'block';
    window.scrollTo(0, 0);
}

// 폼 리셋
function handleReset() {
    if (!confirm('모든 입력 내용이 삭제됩니다. 계속하시겠습니까?')) {
        return;
    }
    
    document.getElementById('surveyForm').reset();
    responses = {};
    clearLocalResponses();
    
    // 오류 스타일 제거
    document.querySelectorAll('.question.error').forEach(q => q.classList.remove('error'));
    
    // 조건부 질문 숨기기
    document.querySelectorAll('.question.conditional').forEach(q => {
        q.style.display = 'none';
        q.classList.remove('show');
    });
    
    updateProgress();
}

// 로컬 스토리지 관리
function saveResponsesToLocal() {
    localStorage.setItem('surveyResponses', JSON.stringify(responses));
    localStorage.setItem('surveyLastUpdated', new Date().toISOString());
}

function restoreSavedResponses() {
    const saved = localStorage.getItem('surveyResponses');
    const lastUpdated = localStorage.getItem('surveyLastUpdated');
    
    if (saved && lastUpdated) {
        const daysSinceUpdate = (Date.now() - new Date(lastUpdated)) / (1000 * 60 * 60 * 24);
        
        // 7일 이내의 데이터만 복원
        if (daysSinceUpdate < 7) {
            responses = JSON.parse(saved);
            
            // 저장된 응답을 폼에 적용
            Object.entries(responses).forEach(([questionId, value]) => {
                const question = surveyData.questions.find(q => q.id === questionId);
                if (!question) return;
                
                switch (question.type) {
                    case 'checkbox':
                        if (Array.isArray(value)) {
                            value.forEach(v => {
                                const checkbox = document.querySelector(`input[name="${questionId}"][value="${v}"]`);
                                if (checkbox) checkbox.checked = true;
                            });
                        }
                        break;
                    case 'radio':
                    case 'scale':
                        const radio = document.querySelector(`input[name="${questionId}"][value="${value}"]`);
                        if (radio) radio.checked = true;
                        break;
                    case 'matrix':
                        // 매트릭스는 각 행별로 처리
                        break;
                    default:
                        const input = document.querySelector(`[name="${questionId}"]`);
                        if (input) input.value = value;
                }
            });
            
            // 조건부 로직 재적용
            Object.entries(responses).forEach(([questionId, value]) => {
                handleConditionalLogic(questionId, value);
            });
            
            updateProgress();
        }
    }
}

function clearLocalResponses() {
    localStorage.removeItem('surveyResponses');
    localStorage.removeItem('surveyLastUpdated');
}

// 알림 메시지 표시 함수
function showNotification(message, type = 'info') {
    // 기존 알림 제거
    const existingNotification = document.querySelector('.notification-toast');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 새 알림 생성
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // 애니메이션 효과
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 자동 제거 (에러가 아닌 경우)
    if (type !== 'error') {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// 알림 아이콘 가져오기
function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// 새 설문 시작
function startNewSurvey() {
    if (confirm('저장된 응답을 복원하여 수정하시겠습니까?')) {
        window.location.reload();
    }
}

// 디버그 모드 (개발용)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.surveyDebug = {
        getResponses: () => responses,
        getSurveyData: () => surveyData,
        clearAll: () => {
            localStorage.clear();
            location.reload();
        }
    };
}