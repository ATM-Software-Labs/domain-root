# Root Domain Edge Gateway and Wildcard 404

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://yourdomain.com)
[![Status](https://img.shields.io/badge/Status-Operational-107c41?style=flat-square)](#)
[![Design](https://img.shields.io/badge/Design_System-Mica_Corporate-0078d4?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](./LICENSE)

Root Gateway: [yourdomain.com](https://yourdomain.com)

The apex domain gateway and wildcard 404 error handler for the entire `yourdomain.com` zone on Cloudflare.

---

## Architecture and Routing Behavior

1. Apex Canonical Redirection: Requests reaching the root apex domain are automatically and transparently routed to the central ecosystem hub at [subdomain.yourdomain.com](https://subdomain.yourdomain.com) via edge redirection rules.
2. Edge Diagnostic 404 Interface: In the event of an unmapped route or orphaned subdomain request, Cloudflare serves a styled fallback page providing connection telemetry, including Cloudflare Ray ID, edge datacenter location, client IP, and HTTP protocol version.
3. Security Headers: Enforces HTTP Strict Transport Security (HSTS), X-Content-Type-Options, Referrer-Policy, and content security restrictions via `_headers`.

---

## Repository Structure

```
domain-root/
├── .github/
│   └── workflows/
│       └── ci.yml       # Edge routing assets and header integrity validation
├── public/              # Static routing assets deployed to Cloudflare Pages
│   ├── _headers         # Edge security policies, HSTS, and caching headers
│   ├── _redirects       # Apex root routing rules directing to subdomain.yourdomain.com
│   ├── 404.html         # Corporate diagnostic error page with Cloudflare Ray ID telemetry
│   └── index.html       # Edge fallback landing page
├── package.json         # Project manifest and deployment scripts
└── wrangler.toml        # Cloudflare Pages deployment configuration
```

---

## Branching Model

- `main`: Production branch. Automatically deployed to `yourdomain.com`.
- `develop`: Staging and testing branch for routing updates, header policies, and diagnostic templates.

---

## Deployment Instructions

Deployments are executed directly through Wrangler to Cloudflare Pages:

```bash
npx wrangler pages deploy . --project-name domain-root --commit-dirty=true
```

---

## Author

Your Name  
- Website: [your-portfolio.com](https://your-portfolio.com)  
- GitHub: [@your-github-username](https://github.com/your-github-username)

---

## License

Copyright (c) 2026 Your Name. Released under the MIT License.

