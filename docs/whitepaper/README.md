# MOOD Protocol Whitepaper

**Version:** 0.1 Draft  
**Authority:** Subordinate to `MOOD_CANON.md`  
**Status:** Research and protocol proposal; not a production-network claim

This directory contains the first bilingual MOOD Protocol Paper. It uses the explanatory discipline of open protocol literature such as the Bitcoin whitepaper and *Mastering Bitcoin*, while defining MOOD on its own canonical terms.

## Files

- `MOOD_Protocol_Whitepaper_EN.md` - authoritative English manuscript source.
- `MOOD_Protocol_Whitepaper_CN.md` - authoritative Simplified Chinese manuscript source.
- `MOOD_Protocol_Whitepaper_EN.tex` and `MOOD_Protocol_Whitepaper_CN.tex` - generated LaTeX sources.
- `MOOD_Protocol_Whitepaper_EN.pdf` and `MOOD_Protocol_Whitepaper_CN.pdf` - rendered papers.
- `references.bib` - machine-readable bibliography.
- `figures/` - seven source-backed protocol diagrams in PNG and SVG.
- `build_whitepaper.py` - reproducible local build script.

## Build

Run from the repository root:

```powershell
python docs/whitepaper/build_whitepaper.py
```

The script generates figures, LaTeX source, and PDF output. PDF generation uses a Unicode-capable local document engine and embeds the repository's figure assets. If XeLaTeX or Tectonic is available, the generated `.tex` sources can also be compiled directly.

## Truth boundary

The paper distinguishes current repository implementation, proposed protocol mechanisms, and future network requirements. It does not claim that MOOD currently operates a decentralized network, consensus mechanism, treasury, governance system, or production settlement service.
