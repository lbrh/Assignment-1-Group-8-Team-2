# Sprint 2 Implementation Requirements and Acceptance Criteria

**Owner:** Aryaveer Singh (BA)
**Project name:** AI Powered Bushfire Situational Awareness & Emergency Response
**Client:** IBM
**Client representative:** Naresh Olladapu
**Team:** Team 8

**Previous Documents:**

- [Define_Target_Users_&_Core_Requirements.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Week1/Define_Target_Users_%26_Core_Requirements.md)
- [Bushfire_Severity_Rubric_and_Acceptance_Criteria.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Week1/Bushfire_Severity_Rubric_and_Acceptance_Criteria.md)
- [Refine User Stories, Requirements & Traceability.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/requirements_Week2/Refine%20User%20Stories%2C%20Requirements%20%26%20Traceability.md)
- [Sprint1_AI_Req_Acceptance_Criteria.md](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Sprint1Final/Sprint1_AI_Req_Acceptance_Criteria.md)

**Sprint:** Sprint 2, Week 1

---

## Purpose

Converts Sprint 1 requirements and playback feedback into implementation ready Sprint 2 requirements and measurable acceptance criteria. Confirms the behaviour required for AI classification, confidence routing, Manual Review, severity scoring, metadata, and incident lifecycle, and documents the remaining BA decisions resolved with UX and Development this sprint.

---

## 1. Fire Status Lifecycle

### 1.1 Purpose

This document defines the incident status lifecycle, covering how an incident moves between Fire, Non-Fire, and Uncertain, and how an extinguished fire is handled. This was not covered as a standalone lifecycle in prior documents. It reuses the dismiss and Manual Review behaviour already in the [Sprint 1 final requirements document](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Sprint1Final/Sprint1_AI_Req_Acceptance_Criteria.md).

### 1.2 Status Definitions

| Status | Meaning |
|---|---|
| **Fire** | Active fire confirmed by AI classification or by a reviewer. Shown as an active incident on the map, in the dispatch order. |
| **Non-Fire** | Confirmed as not a fire, at intake or on review. Moves to Archive, does not show up on the active map and dispatch order, retained for audit and reopenable if reviewed again. |
| **Uncertain** | Confidence below 0.75, at either the fire/non-fire gate or the severity assignment stage. Flagged for Manual Review and not shown as confirmed until reviewed. |
| **Extinguished** | A previously active Fire incident confirmed as extinguished by the crew. Moves to Resolved and does not show up on active map and dispatch order but can be reopened if a later image shows re-ignition of the fire. Different from non-fire, since it was a real fire, not a false positive. |

### 1.3 Lifecycle

Every new submission is first run through the Fire / Non-Fire gate, which returns a gate confidence. If that confidence is below 0.75, the incident is marked Uncertain and sent to Manual Review, regardless of which way the gate leaned. If gate confidence is 0.75 or higher and the result is non-fire, then the incident moves straight to Archive. If gate confidence is 0.75 or higher and the result is Fire, severity scoring runs next, with its own confidence figure, also checked against the 0.75 threshold, if that's low the incident still drops into Uncertain and Manual Review rather than going for a severity level.

An incident sitting in Manual Review is shown to a reviewer along with its provisional tag, confidence figure, and the reason it was flagged. The reviewer confirms it as Fire, non-fire, or discards it which moves it into Archive.

A confirmed Fire incident stays active, in the dispatch order and on the map, until the crew reports it out. At that point it becomes Extinguished and moves into Resolved, dropping off the dispatch order and the active map. If a later image shows re-ignition at the same location, it moves back to Fire and re-enters the dispatch order.

Resolved and Archive are kept as two separate lists. Archive only holds non-fire results, at intake or from Manual Review. Resolved only holds incidents that were a real, confirmed fire at some point. Nothing in either list is deleted, both stay retrievable for audit.

### 1.5 Acceptance Criteria

