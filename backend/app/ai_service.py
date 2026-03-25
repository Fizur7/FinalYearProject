"""
YOLOv8 waste classification service.

Waste classes mapped from COCO / custom model:
  organic    → banana, apple, orange, broccoli, carrot, food items
  recyclable → bottle, cup, wine glass, fork, knife, spoon, bowl, can
  hazardous  → scissors, cell phone, laptop, keyboard, remote, battery
  general    → everything else

If a custom-trained model is available at YOLO_MODEL_PATH, it is used.
Otherwise falls back to yolov8n.pt (COCO) with class remapping.
"""
import os
import io
import numpy as np
from PIL import Image

# Lazy-load model to avoid startup delay
_model = None

YOLO_MODEL_PATH = os.getenv("YOLO_MODEL_PATH", "model/yolov8n.pt")

# COCO class → waste category mapping
COCO_TO_WASTE = {
    # organic
    46: "organic", 47: "organic", 48: "organic", 49: "organic",
    50: "organic", 51: "organic", 52: "organic", 53: "organic",
    54: "organic", 55: "organic",
    # recyclable
    39: "recyclable", 40: "recyclable", 41: "recyclable",
    42: "recyclable", 43: "recyclable", 44: "recyclable",
    45: "recyclable", 74: "recyclable", 75: "recyclable",
    # hazardous
    63: "hazardous", 64: "hazardous", 65: "hazardous",
    66: "hazardous", 67: "hazardous", 76: "hazardous",
}


def _get_model():
    global _model
    if _model is None:
        from ultralytics import YOLO
        path = YOLO_MODEL_PATH
        # Auto-download yolov8n.pt if custom model not found
        if not os.path.exists(path):
            os.makedirs("model", exist_ok=True)
            path = "yolov8n.pt"
        _model = YOLO(path)
    return _model


def analyze_image(image_bytes: bytes) -> dict:
    """
    Run YOLOv8 on image bytes.
    Returns:
        {
          "waste_type": "recyclable",
          "confidence": 87.3,
          "results": {"organic": 5.1, "recyclable": 87.3, "hazardous": 2.4, "general": 5.2}
        }
    """
    try:
        model = _get_model()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_array = np.array(img)

        results = model(img_array, verbose=False)[0]

        # Accumulate confidence per waste category
        scores = {"organic": 0.0, "recyclable": 0.0, "hazardous": 0.0, "general": 0.0}

        if results.boxes and len(results.boxes) > 0:
            for box in results.boxes:
                cls_id = int(box.cls[0])
                conf = float(box.conf[0]) * 100
                category = COCO_TO_WASTE.get(cls_id, "general")
                scores[category] = max(scores[category], conf)
        else:
            # No detections — classify as general with low confidence
            scores["general"] = 55.0

        # Normalize so values sum to 100
        total = sum(scores.values()) or 1
        normalized = {k: round(v / total * 100, 1) for k, v in scores.items()}

        # Primary waste type = highest score
        waste_type = max(normalized, key=normalized.get)
        confidence = normalized[waste_type]

        return {
            "waste_type": waste_type,
            "confidence": confidence,
            "results": normalized,
        }

    except Exception as e:
        # Graceful fallback — don't crash the report submission
        print(f"[AI] Analysis failed: {e}")
        return {
            "waste_type": "general",
            "confidence": 50.0,
            "results": {"organic": 10.0, "recyclable": 20.0, "hazardous": 5.0, "general": 65.0},
        }
