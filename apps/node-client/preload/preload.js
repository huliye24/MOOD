/**
 * MOOD Node Desktop Client - Preload Script
 *
 * Minimal preload API exposed to renderer.
 * Security: Only exposes specific, validated operations.
 *
 * @module preload/preload
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('moodNode', {
  // ─── Node Status ───────────────────────────────────────────────────────────

  /**
   * Get node status
   * @returns {Promise<object>} Node status
   */
  getStatus: () => ipcRenderer.invoke('node:getStatus'),

  /**
   * Get node identity
   * @returns {Promise<object>} Node identity
   */
  getIdentity: () => ipcRenderer.invoke('node:getIdentity'),

  /**
   * Get connected peers
   * @returns {Promise<Array>} List of peer node IDs
   */
  getPeers: () => ipcRenderer.invoke('node:getPeers'),

  // ─── Connection ─────────────────────────────────────────────────────────────

  /**
   * Connect to relay
   * @returns {Promise<object>} Connection result
   */
  connect: () => ipcRenderer.invoke('node:connect'),

  /**
   * Disconnect from relay
   * @returns {Promise<object>} Disconnection result
   */
  disconnect: () => ipcRenderer.invoke('node:disconnect'),

  // ─── Contributions ─────────────────────────────────────────────────────────

  /**
   * Get all contributions
   * @returns {Promise<Array>} List of contributions
   */
  getContributions: () => ipcRenderer.invoke('node:getContributions'),

  /**
   * Create a test contribution
   * @returns {Promise<object>} Creation result
   */
  createTestContribution: () => ipcRenderer.invoke('node:createTestContribution'),

  // ─── Snapshots ────────────────────────────────────────────────────────────

  /**
   * Get all snapshots
   * @returns {Promise<Array>} List of snapshots
   */
  getSnapshots: () => ipcRenderer.invoke('node:getSnapshots'),

  /**
   * Get latest snapshot
   * @returns {Promise<object|null>} Latest snapshot or null
   */
  getLatestSnapshot: () => ipcRenderer.invoke('node:getLatestSnapshot'),

  /**
   * Create epoch snapshot
   * @returns {Promise<object>} Snapshot result
   */
  createEpochSnapshot: () => ipcRenderer.invoke('node:createEpochSnapshot'),

  /**
   * Export proof bundle
   * @returns {Promise<object>} Export result
   */
  exportProofBundle: () => ipcRenderer.invoke('node:exportProofBundle'),

  // ─── Invitation / Enrollment ───────────────────────────────────────────────

  /**
   * Import invitation file
   * @returns {Promise<object>} Import result
   */
  importInvitation: () => ipcRenderer.invoke('node:importInvitation'),

  /**
   * Enroll with invitation
   * @param {string} memberEmail - Member's email address
   * @returns {Promise<object>} Enrollment result
   */
  enrollWithInvitation: (invitation, memberEmail) =>
    ipcRenderer.invoke('node:enrollWithInvitation', { invitation, memberEmail }),

  // ─── Data Management ──────────────────────────────────────────────────────

  /**
   * Delete all local data (requires confirmation)
   * @param {boolean} confirmed - Must be true to delete
   * @returns {Promise<object>} Deletion result
   */
  deleteData: (confirmed) => ipcRenderer.invoke('node:deleteData', { confirmed }),

  /**
   * Export encrypted backup
   * @param {string} password - Encryption password
   * @returns {Promise<object>} Export result
   */
  exportBackup: (password) => ipcRenderer.invoke('node:exportBackup', { password })
});

// ─── Version Info ─────────────────────────────────────────────────────────────

contextBridge.exposeInMainWorld('moodVersion', {
  client: '0.1.0-alpha.1',
  protocol: '0.2.0',
  network: 'mood-testnet-001',
  buildDate: new Date().toISOString(),
  environment: process.env.NODE_ENV || 'development'
});

// ─── Constants ───────────────────────────────────────────────────────────────

contextBridge.exposeInMainWorld('moodConstants', {
  NODE_TYPES: ['compute', 'developer', 'gateway'],
  NETWORK_IDS: {
    TESTNET_001: 'mood-testnet-001',
    LOCAL: 'mood-local'
  },
  STATUS_LABELS: {
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
    connected: 'Connected',
    authenticated: 'Synchronized',
    error: 'Error'
  }
});