| # | Criteria |
|---|---|
| 1 | Every new submission resolves to Fire, Non-Fire, or Uncertain at the gate stage, never left unclassified. |
| 2 | Uncertain incidents are visually distinguishable from confirmed Fire or Non-Fire incidents and are never shown as confirmed until reviewed. |
| 3 | A Fire incident with the crew reporting it out moves to Extinguished and Resolved and is removed from the active map and dispatch order. |
| 4 | An Extinguished incident can be reopened back to Fire if a later image shows re-ignition. |
| 5 | The full history of an incident, including its time as an active Fire, remains retrievable after it moves to Resolved or Archive. |
| 6 | No incident is deleted outright. Resolved and Archived records are both retained for audit. |

### 1.6 Confidence Definition

There was a mix-up on this. Two separate confidence figures were meant to exist: **gate confidence** for the fire/non-fire call, and **severity confidence** for the assigned severity level once classified Fire. This confusion was taken care of.

Going forward, both exist, the 0.75 threshold applies to both, low confidence at either stage routes to Manual Review. We can keep gate confidence as a backend only value for now and only show severity confidence to users. This whole confidence setup is provisional, the two-figure split, the 0.75 threshold, and what's shown to users, all untested against real data or the Watson model, subject to change in a future sprint.

---

## 2. Close remaining pending confirmation items from Sprint 1

