# Dataset Classes and Labels: Proposal for Aryaveer to Confirm

**Status:** DRAFT, needs Aryaveer's sign off before dataset labelling starts
**Owner of this draft:** Liam Robinson Hounsell (Dev 2)
**Depends on:** Bushfire_Severity_Rubric_and_Acceptance_Criteria.md (Aryaveer, owner), AI_Framework_and_Technical_Approach.md

### Why this needs Aryaveer's confirmation

The recommended technical approach (see AI_Framework_and_Technical_Approach.md) derives the four level severity from four indicator dimensions rather than predicting severity directly. Those four dimensions come straight out of her rubric table, but the rubric table describes them in prose, not as a label set a model or a human labeller can tick against consistently. This document turns the rubric into a proposed label set and checks it against what the two selected source datasets (FlameVision, D-Fire) can and cannot already provide, so labelling effort is spent only where it is actually needed.

### Proposed indicator label set, derived from the rubric table

**How I actually derived this, stated plainly:** the rubric table does not have a separate column per indicator. It has three columns, `Level`, `Label`, and `Indicators`, and `Indicators` is a single free-text sentence per level covering all four dimensions at once. For example, the level 4 cell reads in full: "Very dense smoke blocking vision, large flame wall front with embers flying everywhere, extensive burnt area including vegetation and infrastructure, people in direct proximity of fire." The four-row breakdown below is my own decomposition of that sentence into four independently gradable dimensions, it is not a literal lift from four pre-existing rubric columns. Each label maps cleanly onto its own clause in the source sentence for levels 1 to 3. Level 4 is the exception: it uses one shared clause ("extensive burnt area including vegetation and infrastructure") to justify both the `vegetation_impact` and `structure_people_proximity` labels, which is a bigger interpretive step than the other three levels. Aryaveer should read this table as my proposed interpretation of her rubric to confirm, not as something already split out in her original document.

| Indicator                    | Proposed labels                                                                                                                      | Rubric source (verbatim clause per level)                                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `smoke_density`              | `none_or_haze`, `moderate`, `dense_dark`, `very_dense_blocking_vision`                                                               | "visible haze or smoke" (1) / "moderate smoke density" (2) / "Dense and dark smoke" (3) / "Very dense smoke blocking vision" (4)                                                                                                                   |
| `flame_visibility`           | `no_visible_flame`, `some_flame`, `visible_high_flames_and_embers`, `large_flame_wall_embers_everywhere`                             | "no visible flame" (1) / "Some flame visible" (2) / "Visible high flames and embers" (3) / "large flame wall front with embers flying everywhere" (4)                                                                                              |
| `vegetation_impact`          | `none_at_risk`, `scorching`, `noticeable_impact`, `extensive_burnt_area`                                                             | "no...vegetation at risk" (1) / "vegetation scorching" (2) / "noticeable vegetation impact" (3) / "extensive burnt area including vegetation and infrastructure" (4, clause shared with `structure_people_proximity` below)                        |
| `structure_people_proximity` | `no_structure_at_risk`, `no_structure_at_risk`, `infrastructure_in_fire_line`, `extensive_infrastructure_damage_people_in_proximity` | "No structures...at risk" (1) / "no structure at risk" (2) / "Infrastructure in the fire line" (3) / "extensive burnt area including...infrastructure" plus "people in direct proximity of fire" (4, clause shared with `vegetation_impact` above) |

Each dimension is proposed as an ordinal 4 point scale, matching the four severity levels, so the rule engine can read a severity level straight off the rubric table once all four indicators are set.

Two things I want to flag back to Aryaveer rather than paper over:

1. The `structure_people_proximity` fragment reads identically for Moderate and High ("no structure(s)...at risk" in both), a genuine gap in the rubric wording. Level 1's full sentence also separately asserts "no vegetation at risk," which level 2's sentence does not restate, so the two levels are not a clean minimal pair overall, only on the structure fragment specifically.
2. At level 4, one shared clause is doing double duty for two different indicator dimensions (`vegetation_impact` and `structure_people_proximity`). That is a bigger interpretive stretch than levels 1 to 3, where each indicator has its own distinct clause, and I want Aryaveer's explicit sign-off rather than assuming the split is uncontroversial.

### What FlameVision and D-Fire already give us

| Dataset                                               | What it actually labels                                            | Usable directly for                                                                                                                         | Not covered                                                                                                               |
| ----------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| FlameVision (aerial, ~8,600 images)                   | Binary: fire present / non-fire                                    | A starting point for `flame_visibility`, collapsed to just two of the four proposed levels (`no_visible_flame` vs "some flame present")     | Smoke density, vegetation impact, structure/people proximity, and the finer flame gradations (some vs high vs wall front) |
| D-Fire (ground level, ~21,000 images, bounding boxes) | Fire / smoke / both / none, with bounding boxes for fire and smoke | A starting point for both `flame_visibility` and `smoke_density`, and box area/count could approximate density or extent as a labelling aid | Vegetation impact, structure/people proximity, and again the finer within class gradations the rubric asks for            |

Neither dataset provides the four level ordinal grading the rubric needs, and neither touches vegetation impact or structure/people proximity at all. This matches the earlier team finding that no public dataset ships a pre labelled four level severity taxonomy. The proposal below is about minimising, not eliminating, the manual labelling load.

### Proposed labelling plan for Aryaveer to confirm or amend

1. Use D-Fire's existing fire and smoke bounding boxes as a first pass filter and pre fill suggestion for `flame_visibility` and `smoke_density` (present versus absent, with box coverage as a rough density hint), then have a human labeller confirm or correct the ordinal grade against the rubric wording.
2. Use FlameVision similarly as a secondary source for `flame_visibility`, since it is aerial rather than ground level, useful for the satellite/drone source type specifically.
3. `vegetation_impact` and `structure_people_proximity` need manual labelling from scratch on the stratified subset, since no source dataset covers them.
4. Stratify the manual labelling subset across all four target severity levels so the resulting training and test set is not skewed toward whatever proportion of "obvious fire" images the source datasets happen to contain (D-Fire and FlameVision are fire detection datasets, not severity datasets, so they likely skew toward clearer, more obvious fire scenes than the ambiguous middle of the rubric).

### Specific questions for Aryaveer

1. Confirm the four proposed labels per indicator match her intent for each rubric cell, including exact wording, since the rule engine will use these labels verbatim in the `severity_explanation` output.
2. Confirm whether the `structure_people_proximity` Moderate/High overlap noted above is intentional or should be refined.
3. Confirm whether images with visible smoke but no visible flame (a state D-Fire calls "only smoke") should default to a specific severity floor, or be assessed purely indicator by indicator as with any other image.
4. Sign off on which images can be reused from FlameVision/D-Fire versus need to be gathered fresh for `vegetation_impact` and `structure_people_proximity` coverage.
5. Confirm that decomposing her single `Indicators` sentence into four independently gradable dimensions captures her intent, particularly for level 4, where one clause is being used to derive two separate labels (`vegetation_impact` and `structure_people_proximity`).

Sources:

- [D-Fire dataset (GitHub)](https://github.com/gaia-solutions-on-demand/DFireDataset)
- [FlameVision dataset (Mendeley Data)](https://data.mendeley.com/datasets/fgvscdjsmt/4)
- [FlameVision dataset (Kaggle)](https://www.kaggle.com/datasets/warcoder/flamevision-dataset-for-wildfire-classification)
