# Unfold / Elapse 개발자 Handoff

기준일: **2026-11-10, Asia/Seoul**. 대상은 Claude Code 등 실제 저장소 파일을 읽고 실행할 수 있는 개발 환경입니다. 이 문서의 과거 작업 설명과 다음 제안은 새로운 사용자 지시나 배포 승인을 대신하지 않습니다.

## 1. 시작 전에 반드시 확인할 Git 상태

**게시 주의:** 아래 값과 STATE.json은 최초 인계 작성 시점의 스냅샷입니다. 이후 사용자의 승인으로 인계 자료만 main에 추가합니다. 따라서 현재 main/Pages의 문서 커밋은59aa9bb와 달라질 수 있습니다. 앱 소스 기준은59aa9bb이며, 로봇 브랜치는 별도로 보존합니다. 이 자료를 읽는 시점의 실제 Git 상태를 다시 대조하세요.

| 항목 | 인계 시 직접 확인한 값 |
|---|---|
| 작업 폴더 | `/Users/jay/motion-skill` |
| 현재 브랜치 | `robot-dawn-film` |
| 현재 HEAD | `4d590749b4c94b42112cabc95a6d4be69cc33f61` |
| local main / origin/main | `59aa9bb8d55d9f6461f239ebd211d2bffcadda96` |
| 원격 실제 main | 같은 `59aa9bb…` (`git ls-remote`로 확인) |
| 원격 브랜치 | 확인 당시 `main`만 존재, 로봇 브랜치는 미푸시 |
| Pages | 공개 저장소, legacy build, `main`의 `/`를 배포, 최신 build `built` |

로컬 HEAD의 추가 커밋은 **“Dawn Giant” 로봇 영상 실험 17개 파일만** 추가합니다. Unfold/Elapse 엔진은 공개 main과 같은 기준입니다. main에 이미 반영된 내용과 로봇 별도 작업을 혼동하지 마세요.

기존 미추적 파일은 다음 2개입니다. 삭제·덮어쓰기·다른 작업 커밋에 무조건 포함하지 마세요.

- `docs/reviews/2026-11-02-fresh-topic-field-test.md`
- `docs/specs/2026-11-01-elapse-buildings-proposal.md`

인계 자료 폴더와 ZIP은 최초 작성 후 사용자의 명시적 요청에 따라 main에 게시하는 자료입니다. 원래 작업 폴더에서 브랜치를 바꾸거나 로봇 작업을 병합하지 않고, 별도 main worktree에서 문서만 commit/push합니다.

```sh
cd /Users/jay/motion-skill
git status --short
git branch -vv
git log -6 --oneline
git worktree list
git diff --name-only main...HEAD
```

현재 폴더를 그대로 사용하면 로봇 브랜치에 있습니다. 주 프로젝트를 수정할 때는 현재 작업을 보존하는 별도 worktree/작업 브랜치를 고려하세요. `git reset --hard`, `git clean`, 강제 push, 무조건적인 checkout/pull로 상태를 맞추지 마세요. 원격 추적 ref도 오래될 수 있으므로 필요한 경우 실제 원격을 읽기 전용으로 대조하세요.

## 2. 제품의 목적과 사용자 요구

- 기존 colorfigures 앱/스킬을 베끼는 프로젝트가 아닙니다. 원본에서 아이디어를 분석했지만 결과물의 정체성·기능은 독자적으로 확장했습니다.
- **Unfold**: 제품 내부 구조와 분해/조립을 시간 바와 탐사 가능한 3D로 설명합니다.
- **Elapse**: 대상의 시간 변화, 원리·구조 맥락, 기록을 설명합니다. 현재는 침몰 선박과 역사 건축 중심입니다.
- 대상 사용자는 구조를 알고 싶은 일반인, 교육·설명 목적 사용자, 향후 자기 자료를 제공할 제조업체 등입니다. 교육용 모델을 제조사 승인 수리 매뉴얼로 표현하면 안 됩니다.
- 단순히 실행되는 것보다 시각적 디테일, 이해 가능한 연출, 직접 탐색, 정확한 사실과 근거를 중요하게 봅니다. 사용자는 작은 디테일만 바꾸고 큰 개선이라고 말하는 보고에 실망한 이력이 있습니다.
- 재난을 이야기 거리로 소비하려는 목적이 아닙니다. 기억해야 할 사실, 구조·대피·돌봄·유지관리와 사람/집단의 기여를 남기는 것이 중요합니다. 사망 장면·피해자 모형·영웅 순위·허구의 동선/대사는 넣지 않습니다.
- 사용자가 구현을 맡긴 범위는 자료 조사→구현→검수→보완까지 중간 확인을 최소화하며 진행합니다. 새 기능/대상 선택이 없는 인계 단계에서 임의로 새 프로젝트를 시작하지 않습니다.
- 시각 기준은 기존 승인된 작품과 대상별 공식 자료를 우선합니다. 반응형 폭375/768/1440px, 실제 브라우저 이미지, 조작·기록 복귀·오류/fallback까지 확인합니다.
- 영어 기본, 한국어·영어·일본어·중국어 간체·스페인어 5개 언어 유지. 중국어 선택 표시는 **CH**, 실제 locale 키/문서 태그는 표준 `zh`/`zh-Hans`; `lang=ch` alias도 유지합니다.

