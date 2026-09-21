# Eventxpertz booth — procedural preview

Stylized Three.js reconstruction of `event-work-2.png`. Hidden surfaces and dimensions are inferred from one image; this is not a measured fabrication model.

## Run

```sh
cd booth-preview
npm install
npm run dev -- --port 5188
```

Open http://127.0.0.1:5188/new/booth/. Drag to orbit, scroll to zoom, click a part, or use Front, Orbit, Explode and Wireframe. `?capture` hides the interface for reference comparison. Build with `npm run build`.

## Current status: incomplete, quality gate stopped

Blockout, structure and form passes were accepted. The material pass is blocked: maximum palette delta-E is 23.42 against a limit of 20.0. The skill stopped at its six-correction total limit before another change. Thresholds and correction limits have not been relaxed.

Latest evidence: `../.img2threejs/evidence/material-r1/`. Silhouette IoU: 0.9299. Multi-angle, turntable, sampled self-intersection and interior diagnostics passed. Attachment diagnostics report zero worn/held attachments; they do not establish all physical connections. Reference-derived wood and fabric visible-footprint comparisons passed with scores 0.9385 and 0.8539 and no listed mismatches. Browser capture reported no errors.

Surface, lighting, interaction and optimization passes remain unfinished. UI controls exist but have not completed the interaction acceptance pass; mobile framing needs adjustment. Practical shelf lighting is unfinished. Current render counters include shadow/transmission passes: 220258 rendered triangles and 547 calls, not unique mesh geometry. Final performance and action-readiness acceptance remain pending. The footer's blockout label is an old development label.

## Source and evidence

- `src/createObjectModel.ts`: generated semantic component hierarchy.
- `src/refineGeometry.ts`: procedural closed ribbons, rounded textiles, coat forms and branding.
- `src/main.ts`: browser scene and controls.
- `../.img2threejs/object-sculpt-spec.json`: authoritative sculpt specification and review history.
- `../.img2threejs/state.json`: stopped pipeline and remaining checklist.
- `../.img2threejs/scope_factory.py`: splits generated construction into TypeScript-checkable functions after generation.

The main site postbuild installs and builds this preview, then copies it to build/new/booth. Netlify serves both /new/booth and /new/booth/. Model acceptance remains incomplete as documented above.
