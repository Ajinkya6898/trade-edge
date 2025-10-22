import Note from "../models/Note.js";
import sanitizeHtml from "sanitize-html";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * @desc Improve a single note (entry + reflection)
 * @route POST /api/notes/improve
 * @access Private
 */
export const improveNote = async (req, res) => {
  try {
    const { notes, reflection } = req.body;
    const userId = req.user.userId;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "AI API key not configured" });
    }

    if (!notes && !reflection) {
      return res.status(400).json({ message: "Notes or reflection required" });
    }

    const combinedText = `
### Entry Notes:
${notes || "N/A"}

### Reflection:
${reflection || "N/A"}
`;

    const prompt = `
You are a professional trading coach AI.
Analyze the following trading notes and rewrite them clearly, concisely, and insightfully.

### Instructions:
- Output HTML only with two sections:
  <h2>Improved Notes</h2> – a polished version of the user's notes and reflection.
  <h3>Insights & Suggestions</h3> – 3–5 actionable insights for improving future trades or journaling.
- Focus on clarity, self-awareness, and learning.
- No scripts or unsafe tags.

### Notes to improve:
${combinedText}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log("naruto", genAI);
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash-latest",
    });
    console.log("model", model);
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 30000)
      ),
    ]);

    let rawHtml = "";
    if (result?.response?.candidates?.length) {
      rawHtml = result.response.candidates
        .map((c) => c.content?.parts?.map((p) => p.text).join("") || "")
        .join("\n");
    } else if (typeof result.response?.text === "function") {
      rawHtml = result.response.text();
    }

    if (!rawHtml?.trim()) {
      throw new Error("Empty response from AI service");
    }

    // Sanitize HTML output
    const cleanHtml = sanitizeHtml(rawHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "h1",
        "h2",
        "h3",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ]),
      allowedAttributes: {
        a: ["href", "target"],
        td: ["align"],
        th: ["align"],
      },
      allowedSchemes: ["http", "https", "mailto"],
    });

    // Save note to database
    const savedNote = await Note.create({
      user: userId,
      notes,
      reflection,
    });

    res.status(200).json({ improvedHtml: cleanHtml, savedNote });
  } catch (error) {
    console.error("AI Note Improvement Error:", error);
    res.status(500).json({
      message: "Failed to improve note",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * @desc Summarize all notes for a user
 * @route GET /api/notes/summary
 * @access Private
 */
export const summarizeNotes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({ user: userId }).lean();

    if (!notes.length) {
      return res.status(200).json({
        summary: "No notes found. Add some notes for AI analysis.",
      });
    }

    const formattedNotes = notes
      .map(
        (n, i) => `
Note ${i + 1}:
Entry: ${n.notes || "N/A"}
Reflection: ${n.reflection || "N/A"}`
      )
      .join("\n\n");

    const prompt = `
You are a trading psychology AI coach.
Analyze the following journal notes and summarize the trader's mindset, patterns, and progress.

### Output format:
<h2>Notes Summary Report</h2>

<h3>1. Common Themes</h3>
<ul><li>Highlight repeated patterns or emotions in notes</li></ul>

<h3>2. Strengths</h3>
<ul><li>List good habits or mental improvements</li></ul>

<h3>3. Improvement Areas</h3>
<ul><li>Practical tips to improve journaling and decision making</li></ul>

<h3>4. Summary</h3>
<p>Write a 2–3 line overall assessment of the trader's current mindset.</p>

### Notes:
${formattedNotes}
`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 40000)
      ),
    ]);

    let rawHtml = "";
    if (result?.response?.candidates?.length) {
      rawHtml = result.response.candidates
        .map((c) => c.content?.parts?.map((p) => p.text).join("") || "")
        .join("\n");
    } else if (typeof result.response?.text === "function") {
      rawHtml = result.response.text();
    }

    if (!rawHtml?.trim()) throw new Error("Empty response from AI");

    const cleanHtml = sanitizeHtml(rawHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "h1",
        "h2",
        "h3",
        "table",
        "thead",
        "tbody",
        "tr",
        "th",
        "td",
      ]),
      allowedAttributes: {
        a: ["href", "target"],
        td: ["align"],
        th: ["align"],
      },
      allowedSchemes: ["http", "https", "mailto"],
    });

    res.status(200).json({ summaryHtml: cleanHtml });
  } catch (error) {
    console.error("AI Notes Summary Error:", error);
    res.status(500).json({
      message: "Failed to summarize notes",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
