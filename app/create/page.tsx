"use client";

import { useMemo, useState } from "react";
import { extractDocxAsHtmlText } from "@/lib/parser/docxExtractor";
import { parseQuizFromText } from "@/lib/parser/quizParser";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ParsedQuizPayload } from "@/lib/types/quiz";

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
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lưu đề thi thất bại.";
      setSaveStatus({ type: "error", message });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Tạo đề thi</h1>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold">Thông tin đề</h2>

          <label className="mt-4 block text-sm font-medium">Tiêu đề</label>
          <input
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Đề thi Hóa học lớp 12"
          />

          <label className="mt-4 block text-sm font-medium">Mô tả</label>
          <textarea
            className="mt-1 min-h-28 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-zinc-500"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Mô tả ngắn..."
          />

          <label className="mt-4 block text-sm font-medium">Upload DOCX</label>
          <input
            type="file"
            accept=".docx"
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          />

          <p className="mt-4 text-xs text-zinc-500">Fallback: nếu DOCX không đọc đúng màu, dán text/HTML vào ô bên dưới.</p>

          <label className="mt-3 block text-sm font-medium">Nội dung text/HTML</label>
          <textarea
            className="mt-1 min-h-56 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm outline-none focus:border-zinc-500"
            value={rawInput}
            onChange={(event) => setRawInput(event.target.value)}
            placeholder="Câu 1\nNội dung câu hỏi\n[A] đáp án 1\n[B] <font color='red'>đáp án đúng</font>"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              onClick={handleParsePreview}
              disabled={isParsing}
            >
              {isParsing ? "Đang parse..." : "Parse preview"}
            </button>
            <button
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              onClick={handleSaveExam}
              disabled={isSaving}
            >
              {isSaving ? "Đang lưu..." : "Lưu đề thi"}
            </button>
          </div>

          {parseError && <p className="mt-3 text-sm text-red-600">{parseError}</p>}
          {saveStatus.type === "error" && <p className="mt-3 text-sm text-red-600">{saveStatus.message}</p>}
          {saveStatus.type === "success" && <p className="mt-3 text-sm text-emerald-600">{saveStatus.message}</p>}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4">
          <h2 className="text-lg font-semibold">JSON preview</h2>
          <pre className="mt-4 max-h-[680px] overflow-auto rounded-lg bg-zinc-950 p-4 text-xs text-zinc-100">
            {preview.length ? previewJson : "[]"}
          </pre>
        </section>
      </div>
    </div>
  );
}
