# MOOD Public UI Baseline

MOOD public-facing pages use one shared visual language. The website, Whitepaper, Canon, and future public routes should feel like parts of the same world.

## Default palette

- Warm ivory canvas: `#f3f1e9`
- Pale-lime light/glow: `#bcf444` (commonly rendered with transparency)
- Deep-ink text and dark controls: `#102d2b`
- Teal accent: `#007d77`
- Supporting teal: `#177f78`
- Soft sage surfaces: `#e9f0e8`, `#e8ece4`, `#e2e7de`
- The existing violet-to-cyan waveform remains the MOOD brand mark.

## Visual rule

Use the warm ivory, pale-lime, deep-ink, and teal system as the default for new public UI. Serif display typography may be paired with a clean sans-serif interface font. Rounded outline controls, generous whitespace, restrained borders, and soft radial light are preferred.

Dark themes are not the default MOOD public identity. Introduce one only for a clearly differentiated experience and with explicit design approval.

## Implementation rule

Route-specific styles must remain scoped to their route root so a new page cannot alter existing production pages. Reuse the palette above instead of inventing a separate page theme. Any deliberate exception should be documented next to the implementation.
