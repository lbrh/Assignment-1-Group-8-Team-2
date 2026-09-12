# Final Sprint 1 AI Requirements, Acceptance Criteria & Traceability

**Project name:** AI Powered Bushfire Situational Awareness & Emergency Response
**Client:** IBM
**Client representative:** Naresh Olladapu
**Team:** Team 8
**Owner of Document:** Aryaveer Singh (BA)
**Previous Documents:**
- [Define_Target_Users_&_Core_Requirements.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Week1/Bushfire_Severity_Rubric_and_Acceptance_Criteria.md)
- [Bushfire_Severity_Rubric_and_Acceptance_Criteria.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Week1/Bushfire_Severity_Rubric_and_Acceptance_Criteria.md)
- [Refine User Stories, Requirements & Traceability.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/requirements_Week2/Refine%20User%20Stories%2C%20Requirements%20%26%20Traceability.md)

**Sprint:** Sprint 1, Final Document

---

## Purpose of the Document

In this document we finalise the Sprint 1 Requirements, Acceptance Criteria and Traceability. We define and map out the required AI inputs and outputs, dataset and classification requirements, severity matrix, Manual Review requirements, and acceptance criteria, and link each requirement to UX and IBM Cloud/Watson technical implementation so the next roles can build against it directly.

---

## 1. AI Input Requirements

| # | Requirement | Detail |
| --- | --- | --- |
| 1 | Accepted input methods | Manual upload, drone/aerial feed, satellite feed, bulk/API submission. All channels must converge into one single ingestion pipeline. |
| 2 | Metadata of images | Geotagged (lat/long), timestamp, image type (PNG/JPEG/URL). Submission is rejected with a clear message if geotag or timestamp is missing. |
| 3 | Image quality | No minimum resolution is required as of Sprint 1, all image qualities are accepted, low-quality images are passed through manual review rather than getting rejected. |

---

## 2. AI Output Requirements

| # | Requirement | Detail |
| --- | --- | --- |
| 1 | Fire/non-fire classification | Every image first receives a fire/non-fire classification before severity scoring is started. |
| 2 | Severity tag | If classified as fire, the AI returns a severity level from Moderate being 1 to Catastrophic being 4. |
| 3 | Confidence score | Every processed image returns a confidence score (0 to 1). |
| 4 | Explanation and Justification | Each severity tag includes a short explanation and justification giving the indicators behind the decision taken by AI so it can be understood without seeing raw output. |
| 5 | Status flag | Each image is returned with one of the following status flags - Processed, Flagged for Manual Review, or Dismissed (Not a Fire). |

---

## 3. Dataset Classes and Labels

Confirmed with Liam: label set used for classification is **Fire, Non-Fire, Extinguished, Uncertain**. Severity levels (1 to 4) are applied to images labelled Fire and uncertain images are also given a tentative severity tag but are not shown as confirmed until a reviewer confirms or changes it. Extinguished covers images where a fire has already been put out.

---

## 4. Fire/Non-Fire Classification Behaviour

- Every image is classified as Fire or Non-Fire before severity scoring occurs by the AI.
- If the image is classified as non-fire and has enough justification, then it is dismissed and not shown as an incident on the map.
- If the fire/non-fire classification itself is low-confidence and does not have enough justification, then the image is sent for Manual Review.

---

## 5. Confidence Score Requirements

- Confidence score ranges from 0 to 1 and is returned for every processed image.
- The confidence score directs high confidence results as confirmed tags; low confidence results are routed to Manual Review.
- Confidence score is never hidden from the user and is always shown alongside the severity tag.

---

## 6. Confidence-Threshold Wording

Any image with a confidence score below **0.75** is automatically sent for Manual Review and is not shown as a confirmed result until human confirmation.

This threshold is a team proposed starting point and has not been tested against real data or the Watson model (will be revisited during real testing).

---

## 7. Uncertain-Result Behaviour

- Images below the 0.75 confidence score are flagged and sent for Manual Review.
- Until approved by Manual Review these are never shown as an incident on map.
- Flagged images are given a different tag and are clearly distinguishable from confirmed incidents.

---

## 8. Manual Review Requirements

The reviewer can see:
- The image
- The AI's given severity tag
- The confidence score
- The reason for flagging

A reviewer can then either:
- Confirm the AI's tag
- Change the severity level and then make it an incident
- Discard the image and put it as Not a Fire

---

## 9. Dismiss/Not-a-Fire Behaviour

- When an image is confirmed as Not a Fire, it is removed from active incidents and does not appear on the map (by AI or manual review).
- The dismissed photos are stored for audit purposes and remains retrievable but is not part of the active incident view on the map.

---

## 10. Final Severity Requirements

Each element is now rated individually on a 1 to 4 scale, and the overall severity level is derived from the total of the element scores.

**Elements rated 1 to 4:**

| Rating | Smoke Level | Flame Visibility | Damage / Impact | People Proximity |
| --- | --- | --- | --- | --- |
| 1 | Light haze, minimal smoke | No visible flame | No vegetation or structures at risk | No people visible in range of fire |
| 2 | Moderate smoke, some visibility reduction | Some flame visible | Vegetation scorching, no structures at risk | People visible at a distance but not near the fire |
| 3 | Dense, dark smoke | Visible high flames with embers | Noticeable vegetation impact, infrastructure in the fire line | People near the fire and their evacuation is req. |
| 4 | Very dense smoke, blocking vision | Large flame wall front, embers flying everywhere | Extensive burnt area, including vegetation and infrastructure | People in direct proximity, require immediate help |

