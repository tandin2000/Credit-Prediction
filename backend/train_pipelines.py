"""
Credit Prediction Pipeline Training Script
Recreates pipelines from Colab notebooks with current environment versions
"""

import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    r2_score, mean_absolute_error, mean_squared_error,
    accuracy_score, f1_score, confusion_matrix, precision_recall_fscore_support
)
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier

# Create directories
os.makedirs('artifacts', exist_ok=True)
os.makedirs('app/static/figures', exist_ok=True)

def load_and_prepare_data():
    """Load and prepare the dataset"""
    print("Loading dataset...")
    csv_path = 'dataset/Credit_Prediction (3).csv'
    df = pd.read_csv(csv_path)
    
    # Fix: Drop fully-empty columns
    df = df.dropna(axis=1, how='all')
    df = df.loc[:, ~df.columns.duplicated()]  # remove duplicate-named cols if any
    
    print(f"Dataset shape: {df.shape}")
    return df

def train_regression_pipeline(df):
    """Train regression pipeline for credit limit prediction"""
    print("\n=== Training Regression Pipeline ===")
    
    # Prepare data
    X = df.drop(columns=['Credit_Limit'])
    y = df['Credit_Limit']
    
    # Define numeric and categorical features
    num = X.select_dtypes(include=[np.number]).columns.tolist()
    cat = [c for c in X.columns if c not in num]
    
    print(f"Numeric features: {len(num)}")
    print(f"Categorical features: {len(cat)}")
    
    # Create preprocessing pipeline
    pre = ColumnTransformer([
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='median')), 
            ('scaler', StandardScaler())
        ]), num),
        ('cat', Pipeline([
            ('imputer', SimpleImputer(strategy='most_frequent')), 
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ]), cat)
    ])
    
    # Train/test split
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.20, random_state=42)
    print(f'Train size: {Xtr.shape}, Test size: {Xte.shape}')
    
    # Define models
    models = {
        'LinearRegression': LinearRegression(),
        'RandomForestRegressor': RandomForestRegressor(
            n_estimators=300, max_depth=20, min_samples_split=5, 
            min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
        ),
        'GradientBoostingRegressor': GradientBoostingRegressor(random_state=42)
    }
    
    # Train and compare models
    rows = []
    best_r2 = -1e9
    best_name = None
    best_pipe = None
    best_pred = None
    
    for name, est in models.items():
        print(f"Training {name}...")
        pipe = Pipeline([('preprocess', pre), ('regressor', est)]).fit(Xtr, ytr)
        
        # Test predictions & metrics
        pred_te = pipe.predict(Xte)
        r2_te = r2_score(yte, pred_te)
        mae_te = mean_absolute_error(yte, pred_te)
        rmse_te = float(np.sqrt(mean_squared_error(yte, pred_te)))
        
        # Train predictions & metrics
        pred_tr = pipe.predict(Xtr)
        r2_tr = r2_score(ytr, pred_tr)
        mae_tr = mean_absolute_error(ytr, pred_tr)
        rmse_tr = float(np.sqrt(mean_squared_error(ytr, pred_tr)))
        
        rows.append({
            'model': name,
            'R2_train': r2_tr, 'MAE_train': mae_tr, 'RMSE_train': rmse_tr,
            'R2_test': r2_te, 'MAE_test': mae_te, 'RMSE_test': rmse_te
        })
        
        if r2_te > best_r2:
            best_r2, best_name, best_pipe, best_pred = r2_te, name, pipe, pred_te
    
    # Create comparison DataFrame
    reg_compare = pd.DataFrame(rows).sort_values('R2_test', ascending=False).round(4)
    print("\nRegression Model Comparison:")
    print(reg_compare)
    
    # Save comparison results
    reg_compare.to_csv('artifacts/model_compare_regression_train_test.csv', index=False)
    
    # Save best pipeline
    joblib.dump(best_pipe, 'artifacts/best_regression_pipeline.joblib')
    print(f"\nBest regression model: {best_name} (R² = {best_r2:.4f})")
    
    # Create final summary
    summary = reg_compare.iloc[0:1].copy()
    summary.rename(columns={'model': 'BestModel'}, inplace=True)
    summary.to_csv('artifacts/final_regression_summary_train_test.csv', index=False)
    
    return best_pipe, best_name, Xte, yte, best_pred