## 3. 현재 제공하는 결과물

공개 저장소: https://github.com/jaythealpha/motion-skill

공개 갤러리: https://jaythealpha.github.io/motion-skill/

공식 데모는 **16개 = Unfold 5개 + Elapse 전체 타임라인 8개 + 대표 장면 3개**입니다. 로봇 실험은 이 수에 포함되지 않습니다.

| Unfold 예시 파일 stem | 부품 / 단계 |
|---|---|
| `galaxy-s24` | 56 / 14 |
| `iphone-17-pro` | 69 / 17 |
| `iphone-duo` | 97 / 15 |
| `galaxy-z-fold8` | 72 / 12 |
| `galaxy-z-flip8` | 57 / 10 |

이 표는 현재 모델 파일의 수치입니다. 파일명/메모에 최신·official·verified가 있다고 해서 제품의 현재 판매 여부·실존·내부 구조를 새로 독립 검증한 것은 아닙니다. 새 제품 작업에는 현재 공식 자료 확인이 필요합니다.

| Elapse stem | 탐사 지점 / 사람·기여 기록 |
|---|---|
| `titanic` | 6 / 4 |
| `britannic` | 6 / 4 |
| `eiffel-tower` | 6 / 5 |
| `notre-dame` | 7 / 5 |
| `world-trade-center` | 7 / 4 |
| `sampoong` | 6 / 2 |
| `seongsu-bridge` | 7 / 2 |
| `sydney-opera-house` | 8 / 5 |

전체 기록은31개입니다. 대표 장면은 `titanic-break-study.html`, `wtc-impact-study.html`, `sampoong-collapse-study.html`입니다. 기록이 기본이며 3D는 추정 맥락으로 선택해서 봅니다.

바로 볼 Opera 링크:

- 기록: https://jaythealpha.github.io/motion-skill/elapse/examples/sydney-opera-house.html?view=records&lang=ko
- 홀: https://jaythealpha.github.io/motion-skill/elapse/examples/sydney-opera-house.html?t=100&mode=explore&stop=hall&lang=ko&v=59aa9bb
- 쉘: https://jaythealpha.github.io/motion-skill/elapse/examples/sydney-opera-house.html?t=100&mode=explore&stop=shells&lang=ko&v=59aa9bb
- 건설: https://jaythealpha.github.io/motion-skill/elapse/examples/sydney-opera-house.html?t=32&play=1&speed=xslow&lang=ko&v=59aa9bb

`v`는 캐시 구분용이며 과거 버전을 고정하는 URL이 아닙니다. 별도 변경이 배포되면 실제 최신 본문을 받을 수 있습니다.

## 4. 구조와 실행 환경

프레임워크/서버 앱이 아니라 **정적 HTML + 순수 JavaScript ES modules + vendored three.js**입니다. React/Vite/npm 의존성 설치를 기본 가정으로 도입하지 마세요.

- 확인된 로컬 환경: Node `v24.21.0`, Python `3.14.7`, three.js revision `180`.
- Gate1/빌드는 Node18+, 전체 브라우저 검사는 Node22+와 Chrome/Chromium 필요. Node22+를 기본으로 사용하세요.
- AI 생성은 Claude의 조사/저작 작업입니다. 빌드 스크립트가 모델을 스스로 조사하거나 임의 대상의 정밀 3D를 자동 복원하는 것은 아닙니다.
- 결과 HTML은 코드·모델·번역·라이선스를 포함해 오프라인 재생합니다. 외부 출처 링크를 열 때만 네트워크가 필요합니다.

