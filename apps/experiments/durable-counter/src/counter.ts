import type { CounterValue } from "./types/counter";

export class Counter implements DurableObject {
  private state: DurableObjectState;
  private value = 0;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<number>("value");
      this.value = stored ?? 0;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.pathname.replace(/^\//, "");

    if (action === "increment") {
      this.value += 1;
      await this.state.storage.put("value", this.value);
      return Response.json({ value: this.value } satisfies CounterValue);
    }

    if (action === "reset") {
      this.value = 0;
      await this.state.storage.put("value", this.value);
      return Response.json({ value: this.value } satisfies CounterValue);
    }

    return Response.json({ value: this.value } satisfies CounterValue);
  }
}
