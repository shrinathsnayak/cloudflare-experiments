import type { ScheduleRecord } from "./types/env";

const SCHEDULE_KEY = "schedule";

export class AlarmScheduler implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/schedule") {
      const body = (await request.json()) as { seconds?: number; message?: string; id?: string };
      const seconds = body.seconds ?? 0;
      const message = body.message ?? "";
      const id = body.id ?? crypto.randomUUID();
      const scheduledFor = Date.now() + seconds * 1000;

      const record: ScheduleRecord = {
        id,
        message,
        seconds,
        status: "scheduled",
        scheduledFor: new Date(scheduledFor).toISOString(),
      };

      await this.state.storage.put(SCHEDULE_KEY, record);
      await this.state.storage.setAlarm(scheduledFor);
      return Response.json(record, { status: 201 });
    }

    if (request.method === "GET" && url.pathname === "/status") {
      const record = await this.state.storage.get<ScheduleRecord>(SCHEDULE_KEY);
      if (!record) {
        return Response.json({ error: "Schedule not found", code: "NOT_FOUND" }, { status: 404 });
      }
      return Response.json(record);
    }

    return new Response("Not found", { status: 404 });
  }

  async alarm(): Promise<void> {
    const record = await this.state.storage.get<ScheduleRecord>(SCHEDULE_KEY);
    if (!record) return;

    const fired: ScheduleRecord = {
      ...record,
      status: "fired",
      firedAt: new Date().toISOString(),
    };
    await this.state.storage.put(SCHEDULE_KEY, fired);
  }
}
