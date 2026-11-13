# Hero character model

Drop your GLB here as `woman.glb` (or set `NEXT_PUBLIC_MODEL_URL`).

What the hero code expects / uses if present:
- A rigged humanoid with bones named Head / Neck / Spine (Mixamo or Ready Player Me style) for idle head and breathing motion.
- ARKit-style blink morph targets (eyeBlinkLeft / eyeBlinkRight) for blinking.
- Material or mesh names containing skin / body / head / face / arm / neck so the skin gets the dewy glow treatment.
- Full-body models are auto-cut at mid-chest (NEXT_PUBLIC_MODEL_CROP=auto|always|never). Bust models are shown as-is.
- Recommended: Draco/Meshopt-compressed, under ~5 MB, 2K textures.

Whoever supplies the asset needs to confirm its licence allows commercial web use.
