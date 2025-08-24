

export type AnalysisResult = {
  summary?: string;
  keyConcepts?: string[];
  subjectArea: string;
  
  coherenceAnalysis?: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];

  courseStructure?: {
    title: string;
    learningObjectives: string[];
    classes: {
        topic: string;
    }[];
  }[];
  
  assessments?: {
    type: string;
    description: string;
    feedback: string;
  }[];

  bibliography?: {
    mentioned: string[];
    recommended: string[];
  };
}

export type GeneratedMaterials = {
  powerpointPresentation: string;
  workGuide: string;
  exampleTests: string;
  interactiveReviewPdf: string;
};

export type HistoryItem = {
    id: string;
    fileName: string;
    date: string;
    status: 'Completado' | 'Procesando' | 'Fallido';
};

export type UserProfile = {
    id: string;
    bio?: string;
    cvUrl?: string;
    publications?: {
        title: string;
        url: string;
    }[];
};

export type CheckoutSessionResult = {
    url: string;
};