**Overall severity:** the three element scores are summed (total range 4 to 16), and the total maps to an overall severity level as follows:

| Total Score | Overall Score | Label |
| --- | --- | --- |
| 4 to 7 | 1 | Moderate |
| 8 to 10 | 2 | High |
| 11 to 13 | 3 | Extreme |
| 14 to 16 | 4 | Catastrophic |

Example: Smoke = 4, Flame = 4, Damage = 3, People proximity = 3, total = 14, overall severity is 4, Catastrophic.

---

## 11. Severity Override, Aligned with UX

- A user can override an AI assigned severity level immediately, with no confirmation click required, to optimise for speed in emergency use.
- An undo button is provided so a mistaken override can be reversed without disrupting workflow.
- After an override, a non-blocking pop-up appears (top right of screen, for approximately 5 seconds) confirming that the override took place, to inform the user without stopping their next action.
- This approach was agreed with UX (Benjamin) in place of a click-to-confirm step, since a confirmation click was found to slow coordinators down without adding real error protection, the undo button covers that need instead.
- Every override is still logged with the original AI tag, the new value, and who made the change.

---

## 12. Incident Grouping Requirements, Finalised

Hybrid model, the system auto-groups images likely to belong to the same incident based on proximity and timeframe, and a coordinator confirms or splits the grouping.

---

## 13. Metadata Requirements, Confirmed with Developers

- All metadata is stored in a database, no flat JSON. The map and related features already depend on the database, so splitting metadata into JSON alongside it will create a single point of failure if the database goes down.
- Required fields: incident ID, coordinates, timestamp, severity level, confidence score, classification label (Fire, Non-Fire, Extinguished, Uncertain), status, priority, image source/input channel, incident group ID, and override history (original tag, new value, who changed it, timestamp).

---

## 14. Assumptions and Important Edge Cases

- Duplicate submissions of the same incident are expected and must not create duplicate map markers.
- Conflicting severity on resubmission (a later image of the same incident gets a different severity) is handled by the incident grouping/update logic, not treated as a new incident.
- Confidence scores near the 0.75 threshold boundary are treated as low confidence by default (round down to Manual Review).
- The system must tolerate a load spike of multiple simultaneous submissions without breaking.
- Secondary users (Field Response) receive information indirectly through coordinators; the system must avoid presenting them with ambiguous or stale status.
- No access to a real emergency dataset; users and locations are simulated for Sprint 1, and this is a documented limitation rather than something resolved within scope.
- Accuracy and latency targets (NFR1, NFR2) are team-proposed, not yet tested against real data or the Watson model and are subject to client review.

> **Note:** This document references requirement numbers from prior documents. FR1 to FR16 and NFR1/NFR2 refer to the functional and non-functional requirements defined in [Define_Target_Users_&_Core_Requirements.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Week1/Bushfire_Severity_Rubric_and_Acceptance_Criteria.md) and [Requirements & Traceability.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/requirements_Week2/Refine%20User%20Stories%2C%20Requirements%20%26%20Traceability.md).
>
> New requirements were added in this document which were not mentioned in the previous weeks docs, they are referenced from section 1 and 2 of this document.

---

## 15. Acceptance Criteria and Requirements Traceability

| Pain Point | Requirement | Feature | Success Criteria |
| --- | --- | --- | --- |
| Information overload, tunnel vision risk | FR3, FR6, FR8 | Auto sorted report and prioritised list | Top priority incident identifiable without manual scanning |
| Automated rankings not trusted in hard cases | FR9, FR14 | Explainable ranking and immediate override with undo | Reason shown on click, override reversible via undo, no confirmation delay |
| Too many similar alerts, users stop noticing important ones | FR5, FR16 | Distinct severity colour and size scale | Severity identifiable from map alone in usability testing |
| Map clutter under pressure | FR4, FR15 | Marker clustering, zoom-based expansion | 0 overlapping markers at default zoom |
| AI confidence hidden or overblown | FR10, FR13, AIoutput3, Section 6/7 | Confidence score, threshold routing, review queue | Under threshold images are auto sent for manual review, low confidence cases caught |
| Systems don't talk to each other | FR1, FR11, AIinput1 | Multiple ingestion channels, one pipeline | 3 or more input channels processed without manual reformatting |
| False positives shown as confirmed fires | AIoutput1, Section 4, Section 9 | Fire/non-fire classification before severity scoring | None of the non-fire/dismissed images appears as an active incident |
| Uncertain AI results treated as confirmed | Section 6, Section 7, Section 8 | Confidence threshold, manual review queue | No incident below 0.75 confidence is shown as confirmed without manual review |

### Success Criteria (Latency & Accuracy)

| Requirement | Metric | Target | Justification |
| --- | --- | --- | --- |
| NFR1: Latency | Time from image submission to severity tag returned | 2 minutes or less per image | Scaled down from Rolling Fork case study benchmark; commercial single-image APIs respond well under a minute |
| NFR2: Accuracy | AI severity classification vs. labelled test set (precision/recall) | Precision 0.80 or higher, recall 0.75 or higher | Set slightly below Rolling Fork's 0.86/0.80 to account for smaller, simulated dataset and unvalidated rubric |
| Confidence honesty | Percent of low confidence images correctly routed to manual review | 100% | Required so no uncertain result is ever shown as confirmed |
| Override | Time from click to severity change applied | Immediate, no confirmation clicks, undo available | Required for coordinator speed in emergencies, undo covers error recovery without slowing the initial action |
| Map clarity | Overlapping markers visible at default zoom | Zero | Required to reduce map clutter under pressure |