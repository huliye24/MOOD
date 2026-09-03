/**
 * MOOD Node Desktop Client - Main Process
 *
 * Electron main process with security best practices:
 * - contextIsolation: true
 * - nodeIntegration: false
 * - Minimal preload API
 * - Local services bound to 127.0.0.1
 *
 * @module desktop/main
 */

import { app, BrowserWindow, ipcMain, dialog, safeStorage } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Logger setup
import log from 'electron-log';
log.transports.file.level = 'info';
log.transports.file.maxSize = 10 * 1024 * 1024; // 10MB
log.info('MOOD Node starting...');

// Global reference to prevent garbage collection
let mainWindow = null;

// Node runtime instance
let nodeRuntime = null;

// Security: Disable navigation to external URLs
function setupSecurityRestrictions() {
  // Prevent new windows from opening
  app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(() => {
      return { action: 'deny' };
    });

    // Prevent navigation away from app
    contents.on('will-navigate', (event, navigationUrl) => {
      event.preventDefault();
    });
  });
}

/**
 * Create the main application window
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'MOOD Node',
    backgroundColor: '#0a0a0f',
    webPreferences: {
      // Security: Isolate preload from renderer
      preload: join(__dirname, '../preload/preload.js'),
      // Security: Disable Node.js in renderer
      nodeIntegration: false,
      // Security: Enable context isolation
      contextIsolation: true,
      // Security: Disable remote module
      enableRemoteModule: false,
      // Security: Disable web security bypass
      webSecurity: true,
      // Security: Disable dev tools in production
      devTools: !app.isPackaged
    },
    show: false,
    autoHideMenuBar: true
  });

  // Load the renderer
  mainWindow.loadFile(join(__dirname, '../renderer/index.html'));

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    log.info('Main window shown');
  });

  // Security: Prevent window from being used to navigate
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Initialize the node runtime
 */
