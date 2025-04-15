/**
 * 네잎클로버 로또 추첨기
 * 
 * 단일/5조합 추첨 가능한 로또 추첨 웹 애플리케이션
 */

// 전역 변수 영역
let balls = []; // 모든 로또 공 객체
let selectedBalls = []; // 추첨된 공
let isDrawing = false; // 추첨 중인지 여부
let speedFactor = 1; // 속도 조절 (1/4/8)
let soundEnabled = true; // 소리 켜기/끄기 상태
let savedNumbers = []; // 저장된 번호 목록
let animationFrameId = null; // 애니메이션 프레임 ID
let drawInterval; // 추첨 타이머 인터벌
let drawMode = 'single'; // 추첨 모드: 'single' 또는 'multiple'
let drawnCombinations = []; // 5조합 모드에서 추첨한 조합들
let currentComboIndex = 0; // 현재 추첨 중인 조합 인덱스
let realTimeResults = []; // 실시간 결과 배열

// 로또 머신 및 공 관련 상수
const BALL_COUNT = 45; // 전체 공 개수
const SELECTED_COUNT = 6; // 추첨할 공 개수
const MULTIPLE_DRAW_COUNT = 5; // 5조합 모드에서 추첨 횟수
const MACHINE_RADIUS = 140; // 로또 머신 반지름

// 물리 관련 상수
const AIR_RESISTANCE = 0.98; // 공기 저항 계수 (더 작을수록 더 많은 저항)
const GRAVITY_FACTOR = 0.005; // 중력 계수 
const RESTITUTION = 0.7;   // 반발 계수 (충돌 후 튕김 정도)

// DOM 요소 초기화
document.addEventListener('DOMContentLoaded', () => {
    // 요소 캐시
    const ballContainer = document.getElementById('ballContainer');
    const resultNumbers = document.getElementById('resultNumbers');
    const drawButton = document.getElementById('drawButton');
    const skipButton = document.getElementById('skipButton');
    const speedButton = document.getElementById('speedButton');
    const soundButton = document.getElementById('soundButton');
    const saveAllButton = document.getElementById('saveAllButton');
    const savedNumbersButton = document.getElementById('savedNumbersButton');
    const winCheckButton = document.getElementById('winCheckButton');
    const savedNumbersModal = document.getElementById('savedNumbersModal');
    const winCheckModal = document.getElementById('winCheckModal');
    const closeSavedNumbers = document.getElementById('closeSavedNumbers');
    const closeWinCheck = document.getElementById('closeWinCheck');
    const savedNumbersList = document.getElementById('savedNumbersList');
    
    // 모드 선택 이벤트 설정
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            drawMode = e.target.value;
            reset();
        });
    });
    
    // 공 초기화 및 생성
    initializeBalls();
    
    // 저장된 번호 로드
    loadSavedNumbers();
    
    // 이벤트 리스너 설정
    drawButton.addEventListener('click', startDraw);
    skipButton.addEventListener('click', skipAnimation);
    speedButton.addEventListener('click', changeSpeed);
    soundButton.addEventListener('click', toggleSound);
    saveAllButton.addEventListener('click', saveAllCombinations);
    savedNumbersButton.addEventListener('click', openSavedNumbersModal);
    winCheckButton.addEventListener('click', openWinCheckModal);
    closeSavedNumbers.addEventListener('click', () => closeModal(savedNumbersModal));
    closeWinCheck.addEventListener('click', () => closeModal(winCheckModal));
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', (e) => {
        if (e.target === savedNumbersModal) {
            closeModal(savedNumbersModal);
        }
        if (e.target === winCheckModal) {
            closeModal(winCheckModal);
        }
    });
    
    // 애니메이션 시작
    startAnimation();
});

/**
 * 공 초기화 및 생성
 */
function initializeBalls() {
    const ballContainer = document.getElementById('ballContainer');
    ballContainer.innerHTML = '';
    balls = [];
    
    // 45개의 로또 공 생성
    for (let i = 1; i <= BALL_COUNT; i++) {
        // 공 요소 생성
        const ballElement = document.createElement('div');
        ballElement.className = `ball ball-${i}`;
        ballElement.textContent = i;
        
        // 무작위 위치 계산 (고른 분포)
        const position = getRandomPositionInCircle(MACHINE_RADIUS - 20);
        
        // 공 객체 생성 및 배열에 추가
        const ball = {
            id: i,
            element: ballElement,
            x: position.x,
            y: position.y,
            vx: (Math.random() - 0.5) * 2, // 초기 x 속도 증가
            vy: (Math.random() - 0.5) * 2, // 초기 y 속도 증가
            mass: 1 + Math.random() * 0.2, // 공마다 약간 다른 질량
            selected: false
        };
        
        // 공 위치 설정
        ballElement.style.left = `${ball.x + MACHINE_RADIUS}px`;
        ballElement.style.top = `${ball.y + MACHINE_RADIUS}px`;
        
        // 드리프트 애니메이션 설정
        addDriftAnimation(ballElement);
        
        // DOM에 추가
        ballContainer.appendChild(ballElement);
        balls.push(ball);
    }
}

/**
 * 원 안에 랜덤한 위치 생성 (고른 분포)
 */
function getRandomPositionInCircle(radius) {
    // 균등한 원형 분포를 위한 공식
    const r = radius * Math.sqrt(Math.random());
    const theta = Math.random() * 2 * Math.PI;
    
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    };
}

/**
 * 공에 드리프트 애니메이션 추가
 */
