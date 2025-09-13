import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

// For production deployment, you'll need to set VITE_API_BASE to your Railway backend URL
// Example: https://your-backend-app.railway.app

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface SchemaResponse {
  numeric_features: string[];
  categorical_features: string[];
}

export interface RegressionResponse {
  model_name: string;
  predicted_credit_limit: number;
  runtime_ms: number;
}

export interface ClassificationResponse {
  model_name: string;
  predicted_tier: string;
  proba: Record<string, number>;
  runtime_ms: number;
}

export interface MetaResponse {
  regression_metrics_table?: Array<Record<string, any>>;
  classification_metrics_table?: Array<Record<string, any>>;
  training_summary: string;
  model_choice_rationale: string;
  attributes: SchemaResponse;
}

export interface GlobalImportanceResponse {
  features: Array<{ feature: string; importance: number }>;
}

export const apiClient = {
  async getSchema(): Promise<SchemaResponse> {
    const response = await api.get('/schema');
    return response.data;
  },

  async getMeta(): Promise<MetaResponse> {
    const response = await api.get('/meta');
    return response.data;
  },

  async getGlobalImportance(): Promise<GlobalImportanceResponse> {
    const response = await api.get('/global-importance');
    return response.data;
  },

  async predictRegression(payload: Record<string, any>): Promise<RegressionResponse> {
    const response = await api.post('/predict/regression', { payload });
    return response.data;
  },

  async predictClassification(payload: Record<string, any>): Promise<ClassificationResponse> {
    const response = await api.post('/predict/classification', { payload });
    return response.data;
  },

  async batchScore(file: File, mode: 'regression' | 'classification'): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/predict/batch?mode=${mode}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });
    
    return response.data;
  },
};
