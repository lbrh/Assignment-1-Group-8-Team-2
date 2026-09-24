> **Archived 2026-09-24.** Historical record, kept as written. Current version: [AI models and dataset](../../../live/ai-models-and-dataset.md). Why things changed: [decision log](../../../decisions/decision-log.md).

# AI Framework and Technical Approach

**Project name:** AI-Powered Bushfire Situational Awareness & Emergency Response
**Client:** IBM
**Client representative:** Naresh Olladapu
**Team:** Team 8 - AI for Emergency & Environmental Response - Team B
**Owner of Document:** Liam Robinson Hounsell (Dev 2), drafted for team review
**Related Documents:** Bushfire_Severity_Rubric_and_Acceptance_Criteria.md, docs/Storage and metadata V2.md, docs/requirements_Week2/Refine User Stories, Requirements & Traceability.md, docs/watsonx-Setup-Verification.md
**Sprint:** Sprint 1, Week 1-2
**Status:** DRAFT, not yet reviewed by team or committed

### Purpose

Identifies candidate AI frameworks and technical approaches for the hazard/severity classification stage, compares them against IBM Cloud/watsonx compatibility, and recommends a final approach with justification. This satisfies the Sprint 1 checklist items covering framework identification, IBM Cloud/Watson compatibility comparison, final selection and justification, and documentation of the decision.

### Constraints already set by prior team decisions

- The success criteria require the system to say why a location ranked first, and the acceptance criteria (rubric doc) require a hard explainability requirement. The team's existing architecture decision already commits to decomposing each image into boolean/categorical indicator flags before deriving a severity level, rather than a single opaque end to end classification. Every candidate below is evaluated against that constraint, not just raw accuracy.
- The Week 2 refined requirements doc has already set concrete targets the classification component needs to hit: precision of 0.80 or higher and recall of 0.75 or higher against a labelled test set (NFR2), and a numeric confidence score returned alongside every severity tag, with anything below an agreed confidence threshold routed to manual review instead of being auto tagged (US2, FR13, target 100 percent of low confidence images correctly routed). Any candidate approach needs to produce that confidence score, not just a label.
- Htet (Dev 1) has already provisioned and verified a watsonx.ai environment: a watsonx.ai Studio project, a watsonx.ai Runtime (Watson Machine Learning) instance, and a linked deployment space, all in the `ca-tor` region, confirmed working via `ibmcloud resource service-instances` on 2026-09-06 (see watsonx-Setup-Verification.md). This is a real, working IBM Cloud asset already available to deploy into, not a hypothetical, and changes the deployment story below.

## Candidate approaches

### 1. watsonx.ai Granite Vision (prompt based, zero or few shot)

Use IBM's own Granite Vision multimodal model through the watsonx.ai Prompt Lab, prompted to describe smoke density, flame visibility, vegetation impact and structure proximity from an image, with the four level severity derived from that description.

- Native to the IBM stack the client asked for, no training pipeline needed, usable from week 1
- Free to build under the Techzone/watsonx sandbox already provisioned
- Publicly documented as purpose built for document understanding, layout parsing and chart/diagram QA, not natural disaster photo classification. IBM's own materials note vision language models tuned for documents typically underperform on natural images, and the reverse risk applies here
- No existing benchmark or fine tuning on fire/smoke imagery, so accuracy on the four level rubric is unvalidated, which the BA's own rubric doc already flags as an open risk
- A single model call produces a severity judgement in one step unless prompted very carefully to expose intermediate indicators, working against the explainability requirement

### 2. watsonx.ai custom foundation model hosting (bring your own model)

Fine tune a vision language model (for example a Llama Vision or Pixtral family model) on labelled fire imagery and host it as a custom foundation model deployment inside watsonx.ai.

- Deepest integration with watsonx.governance for monitoring and audit trail
- Fine tuning brings in domain specific accuracy
- Custom foundation model hosting is a heavier, GPU backed deployment path, realistically outside the zero cost sandbox and outside what a two developer team can stand up and validate inside a 12 week semester alongside ingestion, mapping and prioritisation work
- Large vision language models are still awkward to force into clean per indicator boolean outputs without extensive prompt or output engineering

### 3. Lightweight custom CNN, single end to end classifier

Fine tune a small, CPU friendly image classifier (MobileNetV3 or EfficientNet-Lite) directly on the four severity labels, trained outside watsonx and served from a small container.