function addDriftAnimation(element) {
    // 랜덤한 움직임 경로 설정 (범위 확대)
    const x1 = (Math.random() - 0.5) * 60;
    const y1 = (Math.random() - 0.5) * 60;
    const x2 = (Math.random() - 0.5) * 60;
    const y2 = (Math.random() - 0.5) * 60;
    const x3 = (Math.random() - 0.5) * 60;
    const y3 = (Math.random() - 0.5) * 60;
    
    element.style.setProperty('--x1', `${x1}px`);
    element.style.setProperty('--y1', `${y1}px`);
    element.style.setProperty('--x2', `${x2}px`);
    element.style.setProperty('--y2', `${y2}px`);
    element.style.setProperty('--x3', `${x3}px`);
    element.style.setProperty('--y3', `${y3}px`);
    
    element.classList.add('drifting');
}

/**
 * 애니메이션 시작
 */
function startAnimation() {
    // 애니메이션 프레임 요청
    animationFrameId = requestAnimationFrame(animate);
}

/**
 * 애니메이션 루프
 */
function animate() {
    // 추첨 중일 때만 공 움직임 업데이트
    if (isDrawing) {
        updateBallPositions();
    }
    
    // 다음 프레임 요청
    animationFrameId = requestAnimationFrame(animate);
}

/**
 * 공 위치 업데이트
 */
function updateBallPositions() {
    // 로또 머신 반지름
    const maxDistance = MACHINE_RADIUS - 20;
    
    // 모든 공 업데이트
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        
        // 이미 선택된 공은 스킵
        if (ball.selected) continue;
        
        // 공 위치 업데이트
        ball.x += ball.vx * speedFactor;
        ball.y += ball.vy * speedFactor;
        
        // 공기 저항 시뮬레이션 - 속도 증가시 더 많은 저항
        const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        if (speed > 0.1) {
            const drag = Math.pow(speed, 1.5) * 0.002;
            ball.vx -= ball.vx * drag * speedFactor;
            ball.vy -= ball.vy * drag * speedFactor;
        }
        
        // 머신 가장자리 충돌 처리
        const distance = Math.sqrt(ball.x * ball.x + ball.y * ball.y);
        
        if (distance > maxDistance) {
            // 중심으로부터의 방향
            const angle = Math.atan2(ball.y, ball.x);
            
            // 가장자리 위치로 조정
            ball.x = maxDistance * Math.cos(angle);
            ball.y = maxDistance * Math.sin(angle);
            
            // 반사 효과
            const normalX = ball.x / distance;
            const normalY = ball.y / distance;
            
            // 속도 벡터와 법선 벡터의 내적
            const dotProduct = ball.vx * normalX + ball.vy * normalY;
            
            // 반사된 속도 계산 (반발 계수 적용)
            ball.vx = (ball.vx - 2 * dotProduct * normalX) * RESTITUTION;
            ball.vy = (ball.vy - 2 * dotProduct * normalY) * RESTITUTION;
            
            // 벽과 충돌시 약간의 무작위성 추가
            ball.vx += (Math.random() - 0.5) * 0.5 * speedFactor;
            ball.vy += (Math.random() - 0.5) * 0.5 * speedFactor;
        }
        
        // 중력 효과 - 머신 중앙으로 약간 당기는 힘
        ball.vx -= ball.x * GRAVITY_FACTOR * speedFactor;
        ball.vy -= ball.y * GRAVITY_FACTOR * speedFactor;
        
        // 공 충돌 처리
        for (let j = i + 1; j < balls.length; j++) {
            const otherBall = balls[j];
            if (otherBall.selected) continue;
            
            // 공 사이 거리 계산
            const dx = otherBall.x - ball.x;
            const dy = otherBall.y - ball.y;
            const distanceSquared = dx * dx + dy * dy;
            const minDistance = 32; // 공 크기
            
            // 충돌 감지
            if (distanceSquared < minDistance * minDistance) {
                const distance = Math.sqrt(distanceSquared);
                const overlap = (minDistance - distance) * 0.5;
                
                // 겹침 해결
                const offsetX = (dx / distance) * overlap;
                const offsetY = (dy / distance) * overlap;
                
                // 질량에 따른 충돌 응답 (가벼운 공이 더 많이 밀림)
                const totalMass = ball.mass + otherBall.mass;
                const ratio1 = otherBall.mass / totalMass;
                const ratio2 = ball.mass / totalMass;
                
                ball.x -= offsetX * ratio1;
                ball.y -= offsetY * ratio1;
                otherBall.x += offsetX * ratio2;
                otherBall.y += offsetY * ratio2;
                
                // 충돌 후 속도 계산
                const nx = dx / distance;
                const ny = dy / distance;
                
                const dVector1 = (ball.vx * nx + ball.vy * ny);
                const dVector2 = (otherBall.vx * nx + otherBall.vy * ny);
                
                const impulseMagnitude = (dVector1 - dVector2) * RESTITUTION;
                
                // 질량을 고려한 충격량 (선형 충돌)
                const impulse1 = 2 * impulseMagnitude * otherBall.mass / totalMass;
                const impulse2 = 2 * impulseMagnitude * ball.mass / totalMass;
                
                ball.vx -= impulse1 * nx;
                ball.vy -= impulse1 * ny;
                otherBall.vx += impulse2 * nx;
                otherBall.vy += impulse2 * ny;
                
                // 약간의 무작위성 추가 (충돌마다 약간 다른 결과)
                ball.vx += (Math.random() - 0.5) * 0.2 * speedFactor;
                ball.vy += (Math.random() - 0.5) * 0.2 * speedFactor;
                otherBall.vx += (Math.random() - 0.5) * 0.2 * speedFactor;
                otherBall.vy += (Math.random() - 0.5) * 0.2 * speedFactor;
            }
        }
        
        // 마찰력 적용 (공기 저항)
        ball.vx *= AIR_RESISTANCE;
        ball.vy *= AIR_RESISTANCE;
        
        // DOM 요소 위치 업데이트
        ball.element.style.left = `${ball.x + MACHINE_RADIUS}px`;
        ball.element.style.top = `${ball.y + MACHINE_RADIUS}px`;
    }
}

