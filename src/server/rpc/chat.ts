import { os, streamToEventIterator, type } from "@orpc/server";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

if (!process.env.OPENAI_BASE_URL) {
  throw new Error("OPENAI_BASE_URL is not set");
}

// Use OpenAI-compatible provider for all APIs
const openai = createOpenAICompatible({
  name: "openai-compatible",
  baseURL: process.env.OPENAI_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

const chatHandler = os
  .input(type<{ chatId: string; messages: UIMessage[]; model: string }>())
  .handler(({ input }) => {
    console.log("Received messages:", JSON.stringify(input.messages, null, 2));
    try {
      const model = openai(input.model);

      console.log("Using OpenAI Compatible provider");
      console.log("Model:", input.model);

      const result = streamText({
        model,
        messages: convertToModelMessages(input.messages),
      });

      return streamToEventIterator(result.toUIMessageStream());
    } catch (error) {
      console.error("Error in chat handler:", error);
      throw error;
    }
  });

export const chat = {
  chat: chatHandler,
};
