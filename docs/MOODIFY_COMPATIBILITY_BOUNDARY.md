# MOOD / Moodify Compatibility Boundary

**Status:** Migration Record  
**Authority:** `MOOD_CANON.md`  
**Scope:** Historical identifiers retained inside the MOOD repository

MOOD and Moodify are separate projects. New public MOOD copy, routes, packages, schemas, and APIs must not introduce Moodify identity.

## Removed from the MOOD public surface

- Moodify listening and comparison UI;
- playlists and creator studio;
- creator and track pages;
- music upload, publication, and playback API routes;
- Moodify brand images and PWA identity;
- application-specific Evidence and legacy Whitepaper routes.

## Temporarily retained compatibility identifiers

The repository still contains historical `moodify-*`, `MOODIFY_*`, and `MFY-*` identifiers where immediate renaming could break:

- persisted database schemas and migration history;
- API response schema contracts;
- signed Genesis messages;
- token or chain records;
- Cloudflare binding names and deployment configuration;
- fixtures, tests, audit trails, and execution evidence.

These identifiers are migration inputs. They do not grant Moodify product authority over MOOD.

## Migration rule

Each retained identifier may be replaced only with an explicit compatibility plan containing:

1. the current producer and consumers;
2. stored-data impact;
3. dual-read or versioning strategy;
4. rollback procedure;
5. test evidence;
6. human approval for deployment or irreversible state changes.

Historical documents remain historical evidence. They must not be rewritten merely to make the past appear consistent with the current Canon.
