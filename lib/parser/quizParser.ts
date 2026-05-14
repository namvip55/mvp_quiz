import { ParsedQuestion, ParsedQuizPayload } from "@/lib/types/quiz";

const QUESTION_HEADER_REGEX =
  /^\s*Câu\s+(\d+)\s*(?:(?:\[\s*<\s*[A-Za-z0-9]{2}\s*>\s*\])|(?:<\s*[A-Za-z0-9]{2}\s*>))?\s*:?\s*(.*)$/iu;
const QUESTION_HEADER_FALLBACK_REGEX = /^\s*Câu\s+(\d+)\s*(?:\[[^\]]*\])?\s*:?\s*(.*)$/iu;

function parseQuestionHeader(line: string): { number: number; questionText: string } | null {
  const strict = line.match(QUESTION_HEADER_REGEX);
  if (strict) {
    return {
      number: Number(strict[1]),
      questionText: stripHtmlTags(strict[2] || ""),
    };
  }

  const fallback = line.match(QUESTION_HEADER_FALLBACK_REGEX);
  if (fallback) {
    return {
      number: Number(fallback[1]),
      questionText: stripHtmlTags(fallback[2] || ""),
    };
  }

  return null;
}

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
  return line.replace(/^\s*(?:\[<\$>\]|\[[^\]]+\]|[A-Da-d][\).])\s*/u, "").trim();
}

function containsRedTag(rawLine: string): boolean {
  return (
    /<font[^>]*color\s*=\s*["']?red["']?[^>]*>/i.test(rawLine) ||
    /style\s*=\s*["'][^"']*color\s*:\s*red[^"']*["']/i.test(rawLine) ||
    /style\s*=\s*["'][^"']*color\s*:\s*#(?:f00|ff0000)\b[^"']*["']/i.test(rawLine) ||
    /style\s*=\s*["'][^"']*color\s*:\s*rgb\(\s*255\s*,\s*0\s*,\s*0\s*\)[^"']*["']/i.test(rawLine)
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
    .map((line) => (containsRedTag(line) ? `[RED] ${line}` : line));
}

function isOptionLine(line: string): boolean {
  return /^\s*(?:\[<\$>\]|\[[^\]]+\]|[A-Da-d][\).])\s+/u.test(line);
}

function finalizeQuestion(
  questionNumber: number,
  questionText: string,
  optionLines: string[],
): ParsedQuestion {
  const normalizedQuestion = questionText.trim();
  if (!normalizedQuestion) {
    throw new Error(`Câu ${questionNumber} thiếu nội dung câu hỏi.`);
  }

  if (optionLines.length < 2) {
    throw new Error(`Câu ${questionNumber} không đủ đáp án lựa chọn.`);
  }

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
    question: normalizedQuestion,
    options,
  };
}

export function parseQuizFromText(input: string): ParsedQuizPayload {
  if (!input.trim()) {
    throw new Error("Nội dung đầu vào rỗng.");
  }

  const lines = htmlToAnnotatedLines(input);
  if (lines.length === 0) {
    throw new Error("Nội dung đầu vào rỗng.");
  }

  const result: ParsedQuestion[] = [];

  let currentQuestionNumber: number | null = null;
  let currentQuestionText = "";
  let currentOptionLines: string[] = [];

  const flushCurrentQuestion = () => {
    if (currentQuestionNumber === null) return;

    result.push(finalizeQuestion(currentQuestionNumber, currentQuestionText, currentOptionLines));

    currentQuestionNumber = null;
    currentQuestionText = "";
    currentOptionLines = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const parsedHeader = parseQuestionHeader(line);

    if (parsedHeader) {
      flushCurrentQuestion();
      currentQuestionNumber = parsedHeader.number;
      currentQuestionText = parsedHeader.questionText;
      continue;
    }

    if (currentQuestionNumber === null) {
      continue;
    }

    if (isOptionLine(line)) {
      currentOptionLines.push(line);
      continue;
    }

    if (currentOptionLines.length === 0) {
      currentQuestionText = `${currentQuestionText} ${stripHtmlTags(line)}`.trim();
    }
  }

  flushCurrentQuestion();

  if (result.length === 0) {
    throw new Error("Không tìm thấy mẫu 'Câu <số>' trong nội dung.");
  }

  return result;
}