def train_classification_pipeline(df):
    """Train classification pipeline for credit tier prediction"""
    print("\n=== Training Classification Pipeline ===")
    
    # Create tertile labels (balanced classes)
    y = pd.qcut(df['Credit_Limit'], q=3, labels=['Low', 'Med', 'High'])
    X = df.drop(columns=['Credit_Limit'])
    labels = np.array(['Low', 'Med', 'High'])
    
    # Define numeric and categorical features
    num = X.select_dtypes(include=[np.number]).columns.tolist()
    cat = [c for c in X.columns if c not in num]
    
    print(f"Numeric features: {len(num)}")
    print(f"Categorical features: {len(cat)}")
    
    # Create preprocessing pipeline
    pre = ColumnTransformer([
        ('num', Pipeline([
            ('imputer', SimpleImputer(strategy='median')), 
            ('scaler', StandardScaler())
        ]), num),
        ('cat', Pipeline([
            ('imputer', SimpleImputer(strategy='most_frequent')), 
            ('onehot', OneHotEncoder(handle_unknown='ignore'))
        ]), cat)
    ])
    
    # Train/test split
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)
    print(f'Train size: {Xtr.shape}, Test size: {Xte.shape}')
    
    # Define models
    models = {
        'LogisticRegression': LogisticRegression(max_iter=200),
        'RandomForestClassifier': RandomForestClassifier(
            n_estimators=300, max_depth=20, min_samples_split=5, 
            min_samples_leaf=2, max_features='sqrt', random_state=42, n_jobs=-1
        ),
        'GradientBoostingClassifier': GradientBoostingClassifier(random_state=42)
    }
    
    # Train and compare models
    rows = []
    best_f1 = -1e9
    best_name = None
    best_pipe = None
    best_pred = None
    best_prob = None
    
    for name, est in models.items():
        print(f"Training {name}...")
        pipe = Pipeline([('preprocess', pre), ('classifier', est)]).fit(Xtr, ytr)
        
        # Test metrics
        pred_te = pipe.predict(Xte)
        prob_te = pipe.predict_proba(Xte) if hasattr(pipe.named_steps['classifier'], 'predict_proba') else None
        acc_te = accuracy_score(yte, pred_te)
        f1m_te = f1_score(yte, pred_te, average='macro')
        
        # Train metrics
        pred_tr = pipe.predict(Xtr)
        acc_tr = accuracy_score(ytr, pred_tr)
        f1m_tr = f1_score(ytr, pred_tr, average='macro')
        
        rows.append({
            'model': name,
            'Accuracy_train': acc_tr, 'F1_macro_train': f1m_tr,
            'Accuracy_test': acc_te, 'F1_macro_test': f1m_te
        })
        
        if f1m_te > best_f1:
            best_f1, best_name, best_pipe, best_pred, best_prob = f1m_te, name, pipe, pred_te, prob_te
    
    # Create comparison DataFrame
    cls_compare = pd.DataFrame(rows).sort_values('F1_macro_test', ascending=False).round(4)
    print("\nClassification Model Comparison:")
    print(cls_compare)
    
    # Save comparison results
    cls_compare.to_csv('artifacts/model_compare_classification_train_test.csv', index=False)
    
    # Save best pipeline
    joblib.dump(best_pipe, 'artifacts/best_classification_pipeline.joblib')
    print(f"\nBest classification model: {best_name} (F1-macro = {best_f1:.4f})")
    
    # Create final summary
    summary = cls_compare.iloc[0:1].copy()
    summary.rename(columns={'model': 'BestModel'}, inplace=True)
    summary.to_csv('artifacts/final_classification_summary_train_test.csv', index=False)
    
    return best_pipe, best_name, Xte, yte, best_pred, best_prob, labels

def main():
    """Main training function"""
    print("Starting Credit Prediction Pipeline Training...")
    print(f"NumPy version: {np.__version__}")
    print(f"Pandas version: {pd.__version__}")
    
    # Load data
    df = load_and_prepare_data()
    
    # Train regression pipeline
    reg_pipe, reg_name, Xte_reg, yte_reg, pred_reg = train_regression_pipeline(df)
    
    # Train classification pipeline
    cls_pipe, cls_name, Xte_cls, yte_cls, pred_cls, prob_cls, labels = train_classification_pipeline(df)
    
    print("\n=== Training Complete ===")
    print(f"Regression pipeline saved: artifacts/best_regression_pipeline.joblib")
    print(f"Classification pipeline saved: artifacts/best_classification_pipeline.joblib")
    print(f"Metrics saved: artifacts/final_*_summary_train_test.csv")
    
    # Test loading the pipelines
    print("\nTesting pipeline loading...")
    try:
        loaded_reg = joblib.load('artifacts/best_regression_pipeline.joblib')
        loaded_cls = joblib.load('artifacts/best_classification_pipeline.joblib')
        print("✅ Both pipelines loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading pipelines: {e}")

if __name__ == "__main__":
    main()