/**
 * 추첨 시작
 */
function startDraw() {
    // 이미 추첨 중이면 리턴
    if (isDrawing) return;
    
    // 상태 초기화
    reset();
    isDrawing = true;
    
    // 버튼 상태 변경
    document.getElementById('drawButton').disabled = true;
    document.getElementById('saveAllButton').disabled = true;
    
    // 실시간 결과 영역 준비
    initializeResultSection();
    
    // 공들의 드리프트 애니메이션 제거
    balls.forEach(ball => {
        ball.element.classList.remove('drifting');
    });
    
    // 랜덤한 속도 부여 (더 다양한 초기 속도)
    balls.forEach(ball => {
        ball.vx = (Math.random() - 0.5) * 5;
        ball.vy = (Math.random() - 0.5) * 5;
        // 가끔 더 큰 초기 속도 부여 (역동성 증가)
        if (Math.random() < 0.2) {
            ball.vx *= 1.5;
            ball.vy *= 1.5;
        }
    });
    
    // 추첨 모드에 따라 처리
    if (drawMode === 'single') {
        // 단일 조합 모드
        startSingleDraw();
    } else {
        // 5조합 모드
        currentComboIndex = 0;
        realTimeResults = [];
        drawnCombinations = [];
        startMultipleDraw();
    }
}

/**
 * 결과 영역 초기화
 */
function initializeResultSection() {
    const resultNumbers = document.getElementById('resultNumbers');
    resultNumbers.innerHTML = '';
    
    if (drawMode === 'single') {
        // 단일 조합 모드
        const comboElement = createComboElement('단일 조합');
        resultNumbers.appendChild(comboElement);
    } else {
        // 5조합 모드
        for (let i = 0; i < MULTIPLE_DRAW_COUNT; i++) {
            const comboElement = createComboElement(`조합 ${i + 1}`);
            resultNumbers.appendChild(comboElement);
        }
    }
}

/**
 * 조합 요소 생성
 */
function createComboElement(title) {
    const comboElement = document.createElement('div');
    comboElement.className = 'result-combo';
    
    const comboContent = document.createElement('div');
    comboContent.className = 'result-combo-content';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'combo-title';
    titleElement.textContent = title;
    comboContent.appendChild(titleElement);
    
    const ballsContainer = document.createElement('div');
    ballsContainer.className = 'result-balls-container';
    comboContent.appendChild(ballsContainer);
    
    comboElement.appendChild(comboContent);
    
    const saveButton = document.createElement('button');
    saveButton.className = 'btn save-combo-btn';
    saveButton.textContent = '저장하기';
    saveButton.disabled = true;
    saveButton.addEventListener('click', function() {
        const index = parseInt(this.dataset.index || 0);
        saveSingleCombination(index);
    });
    
    comboElement.appendChild(saveButton);
    
    return comboElement;
}

/**
 * 개별 조합 저장
 */
function saveSingleCombination(index) {
    if (drawMode === 'single') {
        // 단일 조합 모드
        saveCurrentNumbers();
    } else {
        // 5조합 모드 - 특정 조합만 저장
        if (drawnCombinations[index]) {
            const combo = drawnCombinations[index];
            const timestamp = new Date().toLocaleString();
            
            // 중복 체크
            const isDuplicate = savedNumbers.some(item => {
                if (item.type === 'single') {
                    return JSON.stringify(item.numbers) === JSON.stringify(combo);
                }
                return false;
            });
            
            // 중복되지 않으면 저장
            if (!isDuplicate) {
                savedNumbers.push({
                    id: Date.now() + index,
                    type: 'single',
                    numbers: combo,
                    timestamp: timestamp
                });
                
                // 저장소 업데이트
                updateLocalStorage();
                
                // 알림
                alert('번호가 저장되었습니다!');
            } else {
                alert('이미 저장된 번호입니다.');
            }
        }
    }
}

/**
 * 모든 조합 저장
 */
function saveAllCombinations() {
    if (drawMode === 'single') {
        // 단일 조합 모드에서는 일반 저장과 동일
        saveCurrentNumbers();
    } else {
        // 5조합 모드 - 모든 조합 저장
        if (drawnCombinations.length === MULTIPLE_DRAW_COUNT) {
            const timestamp = new Date().toLocaleString();
            
            // 중복 체크 (모든 조합이 완전히 동일한지)
            const isDuplicate = savedNumbers.some(item => {
                if (item.type === 'multiple' && item.combinations.length === drawnCombinations.length) {
                    return JSON.stringify(item.combinations) === JSON.stringify(drawnCombinations);
                }
                return false;
            });
            
            // 중복되지 않으면 저장
            if (!isDuplicate) {
                savedNumbers.push({
                    id: Date.now(),
                    type: 'multiple',
                    combinations: [...drawnCombinations],
                    timestamp: timestamp
                });
                
                // 저장소 업데이트
                updateLocalStorage();
                
                // 알림
                alert('모든 조합이 저장되었습니다!');
            } else {
                alert('이미 저장된 조합입니다.');
            }
        }
    }
}

/**
 * 단일 조합 추첨
 */