| 경로 | 역할 |
|---|---|
| `unfold/SKILL.md`, `elapse/SKILL.md` | 저장소의 기준 작업 지침 |
| `unfold/engine/` | 조립 모델, 모션, 폴딩, 레이아웃, 재질, UI |
| `elapse/engine/main.js` | 기록/3D 초기화 진입 |
| `elapse/engine/model.js`, `chapters.js`, `tracks.js` | 스키마·정규화·장별 시간 매핑·상태 평가 |
| `building-render.js`, `building-model.js` | 대상별 건축 렌더러/모델 분기 |
| `records-model.js`, `records-controller.js`, `records-view.js`, `records-text.js` | 근거·인물·사실값과 기본 읽기 화면, 3D 지연 초기화/fallback |
| `elapse/engine/ui.js` | 공통 화면·조작·시간 바·카드. CSS도 이 파일 내부 문자열에 있음 |
| `building-ui.js`, `civil-ui.js` | 건축 게이지와 SVG 도면 주석 |
| `elapse/research/*-gen.mjs`, `*-notes.md` | 재생성 가능한 원본 모델 저작기와 조사 노트 |
| `elapse/research/records/*.json` | 출처·기여자·사실값·불확실성의 원본 번들 |
| `shared/` | 두 스킬의 공통 원본: locale, 재질·조명, 속도, inline builder, CDP, three.js |
| `unfold/shared/`, `elapse/shared/` | 설치 후 독립 실행하도록 복제된 shared. 이쪽을 직접 수정하지 않음 |
| `index.html`, `gallery/main.js`, `gallery/i18n.js` | 공개 갤러리와 언어 전달 |
| `docs/specs/`, `docs/superpowers/plans/`, `docs/reviews/` | 설계·계획·검수 이력 |
| `trials/` | 보통 무시되는 QA/실험 산출물. 로봇 파일17개는 예외적으로 이미 추적 중 |

**inline builder 주의:** `shared/inline.mjs`는 해당 스킬의 모든 `engine/*.js` 모듈을 base64 `data:` import map에 넣습니다. 일부 모델의 모듈만 바꿔도 다른 동일 스킬 HTML의 내장 코드가 오래될 수 있습니다. Elapse 엔진 변경이면 전체8개와 대표 장면3개의 HTML 재빌드 범위를 확인하고, Unfold/shared 변경도 해당 소비자를 함께 확인하세요.

## 5. Unfold의 보존할 동작

기준: `unfold/SKILL.md`, `unfold/references/model-format.md`, `unfold/references/research.md`.

- 현재 승인된 스토리는0과100 모두 완제품입니다.0–8은 방향 전환/폴더블 펼침→분해,8–92 조립,92–100 방향 전환/닫힘·화면 점등입니다. 옛 아이디어의 “0=항상 분해 상태”로 되돌리지 마세요.
- 스택/매트 레이아웃, 컬러/도면, 간단/상세/매뉴얼 깊이, 인쇄 매뉴얼, 속도 선택을 유지합니다.
- 폴더블은 닫힌 상태→펼침→부품→조립→다시 닫힘. 양 끝에서 직접 접기 지원.
- mm 좌표, 기본 screen-down 접근과 `access:'front'` screen-up 접근을 구분합니다. front-access는 화면을 마지막에 덮고 단말을 뒤집지 않습니다.
- `fold.js`의 a/b/bend/split/mid 역할과 `half`, `axis`, `gap`, `spine`, `foldedDims`를 유지합니다. 얇은 화면층만 휘고 두꺼운 힌지/부품을 고무처럼 변형하지 않습니다.
- 충돌 예외 `passesThrough`는 실제 통과 구조를 설명할 때만 씁니다. Gate를 약화해 모델을 통과시키지 마세요.

**이미 알려진 고증 제한:** `DEMOS.md`는 Fold8의 배터리 접근 방향과 출처 설명 충돌을 명시합니다. Flip8은 추정 중심이며 이전 세대 자료도 사용합니다. 자동 검사 통과가 이 고증 문제의 해결을 의미하지 않습니다. 두 문제는 수정 완료로 인계하지 않습니다.

## 6. Elapse의 데이터·사람 기록 원칙

먼저 `elapse/references/new-topic-workflow.md`, `remembrance-format.md`, 대상별 조사 노트를 읽으세요.

