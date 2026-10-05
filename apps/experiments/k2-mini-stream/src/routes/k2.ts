import { Hono } from "hono";
import type { Env } from "../types/env";
import { jsonSuccess, jsonError } from "../utils/response";

const app = new Hono<{ Bindings: Env }>();

app.get("/demo", async (c) => {
  const K2_ACCOUNT_ID = c.env.K2_ACCOUNT_ID;
  const K2_API_TOKEN = c.env.K2_API_TOKEN;

  if (!K2_ACCOUNT_ID || !K2_API_TOKEN) {
    return jsonError(
      c,
      "Missing K2_ACCOUNT_ID or K2_API_TOKEN environment variables",
      "MISSING_CONFIG",
      500
    );
  }

  try {
    // 1. Create a stream
    const streamName = `demo-stream-${Date.now()}`;
    const createResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${K2_ACCOUNT_ID}/k2/streams`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${K2_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: streamName,
          retention_seconds: 3600, // 1 hour
        }),
      }
    );

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      return jsonError(c, `K2 API error: ${createResponse.status} ${errorText}`, "K2_ERROR", 502);
    }

    const createData = (await createResponse.json()) as {
      success: boolean;
      result?: { id: string; endpoint: string };
    };

    if (!createData.success || !createData.result) {
      return jsonError(c, "Failed to create K2 stream", "K2_ERROR", 502);
    }

    const { id: streamId, endpoint } = createData.result;

    // 2. Produce records
    const events = [
      { id: 1, type: "order", product: "widget", quantity: 5 },
      { id: 2, type: "order", product: "gadget", quantity: 3 },
      { id: 3, type: "shipment", orderId: 1, status: "shipped" },
    ];

    const produceResponse = await fetch(`${endpoint}/produce`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${K2_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: events.map((event) => ({
          content: Buffer.from(JSON.stringify(event)).toString("base64"),
          headers: { type: event.type },
        })),
      }),
    });

    if (!produceResponse.ok) {
      const errorText = await produceResponse.text();
      return jsonError(c, `K2 produce error: ${produceResponse.status} ${errorText}`, "K2_ERROR", 502);
    }

    // 3. Create a subscription
    const subscriptionResponse = await fetch(`${endpoint}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${K2_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "demo-subscription",
        start_position: "earliest",
      }),
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      return jsonError(c, `K2 subscription error: ${subscriptionResponse.status} ${errorText}`, "K2_ERROR", 502);
    }

    const subscriptionData = (await subscriptionResponse.json()) as {
      success: boolean;
      result?: { id: string };
    };

    if (!subscriptionData.success || !subscriptionData.result) {
      return jsonError(c, "Failed to create subscription", "K2_ERROR", 502);
    }

    const subscriptionId = subscriptionData.result.id;

    // 4. Consume records
    const consumeResponse = await fetch(`${endpoint}/subscriptions/${subscriptionId}/consume`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${K2_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        worker_id: "demo-worker",
        max_records: 100,
      }),
    });

    if (!consumeResponse.ok) {
      const errorText = await consumeResponse.text();
      return jsonError(c, `K2 consume error: ${consumeResponse.status} ${errorText}`, "K2_ERROR", 502);
    }

    const consumeData = (await consumeResponse.json()) as {
      success: boolean;
      result?: {
        batch_id: string;
        records: Array<{ content: string; timestamp_ms: number }>;
      };
    };

    if (!consumeData.success || !consumeData.result) {
      return jsonError(c, "Failed to consume records", "K2_ERROR", 502);
    }

    const { batch_id, records } = consumeData.result;

    // Decode records
    const decodedRecords = records.map((record) => {
      const decoded = Buffer.from(record.content, "base64").toString("utf-8");
      return {
        ...JSON.parse(decoded),
        timestamp: record.timestamp_ms,
      };
    });

    // 5. Acknowledge the batch
    await fetch(`${endpoint}/subscriptions/${subscriptionId}/batches/${batch_id}/ack`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${K2_API_TOKEN}`,
      },
    });

    return jsonSuccess(c, {
      streamId,
      streamName,
      produced: events.length,
      consumed: decodedRecords.length,
      events: decodedRecords,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonError(c, `K2 demo error: ${message}`, "K2_ERROR", 502);
  }
});

export default app;