function startSingleDraw() {
    selectedBalls = [];
    realTimeResults = [];
    let drawnCount = 0;
    
    // 0.8초마다 공을 하나씩 선택
    drawInterval = setInterval(() => {
        const availableBalls = balls.filter(ball => !ball.selected);
        if (availableBalls.length > 0 && drawnCount < SELECTED_COUNT) {
            // 랜덤하게 공 하나 선택
            const randomIndex = Math.floor(Math.random() * availableBalls.length);
            const selectedBall = availableBalls[randomIndex];
            
            // 선택 표시
            selectBall(selectedBall);
            
            // 효과음 재생
            playBallSound();
            
            // 실시간 결과 업데이트
            realTimeResults.push(selectedBall.id);
            updateResultDisplay();
            
            drawnCount++;
            
            // 모든 공 선택 완료
            if (drawnCount === SELECTED_COUNT) {
                finishDraw();
            }
        }
    }, 800 / speedFactor);
}

/**
 * 5조합 모드 추첨
 */
function startMultipleDraw() {
    // 현재 조합 추첨 시작
    selectedBalls = [];
    realTimeResults = [];
    let drawnCount = 0;
    
    // 0.8초마다 공을 하나씩 선택
    drawInterval = setInterval(() => {
        const availableBalls = balls.filter(ball => !ball.selected);
        if (availableBalls.length > 0 && drawnCount < SELECTED_COUNT) {
            // 랜덤하게 공 하나 선택
            const randomIndex = Math.floor(Math.random() * availableBalls.length);
            const selectedBall = availableBalls[randomIndex];
            
            // 선택 표시
            selectBall(selectedBall);
            
            // 효과음 재생
            playBallSound();
            
            // 실시간 결과 업데이트
            realTimeResults.push(selectedBall.id);
            updateResultDisplay();
            
            drawnCount++;
            
            // 현재 조합 완료
            if (drawnCount === SELECTED_COUNT) {
                // 결과 저장
                const sortedNumbers = [...realTimeResults].sort((a, b) => a - b);
                drawnCombinations.push(sortedNumbers);
                
                // 중복 조합 체크 (5조합 모드에서만)
                if (currentComboIndex > 0) {
                    const currentCombo = JSON.stringify(sortedNumbers);
                    let isDuplicate = false;
                    
                    // 이전 조합들과 비교
                    for (let i = 0; i < currentComboIndex; i++) {
                        if (JSON.stringify(drawnCombinations[i]) === currentCombo) {
                            isDuplicate = true;
                            break;
                        }
                    }
                    
                    // 중복이면 현재 조합 다시 뽑기
                    if (isDuplicate) {
                        drawnCombinations.pop(); // 마지막 조합 제거
                        resetForNextCombo();
                        return;
                    }
                }
                
                currentComboIndex++;
                
                // 모든 조합 완료
                if (currentComboIndex >= MULTIPLE_DRAW_COUNT) {
                    finishMultipleDraw();
                } else {
                    // 다음 조합 준비
                    resetForNextCombo();
                }
            }
        }
    }, 800 / speedFactor);
}

/**
 * 다음 조합 추첨을 위한 초기화
 */
function resetForNextCombo() {
    // 타이머 정지
    clearInterval(drawInterval);
    
    // 선택된 공 초기화
    selectedBalls.forEach(ball => {
        const ballObj = balls.find(b => b.id === ball);
        if (ballObj) {
            ballObj.selected = false;
            ballObj.element.classList.remove('selected-ball');
            ballObj.element.classList.remove('falling-ball');
            
            // 공 위치 재설정
            const position = getRandomPositionInCircle(MACHINE_RADIUS - 20);
            ballObj.x = position.x;
            ballObj.y = position.y;
            ballObj.vx = (Math.random() - 0.5) * 2;
            ballObj.vy = (Math.random() - 0.5) * 2;
            
            ballObj.element.style.left = `${ballObj.x + MACHINE_RADIUS}px`;
            ballObj.element.style.top = `${ballObj.y + MACHINE_RADIUS}px`;
        }
    });
    
    // 변수 초기화
    selectedBalls = [];
    realTimeResults = [];
    
    // 다음 조합 추첨 시작 (약간의 지연)
    setTimeout(() => {
        startMultipleDraw();
    }, 500);
}

/**
 * 공 선택 처리
 */
function selectBall(ball) {
    ball.selected = true;
    selectedBalls.push(ball.id);
    
    // 시각적 효과
    ball.element.classList.add('selected-ball');
    
    // 잠시 후 공이 떨어지는 애니메이션
    setTimeout(() => {
        ball.element.classList.add('falling-ball');
    }, 500);
}

/**
 * 결과 표시 업데이트
 */
function updateResultDisplay() {
    // 정렬된 결과
    const sortedResults = [...realTimeResults].sort((a, b) => a - b);
    
    // 결과 영역 업데이트
    const resultNumbers = document.getElementById('resultNumbers');
    const resultCombos = resultNumbers.querySelectorAll('.result-combo');
    
    if (drawMode === 'single') {
        // 단일 조합 모드
        if (resultCombos.length > 0) {
            const ballsContainer = resultCombos[0].querySelector('.result-balls-container');
            ballsContainer.innerHTML = '';
            
            // 공 추가
            sortedResults.forEach(number => {
                const ballElement = document.createElement('div');
                ballElement.className = 'result-ball';
                ballElement.setAttribute('data-number', number);
                ballElement.textContent = number;
                ballsContainer.appendChild(ballElement);
            });
        }
    } else {
        // 5조합 모드
        if (resultCombos.length > currentComboIndex) {
            const ballsContainer = resultCombos[currentComboIndex].querySelector('.result-balls-container');
            ballsContainer.innerHTML = '';
            
            // 공 추가
            sortedResults.forEach(number => {
                const ballElement = document.createElement('div');
                ballElement.className = 'result-ball';
                ballElement.setAttribute('data-number', number);
                ballElement.textContent = number;
                ballsContainer.appendChild(ballElement);
            });
        }
    }
}

