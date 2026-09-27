# Kolkata Startup Map

**Live:** https://heysiddhartha.github.io/kolkata-startup-map/

A public-source directory for discovering Kolkata and West Bengal's startup and company ecosystem, with hiring signals and curated ecosystem news.

## What is included

- Interactive map and grid directory
- Search and filters by company, locality, sector, stage and hiring signal
- Public company websites, LinkedIn profiles and careers links where verified
- Direct application sources for public job listings
- Curated ecosystem news covering funding, launches, programmes, cohorts, grants, demo days and events
- Startup submission and review workflow
- Crawlable startup and job profile pages
- Daily maintenance automation for public hiring signals and ecosystem news

## Data standards

Company identity and Kolkata connection should be verified from primary or reliable public sources before publication.

eChai and other directories may help discover companies, but they are not treated as the company source of truth.

Hiring is kept separate from company existence. If a reliable current hiring signal is unavailable, the directory shows the status as unknown rather than claiming that a company is not hiring.

Job availability can change quickly. The linked employer/application source is the final authority before applying.

The directory is curated and useful, not an exhaustive census of every registered company in Kolkata.

## Maintainer

Built and maintained by **Siddhartha Sarkar**.

LinkedIn: https://www.linkedin.com/in/heysiddhartha/

If the project is useful, support is available through the UPI option on the site.

## Development

```bash
npm install
npm run dev
npm run build
```

The scheduled GitHub Actions workflow refreshes public job signals and curated ecosystem news when the required Supabase secrets are configured.
