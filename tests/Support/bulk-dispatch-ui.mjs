import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { assertGoodsLayout, closeGoodsFixture, inspectGoodsPages } from './goods-responsive-checks.mjs';

// Production assets and synthetic data only. The application database is not used.
const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, 'public/build/manifest.json'), 'utf8'));
const entry = manifest['resources/js/app.tsx'];
const prefix = '/gasan-4905/goods-distribution';
const out = path.join(tmpdir(), 'codex-bulk-dispatch-ui');
await mkdir(out, { recursive: true });
const rice = { id: 'rice', code: 'RICE', name: 'Commercial Rice', base_unit: 'kg', is_active: true };
const programs = [{ id: 'program', code: 'FOOD', name: 'AICS Food Commodities', is_active: true }];
const choices = {
    custodian_types: [{ value: 'staff', label: 'Municipal / LGU staff' }, { value: 'barangay_official', label: 'Barangay official' }, { value: 'other_representative', label: 'Other representative' }],
    purposes: [{ value: 'community_distribution', label: 'Barangay / Community distribution' }, { value: 'home_delivery', label: 'Home delivery / Outreach' },
        { value: 'school_distribution', label: 'School distribution' }, { value: 'emergency_relief', label: 'Emergency / Disaster relief' }, { value: 'other', label: 'Other' }],
};
const options = { ...choices, programs, locations: [{ id: 'warehouse', code: 'MAIN', name: 'Main warehouse', is_active: true }], custodians: [{ id: 'staff', name: 'MSWD Staff' }], barangays: ['Uno', 'Pinggan'] };
const permissions = { view: true, prepare: true, approve: true, dispatch: true, reconcile: true, correct: true };
const evidenceFiles = [
    { id: 1, name: 'Signed recipient list', mime_type: 'application/pdf', filename: 'signed-list.pdf', content: Buffer.from('%PDF-1.4\n%%EOF'), created_at: '2026-10-15T08:00:00+08:00' },
    { id: 2, name: 'Distribution photo', mime_type: 'image/png', filename: 'distribution.png', content: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aY7sAAAAASUVORK5CYII=', 'base64'), created_at: '2026-10-15T08:00:00+08:00' },
];
let record = {
    id: 'dispatch', reference: 'BD-01M4BULKDISPATCHREFERENCE', version: 1, status: 'draft', program_id: 'program', program_name: 'AICS Food Commodities',
    storage_location_id: 'warehouse', storage_name: 'Main warehouse', requester_name: 'Barangay Captain', requester_role: 'Barangay official',
    custodian_type: 'staff', custodian_type_label: 'Municipal / LGU staff', custodian_user_id: null, custodian_name: 'MSWD Staff', custodian_role: 'Distribution team leader',
    destination_barangays: ['Uno', 'Pinggan'], purpose: 'home_delivery', purpose_label: 'Home delivery / Outreach', purpose_notes: 'Home deliveries for bedridden seniors', location_notes: null, paper_reference: 'BRGY-1',
    created_at: '2026-10-13T08:00:00+08:00', approved_on: null, actual_dispatch_on: null, closed_at: null,
    lines: [{ id: 'line', item_id: 'rice', item_name_snapshot: rice.name, item_code_snapshot: rice.code, base_unit: 'kg', quantity: '100.000' }],
};
let allocation = { id: 'allocation', line_id: 'line', batch_id: 'batch', item_id: 'rice', item_name: rice.name, base_unit: 'kg', status: 'reserved', quantity: '100.000', issued: '0.000',
    reported_distributed: '0.000', returned: '0.000', with_staff: '0.000', batch_reference: 'RICE-Q4', receipt_reference: 'GR-01M4YF7ND3GPRH2013PCEKV68V', source_name: 'AICS', expires_on: '2027-10-01' };
const events = [];
const errors = [];
const calls = [];
let recipients = [];
let additionalIssues = [];
let extraAllocations = [];
let previewBatchCount = 1;
const recipientCoverage = () => {
    const recorded = recipients.filter((person) => person.status === 'active').flatMap((person) => person.lines).reduce((sum, line) => sum + Number(line.quantity), 0);
    const reported = Number(allocation.reported_distributed);
    return [{ bulk_dispatch_line_id: 'line', item_id: 'rice', item_name: rice.name, item_code: rice.code, base_unit: 'kg', reported_distributed: reported.toFixed(3),
        recorded: recorded.toFixed(3), without_details: Math.max(0, reported - recorded).toFixed(3), excess: Math.max(0, recorded - reported).toFixed(3), needs_review: recorded > reported }];
};
const pageData = (rows) => ({ data: rows, links: { prev: null, next: null }, meta: { current_page: 1, last_page: 1, total: rows.length, from: rows.length ? 1 : null, to: rows.length || null } });
const stock = () => [{ ...rice, balance: record.status === 'draft' || record.status === 'approved' ? '250.000' : record.status === 'closed' ? '170.000' : '150.000',
    reserved: record.status === 'approved' ? '100.000' : '0.000', available: record.status === 'approved' ? '150.000' : record.status === 'closed' ? '170.000' : record.status === 'draft' ? '250.000' : '150.000',
    with_staff: allocation.with_staff, reported_distributed: allocation.reported_distributed, returned: allocation.returned }].map((row) => {
    const extraIssued = extraAllocations.reduce((sum, entry) => sum + Number(entry.issued), 0);
    const extraReserved = extraAllocations.filter((entry) => entry.status === 'reserved').reduce((sum, entry) => sum + Number(entry.quantity), 0);
    return { ...row, balance: (Number(row.balance) - extraIssued).toFixed(3), reserved: (Number(row.reserved) + extraReserved).toFixed(3),
        available: (Number(row.available) - extraIssued - extraReserved).toFixed(3) };
});
function pageFor(url) {
    const filters = Object.fromEntries(url.searchParams);
    const props = { filters, options, permissions, today: '2026-10-13', currentMunicipality: { id: 'municipal', name: 'Gasan', slug: 'gasan-4905', settings: null },
        auth: { user: { id: 'staff', first_name: 'Test', last_name: 'Staff' }, roles: { isAdmin: true, isSuperAdmin: false }, permissions: [
            'goods_distribution.access', ...Object.keys(permissions).map((capability) => 'goods_distribution.bulk_dispatches.' + capability),
            'goods_distribution.inventory.view', 'goods_distribution.inventory.manage', 'goods_distribution.requests.view',
        ] }, flash: {}, errors: {} };
    let component = 'GoodsDistribution/BulkDispatch/Index';
    if (url.pathname.endsWith('/bulk-dispatches')) props.records = pageData([record]);
    else if (url.pathname.endsWith('/bulk-dispatches/create') || url.pathname.endsWith('/bulk-dispatches/dispatch/edit')) {
        component = 'GoodsDistribution/BulkDispatch/Form'; props.dispatch = url.pathname.endsWith('/edit') ? record : null;
    } else if (url.pathname.endsWith('/bulk-dispatches/dispatch')) {
        component = 'GoodsDistribution/BulkDispatch/Details'; Object.assign(props, { dispatch: record, allocations: record.status === 'draft' ? [] : [allocation, ...extraAllocations], stock: stock(),
            additionalIssuesReady: true, additionalIssues: pageData(additionalIssues), hasPendingAdditionalIssues: additionalIssues.some((issue) => ['pending', 'approved'].includes(issue.status)) });
        if (filters.tab === 'reconciliation') props.reconciliations = pageData(events);
        if (filters.tab === 'attachments') props.attachments = evidenceFiles.map(({ content, filename, ...file }) => file);
        if (filters.tab === 'history') {
            props.historyChoices = choices;
            props.history = { data: [{ id: 1, description: 'Saved bulk dispatch draft', actor: 'MSWD Staff', created_at: record.created_at, properties: { before: {}, after: record } }], links: { prev: null, next: null } };
        }
        if (filters.tab === 'recipients') Object.assign(props, { recipientReady: true, recipients: pageData(recipients), recipientCoverage: recipientCoverage(),
            recipientCounts: { active: recipients.filter((person) => person.status === 'active').length, without_quantities: recipients.filter((person) => person.status === 'active' && !person.lines.length).length }, recipientBarangays: ['Uno', 'Pinggan'] });
    } else if (url.pathname.endsWith('/programs/program')) {
        component = 'GoodsDistribution/Inventory/ProgramDetails';
        Object.assign(props, { program: programs[0], tab: 'dispatches', records: pageData([record]), canManage: true, canAdjust: true, canViewBulk: true, canPrepareBulk: true, canIntakeDistribution: false });
    }
    return { component, props, url: url.pathname + url.search, version: 'fixture', clearHistory: false, encryptHistory: false };
}
const server = createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        const json = (payload, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(payload)); };
        if (url.pathname.startsWith(prefix + '/bulk-dispatches/dispatch/attachments/')) {
            assert.equal(req.headers['x-inertia'], undefined, 'File downloads must not use Inertia navigation');
            const file = evidenceFiles.find((entry) => String(entry.id) === url.pathname.split('/').pop());
            assert.ok(file);
            res.writeHead(200, { 'Content-Type': file.mime_type, 'Content-Disposition': `attachment; filename="${file.filename}"` });
            return res.end(file.content);
        }
        if (url.pathname.startsWith('/api/goods-distribution/bulk-dispatches')) {
            assert.equal(req.headers['x-municipality-slug'], 'gasan-4905');
            let raw = ''; for await (const chunk of req) raw += chunk;
            const data = raw && !req.headers['content-type']?.startsWith('multipart') ? JSON.parse(raw) : {};
            calls.push({ path: url.pathname, data });
            if (url.pathname.includes('/additional-issues')) {
                let issue = additionalIssues.find((row) => url.pathname.includes('/' + row.id + '/'));
                if (url.pathname.endsWith('/additional-issues')) {
                    assert.equal(data.lines[0].item_id, 'rice'); assert.equal(data.lines[0].quantity, '20');
                    issue = { id: 'extra-' + additionalIssues.length, status: 'pending', reason: data.reason, created_at: record.created_at, approved_on: null, actual_issue_on: null,
                        cancellation_reason: null, lines: [{ ...record.lines[0], quantity: '20.000' }] };
                    additionalIssues.push(issue);
                } else if (url.pathname.endsWith('/preview')) return json({ data: { fingerprint: 'a'.repeat(64), allocations: [{ ...allocation, quantity: '20.000' }] } });
                else if (url.pathname.endsWith('/approve')) {
                    issue.status = 'approved'; issue.approved_on = '2026-10-13';
                    extraAllocations.push({ ...allocation, id: 'allocation-' + issue.id, additional_issue_id: issue.id, status: 'reserved', quantity: '20.000', issued: '0.000', with_staff: '0.000', reported_distributed: '0.000', returned: '0.000' });
                } else if (url.pathname.endsWith('/issue')) {
                    assert.equal(data.custodian_acknowledged, true); assert.deepEqual(data.confirmed_allocation_ids, ['allocation-' + issue.id]);
                    issue.status = 'issued'; issue.actual_issue_on = data.actual_on;
                    extraAllocations = extraAllocations.map((row) => row.additional_issue_id === issue.id ? { ...row, status: 'issued', issued: '20.000', with_staff: '20.000', issued_on: data.actual_on } : row);
                } else if (url.pathname.endsWith('/cancel')) { issue.status = 'cancelled'; issue.cancellation_reason = data.reason; }
                record.version++;
                return json({ data: { id: issue.id } });
            }
            if (url.pathname.includes('/recipients')) {
                if (url.pathname.endsWith('/candidates')) return json({ data: recipients.filter((person) => person.id !== url.searchParams.get('exclude_id') && url.searchParams.get('search')?.includes('Juan')) });
                let person = recipients.find((row) => url.pathname.includes('/' + row.id + '/'));
                if (url.pathname.endsWith('/recipients')) {
                    assert.ok(data.first_name && data.last_name);
                    assert.equal(data.full_name, undefined);
                    person = { id: 'recipient-' + (recipients.length + 1), bulk_dispatch_id: record.id, version: 1,
                        first_name: data.first_name, middle_name: null, last_name: data.last_name, suffix: null,
                        barangay: null, purok: null, received_on: null, collector_name: null, collector_relationship: null, paper_reference: null, paper_row: null,
                        acknowledgement: null, remarks: null, status: 'active', void_reason: null, voided_at: null, created_at: record.created_at, lines: [] };
                    recipients.push(person);
                }
                if (url.pathname.endsWith('/void')) { person.status = 'voided'; person.void_reason = data.reason; }
                else {
                    Object.entries(data).filter(([key]) => !['version', 'operation_key', 'submission_key', 'recipient_version', 'lines', 'reason'].includes(key)).forEach(([key, value]) => { person[key] = value || null; });
                    person.lines = (data.lines || []).map((line, index) => ({ id: 'recipient-line-' + index, item_id: 'rice', item_name_snapshot: rice.name, item_code_snapshot: rice.code, base_unit: 'kg', ...line }));
                }
                person.full_name = [person.first_name, person.middle_name, person.last_name, person.suffix].filter(Boolean).join(' ');
                record.version++; person.version++;
                return json({ data: person, dispatch_version: record.version, similar_entries: [] });
            }
            if (url.pathname.endsWith('/items')) return json(pageData([rice, ...Array.from({ length: 99 }, (_, index) => ({ ...rice, id: 'item-' + index, code: 'GOODS-' + index, name: 'Commodity ' + index }))].slice(0, 20)));
            if (url.pathname.endsWith('/approval-preview') || url.pathname.endsWith('/reconciliation-preview')) return json({ data: {
                fingerprint: 'a'.repeat(64), allocations: Array.from({ length: previewBatchCount }, (_, index) => ({ ...allocation,
                    id: previewBatchCount > 1 ? 'review-allocation-' + index : allocation.id,
                    receipt_reference: allocation.receipt_reference + (previewBatchCount > 1 ? '-' + index : ''),
                    item_name: previewBatchCount > 1 ? 'Commercial Rice with a long historical item description for batch review' : allocation.item_name,
                    source_name: previewBatchCount > 1 ? 'Municipal purchase from a supplier with a long historical name' : allocation.source_name,
                    quantity: previewBatchCount > 1 ? '999999999999.999' : url.pathname.endsWith('/approval-preview') ? '100.000' : data.lines[0].quantity })),
            } });
            if (url.pathname.endsWith('/approve')) { record = { ...record, status: 'approved', version: record.version + 1, approved_on: '2026-10-13' }; return json({ data: { id: record.id } }); }
            if (url.pathname.endsWith('/dispatch')) { assert.deepEqual(data.confirmed_allocation_ids, ['allocation']); record = { ...record, status: 'dispatched', version: record.version + 1, actual_dispatch_on: '2026-10-13' }; allocation = { ...allocation, status: 'issued', issued: '100.000', with_staff: '100.000' }; return json({ data: { id: record.id } }); }
            if (url.pathname.endsWith('/report')) { assert.equal(data.lines[0].quantity, '80'); record = { ...record, version: record.version + 1 }; allocation = { ...allocation, reported_distributed: '80.000', with_staff: '20.000' }; events.unshift({ id: 'report', kind: 'distribution', occurred_on: '2026-10-13', reference: data.reference || record.reference, notes: data.notes, reversal_id: null, reverses_reconciliation_id: null, lines: [{ id: 'rl', item_name: rice.name, quantity: '80.000', base_unit: 'kg' }] }); return json({ data: { id: record.id } }); }
            if (url.pathname.endsWith('/return')) { assert.equal(data.usable_confirmed, true); record = { ...record, version: record.version + 1 }; allocation = { ...allocation, returned: '20.000', with_staff: '0.000' }; events.unshift({ id: 'return', kind: 'return', occurred_on: '2026-10-13', reference: data.reference || record.reference, notes: data.notes, reversal_id: null, reverses_reconciliation_id: null, lines: [{ id: 'ul', item_name: rice.name, quantity: '20.000', base_unit: 'kg' }] }); return json({ data: { id: record.id } }); }
            if (url.pathname.endsWith('/close')) { record = { ...record, status: 'closed', version: record.version + 1, closed_at: '2026-10-13T09:00:00+08:00' }; return json({ data: { id: record.id } }); }
            if (url.pathname === '/api/goods-distribution/bulk-dispatches' && req.method === 'POST') {
                assert.equal(data.custodian_type, 'other_representative'); assert.equal(data.custodian_user_id, null);
                assert.equal(data.purpose, 'school_distribution'); assert.equal(data.location_notes, 'Gasan Central School');
                assert.equal(data.purpose_notes, 'Student food packs'); assert.equal(data.requester_name, '');
                return json({ data: { id: record.id } });
            }
            return json({ message: 'Unsupported test command' }, 422);
        }
        if (url.pathname.startsWith('/build/')) {
            const file = path.resolve(root, 'public', '.' + url.pathname);
            assert.ok(file.startsWith(path.resolve(root, 'public/build') + path.sep));
            res.writeHead(200, { 'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
            return res.end(await readFile(file));
        }
        if (!url.pathname.startsWith(prefix)) { res.writeHead(204); return res.end(); }
        const page = pageFor(url);
        if (req.headers['x-inertia']) { res.setHeader('X-Inertia', 'true'); return json(page); }
        const data = JSON.stringify(page).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
        res.setHeader('Content-Type', 'text/html');
        res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">${(entry.css || []).map((file) => `<link rel="stylesheet" href="/build/${file}">`).join('')}</head><body><div id="app" data-page='${data}'></div><script type="module" src="/build/${entry.file}"></script></body></html>`);
    } catch (error) { errors.push(String(error)); res.writeHead(500); res.end(String(error)); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
    browser = await puppeteer.launch({ headless: true, ...(process.env.GOODS_UI_BROWSER ? { executablePath: process.env.GOODS_UI_BROWSER } : {}) });
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(String(error)));
    const go = async (suffix) => { await page.goto(origin + prefix + suffix, { waitUntil: 'networkidle0' }); await page.waitForSelector('main'); };
    const click = async (label) => { const button = await page.$$('button'); for (const candidate of button) if ((await candidate.evaluate((element) => element.textContent.trim())).includes(label)) { await candidate.click(); return; } throw new Error('Button missing: ' + label); };
    const assertBatchLayout = async () => {
        assert.ok(await page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]');
            const bounds = dialog.getBoundingClientRect();
            const body = dialog.querySelector('[data-batch-review-body]');
            const footer = dialog.querySelector('[data-slot="dialog-footer"]');
            const list = dialog.querySelector('[data-stock-batches]');
            const amounts = [...list.querySelectorAll('[data-batch-quantity]')].filter((element) => element.getClientRects().length);
            return bounds.left >= 0 && bounds.right <= innerWidth + 1 && bounds.top >= 0 && bounds.bottom <= innerHeight + 1
                && body.scrollWidth <= body.clientWidth + 1 && body.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top
                && footer.getBoundingClientRect().bottom <= bounds.bottom && amounts.length > 0 && !list.querySelector('table')
                && amounts.every((amount) => {
                    const card = amount.closest('[data-batch-card]');
                    const batchBounds = card.getBoundingClientRect();
                    const range = document.createRange(); range.selectNodeContents(amount);
                    const rect = range.getBoundingClientRect();
                    return rect.left >= batchBounds.left && rect.right <= batchBounds.right && card.scrollWidth <= card.clientWidth + 1;
                });
        }), 'batch quantities are clipped or the review footer is obscured');
    };
    if (process.argv.includes('--downloads-only')) {
        const session = await browser.target().createCDPSession();
        for (const width of [1440, 390]) {
            const downloadPath = await mkdtemp(path.join(out, `downloads-${width}-`));
            await session.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath, eventsEnabled: true });
            await page.setViewport({ width, height: 900 });
            await go('/bulk-dispatches/dispatch?tab=attachments');
            await assertGoodsLayout(page, `${width}px attachments`);
            const pageUrl = page.url();
            for (const file of evidenceFiles) {
                const completed = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => { session.off('Browser.downloadProgress', listener); reject(new Error('Download did not complete: ' + file.filename)); }, 10000);
                    const listener = (event) => {
                        if (event.state === 'completed' || event.state === 'canceled') {
                            clearTimeout(timeout); session.off('Browser.downloadProgress', listener);
                            if (event.state === 'completed') resolve(); else reject(new Error('Download was cancelled'));
                        }
                    };
                    session.on('Browser.downloadProgress', listener);
                });
                await Promise.all([completed, page.click(`a[href$="/attachments/${file.id}"]`)]);
                assert.deepEqual(await readFile(path.join(downloadPath, file.filename)), file.content);
                assert.equal(page.url(), pageUrl, 'Downloading must leave the dispatch page open');
            }
            await page.screenshot({ path: path.join(out, `attachments-${width}.png`), fullPage: true });
        }
        await session.detach();
        assert.deepEqual(errors, []);
        console.log('PASS: PDF/image attachment downloads at desktop/mobile sizes, without Inertia navigation.');
    } else if (process.argv.includes('--additional-only')) {
        for (const width of [1440, 1024, 768, 390, 320]) {
            await page.setViewport({ width, height: width <= 390 ? 740 : 960, hasTouch: width <= 390 });
            additionalIssues = []; extraAllocations = [];
            record.status = 'dispatched'; record.actual_dispatch_on = '2026-10-13';
            allocation = { ...allocation, status: 'issued', issued: '100.000', with_staff: '100.000', issued_on: '2026-10-13', additional_issue_id: null };
            await go('/bulk-dispatches/dispatch');
            await click('Add goods'); await page.waitForSelector('[role="dialog"] [aria-label="Item"]');
            await page.click('[aria-label="Show items"]'); await page.waitForSelector('[role="option"]');
            assert.ok(await page.$eval('[role="option"]', (option) => !!option.closest('[role="dialog"]')), 'Item options must stay inside the modal interaction boundary');
            if (width === 768) {
                await page.focus('[aria-label="Item"]'); await page.keyboard.press('Home'); await page.keyboard.press('Enter');
            } else if (width <= 390) {
                await page.$eval('[role="option"]', (option) => { option.dataset.touchTarget = 'true'; });
                await page.tap('[data-touch-target="true"]');
            } else {
                await page.click('[role="option"]');
            }
            await page.waitForFunction(() => document.querySelector('[aria-label="Item"]').value === 'Commercial Rice');
            await page.type('[aria-label="Additional quantity 1"]', '20');
            await page.type('[aria-label="Additional issue reason"]', 'More households arrived at the distribution venue');
            await assertGoodsLayout(page, `${width}px additional goods form`);
            await page.screenshot({ path: path.join(out, `additional-create-${width}.png`), fullPage: true });
            await click('Request additional goods'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
            assert.equal(record.lines[0].quantity, '100.000');
            await page.waitForSelector('[data-additional-issue-card]');
            await assertGoodsLayout(page, `${width}px pending additional issue card`);
            assert.ok(await page.$eval('[data-additional-issue-card]', (card) => {
                const style = getComputedStyle(card);
                return style.borderTopWidth === '1px' && parseFloat(style.borderRadius) > 0 && parseFloat(style.borderRadius) <= 8
                    && style.boxShadow === 'none' && card.scrollWidth <= card.clientWidth + 1;
            }), 'Additional issue should have a thin border, small radius and no shadow');
            await page.screenshot({ path: path.join(out, `additional-pending-card-${width}.png`), fullPage: true });
            await click('Review approval'); await click('Review batches'); await page.waitForSelector('[role="dialog"] [data-stock-batches]');
            await assertGoodsLayout(page, `${width}px additional approval`);
            await page.screenshot({ path: path.join(out, `additional-approve-${width}.png`), fullPage: true });
            await click('Approve additional goods'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
            await click('Record pickup'); await page.waitForSelector('[role="dialog"] input[type="checkbox"]');
            for (const checkbox of await page.$$('[role="dialog"] input[type="checkbox"]')) await checkbox.click();
            await assertGoodsLayout(page, `${width}px additional pickup`);
            await page.screenshot({ path: path.join(out, `additional-pickup-${width}.png`), fullPage: true });
            await click('Record additional pickup'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
            await assertGoodsLayout(page, `${width}px additional issued details`);
            assert.equal(record.lines[0].quantity, '100.000'); assert.equal(extraAllocations[0].issued, '20.000');
            assert.ok(await page.evaluate(() => document.body.textContent.includes('120 kg')));
            await page.screenshot({ path: path.join(out, `additional-issued-${width}.png`), fullPage: true });
        }
        assert.deepEqual(errors, []);
        console.log('PASS: additional goods creation, mouse/touch/keyboard item selection, approval and pickup at 320/390/768/1024/1440px. Screenshots: ' + out);
    } else if (process.argv.includes('--responsive-only')) {
        record.status = 'dispatched';
        allocation = { ...allocation, status: 'issued', issued: '100.000', with_staff: '20.000', reported_distributed: '80.000' };
        record.actual_dispatch_on = '2026-10-13';
        recipients = [{ id: 'recipient', first_name: 'Juan', middle_name: 'Santos', last_name: 'Suarez', suffix: null,
            full_name: 'Juan Santos Suarez ' + 'LongName'.repeat(8), version: 1, status: 'active', lines: [],
            collector_name: 'Maria Suarez', barangay: 'Uno', received_on: null, paper_reference: 'SHEET-1', remarks: null }];
        await inspectGoodsPages(page, go, [
            '/bulk-dispatches', '/bulk-dispatches/create?program_id=program', '/bulk-dispatches/dispatch/edit',
            '/bulk-dispatches/dispatch', '/bulk-dispatches/dispatch?tab=reconciliation',
            '/bulk-dispatches/dispatch?tab=recipients', '/bulk-dispatches/dispatch?tab=attachments',
            '/bulk-dispatches/dispatch?tab=history', '/programs/program?tab=dispatches',
        ], out, [
            { suffix: '/bulk-dispatches/dispatch', button: 'Report distributed' },
            { suffix: '/bulk-dispatches/dispatch', button: 'Return unused' },
            { suffix: '/bulk-dispatches/dispatch', button: 'Add goods' },
            { suffix: '/bulk-dispatches/dispatch?tab=recipients', button: 'Add recipient' },
        ]);
        assert.deepEqual(errors, []);
        console.log('PASS: bulk pages, recipient lists and reconciliation dialogs at phone/tablet/desktop sizes.');
    } else {
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 900 });
        for (const suffix of ['/bulk-dispatches', '/bulk-dispatches/create?program_id=program', '/bulk-dispatches/dispatch', '/programs/program?tab=dispatches']) {
            await go(suffix);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), suffix + ' overflows at ' + width);
            await page.screenshot({ path: path.join(out, suffix.replace(/[/?=&]/g, '_') + '-' + width + '.png'), fullPage: true });
        }
        await go('/bulk-dispatches/create?program_id=program');
        assert.deepEqual(await page.$$eval('[aria-label="Custodian type"] option', (rows) => rows.map((row) => row.value)), ['staff', 'barangay_official', 'other_representative']);
        await page.select('[aria-label="Storage location"]', 'warehouse');
        await page.select('[aria-label="Custodian type"]', 'other_representative');
        assert.equal(await page.$('[aria-label="Link municipal staff"]'), null);
        await page.type('[aria-label="Custodian name"]', 'Maria Reyes');
        await page.type('[aria-label="Custodian role"]', 'School principal');
        await page.select('[aria-label="Purpose"]', 'other');
        assert.ok(await page.evaluate(() => [...document.querySelectorAll('label')].some((label) => label.textContent === 'Purpose details *')));
        await page.select('[aria-label="Purpose"]', 'school_distribution');
        await page.type('[aria-label="Purpose details"]', 'Student food packs');
        await page.type('[aria-label="Venue / Specific location"]', 'Gasan Central School');
        await page.type('[aria-label="Destination 1"]', 'Uno');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await page.screenshot({ path: path.join(out, `school-dispatch-${width}.png`), fullPage: true });
        await click('Save draft');
        await page.waitForFunction(() => document.body.textContent.includes('Review approval'));
        await go('/bulk-dispatches/dispatch?tab=history');
        await page.click('summary');
        assert.ok(await page.evaluate(() => document.body.textContent.includes('Municipal / LGU staff') && document.body.textContent.includes('Home delivery / Outreach')));
        await go('/bulk-dispatches/dispatch');
        await click('Review approval'); await page.waitForSelector('[role="dialog"]'); await click('Review batches');
        await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes('RICE-Q4'));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        assert.ok(await page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]');
            const bounds = dialog.getBoundingClientRect();
            return bounds.left >= 0 && bounds.right <= window.innerWidth + 1 && dialog.scrollWidth <= dialog.clientWidth + 1;
        }), 'approval dialog overflows at ' + width);
        await assertBatchLayout();
        await page.screenshot({ path: path.join(out, `approval-${width}.png`), fullPage: true });
        await page.keyboard.press('Escape');
    }
    previewBatchCount = 24;
    for (const width of [1440, 820, 640, 390, 320]) {
        await page.setViewport({ width, height: 700 });
        await go('/bulk-dispatches/dispatch'); await click('Review approval'); await click('Review batches');
        await page.waitForFunction(() => document.querySelector('[role="dialog"] [data-stock-batches]'));
        await assertBatchLayout();
        assert.ok(await page.$eval('[data-batch-review-body]', (body) => body.scrollHeight > body.clientHeight));
        await page.$eval('[data-batch-review-body]', (body) => { body.scrollTop = body.scrollHeight; });
        await assertBatchLayout();
        await page.screenshot({ path: path.join(out, `batch-review-long-${width}.png`), fullPage: true });
        if (width === 1440) {
            await page.$eval('[role="dialog"]', (dialog) => { dialog.style.maxWidth = '520px'; });
            await page.waitForFunction(() => document.querySelector('[role="dialog"]').getBoundingClientRect().width <= 520);
            await assertBatchLayout();
            assert.equal(await page.$$eval('[role="dialog"] [data-batch-card]', (cards) => cards.length), previewBatchCount);
        }
        await page.keyboard.press('Escape');
    }
    previewBatchCount = 1;
    await page.setViewport({ width: 390, height: 900 });
    await go('/bulk-dispatches/dispatch'); await click('Review approval'); await click('Review batches');
    await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes('RICE-Q4'));
    await click('Approve and reserve stock'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]') && [...document.querySelectorAll('button')].some((button) => button.textContent.includes('Record departure')));
    await click('Record departure'); await page.waitForSelector('[role="dialog"] input[type="checkbox"]');
    for (const checkbox of await page.$$('[role="dialog"] input[type="checkbox"]')) await checkbox.click();
    await page.click('[role="dialog"] [data-slot="dialog-footer"] button:last-child'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]') && document.body.textContent.includes('Report distributed'));
    await go('/bulk-dispatches/dispatch');
    await click('Report distributed'); await page.waitForSelector('[role="dialog"] input[type="number"]');
    await page.type('[role="dialog"] input[type="number"]', '80'); await click('Review batches');
    await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes('Confirm the exact batch quantities'));
    await assertBatchLayout();
    await click('Report distributed goods'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]') && document.body.textContent.includes('Return unused'));
    await go('/bulk-dispatches/dispatch');
    await click('Return unused'); await page.waitForSelector('[role="dialog"] input[type="number"]');
    await page.type('[role="dialog"] input[type="number"]', '20'); await page.click('[role="dialog"] input[type="checkbox"]'); await click('Review batches');
    await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes('Confirm the exact batch quantities'));
    await assertBatchLayout();
    await click('Record unused return'); await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
    await go('/bulk-dispatches/dispatch');
    await click('Close'); await page.waitForSelector('[role="dialog"]'); await click('Close dispatch');
    await page.waitForFunction(() => document.body.textContent.includes('Reopen'));
    for (const width of [1440, 390]) {
        recipients = [];
        await page.setViewport({ width, height: 900 });
        await go('/bulk-dispatches/dispatch?tab=recipients');
        await click('Add recipient');
        await page.type('[aria-label="First name"]', 'Juan');
        assert.ok(await page.$$eval('[role="dialog"] button', (buttons) => buttons.find((button) => button.textContent.includes('Save recipient')).disabled));
        await page.type('[aria-label="Last name"]', 'Suarez');
        await click('Save and add another');
        await page.waitForFunction(() => document.querySelector('[aria-label="First name"]')?.value === '' && document.querySelector('[aria-label="Last name"]')?.value === '');
        assert.equal(recipients[0].received_on, null);
        assert.equal(recipients[0].lines.length, 0);
        await page.type('[aria-label="First name"]', 'Juan');
        await page.type('[aria-label="Middle name"]', 'Santos');
        await page.type('[aria-label="Last name"]', 'Suarez');
        await page.type('[aria-label="Suffix"]', 'Jr');
        await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.textContent.includes('Similar names already appear'));
        await click('Add item');
        await page.select('[aria-label="Issued item"]', 'line');
        await page.type('[aria-label="Documented quantity"]', '60');
        assert.ok(await page.evaluate(() => { const dialog = document.querySelector('[role="dialog"]'); const rect = dialog.getBoundingClientRect(); return rect.left >= 0 && rect.right <= innerWidth + 1 && dialog.scrollWidth <= dialog.clientWidth + 1; }));
        assert.ok(await page.evaluate(() => { const dialog = document.querySelector('[role="dialog"]'); const button = [...dialog.querySelectorAll('button')].find((entry) => entry.textContent.includes('Save recipient')); const rect = button.getBoundingClientRect(); const bounds = dialog.getBoundingClientRect(); return rect.top >= bounds.top && rect.bottom <= bounds.bottom; }), 'recipient save is outside the visible dialog');
        assert.ok(await page.evaluate(() => document.querySelector('[aria-label="Documented quantity"]').getBoundingClientRect().bottom <= document.querySelector('[role="dialog"] [data-slot="dialog-footer"]').getBoundingClientRect().top), 'recipient footer overlaps the quantity input');
        await page.screenshot({ path: path.join(out, `recipient-dialog-${width}.png`), fullPage: true });
        await click('Save recipient');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.equal(recipients[1].full_name, 'Juan Santos Suarez Jr');
        await go('/bulk-dispatches/dispatch?tab=recipients');
        assert.equal(recipientCoverage()[0].without_details, '20.000');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.screenshot({ path: path.join(out, `recipients-${width}.png`), fullPage: true });
        await page.$$eval('[aria-label="View Juan Suarez"]', (buttons) => buttons.find((button) => button.offsetParent !== null).click());
        await click('Complete details');
        assert.ok(await page.$eval('[aria-label="First name"]', (input) => input.disabled));
        assert.ok(await page.$eval('[aria-label="Last name"]', (input) => input.disabled));
        assert.ok(await page.$eval('[aria-label="Middle name"]', (input) => !input.disabled));
        await page.type('[aria-label="Barangay"]', 'Uno');
        await click('Save recipient');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        await go('/bulk-dispatches/dispatch?tab=recipients');
        await page.$$eval('[aria-label="View Juan Suarez"]', (buttons) => buttons.find((button) => button.offsetParent !== null).click());
        await click('Correct');
        assert.ok(await page.$$eval('[role="dialog"] button', (buttons) => buttons.find((button) => button.textContent.includes('Save recipient')).disabled));
        await page.type('[aria-label="Reason for correction"]', 'Corrected the paper collector details');
        await page.click('[role="dialog"] summary');
        await page.type('[aria-label="Collector if different"]', 'Maria Suarez');
        await click('Save recipient');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        await go('/bulk-dispatches/dispatch?tab=recipients');
        await page.$$eval('[aria-label="View Juan Suarez"]', (buttons) => buttons.find((button) => button.offsetParent !== null).click());
        await click('Void entry');
        await page.type('[aria-label="Reason for correction"]', 'The paper row was entered twice');
        await click('Void entry');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.equal(recipients[0].status, 'voided');
        assert.equal(record.status, 'closed');
    }
    assert.deepEqual(errors, []);
    assert.ok(calls.some((call) => call.path.endsWith('/report')) && calls.some((call) => call.path.endsWith('/return')));
    console.log('Bulk desktop/mobile pages, approval, departure, reports, returns, closure, names-only recipients, rapid entry, duplicate warnings, coverage, completion, reviewed corrections, voiding and layout passed. Screenshots: ' + out);
    }
} finally { await closeGoodsFixture(browser, server); }
