# Circle of Fifths Decoder

A practice tool for reading key signatures and chord progressions off the circle
of fifths.

Live at <https://musician.dennywiseman.com/circle-of-fifths-decoder/>

## Develop

```sh
npm install
npm run dev
```

## Deploy

Pushes to `main` build and deploy via `.github/workflows/deploy.yml`. Hosting is
a Cloudflare **Worker with static assets** (Cloudflare's recommended path for
new projects; Pages is still supported but no longer where feature work goes).

### How the URL layout works

`musician.dennywiseman.com` hosts one tool per path prefix. Worker routes are
path-aware and the most specific matching route wins, so each tool is an
independent Worker owning its own prefix — no shared router or proxy layer.

Two details make it line up:

- **The build nests itself under its own prefix.** `vite.config.ts` sets
  `base: '/circle-of-fifths-decoder/'` and
  `build.outDir: 'dist/circle-of-fifths-decoder'`. `dist/` is the Worker's asset
  root, so the file at `dist/circle-of-fifths-decoder/index.html` is served at
  `/circle-of-fifths-decoder/`. `wrangler deploy` prints a confirmation of this
  pairing:

  ```
  • musician.dennywiseman.com/circle-of-fifths-decoder* (Will match assets: dist/circle-of-fifths-decoder*)
  ```

- **The route ends in a bare `*`, not `/*`.** `/circle-of-fifths-decoder*`
  matches both `/circle-of-fifths-decoder` and `/circle-of-fifths-decoder/…`,
  and avoids a [documented specificity bug](https://developers.cloudflare.com/workers/platform/known-issues/)
  where `/foo*` and `/foo/*` routes resolve unintuitively against each other.
  The trade-off: **tool names must not be prefixes of one another** (a
  `circle-of-fifths` tool would collide with this one).

The bare `/circle-of-fifths-decoder` form works because static-asset serving
defaults to `html_handling: "auto-trailing-slash"`, which 307-redirects it to
`/circle-of-fifths-decoder/` and then serves the folder's `index.html`.

### One-time Cloudflare setup

Steps 1–2 are shared across all tools on this subdomain and only need doing
once. Steps 3–6 are per-tool.

#### 1. Get `dennywiseman.com` onto Cloudflare as an active zone

A path-scoped route requires an active Cloudflare zone plus a **proxied** DNS
record for the hostname — routes only fire on traffic Cloudflare proxies.

1. In the Cloudflare dashboard, **Add a domain** → `dennywiseman.com`, and pick
   a plan (Free is sufficient).
2. Cloudflare shows two assigned nameservers. Set them at your registrar,
   replacing the existing ones.
3. Wait for the zone status to become **Active** (usually minutes to a few
   hours). Nothing below works until it is.

#### 2. Claim the `musician` subdomain with a landing Worker

The subdomain needs a proxied DNS record. A Worker on a **Custom Domain**
creates that record for you, and gives `/` a real page instead of an error —
per-tool path routes then run *in front of* it, so it only receives requests
that no tool claimed.

In a separate directory (this is shared infrastructure, not part of this repo):

```sh
npm create cloudflare@latest musician-landing -- --type=hello-world
```

Replace its `wrangler.jsonc` route config with a Custom Domain:

```jsonc
{
  "name": "musician-landing",
  "main": "src/index.ts",
  "compatibility_date": "2026-08-12",
  "routes": [
    { "pattern": "musician.dennywiseman.com", "custom_domain": true }
  ]
}
```

Have its fetch handler return a simple index linking to each tool, then
`npx wrangler deploy`. Cloudflare creates the proxied DNS record for
`musician` automatically. Verify `https://musician.dennywiseman.com/` loads
before continuing.

> Custom Domains do not support wildcard DNS and match the hostname exactly, so
> this Worker claims `musician.dennywiseman.com` and nothing else.

#### 3. Create the API token

Cloudflare dashboard → **My Profile** → **API Tokens** → **Create Token** →
**Create Custom Token**:

- **Permissions:** `Account` → `Workers Scripts` → `Edit`
  (this is the **Edit Cloudflare Workers** template's core permission)
- **Account Resources:** include your account
- **Zone Resources:** include `dennywiseman.com` — required because the deploy
  attaches a route to that zone

Copy the token; it is shown only once.

#### 4. Find the account ID

Cloudflare dashboard → **Workers & Pages** → the account ID is in the right-hand
sidebar (also in the URL after `/dash.cloudflare.com/`).

#### 5. Add the repo secrets

```sh
gh secret set CLOUDFLARE_API_TOKEN   # paste the token from step 3
gh secret set CLOUDFLARE_ACCOUNT_ID  # paste the ID from step 4
```

#### 6. Deploy

```sh
git push          # or: gh workflow run deploy.yml
```

The Worker and its route are created on first deploy — no manual project
creation needed. Then check <https://musician.dennywiseman.com/circle-of-fifths-decoder/>.

To deploy from your machine instead, `npx wrangler login` once, then:

```sh
npm run build && npx wrangler deploy
```

### Adding another tool later

Repeat steps 3–6 in the new tool's repo with its own name substituted in
`wrangler.jsonc` (`name`, `assets.directory` root, route pattern) and its own
`base` / `outDir` in the build config. Nothing about existing tools changes.

### Note on the pinned wrangler version

`wrangler` is pinned to exactly `4.101.0`. Versions from `4.102.0` up to at
least `4.122.0` declare a dependency on `esbuild@0.28.1`, which is not published
to npm, so they fail to install with `ETARGET`. Retry a newer version once that
upstream break is resolved.
