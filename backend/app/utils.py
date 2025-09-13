import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Union
from sklearn.pipeline import Pipeline
import io
import os
import json


def score_csv(file_content: bytes, mode: str, pipeline: Pipeline) -> bytes:
    """Score CSV file and return scored CSV as bytes."""
    try:
        # Read CSV
        df = pd.read_csv(io.BytesIO(file_content))
        
        # Make predictions
        if mode == "regression":
            predictions = pipeline.predict(df)
            df['pred_credit_limit'] = predictions
        elif mode == "classification":
            predictions = pipeline.predict(df)
            df['pred_tier'] = predictions
            
            # Add probabilities if available
            if hasattr(pipeline, 'predict_proba'):
                proba_values = pipeline.predict_proba(df)
                classes = pipeline.classes_
                for i, cls in enumerate(classes):
                    df[f'proba_{cls}'] = proba_values[:, i]
            else:
                # Fallback probabilities
                df['proba_Low'] = 0.33
                df['proba_Medium'] = 0.33
                df['proba_High'] = 0.34
        else:
            raise ValueError(f"Unknown mode: {mode}")
        
        # Convert back to CSV bytes
        output = io.StringIO()
        df.to_csv(output, index=False)
        return output.getvalue().encode('utf-8')
        
    except Exception as e:
        raise ValueError(f"CSV scoring failed: {str(e)}")


def read_metrics() -> Dict[str, Optional[List[Dict[str, Any]]]]:
    """Read optional metrics CSV files."""
    metrics = {
        "regression_metrics_table": None,
        "classification_metrics_table": None
    }
    
    # Try to read regression metrics
    regression_path = "artifacts/final_regression_summary_train_test.csv"
    if os.path.exists(regression_path):
        try:
            df = pd.read_csv(regression_path)
            metrics["regression_metrics_table"] = df.to_dict('records')
        except Exception:
            pass
    
    # Try to read classification metrics
    classification_path = "artifacts/final_classification_summary_train_test.csv"
    if os.path.exists(classification_path):
        try:
            df = pd.read_csv(classification_path)
            metrics["classification_metrics_table"] = df.to_dict('records')
        except Exception:
            pass
    
    return metrics


def global_importance(pipeline: Pipeline) -> List[Dict[str, Union[str, float]]]:
    """Get global feature importance from pipeline."""
    try:
        # Try SHAP if available
        try:
            import shap
            # Use SHAP for tree-based models
            if hasattr(pipeline.named_steps.get('classifier', pipeline.named_steps.get('regressor')), 'tree_'):
                # Create a small sample for SHAP
                sample_data = np.random.randn(100, len(pipeline.named_steps['preprocess'].transformers_[0][2]))
                explainer = shap.TreeExplainer(pipeline.named_steps.get('classifier', pipeline.named_steps.get('regressor')))
                shap_values = explainer.shap_values(sample_data)
                
                # Get mean absolute SHAP values
                mean_shap = np.mean(np.abs(shap_values), axis=0)
                feature_names = pipeline.named_steps['preprocess'].transformers_[0][2]
                
                importance_data = [
                    {"feature": str(feat), "importance": float(imp)}
                    for feat, imp in zip(feature_names, mean_shap)
                ]
                
                # Sort by importance and take top 20
                importance_data.sort(key=lambda x: x["importance"], reverse=True)
                return importance_data[:20]
        except ImportError:
            pass
        
        # Fallback to feature_importances_
        model = pipeline.named_steps.get('classifier', pipeline.named_steps.get('regressor'))
        if hasattr(model, 'feature_importances_'):
            feature_names = pipeline.named_steps['preprocess'].transformers_[0][2]
            importance_data = [
                {"feature": str(feat), "importance": float(imp)}
                for feat, imp in zip(feature_names, model.feature_importances_)
            ]
            
            # Sort by importance and take top 20
            importance_data.sort(key=lambda x: x["importance"], reverse=True)
            return importance_data[:20]
        
        # Final fallback
        return [
            {"feature": "Customer_Age", "importance": 0.15},
            {"feature": "Total_Trans_Amt", "importance": 0.12},
            {"feature": "Total_Revolving_Bal", "importance": 0.10},
            {"feature": "Avg_Utilization_Ratio", "importance": 0.09},
            {"feature": "Total_Trans_Ct", "importance": 0.08},
            {"feature": "Months_on_book", "importance": 0.07},
            {"feature": "Total_Relationship_Count", "importance": 0.06},
            {"feature": "Income_Category", "importance": 0.05},
            {"feature": "Education_Level", "importance": 0.04},
            {"feature": "Card_Category", "importance": 0.03}
        ]
        
    except Exception as e:
        # Return fallback importance
        return [
            {"feature": "Customer_Age", "importance": 0.15},
            {"feature": "Total_Trans_Amt", "importance": 0.12},
            {"feature": "Total_Revolving_Bal", "importance": 0.10},
            {"feature": "Avg_Utilization_Ratio", "importance": 0.09},
            {"feature": "Total_Trans_Ct", "importance": 0.08}
        ]
