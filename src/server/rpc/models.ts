import { os } from "@orpc/server";

export const models = os.handler(async () => {
  try {
    // Check if using Google Gemini API
    const isGemini = process.env.OPENAI_BASE_URL?.includes('generativelanguage.googleapis.com');
    
    if (isGemini) {
      // For Google Gemini, return predefined models
      return [
        { name: "Gemini 2.0 Flash (Experimental)", value: "gemini-2.0-flash-exp" },
        { name: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
        { name: "Gemini 1.5 Flash-8B", value: "gemini-1.5-flash-8b" },
        { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
      ];
    }

    // For other OpenAI-compatible APIs, fetch models dynamically
    const response = await fetch(`${process.env.OPENAI_BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch models: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as { data: { id: string }[] };

    return data.data.map((model) => ({
      name: model.id,
      value: model.id,
    }));
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
});