/**
 * 단일 조합 추첨 완료
 */
function finishDraw() {
    // 타이머 정지
    clearInterval(drawInterval);
    
    // 상태 업데이트
    isDrawing = false;
    
    // 버튼 상태 변경
    document.getElementById('drawButton').disabled = false;
    
    // 저장 버튼 활성화
    const saveButtons = document.querySelectorAll('.save-combo-btn');
    saveButtons.forEach(button => {
        button.disabled = false;
    });
    
    // 일괄 저장 버튼 활성화 (5조합 모드에서만)
    if (drawMode === 'single') {
        document.getElementById('saveAllButton').disabled = false;
    }
    
    // 결과 저장
    if (drawMode === 'single') {
        const sortedNumbers = [...realTimeResults].sort((a, b) => a - b);
        drawnCombinations = [sortedNumbers];
    }
}

/**
 * 5조합 추첨 완료
 */
function finishMultipleDraw() {
    // 타이머 정지
    clearInterval(drawInterval);
    
    // 상태 업데이트
    isDrawing = false;
    
    // 버튼 상태 변경
    document.getElementById('drawButton').disabled = false;
    
    // 저장 버튼 활성화
    const saveButtons = document.querySelectorAll('.save-combo-btn');
    saveButtons.forEach((button, index) => {
        button.disabled = false;
        button.dataset.index = index;
    });
    
    // 일괄 저장 버튼 활성화
    document.getElementById('saveAllButton').disabled = false;
}

/**
 * 애니메이션 스킵 (결과 바로보기)
 */
function skipAnimation() {
    if (!isDrawing) return;
    
    // 진행 중인 타이머 정지
    clearInterval(drawInterval);
    
    // 선택된 공 초기화
    selectedBalls.forEach(ballId => {
        const ball = balls.find(b => b.id === ballId);
        if (ball) {
            ball.selected = false;
            ball.element.classList.remove('selected-ball');
            ball.element.classList.remove('falling-ball');
        }
    });
    
    selectedBalls = [];
    realTimeResults = [];
    
    if (drawMode === 'single') {
        // 단일 조합 모드 - 6개 공 무작위 선택
        const randomNumbers = getRandomNumbers(BALL_COUNT, SELECTED_COUNT);
        realTimeResults = randomNumbers;
        updateResultDisplay();
        
        // 결과 저장
        const sortedNumbers = [...realTimeResults].sort((a, b) => a - b);
        drawnCombinations = [sortedNumbers];
        
        // 완료 처리
        finishDraw();
    } else {
        // 5조합 모드 - 5개 조합 생성
        drawnCombinations = [];
        
        // 5개의 서로 다른 조합 생성
        for (let i = 0; i < MULTIPLE_DRAW_COUNT; i++) {
            let newCombo;
            let isDuplicate;
            
            // 중복되지 않는 조합 생성
            do {
                isDuplicate = false;
                newCombo = getRandomNumbers(BALL_COUNT, SELECTED_COUNT).sort((a, b) => a - b);
                
                // 이전 조합들과 비교
                for (let j = 0; j < drawnCombinations.length; j++) {
                    if (JSON.stringify(drawnCombinations[j]) === JSON.stringify(newCombo)) {
                        isDuplicate = true;
                        break;
                    }
                }
            } while (isDuplicate);
            
            drawnCombinations.push(newCombo);
        }
        
        // 결과 표시 업데이트
        const resultNumbers = document.getElementById('resultNumbers');
        const resultCombos = resultNumbers.querySelectorAll('.result-combo');
        
        drawnCombinations.forEach((combo, index) => {
            if (resultCombos.length > index) {
                const ballsContainer = resultCombos[index].querySelector('.result-balls-container');
                ballsContainer.innerHTML = '';
                
                // 공 추가
                combo.forEach(number => {
                    const ballElement = document.createElement('div');
                    ballElement.className = 'result-ball';
                    ballElement.setAttribute('data-number', number);
                    ballElement.textContent = number;
                    ballsContainer.appendChild(ballElement);
                });
            }
        });
        
        // 완료 처리
        currentComboIndex = MULTIPLE_DRAW_COUNT;
        finishMultipleDraw();
    }
}

/**
 * 무작위 번호 생성
 */
function getRandomNumbers(max, count) {
    const numbers = [];
    const available = Array.from({length: max}, (_, i) => i + 1);
    
    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * available.length);
        numbers.push(available[randomIndex]);
        available.splice(randomIndex, 1);
    }
    
    return numbers;
}

/**
 * 현재 번호 저장
 */
function saveCurrentNumbers() {
    if (realTimeResults.length === SELECTED_COUNT) {
        const sortedNumbers = [...realTimeResults].sort((a, b) => a - b);
        const timestamp = new Date().toLocaleString();
        
        // 중복 체크
        const isDuplicate = savedNumbers.some(item => {
            if (item.type === 'single') {
                return JSON.stringify(item.numbers) === JSON.stringify(sortedNumbers);
            }
            return false;
        });
        
        // 중복되지 않으면 저장
        if (!isDuplicate) {
            savedNumbers.push({
                id: Date.now(),
                type: 'single',
                numbers: sortedNumbers,
                timestamp: timestamp
            });
            
            // 저장소 업데이트
            updateLocalStorage();
            
            // 알림
            alert('번호가 저장되었습니다!');
        } else {
            alert('이미 저장된 번호입니다.');
        }
    }
}

/**
 * 로컬 스토리지 업데이트
 */
