"use client";

import LoadingLink from "@/components/navigation/LoadingLink";
import { useMemo, useState } from "react";
import { extractDocxAsHtmlText } from "@/lib/parser/docxExtractor";
import { parseQuizFromText } from "@/lib/parser/quizParser";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ParsedQuizPayload } from "@/lib/types/quiz";
import AiLoading from "@/components/loading/AiLoading";
import { withMinimumDelay } from "@/lib/ui/withMinimumDelay";

type SaveStatus =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export default function CreateExamPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ParsedQuizPayload>([]);
  const [parseError, setParseError] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ type: "idle" });

  const previewJson = useMemo(() => JSON.stringify(preview, null, 2), [preview]);

  async function buildInputSource(): Promise<string> {
    if (selectedFile) {
      return extractDocxAsHtmlText(selectedFile);
    }
    if (rawInput.trim()) {
      return rawInput;
    }
    throw new Error("Vui lòng upload file DOCX hoặc dán nội dung text/HTML.");
  }

  async function handleParsePreview() {
    setIsParsing(true);
    setParseError("");
    setSaveStatus({ type: "idle" });

    try {
      const source = await buildInputSource();
      const parsed = parseQuizFromText(source);
      setPreview(parsed);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể parse dữ liệu.";
      setPreview([]);
      setParseError(message);
    } finally {
      setIsParsing(false);
    }
  }

  async function handleSaveExam() {
    if (!title.trim()) {
      setSaveStatus({ type: "error", message: "Vui lòng nhập tiêu đề đề thi." });
      return;
    }

    if (preview.length === 0) {
      setSaveStatus({ type: "error", message: "Bạn cần parse preview trước khi lưu." });
      return;
    }

    setIsSaving(true);
    setSaveStatus({ type: "idle" });

    try {
      await withMinimumDelay(
        (async () => {
          const client = getSupabaseClient();

          const { data: exam, error: examError } = await client
            .from("exams")
            .insert({ title: title.trim(), description: description.trim() || null })
            .select("id")
            .single();

          if (examError || !exam) {
            throw new Error(examError?.message || "Không tạo được đề thi.");
          }

          for (let index = 0; index < preview.length; index += 1) {
            const item = preview[index];

            const { data: question, error: questionError } = await client
              .from("questions")
              .insert({
                exam_id: exam.id,
                question_number: item.question_number,
                content: item.question,
                sort_order: index + 1,
              })
              .select("id")
              .single();

            if (questionError || !question) {
              throw new Error(questionError?.message || `Không tạo được câu ${item.question_number}.`);
            }

            const optionPayload = item.options.map((option, optionIndex) => ({
              question_id: question.id,
              content: option.text,
              is_correct: option.is_correct,
              sort_order: optionIndex + 1,
            }));

            const { error: optionsError } = await client.from("options").insert(optionPayload);

            if (optionsError) {
              throw new Error(optionsError.message || `Không tạo được đáp án câu ${item.question_number}.`);
            }
          }

          setSaveStatus({ type: "success", message: "Đã lưu đề thi thành công." });
          setTitle("");
          setDescription("");
          setRawInput("");
          setSelectedFile(null);
          setPreview([]);
          setParseError("");
        })(),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lưu đề thi thất bại.";
      setSaveStatus({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="ui-page ui-page-decor-create max-w-6xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <LoadingLink href="/" className="ui-btn-secondary text-sm" label="Đang về trang chủ...">
          ← Back
        </LoadingLink>
        <h1 className="ui-heading-title">Tạo đề thi</h1>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="ui-card relative p-5">
          {isSaving && <AiLoading label="Đang lưu đề thi..." />}
          <h2 className="text-lg font-medium text-ink">Thông tin đề</h2>

          <label className="mt-4 block text-sm font-medium text-body-strong">Tiêu đề</label>
          <input
            className="ui-input mt-1"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Đề thi Hóa học lớp 12"
          />

          <label className="mt-4 block text-sm font-medium text-body-strong">Mô tả</label>
          <textarea
            className="ui-textarea mt-1 min-h-28"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Mô tả ngắn..."
          />

          <label className="mt-4 block text-sm font-medium text-body-strong">Upload DOCX</label>
          <input
            type="file"
            accept=".docx"
            className="ui-file mt-1 block text-sm"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />

          <p className="mt-4 text-xs ui-muted">Fallback: nếu DOCX không đọc đúng màu, dán text/HTML vào ô bên dưới.</p>

          <label className="mt-3 block text-sm font-medium text-body-strong">Nội dung text/HTML</label>
          <textarea
            className="ui-textarea mt-1 min-h-56 font-mono text-sm"
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            placeholder="Câu 1\nNội dung câu hỏi\n[A] đáp án 1\n[B] <font color='red'>đáp án đúng</font>"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button className="ui-btn-secondary disabled:opacity-60" onClick={handleParsePreview} disabled={isParsing}>
              {isParsing ? "Đang parse..." : "Parse preview"}
            </button>
            <button className="ui-btn-primary disabled:opacity-60" onClick={handleSaveExam} disabled={isSaving}>
              {isSaving ? "Đang lưu..." : "Lưu đề thi"}
            </button>
          </div>

          {parseError && <p className="ui-alert-error mt-4">{parseError}</p>}
          {saveStatus.type === "error" && <p className="ui-alert-error mt-4">{saveStatus.message}</p>}
          {saveStatus.type === "success" && <p className="ui-alert-success mt-4">{saveStatus.message}</p>}
        </section>

        <section className="ui-card p-5">
          <h2 className="text-lg font-medium text-ink">JSON preview</h2>
          <pre className="ui-code-block mt-4 max-h-[680px] overflow-auto p-4 text-xs">{preview.length ? previewJson : "[]"}</pre>
        </section>
      </div>
    </div>
  );
}