- 새 주제에는 실제 자료에 근거한 사람 또는 문서화된 집단의 기여와 범위가 명확한 숫자 사실값을 기본 포함합니다. 이름/숫자를 찾지 못했다면 명시적인 근거 공백을 표시하며 창작으로 채우지 않습니다.
- 행동·역사 사실, 편집자의 의미/기억, 미확정 사항을 분리합니다. 구술 회고·기관 설명·조사 결과·참여자 기록도 자료 유형을 구분합니다.
- 날짜 정밀도와 집계 범위 보존: 자료 게시일≠행동일, 개관≠보존 종료, 조직 대피 인원≠한 사람의 단독 구조 인원.
- 각 record의 `sceneAnchor`는 기존 맥락 사건을 가리킬 뿐 정확한 개인 동선을 재현한다는 뜻이 아닙니다.
- 출처 사진·도면·스캔·원문을 결과물에 복제하지 않습니다. 사실만 추출하고 문장은 새로 씁니다. 출처는 링크로 표시합니다. 자체 제작 형상/텍스처와 출처의 실제 측정값을 혼동하지 않습니다.
- `build-topic.mjs`는 **에이전트가 공급한 근거 번들**을 검사·결합합니다. 웹 조사·독립적인 사실 확인·임의 정밀 3D 생성 엔진이 아닙니다.
- 새로운 대상에는 그 대상의 렌더러가 필요할 수 있습니다. Eiffel/배 형상 이름만 바꾸지 마세요.
- JS 없이 영어 기록 읽기, WebGL 실패 시 현지화된 기록 유지, 3D↔기록 복귀, reduced motion과 언어 전달을 유지합니다.
- 오래된 설치 스킬의 선박 전용 분기를 최신 건축/새 주제 분기와 혼동하지 말고 현재 저장소 지침을 읽으세요.

## 7. 가장 최근 개발: Sydney Opera House

공개 기준 커밋 `59aa9bb`까지 다음이 구현되어 있습니다.

| 파일 | 핵심 책임 |
|---|---|
| `opera-geometry.js` | 공통 구면 패치·좌우 공유 용마루·springing edge |
| `opera-hall-layout.js` | `hallRow`, `rowY`, `hallSeat`, `rowOutline`, `riserOutline`; 좌석과 바닥의 공통 좌표 |
| `opera-form.js` | 기단/계단, 리브/타일/유리, 내부, 오르간, 반사판의 정적 생성과 상태 적용 |
| `opera-model.js` | `operaState`, 시점별 표시와 검증 |
| `opera-render.js` | 카메라·키보드/포인터·도면 대비·주석·매 프레임 절개 적용 |
| `opera-navigation.js` | `nearWallSide`, `pinchZoom`, 확대율 제한 |
| `research/sydney-gen.mjs` | scene·record 원본 생성 |
| `research/sydney-opera-house.scene.json` | records가 붙기 전 원본 scene |
| `research/records/sydney-opera-house.json` | 출처·기여 기록5개/사실값3개 |
| `examples/sydney-opera-house.json` | 컴파일된 최종 모델 |
| `examples/sydney-opera-house.html.research.json` | 근거 커버리지 검사 보고서, 모델 JSON이 아님 |

보존할 사항:

1. 공통 반지름 검사만으로는 쉘 연결이 보장되지 않습니다. 이전 계산은 최대21.12m의 의도치 않은 틈을 놓쳤습니다. 지금은 공유 중앙면 small-circle ridge를 쓰며 좌우 경계 일치까지 검사합니다.
2. 구면75m·용마루70m는 **작업 모델의 가정**입니다. 실측 CAD로 주장하지 않습니다. 외곽 약120×180×67m와 쉘9개 모델 그룹도 추정입니다.
3. 곡선 객석/바닥 단차/좌석 방향은 공통 함수를 사용합니다. 따로 만든 직선 바닥으로 되돌리면 좌석 지지가 어긋납니다.
4. 무대는 남쪽. 일반 무대 깊이12.30m·전면14.50m·객석 높이차0.90m는 기술 자료의 기준 구성입니다. 0.4m 무대 하강은 옛 무대 대비 상대 변화입니다.
5. 오르간 완성1979-05-30과1973 개관,2022 개선을 분리합니다. 새 말굽형 리프트/박스 전면 디퓨저를1973 장면에 표시하지 않습니다.
6. 기술 PDF의2024 발행일은2022 개선 내부의 참고 자료일 뿐2023에서 끝나는 타임라인에 새 사건을 추가하지 않습니다.1963/1967 표시 앵커와 중간 공정은 추정입니다.
7. 탐사8곳은 `overview/podium/shells/ribs/glazing/hall/organ/renewal`. 역사 시간을 고정합니다.
8. Opera에서는 초기화/컬러·도면 전환 후 선택 부위를 유지하고, 카메라 쪽 벽을 매 렌더마다 숨깁니다. 벽 절개는 시야 확보를 위한 표시이며 실제 철거가 아닙니다. 다른 주제의 동작을 무심코 전역 변경하지 마세요.
9. 방향키 회전, +/− 확대·축소, Home 현재 부위 카메라 초기화. 두 번째 포인터의 초기 거리를 잡아 첫 pinch 변화를 반영합니다. 실제 기기 제스처 승인은 별도입니다.
10. 반사판18개는 얇은 닫힌 공유 geometry. 형태·좌표·모델 두께는 추정이며 음향 시뮬레이션이 아닙니다. 각 edge가 두 삼각형에 속하는지 검사합니다.
11. 도면 모드 배경 대비와 선택 부위 주석만 표시하는 방식을 유지합니다. 재질/패널/텍스처 생성은 초기화에 두고 매 프레임에 새로 만들지 마세요.