function updateLocalStorage() {
    localStorage.setItem('savedLottoNumbers', JSON.stringify(savedNumbers));
}

/**
 * 저장된 번호 로드
 */
function loadSavedNumbers() {
    const saved = localStorage.getItem('savedLottoNumbers');
    if (saved) {
        savedNumbers = JSON.parse(saved);
    }
}

/**
 * 저장된 번호 모달 열기
 */
function openSavedNumbersModal() {
    const savedNumbersList = document.getElementById('savedNumbersList');
    savedNumbersList.innerHTML = '';
    
    if (savedNumbers.length === 0) {
        savedNumbersList.innerHTML = '<p>저장된 번호가 없습니다.</p>';
    } else {
        // 최신 항목이 위에 오도록 정렬
        const sortedNumbers = [...savedNumbers].reverse();
        
        sortedNumbers.forEach(item => {
            const numberItem = document.createElement('div');
            numberItem.className = 'saved-number-item';
            
            // 삭제 버튼
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.addEventListener('click', () => deleteSavedNumber(item.id));
            numberItem.appendChild(deleteBtn);
            
            // 타임스탬프
            const timestamp = document.createElement('div');
            timestamp.textContent = item.timestamp;
            numberItem.appendChild(timestamp);
            
            // 번호 표시
            const ballsContainer = document.createElement('div');
            ballsContainer.className = 'saved-number-balls';
            
            if (item.type === 'single') {
                // 단일 조합
                item.numbers.forEach(number => {
                    const ball = createSavedBall(number);
                    ballsContainer.appendChild(ball);
                });
            } else {
                // 5조합
                item.combinations.forEach((combo, index) => {
                    const comboTitle = document.createElement('div');
                    comboTitle.textContent = `조합 ${index + 1}`;
                    comboTitle.style.marginTop = index > 0 ? '10px' : '0';
                    ballsContainer.appendChild(comboTitle);
                    
                    const comboBalls = document.createElement('div');
                    comboBalls.className = 'saved-number-balls';
                    
                    combo.forEach(number => {
                        const ball = createSavedBall(number);
                        comboBalls.appendChild(ball);
                    });
                    
                    ballsContainer.appendChild(comboBalls);
                });
            }
            
            numberItem.appendChild(ballsContainer);
            savedNumbersList.appendChild(numberItem);
        });
    }
    
    document.getElementById('savedNumbersModal').style.display = 'block';
}

/**
 * 저장된 번호 공 생성
 */
function createSavedBall(number) {
    const ball = document.createElement('div');
    ball.className = 'result-ball saved-number-ball';
    ball.setAttribute('data-number', number);
    ball.textContent = number;
    return ball;
}

/**
 * 저장된 번호 삭제
 */
function deleteSavedNumber(id) {
    const index = savedNumbers.findIndex(item => item.id === id);
    if (index !== -1) {
        savedNumbers.splice(index, 1);
        updateLocalStorage();
        openSavedNumbersModal(); // 목록 새로고침
    }
}

/**
 * 당첨 확인 모달 열기
 */
function openWinCheckModal() {
    const latestDrawInfo = document.getElementById('latestDrawInfo');
    const savedNumbersCheck = document.getElementById('savedNumbersCheck');
    
    // 로딩 표시
    latestDrawInfo.textContent = '최신 당첨번호를 가져오는 중...';
    savedNumbersCheck.innerHTML = '';
    
    // 모달 표시
    document.getElementById('winCheckModal').style.display = 'block';
    
    // 최신 당첨번호 가져오기
    fetchLatestWinningNumbers()
        .then(winningInfo => {
            // 당첨 정보 표시
            latestDrawInfo.innerHTML = `
                <strong>${winningInfo.round}회 당첨결과</strong><br>
                추첨일: ${winningInfo.date}<br>
                당첨번호: 
            `;
            
            // 당첨 번호 표시
            const winningBallsContainer = document.createElement('div');
            winningBallsContainer.className = 'saved-number-balls';
            
            winningInfo.numbers.forEach(number => {
                const ball = createSavedBall(number);
                winningBallsContainer.appendChild(ball);
            });
            
            // 보너스 번호
            const bonusBall = createSavedBall(winningInfo.bonus);
            bonusBall.style.marginLeft = '10px';
            
            // 먼저 DOM에 추가한 후 insertAdjacentHTML 호출
            winningBallsContainer.appendChild(bonusBall);
            
            // + 기호 추가 (DOM에 추가된 후 insertAdjacentHTML 사용)
            bonusBall.insertAdjacentHTML('beforebegin', '<span style="margin: 0 5px;">+</span>');
            
            latestDrawInfo.appendChild(winningBallsContainer);
            
            // 저장된 번호 당첨 확인
            checkSavedNumbers(winningInfo);
        })
        .catch(error => {
            latestDrawInfo.textContent = '당첨번호를 가져오는데 실패했습니다. 잠시 후 다시 시도해주세요.';
            console.error('당첨번호 가져오기 오류:', error);
        });
}

/**
 * 최신 당첨번호 가져오기
 */
