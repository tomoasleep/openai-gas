/**
 * @param {string} systemPrompt - The prompt to be used to generate the completion.
 * @param {string} userPrompt - The prompt to be used to generate the completion.
 * @param {string} options - The options to be used to generate the completion.
 * @return {string} The completion result.
 * @customfunction
 */
function OpenAIComplete(
  systemPrompt: string,
  userPrompt: string,
  options?: string
): string {
  const messages: OpenAIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt },
  ];

  const key = `${options || "{}"}:${systemPrompt}:${userPrompt}`;

  return withCache(key, () => {
    const response = callOpenAICompletion(
      messages,
      options?.length ? JSON.parse(options) : {}
    );

    if (!response?.choices?.length) {
      throw new Error(JSON.stringify(response));
    }

    return response.choices[0].message.content;
  });
}

function callOpenAICompletion(
  messages: OpenAIMessage[],
  options: Partial<OpenAIRequestPayload>
): OpenAIResponsePayload {
  const apiKey =
    PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const payload: OpenAIRequestPayload = {
    messages,
    model: "gpt-3.5-turbo-16k",
    temperature: 0,
    ...options,
  };

  const response = UrlFetchApp.fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      // muteHttpExceptions: true,
      method: "post",
      headers,
      payload: JSON.stringify(payload),
    }
  );

  return JSON.parse(response.getContentText()) as OpenAIResponsePayload;
}

type OpenAIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenAIChatChoise = {
  finish_reason: "stop" | "length" | "function_call";
  index: number;
  message: OpenAIMessage;
};

type OpenAIRequestPayload = {
  messages: OpenAIMessage[];
  model:
    | "gpt-4"
    | "gpt-4-0314"
    | "gpt-4-0613"
    | "gpt-4-32k"
    | "gpt-4-32k-0314"
    | "gpt-4-32k-0613"
    | "gpt-3.5-turbo"
    | "gpt-3.5-turbo-16k"
    | "gpt-3.5-turbo-0301"
    | "gpt-3.5-turbo-0613"
    | "gpt-3.5-turbo-16k-0613";
  frequency_penalty?: number | null;
  logit_bias?: Record<string, number> | null;
  max_tokens?: number;
  n?: number | null;
  presence_penalty?: number | null;
  stop?: string | string[] | null;
  temperature?: number | null;
  top_p?: number | null;
  user?: string;
};

type OpenAIUsage = {
  completion_tokens: number;
  prompt_tokens: number;
  total_tokens: number;
};

type OpenAIResponsePayload = {
  id: string;
  choices: OpenAIChatChoise[];
  created: number;
  model: string;
  object: string;
  usage?: OpenAIUsage;
};

function withCache<T>(key: string, fn: () => string): string {
  const md5Key = md5(key);

  const cache = CacheService.getDocumentCache();
  if (!cache) {
    return fn();
  }

  const cachedKey = cache.get(`${key}:${md5Key}`);
  const cachedValue = cache.get(md5Key);

  if (cachedKey && cachedValue && cachedKey === md5Key) {
    return cachedValue;
  }

  const value = fn();

  cache.put(`${key}:${md5Key}`, md5Key);
  cache.put(md5Key, value);

  return value;
}

function md5(value: string): string {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.MD5,
    value,
    Utilities.Charset.UTF_8
  );

  return bytes.reduce((str, byte) => str + (byte + 128).toString(16), "");
}
