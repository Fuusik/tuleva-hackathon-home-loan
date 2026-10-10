/* Local-only document references and demo permission records. No storage or network. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.DemoDocuments = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const maxFileBytes = 20 * 1024 * 1024, maxTotalBytes = 50 * 1024 * 1024, maxFiles = 30;
  const extensions = ['pdf', 'csv', 'xls', 'xlsx', 'xml', 'asice', 'bdoc', 'ddoc', 'jpg', 'jpeg', 'png'];
  const permissionVersion = 'demo-emta-v1';
  const permissionScope = 'EMTA tax-data certificate: employment register entries, declared income and tax-debt information. Exact bank scope and authorization remain unverified.';
  const permissionSource = 'https://www.emta.ee/eraklient/e-teenused-maksutarkus/registrid-paringud/toendite-taotlemine';
  function extension(name) { return String(name).split('.').pop().toLowerCase(); }
  function safeName(name) { return String(name).replace(/[\\/\x00-\x1f<>:"|?*]/g, '_').replace(/[. ]+$/g, '') || 'document'; }
  function validSlot(ownerId, kind) {
    return ['primary', 'co'].includes(ownerId) ? ['statement', 'income-evidence', 'tax-certificate', 'other'].includes(kind) : ['property', 'additionalProperty'].includes(ownerId) && kind === 'valuation';
  }
  function activeOwners(d) { const pending=d.loan.purpose==='purchase'&&['','searching'].includes(d.property.status);return new Set([...d.applicants.map(a => a.id), ...(!pending?['property']:[]), ...(d.financing.additionalCollateral ? ['additionalProperty'] : [])]); }
  function activeManifest(d) { const owners = activeOwners(d); return (d.documents || []).filter(r => owners.has(r.ownerId)); }
  function createStore() {
    const records = new Map(); let serial = 0;
    function add(file, ownerId, kind, at = new Date().toISOString()) {
      if (!validSlot(ownerId, kind)) throw new Error('Invalid document owner or category.');
      if (!file || typeof file.arrayBuffer !== 'function' || !Number.isFinite(file.size) || !file.name) throw new Error('Could not read the selected file.');
      if (!extensions.includes(extension(file.name))) throw new Error('Unsupported file type.');
      if (kind === 'valuation' && !['pdf', 'asice', 'bdoc', 'ddoc', 'jpg', 'jpeg', 'png'].includes(extension(file.name))) throw new Error('Use PDF, a signed container or an image for a valuation.');
      if (file.size === 0) throw new Error('Empty files cannot be added.');
      if (file.size > maxFileBytes) throw new Error('Each file must be 20 MB or smaller.');
      if (records.size >= maxFiles) throw new Error('At most 30 files can be added.');
      const total = [...records.values()].reduce((n, r) => n + r.meta.size, 0);
      if (total + file.size > maxTotalBytes) throw new Error('The total file size must be 50 MB or smaller.');
      const duplicate = [...records.values()].find(r => r.meta.ownerId === ownerId && r.meta.kind === kind && r.meta.filename === file.name && r.meta.size === file.size && r.meta.lastModified === (file.lastModified || 0));
      if (duplicate) throw new Error('This file is already added to this category.');
      const id = 'document-' + (++serial);
      const meta = { id, ownerId, kind, filename: file.name, size: file.size, mimeType: file.type || '', lastModified: file.lastModified || 0, addedAt: at, contentVerified: false };
      meta.archivePath = 'documents/' + ownerId + '/' + kind + '/' + id + '-' + safeName(file.name);
      records.set(id, { meta, file }); return { ...meta };
    }
    function list(ownerId, kind) { return [...records.values()].filter(r => (!ownerId || r.meta.ownerId === ownerId) && (!kind || r.meta.kind === kind)).map(r => ({ ...r.meta })); }
    function manifest(d) { return list().filter(r => activeOwners(d).has(r.ownerId)); }
    function snapshot(d) { return manifest(d).map(meta => ({ meta, file: records.get(meta.id).file })); }
    return { add, list, manifest, snapshot, remove: id => records.delete(id), clear: () => records.clear() };
  }
  const permissionKey = (ownerId, bank) => JSON.stringify([ownerId, bank]);
  function recordPermission(map, ownerId, bank, status, at = new Date().toISOString()) {
    if (!['primary', 'co'].includes(ownerId) || !bank || !['', 'allow-demo', 'refuse', 'withdraw'].includes(status)) throw new Error('Invalid demo permission.');
    const key = permissionKey(ownerId, bank);
    if (!status) { map.delete(key); return; }
    map.set(key, { ownerId, bank, status, recordedAt: at, textVersion: permissionVersion, scope: permissionScope, source: permissionSource, genuineAuthorization: false, queryExecuted: false });
  }
  function permissionsFor(map, ownerId, selectedBanks) {
    return selectedBanks.map(bank => ({ ...(map.get(permissionKey(ownerId, bank)) || { ownerId, bank, status: '', recordedAt: null, textVersion: permissionVersion, scope: permissionScope, source: permissionSource, genuineAuthorization: false, queryExecuted: false }) }));
  }
  function clearPersonPermissions(map, ownerId) { for (const [key, record] of map) if (record.ownerId === ownerId) map.delete(key); }
  function preparation(d, bank) {
    const manifest = activeManifest(d), missingDocuments = [], permissionStatuses = [];
    for (const a of d.applicants) {
      if (!manifest.some(r => r.ownerId === a.id && r.kind === 'statement')) missingDocuments.push(a.role + ': Bank statement file not added');
      const p = (a.emtaPermissions || []).find(p => p.bank === bank);
      permissionStatuses.push({ ownerId: a.id, role: a.role, bank, status: p?.status || '', genuineAuthorization: false, queryExecuted: false });
    }
    if (!manifest.some(r => r.ownerId === 'property' && r.kind === 'valuation')) missingDocuments.push('Main property: Valuation file not added');
    if (d.financing.additionalCollateral && !manifest.some(r => r.ownerId === 'additionalProperty' && r.kind === 'valuation')) missingDocuments.push('Additional collateral: Valuation file not added');
    const notices = ['These are demo-package preparation checks, not verified mandatory bank fields.', 'Selected files are not inspected; statement periods, account coverage, signatures and valuation acceptance still need verification.'];
    if (bank === 'LHV') {
      for (const r of manifest.filter(r => r.kind === 'valuation')) if (extension(r.filename) !== 'asice') notices.push('LHV valuation: keep the original ASiC-E file; other attached formats need bank confirmation.');
    }
    return { documentCount: manifest.length, missingDocuments, permissionStatuses, notices, bankAcceptanceVerified: false };
  }
  async function buildPackage(summary, snapshot, Zip) {
    const manifest = summary.application.documents || [];
    if (manifest.length !== snapshot.length || manifest.some(meta => !snapshot.some(r => r.meta.id === meta.id && r.meta.archivePath === meta.archivePath && r.meta.size === meta.size))) throw new Error('Document package changed; review again.');
    const payload = JSON.parse(JSON.stringify(summary));
    payload.documentsAttached = snapshot.length > 0; payload.filesIncluded = snapshot.length > 0;
    payload.fileExportMode = 'original-files-in-zip'; payload.bankConsentObtained = false; payload.emtaQueriesExecuted = false;
    const zip = new Zip();
    zip.file('application-summary.json', JSON.stringify(payload, null, 2));
    zip.file('README.txt', 'DEMO ONLY. No information was sent to a bank or EMTA.\nThis package is a canonical summary, not an accepted bank application.\nDemo permission choices are not genuine authorization.\nOriginal attached bytes are preserved; their contents, signatures and bank acceptance are unverified.\n');
    for (const record of snapshot) {
      const bytes = new Uint8Array(await record.file.arrayBuffer());
      if (bytes.length !== record.meta.size) throw new Error('Could not read the selected file.');
      zip.file(record.meta.archivePath, bytes, { binary: true, compression: 'STORE' });
    }
    return zip.generateAsync({ type: 'uint8array', compression: 'STORE' });
  }
  return { createStore, extension, maxFileBytes, maxTotalBytes, maxFiles, extensions, activeManifest, preparation, recordPermission, permissionsFor, clearPersonPermissions, permissionVersion, permissionScope, permissionSource, buildPackage };
});
