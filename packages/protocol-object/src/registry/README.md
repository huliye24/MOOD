# Object Registry Layer

**Status:** NOT IMPLEMENTED — Alpha 002 placeholder.

## Purpose

This directory will hold the object registry: the authoritative
management of

- **object types** — which types exist beyond `contribution`, and what
  payload schema each one requires
- **versions** — how an envelope version (v0.1 → v0.2 → …) changes what
  validators accept, without breaking old objects
- **schemas** — the payload schema for each type, so a node can
  validate an object of a type it has never minted

Today all three live as constants in `src/schema.js`, which is correct
for exactly one type. A registry becomes necessary when a second type
or a second version exists.

## Rules for whoever implements this

- Nothing is registered implicitly: a type or version exists when the
  registry says so, with its schema, or it does not exist.
- Registration must never reinterpret an already-minted object.
- Until this layer is real, `src/schema.js` remains the single source
  of truth.
