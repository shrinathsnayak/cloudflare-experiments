/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 *
 * Typical API: POST /parse with a PDF or image body
 */
import { readUpload } from "../src/lib/upload";
import { convertToMarkdown } from "../src/lib/convert";
import { extractReceiptFields } from "../src/lib/extract";
import { normalizeReceipt } from "../src/lib/normalize";
import { checkReceipt } from "../src/lib/checks";

export default {
  async fetch(request: Request, env: { AI: Ai }): Promise<Response> {
    const upload = await readUpload(request);
    if (!upload.ok) {
      return Response.json({ error: upload.message, code: upload.code }, { status: upload.status });
    }

    const markdown = await convertToMarkdown(env.AI, upload.file);
    const receipt = normalizeReceipt(await extractReceiptFields(env.AI, markdown));
    return Response.json({ receipt, warnings: checkReceipt(receipt) });
  },
};
