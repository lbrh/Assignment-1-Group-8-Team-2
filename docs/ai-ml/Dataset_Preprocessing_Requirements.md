# Dataset Preprocessing Requirements

**Status:** DRAFT
**Depends on:** AI_Framework_and_Technical_Approach.md, Dataset_Classes_Label_Proposal_for_Aryaveer.md, Storage and metadata structure.MD

### Purpose

Documents what needs to happen to an image between "captured or downloaded" and "ready for training or inference" under the recommended per indicator classifier approach. This is a superset of what the Sprint 2 quality check needs to catch, quality checks catch problems, preprocessing fixes or standardises what is left.

### Training time preprocessing (FlameVision, D-Fire, and any manually gathered images)

1. **Format standardisation.** Convert everything to RGB JPEG. D-Fire and FlameVision are both expected to already ship as JPEG/PNG per their documentation, but any grayscale or palette mode images caught by the quality check should be converted to RGB before use, most CNN backbones expect three channels.
2. **Deduplication first.** Run a quality check to remove or merge exact and near duplicates before splitting into train/val/test. A duplicate that ends up in both train and test will inflate evaluation accuracy without meaning anything.
3. **Resizing.** Resize to the input resolution the chosen backbone expects (224x224 for MobileNetV3/EfficientNet-Lite variants is the common default). Resize with aspect ratio preserved plus centre crop or padding, not a naive stretch, stretching distorts flame and smoke shapes that the indicator classifiers depend on.
4. **Normalisation.** Standard ImageNet channel mean/std normalisation, matching whatever pretrained backbone weights are used for transfer learning.
5. **Augmentation for training only, never for validation/test.** Horizontal flip, small rotation (up to about 15 degrees), mild brightness/contrast jitter, and random crop are reasonable given the natural variability in fire photography. Avoid colour jitter strong enough to shift what looks like smoke versus haze, since colour and density are literally what the indicator labels are judging.
6. **Class imbalance handling.** The source datasets skew toward clear, obvious fire/smoke scenes (see Dataset_Acquisition_Status.md). Expect the Moderate and Catastrophic ends of the rubric to be under represented relative to High/Extreme. Address with class weighted loss or oversampling of minority levels once the manifest is labelled and the real distribution is known, do not guess weights ahead of the actual label counts.
7. **Stratified splitting.** Split by severity level rather than a plain random split, so the source datasets' skew toward obvious fire scenes doesn't concentrate in one split (see Dataset_Acquisition_Status.md).

### Inference time preprocessing (the live ingestion pipeline)

This is a different pipeline to the training one above, but needs to apply the identical resize/normalise steps so training and serving do not skew, a classic source of silent accuracy loss if the two paths drift apart.

1. **Client side compression before upload**, already flagged as a Sprint 1/2 recommendation in the storage doc for rural connectivity reasons. This needs to be tested against the minimum resolution the trained indicator models need for reliable output, not assumed, once a first model exists, run it against progressively downscaled copies of the validation set to find the floor.
2. **EXIF orientation correction.** Photos from phones and drones commonly carry an EXIF orientation tag rather than being physically rotated. This must be applied before resizing, otherwise a sideways or upside down image reaches the classifier and every downstream indicator prediction is unreliable. This is a pure bug risk, not a modelling choice, worth a specific unit test once the ingestion API is built.
3. **Corrupt or unreadable upload handling.** Reuse the same corrupt file detection logic planned for the dataset quality check at the ingestion boundary, an upload that fails to decode should be rejected with a clear error (matching the Image Submission screen's error state) rather than silently reaching the classifier and producing garbage.
4. **Video frame extraction (drone/CCTV).** Out of scope for Sprint 1 classification, format not yet finalised (see storage doc's data assumptions), but noted here since whatever frame extraction approach is chosen for video sources later needs to apply the same resize/normalise/orientation steps to each extracted frame before it reaches the classifier.

### Explicitly out of scope for Sprint 1

- On device preprocessing or pre filtering (considered and deferred in the storage doc, not a Sprint 1 commitment).
- Any preprocessing tuned to satellite tile characteristics specifically, the open question about whether satellite inputs need a source specific scoring path is still unresolved (see project overview open questions) and preprocessing should not get ahead of that decision.
