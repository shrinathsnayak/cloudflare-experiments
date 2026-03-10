# Contributing to Cloudflare Experiments

Thank you for your interest in contributing. This document explains how to propose changes, add new experiments, and follow the project’s standards.

---

## How to Contribute

- **Bug fixes and improvements**: Open an issue first (optional but helpful), then submit a pull request.
- **New experiments**: Open an issue with the [Experiment idea](.github/ISSUE_TEMPLATE/experiment_idea.md) template to discuss before implementing.
- **Documentation**: Fixes and improvements to README or CONTRIBUTING are always welcome via PR.

---

## Development Setup

1. **Fork and clone** the repository.
2. **Install dependencies** per experiment:
   ```bash
   cd experiments/<experiment-name>
   npm install
   ```
3. **Run locally** (per experiment):
   ```bash
   npm run dev
   # or: npx wrangler dev
   ```
4. **Lint/type-check** (if the experiment has scripts):
   ```bash
   npm run lint
   npm run build
   ```

---

## Pull Request Process

1. Create a **branch** from `main` (e.g. `fix/whereami-typo`, `feat/new-experiment-name`).
2. Make your changes in **one experiment only** per PR when possible. Keep PRs focused.
3. Ensure the experiment still **runs and deploys** (e.g. `npx wrangler deploy` from that experiment’s directory).
4. Update the experiment’s **README.md** if you changed behavior or added options.
5. If adding a **new experiment**, add a row to the experiments table in the **root README.md** and ensure the experiment follows the [repository structure](#experiment-structure) below.
6. Open a **pull request** against `main` with a clear title and description. Fill in the PR template.
7. Address review feedback. Once approved, a maintainer will merge.

---

## Code and Structure Standards

Contributions should follow the project’s coding and structure rules so the repo stays consistent.

### Experiment structure

Every experiment lives under `experiments/<name>/` with this layout:

```
experiments/<name>/
├── src/
│   ├── index.ts          # Hono app, mount routes, export default { fetch: app.fetch }
│   ├── routes/           # Route handlers only (one file per route or logical group)
│   ├── lib/              # Domain logic (fetch, URL validation, parsing)
│   ├── utils/            # Shared helpers (jsonError, jsonSuccess, etc.)
│   ├── constants/        # Optional config/literals
│   └── types/            # All types; env in env.d.ts
├── package.json
├── wrangler.toml         # or wrangler.json; bindings here
├── tsconfig.json
└── README.md
```

- **No shared code between experiments**: Each experiment is standalone with its own `package.json` and dependencies. Do not import from other experiments or the repo root.
- **Single responsibility**: One experiment = one Cloudflare capability (e.g. Workers AI, Browser Rendering, D1).
- **Edge-first, under ~60 seconds**: Prefer stateless, fast request paths.

### TypeScript and API style

- Use **strict** TypeScript; avoid `any`. Type Worker env in `src/types/env.d.ts` and use `Hono<{ Bindings: Env }>`.
- **Errors**: Use a shared helper for client errors, e.g. `jsonError(c, message, code, status)` from `src/utils/response.ts` (400 for bad request, 404 for not found). Use 502 for server/upstream errors; don’t expose internals.
- **Success**: Use `jsonSuccess(c, data)` for JSON success responses.
- **Global handler**: In `src/index.ts`, register `app.onError(...)` so uncaught errors return consistent JSON (e.g. `{ error, code: "INTERNAL_ERROR" }`, status 500).
- **URL params**: For any endpoint that takes a `url` query param, validate with a shared `validateUrl(input)` in `src/lib/url.ts` (allow only `http://` and `https://`). Return `jsonError` with a clear message and code (e.g. `INVALID_URL`) when invalid.
- **Naming**: Descriptive error codes (e.g. `INVALID_URL`, `FETCH_ERROR`, `INTERNAL_ERROR`). Routes in `src/routes/` with kebab-case filenames matching the path.

---

## Adding a New Experiment

1. Open an issue using the [Experiment idea](.github/ISSUE_TEMPLATE/experiment_idea.md) template to align with maintainers.
2. Create `experiments/<name>/` with the structure above. You can use an existing experiment (e.g. `is-it-down` or `whereami`) as a reference.
3. Implement the Worker (Hono app, routes, lib, utils, types). Declare bindings in `wrangler.toml`/`wrangler.json` and in `src/types/env.d.ts`.
4. Add a **README.md** in the experiment folder (description, usage, deploy button if applicable).
5. Add a row to the **experiments table** in the root **README.md** and, if applicable, a Deploy link.
6. Submit a PR with a clear description and link to the experiment idea issue.

---

## Questions

- Open a [Discussion](https://github.com/shrinathsnayak/cloudflare-experiments/discussions) for questions or ideas.
- For bugs or feature requests, use [Issues](https://github.com/shrinathsnayak/cloudflare-experiments/issues).

Thanks for contributing.
