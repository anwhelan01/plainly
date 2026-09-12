# Validation — 12 September 2026

Scope: source release candidate, tested locally on Linux with Node 24.19.0. Not a live deployment attestation.

| Check | Result |
|---|---|
| Clean dependency installation (`npm ci --ignore-scripts --no-audit --no-fund`) | Passed after repairing the lockfile |
| TypeScript (`npm run typecheck`) | Passed |
| Existing full suite (`npm test`) | Passed: 149 script tests and 29 TypeScript tests |
| Product checks (`npm run test:product`) | Passed: 9 tests, including 5 existing linter tests |
| Production Node build (`npm run build`) | Passed |
| Production dependencies (`npm audit --omit=dev`) | 0 reported vulnerabilities at check time; this is not a security guarantee |
| Production HTTP | Homepage 200, health endpoint 200, nosniff header, no injected builder extension |
| Browser smoke | Draft survives reload; Clear remains empty after reload; rewrite disabled by default; skill download starts; no browser exceptions |
| Layout | Desktop exercised at 1280px, mobile at 390px; mobile screenshot inspected; no horizontal overflow |

The default Playwright CDN browser download failed in this environment. Local browser validation used a Chromium binary obtained from the @sparticuz/chromium npm package, unpacked in temporary storage. No such dependency was added to this product. The smoke script accepts `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` for a preinstalled browser; CI uses Playwright's normal Chromium installation.

Provider behaviour was exercised with fake structured responses, malformed output and provider errors. Quota tests cover burst/daily ceilings, subsequent calls, next-day rollover, clock rollback and corrupt state. Large-diff preservation and Google-only filtering have regression coverage.

Not verified: a real xAI account/model, public DNS/TLS, service supervisor, live provider pricing, production merchant transactions (there is no checkout in Plainly), multi-host quota sharing. Optional live AI rewriting stays disabled until configured and tested by the operator.

The inherited template suite initially failed because it depended on an ignored app-env file, actual product branding as a generic test fixture, and generated PWA assets. The config default is now committed, generic tests use isolated fixture directories, and the removed builder runtime is checked as absent from release config. No product test failures were suppressed.

Initial GitHub CI stopped at dependency installation: its bundled npm 10 rejected a peer-dependency entry which npm 11.9.0 accepted locally. The release now pins Node 24.19.0 and npm 11.9.0 in CI and the documented toolchain; subsequent runner results are available on the PR.
