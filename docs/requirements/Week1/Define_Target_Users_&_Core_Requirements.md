# Requirements Document
## Define Target Users & Core Requirements

**Project name:** AI-Powered Bushfire Situational Awareness & Emergency Response
**Client:** IBM
**Client representative:** Naresh Olladapu
**Team:** Team 8 - AI for Emergency & Environmental Response - Team B
**Owner of Document:** Aryaveer Singh (BA)
**Ensuing Document:** Bushfire_Severity_Rubric_and_Acceptance_Criteria.md
**Sprint:** Sprint 1, Week 1

### Purpose of the Document
The Document is made to document the users identified, user needs and the requirements according to the agreed bushfire scenario approved by the client. It is the primary handoff document to other team members which is to be used as the building block for the project.

### Users

#### 1. Primary Target Users

| | |
|---|---|
| **Who** | Emergency Incident Coordinators and Operations personnel who will monitor the bushfire activities and decide the priority of the operations. |
| **Required to** | Quickly understand the ground situation and make decisions based on the severity of the fire and its location. As it takes a lot of time to manually review all the photos and reports affecting the operation. |
| **Platform Delivers** | An interactive map of locations tagged according to their severity by AI. The users can also check the description for the reasoning behind the severity. |

#### 2. Secondary Target Users

| | |
|---|---|
| **Who** | Field Response team who are on the ground of incidence who will receive the location information for dispatch plan. |
| **Required to** | Get to know the situation they are dealing with and make efficient decisions to put off the fire as soon as possible. |
| **Platform Delivers** | Indirect - Gives the same information, as the coordinators relay the information to them. |

**Note** – As per the approved proposal there are no actual users to be involved in this project and hence both user groups will be represented via simulated users and test scenarios and same goes for the locations as well.

### Core user needs
1. Need for all the bush fire reports to be present in the same place and showing their geographical locations and not requiring opening different maps.
2. Severity should be tagged for each place of incident and made with a colour code and number so that it can be understood in a quick glance without the need to review the photos.
3. At time of multiple incidents, the system should give the users a chronological order of the locations to attend according to their severity removing the need of manual plan making.
4. Each severity tag should be able to describe itself and why it is tagged at its level, so that decisions can be justified in the future.
5. False results should not be processed - Only the images which can be assessed by the system should be presented to the users with their tags of severity and the images which are hard to assess by the AI model should be honestly presented to the user for manual assessment.
6. The ground team or the Secondary users require detailed and clear information of the incident places from the coordinators and hence the system should not present ambiguous data.

### Functional Requirements
*(MoSCoW prioritisation used)*

| # | Requirement | Priority |
|---|---|---|
| 1 | Users can attach images of bushfire which are geotagged and timestamped. | Must |
| 2 | The submitted image from the satellite or the user gets processed by AI and gets a severity tag. | Must |
| 3 | System makes a detailed report of the incident and displays key information on top like location, severity, time and status. | Must |
| 4 | Each incident is displayed as a legend or a marker on the map. | Must |
| 5 | Markers/Legends can be distinguished according to their severity level displayed by a number and colour of the tag. | Must |
| 6 | Users can click on a tag or marker to get the detailed report created by the system before. | Must |
| 7 | Map keeps the old incidents and updates new incidents and shows them on the same screen and map. | Must |
| 8 | System gives a chronological operation order for different incident places according to their severity and location. | Should |
| 9 | The System gives explanation of the order it provides for future justifications. | Should |
| 10 | The system displays images that can't be processed for manual assessment by the user. | Must |

### Non-Functional Requirements
*(MoSCoW prioritisation used)*

| # | Requirement | Priority |
|---|---|---|
| 1 | Latency – End to end latency must meet a target agreed with the client to improve efficiency. | Must |
| 2 | Accuracy – Must complete and pass the test sets as agreed with the client. | Must |
| 3 | There should be no data loss during the entirety of the operations run by the system (for e.g.- loss of data when stored) | Must |
| 4 | Load tolerance – The system should be able to tolerate a spike of inputs for different locations at the same time without breaking. | Should |
| 5 | The system should degrade in a smooth manner rather than failing immediately and silently. (for e.g. – during a crash instead of showing a blank screen show an error message so that the users get alarmed) | Should |

### Shortcomings
1. There is no access to live or real emergency dataset and integrating it with real Australian emergency services is out of scope for this project.
2. The project requires continuous access to IBM services to run.
3. Exact numbers for some non-functional requirements are still not confirmed and need client approval.

### Field types

| Field | Type |
|---|---|
| Image ref | PNG, JPEG, URL |
| Incident ID | String |
| Latitude/Longitude | Decimal |
| Timestamp | DateTime |
| Severity Level | Integer |
| Status | String |
| Priority | Integer |

**Note** – This document is to be refined in the upcoming weeks