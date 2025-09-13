import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.pipeline import Pipeline
import time


def predict_regression(pipeline: Pipeline, payload: Dict[str, Any]) -> float:
    """Make regression prediction for credit limit."""
    try:
        # Create DataFrame with all expected columns
        df = pd.DataFrame([payload])
        
        # Make prediction
        prediction = pipeline.predict(df)[0]
        return float(prediction)
    except Exception as e:
        raise ValueError(f"Regression prediction failed: {str(e)}")


def predict_classification(pipeline: Pipeline, payload: Dict[str, Any]) -> Tuple[str, Dict[str, float]]:
    """Make classification prediction for tier."""
    try:
        # Create DataFrame with all expected columns
        df = pd.DataFrame([payload])
        
        # Make prediction
        prediction = pipeline.predict(df)[0]
        
        # Get probabilities if available
        proba = {}
        if hasattr(pipeline, 'predict_proba'):
            proba_values = pipeline.predict_proba(df)[0]
            classes = pipeline.classes_
            proba = {str(cls): float(prob) for cls, prob in zip(classes, proba_values)}
        else:
            # Fallback probabilities
            proba = {"Low": 0.33, "Medium": 0.33, "High": 0.34}
        
        return str(prediction), proba
    except Exception as e:
        raise ValueError(f"Classification prediction failed: {str(e)}")


def predict_with_timing(pipeline: Pipeline, payload: Dict[str, Any], task: str) -> Tuple[Any, float]:
    """Make prediction and measure runtime."""
    start_time = time.time()
    
    if task == "regression":
        result = predict_regression(pipeline, payload)
    elif task == "classification":
        result = predict_classification(pipeline, payload)
    else:
        raise ValueError(f"Unknown task: {task}")
    
    runtime_ms = (time.time() - start_time) * 1000
    return result, runtime_ms
