import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer';

// Production assets and synthetic records only; no application database is accessed.
const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, 'public/build/manifest.json'), 'utf8'));
const entry = manifest['resources/js/app.tsx'];
const prefix = '/gasan-4905/goods-distribution';
const output = path.join(tmpdir(), 'codex-goods-distribution-ui');
await mkdir(output, { recursive: true });
const person = {
    id: 'person',
    name: 'Susan Solis',
    birth_date: '1960-01-01',
    beneficiary_number: 'PERSON-1',
    household_code: 'HH-GD-1',
    identity_verified: false,
    roster: [{ id: 'member', name: 'Kenneth Solis', beneficiary_id: null }],
};
const snapshot = {
    filer: person,
    subject: person,
    household_code: 'HH-GD-1',
    barangay: 'Uno',
    street: 'Main street',
    identity_verified: false,
    roster: [
        { ...person, relationship: 'head' },
        { id: 'member', name: 'Kenneth Solis', relationship: 'child', birth_date: '1990-01-01' },
        { id: 'departed-member', name: 'Former household member', relationship: 'parent', birth_date: '1955-04-12' },
    ],
};
const liveSnapshot = {
    ...snapshot,
    street: 'Updated street',
    roster: [
        snapshot.roster[0],
        { ...snapshot.roster[1], relationship: 'sibling', beneficiary_id: 'linked-kenneth' },
        {
            id: 'new-member',
            name: 'Newly linked household member with a long name for layout review',
            relationship: 'parent',
            beneficiary_id: 'linked',
            birth_date: '1950-01-01',
        },
    ],
};
let householdSynced = false;
const line = { id: 'line', item_id: 'rice', item_name_snapshot: 'Commercial Rice', item_code_snapshot: 'RICE', quantity: '2.000', base_unit: 'kg' };
let record = {
    id: 'request',
    reference: 'GD-01ABCDEFGHIJKLMNOPQRSTUVWX',
    program_id: 'program',
    program_name: 'AICS Food Commodities',
    storage_location_id: 'storage',
    storage_name: 'Main warehouse',
    beneficiary_id: 'person',
    status: 'approved',
    version: 3,
    snapshot,
    filing_snapshot: snapshot,
    handover_snapshot: null,
    lines: [line],
    notes: 'Reviewed household request.',
    transition_reason: null,
    created_at: '2026-10-09T08:00:00+08:00',
    approved_at: '2026-10-09T09:00:00+08:00',
    approved_on: '2026-10-09',
    actual_release_on: null,
    documents: [
        {
            id: 'check',
            label: 'Certificate of Indigency',
            is_required: true,
            evidence_mode: 'both',
            physical_copy_requirement: 'original',
            status: 'verified',
            current_media_id: 1,
            presented_copy_type: 'original',
            remarks: 'Reviewed original and upload.',
            checked_at: '2026-10-09T09:00:00+08:00',
        },
    ],
    allocations: [
        {
            id: 'allocation',
            distribution_request_line_id: 'line',
            item_name: 'Commercial Rice',
            quantity: '2.000',
            base_unit: 'kg',
            status: 'reserved',
            batch_reference: 'RICE-Q4',
            receipt_reference: 'GR-RECEIPT',
            expires_on: '2027-02-01',
        },
    ],
};
const permissions = { view: true, intake: true, process: true, decide: true, release: true };
const options = { programs: [{ id: 'program', name: 'AICS Food Commodities' }], locations: [{ id: 'storage', name: 'Main warehouse' }] };
const catalog = Array.from({ length: 100 }, (_, i) => ({
    id: i === 0 ? 'rice' : 'item-' + i,
    name: i === 0 ? 'Commercial Rice' : 'Food commodity ' + i,
    code: i === 0 ? 'RICE' : 'FOOD-' + i,
    base_unit: 'kg',
    is_active: true,
}));
const pageData = (data) => ({
    data,
    meta: { current_page: 1, last_page: 1, total: data.length, from: 1, to: data.length },
    links: { prev: null, next: null },
});
const errors = [];
const calls = [];
const registryHousehold = { id: 'household', household_code: 'HH-GD-1', head_name: 'Kenneth Solis', street: 'Main street', barangay: 'Uno' };
function pageFor(url) {
    const filters = Object.fromEntries(url.searchParams);
    const props = {
        filters,
        options,
        permissions: filters.view_only ? { ...permissions, intake: false, process: false, decide: false, release: false } : permissions,
        today: '2026-10-09',
        auth: {
            user: { id: 'staff', first_name: 'Test', last_name: 'Staff' },
            roles: { isAdmin: true, isSuperAdmin: false },
            permissions: [
                'action_center.access',
                'action_center.beneficiaries.view',
                'goods_distribution.access',
                ...Object.keys(permissions).map((key) => 'goods_distribution.requests.' + key),
                'goods_distribution.inventory.view',
                'goods_distribution.inventory.manage',
            ],
        },
        currentMunicipality: { id: 'municipal', name: 'Gasan', slug: 'gasan-4905', settings: null },
        flash: {},
        errors: {},
    };
    let component = 'GoodsDistribution/Distribution/Index';
    if (url.pathname === prefix) {
        component = 'GoodsDistribution/Recipients';
        Object.assign(props, {
            canManage: !filters.view_only,
            canCorrect: !filters.view_only,
            canIntakeDistribution: !filters.view_only,
            recipient: filters.beneficiary_id
                ? {
                      data: {
                          id: 'person',
                          full_name: filters.long_name ? 'LongRecipientName'.repeat(9) : 'Susan Solis',
                          beneficiary_number: 'PERSON-1',
                          birth_date: '1960-01-01',
                          is_active: true,
                          identity_verified: false,
                          active_member_id: 'member',
                          relationship: 'parent',
                          household: registryHousehold,
                          roster: [
                              { id: 'member', beneficiary_id: null, full_name: 'Kenneth Solis', relationship: 'head' },
                              { id: 'filer', beneficiary_id: 'person', full_name: 'Susan Solis', relationship: 'parent' },
                          ],
                      },
                  }
                : null,
        });
    } else if (url.pathname.endsWith('/items')) {
        component = 'GoodsDistribution/Inventory/Catalog';
        Object.assign(props, { kind: 'items', records: pageData(catalog.slice(0, 20)), canManage: true, canAdjust: false });
    } else if (url.pathname.endsWith('/settings')) {
        component = 'GoodsDistribution/Inventory/Catalog';
        Object.assign(props, { kind: filters.kind || 'sources', records: pageData([]), canManage: true, canAdjust: false });
    } else if (url.pathname.endsWith('/programs')) {
        component = 'GoodsDistribution/Inventory/Programs';
        Object.assign(props, {
            records: pageData([{ id: 'program', name: 'AICS', code: 'AICS', is_active: true, items_in_stock: 0, draft_receipts_count: 0 }]),
            canManage: true,
            canAdjust: false,
        });
    } else if (url.pathname.endsWith('/create')) {
        component = 'GoodsDistribution/Distribution/Form';
        Object.assign(props, { request: null, selectedRecipient: null, canRegister: false });
    } else if (url.pathname.endsWith('/request')) {
        component = 'GoodsDistribution/Distribution/Details';
        Object.assign(props, {
            request: { ...record, snapshot: householdSynced ? liveSnapshot : snapshot, status: filters.status || record.status },
            householdSync:
                filters.tab === 'household' && ['pending', 'returned', 'under_review'].includes(filters.status)
                    ? {
                          snapshot: liveSnapshot,
                          fingerprint: 'a'.repeat(64),
                          changed: !householdSynced,
                          identity_changed: !householdSynced,
                          error: null,
                      }
                    : null,
            previousDistributions: [{ ...record, id: 'past', reference: 'GD-PREVIOUS', actual_release_on: '2026-09-20' }],
            history: {
                data: [
                    {
                        id: 1,
                        description: 'Approve goods request',
                        actor: 'Test Staff',
                        created_at: record.approved_at,
                        properties: {
                            before: { status: 'under_review', allocations: [] },
                            after: { status: 'approved', allocations: record.allocations },
                        },
                    },
                ],
                previous: null,
                next: null,
            },
        });
    } else if (url.pathname.endsWith('/programs/program')) {
        component = 'GoodsDistribution/Inventory/ProgramDetails';
        Object.assign(props, {
            tab: 'documents',
            canManage: true,
            canAdjust: false,
            canIntakeDistribution: true,
            program: { id: 'program', name: 'AICS Food Commodities', code: 'AICS', is_active: true },
            documentSettings: {
                requirements_fingerprint: 'review',
                requirements: [{ document_type_id: 'type', is_required: true, evidence_mode: 'both', physical_copy_requirement: 'original' }],
                document_types: [{ id: 'type', label: 'Certificate of Indigency', is_active: true }],
            },
        });
    } else
        Object.assign(props, {
            records: pageData([{ ...record, snapshot: { ...snapshot, subject: { ...person, name: 'LongRecipientName'.repeat(9) } } }]),
        });
    return { component, props, url: url.pathname + url.search, version: 'fixture', clearHistory: false, encryptHistory: false };
}
const server = createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        const json = (data, status = 200) => {
            res.writeHead(status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(data));
        };
        if (url.pathname.startsWith('/api/')) {
            assert.equal(req.headers['x-municipality-slug'], 'gasan-4905');
            let raw = '';
            for await (const chunk of req) raw += chunk;
            const body = raw ? JSON.parse(raw) : {};
            calls.push({ path: url.pathname, body });
            if (url.pathname.endsWith('/identity-check')) return json({ candidates: [], context: 'checked' });
            if (url.pathname.endsWith('/households/search')) return json({ data: [registryHousehold] });
            if (url.pathname.endsWith('/recipients/search')) return json({ data: [person] });
            if (url.pathname.endsWith('/requests/items')) {
                const matches = catalog.filter((item) => item.name.toLowerCase().includes((url.searchParams.get('search') || '').toLowerCase()));
                return json(pageData(matches.slice(0, 20)));
            }
            if (url.pathname.endsWith('/release')) {
                if (body.collector_type === 'representative') {
                    assert.equal(body.collector_id_last_four, 'AB12');
                } else {
                    assert.equal(body.collector_type, 'recipient');
                    for (const field of ['collector_name', 'collector_relationship', 'collector_id_type', 'collector_id_last_four']) {
                        assert.ok(!body[field], 'Recipient submission contains stale ' + field);
                    }
                }
                assert.deepEqual(body.confirmed_allocation_ids, ['allocation']);
                record = {
                    ...record,
                    ...body,
                    status: 'released',
                    version: record.version + 1,
                    allocations: record.allocations.map((a) => ({ ...a, status: 'consumed' })),
                };
                return json({ data: { id: record.id } });
            }
            if (url.pathname.endsWith('/sync-household')) {
                assert.equal(body.version, record.version);
                assert.equal(body.registry_fingerprint, 'a'.repeat(64));
                assert.equal(body.household_reviewed, true);
                assert.equal(Object.hasOwn(body, 'reason'), false);
                householdSynced = true;
                record = { ...record, version: record.version + 1 };
                return json({ data: { id: record.id } });
            }
            return json(
                { message: 'Refresh and review the current version.', errors: { distribution: ['Refresh and review the current version.'] } },
                422,
            );
        }
        if (url.pathname.startsWith('/build/')) {
            const file = path.resolve(root, 'public', '.' + url.pathname);
            assert.ok(file.startsWith(path.resolve(root, 'public/build') + path.sep));
            res.writeHead(200, {
                'Content-Type': file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream',
            });
            return res.end(await readFile(file));
        }
        if (!url.pathname.startsWith(prefix)) {
            res.writeHead(204);
            return res.end();
        }
        const page = pageFor(url);
        if (req.headers['x-inertia']) {
            res.setHeader('X-Inertia', 'true');
            return json(page);
        }
        const data = JSON.stringify(page).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
        res.setHeader('Content-Type', 'text/html');
        res.end(
            `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">${(entry.css || []).map((file) => `<link rel="stylesheet" href="/build/${file}">`).join('')}</head><body><div id="app" data-page='${data}'></div><script type="module" src="/build/${entry.file}"></script></body></html>`,
        );
    } catch (error) {
        errors.push(String(error));
        res.writeHead(500);
        res.end(String(error));
    }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = 'http://127.0.0.1:' + server.address().port;
