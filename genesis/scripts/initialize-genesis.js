/**
 * MOOD Genesis Initialization Script
 * Version: v0.1.0
 *
 * Reads the canonical genesis records, validates their structure,
 * computes a SHA256 hash of the state, and outputs the genesis ID.
 *
 * Usage:
 *   node scripts/initialize-genesis.js
 *
 * Output:
 *   - Computed SHA256 hash written to genesis-hash.txt
 *   - Genesis ID printed to stdout
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const GENESIS_DIR = path.join(__dirname, '..');

// Files to include in genesis hash
const GENESIS_FILES = [
  'genesis.json',
  'contributors.json',
  'contributions.json',
  'genesis-proofs.json',
  'genesis-reputation.json'
].map(f => path.join(GENESIS_DIR, f));

/**
 * Validate that a JSON file exists and is valid JSON
 */
function validateGenesisFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Genesis file not found: ${path.basename(filePath)}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  try {
    JSON.parse(content);
  } catch (e) {
    throw new Error(`Invalid JSON in ${path.basename(filePath)}: ${e.message}`);
  }

  return content;
}

/**
 * Compute SHA256 hash of concatenated genesis files
 */
function computeGenesisHash(contents) {
  const combined = contents.join('\n---\n');
  return crypto.createHash('sha256').update(combined, 'utf8').digest('hex');
}

/**
 * Verify the genesis state matches the recorded hash
 */
function verifyGenesisHash(recordedHash, computedHash) {
  return recordedHash === computedHash;
}

/**
 * Main initialization routine
 */
function initializeGenesis() {
  console.log('MOOD Genesis Initialization');
  console.log('==========================\n');

  const genesisFilesContents = [];

  // Step 1: Validate and read all genesis files
  console.log('Step 1: Validating genesis files...');
  for (const filePath of GENESIS_FILES) {
    const basename = path.basename(filePath);
    const content = validateGenesisFile(filePath);
    genesisFilesContents.push(content);
    console.log(`  ✓ ${basename}`);
  }
  console.log('');

  // Step 2: Compute genesis hash
  console.log('Step 2: Computing genesis hash...');
  const genesisHash = computeGenesisHash(genesisFilesContents);
  console.log(`  SHA256: ${genesisHash}\n`);

  // Step 3: Check if hash file exists and verify
  const hashFilePath = path.join(GENESIS_DIR, 'genesis-hash.txt');
  let existingHash = null;
  let hashChanged = false;

  if (fs.existsSync(hashFilePath)) {
    const hashContent = fs.readFileSync(hashFilePath, 'utf8');
    const match = hashContent.match(/SHA256:\s*([a-f0-9]{64})/);
    if (match) {
      existingHash = match[1];
      const isValid = verifyGenesisHash(existingHash, genesisHash);
      if (isValid) {
        console.log('Step 3: Hash verification');
        console.log('  ✓ Genesis state unchanged\n');
      } else {
        console.log('Step 3: Hash verification');
        console.log('  ✗ Genesis state has changed\n');
        hashChanged = true;
      }
    }
  }

  // Step 4: Generate genesis ID
  console.log('Step 4: Generating genesis ID...');
  const genesisId = `MOOD_GENESIS_${genesisHash.substring(0, 16).toUpperCase()}`;
  console.log(`  ID: ${genesisId}\n`);

  // Step 5: Write hash file if needed
  if (!existingHash || hashChanged) {
    console.log('Step 5: Writing genesis-hash.txt...');
    const hashOutput = `MOOD Genesis Hash
================

Network:      MOOD Network
Version:       v0.1.0
Phase:         Genesis
Generated:     ${new Date().toISOString()}

SHA256:        ${genesisHash}

Genesis ID:    ${genesisId}

Verification:
  Run: node scripts/verify-genesis.js
  Or:  openssl dgst -sha256 <genesis JSON files>

Files hashed:
${GENESIS_FILES.map(f => `  - ${path.basename(f)}`).join('\n')}
`;
    fs.writeFileSync(hashFilePath, hashOutput, 'utf8');
    console.log(`  ✓ Written to genesis-hash.txt\n`);
  }

  // Summary
  console.log('==========================');
  console.log('Genesis Initialization Complete');
  console.log('==========================\n');
  console.log(`Genesis ID:    ${genesisId}`);
  console.log(`SHA256:        ${genesisHash}`);
  console.log(`Hash file:     ${hashFilePath}`);
  console.log('');

  return { genesisId, genesisHash };
}

// Run if called directly
if (require.main === module) {
  try {
    initializeGenesis();
    process.exit(0);
  } catch (error) {
    console.error('Genesis initialization failed:', error.message);
    process.exit(1);
  }
}

module.exports = { initializeGenesis, computeGenesisHash, verifyGenesisHash };
