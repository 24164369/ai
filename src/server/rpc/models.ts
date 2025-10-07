import { os } from "@orpc/server";

export const models = os.handler(async () => {
  // Return hardcoded Gemini models for OpenAI-compatible endpoint
  return [
    {
      label: "Gemini 2.0 Flash Experimental",
      value: "gemini-2.0-flash-exp",
    },
    {
      label: "Gemini 1.5 Pro",
      value: "gemini-1.5-pro",
    },
    {
      label: "Gemini 1.5 Flash",
      value: "gemini-1.5-flash",
    },
    {
      label: "Gemini 1.5 Flash-8B",
      value: "gemini-1.5-flash-8b",
    },
  ];
});
