# MOOD Contribution Portal

## Overview

This is the minimal frontend demo for the MOOD Contribution Registry.

## Purpose

Demonstrate that the MOOD Network can record contributions.

## Features

- View contribution history
- Submit new contributions
- Filter by type and status
- View contributor statistics

## Architecture

```
frontend/portal/contributions/
├── page.tsx          # Main contribution portal page
└── README.md         # This file
```

## API Integration

The portal connects to:

```
POST /api/contributions  - Create contribution
GET  /api/contributions  - List contributions
GET  /api/contributions/:id - Get specific contribution
```

## Version

```
MOOD Contribution Portal v0.1.0
Genesis Phase
```
