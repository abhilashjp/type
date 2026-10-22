# abhilashjohn.com

Personal site of Abhilash John Philip. Jekyll 4, deployed on Netlify.

## Writing a post

Add a Markdown file to `_posts/` named `YYYY-MM-DD-slug.md`, or use the CMS at `/admin/`.

```yaml
---
title: The post title
kind: experiment        # case study, guide, essay, notes, experiment, startup, policy, pitch
description: "One sentence, about 150 characters. Shown under the title, in search results and in llms.txt."
tags: [Pricing, AI]
---
```

## Editing the home page

- Headline, intro and the "Now" line: front matter in `index.html`.
- Side projects: `_data/projects.yml`.
- Work and education: `_data/work.yml` (also used on the About page).
- Principles: `_data/principles.yml`. The section stays hidden while the list is empty.
- The diorama and its pins: `assets/js/scene.js`.

## Running locally

```sh
bundle install
bundle exec jekyll serve
```

## Search and answer engines

Every page gets its title, description, canonical URL, Open Graph tags and JSON-LD from `_includes/seo.html`. `sitemap.xml`, `robots.txt` and `llms.txt` are generated from the posts and data files, so they stay current on their own.
