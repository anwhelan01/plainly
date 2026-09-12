# Chief of staff handover — Barrow and Plainly

Prepared 12 September 2026. Purpose: assign crews and finish launch from the existing release work. This is an implementation brief, not a claim that either product is live or that demand is proven.

## 1. Decisions and current state

[Inference / recommendation] Prioritise Barrow for the first paid launch: one £19 digital customer-admin kit for plumbers. Treat price and demand as experiments. Plainly is the second launch: a free browser writing checker and skill exporter. It has no paid offer or entitlement system. Keep Socialite as a separate customer-service business; it requires ongoing client work.

Tony confirms he has Stripe. Account activation, payout readiness, products, prices, tax configuration, API access and delivery integrations have NOT been inspected. No Stripe connection or credentials were available in this session.

| Repo | Starting PR | Tested code commit | Delivered |
|---|---|---|---|
| barrow | https://github.com/anwhelan01/barrow/pull/7 | cb9546243da810c9aa0a1ed68d35ef992e99d963 | Static storefront, six administrative prompts, three illustrative examples, quick-start, private HTML/Markdown downloads, configuration checks |
| plainly | https://github.com/anwhelan01/plainly/pull/12 | d767be63ef493bcae2f90532be60acf7d2e69163 | Standalone production server, draft persistence fixes, dialect filtering, bounded diff, optional rewrite limits, deployment guidance |

Both use branch `codex/production-release-2026-09-12`. Both code commits passed local validation and GitHub CI, including browser smoke tests. See `docs/VALIDATION.md`. Subsequent handover commits are documentation changes. These PRs were opened as drafts and have not been merged by this assistant. Read current PR state before starting; preserve later work.

Neither deployment, live payment, delivery email nor live xAI generation was verified. Start from these release branches, not the older default-branch prototypes. Review `AGENTS.md`, `docs/RELEASE.md`, `docs/VALIDATION.md` and this file.

## 2. Crew work packets

Roles below are proposed assignments for the chief of staff; no agents or people have been notified. Create one card per ID in your existing work system, attach its branch/PR and appoint one owner. Each completion needs evidence, remaining blockers and the next action. Assign separate worktrees/branches; the integration owner handles shared files.

| ID / crew | Work and dependencies | Definition of done |
|---|---|---|
| INT-01 / integration | Review both starting PRs, preserve existing work, run release checks, integrate reviewed changes before release tags | Recorded SHAs, green checks, approved review, reproducible builds |
| BAR-01 / product | Check all six prompts and examples against real administrative scenarios; confirm £19 experiment, scope, seller identity, terms, privacy and support details | Final versioned kit and page match; no invented testimonials, savings claims or technical plumbing advice |
| BAR-02 / payments and delivery | Implement the Stripe route in section 3; depends on kit version and Stripe test configuration | Paid test order produces private delivery automatically; failures, duplicates and recovery pass section 5 |
| OPS-01 / deployment | Choose existing host after checking capacity/access; configure domains, TLS, service users, backups, email and monitoring | Production URLs, restart/restore evidence, HTTPS checks, documented rollback; BAR-02 required before sales |
| PLA-01 / product and QA | Deploy free Plainly with rewrite disabled; test drafts, Clear, Google-only rules, export and mobile | Free app works at public URL without an AI key; no paid claims |
| PLA-02 / optional AI | Only after free release: select an account-supported model, configure persistent quota and provider budget, test actual outputs | Real rewrite, failure/timeout and quota checks pass; otherwise keep disabled |
| QA-01 / independent release review | Check evidence against section 5, including deployed hosts rather than only localhost | Written pass/fail per gate and explicit blockers; no launch on an untested delivery path |
| GTM-01 / distribution | Prepare one clear Barrow offer, demo and initial relevant audience/channel; agree outreach with Tony | Launch material ready; record actual visits, purchases, refunds and support effort after launch |

Sequence: INT-01 and BAR-01 first; payments, infrastructure and free Plainly can then proceed in parallel. Barrow sales wait for BAR-02 + OPS-01 + QA-01. Optional AI and speculative subscriptions do not block the free Plainly release. Do not reopen the 50-pack catalogue or add new niches before validating the first kit.

