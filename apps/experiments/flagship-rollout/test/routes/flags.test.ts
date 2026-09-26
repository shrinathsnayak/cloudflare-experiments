import { describe, it, expect, vi } from "vitest";
import flagRoutes from "../../src/routes/flags";
import type { Env, Flagship } from "../../src/types/env";

function createEnv(flags: Partial<Flagship>): Env {
  return {
    FLAGS: {
      getBooleanValue: flags.getBooleanValue ?? vi.fn().mockResolvedValue(false),
      getBooleanDetails:
        flags.getBooleanDetails ??
        vi.fn().mockResolvedValue({
          flagKey: "new-checkout",
          value: false,
        }),
    },
  };
}

describe("flag routes", () => {
  it("rejects invalid flag keys", async () => {
    const res = await flagRoutes.fetch(
      new Request("http://localhost/flags/bad%20key"),
      createEnv({})
    );
    expect(res.status).toBe(400);
    const body = (await res.json()) as { code?: string };
    expect(body.code).toBe("INVALID_FLAG_KEY");
  });

  it("evaluates a boolean flag", async () => {
    const getBooleanValue = vi.fn().mockResolvedValue(true);
    const res = await flagRoutes.fetch(
      new Request("http://localhost/flags/new-checkout?userId=user-42&default=false"),
      createEnv({ getBooleanValue })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      flagKey: string;
      value: boolean;
      context: { userId?: string };
    };
    expect(body.flagKey).toBe("new-checkout");
    expect(body.value).toBe(true);
    expect(body.context.userId).toBe("user-42");
    expect(getBooleanValue).toHaveBeenCalledWith("new-checkout", false, {
      userId: "user-42",
    });
  });

  it("returns flag details", async () => {
    const getBooleanDetails = vi.fn().mockResolvedValue({
      flagKey: "new-checkout",
      value: true,
      variant: "on",
      reason: "TARGETING_MATCH",
    });
    const res = await flagRoutes.fetch(
      new Request("http://localhost/flags/new-checkout/details?default=true"),
      createEnv({ getBooleanDetails })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      value: boolean;
      variant?: string;
      reason?: string;
    };
    expect(body.value).toBe(true);
    expect(body.variant).toBe("on");
    expect(body.reason).toBe("TARGETING_MATCH");
  });
});
