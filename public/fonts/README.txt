KROHN — Font assets
====================

Drop the following files into this folder. They are referenced from
src/styles.css via @font-face.

  Condor-Regular.woff2        (Condor, weight 400)
  Condor-Medium.woff2         (Condor, weight 500)
  GillSans-Light.woff2        (Gill Sans, weight 300)
  GillSans-Regular.woff2      (Gill Sans, weight 400)

Notes
-----
- Condor is a commercial typeface (The Pyte Foundry). A valid web license
  is required before shipping to production.
- Gill Sans is not a free/open font either. Ensure the chosen foundry
  (Monotype / Linotype) allows @font-face web embedding under your licence.
- If .woff2 files aren't available yet, the site will fall back to
  Times New Roman (display) and Helvetica Neue (body) — check styles.css
  to adjust fallbacks.
