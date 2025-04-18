// 슬라이드 제어 기능
document.addEventListener('DOMContentLoaded', function() {
    // 요소 선택
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const slideNumber = document.getElementById('slide-number');
    const modal = document.getElementById('lotto-prompt-modal');
    const closeModal = document.querySelector('.close-modal');
    const promptText = document.getElementById('prompt-text');
    const showPromptBtn = document.getElementById('show-prompt-btn');
    
    // 현재 슬라이드 인덱스
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    // 슬라이드 번호 업데이트
    function updateSlideNumber() {
        slideNumber.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }
    
    // 슬라이드 표시
    function showSlide(index) {
        // 모든 슬라이드 숨기기
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // 현재 슬라이드 표시
        slides[index].classList.add('active');
        
        // 슬라이드 번호 업데이트
        updateSlideNumber();
    }
    
    // 다음 슬라이드로 이동
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }
    
    // 이전 슬라이드로 이동
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        showSlide(currentSlide);
    }
    
    // 버튼 이벤트 리스너
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // 키보드 이벤트 리스너
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            nextSlide();
        } else if (e.key === 'ArrowLeft') {
            prevSlide();
        }
    });
    
    // 로또 추첨기 프롬프트 내용
    const promptText = `HTML, CSS, JavaScript 로 구성된 웹사이트를 만들어주세요.
---
## 참고 사이트 
https://vermillion-crostata-64863b.netlify.app/
https://ramiteacher.github.io/lottoq/

똑같이 만들어라

---
참고 자료
예상되는 오류 로그
403 Forbidden Error (oQdQXTa.png): 리소스에 대한 접근 권한 문제.
404 Not Found (favicon.ico): favicon 파일이 없거나 경로가 잘못됨.
TypeError: numbers.forEach is not a function (script.js:673): numbers가 배열이 아님.
NotSupportedError: The element has no supported sources (script.js:315): 미디어 요소의 소스가 지원되지 않음.
TypeError: saved is not iterable (script.js:584): saved가 반복 가능한 객체가 아님.
기존 코드
HTML 구조: 버튼 컨테이너에 동적으로 요소 추가 (fetchLatestBtn, roundInputContainer, corsInfo 등).
이벤트 리스너:
fetchLatestBtn: 최신 당첨번호 가져오기.
fetchRoundBtn: 특정 회차 번호 조회.
기능:
CORS 프록시 사용 안내.
회차 입력 및 조회.
당첨번호 입력 필드 업데이트.
날짜 형식 변환 및 저장.
UI 업데이트 및 저장된 번호 비교.
요구사항
오류 처리
403/404 에러: 리소스 요청 실패 시 대체 경로 또는 기본값 제공.
TypeError (forEach): numbers가 배열인지 확인 후 처리. 배열이 아닌 경우 빈 배열로 초기화.
NotSupportedError: 미디어 요소 사용 시 지원 여부 확인 및 대체 UI 제공.
TypeError (iterable): saved가 배열인지 확인하고, 그렇지 않으면 초기화.
CORS 에러: 여러 프록시 서버를 시도하거나, 실패 시 사용자에게 명확한 안내 제공.
코드 안정성
모든 DOM 요소가 존재하는지 확인 후 조작.
비동기 요청(fetch)에 대한 타임아웃 설정 및 에러 처리.
입력값 검증(예: 회차 번호가 유효한 숫자인지).
사용자 경험
버튼 비활성화/활성화 상태를 명확히 관리.
로딩 상태 시각적 피드백 제공(예: "가져오는 중..." 텍스트).
오류 메시지를 사용자 친화적으로 표시.
CORS 프록시 활성화 안내를 간결하고 명확하게 유지.
코드 구조
모듈화된 함수 사용(예: fetchLatestWinningNumbers, fetchLottoNumberByRound 등).
주석을 통해 코드 의도 명확히 설명.
변수명은 직관적이고 일관되게.
추가 요구사항
favicon.ico 404 에러 방지를 위해 기본 favicon 설정 또는 요청 제거.
저장된 번호와 당첨번호 비교 로직(checkSavedNumbersAgainstWinning)이 안정적으로 동작.
날짜 형식은 한국식 (YYYY-MM-DD)으로 일관되게 유지.
기타 처리
결과 바로보기 버튼: 애니메이션 스킵 후 즉시 결과 출력.
속도변경 버튼: 1x → 4x → 8x 순환.
사운드 토글 버튼: 효과음 on/off 처리.
저장된 번호:
localStorage에 저장.
중복 저장 방지.
저장된 번호에 볼 색상 적용.
당첨확인 모달:
fetch와 DOMParser를 사용해 동행복권 사이트 최신 회차 당첨번호 크롤링.
CORS 문제로 프록시 필수.
비교 결과:
3개 일치: 5등
4개 일치: 4등
5개 일치: 3등
5개 + 보너스번호 1개: 2등
6개 모두 일치: 1등
일치한 번호 강조 표시.
모바일 반응형: 필수.
표준 준수: HTML5 / ES6.
주석: 충분히 작성.
모듈화 금지: 단일 파일 구성 유지.
제한:
기능 추가 금지.
UX 변경 금지.
스타일 임의 변경 금지.
저장된 번호 목록:
번호 클릭 시 목록 표시.
당첨확인 클릭 시 저장된 번호 목록 로드 후 당첨번호와 비교.
프롬프트 지시사항
오류 처리 코드 추가:
numbers.forEach 호출 전 Array.isArray(numbers) 확인.
saved 반복 전 Array.isArray(saved) || saved === null 확인.
fetch 요청에 타임아웃(예: 10초) 및 try-catch 적용.
CORS 에러 시 프록시 서버 목록 순회 및 실패 시 사용자 안내.
DOM 조작 안전성:
document.getElementById 결과가 null일 경우 에러 로그 출력 및 대체 동작.
버튼 컨테이너 삽입 전 부모 노드 존재 여부 확인.
비동기 함수 최적화:
fetchLatestWinningNumbers와 fetchLottoNumberByRound에 공통 에러 처리 로직 추가.
API 응답 구조 검증(예: result.success, result.numbers 존재 여부).
사용자 인터페이스:
버튼 클릭 시 즉각적인 피드백(예: 비활성화 및 텍스트 변경).
입력값 유효성 검사 후 에러 메시지 표시(예: "회차는 1 이상이어야 합니다").
CORS 안내는 클릭 가능한 링크와 간결한 설명으로 유지.
제약사항
외부 라이브러리 사용 최소화(필요 시 fetch만 사용).
브라우저 호환성: 최신 Chrome, Firefox, Safari 지원.
API 엔드포인트는 가정하되, 실제 호출은 https://www.dhlottery.co.kr로 설정. CORS 프록시는 https://cors-anywhere.herokuapp.com 사용.
단일 JavaScript 파일로 모든 로직 작성.
모듈화 금지, 모든 함수를 단일 파일 내에 정의.
---
## 파일 구성
- index.html : 전체 화면 구성
- styles.css : 스타일링 및 애니메이션 처리
- script.js : 모든 기능 동작 처리, 이벤트 관리, 상태 관리

---

## 필수 구현 항목

### 디자인 / UI
- 다크모드 레이아웃 (#121212)
- 상단 로고 이미지 + 사이트명
- 단일조합 / 5조합 모드 선택 라디오 버튼
- 로또 머신 원형 UI (1~45번 공 배치)
- 컨트롤 패널 : 추첨하기, 결과 바로보기, 속도변경, 사운드 토글 버튼
- 결과영역 : 추첨된 공 표시 + 저장하기 버튼
- 저장된 번호 모달
- 당첨확인 모달 (동행복권 크롤링 방식.cors 오류로 프록시 2개이상 사용 필수)
- 페이지 색상요소 알록달록하게 예쁘게

---

## 공 움직임 및 애니메이션 처리
- 추첨 시작시 머신 내부 공들이 자연스럽게 에어효과 및 물리엔진 기반으로 움직임
- 공끼리 충돌 / 무작위 위치 이동 / 자연스러운 개별 공 움직임 처리
- 로또 추첨기 스타일 팬 효과 적용
- 뭉쳐서 좌우로만 움직이는 방식 금지
- 원통 안에서 공기의 저항을 받는 느낌으로 공들이 자유롭게 분산 이동하며 회전, 충돌 처리

---

## 공 추첨 애니메이션
- 공 추첨 후 해당 공은 바로 머신 하단 구멍으로 자연스럽게 떨어지는 애니메이션 처리
- 공 크기 축소 / 투명도 하락 / 자연스러운 낙하 및 사라짐
- 추첨된 공은 떨어지자마자 실시간으로 결과영역에 오름차순 정렬 후 바로 표시 - 필수 바로바로 보여야함 
- 추첨 결과 공도 볼색상 적용해야함

---

## 번호별 볼 색상 지정
- 1~10 : 노랑
- 11~20 : 파랑
- 21~30 : 빨강
- 31~40 : 회색
- 41~45 : 초록

---

## 5조합 모드 처리 (핵심 로직)
- 각 조합의 번호는 중복 가능
- 단, "조합 전체"가 이전 조합과 완전히 동일하면 안됨
- 이전 조합들과 숫자 6개 전부 동일하면 다시 뽑기
- Set 또는 JSON.stringify 비교 방식 사용
- 각 조합은 조합별로 묶어서 가로정렬 처리
- 각 조합 오른쪽 끝에는 '저장하기' 버튼 배치
- 결과 하단에는 전체 조합 일괄 저장 버튼 배치 - 일괄저장시 토스트 알림은 한번만 뜨도록 할것

---

                    `;

    
    // 로또 추첨기 프롬프트 모달 열기
    showPromptBtn.addEventListener('click', function() {
        modal.style.display = 'block';
        promptText.textContent = lottoPromptContent;
    });
    
    // 모달 닫기
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // 초기 슬라이드 표시
    showSlide(currentSlide);
});