- Small, fast, cheap to train and run, well suited to a free tier CPU deployment
- Straightforward to build and evaluate against a labelled test set, matching the "batch evaluation" milestone in the client's own Phase 2 timeline
- Collapses the decision into one label per image, which does not naturally produce the indicator level explanation the acceptance criteria and the existing architecture decision both call for, without extra work to expose feature attribution
- Does not, by itself, touch the watsonx stack the client asked the team to build on

### 4. Lightweight multi indicator detector plus a deterministic severity rule engine (recommended)

Train small, purpose built vision models against the indicator dimensions already implied by the approved rubric (smoke density, flame visibility, vegetation impact, structure/people proximity), each producing a graded flag. A deterministic rule engine, written directly from the rubric table, combines the four flags into the final 1 to 4 severity level and a plain language explanation built from the flags that fired.

Concretely:

- One small multi class image classifier (transfer learning off a lightweight backbone such as MobileNetV3 or EfficientNet-Lite, trained on the labelled dataset) per indicator dimension, or a single multi head model sharing one backbone with four output heads, one per indicator
- A rule engine (plain code, no ML) that maps the four graded flags to a severity level exactly as the rubric table defines it, and renders `severity_explanation` from whichever flags drove the result
- The overall `confidence_score` required by US2/FR13 is derived from the four indicator classifiers' own per class probabilities (proposed: the minimum confidence across the four dimensions, since the weakest indicator is what should drive whether a human reviews the image), which also means a low confidence result can name which specific indicator was uncertain, not just a bare number
- `assessment_status` set to `unable_to_assess` whenever `confidence_score` falls below an agreed threshold, routing the image for manual review rather than forcing a guess (this satisfies both the BA's requirement that false results should not be processed and FR13's 100 percent target)
- The whole thing runs on CPU, cheaply and quickly, and deploys as a custom model into the watsonx.ai Runtime (Watson Machine Learning) deployment space Htet has already provisioned and verified (see IBM Cloud/Watson compatibility below), which is both more native to the stack than a general purpose container and already working infrastructure rather than something still to be built

## IBM Cloud / watsonx compatibility comparison

| Approach                                           | Uses watsonx / IBM stack                                                                                                                                                                                                                                                                                       | Fits free to build                                  | Deployment complexity                                             | Meets explainability requirement natively                                                                                           | Training data needed                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1. Granite Vision prompting                        | Yes, directly                                                                                                                                                                                                                                                                                                  | Yes                                                 | Very low                                                          | Weak, single shot judgement unless heavily prompt engineered                                                                        | None, but unvalidated on this imagery                                                                                                                                                                                                                                                                                    |
| 2. Custom foundation model in watsonx.ai           | Yes, deepest                                                                                                                                                                                                                                                                                                   | No, GPU hosting realistically exceeds sandbox scope | High                                                              | Weak to moderate, needs output engineering                                                                                          | Large labelled set for fine tuning                                                                                                                                                                                                                                                                                       |
| 3. Standalone CNN classifier                       | No, sits outside watsonx                                                                                                                                                                                                                                                                                       | Yes                                                 | Low                                                               | Weak, single label output                                                                                                           | Not available from either source dataset: FlameVision and D-Fire are fire/smoke presence datasets, not severity datasets, neither provides the four level severity label this approach needs, would require labelling the full severity taxonomy from scratch                                                            |
| 4. Indicator detectors + rule engine (recommended) | Yes, models trained outside watsonx but served as a custom model deployment inside the watsonx.ai Runtime (Watson Machine Learning) deployment space already provisioned, with watsonx Orchestrate available to wire the manual review routing and watsonx.governance able to log/monitor the deployed service | Yes                                                 | Low, the deployment target already exists and is verified working | Strong, matches the client's explainability success criterion directly, and produces the numeric confidence score NFR2/US2 requires | Partial: FlameVision/D-Fire give a usable starting point for `smoke_density` and `flame_visibility` only; `vegetation_impact` and `structure_people_proximity` have zero coverage from either dataset and need manual labelling from scratch on a stratified subset (see Dataset_Classes_Label_Proposal_for_Aryaveer.md) |

Notes on "uses watsonx":

