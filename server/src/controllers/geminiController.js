import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

// FIX: Remove the 'apiEndpoint' option.
// The SDK will automatically determine the correct API version (v1)
// for the 'gemini-1.5-flash' model if your package is up-to-date.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, {
  baseUrl: "https://generativelanguage.googleapis.com/v1", // Explicitly use v1
});

export const improveTradeNotes = async (req, res) => {
  try {
    const { notes, reflection } = req.body;
    if (!notes && !reflection) {
      return res.status(400).json({ error: "Notes or reflection is required" });
    }

    // You can simplify this by passing the model name directly to generateContent
    // or keep the getGenerativeModel structure. It's correct as is.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const polishText = async (label, text) => {
      if (!text?.trim()) return "";
      const prompt = `Please rewrite the following ${label} in clear, concise, professional English:\n\n"${text}"`;
      const result = await model.generateContent(prompt);
      // It's good practice to get the text from the candidates
      return result.response.text.trim();
    };

    const [improvedNotes, improvedReflection] = await Promise.all([
      polishText("entry notes", notes),
      polishText("post-trade reflection", reflection),
    ]);

    res.json({ notes: improvedNotes, reflection: improvedReflection });
  } catch (error) {
    console.error("Error improving trade notes:", error);
    res.status(500).json({ error: "Failed to improve notes/reflection" });
  }
};
