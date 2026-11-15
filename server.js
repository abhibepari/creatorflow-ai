
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Groq from "groq-sdk";

dotenv.config({ path: ".env.local" });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY missing in .env.local");
  process.exit(1);
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.get("/", (req, res) => {
  res.send("CreatorFlow AI backend is running!");
});

app.post("/api/generate", async (req, res) => {
  try {
    const { content, platform, tone } = req.body;

    if (!content || !platform || !tone) {
      return res.status(400).json({
        error: "Content, platform and tone are required."
      });
    }

    // STEP 1: Generate main content
    const prompt = `
You are CreatorFlow AI, a professional content creation assistant.

Platform: ${platform}
Tone: ${tone}
Creator idea: ${content}

Generate these four sections using exactly these headings:

## 1. Attention-Grabbing Hooks
Write 3 engaging hooks.

## 2. Title Suggestions
Write 3 catchy titles.

## 3. Caption
Write one engaging caption.

## 5. Short Script Outline
Write a script with Intro, Main Content and Outro.

Do not generate a Hashtags section.
Do not skip any of the four sections.
Do not add extra headings.
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: "You are CreatorFlow AI. Follow the exact requested format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_completion_tokens: 1800
    });

    const result =
      completion.choices[0]?.message?.content?.trim() || "";

    if (!result) {
      throw new Error("AI returned an empty main response.");
    }

    // STEP 2: Generate hashtags separately
    const hashtagCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: "You generate relevant social media hashtags. Return hashtags only."
        },
        {
          role: "user",
          content: `
Generate exactly 15 unique and relevant hashtags.

Content idea: ${content}
Platform: ${platform}
Tone: ${tone}

Rules:
- Every hashtag must start with #.
- Return all 15 hashtags on one line.
- Separate hashtags with spaces.
- No heading.
- No explanation.
- No quotation marks.
`
        }
      ],
      temperature: 0.5,
      max_completion_tokens: 300
    });

    const rawHashtags =
      hashtagCompletion.choices[0]?.message?.content || "";

    // Extract actual hashtags from the separate AI response
    const hashtagList = [
      ...new Set(rawHashtags.match(/#[\p{L}\p{N}_]+/gu) || [])
    ].slice(0, 15);

    if (hashtagList.length === 0) {
      throw new Error("AI could not generate hashtags. Please try again.");
    }

    const hashtagSection =
      `## 4. Hashtags\n${hashtagList.join(" ")}`;

    // STEP 3: Insert hashtags before the script section
    const lines = result.split("\n");
    const cleanedLines = [];
    let skippingHashtagSection = false;

    for (const line of lines) {
      const isHeading = /^#{1,3}\s+/.test(line);

      if (/^#{1,3}\s*4[.)]?\s*Hashtags\s*$/i.test(line.trim())) {
        skippingHashtagSection = true;
        continue;
      }

      if (skippingHashtagSection && isHeading) {
        skippingHashtagSection = false;
      }

      if (!skippingHashtagSection) {
        cleanedLines.push(line);
      }
    }

    let finalResult = cleanedLines.join("\n").trim();

    const scriptPattern = /^#{1,3}\s*5[.)]?\s*Short Script Outline\s*$/im;
    const scriptMatch = scriptPattern.exec(finalResult);

    if (scriptMatch) {
      finalResult =
        finalResult.slice(0, scriptMatch.index).trimEnd() +
        "\n\n" +
        hashtagSection +
        "\n\n" +
        finalResult.slice(scriptMatch.index).trimStart();
    } else {
      finalResult += "\n\n" + hashtagSection;
    }

    console.log("Hashtags generated:", hashtagList.length);

    res.json({
      result: finalResult
    });

  } catch (error) {
    console.error("Groq API error:", error);

    res.status(500).json({
      error: error.message || "AI generation failed. Please try again."
    });
  }
});

app.listen(PORT, () => {
  console.log(`CreatorFlow AI backend running at http://localhost:${PORT}`);
});