## 3. Stripe payment and delivery specification

Recommended implementation design (not shipped): retain the static storefront and use a Stripe-hosted Payment Link. Add a small isolated fulfilment service in `services/fulfilment/` in Barrow; FastAPI plus SQLite on a single durable VPS is the proposed starting point. It must not expose or depend on the unauthenticated operator app. Use existing infrastructure only after access and capacity checks. A managed delivery integration using Tony's Stripe account is an alternative if already available and it meets the same acceptance gates; its availability and cost are unverified.

Stripe documents Payment Links as Checkout-based payments with separate partner or programmatic fulfilment. A receipt or redirect alone is not proof that the buyer received a file. [Stripe post-payment documentation](https://docs.stripe.com/payment-links/post-payment).

Payments crew tasks:

1. Create separate test and live Product/Price/Payment Link configurations for the approved kit, GBP, one-time payment, quantity one. The current advertised price is £19; resolve tax presentation before enabling live sales. Record identifiers, not secrets. Keep unimplemented discounts and extra products disabled.
2. Collect buyer email at checkout. Use Stripe's hosted confirmation initially with a clear delivery message. Put the live Payment Link into `BARROW_CHECKOUT_URL` only when delivery passes QA.
3. Implement `POST /webhooks/stripe`. Verify signatures using the raw request body and endpoint-specific secret. Persist accepted work durably before responding successfully; a worker processes the queue. Reject invalid signatures. [Stripe webhook guidance](https://docs.stripe.com/webhooks).
4. Retrieve the Checkout Session server-side and verify paid status, expected live/test mode, permitted product/price, currency, quantity and approved total/tax rules. For this paid kit, an unpaid or unexpected session grants no access. Handle completed and delayed-success events if those methods are enabled. Deduplicate concurrently by session ID and event ID. Fulfilment must work without the buyer returning to the site. [Stripe fulfilment guidance](https://docs.stripe.com/checkout/fulfillment?payment-ui=stripe-hosted).
5. Store versioned kit files outside the public web root. Implement opaque, expiring download tokens; store token hashes, bound to the paid order and kit version. Proposed initial expiry: 48 hours, with a support reissue route. Do not use a public bucket URL or treat a supplied session ID as authorisation. Rate-limit downloads/reissue and exclude tokens from logs.
6. Send a transactional delivery email linking to both files. Use a durable outbox, bounded retries and provider idempotency where supported; ambiguous email outcomes must be recoverable. Record paid, delivery-pending, sent and failed states. Alert an operator on exhausted retries; provide a protected resend command. No customer login is needed for this release.
7. Track refunds/disputes for support and revoke outstanding download access when appropriate; already downloaded files cannot be recalled. Store minimum order data, with a documented retention policy. Back up the order/outbox database and private kit versions together.

The service, database, email integration, webhook endpoint and download tokens above are NEW WORK, not existing features. Keep Stripe keys and signing secrets in the server's secret store; no keys are needed in the static browser build. Separate test/live secrets and select a stable Stripe API/SDK version during implementation.

## 4. Inputs Tony / operations must supply

| Input | Why / recipient |
|---|---|
| Seller/trading name and business contact details | Product crew: page, checkout and customer documents |
| Support email and working mailbox | Product + operations: `BARROW_SUPPORT_EMAIL`, delivery problems and refunds |
| Barrow and Plainly domain/subdomain choices, DNS and host access | Operations: HTTPS deployment; no domain has been selected here |
| Stripe dashboard access for the payments owner, account readiness and payout check | Payments: configure test/live checkout; an existing account alone does not verify readiness |
| Approved price, sales countries and tax treatment | Product/payments: consistent displayed and charged price; owner obtains appropriate advice where needed |
| Transactional email provider and sender-domain access | Payments/operations: authenticated sender, delivery and retry handling |
| Deployment secret-store access | Operations: scoped Stripe secret, webhook secret, mail credential; never paste into repo or cards |
| Optional xAI API access, model and cost ceiling | Only PLA-02; not needed to launch either static Barrow or free Plainly |

No new paid service is assumed purchased. Before committing costs, record existing hosting allocation, payment fees from Tony's account, mail/storage costs and optional model costs. Current amounts are unverified. Agree customer terms, digital delivery consent where applicable, privacy/retention and refund handling before sales; this brief does not determine Tony's legal or tax position.

Existing Barrow build variables: `BARROW_SELLER_NAME`, `BARROW_SUPPORT_EMAIL`, `BARROW_CHECKOUT_URL`, `BARROW_SITE_URL`. See `.env.example`; build variables must actually be exported by the build environment.

Plainly: Node 24.19.0/npm 11.9.0, `npm ci`, `npm run build`, then supervised `npm start` behind TLS on loopback. Deploy `.output/`. Keep rewrite disabled initially. Enabling later requires build flag `VITE_PLAINLY_REWRITE_ENABLED=true` plus runtime `PLAINLY_REWRITE_ENABLED`, `XAI_API_KEY`, `XAI_MODEL`, `PLAINLY_ORIGIN`, `PLAINLY_DATA_DIR`; see release guide. Default 50 attempts/day and three/minute is a usage ceiling, not a monetary guarantee. All workers must share the durable quota directory; independent replicas are unsupported by the current implementation.

## 5. Launch evidence required

- Clean checkout/build and current CI pass for the exact release SHA. Review is complete; deployment manifest records SHA and configuration names, without values of secrets.
- Barrow: only `storefront-dist/` is publicly served. Private files, source and operator paths return 404. Correct checkout, seller details, mobile layout, TLS and headers verified at the actual host.
- Stripe test-mode purchase: approved amount/currency, recorded paid order, receipt, automatic delivery email and both correct files. Closing checkout before return still delivers. Repeat/concurrent webhooks create one entitlement; invalid, unpaid, wrong-product and wrong-mode events create none. Test delayed payment paths if enabled.
- Delivery: mail outage followed by recovery, worker restart, expired/invalid token, support reissue and refund handling tested. Restore a backup and confirm paid-but-unsent orders resume. Capture redacted order/event IDs and results.
- Live configuration reviewed separately from test mode. Controlled legitimate live purchase with an authorised buyer confirms the live payment-to-delivery path; do not use Stripe test cards in live mode. Record refund outcome if that purchase is refunded. A sandbox pass alone is insufficient evidence of live fulfilment.
- Plainly: `/healthz`, process restart, draft reload/Clear, dialect toggle, skill download and mobile view work; disabled Rewrite is honest. If enabled, verify actual provider calls, timeout/limit behaviour, shared quota persistence and 40 KB ingress limit.
- Support mailbox tested. Monitoring reaches the named operator. Rollback rehearsed. Failure procedure: disable the Stripe Payment Link and publish Barrow preview to stop new sales, while retaining fulfilment for existing paid orders. Plainly can revert to the prior build with rewriting disabled.

## 6. Operating handoff and portfolio boundaries

Chief of staff owns the launch checklist and decides readiness from evidence. Assign someone to failed fulfilment alerts and support; this is low-maintenance, not unattended. Review early sales, customer usefulness, refund reasons and support time before building more. [Inference] A working checkout cannot establish demand; distribution remains necessary. No unsolicited automated outreach has been sent.

Verified archive actions this session: canon, shelf, nocturne, cadence, harbor, mint, nightshift, narrow, gauntlet, hermes-floor and kiln are archived. Tony explicitly retained `coreys-thing` and `bullshit-radar`; both were verified active. Earlier disposition advice is superseded for those two. No repositories were deleted. Do not assign crews to unarchive the eleven or alter core infrastructure as part of this release.

Use the crews' existing authorised GitHub identities. Do not copy or rely on the temporary PAT from this conversation; Tony intends to revoke it after verifying this handover. This document contains no credentials. Work packets are ready for assignment; no cards, crew notifications, merges or deployments were performed as part of this handover.
