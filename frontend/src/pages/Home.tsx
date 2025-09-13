import React, { useState, useEffect } from 'react';
import { Field } from '../components/Field';
import { MetricCard } from '../components/MetricCard';
import { apiClient, SchemaResponse, RegressionResponse, ClassificationResponse } from '../api';

interface FormData {
  [key: string]: string | number;
}

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

// Field descriptions and examples
const FIELD_DESCRIPTIONS: Record<string, { description: string; example: string }> = {
  // Numeric fields
  "Customer_Age": {
    description: "Age of the customer in years",
    example: "35"
  },
  "Dependent_count": {
    description: "Number of dependents (children, spouse, etc.)",
    example: "2"
  },
  "Months_on_book": {
    description: "Number of months the customer has been with the bank",
    example: "36"
  },
  "Total_Relationship_Count": {
    description: "Total number of products/services the customer has with the bank",
    example: "4"
  },
  "Months_Inactive_12_mon": {
    description: "Number of months the customer was inactive in the last 12 months",
    example: "2"
  },
  "Contacts_Count_12_mon": {
    description: "Number of contacts made by the customer in the last 12 months",
    example: "3"
  },
  "Total_Revolving_Bal": {
    description: "Total revolving balance on credit cards",
    example: "1250.50"
  },
  "Avg_Open_To_Buy": {
    description: "Average open to buy credit line amount",
    example: "8750.00"
  },
  "Total_Amt_Chng_Q4_Q1": {
    description: "Change in transaction amount from Q4 to Q1",
    example: "0.15"
  },
  "Total_Trans_Amt": {
    description: "Total transaction amount in the last 12 months",
    example: "4500.75"
  },
  "Total_Trans_Ct": {
    description: "Total number of transactions in the last 12 months",
    example: "65"
  },
  "Total_Ct_Chng_Q4_Q1": {
    description: "Change in transaction count from Q4 to Q1",
    example: "0.25"
  },
  "Avg_Utilization_Ratio": {
    description: "Average credit card utilization ratio",
    example: "0.35"
  },
  
  // Categorical fields
  "Gender": {
    description: "Customer's gender",
    example: "M or F"
  },
  "Education_Level": {
    description: "Highest level of education completed",
    example: "Graduate, High School, College, etc."
  },
  "Marital_Status": {
    description: "Current marital status",
    example: "Married, Single, Divorced, etc."
  },
  "Income_Category": {
    description: "Customer's income category",
    example: "Less than $40K, $40K-$60K, $60K-$80K, etc."
  },
  "Card_Category": {
    description: "Type of credit card held",
    example: "Blue, Gold, Platinum, etc."
  }
};

