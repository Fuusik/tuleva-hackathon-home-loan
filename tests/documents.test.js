'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { File } = require('node:buffer');
const D = require('../app-documents.js');
const M = require('../app-model.js');
const I = require('../app-i18n.js');
const Zip = require('../vendor/jszip.min.js');
const file = (name, text = 'demo only', time = 1) => new File([text], name, { lastModified: time });
const dWithCo = () => { const d = M.sample(); d.applicants.push(M.applicant('co', 'Co-applicant')); return d; };
const sized = (name, size) => ({ name, size, type: '', lastModified: 1, arrayBuffer: async () => new ArrayBuffer(1) });

test('files are isolated by person and category and removal preserves other files', () => {
  const store = D.createStore();
  const primary = store.add(file('konto.pdf'), 'primary', 'statement');
  const co = store.add(file('konto.pdf'), 'co', 'statement');
  store.add(file('tulu.pdf'), 'primary', 'income-evidence');
  assert.equal(store.list('primary', 'statement').length, 1);
  assert.equal(store.list('co', 'statement')[0].id, co.id);
  store.remove(primary.id);
  assert.equal(store.list('primary', 'statement').length, 0);
  assert.equal(store.list('primary', 'income-evidence').length, 1);
  assert.equal(store.list('co').length, 1);
  store.clear(); assert.equal(store.list().length, 0);
});

test('invalid owners, unsupported types, empty and oversized files are rejected', () => {
  const store = D.createStore();
  assert.throws(() => store.add(file('a.pdf'), 'property', 'statement'), /owner/);
  assert.throws(() => store.add(file('a.exe'), 'primary', 'statement'), /Unsupported/);
  assert.throws(() => store.add(file('a.csv'), 'property', 'valuation'), /valuation/);
  assert.throws(() => store.add(file('a.pdf', ''), 'primary', 'statement'), /Empty/);
  assert.throws(() => store.add(sized('a.pdf', D.maxFileBytes + 1), 'primary', 'statement'), /20 MB/);
  assert.equal(store.list().length, 0);
});

test('aggregate size and file-count limits include inactive owners', () => {
  const store = D.createStore();
  store.add(sized('a.pdf', D.maxFileBytes), 'primary', 'statement');
  store.add(sized('b.pdf', D.maxFileBytes), 'co', 'statement');
  assert.throws(() => store.add(sized('c.pdf', 11 * 1024 * 1024), 'property', 'valuation'), /50 MB/);
  store.clear();
  for (let i = 0; i < 30; i++) store.add(file(i + '.pdf'), 'primary', 'statement');
  assert.throws(() => store.add(file('extra.pdf'), 'co', 'statement'), /30 files/);
});

test('duplicate filenames have unique safe archive paths across owners and categories', () => {
  const store = D.createStore();
  const f = file('../hindamisakt.pdf');
  const a = store.add(f, 'primary', 'statement');
  assert.throws(() => store.add(f, 'primary', 'statement'), /already/);
  const b = store.add(f, 'property', 'valuation');
  assert.notEqual(a.archivePath, b.archivePath);
  for (const r of [a, b]) assert(!r.archivePath.split('/').includes('..'));
});

test('inactive co-applicant and collateral files are retained in memory but excluded from export', () => {
  const store = D.createStore(); const d = dWithCo();
  store.add(file('a.pdf'), 'primary', 'statement');
  store.add(file('b.pdf'), 'co', 'statement');
  store.add(file('c.asice'), 'property', 'valuation');
  store.add(file('d.asice'), 'additionalProperty', 'valuation');
  d.documents = store.list();
  assert.equal(M.exportSummary(d).application.documents.length, 3);
  d.applicants.pop(); assert.equal(M.exportSummary(d).application.documents.length, 2);
  d.financing.additionalCollateral = true; assert.equal(M.exportSummary(d).application.documents.length, 3);
  assert.equal(store.list().length, 4);
});

test('permission choices are never shared between applicants or newly selected banks', () => {
  const map = new Map();
  D.recordPermission(map, 'primary', 'LHV', 'allow-demo', '2026-10-10T08:00:00Z');
  assert.equal(D.permissionsFor(map, 'co', ['LHV'])[0].status, '');
  assert.equal(D.permissionsFor(map, 'primary', ['SEB'])[0].status, '');
  const p = D.permissionsFor(map, 'primary', ['LHV'])[0];
  assert.equal(p.genuineAuthorization, false); assert.equal(p.queryExecuted, false);
  assert.equal(p.textVersion, 'demo-emta-v1'); assert.equal(p.recordedAt, '2026-10-10T08:00:00Z');
});

test('withdrawal, decline and identity resets keep person-specific permission boundaries', () => {
  const map = new Map();
  D.recordPermission(map, 'primary', 'LHV', 'allow-demo');
  D.recordPermission(map, 'co', 'LHV', 'refuse');
  D.recordPermission(map, 'primary', 'LHV', 'withdraw');
  assert.equal(D.permissionsFor(map, 'primary', ['LHV'])[0].status, 'withdraw');
  D.clearPersonPermissions(map, 'primary');
  assert.equal(D.permissionsFor(map, 'primary', ['LHV'])[0].status, '');
  assert.equal(D.permissionsFor(map, 'co', ['LHV'])[0].status, 'refuse');
  assert.throws(() => D.recordPermission(map, 'primary', 'LHV', 'genuine-grant'), /Invalid/);
});

