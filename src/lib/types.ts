export type AnalysisResult = {
  summary: string;
  keyConcepts: string[];
  scientificContext: string;
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
    status: 'Completed' | 'Processing' | 'Failed';
};
