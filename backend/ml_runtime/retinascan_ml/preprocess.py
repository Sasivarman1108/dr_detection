from __future__ import annotations

from pathlib import Path

import cv2
import numpy as np

IMAGE_SIZE = 224


def _crop_fundus(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 10, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        return image

    x, y, w, h = cv2.boundingRect(max(contours, key=cv2.contourArea))
    return image[y : y + h, x : x + w]


def _pad_to_square(image: np.ndarray) -> np.ndarray:
    height, width = image.shape[:2]
    if height == width:
        return image

    size = max(height, width)
    top = (size - height) // 2
    bottom = size - height - top
    left = (size - width) // 2
    right = size - width - left

    return cv2.copyMakeBorder(
        image,
        top,
        bottom,
        left,
        right,
        cv2.BORDER_CONSTANT,
        value=(0, 0, 0),
    )


def build_processed_image(image_path: str | Path) -> np.ndarray:
    image = cv2.imread(str(Path(image_path)))
    if image is None:
        raise ValueError("Could not read image.")

    cropped = _crop_fundus(image)
    squared = _pad_to_square(cropped)
    resized = cv2.resize(squared, (IMAGE_SIZE, IMAGE_SIZE), interpolation=cv2.INTER_AREA)
    return cv2.cvtColor(resized, cv2.COLOR_BGR2RGB)


def save_processed_preview(
    image_path: str | Path,
    output_dir: str | Path,
    scan_id: str,
) -> str:
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    processed = build_processed_image(image_path)
    output_path = output_dir / f"{scan_id}_preprocessed.jpg"
    cv2.imwrite(str(output_path), cv2.cvtColor(processed, cv2.COLOR_RGB2BGR))
    return str(output_path.resolve())