주요 검수 이력:

- `docs/reviews/2026-11-04-opera-architectural-detail.md`
- `docs/reviews/2026-11-04-opera-followup/design-qa.md`
- `docs/reviews/2026-11-05-opera-usability/design-qa.md` — 최신 상세 기준
- `elapse/research/sydney-notes.md` — 근거, 접근 실패, 충돌과 추정
- `elapse/references/visual-quality-baseline.md` — 전체 품질 기준

## 8. 실행·빌드·검사 명령

모두 저장소 루트 기준입니다. 이번 자료 제작에서는 앱 소스를 바꾸거나 예시 HTML을 재생성하지 않았습니다. 아래는 다음 개발자가 수정할 때 사용할 명령이며, `trials/` 출력은 로컬 검수용입니다.

### 기본 테스트와 미리보기

```sh
npm test --prefix elapse
npm test --prefix unfold
npm test --prefix shared
node scripts/test-locales.mjs
node scripts/sync-shared.mjs --check
```

shared를 실제 수정한 경우에만 아래 동기화 후 소비자 HTML을 다시 빌드합니다.

```sh
node scripts/sync-shared.mjs
```

복제본 동기화는 더 이상 원본에 없는 복제 파일을 제거할 수 있으므로 diff를 확인하세요. `elapse/shared`/`unfold/shared`를 직접 수정하지 않습니다.

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

이미 사용 중인 포트라면 새 서버를 중복 실행하지 말고 확인 후 다른 포트를 씁니다. 예: `http://127.0.0.1:8765/elapse/examples/sydney-opera-house.html?t=100&mode=explore&stop=hall&lang=ko`.

### Opera 원본에서 안전한 별도 출력 생성

```sh
MOTION_QA_DIR="$PWD/trials/claude-handoff-2026-11-10"
mkdir -p "$MOTION_QA_DIR"
node elapse/research/sydney-gen.mjs
node elapse/scripts/build-topic.mjs \
  elapse/research/sydney-opera-house.scene.json \
  "$MOTION_QA_DIR/opera.html" \
  --records elapse/research/records/sydney-opera-house.json
node elapse/scripts/check_opera.mjs "$MOTION_QA_DIR/opera.html" "$MOTION_QA_DIR/focused"
node elapse/scripts/check_opera_surface.mjs "$MOTION_QA_DIR/opera.html" "$MOTION_QA_DIR/surface"
MOTION_GRAPHICS=hardware node elapse/scripts/shoot.mjs "$MOTION_QA_DIR/opera.html" "$MOTION_QA_DIR/gate2"
node elapse/scripts/check-topic.mjs "$MOTION_QA_DIR/opera.html" "$MOTION_QA_DIR/records"
QA_SUBJECTS=sydney-opera-house node scripts/check-demo-locales.mjs "$MOTION_QA_DIR/locales"
```

`check-demo-locales.mjs`는 마지막의 임시 HTML이 아니라 `examples/`의 패키지된 데모를 검사합니다. 임시 출력에 대한 locale 필드 검사는 compiler가 수행합니다. 최종 examples를 교체한 후 패키지 데모 검사를 다시 해야 합니다.

