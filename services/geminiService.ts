import { GoogleGenAI } from "@google/genai";
import type { GroundingChunk } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStudyGuide = async (articleUrl: string): Promise<{ guide: string; sources: GroundingChunk[] }> => {
  try {
    const prompt = `Analyze the content from the URL "${articleUrl}" and generate a comprehensive study guide in the style of a dense, multi-column cheat sheet. Identify the main topics or domains within the content. For each topic, create a distinct section.

Formatting Rules:
1. Start each topic section with a level 2 Markdown heading (e.g., "## Topic Title").
2. Within each section, use bullet points (-), bold text (**term**), and nested lists to summarize key concepts, definitions, and important information.
3. Separate each major topic section with the exact separator: "|||---|||" on a new line.

After all topic sections, add a final section for a mind map.
4. Use the separator "|||---MINDMAP---|||" before the mind map section.
5. The mind map should be a hierarchical summary of the key topics and sub-topics, formatted as a Markdown nested list. Start with a central topic (e.g., "# Main Subject") and branch out using nested bullet points.

The final output should be a single block of markdown text. Emulate the concise and structured format of a professional certification cheat sheet.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const guide = response.text;
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingChunk[] = groundingMetadata?.groundingChunks?.filter(chunk => chunk.web) || [];
    
    if (!guide) {
        throw new Error("The AI returned an empty response. The URL might be inaccessible or contain no readable content.");
    }
    
    return { guide, sources };

  } catch (error) {
    console.error("Error generating study guide:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("Invalid API Key. Please check your environment configuration.");
    }
    throw new Error("Failed to communicate with the AI model.");
  }
};