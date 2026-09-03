# Genesis Object Layer

**Status:** NOT IMPLEMENTED — Alpha 002 placeholder.

## Purpose

This directory will hold the definition of the **MOOD Network Genesis
Object** — the first object, from which the network's object state is
derived.

The existing node-network genesis history (snapshots, genesis block)
is owned by `@mood/node-runtime` and is NOT modified by this layer.
A protocol-object genesis is a separate question: which object anchors
the chain of objects, so that later state transitions have a
well-defined root.

## Rules for whoever implements this

- The genesis object must be defined by spec before it is minted —
  it is the one object that cannot be re-derived or replaced.
- Do not touch the node runtime's genesis history, the identity
  system, or the hash algorithm.
- Until this layer is real, there is no genesis object, and that fact
  is part of Alpha 001's honest state.
