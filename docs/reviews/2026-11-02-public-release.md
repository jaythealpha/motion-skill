# 공개 배포·설치 최종 확인 — 2026-11-02

## 실제 배포

- 저장소: https://github.com/jaythealpha/motion-skill — PUBLIC 확인.
- 라이선스: GitHub API에서 MIT 확인.
- 데모: https://jaythealpha.github.io/motion-skill/ — HTTPS 홈과12개 데모 제공.
- Pages: main 루트, `.nojekyll`, HTTPS enforced. 최초 배포 커밋 `ad1ef75`, GitHub 상태 `built`, 오류 없음.
- 루트 진입 페이지와12개 데모의 공개 HTTPS 응답 성공.13개 파일 SHA-256이 로컬 배포 파일과 모두 일치.

## 설치 검증

Git credential helper·전역/시스템 설정과 대화형 인증을 배제하고 HTTPS 공개 clone을 실행했다. 공백이 포함된 격리 경로에서 INSTALL의 두 스킬 복사 명령을 사용했다. 원본 checkout을 이동한 뒤 설치된 폴더만으로10개 예시 모델 Gate1·HTML 빌드와 대표 장면2개 빌드가 성공했다.

이는 AI가 새 주제를 연구·생성하는 전체 과정이나 Claude Code의 실제 스킬 인식까지 검증한 것은 아니다. 도구 권한·네트워크·AI 요금제는 별도 조건이다. Windows/Linux·실기기는 미검증이다.

## 실제 브라우저와 Design QA

상태: **passed** — 검사한 범위에서 P0/P1/P2 없음.

- 진입 페이지:375·768·1440px. 1/2/3열 카드,12개 데모 링크, 줄바꿈·가로 넘침·스킵 링크와 키보드 포커스 확인. 기존 데모의 글꼴·배경·버튼 표현을 기준으로 유지.
- 공개 Pages에서 홈3개 폭과12개 데모 초기 화면, 합계15상태 실행·캔버스·가로 넘침·페이지 런타임 오류 검사 PASS.
- 직접 확인:375·1440px 로컬 전체 페이지,768px 공개 홈 캡처. 인앱 브라우저에서 공개 홈→WTC 링크→재생 실행, 시간 바와 시각 변경 확인.
- 이전 설치 점검의108상태 오프라인 검사와 이번 공개 URL 검사는 별도다. 모든 데모의 모든 상호작용·영상 저장·스크린리더·FPS를 새로 검증하지 않았다.
- 증거: `elapse/.out/pages-home/`, `elapse/.out/pages-live/results.json` (Git 제외). 공개 홈 표본: [pages-preview.png](pages-preview.png).

## 보존

기존 데모·소스·추정 표시·MIT/three.js 고지를 유지한다. 알려진 폴드8 구조 불일치와 플립8 추정 중심 제한은 홈페이지·데모 안내에 명시했다. 별도 건축 제안 문서는 변경·공개하지 않았다.
