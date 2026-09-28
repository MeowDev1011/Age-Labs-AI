export type CreatorState =
  | 'initial'
  | 'image_uploaded'
  | 'transforming'
  | 'result'
  | 'age_selected'
  | 'processing'
  | 'result_ready'
  | 'error';

export type AppView = 'creator' | 'gallery' | 'settings';
export type TransformType = 'regress' | 'progress';

export interface ImageData {
  url: string;
  base64: string;
  mimeType: string;
}

export interface TransformResult {
  image: string | null;
  text: string | null;
}

export interface Creation {
  id: string;
  name: string;
  personName: string;
  originalImage: string;
  transformedImage: string;
  targetAge: number;
  createdAt: number;
  timestamp?: number;
  transformType: TransformType;
  styleId?: string;
  styleName?: string;
  customPrompt?: string;
}