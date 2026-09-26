import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import execRoutes from "../../src/routes/exec";
import { setGetSandboxForTests } from "../../src/lib/exec";

describe("exec routes", () => {
  beforeEach(() => {
    setGetSandboxForTests(() => ({
      writeFile: vi.fn().mockResolvedValue(undefined),
      exec: vi.fn().mockResolvedValue({
        stdout: "42\n",
        stderr: "",
        exitCode: 0,
      }),
    }));
  });

  afterEach(() => {
    setGetSandboxForTests(null);
  });

  it("POST /exec runs javascript via mocked sandbox", async () => {
    const env = {
      Sandbox: {} as DurableObjectNamespace,
    };

    const res = await execRoutes.fetch(
      new Request("http://localhost/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: "javascript",
          code: "console.log(42)",
        }),
      }),
      env
    );

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      stdout: string;
      stderr: string;
      exitCode: number;
    };
    expect(body.stdout).toBe("42\n");
    expect(body.exitCode).toBe(0);
  });

  it("rejects unsupported language", async () => {
    const res = await execRoutes.fetch(
      new Request("http://localhost/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: "python", code: "print(1)" }),
      }),
      { Sandbox: {} as DurableObjectNamespace }
    );

    expect(res.status).toBe(400);
    const body = (await res.json()) as { code: string };
    expect(body.code).toBe("INVALID_LANGUAGE");
  });
});
