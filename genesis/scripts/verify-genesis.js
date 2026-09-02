/**
 * MOOD Genesis Verification Script
 * Version: v0.1.0
 *
 * Verifies that the recorded genesis hash matches the computed hash
 * of the current genesis files.
 *
 * Usage:
 *   node scripts/verify-genesis.js
 *
 * Exit codes:
 *   0 - Genesis state is valid
 *   1 - Genesis state mismatch or error
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const GENESIS_DIR = path.join(__dirname, '..');

const GENESIS_FILES = [
  'genesis.json',
  'contributors.json',
  'contributions.json',
  'genesis-proofs.json',
  'genesis-reputation.json'
].map(f => path.join(GENESIS_DIR, f));

function computeGenesisHash() {
  const contents = GENESIS_FILES.map(filePath => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${path.basename(filePath)}`);
    }
    return fs.readFileSync(filePath, 'utf8');
  });

  const combined = contents.join('\n---\n');
  return crypto.createHash('sha256').update(combined, 'utf8').digest('hex');
}

function readRecordedHash() {
  const hashFilePath = path.join(GENESIS_DIR, 'genesis-hash.txt');
  if (!fs.existsSync(hashFilePath)) {
    return null;
  }

  const content = fs.readFileSync(hashFilePath, 'utf8');
  const match = content.match(/SHA256:\s*([a-f0-9]{64})/);
  return match ? match[1] : null;
}

function verify() {
  console.log('MOOD Genesis Verification');
  console.log('========================\n');

  const computedHash = computeGenesisHash();
  console.log(`Computed SHA256: ${computedHash}\n`);

  const recordedHash = readRecordedHash();

  if (!recordedHash) {
    console.log('✗ No recorded hash found. Run initialize-genesis.js first.\n');
    return false;
  }

  console.log(`Recorded SHA256: ${recordedHash}\n`);

  if (computedHash === recordedHash) {
    console.log('✓ Genesis state is VALID');
    console.log('  All genesis records are intact and unmodified.\n');
    return true;
  } else {
    console.log('✗ Genesis state MISMATCH');
    console.log('  The genesis records have been modified since initialization.\n');
    console.log('  Expected:', recordedHash);
    console.log('  Got:     ', computedHash);
    console.log('');
    return false;
  }
}

if (require.main === module) {
  const valid = verify();
  process.exit(valid ? 0 : 1);
}

module.exports = { verify, computeGenesisHash, readRecordedHash };
