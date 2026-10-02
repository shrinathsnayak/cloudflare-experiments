/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Summarizes each inbound email with Workers AI and logs the result.
 */
import PostalMime from "postal-mime";
import { summarizeNewsletter } from "../src/lib/summarize";
import { extractFirstLink, htmlToText } from "../src/lib/text";
import type { AiBinding } from "../src/types/env";

interface Env {
  AI: AiBinding;
}

export default {
  async email(message: ForwardableEmailMessage, env: Env): Promise<void> {
    if (message.rawSize > 1024 * 1024) {
      message.setReject("Message exceeds 1 MB limit");
      return;
    }
    const parsed = await PostalMime.parse(await new Response(message.raw).arrayBuffer());
    const subject = parsed.subject ?? "(no subject)";
    const text = parsed.text?.trim() || htmlToText(parsed.html ?? "");
    const { summary } = await summarizeNewsletter(env.AI, subject, text);
    console.log({ subject, summary, link: extractFirstLink(parsed.html, text) });
  },
};