async function initializeNodeRuntime() {
  try {
    // Dynamic import to avoid bundling issues
    const { NodeIdentityManager, StorageManager, SyncManager, SnapshotManager } = await import('../../packages/node-runtime/src/index.js');

    // Get user data directory
    const userDataPath = app.getPath('userData');
    const nodeDataDir = join(userDataPath, 'node-data');

    // Ensure directory exists
    if (!fs.existsSync(nodeDataDir)) {
      fs.mkdirSync(nodeDataDir, { recursive: true });
    }

    // Initialize identity
    const identityManager = new NodeIdentityManager({
      dataDir: nodeDataDir,
      networkId: 'mood-testnet-001'
    });

    // Check for existing identity
    const identityPath = join(nodeDataDir, 'identity.json');
    if (fs.existsSync(identityPath)) {
      identityManager.load();
      log.info('Loaded existing identity:', identityManager.nodeId);
    } else {
      identityManager.initialize();
      log.info('Created new identity:', identityManager.nodeId);
    }

    // Initialize storage
    const storageManager = new StorageManager({
      dataDir: nodeDataDir
    }).initialize();

    // Initialize sync manager
    const syncManager = new SyncManager({
      relayUrl: 'ws://localhost:8080',
      identity: identityManager.getIdentity()
    });

    // Initialize snapshot manager
    const snapshotManager = new SnapshotManager({
      dataDir: nodeDataDir,
      networkId: 'mood-testnet-001'
    }).initialize();

    nodeRuntime = {
      identity: identityManager,
      storage: storageManager,
      sync: syncManager,
      snapshot: snapshotManager
    };

    log.info('Node runtime initialized');

    return true;
  } catch (error) {
    log.error('Failed to initialize node runtime:', error);
    return false;
  }
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

/**
 * Get node status
 */
ipcMain.handle('node:getStatus', async () => {
  if (!nodeRuntime) {
    return { error: 'Node not initialized' };
  }

  return {
    nodeId: nodeRuntime.identity.nodeId,
    manifest: nodeRuntime.identity.manifest,
    storage: nodeRuntime.storage.getStats(),
    snapshot: nodeRuntime.snapshot.getStats(),
    sync: nodeRuntime.sync.getStatus(),
    protocol: {
      initialized: true,
      networkId: 'mood-testnet-001',
      protocolVersion: '0.2.0'
    }
  };
});

/**
 * Get node identity
 */
ipcMain.handle('node:getIdentity', async () => {
  if (!nodeRuntime) {
    return { error: 'Node not initialized' };
  }

  return nodeRuntime.identity.getIdentity();
});

/**
 * Get connected peers
 */
ipcMain.handle('node:getPeers', async () => {
  if (!nodeRuntime) {
    return [];
  }

  return nodeRuntime.sync.connectedPeers
    ? [...nodeRuntime.sync.connectedPeers]
    : [];
});

/**
 * Connect to relay
 */
ipcMain.handle('node:connect', async () => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  try {
    await nodeRuntime.sync.connect();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Disconnect from relay
 */
ipcMain.handle('node:disconnect', async () => {
  if (!nodeRuntime) {
    return { success: false };
  }

  nodeRuntime.sync.disconnect();
  return { success: true };
});

/**
 * Get snapshots
 */
ipcMain.handle('node:getSnapshots', async () => {
  if (!nodeRuntime) {
    return [];
  }

  return nodeRuntime.snapshot.getAllSnapshots();
});

/**
 * Get latest snapshot
 */
ipcMain.handle('node:getLatestSnapshot', async () => {
  if (!nodeRuntime) {
    return null;
  }

  return nodeRuntime.snapshot.getLatestSnapshot();
});

/**
 * Create test contribution
 */
ipcMain.handle('node:createTestContribution', async () => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  try {
    const { ProtocolAdapter } = await import('../../packages/node-runtime/src/protocol-adapter/index.js');

    const adapter = new ProtocolAdapter({
      dataDir: nodeRuntime.storage.dataDir,
      networkId: 'mood-testnet-001'
    });
    await adapter.initialize();

    const result = adapter.createContribution({
      contributorId: nodeRuntime.identity.nodeId,
      category: 'infrastructure',
      title: `Test Contribution ${Date.now()}`,
      description: 'Test contribution for three-node verification',
      evidence: [{
        evidenceId: `test-evidence-${Date.now()}`,
        type: 'test',
        uri: null,
        digest: `sha256:${'a'.repeat(64)}`,
        observedAt: new Date().toISOString(),
        metadata: {},
        verification: { status: 'unverified' }
      }]
    });

    if (result.success) {
      nodeRuntime.storage.saveContribution(result.contribution);
    }

    return { success: result.success, contribution: result.contribution, errors: result.errors };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Get contributions
 */
ipcMain.handle('node:getContributions', async () => {
  if (!nodeRuntime) {
    return [];
  }

  return nodeRuntime.storage.listContributions();
});

/**
 * Create epoch snapshot
 */
ipcMain.handle('node:createEpochSnapshot', async () => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  try {
    const contributions = nodeRuntime.storage.listContributions();

    const snapshot = nodeRuntime.snapshot.createEpochSnapshot({
      contributions,
      memberCount: 1,
      policyVersion: '002-draft-1',
      nodeId: nodeRuntime.identity.nodeId
    });

    return { success: true, snapshot };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Export proof bundle
 */
ipcMain.handle('node:exportProofBundle', async () => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  try {
    const { dialog } = require('electron');

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Export Directory',
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled) {
      return { success: false, error: 'Export cancelled' };
    }

    const outputDir = result.filePaths[0];

    const latestSnapshot = nodeRuntime.snapshot.getLatestSnapshot();
    if (!latestSnapshot) {
      return { success: false, error: 'No snapshot to export' };
    }

    const bundle = nodeRuntime.snapshot.exportProofBundle({
      snapshot: latestSnapshot,
      manifests: [nodeRuntime.identity.manifest],
      contributions: nodeRuntime.storage.listContributions(),
      outputDir
    });

    return { success: true, bundle, path: outputDir };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Import invitation file
 */
ipcMain.handle('node:importInvitation', async () => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  try {
    const { dialog } = require('electron');

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Invitation File',
      filters: [
        { name: 'MOOD Invitation', extensions: ['moodinvite'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (result.canceled) {
      return { success: false, error: 'Import cancelled' };
    }

    const filePath = result.filePaths[0];
    const { loadInvitationFile, validateInvitationForEnrollment } = await import('../../packages/node-runtime/src/invitation/index.js');

    const invitation = loadInvitationFile(filePath);

    return {
      success: true,
      invitation: {
        organizationId: invitation.payload.organizationId,
        organizationName: invitation.payload.organizationName,
        memberEmail: invitation.payload.memberEmail,
        expiresAt: invitation.payload.expiresAt
      },
      raw: invitation
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Enroll with invitation
 */
ipcMain.handle('node:enrollWithInvitation', async (event, { invitation, memberEmail }) => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  try {
    const { validateInvitationForEnrollment, createEnrollment, generateCredentialDigest } = await import('../../packages/node-runtime/src/invitation/index.js');

    const validation = validateInvitationForEnrollment(
      invitation,
      memberEmail,
      nodeRuntime.identity.keypair.publicKey
    );

    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Set organization membership
    nodeRuntime.identity.setOrganization(invitation.payload.organizationId);

    return {
      success: true,
      enrollment: {
        memberSubjectId: nodeRuntime.identity.memberSubjectId,
        credentialDigest: validation.credentialDigest,
        organizationId: invitation.payload.organizationId
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Delete local data (with confirmation)
 */
ipcMain.handle('node:deleteData', async (event, { confirmed }) => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  if (!confirmed) {
    return { success: false, error: 'Confirmation required' };
  }

  try {
    nodeRuntime.identity.delete();
    nodeRuntime.storage.clearAll(true);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

/**
 * Export encrypted backup
 */
ipcMain.handle('node:exportBackup', async (event, { password }) => {
  if (!nodeRuntime) {
    return { success: false, error: 'Node not initialized' };
  }

  try {
    const { dialog } = require('electron');

    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select Export Directory',
      properties: ['openDirectory', 'createDirectory']
    });

    if (result.canceled) {
      return { success: false, error: 'Export cancelled' };
    }

    const outputDir = result.filePaths[0];
    const backup = nodeRuntime.identity.exportEncryptedBackup(password);
    const backupPath = join(outputDir, `mood-node-backup-${Date.now()}.moodbackup`);

    fs.writeFileSync(backupPath, JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      backup
    }, null, 2));

    return { success: true, path: backupPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ─── App Lifecycle ────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  setupSecurityRestrictions();
  createWindow();
  await initializeNodeRuntime();
});

app.on('window-all-closed', () => {
  // Clean up node runtime
  if (nodeRuntime && nodeRuntime.sync) {
    nodeRuntime.sync.disconnect();
  }

  // On macOS, apps typically stay active until explicitly quit
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Unhandled rejection at:', promise, 'reason:', reason);
});