`build-topic`은 출력 HTML, 동명의 JSON, `.html.research.json`을 만듭니다. **원본 scene과 출력 JSON 경로를 겹치지 마세요.** 조사 노트는 사실 확인 증거이고 커버리지 JSON은 구조 검사 증거입니다.

실제 Gate2와 이미지 검수가 끝난 뒤에만 최종 생성 명령에 `--gate2 pass`를 붙이세요. 이 옵션은 검사 자체가 아닙니다. Chrome/권한/실행 환경 문제로 미실행이면 skipped 또는 미검증으로 보고합니다. Gate 재시도 한도는 각 스킬 지침을 따릅니다.

### 패키지 Elapse 전체 HTML 재생성

관련 모델 수정 후 사용자 승인 범위에서 실행합니다. 아래 `--gate2 pass`는 **해당 변경의 실제 검수가 끝난 상태에서만** 사용하세요. 미검수 재생성은 flag를 생략합니다.

```sh
node elapse/scripts/build-topic.mjs elapse/research/sydney-opera-house.scene.json elapse/examples/sydney-opera-house.html --records elapse/research/records/sydney-opera-house.json --gate2 pass
for model_id in titanic britannic eiffel-tower notre-dame world-trade-center sampoong seongsu-bridge; do
  node elapse/scripts/build.mjs "elapse/examples/$model_id.json" "elapse/examples/$model_id.html" --gate2 pass
done
node elapse/scripts/build-break-scene.mjs
node elapse/scripts/build-wtc-study.mjs
node elapse/scripts/build-sampoong-study.mjs
```

`build-wtc-study.mjs`의 현재 출력은 기본 examples 경로입니다. 임의 CLI 출력 경로를 지원한다고 가정하지 마세요.

### Unfold 기준 예시

```sh
node unfold/scripts/check_model.mjs unfold/examples/galaxy-s24.json --official 70.6,147,7.6
node unfold/scripts/build.mjs unfold/examples/galaxy-s24.json "$MOTION_QA_DIR/galaxy-s24.html"
node unfold/scripts/shoot.mjs "$MOTION_QA_DIR/galaxy-s24.html" "$MOTION_QA_DIR/unfold-shots"
```

`MOTION_QA_DIR`는 위에서 정의한 변수입니다. 폴더블은 해당 모델에 맞는 `--official`와 `--official-folded`를 확인하고 씁니다. 출력 flag만 바꾸고 검사 통과를 주장하지 마세요.

### 브라우저 실행 주의

- 기존 `shared/cdp.mjs`는 격리된 headless Chrome을 실행·정리합니다. 현재 사용자 브라우저의 임의 CDP 포트를 점유하지 마세요.
- Chrome이 없으면 실제 실행 파일 경로를 `CHROME`으로 지정합니다. GPU 확인은 기기/실행 환경마다 달라집니다.
- GPU/속도 측정은 브라우저 여러 개를 동시에 돌리지 않습니다. 경쟁 때문에 속도 검사 오탐이 생긴 이력이 있습니다.
- contact/key 이미지와 확대 이미지를 직접 확인합니다. 자동 PASS는 시각 완성도·실측·원어민 교정·실물 모바일 승인이 아닙니다.
- 공개 HTML을 Node `execFileSync`의 stdout으로 받을 때는 기본 버퍼보다 큽니다. `maxBuffer: 32 * 1024 * 1024` 또는 파일 출력을 사용하세요. Python의 로컬 CA 설정 때문에 HTTPS 검사가 실패하면 시스템 `curl` 등 정상 인증서 검증 경로를 쓰며 TLS 검증을 끄지 않습니다.
- Codex의 브라우저 핸들/도구명이나 `/private/tmp` 임시 스크립트를 다음 Claude 세션이 그대로 사용할 수 있다고 가정하지 않습니다. 저장소에 들어 있는 Node 검사 도구를 기준으로 재현하세요.

## 9. 검증 상태: 이번 확인과 과거 증거 분리

### 2026-11-10 이번 인계에서 새로 실행

| 검사 | 실제 결과 | 포함 로그 |
|---|---|---|
| Elapse 단위 | UTC158/158 + Asia/Seoul158/158, 실패0 | `checks/elapse-tests.log` |
| Unfold 단위 |43/43, 실패0 | `checks/unfold-tests.log` |
| shared 단위 |8/8, 실패0 | `checks/shared-tests.log` |
| locale 단위 |3/3, 실패0 | `checks/locales-tests.log` |
| shared sync | up to date | `STATE.json` |
| 원격·Pages | main59aa9bb / built / public | `STATE.json` |
| Opera 공개 HTML·모델 | 둘 다 현재 workspace와 byte-identical | `STATE.json`의 크기·SHA-256 |

