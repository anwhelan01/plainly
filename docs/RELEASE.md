# Plainly release

This release is a free local-in-the-browser writing checker and skill exporter. It has no checkout or paid entitlement claims. A future paid pack requires its own value proposition and fulfilment; it is not represented as shipped here.

## Build and run

Node 24.19.0 and npm 11.9.0. Use `nvm use` and `npm install --global npm@11.9.0`, then from a clean checkout:

```sh
npm ci
npm run typecheck
npm test
npm run test:product
npm run build
NITRO_HOST=127.0.0.1 NITRO_PORT=8085 npm start
```

The production output is `.output/` with the Node server preset. No auth database or Grok App Builder environment is needed for the public app. Put the Node process behind your TLS reverse proxy; `deploy/nginx.conf` includes a request-body ceiling. `/healthz` returns `ok`.

Do not expose the development server publicly. Keep the production Node listener on loopback and use a process supervisor to restart it after failures. Preserve the previous `.output/` for rollback.

## Optional AI rewrite

Rewrite is off by default on both client and server. Local checking and skill export do not require a provider key. To enable:

1. Set `VITE_PLAINLY_REWRITE_ENABLED=true` when building the client.
2. At runtime set `PLAINLY_REWRITE_ENABLED=true`, `XAI_API_KEY`, `XAI_MODEL`, `PLAINLY_ORIGIN` and `PLAINLY_DATA_DIR`.
3. `XAI_MODEL` must be a model available to that account which supports chat JSON responses. There is deliberately no guessed model default.
4. `PLAINLY_ORIGIN` is the exact HTTPS browser origin without a trailing slash. Cross-origin POSTs are rejected when rewriting is enabled.
5. Give the service user a persistent local directory such as `/var/lib/plainly`. All worker processes must use that same filesystem directory. Independent replicas or serverless deployments are not supported by this budget implementation.

The quota reserves a call before contacting the provider. Default: 50 attempts per UTC day across the deployment and no more than three per minute. Failures consume attempts. `PLAINLY_DAILY_REWRITES` accepts 1–1000. Requests are limited to 8,000 characters and 3,500 output tokens; provider requests time out after 30 seconds and are not retried. Provider pricing determines cost: this is an attempt/token ceiling, not a fixed-pound spending guarantee. Set an account-level spend limit too if available.

Quota state contains counters only. Damaged state and lock contention fail closed. If the process is killed while holding the lock, stop all workers before removing the stale `quota.lock` directory; preserve `quota.json`, then restart. Never routinely delete quota state to resolve a limit. Use a single durable host with all workers sharing the directory.

The reverse proxy must enforce its 40 KB body limit, including chunked requests. The app's Content-Length check is additional protection, not a substitute for that ingress limit. Test a real rewrite with the configured account before enabling it publicly. Live xAI calls were not performed during source validation because no provider credentials were supplied.

## User-facing behaviour

- Drafts persist in browser localStorage and survive reload. Clear saves an empty draft.
- The Google-only setting filters out Plainly-only rules.
- Style scores are heuristics, not fact checking or AI-origin detection.
- Rewrites show a diff against the submitted text. Applying a result after the source changed is refused.
- Large diffs use a bounded whole-document fallback rather than allocating an unbounded quadratic matrix.
- The UI explains that pressing Rewrite sends the draft to xAI; local checks and skill export do not.
- Google Fonts is used for typography. Site hosting sees ordinary requests; text is not sent to the font provider by the application. No analytics are included.

## Release gate

Source tests, production build, local production HTTP checks and browser checks are recorded in `VALIDATION.md`. DNS, certificates, real deployment availability, provider access and optional rewrite spend are deployment checks. A successful build alone is not proof of those external integrations.

## Runtime independence

The release configuration no longer injects the Grok App Builder extension script or preview authentication into product pages. `app-env.json` records the no-auth default in source control. Retained template utility tests use isolated identity fixtures, rather than assuming the product has no branding.

The tested runtime is pinned in `.nvmrc` and `packageManager`. Use npm 11.9.0: npm 10 on the initial GitHub runner interpreted the peer-dependency lock differently and rejected it. The CI workflow now uses the same Node/npm versions as local validation.
