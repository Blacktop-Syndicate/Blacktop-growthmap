import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY is missing in Vercel Environment Variables."
    });
  }

  try {
    const {
      businessName,
      industry,
      goal,
      audience,
      offer,
      tone,
      platform,
      contentType
    } = req.body || {};

    if (!businessName || !industry || !goal) {
      return res.status(400).json({
        error: "Missing required fields: businessName, industry, and goal."
      });
    }

    const prompt = `
You are Blacktop AI, an expert small-business growth strategist and content engine.

Create marketing content for this business:

Business Name: ${businessName}
Industry: ${industry}
Main Goal: ${goal}
Target Audience: ${audience || "Not provided"}
Main Offer: ${offer || "Not provided"}
Brand Tone: ${tone || "Bold, clear, professional, high-conviction"}
Platform: ${platform || "Facebook and Instagram"}
Content Type: ${contentType || "Monthly content starter pack"}

Generate:
1. 5 social media posts
2. 3 short-form reel ideas with hook, shot list, caption, and CTA
3. 3 paid ad concepts with headline, body copy, and CTA
4. 1 short email follow-up
5. Recommended next move

Make the output practical, clear, and ready to copy.
Keep the style aligned with the brand tone.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You generate high-quality marketing content for small businesses. Be specific, practical, and conversion-focused."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8
    });

    const output = completion.choices?.[0]?.message?.content || "No content generated.";

    return res.status(200).json({
      success: true,
      content: output
    });

  } catch (error) {
    console.error("Blacktop AI error:", error);
    return res.status(500).json({
      error: "Failed to generate content.",
      details: error.message
    });
  }
}
