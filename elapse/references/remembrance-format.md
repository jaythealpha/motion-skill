# Claim-level records (version 1)

For new topics, `remembrance` is required through `scripts/build-topic.mjs`; it remains optional for legacy scene-only low-level models and independent of geometry and scene confidence. It contains `version:1`, `sources` and a non-empty `records` array. The eight packaged timelines include it; standalone directing studies retain their scene workflow.

The default is **Read the records**. `?view=records&record=welles&lang=en` selects a record. `?view=scene`, an explicit `?t=…`, `?mode=explore` or `?play=1` opens the existing 3D view; `view=records` overrides them. The same page preserves historical progress and camera when switching views. Only request the 3D runtime when needed. Pause playback, independent survey motion and normal traffic when reading.

The builder emits all record articles and evidence links as English HTML before JavaScript. JavaScript enhances selection and five-language support. Without JavaScript the full English record is readable. If WebGL fails, the localized records remain available and the failure is explicit. Offline source links require a connection to visit; their summaries do not.

## Evidence and data

See `research/records/world-trade-center.json` for a complete example. A source requires `id`, `title`, HTTPS `url`, `type`, `locator` and ISO `checkedAt`. Types distinguish museum accounts, collections, investigation reports, expedition accounts, authored archival essays, chronology entries, interviews and institutional records. The access date is not independent corroboration.

A record requires a stable `id`, five-language `title`, `action`, `meaning`, `unknowns`, plus:

- `time: {date, precision, zone?}`: preserve **year / month / date / minute / second / approximate** precision. Timed records require a named zone. A date-only source must not become midnight. A month-only document must not acquire a day. Unknown personal action minutes remain unknown.
- `sourceIds`: support the factual action summary. Keep editorial reflection in `meaning`; do not present it as a quotation or documented motive.
- `facts`: each has `id`, five-language `label` and `scope`, one shared `value`, `unit`, optional five-language `qualifier`, and `sourceIds`. Supported units are in `engine/records-text.js`. Numbers are shared across all locales. Describe population, place, period and whether a value is a source's reported count. Do not add overlapping totals.
- `sceneAnchor: {eventId}`: an existing scene context, **not the time, path or motion of a person**. The reader says this explicitly. Do not add people to the reconstruction to fill evidence gaps.

Never invent rescue totals, names, exact dialogue, internal thoughts or minute-by-minute routes. Include collective work and practical preparation as well as named actions. Do not animate victim counts as scores. Reopening and institutional retrospectives do not prove that all work or risk ended. Original summaries only; no source pictures, audio or document scans are included.

The prominent scene label points to evidence and estimated reconstruction. `classShares()` remains model-item composition, not historical accuracy or the verification rate of people records. The source panel explains this distinction.

## Authoring and reproducibility

For a supported example, edit `research/records/<example-id>.json`; its generator calls `withRemembrance` from `research/remembrance.mjs`. This helper validates and attaches the overlay and explicit event presentation metadata. New topics can supply `remembrance` directly; there is no need to add a dedicated generator or alter the engine.

Run Gate 1 and the builder; both validate the record contract, including building and bridge models. Run `node --test tests/records.test.mjs` from the skill directory. In the monorepo, `node scripts/check-remembrance.mjs <output-dir>` verifies default reading, numeric consistency, five languages at 375/768/1440, record links/focus, 3D return, a forced WebGL failure and script-disabled fallback. Existing scene and localization checks remain required. Schema checks do not independently authenticate testimony or prove native translation quality.


## New-topic contributor coverage

The default new-topic compiler sets `meta.researchProfile: "people-facts-v1"`. This profile is checked by both the builder and Gate1, including a direct low-level rebuild. Each documented contribution record may add `contributors:[{name, role:{en,ko,ja,zh,es}, sourceIds}]`; names can identify a documented collective, not only a named individual. Contributor references must also support that record. Human-readable names, actions and limits remain in the record body. Include scoped, evidenced numeric facts, keeping shared values separate from translations.

If the available evidence does not establish people or numeric values, `remembrance.research.gaps` can contain `{kind:"people"|"facts",reason:{en,ko,ja,zh,es},sourceIds,recordId}`. The referenced record's visible `unknowns` must contain that reason in each language. A gap is reported in the compiler report and at delivery; it is not a fabricated successful finding. Legacy examples are not retroactively forced into this new schema.
