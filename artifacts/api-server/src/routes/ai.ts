import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const aiRouter = Router();

aiRouter.post("/process", async (req, res) => {
  try {
    const { noteText, subject } = req.body as { noteText?: string; subject?: string };

    if (!noteText || typeof noteText !== "string" || noteText.trim().length === 0) {
      res.status(400).json({ error: "noteText is required" });
      return;
    }

    const systemPrompt = `You are an expert AI study assistant. Analyze study notes and generate comprehensive, topic-wise learning materials.

Return a valid JSON object with EXACTLY this structure (raw JSON, no markdown):
{
  "title": "Brief descriptive title (max 6 words)",
  "topics": [
    {
      "title": "Detected chapter/topic heading",
      "summary": "2-3 sentence focused summary of this topic",
      "keyPoints": ["3-5 important points for this topic"],
      "definitions": ["Term: its definition"],
      "formulas": ["Formula or equation if present, else empty array"]
    }
  ],
  "summary": {
    "bullets": ["5-8 key bullet points from all notes"],
    "keywords": ["5-8 important keywords"],
    "examNotes": "Exam-focused 2-3 paragraph summary",
    "simpleExplanation": "Plain-language explanation for a beginner"
  },
  "mcqs": [
    {
      "question": "Question testing understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Why this answer is correct",
      "difficulty": "easy"
    }
  ],
  "flashcards": [
    {
      "question": "Term or concept on front of card",
      "answer": "Definition or explanation on back"
    }
  ],
  "vivaQuestions": [
    {
      "question": "Oral examination question",
      "answer": "Comprehensive answer",
      "level": "beginner"
    }
  ]
}

Requirements:
- Detect 2-5 topics/chapters from the notes. If notes have no clear sections, treat the whole as 1 topic.
- Generate 8-10 MCQs: 3 easy, 4 medium, 2-3 hard
- Generate 8-10 flashcards covering key terms and concepts
- Generate 8-10 viva questions: 3 beginner, 4 intermediate, 2-3 advanced
- Return ONLY the raw JSON object, nothing else`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Subject: ${subject || "General"}\n\nNotes:\n${noteText}` },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      req.log.error({ content }, "Failed to parse AI JSON response");
      res.status(500).json({ error: "Failed to parse AI response. Please try again." });
      return;
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Error processing notes with AI");
    res.status(500).json({ error: "Failed to process notes. Please try again." });
  }
});

export default aiRouter;