test('metadata availability does not substitute for an actual file in package preparation', () => {
  const d = dWithCo(); d.property.valuationStatus = 'available';
  Object.assign(d.applicants[0].statements, { status: 'available', months: 6, allAccounts: true });
  const c = M.bankCheck(d, 'LHV');
  assert(c.preparation.missingDocuments.includes('Primary applicant: Bank statement file not added'));
  assert(c.preparation.missingDocuments.includes('Co-applicant: Bank statement file not added'));
  assert(c.preparation.missingDocuments.includes('Main property: Valuation file not added'));
  assert.equal(c.completeBankApplication, false);
});

test('attached files do not confirm bank acceptance, coverage, consent or signature validity', () => {
  const d = M.sample(); const store = D.createStore();
  store.add(file('statement.pdf'), 'primary', 'statement'); store.add(file('valuation.pdf'), 'property', 'valuation');
  d.documents = store.manifest(d);
  const check = M.bankCheck(d, 'LHV');
  assert.equal(check.preparation.missingDocuments.length, 0);
  assert.equal(check.preparation.bankAcceptanceVerified, false);
  assert(check.preparation.notices.some(x => x.includes('ASiC-E')));
  assert(check.observed.some(g => g.label === 'Primary applicant account statements' && g.missing.length));
  assert(check.unverified.some(x => x.includes('EMTA')));
  I.setLocale('et');
  for (const text of [...check.preparation.notices, ...M.bankCheck(M.blank(), 'LHV').preparation.missingDocuments]) assert.notEqual(I.message(text), text);
});

test('plain JSON exports contain metadata only and filter permission records to selected recipients', () => {
  const d = M.sample(), store = D.createStore(), map = new Map();
  store.add(file('demo.pdf', 'PRIVATE DEMO BYTES'), 'primary', 'statement'); d.documents = store.manifest(d);
  D.recordPermission(map, 'primary', 'LHV', 'allow-demo'); D.recordPermission(map, 'primary', 'SEB', 'refuse');
  d.applicants[0].emtaPermissions = D.permissionsFor(map, 'primary', ['LHV', 'SEB']);
  const payload = M.exportSummary(d);
  assert.equal(payload.filesIncluded, false); assert.equal(payload.documentsAttached, false);
  assert.equal(payload.documentsSelectedInBrowser, 1);
  assert.equal(payload.application.applicants[0].emtaPermissions.length, 1);
  assert(!JSON.stringify(payload).includes('PRIVATE DEMO BYTES'));
  assert.equal(payload.bankConsentObtained, false); assert.equal(payload.emtaQueriesExecuted, false);
});

test('ZIP contains the exact original signed-file bytes, Unicode names and correct ownership manifest', async () => {
  const store = D.createStore(), d = dWithCo();
  const bytes = new Uint8Array([0, 255, 10, 13, 80, 75, 3, 4, 0, 128]);
  const f = new File([bytes], 'hindamisakt-\u00f5.asice', { lastModified: 1 });
  const main = store.add(f, 'property', 'valuation');
  const co = store.add(file('kaas-\u00e4.csv', 'date,amount\n2026-10-01,2000'), 'co', 'statement');
  store.add(file('excluded.pdf'), 'additionalProperty', 'valuation');
  d.documents = store.manifest(d);
  const zipBytes = await D.buildPackage(M.exportSummary(d), store.snapshot(d), Zip);
  const zip = await Zip.loadAsync(zipBytes, { checkCRC32: true });
  assert.deepEqual(await zip.file(main.archivePath).async('uint8array'), bytes);
  assert((await zip.file(co.archivePath).async('string')).includes('2000'));
  assert(!Object.keys(zip.files).some(path => path.includes('excluded.pdf')));
  const payload = JSON.parse(await zip.file('application-summary.json').async('string'));
  assert.equal(payload.filesIncluded, true); assert.equal(payload.documentsAttached, true);
  assert.equal(payload.bankConsentObtained, false); assert.equal(payload.emtaQueriesExecuted, false);
  assert.equal(payload.application.documents[0].contentVerified, false);
  assert.equal(payload.application.documents.length, 2);
});

test('mismatched or unreadable original files stop package generation', async () => {
  const store = D.createStore(), d = M.sample();
  store.add(file('a.pdf'), 'primary', 'statement'); d.documents = store.manifest(d);
  const payload = M.exportSummary(d);
  await assert.rejects(D.buildPackage(payload, [], Zip), /changed/);
  const snapshot = store.snapshot(d); snapshot[0].file = sized('a.pdf', 1);
  await assert.rejects(D.buildPackage(payload, snapshot, Zip), /read/);
});
