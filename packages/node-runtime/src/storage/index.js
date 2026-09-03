/**
 * MOOD Storage Module
 *
 * Local storage adapter for protocol objects.
 * Uses JSON files for alpha version.
 *
 * @module storage
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

/**
 * Storage types
 */
export const STORAGE_COLLECTIONS = {
  CONTRIBUTIONS: 'contributions',
  MANIFESTS: 'manifests',
  SNAPSHOTS: 'snapshots',
  OBJECTS: 'objects',
  INVENTORY: 'inventory'
};

/**
 * Create storage manager
 */
export class StorageManager {
  /**
   * @param {object} options
   * @param {string} [options.dataDir] - Base data directory
   * @param {string} [options.nodeId] - Node ID for namespacing
   */
  constructor(options = {}) {
    this.dataDir = options.dataDir || './data/node';
    this.nodeId = options.nodeId || 'local';
    this.collections = {};
  }

  /**
   * Initialize storage
   */
  initialize() {
    // Ensure base directory exists
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }

    // Initialize collections
    for (const collection of Object.values(STORAGE_COLLECTIONS)) {
      this._initCollection(collection);
    }

    return this;
  }

  /**
   * Initialize a collection directory
   * @param {string} collection - Collection name
   */
  _initCollection(collection) {
    const path = join(this.dataDir, collection);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
    this.collections[collection] = path;
  }

  /**
   * Get collection path
   * @param {string} collection - Collection name
   * @returns {string} Path
   */
  _getCollectionPath(collection) {
    if (!this.collections[collection]) {
      this._initCollection(collection);
    }
    return this.collections[collection];
  }

  /**
   * Get file path for an object
   * @param {string} collection - Collection name
   * @param {string} id - Object ID
   * @returns {string} File path
   */
  _getFilePath(collection, id) {
    return join(this._getCollectionPath(collection), `${id}.json`);
  }

  /**
   * Save an object to storage
   * @param {string} collection - Collection name
   * @param {object} object - Object to save
   * @returns {object} Saved object metadata
   */
  save(collection, object) {
    if (!object.id && !object.contributionId && !object.nodeId && !object.snapshotId) {
      throw new Error('Object must have an ID field');
    }

    const id = object.id || object.contributionId || object.nodeId || object.snapshotId;
    const filePath = this._getFilePath(collection, id);

    const stored = {
      ...object,
      _storedAt: new Date().toISOString(),
      _collection: collection
    };

    writeFileSync(filePath, JSON.stringify(stored, null, 2));

    return {
      id,
      collection,
      path: filePath,
      storedAt: stored._storedAt
    };
  }

  /**
   * Load an object from storage
   * @param {string} collection - Collection name
   * @param {string} id - Object ID
   * @returns {object|null} Object or null if not found
   */
  load(collection, id) {
    const filePath = this._getFilePath(collection, id);
    if (!existsSync(filePath)) {
      return null;
    }
    return JSON.parse(readFileSync(filePath, 'utf8'));
  }

  /**
   * Delete an object from storage
   * @param {string} collection - Collection name
   * @param {string} id - Object ID
   * @returns {boolean} Success
   */
  delete(collection, id) {
    const filePath = this._getFilePath(collection, id);
    if (!existsSync(filePath)) {
      return false;
    }
    unlinkSync(filePath);
    return true;
  }

  /**
   * List all objects in a collection
   * @param {string} collection - Collection name
   * @returns {Array} Array of objects
   */
  list(collection) {
    const path = this._getCollectionPath(collection);
    const files = readdirSync(path).filter(f => f.endsWith('.json'));

    return files.map(file => {
      const filePath = join(path, file);
      const id = file.replace('.json', '');
      return { id, ...JSON.parse(readFileSync(filePath, 'utf8')) };
    });
  }

  /**
   * Get objects count in a collection
   * @param {string} collection - Collection name
   * @returns {number} Count
   */
  count(collection) {
    const path = this._getCollectionPath(collection);
    if (!existsSync(path)) {
      return 0;
    }
    return readdirSync(path).filter(f => f.endsWith('.json')).length;
  }

  /**
   * Save contribution
   * @param {object} contribution - Contribution object
   * @returns {object} Save result
   */
  saveContribution(contribution) {
    return this.save(STORAGE_COLLECTIONS.CONTRIBUTIONS, contribution);
  }

  /**
   * Load contribution
   * @param {string} contributionId - Contribution ID
   * @returns {object|null} Contribution or null
   */
  loadContribution(contributionId) {
    return this.load(STORAGE_COLLECTIONS.CONTRIBUTIONS, contributionId);
  }

  /**
   * List all contributions
   * @returns {Array} Contributions
   */
  listContributions() {
    return this.list(STORAGE_COLLECTIONS.CONTRIBUTIONS);
  }

  /**
   * Save node manifest
   * @param {object} manifest - Node manifest
   * @returns {object} Save result
   */
  saveManifest(manifest) {
    return this.save(STORAGE_COLLECTIONS.MANIFESTS, manifest);
  }

  /**
   * Load node manifest
   * @param {string} nodeId - Node ID
   * @returns {object|null} Manifest or null
   */
  loadManifest(nodeId) {
    return this.load(STORAGE_COLLECTIONS.MANIFESTS, nodeId);
  }

  /**
   * Save snapshot
   * @param {object} snapshot - Snapshot object
   * @returns {object} Save result
   */
  saveSnapshot(snapshot) {
    return this.save(STORAGE_COLLECTIONS.SNAPSHOTS, snapshot);
  }

  /**
   * Load snapshot
   * @param {string} snapshotId - Snapshot ID
   * @returns {object|null} Snapshot or null
   */
  loadSnapshot(snapshotId) {
    return this.load(STORAGE_COLLECTIONS.SNAPSHOTS, snapshotId);
  }

  /**
   * List all snapshots
   * @returns {Array} Snapshots
   */
  listSnapshots() {
    return this.list(STORAGE_COLLECTIONS.SNAPSHOTS);
  }

  /**
   * Save protocol object
   * @param {object} object - Protocol object
   * @returns {object} Save result
   */
  saveObject(object) {
    const id = object.id || object.objectId || crypto.randomBytes(16).toString('hex');
    return this.save(STORAGE_COLLECTIONS.OBJECTS, { ...object, id });
  }

  /**
   * Load protocol object
   * @param {string} objectId - Object ID
   * @returns {object|null} Object or null
   */
  loadObject(objectId) {
    return this.load(STORAGE_COLLECTIONS.OBJECTS, objectId);
  }

  /**
   * List all protocol objects
   * @returns {Array} Objects
   */
  listObjects() {
    return this.list(STORAGE_COLLECTIONS.OBJECTS);
  }

  /**
   * Update inventory index
   * @param {object} inventory - Inventory data
   */
  saveInventory(inventory) {
    const path = join(this.dataDir, 'inventory.json');
    writeFileSync(path, JSON.stringify(inventory, null, 2));
  }

  /**
   * Load inventory index
   * @returns {object} Inventory
   */
  loadInventory() {
    const path = join(this.dataDir, 'inventory.json');
    if (!existsSync(path)) {
      return {
        objects: [],
        lastSyncAt: null,
        syncedPeers: []
      };
    }
    return JSON.parse(readFileSync(path, 'utf8'));
  }

  /**
   * Clear all data (with confirmation)
   * @param {boolean} confirmed - Must be true to actually delete
   * @returns {boolean} Success
   */
  clearAll(confirmed = false) {
    if (!confirmed) {
      return false;
    }

    try {
      const deleteRecursive = (dirPath) => {
        if (!existsSync(dirPath)) return;

        const files = readdirSync(dirPath);
        for (const file of files) {
          const fullPath = join(dirPath, file);
          const stat = require('fs').statSync(fullPath);
          if (stat.isDirectory()) {
            deleteRecursive(fullPath);
          } else {
            // Overwrite with zeros before deletion
            const data = readFileSync(fullPath);
            writeFileSync(fullPath, Buffer.alloc(data.length, 0));
            unlinkSync(fullPath);
          }
        }
      };

      deleteRecursive(this.dataDir);
      return true;
    } catch (e) {
      console.error('Failed to clear storage:', e);
      return false;
    }
  }

  /**
   * Get storage statistics
   * @returns {object} Statistics
   */
  getStats() {
    const stats = {
      collections: {},
      totalObjects: 0,
      dataDir: this.dataDir
    };

    for (const [name, collection] of Object.entries(STORAGE_COLLECTIONS)) {
      const count = this.count(collection);
      stats.collections[name] = count;
      stats.totalObjects += count;
    }

    return stats;
  }
}

export default {
  STORAGE_COLLECTIONS,
  StorageManager
};
