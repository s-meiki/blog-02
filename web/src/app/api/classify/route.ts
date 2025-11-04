import { NextRequest, NextResponse } from "next/server";

type ClassificationRequest = {
  text?: string;
  candidateLabels?: string[];
  multiLabel?: boolean;
  topK?: number;
  task?: "classification" | "keywords";
};

type ZeroShotResponse = {
  labels: string[];
  scores: number[];
  sequence: string;
} | {
  error: string;
  estimated_time?: number;
};

type KeyphraseResult = {
  score: number;
  value: string;
}[];

const ZERO_SHOT_MODEL = process.env.HF_ZERO_SHOT_MODEL ?? "joeddav/xlm-roberta-large-xnli";
const KEYWORD_MODEL = process.env.HF_KEYWORD_MODEL ?? "ml6team/keyphrase-extraction-kbir-inspec";
const HF_API_BASE = "https://api-inference.huggingface.co/models";

const missingTokenMessage =
  "Hugging Face API token is not configured. Set HF_API_TOKEN in your environment variables.";

const createHeaders = () => {
  if (!process.env.HF_API_TOKEN) {
    throw new Error(missingTokenMessage);
  }

  return {
    Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
    "Content-Type": "application/json",
  };
};

const handleHfError = async (response: Response) => {
  let message = `Hugging Face request failed with status ${response.status}`;
  try {
    const json = await response.json();
    if (json?.error) {
      message = json.error;
    }
    return NextResponse.json(
      {
        error: message,
        status: response.status,
      },
      { status: response.status },
    );
  } catch {
    return NextResponse.json({ error: message }, { status: response.status });
  }
};

const runZeroShotClassification = async (payload: {
  text: string;
  candidateLabels?: string[];
  multiLabel: boolean;
  topK?: number;
}) => {
  const { text, candidateLabels, multiLabel, topK } = payload;

  if (!candidateLabels || candidateLabels.length === 0) {
    return NextResponse.json(
      { error: "candidateLabels must be provided for classification." },
      { status: 400 },
    );
  }

  const response = await fetch(`${HF_API_BASE}/${ZERO_SHOT_MODEL}`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({
      inputs: text,
      parameters: {
        candidate_labels: candidateLabels,
        multi_label: multiLabel,
      },
    }),
  });

  if (!response.ok) {
    return handleHfError(response);
  }

  const data = (await response.json()) as ZeroShotResponse;
  if ("error" in data) {
    return NextResponse.json({ error: data.error }, { status: 502 });
  }

  const cappedTopK = topK && topK > 0 ? topK : data.labels.length;
  const results = data.labels.slice(0, cappedTopK).map((label, index) => ({
    label,
    score: data.scores[index],
  }));

  return NextResponse.json({ results });
};

const runKeywordExtraction = async (payload: { text: string; topK?: number }) => {
  const { text, topK } = payload;
  const response = await fetch(`${HF_API_BASE}/${KEYWORD_MODEL}`, {
    method: "POST",
    headers: createHeaders(),
    body: JSON.stringify({
      inputs: text,
      parameters: topK ? { top_k: topK } : undefined,
    }),
  });

  if (!response.ok) {
    return handleHfError(response);
  }

  const data = (await response.json()) as KeyphraseResult;
  const uniqueValues = new Set<string>();
  const results = data
    .filter((item) => {
      const normalized = item.value.trim().toLowerCase();
      if (!normalized || uniqueValues.has(normalized)) return false;
      uniqueValues.add(normalized);
      return true;
    })
    .map((item) => ({
      label: item.value.trim(),
      score: item.score,
    }))
    .slice(0, topK && topK > 0 ? topK : undefined);

  return NextResponse.json({ results });
};

export async function POST(request: NextRequest) {
  let body: ClassificationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (!process.env.HF_API_TOKEN) {
    return NextResponse.json({ error: missingTokenMessage }, { status: 500 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "text is required." }, { status: 400 });
  }

  const task = body.task ?? "classification";

  if (task === "keywords") {
    return runKeywordExtraction({ text, topK: body.topK });
  }

  return runZeroShotClassification({
    text,
    candidateLabels: body.candidateLabels,
    multiLabel: body.multiLabel ?? true,
    topK: body.topK,
  });
}
