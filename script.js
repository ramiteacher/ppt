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
    const lottoPromptContent = `HTML, CSS, JavaScript 로 구성된 웹사이트를 만들어주세요.

아래 사이트와 디자인, 레이아웃, UI 구성, 버튼 위치, 버튼 동작, 애니메이션, 공 움직임, 기능 처리 등을 전부 100% 동일하게 만들어주세요.

참고 사이트: https://ramiteacher.github.io/lottoq/

광고, 푸터, SEO 태그, meta 태그 등 불필요한 부분은 전부 제외해주세요.

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
- 당첨확인 모달 (동행복권 크롤링 방식)

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
- 추첨된 공은 떨어지자마자 실시간으로 결과영역에 오름차순 정렬 후 바로 표시

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
- 결과 하단에는 전체 조합 일괄 저장 버튼 배치

---

## 기타 처리
- 결과 바로보기 버튼 → 애니메이션 스킵 후 즉시 결과 출력
- 속도변경 버튼 → 1x → 4x → 8x 순환
- 사운드 토글 버튼 → 효과음 on/off 처리
- 저장된 번호 localStorage 저장 / 중복 저장 방지
- 당첨확인 모달 → fetch + DOMParser 방식 동행복권 사이트 최신 당첨번호 크롤링 후 비교 처리
- 모바일 반응형 필수
- HTML5 / ES6 표준 준수
- 코드 주석 충분히 작성
- 모듈화 금지 → 단일 파일 구성 유지
- 기능 추가 금지 / UX 변경 금지 / 스타일 임의 변경 금지
- 원본 사이트와 완전히 동일한 결과물이 나오도록 구현

---

## 목표
처음 보는 개발자도 Copilot Agent에 이 프롬프트만 넣으면  
https://ramiteacher.github.io/lottoq/ 사이트와 완전히 동일한 결과물이 자동 생성되도록 만들어주세요.`;
    
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
