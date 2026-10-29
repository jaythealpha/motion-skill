# Unfold & Elapse

Two [Claude Code](https://claude.com/claude-code) skills. Each turns a real subject into **one offline HTML page** with a time bar you can drag.

**Unfold: how a product goes together**
- It researches public teardown data and writes an assembly model of the phone's parts.
- The bar runs from the finished phone, through its parts burst apart, back to the finished phone.
- Options:
  - layouts: an exploded stack or parts laid out on a mat
  - styles: colour or blueprint
  - a printable assembly manual
- It covers bar phones and foldables. Examples: Galaxy S24, Galaxy Z Fold8, Galaxy Z Flip8, iPhone 17 Pro, iPhone Duo.

**Elapse: how a subject changes over time** (this version: shipwrecks)
- The bar is cut into chapters, from the accident to the wreck on the seabed.
- The page shows:
  - water filling the watertight compartments in an x-ray view
  - the lights failing
  - the hull breaking
  - the descent, with a depth gauge
  - decay over the decades
  - projections, clearly marked
- Examples: RMS Titanic and HMHS Britannic.

한국어 UI가 기본이고 영어도 지원해요. 두 스킬 모두 공개 자료를 조사해서 만들고, 사람의 검토 없이 끝까지 혼자 돌아가요. 결과물을 내기 전에 자동 검사 두 개(데이터, 화면)를 통과해야 해요.

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

## Install

Copy a skill folder into your Claude Code skills folder:

```bash
cp -R unfold ~/.claude/skills/unfold
```

```bash
cp -R elapse ~/.claude/skills/elapse
```

Then ask Claude Code, for example, "갤럭시 S24가 어떻게 조립되는지 보여줘" or "show me how the Titanic sank".

**Requirements:**
- Node 18+ for the data gate and the build.
- Node 22+ and Chrome or Chromium for the screenshot gate. There are no npm packages.

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

## Licence

MIT (see `LICENSE`). three.js is MIT, © three.js authors (`shared/vendor/LICENSE-three.txt`). The facts in the examples come from the sources linked in each page.
