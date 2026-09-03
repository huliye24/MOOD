# Object Signature Layer

**Status:** NOT IMPLEMENTED — Alpha 002 placeholder.

## Purpose

This directory will hold the issuance-signature layer: proof of
**"Who created this object?"**

Alpha 001 answers *what* an object says — content addressing means the
ID recomputes from the content on every node. It does not yet prove
*who* minted the object: `issuer.nodeId` is a declaration, not a
signature. This layer will close that gap by signing object content
with the issuing node's key and verifying those signatures on any
node.

## Rules for whoever implements this

- No fake signatures, no placeholder keys, no mock cryptography —
  before the real layer lands, this directory stays a README.
- The v0.1 object schema, the ID derivation, and the SHA-256 canonical
  hash are not modified by signatures; a signature rides alongside
  content, it never redefines identity.
- Key material lives in the node identity layer
  (`~/.mood/identity/`), never inside a protocol object.
