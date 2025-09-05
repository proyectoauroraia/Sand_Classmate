

export type AnalysisResult = {
  courseName: string;
  subjectArea: string;
  summary: string;
  keyConcepts: string[];
  
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

  // Fields from the new async flow
  tokens?: number;
  promptVersion?: string;
}

export type GeneratedMaterials = {
  powerpointPresentation: string; // This will now represent the markdown content for the preview
  workGuide: string;
  exampleTests: string;
  interactiveReviewPdf: string;
};

// Represents a row in the new `analyses` table
export type AnalysisHistoryItem = {
    id: string;
    owner_id: string;
    file_key: string;
    status: 'queued' | 'processing' | 'done' | 'error';
    summary?: {
      summary: string;
      topics: string[];
      learningOutcomes: string[];
    } | null,
    tokens?: number | null;
    prompt_version?: string | null;
    created_at: string;
    // Helper fields to be populated by client
    courseName?: string; 
    subjectArea?: string;
};


// Old history item, to be deprecated
export type HistoryItem = {
    id: string;
    courseName: string;
    subjectArea: string;
    date: string;
    status: 'Completado' | 'Procesando' | 'Fallido';
    analysis: AnalysisResult;
};

export type UserProfile = {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    institutions?: string[];
    premium?: boolean;
    premium_advanced?: boolean;
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
    installments_number: number;
    installments_amount?: number;
    error_message?: string;
};

