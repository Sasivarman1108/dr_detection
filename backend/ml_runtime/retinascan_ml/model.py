from __future__ import annotations

from pathlib import Path

import tensorflow as tf

_MODEL_CACHE: dict[str, tf.keras.Model] = {}


def load_model(checkpoint_path: str | Path) -> tf.keras.Model:
    resolved_path = str(Path(checkpoint_path).resolve())
    model = _MODEL_CACHE.get(resolved_path)
    if model is not None:
        return model

    model = tf.keras.models.load_model(resolved_path)
    _MODEL_CACHE[resolved_path] = model
    return model
