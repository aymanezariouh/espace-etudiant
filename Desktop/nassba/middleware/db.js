/**
 * Database — lowdb (pure JSON, no native bindings)
 * Stores: contacts, bookings
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/db.json');

const defaultData = {
  contacts: [],     // form submissions
  bookings: [],     // booking requests (future)
};

const adapter = new JSONFile(dbPath);
const db = new Low(adapter, defaultData);

// Initialize DB
await db.read();
db.data ||= defaultData;
await db.write();

export default db;
