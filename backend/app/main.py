from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import os

from .models import (
    HealthResponse, SchemaResponse, RegressionRequest, RegressionResponse,
    ClassificationRequest, ClassificationResponse, MetaResponse, 
    GlobalImportanceResponse, BatchMode
)
from .pipeline_loader import load_pipelines, get_schema
from .inference import predict_with_timing
from .utils import score_csv, read_metrics, global_importance

# Create FastAPI app
app = FastAPI(
    title="Credit Prediction API",
    description="Inference-only API for credit limit and tier prediction",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load pipelines on startup
@app.on_event("startup")
async def startup_event():
    app.state.pipes = load_pipelines()

# Mount static files
if os.path.exists("app/static"):
    app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse()

@app.get("/schema", response_model=SchemaResponse)
async def get_schema_endpoint():
    """Get the schema of required features from the pipeline."""
    try:
        schema = get_schema(app.state.pipes["reg"])
        return SchemaResponse(**schema)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/meta", response_model=MetaResponse)
async def get_meta():
    """Get metadata including metrics, training summary, and model rationale."""
    try:
        # Get schema
        schema = get_schema(app.state.pipes["reg"])
        
        # Read metrics
        metrics = read_metrics()
        
        # Training summary
        training_summary = (
            "80/20 train/test split, fixed seed. ColumnTransformer preprocessing: "
            "Numeric = median impute → standardize; Categorical = most-frequent impute → "
            "One-Hot (handle_unknown=\"ignore\"). Models trained offline in Colab; "
            "this app performs inference only."
        )
        
        # Model choice rationale
        model_choice_rationale = (
            "Random Forest chosen over Linear/GBDT/ANN for strong accuracy/variance balance "
            "on ~10k tabular rows, robustness to non-linearities/outliers, low tuning sensitivity, "
            "and explainability (feature importances/SHAP). ANN provided no consistent lift "
            "for this dataset at higher ops cost."
        )
        
        return MetaResponse(
            regression_metrics_table=metrics["regression_metrics_table"],
            classification_metrics_table=metrics["classification_metrics_table"],
            training_summary=training_summary,
            model_choice_rationale=model_choice_rationale,
            attributes=SchemaResponse(**schema)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/global-importance", response_model=GlobalImportanceResponse)
async def get_global_importance():
    """Get global feature importance."""
    try:
        importance = global_importance(app.state.pipes["reg"])
        return GlobalImportanceResponse(features=importance)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/regression", response_model=RegressionResponse)
async def predict_regression_endpoint(request: RegressionRequest):
    """Make regression prediction for credit limit."""
    try:
        prediction, runtime_ms = predict_with_timing(
            app.state.pipes["reg"], 
            request.payload, 
            "regression"
        )
        
        return RegressionResponse(
            model_name="RandomForestRegressor",
            predicted_credit_limit=prediction,
            runtime_ms=runtime_ms
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict/classification", response_model=ClassificationResponse)
async def predict_classification_endpoint(request: ClassificationRequest):
    """Make classification prediction for tier."""
    try:
        result, runtime_ms = predict_with_timing(
            app.state.pipes["clf"], 
            request.payload, 
            "classification"
        )
        
        prediction, proba = result
        
        return ClassificationResponse(
            model_name="RandomForestClassifier",
            predicted_tier=prediction,
            proba=proba,
            runtime_ms=runtime_ms
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict/batch")
async def predict_batch(
    mode: BatchMode = Query(..., description="Prediction mode"),
    file: UploadFile = File(..., description="CSV file to score")
):
    """Score a CSV file and return scored CSV."""
    try:
        # Read file content
        content = await file.read()
        
        # Score CSV
        pipeline = app.state.pipes["reg"] if mode == BatchMode.REGRESSION else app.state.pipes["clf"]
        scored_content = score_csv(content, mode.value, pipeline)
        
        # Return scored CSV
        from fastapi.responses import Response
        return Response(
            content=scored_content,
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=scored_{file.filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
