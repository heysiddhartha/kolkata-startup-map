# Kolkata Startup Map

**Live:** https://heysiddhartha.github.io/kolkata-startup-map/

A map-first public directory for discovering Kolkata's startup and company ecosystem, with hiring signals and curated ecosystem news.

## What is included

- Interactive Kolkata map + grid directory
- Search by company, sector, area and stage
- Hiring and fresher-friendly filters
- Public-source job listings with direct application/source links
- Company profiles with website, LinkedIn, contact and location information
- Startup submission flow with moderation
- Latest ecosystem news, funding, cohorts, grants and events
- Daily data maintenance workflow
- Supabase-backed public directory
- Production SEO, sitemap, robots.txt, privacy page and GitHub Pages deployment
- CARTO Voyager basemap support

## Data quality

The map is a curated public-source directory, not a claim of exhaustive coverage. Company and job information can change. Official company sources are preferred for company and hiring verification; established publications and official ecosystem organizations are used for independent news coverage.

Hiring status is only shown when supported by the available evidence. Unknown is used when there is not enough evidence to make a current hiring claim.

## Updating the ecosystem

The project uses Supabase for live companies, jobs and news. A daily maintenance task searches for new or changed Kolkata companies, job openings and ecosystem developments, verifies sources, and updates the database.

Primary ecosystem sources include company websites, incubators, universities, government/programme pages, event organizers and direct employer career pages.

## Local development

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

The production Pages build uses `VITE_CARTO_API_KEY` from GitHub Actions repository secrets when available.

## Contributing

Use the **Add startup** flow on the live site to submit a company for review. Public-source corrections and improvements are welcome through GitHub.

## Maintainer

Built and maintained by [Siddhartha Sarkar](https://www.linkedin.com/in/heysiddhartha/).

Support the project via the UPI ID shown in the live site's footer.

## License

MIT
