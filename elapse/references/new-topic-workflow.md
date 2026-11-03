# New topic: people, facts and historical context

Use this for every new subject, without a separate request for people records. Start with the user's subject and preserve the existing approval scope. The skill does not authorize publication unless requested or already authorized.

## Research and author

1. Retrieve official operator/museum/archive/inquiry accounts and primary participant accounts. Record source title, original HTTPS URL, type, passage locator and actual access date. Keep authored research notes distinguishing full source access, search-only snippets, unavailable pages, conflicts and estimates. A search result or a saved access date alone is not primary-source verification.
2. Research a relevant **person or documented collective**, their concrete contribution and role. Include practical collective work and ongoing care, not only famous designers. Keep actions as original summaries; separate editorial meaning. A collective record is acceptable where individual names are not established. Never invent motives, dialogue, routes, rescue counts or worker names.
3. Extract **numeric values with units and scope** that explain the contribution or historical change. State the population, period, venue, approximation and denominator where applicable. Do not combine overlapping groups. Preserve date precision. A report's publication date, an event date and a whole work period are different. Ongoing maintenance does not end at reopening.
4. Write five-language records in `evidence.json` following `remembrance-format.md`, with optional `contributors` and the documented gap representation. The record body must make the contributor and action readable; metadata alone is insufficient. Copy only facts, never source photos, drawings, transcripts or scans. No paid data or generation APIs are required.
5. Write the time model (`scene.json`) independently of the records. Use a supported ship model or the subject's own structural template. Keep all inferred detail and intermediate motion estimated. Each record's `sceneAnchor` references an existing context event; it does not assert a person's precise location or time. If the required new template cannot be completed, report the incomplete geometry rather than promise arbitrary automatic 3D.

## Compile and check

```
node <skill>/scripts/build-topic.mjs scene.json out.html --records evidence.json
node <skill>/scripts/shoot.mjs out.html out-shots
```

The first command writes `out.html`, a sibling `out.json`, and `out.html.research.json`. It merges supplied evidence, marks the new-topic profile, checks coverage, runs Gate1 and all five locale fields, and only then replaces deliverables. It does not browse, authenticate a historical claim or certify translation. The agent handles source retrieval and editorial review before this command. `build.mjs` remains the low-level legacy/study builder, not the default new-topic workflow.

Keep the source scene separate from the output sibling JSON so compiling does not overwrite the authored input. Failed validation must preserve an existing output. `--gate2 pass` is only an author-supplied label: set it after actual browser gates and inspection, not to silence a failure. Run the compiler again with the checked gate status.

Inspect the default records, individual deep links, source links and numerical scopes in en/ko/ja/zh/es at375/768/1440px. Verify normal 3D/Explore/time return, keyboard focus, reduced motion, script-disabled English reading and WebGL-failure reading. Inspect full-size screenshots and fix clipping/overlaps; schema checks are not visual approval. Run `node <skill>/scripts/check-topic.mjs out.html record-qa` for a new topic; this checker accepts a local HTML or public URL. Run relevant existing tests and the fresh-topic compiler's negative tests. Rebuild from a fresh isolated install, preserving a user's active installation.

When public release is authorized, update the existing gallery card and locales, demo/installation guide and third-party notices, commit only task changes, push normally and verify Pages at the deployed commit. Check live browser flows and file hashes independently of the local build. Report actual successes, evidence gaps and unverified physical-device, native-speaker or expert review separately.

## Complete example

`research/sydney-gen.mjs` creates the scene and evidence for `sydney-opera-house`. Run it, then:

```
node <skill>/scripts/build-topic.mjs <skill>/research/sydney-opera-house.scene.json opera.html --records <skill>/research/records/sydney-opera-house.json
```

Five records include shared design, collective construction work, Peter Hall's interior completion, Concert Hall renewal and recognition. The approximate workforce,18 reflectors and0.4m relative stage lowering have separate scopes and source locators. The9 illustrated sail groups and their control points are estimates, not an official shell inventory. This example's geometry is not automatically valid for the next unrelated subject.
