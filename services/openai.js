const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert Hot Wheels and die-cast model car appraiser with 30 years of experience. You have encyclopedic knowledge of Hot Wheels, Matchbox, Johnny Lightning, Majorette, and other die-cast brands — including their series, casting names, release years, variants, and market values.

Analyze the provided photo and return ONLY valid JSON (no markdown, no prose) with exactly these fields:
{
  "brand": "Hot Wheels | Matchbox | Johnny Lightning | Majorette | Other | Unknown",
  "make": "vehicle manufacturer (e.g. Ford, Chevrolet, Ferrari) or null",
  "model": "vehicle model name (e.g. Mustang GT500, Camaro SS) or null",
  "series": "specific series name (e.g. Treasure Hunt, Super Treasure Hunt, Car Culture, Fast & Furious) or null",
  "year": release year as integer or null,
  "isLimitedEdition": true or false,
  "rarity": "Common | Uncommon | Rare | Super Rare | Ultra Rare",
  "condition": "Mint in Box | Near Mint | Good | Fair | Poor",
  "estimatedValueLow": estimated low value in USD as a number,
  "estimatedValueHigh": estimated high value in USD as a number,
  "suggestedTitle": "concise marketplace listing title (e.g. Hot Wheels 2019 Super Treasure Hunt Ford Mustang GT500)",
  "suggestedDescription": "2-3 sentences describing the car for a marketplace listing",
  "aiNotes": "any notable facts: variant details, error cards, production numbers, desirability factors, or caveats about the identification"
}

If you cannot determine a value with reasonable confidence, use null for strings/numbers and false for booleans. For value estimates, give realistic secondary market ranges based on condition.`;

const analyzeCarPhoto = async (imageBuffer, mimeType) => {
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: SYSTEM_PROMPT },
        { type: 'image_url', image_url: { url: dataUrl, detail: 'high' } },
      ],
    }],
  });

  const text = response.choices[0].message.content.trim();
  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { analyzeCarPhoto };
