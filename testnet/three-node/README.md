# MOOD Three-Node Test

This directory contains the federated three-node test for MOOD Node Alpha.

## ⚠️ Important Disclaimer

This is an **Alpha Federated Testnet**:

- All three nodes are from the same organization (rongjingmusic.com in production setup)
- This is NOT a decentralized network
- Running this test does NOT earn tokens, financial rewards, or governance rights
- No on-chain operations are performed
- The protocol is in alpha and may change

## What This Test Does

1. **Setup**: Creates three independent node instances with different keys and data directories
2. **Create Contribution**: Node A creates a test contribution
3. **Synchronize**: Simulates network sync so all nodes have identical objects
4. **Compute Snapshots**: All three nodes compute Epoch 0001 snapshot
5. **Verify**: Verifies all digests match
6. **Export**: Creates a proof bundle with all artifacts

## Files

- `create-testnet.mjs` - Creates testnet configuration
- `run-three-node-test.mjs` - Runs the three-node test
- `fixtures/` - Test configuration fixtures
- `expected/` - Expected outputs

## Usage

```bash
# Create testnet fixtures
node create-testnet.mjs

# Run the test
node run-three-node-test.mjs
```

## Test Network

- **Network ID**: `mood-testnet-001`
- **Protocol**: v0.2 candidate
- **Client**: v0.1.0-alpha.1
- **Nodes**: 3
- **Observed Finality**: 2-of-3
- **Full Confirmation**: 3-of-3
- **Test Email Domain**: `example.invalid` (NOT real emails)

## Required Output

The test creates:

```
proof-bundle.json
node-a-manifest.json
node-b-manifest.json
node-c-manifest.json
contribution.json
verification-decisions.json
epoch-0001.snapshot.json
snapshot-attestations.json
TEST_REPORT.md
SHA256SUMS
```

## Success Criteria

The test PASSES if and only if:

```
Digest A == Digest B == Digest C
```

## Next Steps After Success

This test verifies the technical mechanics work. The next phase requires:

1. An independent second organization
2. Production relay deployment
3. Real-world email enrollment
4. Cross-organization consensus tests
5. Long-term stability testing

Until then, this is a technical test only.
