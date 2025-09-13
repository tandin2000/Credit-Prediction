# Credit Prediction Web Application

A full-stack machine learning web application for predicting credit limits and customer tiers using pre-trained Random Forest models.

## Author & Purpose

**Author:** Tandin Wangchen  
**Purpose:** University Assignment - UCW (University Canada West)  
**Course:** BUSI 661

## Overview

This application provides:
- **Credit Limit Prediction** (Regression): Predicts customer credit limits based on demographic and financial data
- **Customer Tier Classification** (Classification): Classifies customers into Low/Medium/High tiers
- **Batch Processing**: Upload CSV files for bulk predictions
- **Model Information**: Detailed analysis of model performance and feature importance

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **scikit-learn** - Machine learning models
- **Pandas & NumPy** - Data processing
- **Pydantic** - Data validation
- **joblib** - Model serialization

### Frontend
- **React** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Axios** - HTTP client

## Setup Instructions

### Prerequisites
- Python 3.8+ 
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd credit-prediction-app/backend
   ```

2. **Create virtual environment (recommended):**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Place model artifacts:**
   - Copy `best_regression_pipeline.joblib` to `backend/artifacts/`
   - Copy `best_classification_pipeline.joblib` to `backend/artifacts/`
   - Optional: Copy metrics CSV files to `backend/artifacts/`

5. **Start the server:**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The API will be available at: `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd credit-prediction-app/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   Create `.env` file in the frontend directory:
   ```
   VITE_API_BASE=http://localhost:8000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The application will be available at: `http://localhost:5173`

### Quick Start Scripts

**Windows:**
```bash
# Run start.bat from project root
start.bat
```

**Linux/Mac:**
```bash
# Run start.sh from project root
chmod +x start.sh
./start.sh
```

## API Endpoints

- `GET /health` - Health check
- `GET /schema` - Get required input features
- `GET /meta` - Get model metadata and metrics
- `GET /global-importance` - Get feature importance
- `POST /predict/regression` - Predict credit limit
- `POST /predict/classification` - Predict customer tier
- `POST /predict/batch` - Batch CSV processing

## Features

### Single Predictions
- Dynamic form generation based on model schema
- Real-time validation and error handling
- JSON input option for advanced users
- Empty field detection with helpful warnings

### Batch Processing
- CSV upload and download
- Support for both regression and classification modes
- Automatic column mapping

### Model Information
- Comprehensive model comparison analysis
- Performance metrics visualization
- Feature importance charts
- Training methodology explanation

## Model Details

**Algorithm:** Random Forest  
**Preprocessing:** ColumnTransformer with StandardScaler and OneHotEncoder  
**Performance:** R² ≈ 0.838 (Regression), Accuracy ≈ 0.839 (Classification)

### Why Random Forest?
- Excellent balance of bias and variance
- Robust to outliers and non-linear relationships
- Works well with mixed categorical and numerical data
- Low hyperparameter sensitivity
- Provides feature importance for explainability
- Production-friendly with stable performance

## File Structure

```
credit-prediction-app/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── models.py            # Pydantic models
│   │   ├── pipeline_loader.py   # Model loading
│   │   ├── inference.py         # Prediction logic
│   │   └── utils.py             # Utility functions
│   ├── artifacts/               # Model files (.joblib)
│   ├── requirements.txt         # Python dependencies
│   └── train_pipelines.py       # Model training script
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── pages/              # Page components
│   │   ├── api.ts              # API client
│   │   └── styles.css          # Global styles
│   ├── package.json            # Node dependencies
│   └── vite.config.ts          # Vite configuration
├── start.bat                   # Windows startup script
├── start.sh                    # Linux/Mac startup script
└── README.md                   # This file
```

## Troubleshooting

### Common Issues

1. **Pipeline Loading Errors:**
   - Ensure `.joblib` files are in `backend/artifacts/`
   - Check scikit-learn version compatibility
   - Use `train_pipelines.py` to regenerate compatible models

2. **Port Already in Use:**
   - Stop existing uvicorn processes
   - Use different port: `--port 8001`

3. **Frontend Connection Issues:**
   - Verify `VITE_API_BASE` in `.env` file
   - Ensure backend is running on correct port

4. **Missing Dependencies:**
   - Run `pip install -r requirements.txt` for backend
   - Run `npm install` for frontend

## Development Notes

- This is an **inference-only** application - no training code included
- Models are pre-trained and loaded from `.joblib` files
- All predictions use the same preprocessing pipeline as training
- Frontend dynamically adapts to model schema changes

## License

This project is created for educational purposes as part of a university assignment at UCW.

---

**Created by:** Tandin Wangchen  
**Institution:** University Canada West (UCW)  
**Course:** BUSI 661