- The client brief lists watsonx.ai as the classification component. Watson Machine Learning (the runtime behind watsonx.ai's deployment spaces) is not limited to IBM's own foundation models, it is a general model hosting service that accepts custom trained models (scikit-learn, PyTorch, TensorFlow and other common frameworks) as deployable assets, so the indicator classifiers in option 4 deploy directly into the space Htet already stood up, this is watsonx.ai hosting a custom model, not a workaround that avoids it.
- Code Engine remains relevant as the home for the ingestion API itself (per the existing Storage and metadata V2.md architecture), which calls the deployed watsonx.ai Runtime endpoint for classification, exactly the same shape as the client brief's split between an elastic ingestion tier and a watsonx.ai classification component.
- watsonx Orchestrate can route the `unable_to_assess` path to manual review assignment, and watsonx.governance can monitor the deployed indicator models for drift, both available without forcing an unvalidated document focused vision model onto a task it was not built for.
- IBM Cloud Code Engine also now offers GPU backed serverless fleets for heavier AI workloads generally. Not needed here since the recommended models are CPU sized and there is already a working WML deployment space, but worth knowing as a scaling path exists if a future phase needs it.

## Recommendation

Approach 4: lightweight per indicator vision models plus a deterministic, rubric derived severity rule engine, deployed as a custom model into the watsonx.ai Runtime deployment space Htet has already provisioned, called from the ingestion API on IBM Code Engine.

Justification:

1. It is the only option that satisfies the hard explainability requirement (acceptance criteria 4 and 9) by construction rather than by add on, because the severity level is a transparent function of detected indicators, matching the boolean indicator flag decomposition already agreed in the architecture decisions.
2. It is the only option that naturally produces the numeric `confidence_score` and per indicator basis for it that NFR2, US2 and FR13 already commit the team to, without extra output engineering on top of a black box model.
3. It stays inside the free to build constraint, training and serving small CPU models rather than hosting a large vision language model, and deploys into infrastructure that already exists and is verified working rather than something still to be provisioned.
4. It reuses the dataset work already done (FlameVision and D-Fire selected as the labelling base for two of the four indicators) without requiring the much larger labelled corpus a fine tuned foundation model would need. This is a labelling head start, not a finished labelled corpus, `vegetation_impact` and `structure_people_proximity` still need manual labelling from scratch (see Dataset_Classes_Label_Proposal_for_Aryaveer.md).
5. It still uses the IBM stack as briefed, watsonx.ai Runtime for classification, Code Engine for ingestion, with watsonx Orchestrate and watsonx.governance available for routing and monitoring, while not depending on Granite Vision's document focused training for a task it is not validated against.
6. It leaves a documented upgrade path: if per indicator accuracy is insufficient after the Core Build phase (weeks 3 to 5) evaluation against the NFR2 targets, the same indicator outputs can be re derived from a watsonx.ai hosted vision language model later without changing the rule engine, the metadata schema, or the deployment target.

## Open items for team/client confirmation

- Final indicator taxonomy and per indicator label set needs sign off from Aryaveer before dataset labelling starts (see Dataset_Classes_Label_Proposal_for_Aryaveer.md).
- Confidence threshold for routing to `unable_to_assess` is a design choice, not yet agreed, propose starting at 70 percent per dimension and tuning against the Phase 2 batch evaluation, calibrated so the 100 percent FR13 routing target is actually met rather than assumed.
- Whether watsonx Orchestrate is used for the manual review routing in Sprint 1/2 or deferred to the Ingestion & Map phase (weeks 6 to 8) is an open scheduling question, not a technical blocker.
- Confirm with Htet that the existing deployment space (`ca-tor` region, linked to the `WatsonMachineLearning` instance) is the one this component should deploy into, rather than a separate space, since the region also needs to match wherever COS ends up (the storage doc's COS instance was provisioned in `au-syd`, a cross region call between Code Engine, COS and watsonx.ai Runtime is a latency and, depending on final choices, possibly a data residency question worth settling early rather than discovering during the Ingestion & Map phase).

Sources:

- [IBM Granite 3.2: open source reasoning and vision](https://www.ibm.com/new/announcements/ibm-granite-3-2-open-source-reasoning-and-vision)
- [Bringing your own custom foundation model to watsonx.ai](https://www.ibm.com/new/announcements/bringing-your-own-custom-foundation-model-to-watsonx-ai)
- [IBM Cloud Code Engine introduces serverless fleets with GPUs](https://www.ibm.com/new/announcements/ibm-cloud-code-engine-introduces-serverless-fleets-with-gpus)
- [IBM Cloud Code Engine](https://www.ibm.com/products/code-engine)
