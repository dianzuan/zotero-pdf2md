import type {
  IOcrBackend,
  BackendConfig,
  ConversionResult,
} from "./base.js";

const API_URL = "https://open.bigmodel.cn/api/paas/v4/layout_parsing";

/** Convert a Uint8Array to a base64 string */
function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/** Parse md_results which can be a string or a list of objects */
function parseMdResults(mdResults: unknown): string {
  if (typeof mdResults === "string") return mdResults;
  if (Array.isArray(mdResults)) {
    const parts: string[] = [];
    for (const item of mdResults) {
      if (typeof item === "string") {
        parts.push(item);
      } else if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        if (typeof obj.content === "string") parts.push(obj.content);
        else if (typeof obj.md === "string") parts.push(obj.md);
      }
    }
    return parts.join("\n\n");
  }
  return "";
}

export const glmOcrBackend: IOcrBackend = {
  name: "glm-ocr",
  label: "GLM-OCR (智谱)",

  async convert(
    pdfPath: string,
    config: BackendConfig,
  ): Promise<ConversionResult> {
    if (!config.apiKey) {
      throw new Error("GLM-OCR: API key is required");
    }

    // Read the PDF file as binary
    const bytes = await IOUtils.read(pdfPath);
    const base64 = uint8ToBase64(new Uint8Array(bytes));
    const dataUri = `data:application/pdf;base64,${base64}`;

    // Call the API
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "glm-ocr",
        file: dataUri,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GLM-OCR API error ${response.status}: ${text}`);
    }

    const result = (await response.json()) as {
      md_results?: unknown;
      data_info?: { num_pages?: number };
    };

    const markdown = parseMdResults(result.md_results);
    const pageCount = result.data_info?.num_pages;

    return { markdown, pageCount };
  },
};
