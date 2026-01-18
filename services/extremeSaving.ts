import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export type SaveMethod = 'auto' | 'manual' | 'cloud';

export interface SaveSettings {
  compress: boolean;
  encrypt: boolean;
  cloudEnabled: boolean;
  cloudEndpoint: string;
  encryptionKey: string;
}

export interface SaveEntry {
  agentId: string;
  fileName: string;
  createdAt: number;
  method: SaveMethod;
  compressed: boolean;
  encrypted: boolean;
  size?: number;
}

const ROOT_DIR = 'ExtremeSaving';
const LOG_KEY = 'extremeSavingLog_v1';
const SETTINGS_KEY = 'extremeSavingSettings_v1';

export function getSettings(): SaveSettings {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) {
    return { compress: false, encrypt: false, cloudEnabled: false, cloudEndpoint: '', encryptionKey: '' };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      compress: !!parsed.compress,
      encrypt: !!parsed.encrypt,
      cloudEnabled: !!parsed.cloudEnabled,
      cloudEndpoint: parsed.cloudEndpoint || '',
      encryptionKey: parsed.encryptionKey || '',
    };
  } catch {
    return { compress: false, encrypt: false, cloudEnabled: false, cloudEndpoint: '', encryptionKey: '' };
  }
}

export function setSettings(next: SaveSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
}

export function getSaveLogs(): string[] {
  const raw = localStorage.getItem(LOG_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function appendLog(line: string) {
  const logs = getSaveLogs();
  logs.unshift(line);
  localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 200)));
}

export function buildTxtContent(
  agentId: string,
  userText?: string,
  modelText?: string,
  meta?: Record<string, string | number>
): string {
  const ts = new Date().toISOString();
  const metadata = {
    agentId,
    timestamp: ts,
    ...meta,
  };
  const header = Object.entries(metadata)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  const clean = (t?: string) => (t || '').replace(/\s+/g, ' ').trim();
  const body = [
    `U: ${clean(userText)}`,
    `A: ${clean(modelText)}`,
  ].join('\n');
  return `${header}\n---\n${body}\n`;
}

async function compressText(content: string): Promise<{ data: string; compressed: boolean }> {
  if (!('CompressionStream' in window)) return { data: content, compressed: false };
  const encoder = new TextEncoder();
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  writer.write(encoder.encode(content));
  writer.close();
  const compressed = await new Response(stream.readable).arrayBuffer();
  const bytes = new Uint8Array(compressed);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return { data: btoa(binary), compressed: true };
}

async function encryptText(content: string, passphrase: string): Promise<{ data: string; encrypted: boolean }> {
  if (!passphrase) return { data: content, encrypted: false };
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(content));
  const payload = {
    s: Array.from(salt),
    i: Array.from(iv),
    d: Array.from(new Uint8Array(cipher)),
  };
  return { data: btoa(JSON.stringify(payload)), encrypted: true };
}

async function decryptText(content: string, passphrase: string): Promise<string> {
  const decoded = JSON.parse(atob(content));
  const enc = new TextEncoder();
  const salt = new Uint8Array(decoded.s);
  const iv = new Uint8Array(decoded.i);
  const data = new Uint8Array(decoded.d);
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 120000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(plain);
}

function agentDir(agentId: string) {
  return `${ROOT_DIR}/Agent_${agentId}`;
}

async function ensureDir(agentId: string) {
  const path = agentDir(agentId);
  await Filesystem.mkdir({ directory: Directory.Documents, path, recursive: true });
}

export async function listAgentSaves(agentId: string): Promise<SaveEntry[]> {
  if (!Capacitor.isNativePlatform()) return [];
  const path = agentDir(agentId);
  try {
    const result = await Filesystem.readdir({ directory: Directory.Documents, path });
    const files = result.files || [];
    const entries = files
      .map(file => ({
        agentId,
        fileName: file.name,
        createdAt: Number(file.name.split('_')[0]) || 0,
        method: (file.name.split('_')[2] as SaveMethod) || 'auto',
        compressed: file.name.endsWith('.gz') || file.name.endsWith('.txt.gz'),
        encrypted: file.name.endsWith('.enc'),
        size: file.size,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
    return entries;
  } catch {
    return [];
  }
}

async function rotateSaves(agentId: string) {
  const entries = await listAgentSaves(agentId);
  const overflow = entries.slice(100);
  for (const entry of overflow) {
    try {
      await Filesystem.deleteFile({ directory: Directory.Documents, path: `${agentDir(agentId)}/${entry.fileName}` });
    } catch {
      // ignore
    }
  }
}

export async function saveConversationAuto(
  agentId: string,
  userText?: string,
  modelText?: string,
  meta?: Record<string, string | number>
) {
  const settings = getSettings();
  const content = buildTxtContent(agentId, userText, modelText, meta);

  let data = content;
  let compressed = false;
  let encrypted = false;

  if (settings.compress) {
    const compressedRes = await compressText(content);
    data = compressedRes.data;
    compressed = compressedRes.compressed;
  }

  if (settings.encrypt) {
    const encryptedRes = await encryptText(data, settings.encryptionKey);
    data = encryptedRes.data;
    encrypted = encryptedRes.encrypted;
  }

  const ext = encrypted ? 'enc' : compressed ? 'txt.gz' : 'txt';
  const fileName = `${Date.now()}_${agentId}_auto.${ext}`;

  try {
    if (Capacitor.isNativePlatform()) {
      await ensureDir(agentId);
      await Filesystem.writeFile({
        directory: Directory.Documents,
        path: `${agentDir(agentId)}/${fileName}`,
        data,
        encoding: encrypted || compressed ? Encoding.BASE64 : Encoding.UTF8,
      });
      await rotateSaves(agentId);
      appendLog(`[${new Date().toLocaleString()}] AUTO OK ${agentId} ${fileName}`);
    } else {
      localStorage.setItem(`${agentDir(agentId)}/${fileName}`, data);
      appendLog(`[${new Date().toLocaleString()}] AUTO WEB OK ${agentId} ${fileName}`);
    }
  } catch (err: any) {
    appendLog(`[${new Date().toLocaleString()}] AUTO FAIL ${agentId} ${err?.message || 'Unknown'}`);
  }

  if (settings.cloudEnabled && settings.cloudEndpoint) {
    try {
      await fetch(settings.cloudEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, content: data, compressed, encrypted, createdAt: Date.now() }),
      });
      appendLog(`[${new Date().toLocaleString()}] CLOUD OK ${agentId}`);
    } catch (err: any) {
      appendLog(`[${new Date().toLocaleString()}] CLOUD FAIL ${agentId} ${err?.message || 'Unknown'}`);
    }
  }
}

export async function exportManual(agentId: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ExtremeSaving_${agentId}_${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  appendLog(`[${new Date().toLocaleString()}] MANUAL EXPORT ${agentId}`);
}

export async function restoreSave(agentId: string, entry: SaveEntry, passphrase?: string): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) return null;
  try {
    const result = await Filesystem.readFile({
      directory: Directory.Documents,
      path: `${agentDir(agentId)}/${entry.fileName}`,
      encoding: entry.encrypted || entry.compressed ? Encoding.BASE64 : Encoding.UTF8,
    });
    let data = result.data;
    if (entry.encrypted && passphrase) {
      data = await decryptText(data, passphrase);
    } else if (entry.encrypted) {
      return null;
    }
    if (entry.compressed && 'DecompressionStream' in window) {
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      writer.write(bytes);
      writer.close();
      const decompressed = await new Response(stream.readable).text();
      return decompressed;
    }
    return data;
  } catch {
    return null;
  }
}
