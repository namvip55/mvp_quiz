import * as mammoth from "mammoth/mammoth.browser";

export async function extractDocxAsHtmlText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.convertToHtml({ arrayBuffer });
  return value;
}
