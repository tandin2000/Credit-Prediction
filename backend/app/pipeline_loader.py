import joblib
import os
from typing import Dict, Any, List
from fastapi import HTTPException
from sklearn.pipeline import Pipeline


def load_pipelines() -> Dict[str, Pipeline]:
    """Load pre-trained pipelines from artifacts directory."""
    artifacts_dir = "artifacts"
    
    regression_path = os.path.join(artifacts_dir, "best_regression_pipeline.joblib")
    classification_path = os.path.join(artifacts_dir, "best_classification_pipeline.joblib")
    
    if not os.path.exists(regression_path):
        raise HTTPException(
            status_code=503,
            detail="Artifacts not found. Place best_regression_pipeline.joblib in backend/artifacts/"
        )
    
    if not os.path.exists(classification_path):
        raise HTTPException(
            status_code=503,
            detail="Artifacts not found. Place best_classification_pipeline.joblib in backend/artifacts/"
        )
    
    try:
        # Try to load with different compatibility settings
        regression_pipeline = joblib.load(regression_path)
        classification_pipeline = joblib.load(classification_path)
        
        return {
            "reg": regression_pipeline,
            "clf": classification_pipeline
        }
    except Exception as e:
        # If loading fails due to version compatibility, provide helpful error message
        error_msg = str(e)
        if "Can't get attribute" in error_msg or "BitGenerator" in error_msg or "numpy._core" in error_msg:
            raise HTTPException(
                status_code=503,
                detail=f"Pipeline compatibility issue: {error_msg}. Please ensure your pipeline files were created with compatible versions of scikit-learn and numpy. You may need to recreate the pipelines with the current environment versions."
            )
        else:
            raise HTTPException(
                status_code=503,
                detail=f"Failed to load pipelines: {error_msg}"
            )


def get_schema(pipeline: Pipeline) -> Dict[str, List[str]]:
    """Extract schema from pipeline's preprocessing transformers."""
    try:
        # Get the preprocessor from the pipeline
        preprocessor = pipeline.named_steps['preprocess']
        
        numeric_features = []
        categorical_features = []
        
        # Extract features from transformers
        for name, transformer, features in preprocessor.transformers:
            if name == 'num':
                numeric_features = list(features)
            elif name == 'cat':
                categorical_features = list(features)
        
        return {
            "numeric_features": numeric_features,
            "categorical_features": categorical_features
        }
    except Exception as e:
        # Fallback schema if pipeline structure is different
        return {
            "numeric_features": [
                "Customer_Age", "Dependent_count", "Months_on_book", 
                "Total_Relationship_Count", "Months_Inactive_12_mon", 
                "Contacts_Count_12_mon", "Total_Revolving_Bal", 
                "Avg_Open_To_Buy", "Total_Amt_Chng_Q4_Q1", 
                "Total_Trans_Amt", "Total_Trans_Ct", 
                "Total_Ct_Chng_Q4_Q1", "Avg_Utilization_Ratio"
            ],
            "categorical_features": [
                "Gender", "Education_Level", "Marital_Status", 
                "Income_Category", "Card_Category"
            ]
        }