Resolved in the [final doc](https://github.com/lbrh/Assignment-1-Group-8-Team-2/blob/main/docs/Requirement_Sprint1Final/Sprint1_AI_Req_Acceptance_Criteria.md):

- **AI response confirmed.** Severity tag, confidence score, explanation/justification, and status flag (Processed, Flagged for Manual Review, Dismissed) are all defined (Section 2 of the final doc).
- **NFR1/NFR2 targets confirmed.** Latency 2 minutes or less, precision 0.80 or higher, recall 0.75 or higher (Section 15 of the final doc).
- **Confidence threshold:** confirmed at 0.75 but explicitly flagged as team proposed and untested against real data or the Watson model (Section 6 and Section 14).
- **Metadata storage** (database vs flat JSON) confirmed with Liam last week (Section 13 of the final doc).

---

## 3. Convert relevant requirements into developer ready acceptance criteria

The final doc already contains developer ready acceptance criteria and traceability (Sections 1, 2, and 15). The main task here is making sure nothing from Sections 4 to 11 of the final doc (fire/non-fire behaviour, confidence handling, Manual Review, severity scoring, override) is missing from that Section 15 traceability table.

---

## 4. Acceptance criteria, image to AI analysis to result workflow

Based on Sections 1, 2, and 4 of the final docs:

| Step | Acceptance Criteria |
|---|---|
| **Submission** | Image accepted from any of the four input methods (manual, drone, satellite, bulk/API). Rejected with a clear message if geotag or timestamp is missing. No minimum resolution enforced. |
| **Fire/non-fire classification** | Every image classified Fire or Non-Fire before severity scoring starts. Non-Fire with enough justification is dismissed and never shown as an active incident. |
| **Severity scoring** | If classified Fire, a severity level from 1 (Moderate) to 4 (Catastrophic) is returned, based on the four-element rubric in Section 10 (smoke, flame, damage, people proximity). |
| **Result delivery** | Confidence score (0 to 1), explanation/justification, and a status flag (Processed, Flagged for Manual Review, Dismissed) are returned with every result. |

---

## 5. Acceptance criteria, confidence, severity, and Manual Review behaviour

Based on Sections 5 to 8 of the final doc:

| Behaviour | Acceptance Criteria |
|---|---|
| **Confidence routing** | Below 0.75 confidence at either the fire/non-fire gate or the severity stage routes to Manual Review, not shown as confirmed. At or above 0.75 at both stages shows as a confirmed result. Two confidence figures exist, gate confidence and severity confidence, gate confidence stays back end for now and only severity confidence is shown to users. This whole confidence setup is provisional, the two figure split, the 0.75 threshold, and what's shown to users, all untested against real data or the Watson model, subject to change in a future sprint. |
| **Boundary case** | A score exactly at 0.75 defaults to Manual Review, per the edge case rule in Section 14. |
| **Manual Review** | Reviewer sees the image, the AI's severity tag, the confidence score, and the reason for flagging. Reviewer can confirm the tag, change the severity and make it an incident, or discard it as Not a Fire. |
| **Dismiss behaviour** | If confirmed as a non-fire then it is removed from active incidents and the map, but stored for audit and is retrievable. |
| **Override** | Override is immediate, no confirmation clicks. Undo is available. A non-blocking confirmation pop-up shows top right for about 5 seconds. Every override is logged with the original tag, new value, and who made the change. |

---

## 6. Expected behaviour, AI failures, invalid outputs, poor quality images

Based on Sections 1 and 14 of the final docs:

| Scenario | Expected Behaviour |
|---|---|
| **Poor quality image** | No minimum resolution required. Low-quality images are not rejected; they are passed through Manual Review rather than getting a confident tag. |
| **Corrupted or unreadable file** | Treated the same as a missing geotag case, rejected with a clear message. |
| **Low confidence Fire/Non-Fire classification itself** | If the classification step itself is low confidence, the image goes to Manual Review before severity scoring even happens. |
| **Duplicate submission** | Must not create a duplicate map marker. Handled through the incident grouping logic. |
| **Conflicting severity on resubmission** | Handled by incident grouping/update logic, not treated as a new incident. Displayed severity reflects the most recent or most severe image, full image history stays available. |

---

## 7. BA test scenarios, Fire, Non-Fire, Extinguished, Uncertain

Matches the confirmed dataset labels in Section 3 of the final doc.

| Category | Test scenarios to include |
|---|---|
| **Fire** | Varying severity across the 1 to 4 scale, varying smoke, flame, damage, and people proximity combinations per the Section 10 rubric |
| **Non-Fire** | Smoke-like haze with no fire, unrelated red or orange objects, cases likely to produce false positives |
| **Extinguished** | Burnt out area with no active flame or smoke |
| **Uncertain** | Confidence expected to land below 0.75, poor lighting, partial obstruction, distant or small fire signs |

---

## 8. Validate NFR1 and NFR2

**Status: not yet actionable.** Implementation isn't testable yet, so neither of these has real numbers behind it. The steps below are the plan to run once it is, not a completed validation.

### NFR1: latency 2 minutes or less

Once implementation is testable:

- Time from image submission to severity tag returned, across a small batch of test images.
- Record pass or fail per image against the 2 minute target.
- If consistently failing, log as a blocker for Dev, not something BA resolves alone. Note the target itself is still flagged as untested and subject to client review (Section 14).

### NFR2: precision 0.80 or higher, recall 0.75 or higher

Once sufficient test results are available:

- Run the labelled test set from Section 7 through the model.
- Precision equals correct Fire classifications divided by all images classified Fire.
- Recall equals correct Fire classifications divided by all actual Fire images in the set.
- Compare against target, log as a blocker if below rather than lowering the bar quietly.

---

## 9. Log requirement changes and update traceability

- Any deviation found above gets added to the traceability table with a date, not silently edited into the original doc.
- Requirement changes logged this sprint:

| Date | Change | Reason | Raised with |
|---|---|---|---|
| Week 1, Sprint 2 | Confidence formalised as two separate figures, gate confidence and severity confidence, instead of the single confidence score in Section 5 of the final doc. Gate confidence stays backend only for now, only severity confidence is shown to users. | Section 5 only ever formalised one confidence score, but Section 4 already implied a separate gate-stage confidence. The gap caused confusion between Liam and Benjamin over what the displayed confidence figure actually measures. | Liam, Benjamin |
| Week 1, Sprint 2 | Extinguished and Resolved formalised as a distinct end state, separate from Non-Fire/Archive. Extinguished incidents are reopenable if a later image shows re-ignition. | No lifecycle for this existed in any prior doc. Confirmed against the UX wireframe prototype, which already treats these as two separate lists (Resolved vs Archive). | Benjamin |