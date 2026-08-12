# Circle of Fifths Decoder

A practice tool for reading key signatures and chord progressions off the circle of fifths.

Live at <https://musician.dennywiseman.com/circle-of-fifths-decoder/>

## Develop

```sh
npm install
npm run dev
```

## Deploy

Pushes to `main` build and publish to Cloudflare Pages via
`.github/workflows/deploy.yml`.

### URL layout

`musician.dennywiseman.com` hosts one tool per path prefix. A Cloudflare Pages
custom domain binds the **entire hostname** to a single Pages project — it
cannot be scoped to a path — so this app instead builds into a matching
subdirectory:

- `vite.config.ts` sets `base: '/circle-of-fifths-decoder/'` and
  `build.outDir: 'dist/circle-of-fifths-decoder'`
- the workflow publishes `dist/` as the site root

The result is that `dist/` looks like the shared subdomain's root, with this
tool occupying its own prefix inside it.

Adding a second tool means `musician.dennywiseman.com` can no longer point
straight at this project. At that point put a Cloudflare Worker on the hostname
that proxies each path prefix to its own Pages project's `*.pages.dev` origin —
because every tool nests its build under its own prefix, the Worker can forward
requests unchanged, with no path rewriting.

### One-time Cloudflare setup

1. Create a Pages project named `circle-of-fifths-decoder` (direct upload /
   Wrangler, not the Git integration — this workflow does the building).
2. Create an API token with the **Cloudflare Pages: Edit** permission.
3. Add repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
4. Push to `main` (or run the workflow manually) to produce a first deployment.
5. In the project's **Custom domains**, add `musician.dennywiseman.com`.
   Cloudflare adds the CNAME automatically when the zone is on Cloudflare DNS;
   otherwise point a CNAME at `circle-of-fifths-decoder.pages.dev` at your
   registrar.

The subdomain root (`/`) has no content and returns the Pages 404 until a
landing page or the router Worker above is added.
