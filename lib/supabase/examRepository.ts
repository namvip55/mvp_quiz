import { getSupabaseClient } from "@/lib/supabase/client";
import { ExamRow } from "@/lib/types/quiz";

export async function listExams(): Promise<ExamRow[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("exams")
    .select("id,title,description,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function getExamDetail(examId: string) {
  const client = getSupabaseClient();

  const { data: examData, error: examError } = await client
    .from("exams")
    .select("id,title,description")
    .eq("id", examId)
    .single();

  if (examError || !examData) {
    throw new Error(examError?.message || "Không tìm thấy đề thi.");
  }

  const { data: questions, error: questionError } = await client
    .from("questions")
    .select("id,question_number,content,sort_order")
    .eq("exam_id", examId)
    .order("sort_order", { ascending: true });

  if (questionError) {
    throw new Error(questionError.message);
  }

  const questionIds = (questions ?? []).map((question) => question.id);

  const { data: options, error: optionError } = await client
    .from("options")
    .select("id,question_id,content,is_correct,sort_order")
    .in("question_id", questionIds.length ? questionIds : ["00000000-0000-0000-0000-000000000000"])
    .order("sort_order", { ascending: true });

  if (optionError) {
    throw new Error(optionError.message);
  }

  const optionsByQuestion = new Map<
    string,
    Array<{ id: string; content: string; is_correct: boolean; sort_order: number }>
  >();

  for (const option of options ?? []) {
    const current = optionsByQuestion.get(option.question_id) || [];
    current.push({
      id: option.id,
      content: option.content,
      is_correct: option.is_correct,
      sort_order: option.sort_order,
    });
    optionsByQuestion.set(option.question_id, current);
  }

  return {
    id: examData.id,
    title: examData.title,
    description: examData.description,
    questions: (questions ?? []).map((question) => ({
      id: question.id,
      question_number: question.question_number,
      content: question.content,
      sort_order: question.sort_order,
      options: optionsByQuestion.get(question.id) || [],
    })),
  };
}
