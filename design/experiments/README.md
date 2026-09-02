# Experiments

Seeded homepage explorations. Each one derives its direction from a random
string (String Seed of Thought, Sakana AI) so that the variety comes from
outside the model rather than from asking for it. The seed and the reading
of it are recorded so the derivation can be judged, not just the result.

All five use the same real content: the nine essays on this site, the about
text, and three sample notes and three sample tools that stand in for
collections that don't exist yet. Sample entries are marked in the source.

Fonts in the screenshots are what the build container can render:
Liberation Serif for serif, Liberation Sans for grotesque, DejaVu Sans Mono
for mono. Bitstream Charter is installed but only as Type1, which Chromium
will not render, and nothing can be downloaded from here. The stacks name
Charter first so a self-hosted webfont drops in without touching the CSS.
Judge structure, hierarchy and rhythm from these; judge the serif later.

| # | Seed | Reading | Direction |
|---|---|---|---|
| 01 | `od2ONHAL3F3ImQ0xq0iEyWTDNfdeYgmaBCskDFTL` | `q0xq0` repeats like a meter; `3F3` mirrors; `fde` runs in sequence. Rhythm, rule, register. | **Ledger.** One ruled column. Every piece of content is a numbered entry with a date and a kind. Mono for figures, serif for entries. One red rule, as in an accounting book. |
| 02 | `q5CYbqucPOSXOUsTgIvwDIwtfN0UTfpuKOTG5oAn` | Two `5`s frame the string; `POSXOUS` and `N0UT` read as position and *out*. Framed, outward, columns. | **Broadsheet.** Centred masthead, three ruled columns, headline size by importance. Notes in the narrow gutter column, tools in the right. No accent colour at all. |
| 03 | `AL6an4qJm7Kgvl2zyVngiSWeh2Ek0DY0JVtuNb5C` | Digits interleave the letters throughout; `Ek0DY0` sits like a pair of marginal marks. Annotation. | **Field notebook.** A reading column with a wide margin that carries sidenotes: dates, kinds, related links. Notes live in the margin, literally. Pencil grey and one red for numerals. |
| 04 | `eqcfqFFGCOfOaSw5jEydG00tfIjgmFYzNLPFIsoD` | `Iso` appears verbatim; `FFG` and `OfO` are heavy and symmetric; `eq` opens it. Standards, grid, equality. | **Swiss.** Strict 12-column grid, grotesque only, flush left. Name set enormous and lowercase. Content as aligned rows. One red square as the only mark. |
| 05 | `MCGK2eMU3WkNazJdmTTe5VBR1sF9KcPywcKlap7U` | Hard consonants throughout (`MCGK`, `TT`, `Klap`); digits are all primes or one. Percussive, singular. | **Specimen.** Each section is one enormous word — WORK, NOTES, TOOLS, MAIL — with the content set small beneath it. Black on white, nothing else. The one that sounds like it can't work. |

## 06 — Nalukettu

Not seeded. Built after all five above were rejected as bland, from the
reference the owner pointed at (mengto.github.io/towers) and the four
Three.js skills in MengTo/Skills that Towers was made from: `threejs-landscape`,
`threejs-towers`, `threejs-weather`, `add-mouse-driven-orbit`. A Kerala
nalukettu assembles behind a rising clip plane in a paddy field, bamboo
scaffolding one stage ahead, Malayalam stage captions, four times of day.
Type layer sits over the scene; the writing is below the fold in the quiet
register. Three.js is vendored in `assets/` so it runs offline; no other
dependencies. Verified here at 1.4M triangles in 27 draw calls.

Known rough edges at this commit: the grove overlaps the masthead at the
top left, the paddy is still busy behind the numeral, the small labels at
right are hard to read on green, and the mukhappu gables are barely visible.

## 07 — The index is the object

The direction that replaced 06 after it was called out as a Towers copy.
No landscape, no timeline, no play button. Every entry on the site is a
slab: length is its word count, thickness and material are its kind
(essay, note, tool). They stack oldest to newest into one object that
stands behind the page. The reading line at 42% of the viewport picks the
current entry; the camera descends the stack course by course as you
read, the course lifts and takes the accent, and a projected mono tag
reads its real length. When the current entry is a tool it opens as a
surface beside its slab with a sample run already in it; on phones the
same surface sits inline under the row. The stack rises out of the ground
on arrival, oldest first, and skips that under reduced motion. Editorial
column with container lines on the left; the object owns the right.

Mechanics taken from the skills, not their look: self-assembly as the
motion thesis (`threejs-towers`), scroll as the timeline with one
persistent scene (`build-threejs-scroll-worlds`), a backdrop that gets out
of the way (`threejs-landscape`, reduced here to a shadow-only plane),
mono utility labels with one accent (`editorial-tech`, `container-lines`,
`number-details`), and the real workflow as the proof (`product-proof-saas`).
182 triangles, 16 draw calls.

The three tools and their sample runs are placeholders for tools that do
not exist yet; they are marked in the source and labelled "sample run" on
the page.

Each directory holds `index.html`, the screenshots produced by
`design/shot.sh`, and after review a `VERDICT.md` with the critic's output
and one line on why it was kept or cut.
