import "server-only";
import type { Archetype } from "./questions";

type KitSubscribeArgs = {
  email: string;
  firstName: string;
  archetype: Archetype;
};

type KitResult = { ok: true } | { ok: false; error: string };

// Kit (ConvertKit) v3 API. Form-scoped subscribe with tag.
//
// Required env (server-only):
//   KIT_API_KEY        - account API key
//   KIT_FORM_ID        - default form to subscribe people to
//   KIT_TAG_HORMONE    - tag id for hormone archetype
//   KIT_TAG_INSULIN    - tag id for insulin archetype
//   KIT_TAG_CORTISOL   - tag id for cortisol archetype
//   KIT_TAG_MUSCLE_LOSS - tag id for muscle-loss archetype
//
// When KIT_API_KEY is missing we no-op and log so local dev works without a key.
export async function subscribeToKit(args: KitSubscribeArgs): Promise<KitResult> {
  const apiKey = process.env.KIT_API_KEY;
  const formId = process.env.KIT_FORM_ID;

  if (!apiKey || !formId) {
    console.log("[kit] no API key/form id set — would have subscribed:", args);
    return { ok: true };
  }

  const tagId = tagIdFor(args.archetype);
  if (!tagId) {
    console.warn(`[kit] no tag id configured for archetype ${args.archetype}`);
  }

  try {
    const res = await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        email: args.email,
        first_name: args.firstName,
        tags: tagId ? [tagId] : undefined,
        fields: { archetype: args.archetype },
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Kit ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "kit fetch failed" };
  }
}

function tagIdFor(archetype: Archetype): string | undefined {
  switch (archetype) {
    case "hormone":
      return process.env.KIT_TAG_HORMONE;
    case "insulin":
      return process.env.KIT_TAG_INSULIN;
    case "cortisol":
      return process.env.KIT_TAG_CORTISOL;
    case "muscle-loss":
      return process.env.KIT_TAG_MUSCLE_LOSS;
  }
}