### 2026-11-05 이전 브라우저·설치 증거, 이번에 재실행하지 않음

- 전체 Gate2:49장면.
- Opera 탐사/상태/포커스/절개:105/105,375/768/1440px.
- 5개 언어 화면:15/15.
- 기록·복귀·no-JS/WebGL fallback:79/79.
- surface:3/3, 유한 좌표·닫힌 반사판·개체 수 안정성.
- 독립 폴더 재생성:12/12 byte-identical.
- 당시 AMD Radeon Pro5300 / ANGLE Metal,1440px: 건설90프레임 중앙16.6ms/p9517.6ms, 홀 회전 중앙16.7ms/p9517.5ms. 보편적/실물 모바일60fps 보장이 아닙니다.

증거는 최신 QA 문서와 로컬 `trials/opera-usability-2026-11-05/`에 있습니다. **대부분의 trials와 캡처는 Git clone에 포함되지 않습니다.** 기록된 숫자를 현재 새 코드의 자동 승인으로 사용하지 마세요. 일부 JSON에 `meta.gate2`가 없거나 HTML과 다를 수 있으므로 flag만으로 검수 상태를 확정하지 않습니다.

## 10. 설치 스킬과 공유 파일 주의

다음 경로의 `SKILL.md` 해시가 저장소와 다름을 이번에 직접 확인했습니다.

- `/Users/jay/.claude/skills/elapse/SKILL.md`
- `/Users/jay/.claude/skills/unfold/SKILL.md`
- `/Users/jay/.agents/skills/elapse/SKILL.md`
- `/Users/jay/.agents/skills/unfold/SKILL.md`

이는 문서 차이의 확인입니다. 설치본 엔진 전체가 어느 버전인지는 이번에 검사하지 않았습니다. `/elapse` 또는 `/unfold`가 자동 로드한 문서를 저장소 최신판으로 간주하지 마세요. 실제 hash는 `STATE.json`에 있습니다. 기존 설치 덮어쓰기는 하지 않았고, 필요 시 사용자 설정/개별 변경을 보존하는 업데이트 절차가 별도로 필요합니다. `INSTALL.md`의 설치 명령도 기존 폴더를 건너뛰므로 자동 갱신 명령이 아닙니다.

## 11. 남은 항목과 권장 우선순위

새 구현 주제는 이번 인계 요청에서 지정되지 않았습니다. 다음은 **검토 후보**이며 새로 승인된 개발 범위가 아닙니다.

1. **문서 정합성 정리:** 실제16개/전체 타임라인13개와 `DEMOS.md`의 옛12개·누락 Opera 행을 대조. 같은 문서의 서울 예시 부분은 “차량 없음/각6개 탐사”라는 오래된 설명이 있어 실제 Seongsu 차량/7개 탐사와 충돌합니다. 인계 작업에서는 문서 내용을 임의로 고치지 않고 발견사항으로 남겼습니다.
2. **Fold8 고증 재검토:** 이미 명시된 배터리 접근 방향·출처 충돌부터 사실과 모델을 대조. 모션 PASS와 별개의 문제입니다.
3. **실물 모바일·터치 검수:** iOS/Android의 pinch·회전·캔버스/페이지 스크롤·장시간 재생·이미지/영상 저장을 확인. 기존 증거는 데스크톱/에뮬레이션과 단위 검사를 구분합니다.
4. **전문/원어민 검토:** 정밀 구조·치수·안전성, 음향/접근성, 5개 언어 전체 문장 교정은 미검증입니다.
5. **설치본 버전 관리:** 기존 설치를 보존하면서 저장소 버전으로 갱신/대조하는 절차가 필요합니다.

보류/별도 아이디어: TV·모니터·프로젝터는 이전에 보류했고, 자동차는 별도 프로젝트 방향이었습니다. 인간 장기/생활 습관 비교, 지층·해수면, 지역·시대 진화, 가상 세계 등을 현 엔진이 이미 정밀 지원한다고 약속하지 마세요.

## 12. 별도 로봇 실험 브랜치

현재 checkout된 `robot-dawn-film`은 이 채팅의 주력 제품과 구분되는 로컬 작업입니다.

