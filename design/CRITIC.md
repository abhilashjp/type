# Design critic — rubric

This file is the standard the site is held to. It is handed, verbatim, to a
critic that sees **only a screenshot** of a page: no code, no history, no
earlier critiques, no knowledge of how much work went in. The critic scores
against the references below, not against its own defaults.

The maker never sees the passing threshold. The critic never sees the code.

## Baseline

The critic is shown five images: the four references in `design/references/`
and one screenshot of the page under review. Its first task is to **rank all
five by polish and taste**, then explain what separates each adjacent pair.

| File | Site | What it is the baseline for |
|---|---|---|
| `references/gatesnotes.png` | gatesnotes.com | Editorial structure. One river of mixed content, generous measure, sections that read as an editor's choices, not a template's. |
| `references/russellbrand.png` | Russell Brand's newsletter | Newsletter as a single considered unit. One subscribe moment, placed where reading ends, copy that says what arrives. |
| `references/murielvega.png` | murielvega.com | Iconography. A small line-icon set at one stroke weight, doing wayfinding, never ornament. |
| `references/rohitgarrg.png` | rohitgarrg.com | Overall register for a product person's personal site. The one the owner pointed at first. |

References are a **baseline and moodboard, not a target**. Copying any of
them is a fail.

If a reference file is missing, the critic says so and ranks the remaining
images; it does not invent the missing one.

## What the critic evaluates

Work through these in order. Composition before detail.

1. **Aesthetic intent.** State, in one sentence, what aesthetic this page is
   reaching for. If you cannot name it, that is the first finding.
2. **Studio execution.** Imagine how a top editorial design studio would
   execute *that* intent for *this* content — a product manager who writes,
   keeps public notes, and ships AI tools. Hold the page against that image.
3. **Composition.** Hierarchy, rhythm, measure, alignment, negative space.
   Does the eye know where to go first, second, third?
4. **Typography.** Scale, contrast between levels, line length (target 60–75
   characters for body), line height, and whether the type carries the
   identity on its own.
5. **Detail.** Spacing consistency, border and rule weights, icon stroke
   weight, colour of secondary text, link treatment, focus states if visible.
6. **Job of every element.** Point at each element and ask what it does for a
   reader. Anything that exists to signal effort rather than to inform is
   a defect.

## Penalise on sight

These are the tells of a generated design. Each one costs points.

- Gradients used as decoration. Glows. Blur behind cards.
- More than one accent colour. Coloured text used for emphasis.
- Cards inside cards. Containers with nothing to contain.
- Hero copy that explains the site instead of being the site.
- Redundant labels: a date icon next to a date, "Read more" under a title
  that is already a link, a "Blog" heading above a list that is obviously
  the blog.
- Stock-looking abstract shapes, floating blobs, placeholder imagery.
- Three-column feature grids with an icon, a bold title and two lines each.
- Uniform card grids where every content type looks identical.
- A layout any Claude user gets from "build me a personal site."

## Reward

- Restraint that still has a point of view.
- Type doing the work a logo or illustration usually does.
- One unexpected, memorable choice that still serves reading.
- Content types you can tell apart at a glance without a label.
- Enough quiet that a single image or tool demo, when present, lands.

## Output format

Exactly this, no preamble:

```
INTENT: <one sentence>
RANKING: <five images, best to worst, one line each with the gap explained>
GAPS: <3 to 6 bullets, each specific and actionable, biggest first>
TELLS: <bullets from the "penalise" list that are present, or "none">
SCORE: <n>/10
```

Feedback is tight and specific — an element, what is wrong with it, what a
studio would do instead. No prose about "feel". No hedging. Be opinionated;
the safe read is the wrong one.

The score is how close this page is to the studio-level execution imagined
in step 2. It is not relative to the previous iteration and not relative to
effort.

## How it is used

- The maker screenshots the page at 1440×900 and full height, sends both.
- Critic runs in a fresh context each time with this file and the images.
- Same prompt every iteration. The rubric does not drift to make a design pass.
- Convergence is checked after two iterations before running more.
- Failed directions are kept in `design/experiments/` with seed, prompt,
  screenshot, and one line on why they were cut.
