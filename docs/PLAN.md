# studioindi08.com build plan

Status: approved 7 October 2026. Direction B (Signal) chosen.

## Assumptions

- Indi Gupte is a student. The "08" is a birth year, so Indi is 17 or 18. We publish only what Indi and their family are happy to share.
- "Sign-ups" means people joining an email list to hear about new posts and projects.
- The blog will be written in plain text files (Markdown). No login, no database.
- Traffic will be modest to start. The hosting bill should sit well under £2 a month.
- You have owner access to the GoDaddy account and the AWS account.

## Pages and sections

| Page | Purpose | Sections | Call to action |
| --- | --- | --- | --- |
| Home `/` | First impression | Name and one line about Indi. Three featured projects. Latest blog post. Sign-up box. | Join the list |
| About `/about/` | Who Indi is | Short bio. What Indi is into. A simple timeline. Photo. | Join the list |
| Projects `/projects/` | What Indi makes | Grid of project cards. Filters by type (code, media, other). | Open a project |
| Project page `/projects/<name>/` | One project in depth | Summary, images, links, what Indi learned. | Join the list |
| Blog `/blog/` | Writing | List of posts, newest first. | Read a post |
| Post `/blog/<slug>/` | One post | Title, date, body, share links. | Join the list |
| Contact `/contact/` | Get in touch | Short form or email link. Social links. | Send a message |
| 404 | Lost visitors | Friendly message and links back. | Go home |

Extras: RSS feed, sitemap, robots.txt, one share image used across the site.

## Tech stack

- **Eleventy (11ty)**, a static site generator. You write pages as Markdown files and it turns them into plain HTML. No server, nothing to patch, very fast. Easier for a beginner than Astro or Next.js.
- **Plain CSS** with a small set of custom properties for colour and spacing. No framework, so the site stays light and you can read every line.
- **Minimal JavaScript**. A menu toggle and nothing else unless a feature needs it. Good for Lighthouse and accessibility.
- **Email list via a free third-party service** (Buttondown or Kit). A static site cannot store sign-ups itself, so the form posts to the service.

## Hosting and deployment

Changed on 7 October 2026: GitHub Pages instead of S3 and CloudFront, because the domain was already pointed at GitHub Pages and it costs nothing.

- **GitHub Pages** stores and serves the built site over HTTPS. Free for a public repository.
- **GitHub Actions** (`.github/workflows/deploy.yml`) builds the site and publishes it on every push to the live branch.
- **Route 53 hosted zone** holds the DNS records: A records for studioindi08.com pointing at GitHub Pages, and www pointing at the same place. About $0.50 a month, the only cost.
- **GoDaddy** keeps the domain registration, with its nameservers pointed at Route 53.
- The repository must stay public for free Pages hosting, so private files are encrypted before they are committed (see `scripts/encrypt-file.mjs`).

## Stages and models

| Stage | What happens | Model | Why |
| --- | --- | --- | --- |
| 1 | Plan (this file) | Opus 5.5 | Design decisions need judgement, not speed |
| 2 | Two visual directions | Opus 5.5 | Same reason |
| 3 | Scaffold: Eleventy, layouts, base CSS, home page | Sonnet 5.5 | Routine build, fast and cheap |
| 4 | About, Projects, Contact pages and content | Sonnet 5.5 | Routine build |
| 5 | Blog, RSS, sign-up form, share image, 404 | Sonnet 5.5 | Routine build |
| 6 | GitHub Pages deploy workflow, DNS, HTTPS | Sonnet 5.5 | Done. Standard workflow, little to go wrong |
| 7 | Quality check against the criteria, Lighthouse fixes | Opus 5.5 | Review work |
| 8 | Maintenance guide | Sonnet 5.5 | Writing |

Switch to Fable 5.1 any time a bug survives two attempts on Sonnet.

## Quality criteria (checked at stage 7)

- Responsive at 360px, 768px and 1280px.
- WCAG 2.1 AA: contrast, focus states, keyboard menu, skip link, alt text.
- Lighthouse 90+ on all four scores.
- Title, meta description and Open Graph tags with a share image on every page.
- One call to action per page.
- No secrets in the repo. AWS access via a least-privilege role.
- HTTPS on both studioindi08.com and www.studioindi08.com.
