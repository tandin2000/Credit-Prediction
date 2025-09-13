from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from enum import Enum


class HealthResponse(BaseModel):
    status: str = "ok"


class SchemaResponse(BaseModel):
    numeric_features: List[str]
    categorical_features: List[str]


class RegressionRequest(BaseModel):
    payload: Dict[str, Any]


class RegressionResponse(BaseModel):
    model_name: str
    predicted_credit_limit: float
    runtime_ms: float


class ClassificationRequest(BaseModel):
    payload: Dict[str, Any]


class ClassificationResponse(BaseModel):
    model_name: str
    predicted_tier: str
    proba: Dict[str, float]
    runtime_ms: float


class BatchMode(str, Enum):
    REGRESSION = "regression"
    CLASSIFICATION = "classification"


class MetaResponse(BaseModel):
    regression_metrics_table: Optional[List[Dict[str, Any]]] = None
    classification_metrics_table: Optional[List[Dict[str, Any]]] = None
    training_summary: str
    model_choice_rationale: str
    attributes: SchemaResponse


class GlobalImportanceResponse(BaseModel):
    features: List[Dict[str, Union[str, float]]]
