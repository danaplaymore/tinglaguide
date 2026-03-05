# Google Form 기반 수집 설정

Apps Script 없이 `certification.html` 폼 데이터를 Google Form으로 POST하고,
Google Form 응답을 Google Spreadsheet에 자동 저장하는 방식입니다.

## 1) Google Form 생성
1. Google Form 새로 만들기
2. 아래 항목을 질문으로 추가
	- 이름
	- 연락처
	- 매장 상세주소
	- 매장운영 여부
	- 매장규모
	- 취급 틴팅 브랜드 (체크박스)
	- 기타 브랜드명
	- 기타 요청사항

## 2) Google Sheet 연결
1. Form 상단 `응답` 탭 클릭
2. 스프레드시트 아이콘 클릭
3. 새 시트 생성 또는 기존 시트 연결

## 3) formResponse URL 확인
1. Form `보내기` → 링크 복사
2. 링크의 `/viewform` 을 `/formResponse` 로 바꾼 URL 준비
	- 예: `https://docs.google.com/forms/d/e/.../formResponse`

## 4) entry ID 추출
1. Form 우측 점 3개 메뉴 → `사전 입력된 링크 가져오기`
2. 아무 값이나 입력 후 링크 생성
3. 생성된 URL 쿼리에서 `entry.xxxxx` 값들을 확인
	- 예: `entry.1234567890=홍길동`

## 5) 페이지 설정 반영
`certification.html`에서 아래 값을 교체
- [certification.html](certification.html#L729) `googleFormConfig.action`
- [certification.html](certification.html#L731-L738) 각 질문의 `entry` ID

## 6) 테스트
1. 페이지에서 폼 입력 후 제출
2. 성공 알림 확인
3. 연결된 Google Sheet에 행 추가 확인
