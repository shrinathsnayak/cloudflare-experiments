import { DurableObject } from "cloudflare:workers";

interface Env {
  SNAPSHOT_DEMO: DurableObjectNamespace;
}

export class SnapshotDemo extends DurableObject {
  async snapshot() {
    // Start a container
    this.ctx.container.start({
      image: this.ctx.container.images.debian,
      enableInternet: false,
    });

    // Execute: create a file
    const createResult = await this.ctx.container.exec({
      command: ["sh", "-c", "echo 'Hello from snapshot!' > /workspace/demo.txt"],
    });

    // Create a snapshot
    const containerSnapshot = await this.ctx.container.snapshotContainer({
      name: "workspace-snapshot",
    });

    // Save the snapshot
    await this.ctx.storage.put("snapshot", containerSnapshot);

    // Stop the container
    this.ctx.container.destroy();

    return {
      status: "snapshot_created",
      snapshotId: containerSnapshot.id,
      fileCreated: createResult.exitCode === 0,
    };
  }

  async restore() {
    // Load the snapshot
    const containerSnapshot = await this.ctx.storage.get("snapshot");

    if (!containerSnapshot) {
      return { status: "no_snapshot", message: "No snapshot found. Run /snapshot first." };
    }

    // Start from the snapshot
    this.ctx.container.start({
      containerSnapshot,
      enableInternet: false,
    });

    // Verify the file exists
    const readResult = await this.ctx.container.exec({
      command: ["cat", "/workspace/demo.txt"],
    });

    const fileContent = new TextDecoder().decode(readResult.stdout);

    // Stop the container
    this.ctx.container.destroy();

    return {
      status: "snapshot_restored",
      fileExists: readResult.exitCode === 0,
      fileContent: fileContent.trim(),
    };
  }
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.SNAPSHOT_DEMO.idFromName("demo");
    const stub = env.SNAPSHOT_DEMO.get(id);

    if (url.pathname === "/snapshot") {
      const result = await stub.snapshot();
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/restore") {
      const result = await stub.restore();
      return new Response(JSON.stringify(result, null, 2), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        name: "container-snapshot",
        description:
          "Demonstrate Container filesystem snapshots with durable_object scheduling policy",
        usage: "GET /snapshot to create, GET /restore to verify persistence",
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  },
};
