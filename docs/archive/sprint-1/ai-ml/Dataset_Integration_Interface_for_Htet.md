> **Archived 2026-09-24.** Historical record, kept as written. Current version: [Architecture](../../../live/architecture.md). Why things changed: [decision log](../../../decisions/decision-log.md).

# Dataset / Classification Integration Interface: Proposal for Htet

**Status:** DRAFT, needs Htet's confirmation since it defines the boundary between the ingestion API (Dev 1, Htet) and the classification component (Dev 2, Liam)
**Depends on:** AI_Framework_and_Technical_Approach.md, Storage_and_Metadata_Finalisation_Addendum.md, docs/Storage and metadata V2.md

> **Superseded (24 Sep 2026).** The separate classification service proposed below was never built, and the backend code for calling it (`requestClassification()`, `CLASSIFICATION_SERVICE_URL`) has been removed. Instead, the backend calls the four per-indicator watsonx.ai deployments directly (`backend/src/ai/indicator-models.ts`, configured by the `WATSONX_*_DEPLOYMENT_ID` env vars) and does the aggregation itself in `backend/src/pipeline/assess-severity.ts`: rubric sum to severity 1 to 4, `confidence_score` as the minimum of the four indicator confidences, the 0.75 threshold (at or below routes to Manual Review), and the explanation text. Classification runs asynchronously after the image is stored, and a failed call leaves the image `pending_review`.
>
> Still accurate from this document: the minimum-confidence rule and the pending_review fallback. No longer accurate: the signed URL request (image bytes go to watsonx.ai directly), and the threshold living in the classification service's own configuration (it is now backend code, so changing it needs a backend deploy). Kept as a record of the original design decision.

### Why this needs Htet's confirmation

The ingestion API (Htet's) and the classification service (this document's recommendation, deployed into the watsonx.ai Runtime space Htet already provisioned) are two separate pieces of work that only function together if the contract between them is agreed before either side builds against assumptions. This document proposes that contract.

### Where this sits in the flow

Per `docs/Storage and metadata V2.md` step 5 and the finalised diagram (Technical_Data_Flow_Architecture_Finalised.md), the ingestion API calls the classification service after the image is confirmed `stored` in COS, and writes the response back onto the same metadata record. The classification service does not talk to COS, the metadata store, or the coordinator directly, it is a pure request/response call the ingestion API owns.

### Proposed request (ingestion API to classification service)

```json
{
  "image_id": "b1f6...",
  "storage_path": "/inc-2026-0091/drone/2026-08-20T14-32-00_img-0007.jpg",
  "source_type": "drone",
  "image_access": {
    "type": "signed_url",
    "url": "https://...",
    "expires_at": "2026-09-09T14:45:00Z"
  }
}
```

Notes:

- The classification service is proposed to fetch the image itself via a short lived signed URL rather than the ingestion API uploading image bytes inline in the request, consistent with the existing access/security design in `docs/Storage and metadata V2.md` Section 5 (no client, and by extension no downstream service, holds a long lived COS credential).
- `source_type` is passed through since the open question about satellite imagery possibly needing a different scoring path means the classification service may eventually branch on it, even though the current recommended approach treats all sources identically.

### Proposed response (classification service to ingestion API)

```json
{
  "image_id": "b1f6...",
  "severity_score": 3,
  "confidence_score": 0.81,
  "severity_explanation": "Dense and dark smoke, visible high flames and embers, noticeable vegetation impact, infrastructure in the fire line",
  "assessment_status": "assessed",
  "indicators": {
    "smoke_density": { "value": "dense_dark", "confidence": 0.88 },
    "flame_visibility": {
      "value": "visible_high_flames_and_embers",
      "confidence": 0.81
    },
    "vegetation_impact": { "value": "noticeable_impact", "confidence": 0.9 },
    "structure_people_proximity": {
      "value": "infrastructure_in_fire_line",
      "confidence": 0.85
    }
  },
  "model_version": "indicator-classifier-v0.1"
}
```

Notes:

- `confidence_score` is the minimum across the four `indicators[*].confidence` values, computed by the classification service so the ingestion API does not need to know the aggregation rule, it just reads one number for the `assessment_status` threshold check. In the example above that is `min(0.88, 0.81, 0.90, 0.85) = 0.81`.
- `severity_explanation` is built from all four flags that drove the result, not a subset. The example above names all four (smoke, flame, vegetation, structure) to match the rule in `AI_Framework_and_Technical_Approach.md` that the explanation is rendered "from whichever flags drove the result."
- When `assessment_status` is `unable_to_assess` (confidence below threshold), `severity_score` and `severity_explanation` are still returned if available rather than omitted, so a human reviewer has something to start from, per the requirement that flagged images remain visible and useful, not blank.
- `model_version` is included from day one, before it is actually needed for anything, since retrofitting model version tracking after several model iterations have already run is far more painful than including an unused field early. Supports future debugging of "which model version produced this call" once retraining starts happening.
- `indicators` is included in full, not just the derived severity, so the ingestion API can write the four indicator fields onto the metadata record directly (see Storage_and_Metadata_Finalisation_Addendum.md) without a second round trip.

### Error handling

| Situation                                          | Proposed behaviour                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Image fetch from the signed URL fails              | Classification service returns `assessment_status: unable_to_assess`, `severity_score: null`, an `error` field describing the failure. Ingestion API treats this the same as a low confidence result, not a hard failure of the whole submission, the image stays visible for manual review rather than the submission being rejected outright, since it already passed ingestion validation.                |
| Classification service is unreachable or times out | Ingestion API's responsibility, not the classification service's, proposed as a retry with backoff, then falling back to `assessment_status: pending_review` if retries are exhausted, so a transient outage does not silently drop images. Specific retry policy is an ingestion tier concern, left to Htet's design, this document only asks that some fallback exists rather than an unhandled exception. |
| Model confidence threshold changes                 | Threshold lives in the classification service's own configuration, not hardcoded into the ingestion API, so tuning it (see the open item in AI_Framework_and_Technical_Approach.md) does not require an ingestion API deployment.                                                                                                                                                                            |

### Latency

NFR1 (Week 2 requirements doc) targets 2 minutes or less from submission to a severity tag being returned. This interface is a single synchronous call, worth confirming with Htet whether the ingestion API calls this synchronously and holds the client connection, or fires it asynchronously and the client polls/subscribes for the result, since that materially affects how tightly the classification service itself needs to be optimised versus how much slack the ingestion API's own async handling absorbs.

### Open items for Htet to confirm

1. Whether the call above is synchronous or async from the ingestion API's perspective (affects both sides' error handling design).
2. Exact signed URL expiry window, long enough for the classification service's queue depth under a spike, short enough to stay a meaningfully time limited credential.
3. Whether retries on classification service failure happen inline (ingestion API blocks and retries) or via a queue/background job, given the ingestion tier's own spike tolerance requirement (NFR4).
