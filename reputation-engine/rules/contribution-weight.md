# Contribution Weight Rules v0.1

## Overview

Each contribution type has a base weight that reflects its value to the MOOD Network.

## Weight Definitions

### Protocol (Weight: 10)
**Highest value contributions**

Core protocol design and architecture work that defines how the network operates.

Examples:
- Network architecture design
- Protocol specification
- Core consensus mechanism
- Security model design

### Code (Weight: 8)
**High value technical contributions**

Implementation of software that powers the network.

Examples:
- Smart contract development
- Backend services
- AI/ML modules
- Client applications
- API implementations

### Infrastructure (Weight: 7)
**Critical network operations**

Work that keeps the network running reliably.

Examples:
- Node operation and maintenance
- Deployment automation
- CI/CD pipelines
- Hosting services
- Monitoring systems

### Research (Weight: 6)
**Knowledge generation**

Analysis and research that improves network understanding.

Examples:
- Academic papers
- Algorithm research
- Economic modeling
- Security audits
- Performance analysis

### Community (Weight: 4)
**Ecosystem growth**

Work that grows and supports the community.

Examples:
- Event organization
- Community management
- Mentorship
- Educational content
- Support activities

### Documentation (Weight: 3)
**Knowledge sharing**

Work that helps others understand and use the network.

Examples:
- Translation work
- Tutorials and guides
- API documentation
- Technical explanations
- Wiki contributions

## Weight Adjustments

### Proof Quality Multiplier
- **1.0** - Core protocol verification
- **0.9** - Manual review by trusted entity
- **0.8** - GitHub commit verification
- **0.7** - Automated verification
- **0.5** - Self-claimed (lowest trust)

### Impact Factor (v0.1)
Fixed at **1.0** — future governance may adjust this.

## Final Score Formula

```
Score = Type Weight × Proof Quality × Impact Factor
```

## Examples

| Contribution | Type Weight | Proof Quality | Impact | Final Score |
|-------------|-------------|---------------|--------|-------------|
| Protocol Architecture | 10 | 1.0 | 1.0 | 10 |
| Backend API | 8 | 0.8 | 1.0 | 6.4 |
| Node Setup | 7 | 0.7 | 1.0 | 4.9 |
| Research Paper | 6 | 0.9 | 1.0 | 5.4 |
| Community Event | 4 | 0.8 | 1.0 | 3.2 |
| Documentation | 3 | 0.7 | 1.0 | 2.1 |
