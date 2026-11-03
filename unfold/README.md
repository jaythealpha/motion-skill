# Unfold

A Claude skill. Name a phone, or show a photo of one. Bar phones and foldables are both supported. Claude researches the phone's real parts from public teardown and repair data, then builds one self-contained HTML page.

Drag the 0–100 time bar and the finished phone opens, bursts into its parts and assembles itself again. A foldable folds and unfolds, and viewers can also fold it by hand. Pick the playback speed: 1× (the slowest), 2×, 3× or 5×.

- **Two layouts:** an exploded stack, or every part laid out on a cutting mat (knolling).
- **Two styles:** colour illustration, or an animated blueprint with numbered balloons, assembly guides and a parts list.
- **Three depths:** simple (key parts and what they do), detailed (everything, labelled as it moves) and manual (step cards, tools, cautions, bill of materials, a printable manual).
- **Honest by design:** every part is marked sourced or estimated, the page shows the share, and the known limitations are listed with the sources.
- Works offline and on phones. Exports a PNG, a WebM video and a printed manual. English by default; Korean, Japanese, Simplified Chinese and Spanish are available.

```
node scripts/check_model.mjs examples/galaxy-s24.json --official 70.6,147,7.6   # Gate 1 (foldables: add --official-folded W,L,T)
node scripts/build.mjs examples/galaxy-s24.json out.html                       # one HTML file
node scripts/shoot.mjs out.html shots                                          # Gate 2 + contact sheet + key shots
node scripts/shoot.mjs out.html views --only "t=0&zoom=2" --scale 2             # one close-up view
npm test                                                                       # engine tests (node:test)
```

See `SKILL.md` for the workflow Claude follows, and `references/` for the model format and research rules.

MIT. Bundles three.js (MIT).

The bundled three.js authors’ notice is retained in [shared/vendor/LICENSE-three.txt](shared/vendor/LICENSE-three.txt).

## 고품질 표현

새 모델과 포함된 예시는 금속·렌즈·기판별 재질과 부드러운 곡면을 기본 사용합니다. 모바일·소프트웨어 렌더러에서는 가벼운 광택 재질을 사용합니다. `?quality=standard`로 기존 일러스트 방식과 비교할 수 있습니다. 회로 무늬·코팅·미세 결은 추정 표현이며 실측 회로도나 제조사 수리 지침이 아닙니다. 자세한 범위는 [품질 기준](references/quality-tier.md)을 확인하세요.
