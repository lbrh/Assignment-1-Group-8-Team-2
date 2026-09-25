> **Archived 2026-09-24.** Historical record, kept as written. Current version: [AI models and dataset](../../../live/ai-models-and-dataset.md). Why things changed: [decision log](../../../decisions/decision-log.md).

# Dataset Acquisition Status

**Status:** Downloaded. Organising, quality-checking, and labelling are scheduled for Sprint 2.

### What happened

I'd already decided to use FlameVision and D-Fire as the labelling base (see architecture-decisions.md). I downloaded both directly:

- D-Fire's image and label archive from the OneDrive link in its GitHub README (the D-Fire GitHub repo itself only contains the README, license and a small utility script, not the images).
- FlameVision from Kaggle.

Both downloads worked without any issues. Both datasets are public and free to use, D-Fire is Creative Commons Zero, FlameVision is publicly listed on Kaggle and Mendeley Data.

### Next steps (Sprint 2)

Organising, quality-checking, and labelling the images wasn't in scope this sprint, that starts next sprint. I'll sort both datasets against the proposed label taxonomy in `Dataset_Classes_Label_Proposal_for_Aryaveer.md` (pending Aryaveer's sign-off), check for corrupt or duplicate files, and split the labelled set into train/val/test.
