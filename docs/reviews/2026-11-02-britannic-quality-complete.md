# Britannic high-quality wreck mode — completed local scope

Date:2026-11-02. Supersedes the first material-only prototype in `2026-11-02-britannic-quality-study.md`.

## Delivered

`trials/britannic-quality-2026-11-02/delivery.html` and `delivery.model.json`. Open `?t=90&mode=explore&stop=bow&cutaway=1&study=quality`.

The requested first-subject quality mode is implemented as an independently authored damaged-wreck detail tier: actual alternate skin geometry, torn-edge sheets, exposed frames and deck plates; foredeck winches/capstans/chains; bridge telegraphs and telemotor; three propellers, shafts and rudder; PBR patina, micro-surface shading, curved panel seams and instanced rivets; observation lighting/fog/particles and site-positioned sediment. Five inspection stops and standard/high comparison are available. Explicit structural cutaway reveals forward interior and bridge roof; this is labelled explanatory and must not be described as archaeological roof collapse or surveyed geometry.

Mobile and detected software renderers use reduced repetition and simpler normal shading, without the desktop hardware shadow pass. The single HTML is approximately1.4MiB, offline, with existing licence notices. No external texture/GLB files or paid services are required. Standard view and existing repository demos were preserved.

Reusable installer-facing commands are included in the skill: `scripts/build-quality.mjs` and `scripts/check_quality.mjs`; details in `references/quality-tier.md` and SKILL.md. The builder emits a companion JSON, does not overwrite input, and resets gate status for a fresh run.

## Evidence and actual outcomes

- Gate1 on delivery model: pass, zero errors/warnings, historical sourced share unchanged at29%.
- Full high-quality timeline Gate2 on the preceding `final.html` build:73 captures pass, water and all four speeds checked. It predates final comparison-link/touch styling and optional cutaway/camera refinements. These final changes were checked separately below; do not claim a second full73-capture run on delivery.html.
- Final `accepted-shots/results.json`:15 inspection frames (5 stops ×375/768/1440px) and36 timeline/style transitions, no recorded JavaScript/GPU shader errors or horizontal overflow. Tests also cover inspection return, history lock, and non-overlapping information cards.
- `delivery-layout.json`:40 states at375×667,375×812,768×1024 and1440×900; five times and both styles, fixed information slots with no overlaps. Taken before the final bow-camera adjustment, which does not alter layout.
-109 unit tests pass in UTC and Asia/Seoul; the final bow-angle adjustment additionally passed the two quality-form tests. Shared-copy and whitespace checks pass.
- Full-size desktop/tablet/mobile inspection captures reviewed. Bow view was changed to290°yaw/35°pitch after reviewing four candidate views, because earlier side views obscured the added frames. Final accepted captures show the opening and structure; the cutaway remains explicitly explanatory.
- Isolated skill copy under a path containing spaces rebuilt byte-identical HTML before final verification-status stamping (`isolated-build.txt`). This proves package build reproducibility, not fresh-agent skill discovery in Claude Code or another client.
- Native in-app browser opened with historical time locked at2009, forward inspection selected, and comparison/cutaway links visibly present. Final HTML's verification stamp reflects the composite full-run and focused regression evidence above.

Final counts: one requested high-quality subject delivered; five inspection stops; zero failed final checks. Earlier failure captures and material-only prototypes remain preserved in the trial directory. No physical-device, exhaustive screen-reader or hardware-shadow acceptance is claimed.

## Performance boundary

Headless Chrome identified a software renderer. Final timing samples were approximately16ms at375px,316ms at768px and386ms at1440px median wall time around render/requestAnimationFrame calls, with multi-second warm-up maxima. These are NOT GPU timer queries, physical-device FPS or a guarantee of smooth desktop rendering. They show significant renderer-dependent cost; software mode intentionally lowers the detail/shadow budget. Hardware GPU performance and sustained mobile thermals remain unverified. Performance optimisation is not declared complete.

## Evidence boundaries

Primary expedition accounts consulted: [Nick Hope1998](https://www.bubblevision.com/underwater-videos/HMHS-Britannic.htm), [Atlantic Wreck Salvage2019](https://dvtenacious.com/h-m-h-s-britannics-lost-bell/), and [Sotirou2012](https://divernet.com/scuba-diving/general-wrecks/project-britannic/). Three propellers and reported blade counts/diameters have record support. Exact tear contours, frame spacing, equipment coordinates, blade pitch/profiles and surface growth are independent estimates. Dates in the original timeline were not changed. The detail layer is not a dated census or a measured conservation/CAD model. No people, remains or lifeboats were added and no source photos/scans/video frames were copied.

Scoped visual/functional QA: passed for the completed local inspection/quality-mode scope, with the performance and factual limits above. This is not a claim of photorealistic or survey-level acceptance.

No Git commit/push, deployment, public-demo replacement or installed-user-skill overwrite was performed. The working source and local deliverable are ready for review; existing unrelated changes remain intact.
