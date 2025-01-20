// app/types/research/ai.ts

export interface AIModel {
    id: number;
    name: string;
    version: string;
    description: string;
    model_type: ModelType;
    training_data: TrainingData;
    performance_metrics: PerformanceMetrics;
    is_active: boolean;
    last_trained: string;
    created_at: string;
    updated_at: string;
  }
  
  export interface TrainingData {
    dataset_size: number;
    features: string[];
    target_variable: string;
    validation_split: number;
    preprocessing_steps: string[];
  }
  
  export interface PerformanceMetrics {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1_score?: number;
    auc_roc?: number;
    mae?: number;
    mse?: number;
    rmse?: number;
    custom_metrics?: Record<string, number>;
  }
  
  export type ModelType = 
    | 'DIAGNOSTIC'
    | 'PREDICTIVE'
    | 'CLASSIFICATION'
    | 'REGRESSION'
    | 'NLP';