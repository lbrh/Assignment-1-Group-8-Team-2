# Requirements Document
## Bushfire Severity Rubric and Acceptance Criteria

**Project name:** AI-Powered Bushfire Situational Awareness & Emergency Response
**Client:** IBM
**Client representative:** Naresh Olladapu
**Team:** Team 8 - AI for Emergency & Environmental Response - Team B
**Owner of Document:** Aryaveer Singh (BA)
**Preceding Document:** Define_Target_Users_&_Core_Requirements.md
**Sprint:** Sprint 1, Week 1

### Purpose of the Document
Made to document and define the initial bushfire severity rubric and acceptance criteria as per the approved client project proposal. It works around severity levels and their indicators. Assumptions and limitations are documented as well.

### Proposed Severity levels and their Indicators

| Level | Label | Indicators |
|---|---|---|
| 4 | Catastrophic | Very dense smoke blocking vision, large flame wall front with embers flying everywhere, extensive burnt area including vegetation and infrastructure, people in direct proximity of fire. |
| 3 | Extreme | Dense and dark smoke, Visible high flames and embers, noticeable vegetation impact, Infrastructure in the fire line. |
| 2 | High | Some flame visible, moderate smoke density, vegetation scorching, no structure at risk. |
| 1 | Moderate | No structures or vegetation at risk, no visible flame but visible haze or smoke. |

### Realism checks for Available/Projected Imagery
- Smoke density, Fire level and constructional damage can almost be made clear and distinguished using photos.
- Video would provide the fire movement and its spread, but each indicator can be judged using a single static image with a single frame.
- It is expected that there would be a varied set of image qualities and none of the indicators are indistinguishable without a high-quality photo.
- Claims cannot be backed as they have not been tested against real data or watsonx.ai model.

### Assumptions and Limitations observed
- Not aligned to an official standard.
- There is no "Unable to assess category".
- Assuming that AI can distinguish the four levels is yet to be validated.
- Severity judged by a single image yet to be tested.

### Acceptance Criteria
The acceptance criteria are based on the functional requirements in the Define_Target_Users_&_Core_Requirements.md

**1 - Users can attach images of bushfire which are geotagged and timestamped**
1. User can attach an image along with geotag (latitude/longitude) and timestamp data in a single submission.
2. Submission is rejected with a clear message if geotag or timestamp is missing.
3. A successful attachment is confirmed to the user before AI processing begins.

**2 - The submitted image gets processed by AI and gets a severity tag**
1. Every submitted image is sent to the AI service automatically, without manual triggering.
2. A severity tag is returned and correctly linked to the matching incident.
3. If tagging fails, the image is sent for manual assessment.

**3 - System makes a detailed report showing location, severity, time and status**
1. A detailed report is generated for every successfully processed incident.
2. Location, severity, time, and status appear prominently at the top of the report.
3. Report data matches exactly what's stored in the incident record.

**4 - Each incident is displayed as a legend or marker on the map**
1. Every incident with a valid location appears as a marker/legend on the map.
2. Marker/Legend position matches the incident's stored coordinates.
3. No successfully processed incident is missing from the map.

**5 - Markers distinguished by severity number and colour**
1. Each marker shows both a severity number and a matching colour per the rubric.
2. Each severity level has a visually distinct colour/number pairing from the others.
3. A user can identify severity from the map alone, without opening the marker.

**6 - Users can click a marker to view the detailed report**
1. Clicking a marker opens the correct report generated in previous function.
2. The report shown always matches the marker clicked.
3. The report opens without a noticeable delay after clicking.

**7 - Map keeps old incidents and updates with new ones on the same screen**
1. Previously shown incidents stay visible when new ones are added.
2. New incidents appear without requiring a full page reload.
3. No markers are duplicated or lost when the map updates.

**8 - Chronological operation order by severity and location**
1. Incidents are ordered based on severity (most severe first) and location (closest first).
2. The order updates automatically when a new incident is added or severity changes.
3. The order is visible to the user as a distinct list.

**9 - System explains the order it provides**
1. Each ranked incident includes a reason for its position.
2. The explanation references the actual severity indicators behind the ranking.
3. The explanation is understandable without needing to see raw AI output.

**10 - System displays unprocessable images for manual assessment**
1. Images the AI can't confidently assess are flagged rather than given a false severity tag.
2. Flagged images remain visible to the user for manual review.
3. Flagged images are clearly distinguishable from successfully tagged incidents (different status/label).

### No unsupported accuracy targets made – Confirmed
There are no unsupported accuracy targets made and all the Non functional requirement targets are kept to be consulted with the client for further clarification.

### Questions for team and client
- Q1 - Should we align ourselves to an already made standard or stay purpose built?
- Q2 - Do we need an Unable To Assess category?
- Q3 - Should proximity to people be a separate indicator?