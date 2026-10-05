/**
 * Minimal paste example for docs ("Use in your project").
 * Not part of the Worker runtime — copy into your own project.
 */
import { generateKeyPairAndTest } from "../src/lib/mlkem";

export default {
  async fetch(): Promise<Response> {
    const result = await generateKeyPairAndTest();
    return Response.json(result);
  },
};
