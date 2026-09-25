# AI Models and Dataset

**Status:** Live
**Owner:** Liam Robinson Hounsell (Dev 2)
**Last updated:** 2026-09-24
**Supersedes:** [AI framework](../archive/sprint-1/ai-ml/AI_Framework_and_Technical_Approach.md) · [Label proposal](../archive/sprint-1/ai-ml/Dataset_Classes_Label_Proposal_for_Aryaveer.md) · [Acquisition status](../archive/sprint-1/ai-ml/Dataset_Acquisition_Status.md) · [Preprocessing](../archive/sprint-1/ai-ml/Dataset_Preprocessing_Requirements.md)

---

## 1. Approach

Four small image classifiers, one per [rubric](severity-rubric.md) indicator. A plain-code rule engine (`assess-severity.ts`) turns their outputs into the 1–4 severity, the confidence and the explanation. Chosen in Sprint 1 over prompting Granite Vision, hosting a fine-tuned VLM, or a single end-to-end severity CNN, because it's the only option that is explainable by construction, produces a per-indicator confidence, and runs on CPU inside the watsonx.ai Runtime space we already have (D-03).

## 2. Deployed models

Each model is a `LightweightCNN` (PyTorch → ONNX, onnxruntime 1.17) served from the watsonx.ai Runtime deployment space in ca-tor.

| Indicator | Env var | Deployment ID | Trained on | State |
|---|---|---|---|---|
| Smoke density | `WATSONX_SMOKE_DENSITY_DEPLOYMENT_ID` | `01a0d0dd-2045-7095-9b56-bba8f2ac2601` | Full manifest (32k) | ✅ Current. Responds strongly to real smoke. |
| Flame visibility | `WATSONX_FLAME_VISIBILITY_DEPLOYMENT_ID` | `01a0c876-6c04-7274-9e08-6b9c30f94a90` | Full manifest | 🟡 Weak. Misses visible flames on aerial shots. Retrain with FlameVision weighting. |
| Vegetation | `WATSONX_VEGETATION_IMPACT_DEPLOYMENT_ID` | `01a0d111-ebec-757a-8450-d8f43da1573b` | Old damage-based labels | ❌ Outputs mean the old scale. Retrain on the relabelled subset. |
| Infrastructure | `WATSONX_INFRASTRUCTURE_IMPACT_DEPLOYMENT_ID` | none yet (set to the obsolete 3-output proximity model, which the backend rejects) | — | ❌ Train with `infra.ipynb` after relabel. |

### Output order

Each model's outputs are in the order the training notebook creates: `sorted(df[INDICATOR].unique())`, i.e. **alphabetical** over the classes present in training. `INDICATOR_MODELS` in `backend/src/ai/indicator-models.ts` lists the labels in that order.

If a class is missing from a model's training data, the model has fewer outputs. The backend rejects any model whose output count doesn't match its label list ("model returned 3 outputs, expected 4"), so it can never silently mislabel (D-14).

### Inference preprocessing

`preprocess-image.ts` matches the notebooks: apply EXIF orientation, resize to 128 × 128 (stretch), RGB, scale to 0–1, ImageNet mean/std normalise, shape `(1, 3, 128, 128)`. The EXIF step means a phone photo stored sideways reaches the model upright. The training datasets are CCTV/drone frames without orientation tags, so training and serving still match.

## 3. Dataset

- **Sources:** D-Fire (~21k ground-level/CCTV images, CC0) and FlameVision (~11.8k aerial images, Kaggle/Mendeley).
- **FlameVision duplicates:** about 97% of FlameVision's "detection" images are the same photos as its "classification" set (correlation ≥ 0.99). FlameVision really has about 7.8k unique images, and only about 1,000 genuinely distinct scenes, because they are frames from a limited set of drone videos.
- **Location:** the training project lives outside this repo, on Liam's machine at `~/PycharmProjects/IBM` (scripts, `manifest.csv`, `label_schema.json`, notebooks, images). It isn't in git.

### Labelling pipeline

| Step | Script | Output |
|---|---|---|
| Organise raw sources | `01_organise_raw_sources.py` | `manifest.csv` with bounding-box hints |
| Quality check | `02_check_data_quality.py` | Corrupt / duplicate report |
| Split | `03_stratified_split.py` | train/val/test (not yet used; notebooks split themselves) |
| Label with a local vision model | `04_label_indicators_locally.py` | Labels via Ollama `qwen2.5vl:7b`, about 8 s per image |
| Pick a diverse subset | `05_select_diverse_subset.py` | `manifest_subset.csv` |

- **First pass (Sprint 2):** all four indicators on 31,957 images. Smoke and flame labels are kept; the deployed smoke and flame models were trained on them.
- **Second pass (in progress, 2026-09-24):** `--damage-only` re-rates only vegetation and infrastructure under the new rubric, keeping each row's smoke and flame labels. It runs on a 4,000-image subset rather than all 32k (about 9 h vs 71 h).
  - The model lists the man-made objects it sees before rating infrastructure. If it lists any but says `no_infrastructure`, the script bumps it to `sparse_infrastructure`. Without this step, qwen reported no infrastructure on almost everything.
- **Subset selection:** each image becomes a 32 × 24 greyscale thumbnail normalised for brightness and contrast. An image is picked only if its correlation with every image already picked is below 0.8. This removes the same CCTV camera at different times of day, which perceptual hashes could not. The subset is split evenly between D-Fire and FlameVision; the result is 2,996 D-Fire and 1,004 FlameVision.
- **All labels are AI-generated.** They need a human spot-check before training, and a human-checked test set before any accuracy claim.

## 4. Training

Notebooks (in `~/PycharmProjects/IBM`):

| Notebook | Indicator | Manifest |
|---|---|---|
| `unzip_and_train.ipynb` | smoke / flame (set `INDICATOR`) | `manifest.csv` |
| `veg.ipynb` | `vegetation_impact` | `manifest_subset.csv` |
| `infra.ipynb` | `infrastructure_impact` | `manifest_subset.csv` |
| `store_and_deploy_model.ipynb` | Exports ONNX and deploys to watsonx | — |

- 70/15/15 stratified split, 128 × 128 input, flip and brightness/contrast augmentation, class-weighted cross-entropy.
- **Source balancing:** a `WeightedRandomSampler` draws FlameVision and D-Fire equally each epoch. `FLAMEVISION_BOOST` tilts it further (D-20).
- Each FlameVision image is seen about 3× per epoch, so watch validation for overfitting.

### Swapping in a new model

1. Deploy it in the watsonx space.
2. Check its output count matches the label list.
3. Set its deployment ID in `backend-secrets` and roll a new revision (see [deployment](deployment-and-operations.md)).

No code change is needed unless the class set changed.

## 5. Accuracy targets

- **Severity (NFR2):** precision ≥ 0.80, recall ≥ 0.75 on a labelled test set. Not measured yet.
- **Fire gate (proposed):** ≥ 98% of real fires kept, on ≥ 300 fire test images, with non-fire only accepted at ≥ 0.95 confidence (D-25). No gate model exists yet; it would be a fifth classifier (fire / non_fire), trained on D-Fire's none vs fire/smoke boxes and FlameVision's fire / no-fire labels.
