from __future__ import annotations

import argparse
import json

import numpy as np

from retinascan_ml.model import load_model
from retinascan_ml.preprocess import build_processed_image, save_processed_preview

CLASS_NAMES = ["No DR", "Mild", "Moderate", "Severe", "Proliferative"]


def build_lesions(probabilities: list[float]) -> list[dict[str, float | str]]:
    lesions = []
    for label, score in sorted(
        zip(CLASS_NAMES, probabilities),
        key=lambda item: item[1],
        reverse=True,
    )[:3]:
        lesions.append(
            {
                "name": label,
                "label": "Model probability",
                "confidence": round(float(score), 4),
            }
        )
    return lesions


def main() -> None:
    parser = argparse.ArgumentParser(description="Run DR prediction for one fundus image.")
    parser.add_argument("--image", required=True)
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--scan-id", required=True)
    args = parser.parse_args()

    model = load_model(args.checkpoint)
    processed_image = build_processed_image(args.image)
    preview_path = save_processed_preview(args.image, args.output_dir, args.scan_id)

    model_input = np.expand_dims(processed_image.astype(np.float32), axis=0)
    probabilities = model.predict(model_input, verbose=0)[0].tolist()
    severity = int(np.argmax(probabilities))
    confidence = float(probabilities[severity])

    payload = {
        "severity": severity,
        "severityLabel": CLASS_NAMES[severity],
        "confidence": round(confidence, 4),
        "probabilities": [round(float(score), 6) for score in probabilities],
        "probabilitySum": round(float(np.sum(probabilities)), 6),
        "heatmapImagePath": preview_path,
        "summary": f"Predicted {CLASS_NAMES[severity]} with {confidence * 100:.1f}% confidence.",
        "lesions": build_lesions(probabilities),
    }
    print(json.dumps(payload))


if __name__ == "__main__":
    main()
