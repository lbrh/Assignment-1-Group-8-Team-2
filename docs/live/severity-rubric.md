# Severity Rubric

**Status:** Live. This is the source of truth for how severity is scored. The code implements it in `backend/src/pipeline/assess-severity.ts`, and the labelling pipeline in `label_schema.json`.
**Owner:** Aryaveer Singh (BA), with Liam Robinson Hounsell (Dev 2)
**Last updated:** 2026-09-24
**Supersedes:** section 10 of [Sprint 1 final requirements](../archive/sprint-1/requirements/final/Sprint1_AI_Req_Acceptance_Criteria.md) and the [Week 1 rubric](../archive/sprint-1/requirements/week-1/Bushfire_Severity_Rubric_and_Acceptance_Criteria.md)

> **Pending BA sign-off:** the 2026-09-24 changes below (people proximity dropped, vegetation and infrastructure redefined, vegetation gated on smoke/flame) were decided by the dev team while building the models. See [decision log](../decisions/decision-log.md) D-17 to D-19.

---

## 1. The four indicators

Each image is rated on four indicators, 1 to 4 each. The labels in `code` are the exact values the models output and the database stores.

| Rating | Smoke density | Flame visibility | Vegetation | Infrastructure |
|---|---|---|---|---|
| **1** | `none_or_haze`: light haze, minimal smoke | `no_visible_flame` | `no_vegetation`: none in frame | `no_infrastructure`: wilderness, nothing man-made |
| **2** | `moderate`: some visibility reduction | `some_flame` | `sparse_vegetation` | `sparse_infrastructure`: a road, fence, power line or a few isolated buildings |
| **3** | `dense_dark`: dense, dark smoke | `visible_high_flames_and_embers` | `moderate_vegetation` | `moderate_infrastructure`: rural settlement, farm, scattered houses |
| **4** | `very_dense_blocking_vision` | `large_flame_wall_embers_everywhere` | `dense_vegetation`: dense bush/forest | `dense_infrastructure`: town, suburb or city |

What each indicator measures:

- **Smoke density** and **flame visibility** measure the fire itself.
- **Vegetation** measures how much vegetation (fuel) is in the scene. Whether it is burning, burnt or untouched does not change the rating.
- **Infrastructure** measures how much man-made infrastructure is in or near the scene: buildings, roads, vehicles, car parks, power lines, fences. Whether it is burning does not change the rating. Its purpose is priority: a fire next to a town outranks the same fire in the middle of nowhere.

## 2. Overall severity

```
fire_present   = smoke > 1  OR  flame > 1
vegetation_pts = fire_present ? vegetation : 0
total          = smoke + flame + vegetation_pts + infrastructure        (range 3 to 16)
```

Vegetation only counts when there is a fire to burn it. A green hillside with no smoke or flame is not a hazard.

| Total | Severity | Label |
|---|---|---|
| 3 to 7 | 1 | Moderate |
| 8 to 10 | 2 | High |
| 11 to 13 | 3 | Extreme |
| 14 to 16 | 4 | Catastrophic |

### Worked examples

| Scene | Smoke | Flame | Veg (counted) | Infra | Total | Severity |
|---|---|---|---|---|---|---|
| Car park below a green hill, no fire | 1 | 1 | 4 → **0** | 2 | 4 | 1 Moderate |
| Moderate smoke over dense bush near a road | 2 | 1 | 4 | 2 | 9 | 2 High |
| Big forest fire, no infrastructure | 4 | 3 | 4 | 1 | 12 | 3 Extreme |
| Big fire in dense bush on a town edge | 4 | 3 | 4 | 4 | 15 | 4 Catastrophic |

## 3. Confidence and review routing

- Each indicator model returns a confidence (softmax probability of its top class).
- `confidence_score` = the **lowest** of the four. The weakest indicator decides whether a human looks at it, and the explanation names which one.
- `confidence_score` **≤ 0.75** → `assessment_status = unable_to_assess` (manual review). A score exactly at 0.75 goes to review.
- Above 0.75 → `assessed`.
- The 0.75 threshold is team-proposed and untested against real data (see [requirements](requirements.md) §6).

## 4. Explanation

`severity_explanation` names the indicator(s) with the highest counted rating, for example:

> Severity 3, driven by smoke at level 4 and vegetation at level 4.

If routed for review, the reason is appended:

> … Routed for manual review — lowest confidence on flameVisibility (0.48).

## 5. Classification label (fire gate)

The requirements call for a fire / non-fire gate before scoring ([requirements](requirements.md) §3). **No gate model exists yet.** Until it does, every uploaded image is scored with `classification_label = fire`. The vegetation gating above keeps no-fire images at severity 1, but they are still shown as fires. See [decision log](../decisions/decision-log.md) D-22 and the gate accuracy proposal D-25.

## 6. Change history

| Date | Change | Why |
|---|---|---|
| Sprint 1 W1 | Single-sentence rubric per level (4 levels). | Initial client-approved proposal. |
| Sprint 1 W2 | Decomposed into four indicators rated 1–4 (smoke, flame, vegetation impact, structure/people proximity). | Needed gradable labels for per-indicator models. |
| Sprint 1 final | Fourth element redefined as **people proximity**; damage/impact holds vegetation + infrastructure damage. Total 4–16. | BA final requirements §10. |
| 2026-09-24 | People proximity **dropped**. No usable training signal: ~85% of images show no people, and the level "evacuation required" never appeared in 32k labelled images. | Dev team, while building models. |
| 2026-09-24 | **Vegetation** redefined as amount of vegetation (fuel), burning or not. | Amount is visible in a single image and relevant to spread; damage was ambiguous and mislabelled (a green hill was labelled "extensive burnt area"). |
| 2026-09-24 | **Infrastructure** added as the fourth indicator: amount of infrastructure nearby, burning or not. | Priority: fires near towns outrank fires in wilderness. |
| 2026-09-24 | Vegetation only counts when smoke or flame > 1. Total range 3–16. | Stops a no-fire photo of dense bush scoring as High. |
