# 데모 실행

이 저장소의 데모는 단일 HTML입니다. **GitHub의 HTML 파일 링크는 소스 보기이며 실행 화면이 아닙니다.** **[GitHub Pages에서 17개 데모 바로 보기](https://jaythealpha.github.io/motion-skill/)**. 설치 없이 브라우저에서 실행할 수 있습니다.

## 사실·사람·기억 읽기

전체 Elapse 타임라인 8개는 기록 읽기가 기본입니다. WTC는 크라우더의 대피 지원, 레스콜라의 사전 준비, 공동 대응과 집계 범위를 담습니다. 삼풍은 박승현 구조·시민 도움, 성수대교는 생존자 회고·유지관리의 책임을 담습니다. 타이타닉에는 카르파티아호의 준비·로우와 자원자들의 수색·제섭의 아이 돌봄 회고를, 브리타닉에는 실라와 동료들의 돌봄·다우스가 전한 대피 도움·스커지호의 음식 나눔을 추가했습니다. 기존 발견·탐사 기록도 유지하며, 노트르담에는 소방 협력·문화재 보호·석재 조사·장인들의 복원 기록을 추가했고 재개관 기록도 유지했습니다. 에펠탑에는 설계 협업·공장과 리벳 작업·도장과 작업자 보호·승강기 점검과 개보수 기록을 추가했고 기존 완공 기록도 유지했습니다. 시드니 오페라하우스의 기록5건을 포함해 총 31개 기록이며 모든 역사·인물을 망라한 것은 아닙니다.

기록에는 사실 값·단위·범위·자료 유형·원문 위치·확인일과 미확정 사항이 있습니다. 인물의 분 단위 행동 시각이나 구조 인원을 만들지 않습니다. 3D는 선택해서 보는 추정 맥락입니다. 기록으로 돌아오면 재생이 멈추고, 3D로 복귀하면 시간·카메라를 보존합니다. `?view=records&record=welles&lang=ko`와 같은 링크로 특정 기록을 공유할 수 있습니다.

JavaScript가 꺼져도 영어 기록 전체와 출처를 읽을 수 있습니다. WebGL 실행 실패 시에도 기록은 남습니다. 번역·기록 본문은 HTML에 포함되어 있으며, 외부 출처 링크를 여는 경우에는 네트워크가 필요합니다. 대표 장면 3개는 장면 관찰용으로 유지하며 전체 기록 링크로 연결됩니다.

## 갤러리 언어

공개 갤러리는 처음 방문하면 영어로 표시됩니다. 상단에서 English·한국어·日本語·CH · 简体中文·Español을 선택할 수 있으며, 제목·안내·17개 카드 설명·링크·접근성 문구가 함께 바뀝니다. 선택은 이 브라우저에 저장되고 `?lang=en|ko|ja|zh|es` 주소로 공유할 수 있습니다. URL의 명시적 언어가 저장된 선택보다 우선합니다. 브라우저의 기본 언어를 자동 적용하지 않습니다.

전체 타임라인 12개와 대표 장면 3개 모두 5개 언어를 지원합니다. 갤러리에서 선택한 언어가 개별 데모와 대표 장면의 전체 타임라인 링크로 이어집니다. 새 방문은 영어가 기본이며, 개별 데모에서도 언어를 바꿀 수 있습니다. 번역은 HTML에 포함되므로 재생 중 외부 번역 서비스에 접속하지 않습니다. 출처의 서지 제목·고유 명칭은 원문을 유지할 수 있습니다. 일본어·중국어·스페인어는 자동 번역 후 주요 UI 용어를 보정했으며 전체 문장의 원어민 교정은 미검증입니다.

## 로컬에서 보기

저장소 최상위에서 실행합니다(Python 3 필요).

```bash
python3 -m http.server 8765 --bind 127.0.0.1
```

이미 같은 포트를 사용 중이면 `8766`처럼 다른 포트를 선택하고 아래 주소의 포트도 바꾸세요. 서버는 해당 터미널에서 `Ctrl+C`로 종료합니다. 인터넷에 공개하는 배포 명령이 아닙니다.

| 예시 | 저장소 파일 | 서버 실행 후 주소 |
|---|---|---|
| 갤럭시 S24 | [HTML](unfold/examples/galaxy-s24.html) | http://127.0.0.1:8765/unfold/examples/galaxy-s24.html |
| 아이폰 17 Pro | [HTML](unfold/examples/iphone-17-pro.html) | http://127.0.0.1:8765/unfold/examples/iphone-17-pro.html |
| 아이폰 듀오 | [HTML](unfold/examples/iphone-duo.html) | http://127.0.0.1:8765/unfold/examples/iphone-duo.html |
| 갤럭시 Z 폴드8 — 알려진 구조 불일치 포함 | [HTML](unfold/examples/galaxy-z-fold8.html) | http://127.0.0.1:8765/unfold/examples/galaxy-z-fold8.html |
| 갤럭시 Z 플립8 — 추정 중심 | [HTML](unfold/examples/galaxy-z-flip8.html) | http://127.0.0.1:8765/unfold/examples/galaxy-z-flip8.html |
| 남타워 충돌 대표 장면 | [HTML](elapse/examples/wtc-impact-study.html) | http://127.0.0.1:8765/elapse/examples/wtc-impact-study.html |
| 세계무역센터 ·9·11과 재건 | [HTML](elapse/examples/world-trade-center.html) | http://127.0.0.1:8765/elapse/examples/world-trade-center.html |
| 노트르담 · 화재와 복원 | [HTML](elapse/examples/notre-dame.html) | http://127.0.0.1:8765/elapse/examples/notre-dame.html |
| 에펠탑 건설 · 추정 형상 포함 | [HTML](elapse/examples/eiffel-tower.html) | http://127.0.0.1:8765/elapse/examples/eiffel-tower.html |
| 타이타닉 | [HTML](elapse/examples/titanic.html) | http://127.0.0.1:8765/elapse/examples/titanic.html |
| 삼풍백화점 · 구조·사고 이후 | [HTML](elapse/examples/sampoong.html) | http://127.0.0.1:8765/elapse/examples/sampoong.html |
| 삼풍백화점 붕괴 대표 장면 | [HTML](elapse/examples/sampoong-collapse-study.html) | http://127.0.0.1:8765/elapse/examples/sampoong-collapse-study.html |
| 성수대교 · 붕괴·재시공 | [HTML](elapse/examples/seongsu-bridge.html) | http://127.0.0.1:8765/elapse/examples/seongsu-bridge.html |
| 브리타닉 | [HTML](elapse/examples/britannic.html) | http://127.0.0.1:8765/elapse/examples/britannic.html |
| 타이타닉 분리 장면 연구 | [HTML](elapse/examples/titanic-break-study.html) | http://127.0.0.1:8765/elapse/examples/titanic-break-study.html |

타이타닉·WTC 대표 장면의 “전체 타임라인” 링크는 각각 같은 폴더의 `titanic.html`·`world-trade-center.html`을 가리킵니다. 그 링크도 사용할 때에는 대표 장면과 대응하는 전체 타임라인 HTML을 함께 받아 두세요. 장면 자체는 단독 실행됩니다.

## 고품질 표현

WTC 대표 장면은 항공기 단면·엔진·조종석, 금속과 유리를 구분한 외벽, 내부가 보이는 충돌 개구부, 불규칙한 화염과 명암이 있는 연기를 사용합니다. 같은 소재·조명 기준을 나머지 예시에도 적용했으며 노트르담에는 같은 화염·연기 렌더링을 적용했습니다. 원본 모델의 사실·치수·시각은 유지하며, 추가 형상과 효과는 설명용 추정입니다. [세부 변경과 성능·화면 검증](docs/reviews/2026-11-03-realism-pass.md)을 확인하세요.

포함된 Unfold 예시는 금속·렌즈·기판별 재질과 부드러운 곡면을, Elapse 예시는 대상별 파단면·철골·석재·외벽 디테일을 적용합니다. Unfold 주소에 `?quality=standard`를 붙이면 기존 일러스트 방식과 비교할 수 있습니다. 이미 다른 매개변수가 있으면 `&quality=standard`를 붙이세요.

고품질 표면의 회로 무늬·렌즈 코팅·재료 결, 추가 구조 부재는 설명용 추정입니다. 시각적 디테일이 실측 정확도나 자료 확인 비율을 높이지 않습니다. 실제 기기 성능과 전문가 형상 검수는 별도입니다.

## 확인할 흐름

- 시간 바를 앞뒤로 이동하고 재생·멈춤·속도를 선택합니다.
- Unfold: 층층이/매트 정렬, 컬러/도면, 접기 조작(폴더블), 매뉴얼 모드를 확인합니다.
- Elapse: 장 버튼, 투시, 출처와 추정·학설·예측 표시를 확인합니다.
- 설명과 실제 데이터의 구분을 보세요. “자료 확인”은 내부 좌표나 수리 절차의 정확성을 보증하지 않습니다.

## 한계

교육·설명용 예시이며 제조사 공식 도면이나 승인된 수리 매뉴얼이 아닙니다. 폴더블의 내부 위치·치수·일부 구조는 추정이며 플립8은 이전 세대 자료도 사용합니다. 폴드8에는 배터리 접근 방향과 출처 설명이 충돌하는 알려진 제한이 있습니다. 타이타닉·브리타닉의 물·입자 효과는 유체 시뮬레이션이 아닙니다. 상세 제한과 출처는 각 데모 안에 표시됩니다.

에펠탑의 3D는 1887–1889년 시공 도해입니다. 기록 읽기에는 1884년 설계, 2019년 시작 도장 캠페인, 2024년 북측 승강기 재개통과 일상 유지관리도 포함합니다. 기록 날짜와 3D 맥락 시각을 구분하며 현대 공사를 옛 시공 장면으로 재현하지 않습니다. 주요 공정일은 공식 기록을 사용하며, 철골·가설물·기초·중간 높이와 조립 순서는 추정입니다. 300m는 주구조 기준이고 깃대·정상 부속 및 현대 안테나는 재현하지 않습니다. 수위·수심 대신 월별 기록·도해 시공 높이·기준 치수를 표시합니다.

노트르담은 2019년 화재 전부터 2024년 12월 재개관까지를 다룹니다. 손상·복원 부위 7곳을 탐사하며 볼트에서는 지붕을 숨긴 절개 보기를 제공합니다. 공식 기록과 추정 형상을 구분하고, 재개관을 모든 보존 공사의 종료로 표현하지 않습니다. 화염·연기·붕괴·중간 복원은 물리 시뮬레이션이 아닌 교육용 추정 도해입니다.

세계무역센터는2001년9·11의 두 항공기 충돌, 쌍둥이 타워와7 WTC 붕괴, 수습과2018년까지의 주요 재건을 다룹니다. 충돌·낙하·분진·항공기 실루엣과 중간 재건은 추정 도해이며 NIST 해석이나 실제 물리 시뮬레이션이 아닙니다. 사람·피해자는 표현하지 않습니다. 추모 풀·One WTC·오큘러스는 날짜에 따라 탐사할 수 있고, 마지막 장면은 현재 단지 전체나 모든 재개발의 완료를 뜻하지 않습니다.

### 재생 품질과 측정 범위

WTC 전체 타임라인과 대표 장면은 연기·화염·분진을 인스턴스 묶음으로 그립니다. Elapse의 건물 카메라는 연속적인 화면 맞춤을 사용하고, 회전·확대 입력은 프레임 단위로 묶습니다. 설명·게이지는 주요 사건 전환 시 즉시, 같은 사건의 연속 재생 중에는 최대 12.5회/초 갱신합니다. 형상과 시간 바의 재생은 매 애니메이션 프레임에 계속 반영합니다.

데스크톱 GPU에는 반사 환경·재질별 광택과 건물 그림자를, 모바일의 좁은 화면 및 소프트웨어 렌더러에는 가벼운 재질과 해상도 상한을 적용합니다. 소프트웨어 렌더링의 픽셀 비율 상한은 1, 좁은 화면은 1.5, 일반 GPU는 2입니다. 저사양 장치에서 무조건 60fps를 보장하지 않습니다. 주변 도시 배치·조명·표면 질감은 설명을 위한 추정 표현이며, 실사·측량·검증된 구조 해석으로 보장하지 않습니다.

## 서울 구조·역사 예시

삼풍은 1995년 6월 29일 붕괴 전부터 7월 19일 기록까지, 성수대교는 1994년 붕괴 전부터 1997년 4차로 재개통까지 다룹니다. 각각 탐사 부위 6곳, 구조 절개, 컬러·도면, 0.25×·0.5×를 포함한 속도 선택, 주요 파괴 구간 저속 재생을 지원합니다. 사건 기록과 추정 형상을 구분하며 사람·차량은 묘사하지 않습니다. 삼풍의 실측 도면과 지하 치수는 확보하지 못했으므로 모델 외곽·층·기둥 좌표는 추정입니다. [출처와 표현 범위](elapse/research/seoul-civil-notes.md)를 확인하세요.

## 상세 모델·차량 고증 배포

삼풍 대표 장면의 상세 외벽·입구·설비·층판·철근 모델을 전체 타임라인에도 사용합니다. 붕괴 구간의 전면층 숨김은 층판 관찰을 위한 설명용 절개입니다. 표시되는 모델 외곽은 렌더링용 추정 범위이며 실측 건물 치수가 아닙니다.

성수대교의 **차량 확대**는 정상 통행을 독립된 시계로 보여줍니다. 붕괴 구간은 별도의16번 버스와 다른5대 차량 도해로 전환합니다. 경계에 걸림→전복→먼저 떨어진 상판과 접촉이라는 순서는 기록을 따르고, 차종·도색·각도·속도·상세 위치·손상은 추정입니다. 재시공 장에서 차량을 숨기는 것은 실제 수습 날짜를 뜻하지 않습니다. 사람은 표현하지 않습니다.

중국어 선택 표시는 **CH**이며 번역 데이터·HTML 언어 태그는 표준 `zh` / `zh-Hans`입니다. 기존 `lang=zh` 링크를 유지하고 `lang=ch` 입력도 지원합니다. 기존12개 예시에도 공통 표면 법선·데스크톱 음영과 언어 표시를 반영해 재생성했습니다. 개별 사건마다 새로운 고증 모델을 추가한 것은 아닙니다.

## Sydney Opera House — default new-topic field test

[Public demo](https://jaythealpha.github.io/motion-skill/elapse/examples/sydney-opera-house.html?view=records&lang=en) · [local HTML](elapse/examples/sydney-opera-house.html) · [evidence notes](elapse/research/sydney-notes.md).

Five records cover shared design, construction workers, Peter Hall and interior completion, Concert Hall acoustic/access renewal, and recognition in2023. Numeric facts are approximately10,000 construction participants over1959–1973,18 reflectors in the2022 Concert Hall renewal and0.4m relative stage lowering, with separate scopes. English defaults with five-language reading, source links, color/blueprint, playback and five exploration stops. The hall/renewal views explicitly hide shells for explanation. Estimated120×180×67m envelope, sail groups, joints, windows, hall and intermediate construction are not surveyed CAD or acoustic/accessibility validation. No people or source media are rendered.

## 시드니·WTC 렌더링 보완 (2026-11-10)

- [시드니 동일 카메라 기존·개선 비교](https://jaythealpha.github.io/motion-skill/elapse/examples/opera-art-study.html?lang=en&p=0.8055556&compare=1): 외관·쉘·콘서트홀을 비교합니다. 갤러리의 언어 선택이 이어집니다.
- 시드니 전체 타임라인에도 세라믹·곡면·수면·목재 마감을 적용했습니다. 반사는 지붕 건설 진도에 따라 나타나며, 도면 모드에서는 연출 조명·수면을 해제합니다.
- WTC 전체/대표 장면은 HDR 렌더 타깃과 제한된 빛 번짐·가장자리 보정을 사용합니다. 저사양 경로와 도면은 직접 렌더링합니다. `render=direct`는 후처리만 생략하는 비교 옵션입니다.
- 하부 트라이던트의 상세 치수, 주변 도시 배치, 화염·연기·카메라는 추정입니다. 자료의 수치·사람들의 기록·역사적 시점은 변경하지 않았습니다.
- 실제 기기마다 성능이 다릅니다. 데스크톱 브라우저 측정은 실제 휴대폰 GPU의 성능 보증이 아닙니다.