export const Home: React.FC = () => {
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [regressionResult, setRegressionResult] = useState<RegressionResponse | null>(null);
  const [classificationResult, setClassificationResult] = useState<ClassificationResponse | null>(null);
  const [loading, setLoading] = useState({ regression: false, classification: false });
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'json'>('form');
  const [jsonInput, setJsonInput] = useState('');

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      const schemaData = await apiClient.getSchema();
      setSchema(schemaData);
      setUseFallback(false);
      
      // Initialize form data with empty values
      const initialData: FormData = {};
      [...schemaData.numeric_features, ...schemaData.categorical_features].forEach(field => {
        initialData[field] = schemaData.numeric_features.includes(field) ? 0 : '';
      });
      setFormData(initialData);
      setJsonInput(JSON.stringify(initialData, null, 2));
    } catch (err) {
      console.error('Failed to load schema:', err);
      setSchema(FALLBACK_SCHEMA);
      setUseFallback(true);
      
      // Initialize form data with fallback schema
      const initialData: FormData = {};
      [...FALLBACK_SCHEMA.numeric_features, ...FALLBACK_SCHEMA.categorical_features].forEach(field => {
        initialData[field] = FALLBACK_SCHEMA.numeric_features.includes(field) ? 0 : '';
      });
      setFormData(initialData);
      setJsonInput(JSON.stringify(initialData, null, 2));
    }
  };

  const handleFieldChange = (name: string, value: string | number) => {
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    setJsonInput(JSON.stringify(newFormData, null, 2));
  };

  const handleJsonChange = (json: string) => {
    setJsonInput(json);
    try {
      const parsed = JSON.parse(json);
      setFormData(parsed);
    } catch (err) {
      // Invalid JSON, don't update formData
    }
  };

  const handleJsonSubmit = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormData(parsed);
      setError(null);
    } catch (err) {
      setError('Invalid JSON format. Please check your input.');
    }
  };

  const handleRegressionSubmit = async () => {
    setLoading(prev => ({ ...prev, regression: true }));
    setError(null);
    
    try {
      const result = await apiClient.predictRegression(formData);
      setRegressionResult(result);
    } catch (err: any) {
      setError(`Regression prediction failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, regression: false }));
    }
  };

  const handleClassificationSubmit = async () => {
    setLoading(prev => ({ ...prev, classification: true }));
    setError(null);
    
    try {
      const result = await apiClient.predictClassification(formData);
      setClassificationResult(result);
    } catch (err: any) {
      setError(`Classification prediction failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, classification: false }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currentSchema = schema || FALLBACK_SCHEMA;

  // Check if all fields are empty or zero
  const isAllEmpty = () => {
    const numericEmpty = currentSchema.numeric_features.every(field => 
      formData[field] === 0 || formData[field] === '' || formData[field] === null || formData[field] === undefined
    );
    const categoricalEmpty = currentSchema.categorical_features.every(field => 
      formData[field] === '' || formData[field] === null || formData[field] === undefined
    );
    return numericEmpty && categoricalEmpty;
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Credit Prediction</h1>
          <p className="text-indigo-100 text-lg">
            Predict credit limits and customer tiers using advanced machine learning models
          </p>
        </div>
      </div>

      {/* Status Messages */}
      {useFallback && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Using Fallback Schema</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Unable to load schema from API. Using fallback attribute list.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
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
      )}

      {/* Empty Fields Warning */}
      {isAllEmpty() && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Empty Input Detected</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">
                  <strong>All fields are empty or zero.</strong> When you submit this data, the model will:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Treat zeros as valid values and scale them relative to training data</li>
                  <li>Ignore empty categorical fields (due to OneHotEncoder settings)</li>
                  <li>Fall back to predicting near the average credit limit (~$20K-$25K)</li>
                  <li>This doesn't mean a "0 year old with 0 dependents" should get credit!</li>
                </ul>
                <p className="mt-2 font-medium">
                  💡 <strong>Tip:</strong> Fill in realistic values for more meaningful predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="xl:col-span-1">
          <div className="bg-white shadow-xl rounded-xl p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Customer Data</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const resetData: Record<string, any> = {};
                    currentSchema.numeric_features.forEach(field => {
                      resetData[field] = 0;
                    });
                    currentSchema.categorical_features.forEach(field => {
                      resetData[field] = '';
                    });
                    setFormData(resetData);
                    setJsonInput(JSON.stringify(resetData, null, 2));
                  }}
                  className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  title="Reset all fields to default values"
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('form')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'form'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Form
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'json'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>
            </div>

            {activeTab === 'form' ? (
              <div className="space-y-6">
                {/* Numeric Features */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Numeric Features
                  </h3>
                  <div className="space-y-3">
                    {currentSchema.numeric_features.map(field => {
                      const fieldInfo = FIELD_DESCRIPTIONS[field];
                      return (
                        <Field
                          key={field}
                          label={field.replace(/_/g, ' ')}
                          name={field}
                          type="number"
                          value={formData[field] as number || 0}
                          onChange={handleFieldChange}
                          description={fieldInfo?.description}
                          example={fieldInfo?.example}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Categorical Features */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Categorical Features
                  </h3>
                  <div className="space-y-3">
                    {currentSchema.categorical_features.map(field => {
                      const fieldInfo = FIELD_DESCRIPTIONS[field];
                      return (
                        <Field
                          key={field}
                          label={field.replace(/_/g, ' ')}
                          name={field}
                          type="text"
                          value={formData[field] as string || ''}
                          onChange={handleFieldChange}
                          description={fieldInfo?.description}
                          example={fieldInfo?.example}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON Input
                  </label>
                  <textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
                    placeholder="Paste or edit JSON data here..."
                  />
                </div>
                <button
                  onClick={handleJsonSubmit}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Apply JSON Data
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        <div className="xl:col-span-2 space-y-6">
          {/* Regression Prediction */}
          <div className="bg-white shadow-xl rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Credit Limit Prediction</h2>
                <p className="text-gray-600">Predict the credit limit for this customer</p>
              </div>
            </div>
            
            <button
              onClick={handleRegressionSubmit}
              disabled={loading.regression}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {loading.regression ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Predicting...
                </div>
              ) : (
                'Predict Credit Limit'
              )}
            </button>
            
            {regressionResult && (
              <div className="mt-6">
                <MetricCard
                  title="Predicted Credit Limit"
                  value={formatCurrency(regressionResult.predicted_credit_limit)}
                  subtitle={`Model: ${regressionResult.model_name} | Runtime: ${regressionResult.runtime_ms.toFixed(2)}ms`}
                  color="green"
                />
              </div>
            )}
          </div>

          {/* Classification Prediction */}
          <div className="bg-white shadow-xl rounded-xl p-6">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Customer Tier Prediction</h2>
                <p className="text-gray-600">Classify the customer into Low/Medium/High tier</p>
              </div>
            </div>
            
            <button
              onClick={handleClassificationSubmit}
              disabled={loading.classification}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {loading.classification ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Predicting...
                </div>
              ) : (
                'Predict Customer Tier'
              )}
            </button>
            
            {classificationResult && (
              <div className="mt-6 space-y-4">
                <MetricCard
                  title="Predicted Tier"
                  value={classificationResult.predicted_tier}
                  subtitle={`Model: ${classificationResult.model_name} | Runtime: ${classificationResult.runtime_ms.toFixed(2)}ms`}
                  color="blue"
                />
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Probability Distribution</h3>
                  <div className="space-y-2">
                    {Object.entries(classificationResult.proba).map(([tier, prob]) => (
                      <div key={tier} className="flex items-center">
                        <div className="w-20 text-sm text-gray-600 font-medium">{tier}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3 mx-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${prob * 100}%` }}
                          />
                        </div>
                        <div className="w-12 text-sm text-gray-600 text-right font-mono">
                          {(prob * 100).toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* JSON Output */}
          <div className="bg-white shadow-xl rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Request Data</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="text-sm text-gray-700 overflow-x-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};