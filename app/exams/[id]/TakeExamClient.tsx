"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

export default function TakeExamClient({
  exam,
  mode,
}: {
  exam: ExamDetail;
  mode: "exam" | "practice";
}) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmedAnswers, setConfirmedAnswers] = useState<Record<string, string>>({});
  const successAudioRef = useRef<HTMLAudioElement | null>(null);

  const isPracticeMode = mode === "practice";
  const questionsCount = exam.questions.length;
  const currentQuestion = exam.questions[currentIndex] ?? null;

  useEffect(() => {
    if (!isPracticeMode) return;
    successAudioRef.current = new Audio("/ting_ting.mp3");
  }, [isPracticeMode]);

  const playSuccessSound = () => {
    const audio = successAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  };

  const confirmCurrentAnswer = useCallback(() => {
    if (!currentQuestion) return;
    const selectedOptionId = selectedAnswers[currentQuestion.id];
    if (!selectedOptionId) return;

    setConfirmedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedOptionId,
    }));

    const selectedOption = currentQuestion.options.find((opt) => opt.id === selectedOptionId);
    if (selectedOption?.is_correct) {
      playSuccessSound();
    }
  }, [currentQuestion, selectedAnswers]);

  useEffect(() => {
    if (!isPracticeMode) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (!currentQuestion) return;

      const digitMap: Record<string, number> = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Digit4: 3,
        Numpad1: 0,
        Numpad2: 1,
        Numpad3: 2,
        Numpad4: 3,
      };

      const optionIndex = digitMap[event.code];
      if (optionIndex !== undefined) {
        const targetOption = currentQuestion.options[optionIndex];
        if (!targetOption) return;
        event.preventDefault();
        setSelectedAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: targetOption.id,
        }));
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        if (confirmedAnswers[currentQuestion.id]) {
          setCurrentIndex((prev) => Math.min(questionsCount - 1, prev + 1));
        } else {
          confirmCurrentAnswer();
        }
        return;
      }

      if (event.code === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
        return;
      }

      if (event.code === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex((prev) => Math.min(questionsCount - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [confirmCurrentAnswer, confirmedAnswers, isPracticeMode, currentQuestion, questionsCount]);

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

  if (isPracticeMode) {
    return (
      <div className="ui-page max-w-5xl">
        <div className="mb-4">
          <Link href="/exams" className="ui-btn-secondary text-sm">
            ← Back
          </Link>
        </div>

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="ui-heading-title">{exam.title}</h1>
            <p className="mt-1 ui-muted">{exam.description || "Không có mô tả"}</p>
          </div>
          <Link href={`/exams/${exam.id}`} className="ui-link text-sm">
            Chuyển sang mode làm đề
          </Link>
        </div>

        <div className="mb-4 rounded-lg border border-hairline bg-surface-soft p-3 text-sm font-medium text-body-strong">
          Câu {questionsCount === 0 ? 0 : currentIndex + 1} / {questionsCount}
        </div>

        {currentQuestion ? (
          <section className="ui-card p-5">
            <h2 className="text-base font-medium text-ink">
              Câu {currentQuestion.question_number}: {currentQuestion.content}
            </h2>

            <div className="mt-4 space-y-2">
              {currentQuestion.options.map((option, optionIndex) => {
                const checked = selectedAnswers[currentQuestion.id] === option.id;
                const confirmedOptionId = confirmedAnswers[currentQuestion.id];
                const isConfirmedChoice = confirmedOptionId === option.id;
                const showCorrect = Boolean(confirmedOptionId && option.is_correct);

                let className = "ui-selectable";
                if (showCorrect) className = "rounded-lg border border-success/40 bg-success/10";
                if (isConfirmedChoice && !option.is_correct) className = "rounded-lg border border-error/40 bg-error/10";
                if (!confirmedOptionId && checked) className = "ui-selectable-active";

                return (
                  <label key={option.id} className={`flex cursor-pointer items-start gap-2 rounded-lg px-3 py-2 ${className}`}>
                    <input
                      type="radio"
                      name={`practice-question-${currentQuestion.id}`}
                      checked={checked}
                      onChange={() =>
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: option.id,
                        }))
                      }
                    />
                    <span className="text-body-strong">
                      {String.fromCharCode(65 + optionIndex)}. {option.content}
                    </span>
                  </label>
                );
              })}
            </div>

            {confirmedAnswers[currentQuestion.id] && (
              <div
                className={`mt-4 rounded-lg p-3 text-sm font-medium ${
                  currentQuestion.options.find((opt) => opt.id === confirmedAnswers[currentQuestion.id])?.is_correct
                    ? "ui-alert-success"
                    : "ui-alert-error"
                }`}
              >
                {currentQuestion.options.find((opt) => opt.id === confirmedAnswers[currentQuestion.id])?.is_correct
                  ? "Chính xác"
                  : "Chưa đúng"}
              </div>
            )}
          </section>
        ) : (
          <p className="rounded-xl border border-dashed border-hairline p-6 ui-muted">Đề này chưa có câu hỏi.</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            className="ui-btn-secondary"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            Trước
          </button>
          <button
            className="ui-btn-secondary"
            onClick={() => setCurrentIndex((prev) => Math.min(questionsCount - 1, prev + 1))}
            disabled={questionsCount === 0 || currentIndex === questionsCount - 1}
          >
            Tiếp
          </button>
          <button
            className="ui-btn-primary"
            onClick={confirmCurrentAnswer}
            disabled={!currentQuestion || !selectedAnswers[currentQuestion.id]}
          >
            Xác nhận
          </button>
          <button
            className="ui-btn-secondary"
            onClick={() => {
              setSelectedAnswers({});
              setConfirmedAnswers({});
              setCurrentIndex(0);
            }}
          >
            Làm lại
          </button>
          <Link href="/exams" className="ui-link text-sm">
            Danh sách đề
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ui-page max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="ui-heading-title">{exam.title}</h1>
          <p className="mt-1 ui-muted">{exam.description || "Không có mô tả"}</p>
        </div>
        <Link href={`/exams/${exam.id}?mode=practice`} className="ui-link text-sm">
          Chuyển sang mode luyện tập
        </Link>
      </div>

      <div className="space-y-4">
        {exam.questions.map((question) => (
          <section key={question.id} className="ui-card p-5">
            <h2 className="text-base font-medium text-ink">
              Câu {question.question_number}: {question.content}
            </h2>

            <div className="mt-3 space-y-2">
              {question.options.map((option) => {
                const checked = selectedAnswers[question.id] === option.id;
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 ${
                      checked ? "ui-selectable-active" : "ui-selectable"
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
                    <span className="text-body-strong">{option.content}</span>
                  </label>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button className="ui-btn-primary" onClick={() => setSubmitted(true)}>
          Nộp bài
        </button>
        <button
          className="ui-btn-secondary"
          onClick={() => {
            setSelectedAnswers({});
            setSubmitted(false);
          }}
        >
          Làm lại
        </button>
        <Link href="/exams" className="ui-link text-sm">
          Danh sách đề
        </Link>
      </div>

      {score && <div className="ui-alert-success mt-6">Kết quả: {score.correct}/{score.total} câu đúng ({score.percent}%)</div>}
    </div>
  );
}
