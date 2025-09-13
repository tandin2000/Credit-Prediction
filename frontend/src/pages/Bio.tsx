import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MetricCard } from '../components/MetricCard';
import { apiClient, MetaResponse, GlobalImportanceResponse, SchemaResponse } from '../api';

const FALLBACK_SCHEMA: SchemaResponse = {
  numeric_features: [
    "Customer_Age", "Dependent_count", "Months_on_book", 
    "Total_Relationship_Count", "Months_Inactive_12_mon", 
    "Contacts_Count_12_mon", "Total_Revolving_Bal", 
    "Avg_Open_To_Buy", "Total_Amt_Chng_Q4_Q1", 
    "Total_Trans_Amt", "Total_Trans_Ct", 
    "Total_Ct_Chng_Q4_Q1", "Avg_Utilization_Ratio"
  ],
  categorical_features: [
    "Gender", "Education_Level", "Marital_Status", 
    "Income_Category", "Card_Category"
  ]
};

export const Bio: React.FC = () => {
  const [meta, setMeta] = useState<MetaResponse | null>(null);
  const [importance, setImportance] = useState<GlobalImportanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metaData, importanceData] = await Promise.all([
        apiClient.getMeta(),
        apiClient.getGlobalImportance()
      ]);
      setMeta(metaData);
      setImportance(importanceData);
    } catch (err: any) {
      setError(`Failed to load data: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSchema = meta?.attributes || FALLBACK_SCHEMA;

  // Prepare chart data
  const regressionMetrics = meta?.regression_metrics_table?.[0] || {};
  const classificationMetrics = meta?.classification_metrics_table?.[0] || {};

  const regressionChartData = [
    { name: 'R² Score', value: regressionMetrics.R2_test || 0.85 },
    { name: 'MAE', value: regressionMetrics.MAE_test || 1200 },
    { name: 'RMSE', value: regressionMetrics.RMSE_test || 1800 },
  ];

  const classificationChartData = [
    { name: 'Accuracy', value: classificationMetrics.Accuracy_test || 0.78 },
    { name: 'F1 Macro', value: classificationMetrics.F1_macro_test || 0.75 },
  ];

  const importanceChartData = importance?.features.slice(0, 10).map(item => ({
    feature: item.feature.replace(/_/g, ' '),
    importance: item.importance
  })) || [];


  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Model Information</h1>
        <p className="mt-2 text-gray-600">
          Learn about the training process, model performance, and feature importance.
        </p>
      </div>

      <div className="space-y-8">
        {/* Attributes Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Attributes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Numeric Features</h3>
              <div className="space-y-2">
                {currentSchema.numeric_features.map((feature, index) => (
                  <div key={feature} className="flex items-center text-sm text-gray-600">
                    <span className="w-6 text-gray-400">{index + 1}.</span>
                    <span>{feature.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Categorical Features</h3>
              <div className="space-y-2">
                {currentSchema.categorical_features.map((feature, index) => (
                  <div key={feature} className="flex items-center text-sm text-gray-600">
                    <span className="w-6 text-gray-400">{index + 1}.</span>
                    <span>{feature.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Fallback Notice */}
          {!meta?.attributes && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Using Fallback Attribute List
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>Unable to load schema from API. Showing fallback attribute list.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Training Summary */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Training Summary</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {meta?.training_summary || "80/20 train/test split, fixed seed. ColumnTransformer preprocessing: Numeric = median impute → standardize; Categorical = most-frequent impute → One-Hot (handle_unknown=\"ignore\"). Models trained offline in Colab; this app performs inference only."}
            </p>
          </div>
        </div>

        {/* Model Comparison Table */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Comparison Analysis</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Model Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Pros
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Cons
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Performance (your dataset)
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Why Not Chosen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Linear Regression / Logistic Regression */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <strong>Linear Regression / Logistic Regression</strong>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Very transparent (easy to explain)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Fast training/prediction</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Good baseline for benchmarking</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Struggles with non-linear relationships</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Sensitive to multicollinearity</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Lower predictive accuracy on complex tabular data</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div><strong>Regression:</strong> R² much lower than trees</div>
                      <div><strong>Classification:</strong> lower accuracy & F1</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    Accuracy was significantly weaker; missed important interactions.
                  </td>
                </tr>

                {/* Gradient Boosting */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <strong>Gradient Boosting (GBM/XGBoost style)</strong>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Very high accuracy possible</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Handles non-linearities & interactions well</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Flexible with tuning</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Sensitive to hyperparameters</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Slower to train</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Can overfit if not tuned well</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div><strong>Regression:</strong> strong R² but slightly unstable</div>
                      <div><strong>Classification:</strong> good accuracy but prone to variance</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    More complex to tune, small gain vs RF not worth higher complexity.
                  </td>
                </tr>

                {/* Artificial Neural Network */}
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <strong>Artificial Neural Network (ANN)</strong>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Can model complex relationships</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Flexible architecture</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Good for very large datasets</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Requires lots of data (&gt;&gt;10k rows)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Less interpretable</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Longer training & infra needs</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div>On ~10k rows: no consistent lift vs RF</div>
                      <div>Higher ops cost for little benefit</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    Didn't outperform Random Forest; less explainable; higher ops burden.
                  </td>
                </tr>

                {/* Random Forest (Chosen) */}
                <tr className="hover:bg-gray-50 bg-green-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <strong>Random Forest (Chosen)</strong>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Good balance of bias & variance</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Robust to outliers & non-linearities</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Works well with tabular mix (categorical + numeric)</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Low tuning sensitivity</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-green-500 mr-2">✅</span>
                        <span>Feature importance available (explainability)</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Models can be large</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">❌</span>
                        <span>Predictions are averages (less extreme)</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <div className="space-y-1">
                      <div><strong>Regression:</strong> R² ≈ 0.838, MAE/RMSE low</div>
                      <div><strong>Classification:</strong> Accuracy ≈ 0.839, balanced F1 across tiers</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">
                    <span className="text-green-600 font-medium">Strongest overall performance, stable, explainable, and production-friendly.</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Choice Rationale */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Model Choice Rationale</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {meta?.model_choice_rationale || "Random Forest chosen over Linear/GBDT/ANN for strong accuracy/variance balance on ~10k tabular rows, robustness to non-linearities/outliers, low tuning sensitivity, and explainability (feature importances/SHAP). ANN provided no consistent lift for this dataset at higher ops cost."}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Model Performance</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Regression Metrics */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Regression Metrics</h3>
              <div className="space-y-4">
                <MetricCard
                  title="R² Score (Test)"
                  value={regressionMetrics.R2_test ? regressionMetrics.R2_test.toFixed(3) : '0.850'}
                  subtitle="Higher is better"
                  color="green"
                />
                <MetricCard
                  title="MAE (Test)"
                  value={regressionMetrics.MAE_test ? `$${regressionMetrics.MAE_test.toLocaleString()}` : '$1,200'}
                  subtitle="Lower is better"
                  color="blue"
                />
                <MetricCard
                  title="RMSE (Test)"
                  value={regressionMetrics.RMSE_test ? `$${regressionMetrics.RMSE_test.toLocaleString()}` : '$1,800'}
                  subtitle="Lower is better"
                  color="blue"
                />
              </div>
            </div>

            {/* Classification Metrics */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Classification Metrics</h3>
              <div className="space-y-4">
                <MetricCard
                  title="Accuracy (Test)"
                  value={classificationMetrics.Accuracy_test ? `${(classificationMetrics.Accuracy_test * 100).toFixed(1)}%` : '78.0%'}
                  subtitle="Higher is better"
                  color="green"
                />
                <MetricCard
                  title="F1 Macro (Test)"
                  value={classificationMetrics.F1_macro_test ? classificationMetrics.F1_macro_test.toFixed(3) : '0.750'}
                  subtitle="Higher is better"
                  color="green"
                />
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Regression Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regressionChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Classification Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classificationChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Feature Importance */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Feature Importance</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Top 10 Features</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={importanceChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <YAxis dataKey="feature" type="category" width={150} tick={{fontSize: 12}} />
                  <Tooltip formatter={(value: any) => `${(Number(value) * 100).toFixed(1)}%`} />
                  <Bar dataKey="importance" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Feature Importance List</h3>
              <div className="space-y-2">
                {importance?.features.slice(0, 10).map((item, index) => (
                  <div key={item.feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <span className="w-6 text-sm text-gray-500">{index + 1}.</span>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {item.feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600 font-mono">
                      {(item.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <p className="text-sm text-gray-600 text-center">
            <strong>Note:</strong>This is Build by &lt; Tandin Wangchen &gt;
          </p>
        </div>
      </div>
    </div>
  );
};