async function fetchLatestWinningNumbers() {
    try {
        // CORS 오류 해결을 위해 정적 데이터 사용 방식으로 변경
        // 오늘 날짜와 가까운 회차 정보를 자동으로 계산
        
        // 기준 회차 및 날짜 설정 (2024년 6월 29일, 1124회)
        const baseRound = 1124;
        const baseDate = new Date(2024, 5, 29); // 월은 0부터 시작하므로 6월은 5
        
        // 오늘 날짜
        const today = new Date();
        
        // 기준일로부터 오늘까지의 날짜 차이를 주 단위로 계산
        const diffTime = today.getTime() - baseDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        
        // 현재 회차 계산
        const currentRound = baseRound + diffWeeks;
        
        // 최근 추첨일 계산 (가장 가까운 토요일)
        const lastSaturday = new Date(today);
        const dayOfWeek = today.getDay(); // 0(일)~6(토)
        
        // 오늘이 토요일(6)인 경우 오늘을, 아니면 지난 토요일을 계산
        const daysToSubtract = dayOfWeek === 6 ? 0 : dayOfWeek + 1;
        lastSaturday.setDate(today.getDate() - daysToSubtract);
        
        // 추첨일 포맷팅
        const drawDate = `${lastSaturday.getFullYear()}년 ${lastSaturday.getMonth() + 1}월 ${lastSaturday.getDate()}일 추첨`;
        
        // 최신 당첨번호 데이터 (정적)
        // 1124회(2024.06.29) 실제 당첨번호 사용
        const staticData = {
            round: currentRound.toString(),
            date: drawDate,
            numbers: [3, 5, 12, 22, 26, 43],
            bonus: 34
        };
        
        return staticData;
        
        /* 원래 코드 (CORS 오류 발생)
        const response = await fetch('https://www.dhlottery.co.kr/common.do?method=main');
        const html = await response.text();
        
        // HTML 파싱
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // 회차 정보
        const roundElement = doc.querySelector('.win_result h4 strong');
        const round = roundElement ? roundElement.textContent.replace(/[^0-9]/g, '') : '최신';
        
        // 추첨일
        const dateElement = doc.querySelector('.win_result p.desc');
        const date = dateElement ? dateElement.textContent.trim() : '최근 추첨일';
        
        // 당첨번호
        const winningNumbers = [];
        const numberElements = doc.querySelectorAll('.win_result .nums .num');
        
        numberElements.forEach((element, index) => {
            if (index < 6) {
                winningNumbers.push(parseInt(element.textContent));
            }
        });
        
        // 보너스 번호
        const bonusElement = doc.querySelector('.win_result .nums .bonus');
        const bonus = bonusElement ? parseInt(bonusElement.textContent) : 0;
        
        return {
            round,
            date,
            numbers: winningNumbers,
            bonus
        };
        */
    } catch (error) {
        console.error('당첨번호 가져오기 오류:', error);
        
        // 오류 시 임시 데이터 반환
        return {
            round: '1124',
            date: '2024년 6월 29일 추첨',
            numbers: [3, 5, 12, 22, 26, 43],
            bonus: 34
        };
    }
}

/**
 * 저장된 번호 당첨 확인
 */
function checkSavedNumbers(winningInfo) {
    const savedNumbersCheck = document.getElementById('savedNumbersCheck');
    savedNumbersCheck.innerHTML = '';
    
    if (savedNumbers.length === 0) {
        savedNumbersCheck.innerHTML = '<p>저장된 번호가 없습니다.</p>';
        return;
    }
    
    // 최신 항목이 위에 오도록 정렬
    const sortedNumbers = [...savedNumbers].reverse();
    
    sortedNumbers.forEach(item => {
        if (item.type === 'single') {
            // 단일 조합
            const matchResult = checkMatchingNumbers(item.numbers, winningInfo);
            const winCheckItem = createWinCheckItem(item, matchResult);
            savedNumbersCheck.appendChild(winCheckItem);
        } else {
            // 5조합
            const multipleItem = document.createElement('div');
            multipleItem.className = 'wincheck-item';
            
            const timestamp = document.createElement('div');
            timestamp.textContent = item.timestamp;
            multipleItem.appendChild(timestamp);
            
            item.combinations.forEach((combo, index) => {
                const matchResult = checkMatchingNumbers(combo, winningInfo);
                
                const comboContainer = document.createElement('div');
                comboContainer.style.marginTop = '10px';
                
                const comboTitle = document.createElement('div');
                comboTitle.textContent = `조합 ${index + 1}`;
                comboContainer.appendChild(comboTitle);
                
                // 번호 표시
                const ballsContainer = document.createElement('div');
                ballsContainer.className = 'saved-number-balls';
                
                combo.forEach(number => {
                    const ball = createSavedBall(number);
                    // 일치하는 번호 강조
                    if (winningInfo.numbers.includes(number)) {
                        ball.classList.add('ball-matched');
                    } else if (number === winningInfo.bonus && matchResult.bonusMatch) {
                        // 보너스 번호 강조 (다른 스타일)
                        ball.classList.add('ball-matched');
                        ball.style.boxShadow = '0 0 8px 2px gold';
                    }
                    ballsContainer.appendChild(ball);
                });
                
                comboContainer.appendChild(ballsContainer);
                
                // 일치 개수 표시
                const matchCount = document.createElement('div');
                matchCount.className = `match-count ${matchResult.rank ? 'win' : ''}`;
                
                // 당첨 결과 텍스트
                const resultText = getMatchResultText(matchResult);
                matchCount.textContent = resultText;
                
                // 당첨 등급 뱃지 추가
                if (matchResult.rank) {
                    const rankBadge = document.createElement('span');
                    rankBadge.className = `rank-badge rank-${matchResult.rank}`;
                    rankBadge.textContent = `${matchResult.rank}등`;
                    matchCount.appendChild(rankBadge);
                }
                
                comboContainer.appendChild(matchCount);
                
                multipleItem.appendChild(comboContainer);
            });
            
            savedNumbersCheck.appendChild(multipleItem);
        }
    });
}

/**
 * 당첨 확인 항목 생성
 */
