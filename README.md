# Unfold & Elapse

Two experimental [Claude Code](https://claude.com/claude-code) skills. Each turns a real subject into **one offline HTML page** with a time bar you can drag.

**Unfold: how a product goes together**
- It researches public teardown data and writes an assembly model of the phone's parts.
- The bar runs from the finished phone, through its parts burst apart, back to the finished phone.
- Options:
  - layouts: an exploded stack or parts laid out on a mat
  - styles: colour or blueprint
  - a printable assembly manual
- It covers bar phones and foldables. Examples: Galaxy S24, Galaxy Z Fold8, Galaxy Z Flip8, iPhone 17 Pro, iPhone Duo.

**Elapse: how a subject changes over time** (shipwrecks + historical buildings)
- The bar is cut into chapters, from the accident to the wreck on the seabed.
- The page shows:
  - water filling the watertight compartments in an x-ray view
  - the lights failing
  - the hull breaking
  - the descent, with a depth gauge
  - decay over the decades
  - projections, clearly marked
- Ship examples: RMS Titanic and HMHS Britannic.
- Building examples: World Trade Center9/11, recovery and selected rebuilding through2018, with dated exploration; Notre-Dame fire, damage and restoration (2019–2024), with seven inspection stops and an explicitly labelled vault cutaway; Eiffel Tower construction (1887–1889), with monthly milestones, estimated lattice geometry, construction-height gauges and structural exploration.

영어 UI가 기본이며 한국어·일본어·중국어(간체)·스페인어도 지원해요. 두 스킬 모두 공개 자료를 조사해서 만들고, 자료 조사부터 빌드까지 이어지는 작업 절차를 제공해요. 도구 권한·네트워크·AI 실행 환경에 따라 중단될 수 있고, 새 결과물은 데이터·화면 검사를 거쳐야 해요. 자동 검사는 역사·제품 구조·수리 안전성의 정확성을 보증하지 않아요.

All 15 demos and both skills support English (default), Korean, Japanese, Simplified Chinese and Spanish. The gallery passes its selected language to each demo, and standalone pages remember your choice locally. Translation is bundled; playback makes no translation requests.

Packaged demos include subject-specific high-detail finishes; see [visual quality and limits](DEMOS.md#고품질-표현). Additional surface/structural detail is illustrative and does not increase measured accuracy or the sourced share.

New structural-history examples: [Sampoong](https://jaythealpha.github.io/motion-skill/elapse/examples/sampoong.html?lang=en) and [Seongsu Bridge](https://jaythealpha.github.io/motion-skill/elapse/examples/seongsu-bridge.html?lang=en). Both include five languages and locked-date Explore; detailed geometry and failure motion remain estimated.

The Sampoong full timeline now uses the same recessed facade, roof-services and progressive plate-failure model as its [scene study](https://jaythealpha.github.io/motion-skill/elapse/examples/sampoong-collapse-study.html?lang=en). Seongsu includes normal four-lane traffic and a route16 bus / six-vehicle fall illustration anchored in historical accounts. Coordinates, timing, rotation, livery and damage remain estimated; no people are depicted. All demos were rebuilt with shared material-normal detail and finer desktop shadow maps; these are educational graphics, not photoreal or forensic reconstructions.

Chinese selectors display **CH**. Standard `zh` / `zh-Hans` document tags and existing URLs remain valid; `?lang=ch` is also accepted.

## Principles

- **Every fact is marked:**
  - sourced (with links)
  - estimated
  - disputed (with the alternatives)
  - projection

  The page shows the shares and warns when less than half is sourced.
- **Facts only from sources:**
  - sizes, times, counts, order and names
  - every sentence written fresh
  - no photos, scans or text copied from teardown sites, encyclopedias or expeditions
  - sources appear as links only
- **Respect for shipwrecks:**
  - no people or lifeboats are drawn
  - a plain memorial note on every wreck
  - recent or politically disputed sinkings are declined

공개 갤러리는 **영어 기본**, 한국어·영어·일본어·중국어(간체)·스페인어를 지원합니다. [언어 선택과 데모별 지원 범위](DEMOS.md#갤러리-언어)를 확인하세요.

## 시작하기

**[브라우저에서 15개 데모 바로 보기](https://jaythealpha.github.io/motion-skill/)**


- **설치:** [준비물·복제·기존 설치 보존·첫 빌드](INSTALL.md)
- **보기:** [15개 데모와 로컬 실행 방법](DEMOS.md)
- **최근 변경:** [역사 건축·WTC·해저 장면과 공개 준비](elapse/CHANGELOG.md)

생성 작업은 Claude Code용입니다. 포함된 HTML 데모는 AI 없이 브라우저에서 볼 수 있습니다. 전체 검사에는 Node 22 이상과 Chrome/Chromium이 필요하며 npm 패키지는 설치하지 않습니다. 설치·빌드 재현은 macOS에서 확인하며, 다른 OS와 에이전트의 동작은 별도 검증이 필요합니다.

**교육·설명용입니다.** 내부 좌표·치수·조립 경로에는 추정이 포함됩니다. 매뉴얼 모드는 제조사 승인 수리 매뉴얼을 대신하지 않습니다. 기존 모델의 제한을 [데모 안내](DEMOS.md#한계)와 각 페이지에서 확인하세요.

## Repository

| Folder | What |
|---|---|
| `unfold/` | The Unfold skill: `SKILL.md`, engine, scripts, references, examples, tests |
| `elapse/` | The Elapse skill, laid out the same way |
| `shared/` | Code both skills use: three.js, headless Chrome driver, toon shading, speeds, confidence marks |
| `scripts/sync-shared.mjs` | Copies `shared/` into each skill, so an installed skill stands alone. Run it after editing `shared/`, and `--check` before committing. |
| `docs/` | Design specs and implementation plans |

Tests:

```bash
cd unfold && npm test
```

```bash
cd elapse && npm test
```

```bash
cd shared && node --test
```

이번 상세 타임라인·언어 갱신의 로컬 검증은 [배포 후보 QA](docs/reviews/2026-11-03-civil-release-candidate.md)에 정리했습니다. 기존 공개 배포·익명 설치 확인은 [공개 배포 리포트](docs/reviews/2026-11-02-public-release.md), 이전 라이선스·오프라인 점검은 [공개 준비 리포트](docs/reviews/2026-11-02-public-readiness.md)에 정리했습니다. 공개 데모는 GitHub Pages에서 제공하며, 새 버전의 재현·검증 범위는 리포트에서 확인하세요.

## Licence

MIT (see [LICENSE](LICENSE)). Bundled three.js is separately attributed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), with its licence retained in every skill. External sources remain subject to their own terms; source links do not grant rights to their text or images.

These are unofficial educational illustrations, not endorsed by Apple, Samsung or the shipwreck source organisations. Product names remain their owners’ marks.
