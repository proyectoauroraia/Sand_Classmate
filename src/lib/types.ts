

export type AnalysisResult = {
  summary: string;
  keyConcepts: string[];
  subjectArea: string;
  
  coherenceAnalysis: string;
  strengths: string[];
  recommendations: string[];

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
    mentioned?: string[];
    recommended?: string[];
  };

  linksOfInterest: { title: string; url: string }[];
  reviewVideos: { title: string; url: string }[];
  activeMethodologies: { name: string; description: string }[];
}

export type GeneratedMaterials = {
  powerpointPresentation: string;
  workGuide: string;
  exampleTests: string;
  interactiveReviewPdf: string;
};

export type HistoryItem = {
    id: string;
    fileName:string;
    date: string;
    status: 'Completado' | 'Procesando' | 'Fallido';
    analysis: AnalysisResult;
};

export type UserProfile = {
    id: string;
    fullName?: string;
    role?: string;
    city?: string;
    bio?: string;
    cvUrl?: string;
};

export type CheckoutSessionResult = {
    token: string;
    url: string;
};

export type WebpayCommitResult = {
    vci?: string;
    amount: number;
    status: 'AUTHORIZED' | 'FAILED' | 'REJECTED' | 'CANCELED' | 'INITIALIZED';
    buy_order: string;
    session_id: string;
    card_detail: {
        card_number: string;
    };
    accounting_date: string;
    transaction_date: string;
    authorization_code?: string;
    payment_type_code: string;
    response_code: number;
    installments_number: number;
    installments_amount?: number;
    error_message?: string;
};
