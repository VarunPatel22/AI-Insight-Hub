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

    const systemPrompt = `You are an expert study assistant AI. Analyze the provided study notes and generate comprehensive learning materials.

Return a valid JSON object with exactly this structure (no markdown, no code blocks, just raw JSON):
{
  "title": "Brief descriptive title for these notes (max 6 words)",
  "summary": {
    "bullets": ["5-8 concise key bullet points capturing the most important ideas"],
    "keywords": ["5-8 important keywords or concepts from the notes"],
    "examNotes": "A focused 2-3 paragraph exam-ready summary highlighting the most testable content",
    "simpleExplanation": "A clear simple explanation as if teaching someone with no background in this subject"
  },
  "mcqs": [
    {
      "question": "Clear, specific question testing understanding",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief explanation of why this answer is correct",
      "difficulty": "easy"
    }
  ],
  "flashcards": [
    {
      "question": "Concise question or term for the front of the card",
      "answer": "Clear, memorable answer for the back of the card"
    }
  ],
  "vivaQuestions": [
    {
      "question": "In-depth oral examination question",
      "answer": "Comprehensive answer a student should give",
      "level": "beginner"
    }
  ]
}

Requirements:
- Generate exactly 8-10 MCQs with a mix of easy (3), medium (4), hard (2-3) difficulties
- Generate exactly 8-10 flashcards covering key terms, formulas, and concepts
- Generate exactly 8-10 viva questions with beginner (3), intermediate (4), advanced (2-3) levels
- Ensure all content is directly derived from the provided notes
- Return ONLY the JSON object, no other text`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Subject: ${subject || "General"}\n\nNotes to process:\n${noteText}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";

    let parsed: unknown;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : content;
      parsed = JSON.parse(jsonStr);
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
