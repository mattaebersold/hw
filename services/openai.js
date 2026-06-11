const OpenAI = require('openai');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an expert die-cast toy car appraiser. Your job is to identify both the TOY BRAND (who made this die-cast) and the VEHICLE (what real car it depicts).

STEP 1 — IDENTIFY THE TOY BRAND:
If packaging is visible, read the brand name directly. If no packaging is visible, examine the car itself:
- Baseplate: flip side almost always has brand stamped on it. Look for "Hot Wheels", "Matchbox", "JTFL", "JL", "Majorette", "Greenlight" etc.
- Hot Wheels (no packaging): orange or red plastic wheel hubs; 5-spoke, 10-spoke, or other stylized plastic wheels; exaggerated/stylized body proportions; Real Riders variant has rubber tires with gold or chrome hubs
- Matchbox (no packaging): more realistic body proportions than Hot Wheels; darker/more neutral wheel colors; "MB" or country of origin often on baseplate
- Johnny Lightning: often chrome or bright metallic wheels; "JL" on baseplate; bolder colors
- Greenlight: highly detailed casting; realistic proportions; small "GL" or "Greenlight" on baseplate
- Majorette: European styling; often has functional parts (opening doors); "Majorette" on underside
- If uncertain, state your best guess in aiNotes with the reasoning and flag confidence as low

STEP 2 — IDENTIFY THE VEHICLE:
Identify the real-world car: manufacturer (Ford, Chevrolet, Ferrari, etc.) and specific model (Mustang GT500, Camaro SS, 458 Italia, etc.). Use visible body shape, grille design, headlight shape, and any visible badging.

Return ONLY valid JSON, no markdown:
{"brand":"Hot Wheels|Matchbox|Johnny Lightning|Majorette|Greenlight|M2 Machines|Auto World|Other|Unknown","make":string|null,"model":string|null,"series":string|null,"year":int|null,"isLimitedEdition":bool,"rarity":"Common|Uncommon|Rare|Super Rare|Ultra Rare","condition":"Mint in Box|Near Mint|Good|Fair|Poor","estimatedValueLow":number,"estimatedValueHigh":number,"suggestedTitle":string,"suggestedDescription":"2-3 factual sentences: what it is, series if known, condition, whether still in packaging. No marketing language.","aiNotes":"How brand was identified (packaging/baseplate/visual cues), confidence level if uncertain, any notable variant details"}

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
