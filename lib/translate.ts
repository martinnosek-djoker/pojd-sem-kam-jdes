import Anthropic from "@anthropic-ai/sdk";
import { VisitDish } from "./types";

const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

function getClient(): Anthropic {
  if (!anthropicApiKey) {
    throw new Error("ANTHROPIC_API_KEY není nastaven - překlad není dostupný");
  }
  return new Anthropic({ apiKey: anthropicApiKey });
}

// Translates a short piece of Czech prose (a visit review, a dish name) to
// natural English. Returns null on failure so callers can fall back to
// showing the Czech original rather than blocking the save.
export async function translateToEnglish(text: string): Promise<string | null> {
  if (!text || !text.trim()) return text;

  try {
    const anthropic = getClient();
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [{ role: "user", content: text }],
      system:
        "Translate the following Czech text to natural, casual English, as a food reviewer would write it. " +
        "Keep proper nouns (dish names that are already foreign loanwords, restaurant/place names) unchanged. " +
        "Reply with ONLY the translation, no preamble, no quotes.",
    });

    const block = message.content[0];
    return block.type === "text" ? block.text.trim() : null;
  } catch (error) {
    console.error("[translate] Error translating text:", error);
    return null;
  }
}

// Translates a visit's comment and its dish names together in one call, to
// avoid extra round-trips (a visit is small: a comment plus a handful of
// dishes at most).
export async function translateVisitContent(
  comment: string | null,
  dishes: VisitDish[]
): Promise<{ comment_en: string | null; dishes_en: VisitDish[] | null }> {
  const hasComment = !!comment && comment.trim().length > 0;
  const hasDishes = dishes.some((d) => d.name && d.name.trim().length > 0);

  if (!hasComment && !hasDishes) {
    return { comment_en: null, dishes_en: null };
  }

  try {
    const anthropic = getClient();
    const payload = {
      comment: comment || "",
      dish_names: dishes.map((d) => d.name),
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `Translate this JSON's string values from Czech to natural, casual English, as a food reviewer would write it. Keep proper nouns and already-foreign dish names unchanged. Reply with ONLY the translated JSON, same shape, no preamble:\n\n${JSON.stringify(payload)}`,
        },
      ],
      system: "You are a precise JSON translator. Always reply with valid JSON matching the input shape exactly.",
    });

    const block = message.content[0];
    const responseText = block.type === "text" ? block.text : "";
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in translation response");

    const translated = JSON.parse(jsonMatch[0]) as { comment?: string; dish_names?: string[] };

    return {
      comment_en: hasComment ? (translated.comment || null) : null,
      dishes_en: hasDishes
        ? dishes.map((d, i) => ({ ...d, name: translated.dish_names?.[i] || d.name }))
        : null,
    };
  } catch (error) {
    console.error("[translate] Error translating visit content:", error);
    return { comment_en: null, dishes_en: null };
  }
}
