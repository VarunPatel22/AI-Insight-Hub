import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const pyqRouter = Router();

pyqRouter.post("/analyze-pyq", async (req, res) => {
  try {
    const { paperText, subject, fileName } = req.body as {
      paperText?: string;
      subject?: string;
      fileName?: string;
    };

    if (!paperText || typeof paperText !== "string" || paperText.trim().length < 30) {
      res.status(400).json({ error: "paperText is required (minimum 30 characters)" });
      return;
    }

    const systemPrompt = `You are an expert university exam analyst AI. Analyze the provided previous year question papers and extract deep insights.

Return a valid JSON object with EXACTLY this structure (raw JSON, no markdown, no code blocks):
{
  "repeatedQuestions": [
    {
      "question": "The exact or paraphrased repeated question",
      "count": 3,
      "avgMarks": 8,
      "importance": "very_important",
      "topic": "Topic/chapter this belongs to"
    }
  ],
  "importantTopics": [
    {
      "topic": "Topic name",
      "repetitions": 5,
      "avgMarks": 10,
      "importance": "Very Important"
    }
  ],
  "examPredictions": [
    "Predicted question that is likely to appear based on patterns",
    "Another highly probable upcoming question"
  ],
  "topQuestions": [
    {
      "question": "Important question text",
      "type": "long",
      "marks": 10
    }
  ]
}

Analysis rules:
- importance levels: "very_important" (appears 4+ times), "high_probability" (3 times), "most_repeated" (2 times), "frequently_asked" (1-2 times)
- Detect question repetitions intelligently — same concept asked differently counts as repeated
- Sort repeatedQuestions by count descending (most repeated first)
- Sort importantTopics by repetitions descending
- Generate 5-8 realistic exam predictions based on trends
- Extract 8-12 top questions covering long (10+ marks), short (5 marks), definition (2-5 marks) types
- Return ONLY the raw JSON object, nothing else`;

    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Subject: ${subject || "General"}\nFile: ${fileName || "Exam Paper"}\n\nPaper Content:\n${paperText}`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      req.log.error({ content }, "Failed to parse PYQ AI JSON response");
      res.status(500).json({ error: "Failed to parse AI response. Please try again." });
      return;
    }

    res.json(parsed);
  } catch (err) {
    req.log.error({ err }, "Error analyzing PYQ with AI");
    res.status(500).json({ error: "Failed to analyze paper. Please try again." });
  }
});

export default pyqRouter;
