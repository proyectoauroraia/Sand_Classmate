
export type AnalysisResult = {
  summary?: string;
  keyConcepts?: string[];
  subjectArea: string;
  weeks?: number | string;
  
  courseStructure?: {
    title: string;
    learningObjectives: string[];
  }[];
  
  assessments?: {
    type: string;
    description: string;
  }[];

  bibliography?: {
    mentioned: string[];
    recommended: string[];
  };

  enrichedContent: {
    externalLinks: {
      title: string;
      url: string;
      summary: string;
    }[];
    youtubeVideos: {
      title: string;
      videoId: string;
      summary: string;
    }[];
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
