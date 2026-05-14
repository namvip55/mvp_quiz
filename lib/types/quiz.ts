export type ParsedOption = {
  text: string;
  is_correct: boolean;
};

export type ParsedQuestion = {
  question_number: number;
  question: string;
  options: ParsedOption[];
};

export type ParsedQuizPayload = ParsedQuestion[];

export type ExamRow = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export type QuestionRow = {
  id: string;
  exam_id: string;
  question_number: number;
  content: string;
  sort_order: number;
};

export type OptionRow = {
  id: string;
  question_id: string;
  content: string;
  is_correct: boolean;
  sort_order: number;
};