let browser;
try {
    browser = await puppeteer.launch({ headless: true, ...(process.env.GOODS_UI_BROWSER ? { executablePath: process.env.GOODS_UI_BROWSER } : {}) });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => localStorage.setItem('activeSidebarUrl', '/gasan-4905/goods-distribution/items'));
    page.on('pageerror', (error) => errors.push(String(error)));
    const go = async (suffix) => {
        await page.goto(origin + prefix + suffix, { waitUntil: 'networkidle0' });
        await page.waitForSelector('main');
    };
    const click = async (text) => {
        assert.ok(
            await page.evaluate((text) => {
                const button = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
                button?.click();
                return !!button;
            }, text),
            'Missing button: ' + text,
        );
    };
    const fill = async (label, value) => {
        await page.evaluate((label) => {
            const el = [...document.querySelectorAll('label')].find((l) => l.textContent.trim() === label)?.querySelector('input');
            if (!el) throw Error('Missing field: ' + label);
            el.focus();
        }, label);
        await page.keyboard.type(value);
    };
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 960 });
        for (const suffix of [
            '',
            '?beneficiary_id=person',
            '?beneficiary_id=person&long_name=1',
            '?beneficiary_id=person&view_only=1',
            '/items',
            '/distribution',
            '/distribution/create',
            '/distribution/request',
            '/distribution/request?tab=household',
            '/distribution/request?tab=household&status=pending',
            '/distribution/request?tab=household&status=under_review',
            '/distribution/request?tab=documents&status=under_review',
            '/distribution/request?tab=history',
            '/programs/program?tab=documents',
        ]) {
            await go(suffix);
            if (width === 1440) {
                const sidebarItems = await page.$$eval('[data-sidebar="menu-sub-button"]', (items) => items.map((item) => item.textContent.trim()));
                assert.ok(sidebarItems.includes('Programs'), 'Programs remains the stock entry point');
                assert.ok(!sidebarItems.includes('Inventory'), 'Combined inventory is not shown in the sidebar');
                const activeItems = await page.$$eval('[data-sidebar="menu-sub-button"][data-active="true"]', (items) =>
                    items.map((item) => item.textContent.trim()),
                );
                const expected = suffix.startsWith('/programs/')
                    ? 'Programs'
                    : suffix.startsWith('/distribution')
                      ? 'Distribution'
                      : suffix === '/items'
                        ? 'Items'
                        : 'Find/Register Recipient';
                assert.deepEqual(activeItems, [expected], 'One current-page highlight despite stale storage: ' + suffix);
            }
            assert.ok(
                await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
                'Horizontal overflow ' + suffix + ' at ' + width,
            );
            await page.screenshot({ path: path.join(output, width + '-' + suffix.replace(/[^a-z0-9]/gi, '_') + '.png'), fullPage: true });
        }
    }
    for (const width of [1440, 390]) {
        householdSynced = false;
        await page.setViewport({ width, height: 960 });
        await go('/distribution/request?tab=household&status=pending');
        await click('Sync household');
        await page.waitForSelector('[role="dialog"]');
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[role="dialog"]')).opacity) === 1);
        assert.ok(await page.evaluate(() => document.body.innerText.includes('Document inspections will be reset')));
        assert.ok(await page.$eval('[role="dialog"] button:last-child', (button) => !button.disabled));
        assert.equal(await page.$('[role="dialog"] textarea'), null);
        assert.equal(await page.$('[role="dialog"] input[type="checkbox"]'), null);
        assert.deepEqual(
            await page.$$eval('[role="dialog"] table tbody tr', (rows) => rows.map((row) => row.querySelector('td p').textContent)),
            liveSnapshot.roster.map((member) => member.name),
        );
        assert.equal(await page.evaluate(() => document.querySelector('[role="dialog"]').innerText.includes('Saved on request')), false);
        assert.ok(
            await page.evaluate(() => {
                const dialog = document.querySelector('[role="dialog"]');
                const footer = dialog.querySelector('[data-slot="dialog-footer"]').getBoundingClientRect();
                const bounds = dialog.getBoundingClientRect();
                return footer.top >= bounds.top && footer.bottom <= bounds.bottom && bounds.bottom <= window.innerHeight;
            }),
            'Sync actions remain visible at ' + width,
        );
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await page.screenshot({ path: path.join(output, width + '-household-sync-dialog.png'), fullPage: true });
        await page.evaluate(() => {
            const scroller = document.querySelector('[role="dialog"] .overflow-y-auto');
            scroller.scrollTop = scroller.scrollHeight;
        });
        await page.screenshot({ path: path.join(output, width + '-household-sync-members.png'), fullPage: true });
        await page.$eval('[role="dialog"] button:last-child', (button) => button.click());
        await page.waitForFunction(
            () => !document.querySelector('[role="dialog"]') && document.body.innerText.includes('Household snapshot is up to date.'),
        );
        assert.ok(await page.evaluate(() => document.body.innerText.includes('Updated street')));
    }
    await page.setViewport({ width: 390, height: 640 });
    householdSynced = false;
    await go('/distribution/request?tab=household&status=pending');
    await click('Sync household');
    await page.waitForSelector('[role="dialog"]');
    await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[role="dialog"]')).opacity) === 1);
    assert.ok(
        await page.evaluate(() => {
            const dialog = document.querySelector('[role="dialog"]');
            const scroller = dialog.querySelector('.overflow-y-auto');
            const footer = dialog.querySelector('[data-slot="dialog-footer"]').getBoundingClientRect();
            return scroller.clientHeight > 80 && scroller.scrollHeight > scroller.clientHeight && footer.bottom <= window.innerHeight;
        }),
        'Short mobile screen retains scrolling content and visible actions',
    );
    await page.screenshot({ path: path.join(output, '390-short-household-sync-dialog.png'), fullPage: true });
    await page.keyboard.press('Escape');
    householdSynced = false;
    for (const suffix of [
        '?tab=household&status=approved',
        '?tab=household&status=released',
        '?tab=household&status=cancelled',
        '?tab=household&status=pending&view_only=1',
    ]) {
        await go('/distribution/request' + suffix);
        assert.equal(
            await page.evaluate(() => [...document.querySelectorAll('button')].some((button) => button.textContent.trim() === 'Sync household')),
            false,
        );
    }
    await page.setViewport({ width: 1440, height: 960 });
    await go('?beneficiary_id=person');
    await page.evaluate(() => localStorage.setItem('activeSidebarUrl', '/legacy/saved-page'));
    await page.evaluate(() =>
        [...document.querySelectorAll('[data-sidebar="menu-sub-button"]')].find((item) => item.textContent.trim() === 'Items').click(),
    );
    await page.waitForFunction(() => location.pathname.endsWith('/items'));
    assert.deepEqual(
        await page.$$eval('[aria-current="page"][data-sidebar="menu-sub-button"]', (items) => items.map((item) => item.textContent.trim())),
        ['Items'],
    );
    assert.equal(await page.evaluate(() => localStorage.getItem('activeSidebarUrl')), '/legacy/saved-page');
    await page.goBack({ waitUntil: 'networkidle0' });
    assert.deepEqual(
        await page.$$eval('[aria-current="page"][data-sidebar="menu-sub-button"]', (items) => items.map((item) => item.textContent.trim())),
        ['Find/Register Recipient'],
    );
    await page.goForward({ waitUntil: 'networkidle0' });
    assert.deepEqual(
        await page.$$eval('[aria-current="page"][data-sidebar="menu-sub-button"]', (items) => items.map((item) => item.textContent.trim())),
        ['Items'],
    );
    await page.setViewport({ width: 390, height: 960 });
    for (const [suffix, command, nameLabel] of [
        ['/items', 'Add item', 'Item name'],
        ['/programs', 'Add program', 'Name'],
        ['/settings?kind=sources', 'Add source', 'Name'],
        ['/settings?kind=locations', 'Add location', 'Name'],
    ]) {
        await go(suffix);
        await click(command);
        await page.waitForSelector('[role="dialog"]');
        await fill(nameLabel, 'Mixed case name');
        const values = await page.$$eval('[role="dialog"] input', (inputs) =>
            inputs.filter((input) => input.type === 'text').map((input) => input.value),
        );
        assert.ok(values.includes('MIXED CASE NAME'), 'Uppercase name in ' + suffix);
        assert.equal(
            await page.evaluate(() => [...document.querySelectorAll('[role="dialog"] label')].some((label) => label.textContent.trim() === 'Code')),
            false,
            'Creation has no editable code in ' + suffix,
        );
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await page.screenshot({ path: path.join(output, 'uppercase-' + suffix.replace(/[^a-z0-9]/gi, '_') + '.png'), fullPage: true });
    }
    await go('/items');
    await page.click('button[aria-label="Edit Commercial Rice"]');
    await page.waitForSelector('[role="dialog"]');
    assert.ok(await page.$eval('[role="dialog"] input[readonly]', (input) => input.value === 'RICE'));
    await click('Cancel');
    await go('?beneficiary_id=person');
    assert.ok(await page.$('a[href*="/distribution/create?beneficiary_id=person"]'));
    assert.equal(await page.evaluate(() => document.body.innerText.includes('Goods handover')), false);
    await go('?beneficiary_id=person&view_only=1');
    assert.equal(await page.$('a[href*="/distribution/create?beneficiary_id=person"]'), null);
    await go('');
    await page.type('#check-first_name', 'New');
    await page.type('#check-last_name', 'Recipient');
    await page.$eval('#check-birth_date', (input) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(input, '1990-01-01');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await click('Check registry');
    await page.waitForFunction(() => document.body.innerText.includes('No possible match found'));
    await click('Continue to registration');
    await page.waitForSelector('#household-search');
    await page.type('#household-search', 'Kenneth');
    await click('Search');
    await page.waitForSelector('input[name="destination-household"]');
    await page.click('input[name="destination-household"]');
    assert.ok(await page.evaluate(() => !document.querySelector('section[aria-label="Registration household"] button:last-child').disabled));
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await page.screenshot({ path: path.join(output, 'mobile-recipient-household-selection.png'), fullPage: true });
    await page.type('#check-first_name', ' changed');
    assert.equal(await page.$('section[aria-label="Registration household"]'), null);
    await go('/distribution/create');
    await page.type('input[aria-label="Search beneficiary registry"]', 'Susan');
    await click('Search registry');
    await page.waitForSelector('input[name="recipient"]');
    await page.click('input[name="recipient"]');
    await page.evaluate(() => {
        const selects = [...document.querySelectorAll('select')];
        for (const [index, value] of [
            [1, 'program'],
            [2, 'storage'],
        ]) {
            selects[index].value = value;
            selects[index].dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    await page.click('input[aria-label="Item"]');
    await page.type('input[aria-label="Item"]', 'Rice');
    await page.waitForSelector('[role="option"]');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await fill('Quantity (kg)', '2');
    await click('Save request');
    await page.waitForFunction(() => document.body.innerText.includes('Refresh and review the current version.'));
    assert.ok(calls.some((c) => c.path.endsWith('/requests') && c.body.lines[0].quantity === '2'));
    const approvedRecord = structuredClone(record);
    const changeCollector = async (value) =>
        page.evaluate((value) => {
            const select = document.querySelector('[role="dialog"] select');
            select.value = value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
        }, value);
    const representativeValues = [
        ['Representative full name', 'Kenneth Solis'],
        ['Relationship to recipient', 'Son'],
        ['Inspected ID type', 'National ID'],
        ['Last four ID characters', 'AB12'],
    ];
    await go('/distribution/request');
    await click('Record handover');
    await page.waitForSelector('[role="dialog"]');
    await changeCollector('representative');
    for (const [label, value] of [...representativeValues, ['Acknowledgement reference', 'ACK-001']]) await fill(label, value);
    for (const checkbox of await page.$$('[role="dialog"] input[type="checkbox"]')) await checkbox.click();
    await changeCollector('recipient');
    assert.deepEqual(await page.$$eval('[role="dialog"] input[type="checkbox"]', (inputs) => inputs.map((input) => input.checked)), [
        true,
        false,
        false,
    ]);
    await changeCollector('representative');
    for (const [label] of representativeValues) {
        assert.equal(
            await page.evaluate(
                (label) =>
                    [...document.querySelectorAll('[role="dialog"] label')]
                        .find((element) => element.textContent.trim() === label)
                        .querySelector('input').value,
                label,
            ),
            '',
        );
    }
    for (const [label, value] of representativeValues) await fill(label, value);
    for (const checkbox of await page.$$('[role="dialog"] input[type="checkbox"]'))
        if (!(await checkbox.evaluate((input) => input.checked))) await checkbox.click();
    await page.screenshot({ path: path.join(output, 'mobile-release-dialog.png'), fullPage: true });
    await click('Record goods handover');
    await page.waitForFunction(() => document.body.innerText.includes('Handover') && !document.querySelector('[role="dialog"]'));
    record = { ...approvedRecord, version: record.version + 1 };
    await go('/distribution/request');
    await click('Record handover');
    await page.waitForSelector('[role="dialog"]');
    await changeCollector('representative');
    for (const [label, value] of [...representativeValues, ['Acknowledgement reference', 'ACK-002']]) await fill(label, value);
    for (const checkbox of await page.$$('[role="dialog"] input[type="checkbox"]')) await checkbox.click();
    await changeCollector('recipient');
    assert.deepEqual(await page.$$eval('[role="dialog"] input[type="checkbox"]', (inputs) => inputs.map((input) => input.checked)), [
        true,
        false,
        false,
    ]);
    for (const checkbox of await page.$$('[role="dialog"] input[type="checkbox"]'))
        if (!(await checkbox.evaluate((input) => input.checked))) await checkbox.click();
    await click('Record goods handover');
    await page.waitForFunction(() => document.body.innerText.includes('Handover') && !document.querySelector('[role="dialog"]'));
    assert.ok(calls.some((call) => call.path.endsWith('/release') && call.body.collector_type === 'recipient' && !call.body.collector_id_last_four));
    await go('/distribution/request?view_only=1');
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].some((b) => b.textContent.trim() === 'Record handover')), false);
    assert.deepEqual(errors, []);
    console.log(
        'Desktop/mobile screens, reviewed household sync, recipient selection, searchable items, validation, municipality headers, collector-switch clearing and re-confirmation, representative/recipient release, and view-only controls passed.',
    );
    console.log('Screenshots: ' + output);
} finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
}
