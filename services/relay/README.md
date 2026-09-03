# MOOD Relay Service

Minimal WebSocket relay for federated node communication.

## ⚠️ Important Notice

This relay is in **alpha** and is for **local development only**.

- **DO NOT** deploy to production without explicit human approval
- This relay does NOT hold private keys or sign objects
- This relay does NOT decide validity or produce reputation
- This relay does NOT perform token operations

## What This Relay Does

The relay provides minimal message forwarding for federated nodes:

- Accepts WebSocket connections from nodes
- Forwards signed protocol objects between nodes
- Broadcasts node manifests
- Broadcasts inventory requests
- Broadcasts snapshot attestations

## What This Relay Does NOT Do

- ❌ Hold node private keys
- ❌ Sign protocol objects on behalf of nodes
- ❌ Modify protocol objects
- ❌ Decide if contributions are valid
- ❌ Produce reputation or权益
- ❌ Execute remote commands
- ❌ Perform token/wallet operations
- ❌ Replace peer-to-peer verification

## Running Locally

```bash
# Install dependencies
npm install

# Start the relay
npm start

# Or with custom port
RELAY_PORT=8080 npm start
```

## Configuration

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `RELAY_PORT` | 8080 | WebSocket port |
| `NETWORK_ID` | mood-testnet-001 | Network identifier |

## Testing

```bash
# Start the relay in one terminal
npm start

# Run tests in another terminal
npm test
```

## Deployment Considerations

For production deployment:

1. **TLS Required**: Use `wss://` for encryption
2. **Authentication**: Add API keys or certificates
3. **Rate Limiting**: Prevent abuse
4. **Monitoring**: Add metrics and logging
5. **High Availability**: Run multiple instances behind load balancer
6. **Audit Logging**: Log all protocol events

**DO NOT DEPLOY WITHOUT:**
- Code review
- Security audit
- Operational testing
- Human approval

## Architecture

```
Node A ──┐                    ┌── Node B
         │                    │
         ▼                    ▼
        ┌─────────────────────┐
        │  WebSocket Server   │
        │  - Forward messages │
        │  - Track peers      │
        │  - No signing       │
        └─────────────────────┘
                  ▲
                  │
                  └── Node C
```

## License

AGPL-3.0
