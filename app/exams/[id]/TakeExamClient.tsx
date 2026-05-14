"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type QuestionOption = {
  id: string;
  content: string;
  is_correct: boolean;
  sort_order: number;
};

type QuestionItem = {
  id: string;
  question_number: number;
  content: string;
  sort_order: number;
  options: QuestionOption[];
};

type ExamDetail = {
  id: string;
  title: string;
  description: string | null;
  questions: QuestionItem[];
};

export default function TakeExamClient({ exam }: { exam: ExamDetail }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    if (!submitted) return null;

    const total = exam.questions.length;
    let correct = 0;

    for (const question of exam.questions) {
      const selectedOptionId = selectedAnswers[question.id];
      const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);
      if (selectedOption?.is_correct) correct += 1;
    }

    return { correct, total, percent: total === 0 ? 0 : Math.round((correct / total) * 100) };
  }, [exam.questions, selectedAnswers, submitted]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <p className="mt-1 text-zinc-600">{exam.description || "Không có mô tả"}</p>
      </div>

      <div className="space-y-4">
        {exam.questions.map((question) => (
          <section key={question.id} className="rounded-xl border border-zinc-200 bg-white p-4">
            <h2 className="font-semibold">
              Câu {question.question_number}: {question.content}
            </h2>

            <div className="mt-3 space-y-2">
              {question.options.map((option) => {
                const checked = selectedAnswers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 ${
                      checked ? "border-zinc-900 bg-zinc-100" : "border-zinc-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      checked={checked}
                      onChange={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [question.id]: option.id,
                        }))
                      }
                    />
                    <span>{option.content}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => setSubmitted(true)}
        >
          Nộp bài
        </button>
        <button
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          onClick={() => {
            setSelectedAnswers({});
            setSubmitted(false);
          }}
        >
          Làm lại
        </button>
        <Link href="/exams" className="text-sm underline">
          Danh sách đề
        </Link>
      </div>

      {score && (
        <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
          Kết quả: {score.correct}/{score.total} câu đúng ({score.percent}%)
        </div>
      )}
    </div>
  );
}