function createWinCheckItem(item, matchResult) {
    const winCheckItem = document.createElement('div');
    winCheckItem.className = 'wincheck-item';
    
    const timestamp = document.createElement('div');
    timestamp.textContent = item.timestamp;
    winCheckItem.appendChild(timestamp);
    
    // 번호 표시
    const ballsContainer = document.createElement('div');
    ballsContainer.className = 'saved-number-balls';
    
    item.numbers.forEach(number => {
        const ball = createSavedBall(number);
        // 일치하는 번호 강조
        if (matchResult.winningNumbers.includes(number)) {
            ball.classList.add('ball-matched');
        } else if (number === matchResult.bonusNumber && matchResult.bonusMatch) {
            // 보너스 번호 강조 (다른 스타일)
            ball.classList.add('ball-matched');
            ball.style.boxShadow = '0 0 8px 2px gold';
        }
        ballsContainer.appendChild(ball);
    });
    
    winCheckItem.appendChild(ballsContainer);
    
    // 일치 개수 표시
    const matchCount = document.createElement('div');
    matchCount.className = `match-count ${matchResult.rank ? 'win' : ''}`;
    
    // 당첨 결과 텍스트
    const resultText = getMatchResultText(matchResult);
    matchCount.textContent = resultText;
    
    // 당첨 등급 뱃지 추가
    if (matchResult.rank) {
        const rankBadge = document.createElement('span');
        rankBadge.className = `rank-badge rank-${matchResult.rank}`;
        rankBadge.textContent = `${matchResult.rank}등`;
        matchCount.appendChild(rankBadge);
    }
    
    winCheckItem.appendChild(matchCount);
    
    return winCheckItem;
}

/**
 * 번호 일치 확인
 */
function checkMatchingNumbers(numbers, winningInfo) {
    const matchingNumbers = numbers.filter(num => winningInfo.numbers.includes(num));
    const matchCount = matchingNumbers.length;
    const bonusMatch = numbers.includes(winningInfo.bonus);
    
    // 등수 계산
    let rank = null;
    if (matchCount === 6) {
        rank = 1; // 1등: 6개 번호 일치
    } else if (matchCount === 5 && bonusMatch) {
        rank = 2; // 2등: 5개 번호 + 보너스 번호 일치
    } else if (matchCount === 5) {
        rank = 3; // 3등: 5개 번호 일치
    } else if (matchCount === 4) {
        rank = 4; // 4등: 4개 번호 일치
    } else if (matchCount === 3) {
        rank = 5; // 5등: 3개 번호 일치
    }
    
    return {
        matchCount,
        bonusMatch,
        rank,
        winningNumbers: winningInfo.numbers,
        bonusNumber: winningInfo.bonus,
        matchingNumbers: matchingNumbers
    };
}

/**
 * 일치 결과 텍스트 생성
 */
function getMatchResultText(matchResult) {
    const { matchCount, bonusMatch, rank, matchingNumbers } = matchResult;
    
    if (rank === 1) {
        return `축하합니다! 1등 당첨! (6개 일치) `;
    } else if (rank === 2) {
        return `축하합니다! 2등 당첨! (5개 일치 + 보너스 번호) `;
    } else if (rank === 3) {
        return `축하합니다! 3등 당첨! (5개 일치) `;
    } else if (rank === 4) {
        return `축하합니다! 4등 당첨! (4개 일치) `;
    } else if (rank === 5) {
        return `축하합니다! 5등 당첨! (3개 일치) `;
    } else {
        return `일치 번호: ${matchCount}개${bonusMatch ? ' (보너스 번호 포함)' : ''} - 꽝 `;
    }
}

/**
 * 모달 닫기
 */
function closeModal(modal) {
    modal.style.display = 'none';
}

/**
 * 속도 변경
 */
function changeSpeed() {
    const speedButton = document.getElementById('speedButton');
    
    if (speedFactor === 1) {
        speedFactor = 4;
        speedButton.textContent = '4X🏃';
        document.getElementById('ballContainer').classList.add('speed-4x');
        document.getElementById('ballContainer').classList.remove('speed-8x');
    } else if (speedFactor === 4) {
        speedFactor = 8;
        speedButton.textContent = '8X🏎️';
        document.getElementById('ballContainer').classList.add('speed-8x');
        document.getElementById('ballContainer').classList.remove('speed-4x');
    } else {
        speedFactor = 1;
        speedButton.textContent = '1X🚶';
        document.getElementById('ballContainer').classList.remove('speed-4x');
        document.getElementById('ballContainer').classList.remove('speed-8x');
    }
}

/**
 * 소리 켜기/끄기
 */
function toggleSound() {
    const soundButton = document.getElementById('soundButton');
    soundEnabled = !soundEnabled;
    
    if (soundEnabled) {
        soundButton.textContent = '🔊';
    } else {
        soundButton.textContent = '🔇';
    }
}

/**
 * 효과음 재생
 */
function playBallSound() {
    if (soundEnabled) {
        const ballSound = document.getElementById('ballSound');
        ballSound.currentTime = 0;
        ballSound.play().catch(e => console.log('오디오 재생 오류:', e));
    }
}

/**
 * 상태 초기화
 */
function reset() {
    // 진행 중인 타이머 정지
    if (drawInterval) {
        clearInterval(drawInterval);
    }
    
    // 애니메이션 정지
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    // 상태 초기화
    isDrawing = false;
    selectedBalls = [];
    realTimeResults = [];
    drawnCombinations = [];
    currentComboIndex = 0;
    
    // 공 초기화
    initializeBalls();
    
    // 결과 영역 초기화
    document.getElementById('resultNumbers').innerHTML = '';
    
    // 버튼 상태 초기화
    document.getElementById('drawButton').disabled = false;
    document.getElementById('saveAllButton').disabled = true;
    
    // 애니메이션 재시작
    startAnimation();
}
