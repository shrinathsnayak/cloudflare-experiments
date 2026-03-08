---
name: cloudflare-experiments
description: Scaffolds and documents new Cloudflare Experiments. Use when adding a new experiment, copying an experiment structure, or updating root or experiment READMEs and deploy buttons.
---

# Cloudflare Experiments

## When to use

- Adding a new experiment to the repo.
- Scaffolding a new experiment (copy structure from an existing one).
- Updating documentation (root README or experiment README) or deploy buttons.

## Adding a new experiment

1. **Scaffold**: Copy an existing experiment folder (e.g. `experiments/is-it-down`) to `experiments/<new-name>`. Keep the same layout: `src/index.ts`, `src/routes/`, `src/lib/`, `src/utils/`, `src/constants/`, `src/types/`, `package.json`, `wrangler.json`, `tsconfig.json`, `README.md`.
2. **Implement**: Replace route logic, add any bindings in `wrangler.json` and type them in `src/types/env.d.ts`. Do not share code with other experiments.
3. **Document**: Update the root [README.md](README.md) experiments table with name, description, and deploy link. In the experiment’s README, document purpose, API (query params, response shape), run locally, and deploy button.
4. **Deploy button**: In the experiment README use:
   `[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/<owner>/cloudflare-experiments/tree/main/experiments/<name>)`
   Replace `<owner>` and `<name>` with the real repo owner and experiment folder name.

## Experiment structure reminder

- `src/index.ts`: Hono app, mount routes, `export default { fetch: app.fetch }`.
- `src/routes/*.ts`: Route handlers; use `jsonError` / `jsonSuccess` from utils for consistent responses.
- `src/types/env.d.ts`: Env/bindings types.
- No root package.json or shared TS config; each experiment is independent.
