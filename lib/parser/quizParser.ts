import { ParsedQuestion, ParsedQuizPayload } from "@/lib/types/quiz";

const QUESTION_SPLIT_REGEX = /(?:^|\n)\s*Câu\s+(\d+)\s*\n/giu;

function decodeHtml(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtmlTags(input: string): string {
  return decodeHtml(input.replace(/<[^>]*>/g, "")).trim();
}

function normalizeOptionLine(line: string): string {
  return line.replace(/^\s*(?:\[[^\]]+\]|[A-Da-d][\).])\s*/u, "").trim();
}

function containsRedTag(rawLine: string): boolean {
  return (
    /<font[^>]*color\s*=\s*["']?red["']?[^>]*>/i.test(rawLine) ||
    /style\s*=\s*["'][^"']*color\s*:\s*red[^"']*["']/i.test(rawLine)
  );
}

function isRedMarked(rawLine: string): boolean {
  const lower = rawLine.toLowerCase();
  return (
    containsRedTag(rawLine) ||
    /\x1b\[[0-9;]*31m/.test(rawLine) ||
    /^\s*\[red\]/i.test(rawLine) ||
    /^\s*\(red\)/i.test(rawLine) ||
    lower.includes("ansi-red")
  );
}

function htmlToAnnotatedLines(input: string): string[] {
  const prepared = input
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n")
    .replace(/<\/\s*div\s*>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<div[^>]*>/gi, "");

  return prepared
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      if (containsRedTag(line)) {
        return `[RED] ${line}`;
      }
      return line;
    });
}

function parseQuestionBlock(questionNumber: number, block: string): ParsedQuestion {
  const rawLines = block
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rawLines.length < 2) {
    throw new Error(`Câu ${questionNumber} không đủ dữ liệu câu hỏi và đáp án.`);
  }

  const questionText = stripHtmlTags(rawLines[0]);
  const optionLines = rawLines.slice(1);

  const options = optionLines.map((line) => {
    const cleanLine = line.replace(/^\[RED\]\s*/i, "");
    const text = stripHtmlTags(normalizeOptionLine(cleanLine));
    return {
      text,
      is_correct: /^\[RED\]/i.test(line) || isRedMarked(cleanLine),
    };
  });

  const correctCount = options.filter((opt) => opt.is_correct).length;
  if (correctCount !== 1) {
    throw new Error(`Câu ${questionNumber} phải có đúng 1 đáp án đúng (hiện tại: ${correctCount}).`);
  }

  return {
    question_number: questionNumber,
    question: questionText,
    options,
  };
}

export function parseQuizFromText(input: string): ParsedQuizPayload {
  if (!input.trim()) {
    throw new Error("Nội dung đầu vào rỗng.");
  }

  const normalized = htmlToAnnotatedLines(input).join("\n").replace(/\r\n/g, "\n").trim();

  const matches: Array<{ number: number; start: number; end: number }> = [];
  const regex = new RegExp(QUESTION_SPLIT_REGEX);

  for (;;) {
    const m = regex.exec(normalized);
    if (!m) break;

    matches.push({
      number: Number(m[1]),
      start: m.index,
      end: regex.lastIndex,
    });
  }

  if (matches.length === 0) {
    throw new Error("Không tìm thấy mẫu 'Câu <số>' trong nội dung.");
  }

  const result: ParsedQuestion[] = [];

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const next = matches[i + 1];
    const blockStart = current.end;
    const blockEnd = next ? next.start : normalized.length;
    const block = normalized.slice(blockStart, blockEnd).trim();

    result.push(parseQuestionBlock(current.number, block));
  }

  return result;
}