- 경로: `trials/robot-dawn-2026-11-05/`
- 로컬 커밋: `4d59074`. 최초 인계 스냅샷에서는 main보다 로봇 커밋1개가 앞서 있었습니다. main에 인계 문서 커밋이 추가된 이후에는 두 브랜치가 갈라진 상태일 수 있으며 로봇을 병합한 것이 아닙니다.
- 소스: `src/core.js`, `paint.js`, `robot.js`, `assets.js`, `shots.js`, `audio.js`, `main.js`, `template.html`.
- 결과: `robot-dawn.html`,91초 단일 HTML 브라우저 영상. Unfold/Elapse의 공식 데모16개와 별개.
- `prompt.md`가 캐릭터/장면 기준. 사용자의 기존 캐릭터 비율·색·핀 등 보존 지침이 있어 임의 재디자인 금지.
- root `.gitignore`는 trials를 무시하지만17개 파일은 이미 추적 중입니다. `git ls-files trials`로 확인합니다. 무시된 QA 폴더처럼 정리/삭제하지 마세요.
- 이 인계에서는 로봇 빌드·결정성·오디오·성능 검사를 재실행하지 않았습니다. 이전 성공을 최신 승인으로 주장하지 않습니다.

로봇 작업을 별도로 이어간다고 명시된 경우에만, 해당 폴더에서:

```sh
cd /Users/jay/motion-skill/trials/robot-dawn-2026-11-05
node build.mjs
node determinism.mjs
node audiocheck.mjs
node perf.mjs
```

이 스크립트들은 cwd에 의존하는 부분이 있습니다. 다른 컴퓨터에 이 로봇 브랜치를 옮기려면 별도 소스 복사/git bundle 등 보존 작업이 필요합니다. 이 인계 ZIP에 로봇 코드가 들어 있거나 원격에서 바로 받을 수 있다고 가정하지 마세요.

## 13. 배포 경로와 검증 순서

과거 이 프로젝트에서 공개 저장소 전환·Pages 배포 및 지정 개선의 push는 사용자가 승인해 수행했습니다. 이 문서가 임의의 새 공개/배포/권한 변경에 대한 승인은 아닙니다. 현재 요청 범위와 환경 권한을 확인하세요.

승인된 릴리스에서는:

1. git diff와 기존 사용자 파일을 확인하고 해당 작업 파일만 commit합니다. 로봇 브랜치/미추적 초안을 섞지 않습니다.
2. 데이터·언어·대상별 단위/화면/행동/fallback 검수 후 consumer HTML을 동기화합니다. `shared/` 수정이면 복제본도 동기화합니다.
3. 실제 fresh isolated install에서 재빌드를 확인합니다. 기존 사용자 설치를 덮어쓰지 않습니다. `scripts/check-installed-remembrance.mjs`는 오래된11건 범위이며 Opera가 자동 포함된다고 가정하지 말고 별도로 `build-topic` 경로를 확인합니다.
4. 정상 push만 사용합니다. Pages는 main/root 기반 legacy build입니다.
5. `gh api repos/jaythealpha/motion-skill/pages/builds/latest`에서 **원하는 정확한 커밋**의 `built`와 오류 없음 확인.
6. 공개 HTML·모델을 받아 SHA-256/byte identity를 확인합니다. builder 성공/HTTP200만으로 완료 처리하지 않습니다.
7. 새 공개 URL의 핵심 흐름을 실제 브라우저에서 확인하고 캡처합니다. URL의 `v=<커밋>`은 캐시 구분용입니다.
8. 구현·테스트·브라우저·실물/전문 검토·외부 서비스 검증을 구분해 보고합니다.

## 14. 다음 담당자의 완료 보고

구현이 요청되면 결과, 실제 검수 폭/흐름, 실행 검사와 수량, 고친 문제, 보존한 기록/값, 실패·미실행, 남은 미검증을 짧게 보고하세요. 없는 테스트 명령을 만들거나 검사 규칙을 약화해 PASS를 만들지 않습니다. 새 백엔드·인증·결제·프레임워크·자료/API 비용·데이터 삭제·공유 권한 확대는 현재 승인 범위를 넘겨 도입하지 마세요.

인계 자료의 main 게시는 사용자가 별도로 승인한 범위입니다. 앱 소스 수정·로봇 브랜치 병합·다음 기능 구현은 이번 게시 작업에 포함하지 않습니다. 다음 구현 과제 선택은 사용자의 후속 요청에 맡깁니다.
