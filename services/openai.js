const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Die-cast car appraiser. Identify the brand by reading ANY visible text on packaging or baseplate first — never guess when text is readable.

Brand visual cues: Hot Wheels = red card, yellow flame logo, orange/red hubs; Matchbox = blue/yellow card; Johnny Lightning = trading card insert; Greenlight = black blister, licensed vehicles; M2 Machines = window box.

Return ONLY valid JSON, no markdown:
{"brand":"Hot Wheels|Matchbox|Johnny Lightning|Majorette|Greenlight|M2 Machines|Auto World|Other|Unknown","make":string|null,"model":string|null,"series":string|null,"year":int|null,"isLimitedEdition":bool,"rarity":"Common|Uncommon|Rare|Super Rare|Ultra Rare","condition":"Mint in Box|Near Mint|Good|Fair|Poor","estimatedValueLow":number,"estimatedValueHigh":number,"suggestedTitle":string,"suggestedDescription":"2-3 factual sentences: what it is, series if known, condition, whether still in packaging. No marketing language.","aiNotes":string}

Use null for unknowns. Values = realistic secondary market USD ranges.`;

const analyzeCarPhoto = async (imageBuffer, mimeType) => {
  const base64 = imageBuffer.toString('base64');
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: [
        { type: 'text', text: SYSTEM_PROMPT },
        { type: 'image_url', image_url: { url: dataUrl, detail: 'auto' } },
      ],
    }],
  });

  const text = response.choices[0].message.content.trim();
  // Strip any accidental markdown code fences
  const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
  return JSON.parse(cleaned);
};

module.exports = { analyzeCarPhoto };
