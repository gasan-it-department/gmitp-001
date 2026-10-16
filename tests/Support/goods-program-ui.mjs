import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { closeGoodsFixture, inspectGoodsPages } from './goods-responsive-checks.mjs';

// Isolated production-asset UI fixture. No application database is accessed.
const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, 'public/build/manifest.json'), 'utf8'));
const entry = manifest['resources/js/app.tsx'];
const program = { id: 'program-a', code: 'AICS', name: 'AICS Food Commodities', is_active: true, items_in_stock: 101, draft_receipts_count: 2 };
const programsOnly = process.argv.includes('--programs-only');
const inventoryOnly = process.argv.includes('--inventory-only');
const receiptsOnly = process.argv.includes('--receipts-only');
const catalogOnly = process.argv.includes('--catalog-only');
const itemOnly = process.argv.includes('--item-detail-only');
const detailOnly = process.argv.includes('--detail-only') || itemOnly;
const receivingOnly = process.argv.includes('--receiving-only');
const programEditOnly = process.argv.includes('--program-edit-only');
const directory = [
    { ...program, description: 'Municipal food commodities for the annual AICS program.' },
    {
        id: 'program-b',
        code: 'PROV-RELIEF',
        name: 'Provincial Relief Goods',
        description: 'Food and essential supplies from the provincial government.',
        is_active: true,
        items_in_stock: 12,
        draft_receipts_count: 1,
    },
    {
        id: 'program-c',
        code: 'SPECIAL',
        name: 'Special Assistance ' + 'LongProgramName'.repeat(7),
        description: 'Community assistance and donated goods.',
        is_active: true,
        items_in_stock: 0,
        draft_receipts_count: 0,
    },
    {
        id: 'program-d',
        code: 'DRRM',
        name: 'Disaster Preparedness',
        description: 'Emergency supplies.',
        is_active: false,
        items_in_stock: 4,
        draft_receipts_count: 0,
    },
];
const catalog = Array.from({ length: 105 }, (_, i) => ({
    id: `item-${i}`,
    code: `ITEM-${i}`,
    name: i === 0 ? 'Commercial Rice' : `Food item ${String(i).padStart(3, '0')} with a long descriptive catalog name`,
    base_unit: 'kg',
    is_active: true,
}));
catalog[104].is_active = false;
catalog[19].name = 'LongItemName'.repeat(12);
if (programEditOnly) catalog[0].base_unit_locked = true;
const programItems = new Map(
    catalog.slice(0, 100).map((item) => [item.id, { id: `membership-${item.id}`, program_id: program.id, is_active: true, item }]),
);
const itemContext = (item) => ({
    ...item,
    program_item_active: programItems.get(item.id)?.is_active ?? null,
    connected_programs: programItems.has(item.id)
        ? [
              { id: program.id, name: program.name, is_active: programItems.get(item.id).is_active },
              ...(programEditOnly && item.id === 'item-0' ? [{ id: 'program-b', name: 'Provincial Relief Goods', is_active: true }] : []),
          ]
        : [],
});
const paginate = (data) => ({
    data,
    meta: { current_page: 1, last_page: 1, total: data.length, from: data.length ? 1 : null, to: data.length || null },
    links: { prev: null, next: null },
});
const options = {
    items: [],
    programs: [program],
    sources: [{ id: 'source', name: 'Municipal procurement', is_active: true }],
    locations: [{ id: 'storage', name: 'Main warehouse', is_active: true }],
};
const prefix = '/gasan-4905/goods-distribution';
const errors = [];
const requests = [];
const baseProps = {
    itemCategories: [
        { value: 'food', label: 'Food' },
        { value: 'hygiene', label: 'Hygiene supplies' },
        { value: 'household_supplies', label: 'Household supplies' },
        { value: 'other', label: 'Other' },
    ],
    auth: {
        user: { id: 'test-user', name: 'Test Staff', first_name: 'Test', last_name: 'Staff' },
        roles: { isAdmin: true, isSuperAdmin: false },
        permissions: [
            'goods_distribution.access',
            'goods_distribution.inventory.view',
            'goods_distribution.inventory.manage',
            'goods_distribution.inventory.adjust',
        ],
    },
    currentMunicipality: { id: 'test', name: 'Gasan', slug: 'gasan-4905', settings: null },
    flash: {},
    errors: {},
    canManage: true,
    canAdjust: true,
    options,
};
function pageFor(url) {
    const filters = Object.fromEntries(url.searchParams);
    const props = { ...baseProps, filters, url: url.pathname, canManage: filters.view_only !== '1' };
    let component;
    if (url.pathname.endsWith('/stock-receipts/receipt-test') && (itemOnly || filters.item_details === '1')) {
        component = 'ItemDetails';
        const receipt = {
            id: 'receipt-test',
            receipt_number: 'GD-2026-TEST',
            status: 'posted',
            source_name_snapshot: 'Municipal procurement',
            storage_location_name_snapshot: 'Main warehouse',
        };
        Object.assign(props, {
            item: { ...catalog[0], balance: '245.000' },
            batches: paginate([
                {
                    id: 'batch-a',
                    receipt,
                    balance: '245.000',
                    base_unit: 'kg',
                    expiry_state: 'none',
                    program_name: program.name,
                    batch_reference: 'RICE-Q4',
                },
            ]),
            movements: paginate([
                {
                    id: 'movement-a',
                    receipt,
                    occurred_on: '2026-10-08',
                    posted_at: '2026-10-08T10:00:00Z',
                    type: 'adjustment',
                    quantity: '-5.000',
                    base_unit: 'kg',
                    reason: 'Damaged rice',
                    reference: 'DAMAGE-001',
                    actor: 'Test Staff',
                },
            ]),
        });
    } else if (url.pathname.endsWith('/stock-receipts/receipt-test')) {
        component = 'ReceiptDetails';
        Object.assign(props, {
            receipt: {
                id: 'receipt-test',
                receipt_number: 'GD-2026-RECEIPT-TEST',
                status: filters.status || 'draft',
                kind: 'receipt',
                received_on: '2026-10-08',
                source_name: 'Municipal procurement',
                location_name: 'Main warehouse',
                created_by: 'Test Staff',
                reference: 'DELIVERY-001',
                programs: [program],
                lines: [
                    {
                        id: 'line-a',
                        item_id: 'item-0',
                        item_name: 'Commercial Rice',
                        program_id: program.id,
                        program_name: program.name,
                        package_type: 'sack',
                        package_count: '10',
                        quantity_per_package: '25',
                        quantity: '250.000',
                        base_unit: 'kg',
                        batch_reference: 'RICE-Q4',
                    },
                ],
            },
        });
    } else if (url.pathname.endsWith('/create')) {
        component = 'ReceiptForm';
        Object.assign(props, { program: url.pathname.includes('/programs/') ? program : null, receipt: null, today: '2026-10-07' });
    } else if (url.pathname.endsWith('/program-a')) {
        component = 'ProgramDetails';
        const tab = filters.tab || 'stock';
        Object.assign(props, {
            program: filters.long_name === '1' ? { ...program, name: 'LongProgramName'.repeat(12) } : program,
            tab,
            records: paginate(
                tab === 'items'
                    ? [...programItems.values()]
                          .filter(
                              (row) =>
                                  (!filters.active || row.is_active === (filters.active === 'active')) &&
                                  (!filters.search || row.item.name.toLowerCase().includes(filters.search.toLowerCase())),
                          )
                          .slice(0, 20)
                          .map((row) => ({ ...row, item: itemContext(row.item) }))
                    : tab === 'stock' && !filters.empty
                      ? catalog.slice(0, 20).map((item) => ({ ...item, balance: '250.000' }))
                      : [],
            ),
        });
    } else if (url.pathname.endsWith('/items') || url.pathname.endsWith('/settings')) {
        component = 'Catalog';
        const kind = url.pathname.endsWith('/items') ? 'items' : filters.kind || 'sources';
        Object.assign(props, {
            kind,
            records: paginate(
                filters.search
                    ? []
                    : kind === 'items'
                      ? catalog.slice(0, 20).map(itemContext)
                      : [
                            {
                                id: 'setup-a',
                                code: 'MAIN',
                                name: kind === 'sources' ? 'Municipal procurement' : 'Main warehouse',
                                is_active: true,
                                source_type: kind === 'sources' ? 'lgu' : null,
                                address: 'Gasan',
                            },
                            { id: 'setup-b', code: 'OLD', name: 'Historical record', is_active: false },
                        ],
            ),
        });
    } else if (url.pathname.endsWith('/stock-receipts')) {
        component = 'Receipts';
        Object.assign(props, {
            records: paginate(
                filters.search
                    ? []
                    : ['draft', 'posted', 'voided']
                          .filter((status) => !filters.status || status === filters.status)
                          .map((status, i) => ({
                              id: `receipt-${i}`,
                              receipt_number: `GD-2026-${i}`,
                              received_on: '2026-10-08',
                              source_name: 'Municipal procurement',
                              location_name: 'Main warehouse',
                              kind: i === 0 ? 'opening' : 'receipt',
                              status,
                              programs: [program],
                          })),
            ),
        });
    } else if (url.pathname.endsWith('/inventory')) {
        component = 'Index';
        Object.assign(props, {
            records: paginate(
                filters.search
                    ? []
                    : [
                          { ...catalog[0], balance: '250.000', category: 'Food' },
                          { ...catalog[1], name: 'Canned tuna', base_unit: 'piece', balance: '120.000' },
                          { ...catalog[2], name: 'LongItemName'.repeat(12), is_active: false, balance: '5.000' },
                      ],
            ),
        });
    } else {
        component = 'Programs';
        Object.assign(props, {
            records: paginate(
                directory.filter(
                    (record) =>
                        (!filters.active || record.is_active === (filters.active === 'active')) &&
                        (!filters.search || `${record.name} ${record.code}`.toLowerCase().includes(filters.search.toLowerCase())),
                ),
            ),
        });
    }
    return {
        component: `GoodsDistribution/Inventory/${component}`,
        props,
        url: url.pathname + url.search,
        version: null,
        clearHistory: false,
        encryptHistory: false,
    };
}
const server = createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        const json = (value, status = 200) => {
            res.writeHead(status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(value));
        };
        if (url.pathname.startsWith('/api/')) {
            assert.equal(req.headers['x-municipality-slug'], 'gasan-4905');
            let raw = '';
            for await (const chunk of req) raw += chunk;
            const body = raw ? JSON.parse(raw) : {};
            requests.push({ url: url.pathname, body });
            if (url.pathname.endsWith('/items/search')) {
                const shared = url.searchParams.get('catalog_scope') === 'shared';
                const matches = catalog
                    .filter(
                        (item) =>
                            (shared || (item.is_active && (!url.searchParams.get('program_id') || programItems.get(item.id)?.is_active))) &&
                            item.name.toLowerCase().includes((url.searchParams.get('q') || '').toLowerCase()),
                    )
                    .map(itemContext);
                const p = Number(url.searchParams.get('page') || 1);
                return json({
                    ...paginate(matches.slice((p - 1) * 20, p * 20)),
                    links: { prev: null, next: p * 20 < matches.length ? '?page=2' : null },
                });
            }
            if (url.pathname.endsWith('/items/check')) return json({ data: { matches: [], reviewed_item_ids: [] } });
            if (url.pathname.startsWith('/api/goods-distribution/catalog/items/') && req.method === 'PATCH') {
                const item = catalog.find((row) => row.id === url.pathname.split('/').at(-1));
                assert.ok(item);
                assert.equal(body.confirm_shared_change, true);
                assert.equal(body.base_unit, item.base_unit);
                Object.assign(item, body);
                return json({ data: itemContext(item) });
            }
            if (url.pathname.endsWith('/program-a/items/create')) {
                const item = { ...body, id: 'new-item' };
                catalog.push(item);
                programItems.set(item.id, { id: `membership-${item.id}`, program_id: program.id, is_active: true, item });
                return json({ data: itemContext(item) });
            }
            if (url.pathname.includes('/program-a/items') && req.method !== 'GET') {
                const id = body.item_id || url.pathname.split('/').at(-1);
                const item = catalog.find((row) => row.id === id);
                assert.ok(item);
                if (body.reactivate_global) item.is_active = true;
                const membership = { id: `membership-${id}`, program_id: program.id, is_active: body.is_active ?? true, item };
                programItems.set(id, membership);
                return json({ data: { ...membership, item: itemContext(item) } });
            }
            if (url.pathname.endsWith('/items')) {
                const item = { ...body, id: 'new-item' };
                catalog.push(item);
                return json({ data: item });
            }
            return json({ errors: { reference: ['Fixture validation: review reference.'] } }, 422);
        }
        if (url.pathname.startsWith('/build/')) {
            const file = path.resolve(root, 'public', `.${url.pathname}`);
            assert.ok(file.startsWith(path.resolve(root, 'public/build') + path.sep));
            const ext = path.extname(file);
            res.writeHead(200, {
                'Content-Type': ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : 'application/octet-stream',
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
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
let activePage;
try {
    browser = await puppeteer.launch({ headless: true, ...(process.env.GOODS_UI_BROWSER ? { executablePath: process.env.GOODS_UI_BROWSER } : {}) });
    const page = await browser.newPage();
    activePage = page;
    page.on('pageerror', (error) => errors.push(String(error)));
    const go = async (suffix) => {
        await page.goto(origin + prefix + suffix, { waitUntil: 'networkidle0' });
        await page.waitForSelector('main');
    };
    const clickText = async (text) => {
        const found = await page.evaluate((text) => {
            const button = [...document.querySelectorAll('button')].find((el) => el.textContent.trim() === text);
            button?.click();
            return !!button;
        }, text);
        assert.ok(found, `Missing button: ${text}`);
    };
    const fillLabel = async (text, value) => {
        await page.evaluate((text) => {
            const label = [...document.querySelectorAll('label')].find((el) => el.textContent.trim() === text);
            const input = label?.querySelector('input');
            if (!input) throw Error(`Missing input: ${text}`);
            input.focus();
        }, text);
        await page.keyboard.type(value);
    };
    await mkdir(path.join(root, 'storage/app'), { recursive: true });
    if (process.argv.includes('--responsive-only')) {
        await inspectGoodsPages(page, go, [
            '/programs', '/programs?search=NO-SUCH-PROGRAM', '/programs/program-a?long_name=1',
            '/programs/program-a?tab=items&long_name=1', '/programs/program-a?tab=receipts',
            '/programs/program-a?tab=movements', '/inventory', '/items', '/settings', '/settings?kind=locations',
            '/stock-receipts', '/stock-receipts/receipt-test', '/stock-receipts/receipt-test?status=posted',
            '/stock-receipts/receipt-test?item_details=1', '/stock-receipts/create', '/programs/program-a/stock-receipts/create',
        ], path.join(root, 'storage/app'), [
            { suffix: '/programs', button: 'Add program' },
            { suffix: '/items', button: 'Add item' },
        ]);
        assert.deepEqual(errors, []);
        console.log('PASS: inventory, catalog, program, receipt and receiving pages at phone/tablet/desktop sizes.');
    } else {
    if (detailOnly) {
        for (const width of [1440, 390]) {
            await page.setViewport({ width, height: 1000 });
            for (const status of ['draft', 'posted', 'voided']) {
                await go(`/stock-receipts/receipt-test?status=${status}`);
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                if (status === 'draft')
                    await page.screenshot({ path: path.join(root, `storage/app/goods-receipt-detail-${width}.png`), fullPage: true });
            }
        }
    }
    for (const width of detailOnly || receivingOnly || programEditOnly
        ? []
        : programsOnly || inventoryOnly || receiptsOnly || catalogOnly
          ? [1440, 1024, 768, 390]
          : [1440, 390]) {
        await page.setViewport({ width, height: 1000 });
        for (const suffix of catalogOnly
            ? ['/items', '/items?search=missing', '/items?view_only=1', '/settings', '/settings?kind=locations']
            : receiptsOnly
              ? ['/stock-receipts', '/stock-receipts?search=missing', '/stock-receipts?status=posted', '/stock-receipts?view_only=1']
              : inventoryOnly
                ? ['/inventory', '/inventory?search=missing', '/inventory?view_only=1']
                : programsOnly
                  ? ['/programs', '/programs?search=NO-SUCH-PROGRAM', '/programs?active=inactive', '/programs?view_only=1']
                  : [
                        '/programs',
                        '/programs/program-a',
                        '/programs/program-a?tab=items',
                        '/programs/program-a?tab=items&long_name=1',
                        '/programs/program-a?tab=items&view_only=1',
                        '/programs/program-a?tab=receipts',
                        '/programs/program-a?tab=movements',
                        '/programs/program-a?empty=1',
                        '/programs/program-a/stock-receipts/create',
                    ]) {
            await go(suffix);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${width} ${suffix}`);
            if (suffix === '/programs/program-a')
                await page.screenshot({ path: path.join(root, `storage/app/goods-program-${width}.png`), fullPage: true });
            if (suffix === '/programs/program-a?tab=items')
                await page.screenshot({ path: path.join(root, `storage/app/goods-program-items-${width}.png`), fullPage: true });
            if (suffix === '/programs/program-a?tab=items')
                await page.screenshot({ path: path.join(root, `storage/app/goods-program-items-viewport-${width}.png`) });
            if (suffix === '/programs')
                await page.screenshot({ path: path.join(root, `storage/app/goods-programs-directory-${width}.png`), fullPage: true });
            if (suffix === '/inventory')
                await page.screenshot({ path: path.join(root, `storage/app/goods-inventory-directory-${width}.png`), fullPage: true });
            if (suffix === '/stock-receipts')
                await page.screenshot({ path: path.join(root, `storage/app/goods-receipts-directory-${width}.png`), fullPage: true });
            if (catalogOnly && (suffix === '/items' || suffix === '/settings'))
                await page.screenshot({ path: path.join(root, `storage/app/goods-${suffix.slice(1)}-directory-${width}.png`), fullPage: true });
            if (suffix.endsWith('view_only=1'))
                assert.equal(
                    await page.$$eval('main button', (buttons) => buttons.filter((el) => el.textContent.trim() === 'Add program').length),
                    0,
                );
        }
        if (!programsOnly && !inventoryOnly && !receiptsOnly && !catalogOnly)
            await page.screenshot({ path: path.join(root, `storage/app/goods-receiving-${width}.png`), fullPage: true });
    }
    if (programEditOnly) {
        for (const width of [1440, 1024, 768, 390]) {
            await page.setViewport({ width, height: 1000 });
            await go('/programs/program-a?tab=items&view_only=1');
            assert.equal(await page.$$eval('button[aria-label^="Edit shared item"]', (buttons) => buttons.length), 0);
            await go('/programs/program-a?tab=items');
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
            assert.ok(
                await page.$$eval('tbody td:last-child', (cells) =>
                    cells.every((cell) =>
                        [...cell.querySelectorAll('button')].every((button) => {
                            const bounds = button.getBoundingClientRect();
                            const parent = cell.getBoundingClientRect();
                            return (
                                bounds.left >= parent.left &&
                                bounds.right <= parent.right &&
                                bounds.top >= parent.top &&
                                bounds.bottom <= parent.bottom
                            );
                        }),
                    ),
                ),
            );
            await page.screenshot({ path: path.join(root, `storage/app/goods-program-edit-actions-${width}.png`) });
            await page.click('button[aria-label="Edit shared item Commercial Rice"]');
            await page.waitForSelector('[role="dialog"]');
            assert.ok(await page.$eval('[role="dialog"]', (dialog) => dialog.innerText.includes('Edit shared item')));
            assert.equal(
                await page.$$eval(
                    '[role="dialog"] label',
                    (labels) => labels.find((label) => label.querySelector('span')?.textContent === 'Base unit').querySelector('select').disabled,
                ),
                true,
            );
            await page.evaluate(() =>
                [...document.querySelectorAll('[role="dialog"] label')]
                    .find((label) => label.querySelector('span')?.textContent === 'Description')
                    .querySelector('textarea')
                    .focus(),
            );
            await page.keyboard.type('Reviewed description');
            assert.ok(
                await page.$eval(
                    '[role="dialog"]',
                    (dialog) => dialog.innerText.includes('Provincial Relief Goods') && dialog.innerText.includes('AICS Food Commodities'),
                ),
            );
            assert.equal(
                await page.$$eval(
                    '[role="dialog"] button',
                    (buttons) => buttons.find((button) => button.textContent.trim() === 'Save item').disabled,
                ),
                true,
            );
            await page.screenshot({ path: path.join(root, `storage/app/goods-program-edit-dialog-${width}.png`) });
            const beforeCancel = requests.filter((request) => request.url.includes('/catalog/items/')).length;
            await clickText('Cancel');
            assert.equal(requests.filter((request) => request.url.includes('/catalog/items/')).length, beforeCancel);
        }
        await page.click('button[aria-label="Edit shared item Commercial Rice"]');
        await page.waitForSelector('[role="dialog"]');
        await page.evaluate(() =>
            [...document.querySelectorAll('[role="dialog"] label')]
                .find((label) => label.querySelector('span')?.textContent === 'Description')
                .querySelector('textarea')
                .focus(),
        );
        await page.keyboard.type('Confirmed shared description');
        await page.click('[role="dialog"] input[type="checkbox"]');
        await clickText('Save item');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.ok(page.url().includes('tab=items'));
        assert.equal(catalog[0].description, 'Confirmed shared description');
        assert.equal(programItems.get('item-0').is_active, true);
        await page.click('button[aria-label="Edit shared item Commercial Rice"]');
        await page.waitForSelector('[role="dialog"]');
        assert.equal(
            await page.$$eval(
                '[role="dialog"] label',
                (labels) => labels.find((label) => label.querySelector('span')?.textContent === 'Description').querySelector('textarea').value,
            ),
            'Confirmed shared description',
        );
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(
            'PASS: program item edit desktop/tablet/mobile, view-only visibility, unit lock, connected-program confirmation, cancel/save, municipality header and preserved program context.',
        );
    } else if (receivingOnly) {
        for (const width of [1440, 1024, 768, 390]) {
            await page.setViewport({ width, height: 1000 });
            for (const scoped of [true, false]) {
                await go(scoped ? '/programs/program-a/stock-receipts/create' : '/stock-receipts/create');
                await page.type('input[role="combobox"]', 'Commercial Rice');
                await page.waitForSelector('[role="option"]');
                await page.keyboard.press('ArrowDown');
                await page.keyboard.press('Enter');
                const setPackaging = async (value) =>
                    page.evaluate((value) => {
                        const select = [...document.querySelectorAll('fieldset label')]
                            .find((label) => label.querySelector('span')?.textContent === 'Packaging')
                            .querySelector('select');
                        select.value = value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                    }, value);
                const aligned = async () => {
                    const metrics = await page.$$eval(
                        'fieldset[aria-label="Item 1"] > div:first-child input, fieldset[aria-label="Item 1"] > div:first-child select',
                        (fields) => fields.map((field) => ({ top: field.getBoundingClientRect().top, height: field.getBoundingClientRect().height })),
                    );
                    assert.ok(
                        metrics.every((field) => Math.abs(field.height - 40) < 1),
                        `Unequal input heights at ${width}`,
                    );
                    if (width >= 1024)
                        assert.ok(
                            Math.max(...metrics.map((field) => field.top)) - Math.min(...metrics.map((field) => field.top)) < 1,
                            `Misaligned controls at ${width}`,
                        );
                    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow at ${width}`);
                };
                await aligned();
                await setPackaging('sack');
                await page.waitForFunction(() =>
                    [...document.querySelectorAll('label')].some((label) => label.querySelector('span')?.textContent === 'Packages'),
                );
                await fillLabel('Packages', '10');
                await fillLabel('kg per package', '25');
                await aligned();
                assert.equal(await page.$eval('output', (output) => output.textContent.trim()), '250 kg');
                if (scoped) {
                    const fieldset = await page.$('fieldset[aria-label="Item 1"]');
                    await fieldset.screenshot({ path: path.join(root, `storage/app/goods-receiving-aligned-${width}.png`) });
                }
                await clickText('Add line');
                assert.equal(await page.$$eval('fieldset', (rows) => rows.length), 2);
                await page.click('button[aria-label="Remove item 2"]');
                assert.equal(await page.$$eval('fieldset', (rows) => rows.length), 1);
                await setPackaging('');
                await page.waitForFunction(() =>
                    [...document.querySelectorAll('label')].some((label) => label.querySelector('span')?.textContent === 'Quantity (kg)'),
                );
                await fillLabel('Quantity (kg)', '250');
                await aligned();
                await clickText('Batch, expiry and notes');
                await fillLabel('Batch reference', 'RICE-Q4');
                assert.equal(await page.$eval('output', (output) => output.textContent.trim()), '250 kg');
            }
        }
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(
            'PASS: receiving input heights/alignment at desktop/tablet/mobile, direct/package quantities, program/general forms, add/remove lines and optional details.',
        );
    } else if (detailOnly) {
        await go('/stock-receipts/receipt-test');
        if (itemOnly) await page.click('button[aria-label="Adjust this batch"]');
        else await clickText('Post receipt');
        await page.waitForSelector('[role="dialog"]');
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(
            itemOnly
                ? 'PASS: Inventory item desktop/mobile, batches, movements and adjustment dialog.'
                : 'PASS: Receipt detail desktop/mobile, draft/posted/voided states and posting review dialog.',
        );
    } else if (catalogOnly) {
        await go('/settings');
        await clickText('Add source');
        await page.waitForSelector('[role="dialog"]');
        await clickText('Cancel');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        await go('/items');
        await clickText('Add item');
        await page.waitForSelector('[role="dialog"]');
        assert.deepEqual(
            await page.$$eval('[role="dialog"] label', (labels) =>
                [...labels.find((el) => el.textContent.trim().startsWith('Category')).querySelector('select').options].map((el) => el.value),
            ),
            ['', 'food', 'hygiene', 'household_supplies', 'other'],
        );
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log('PASS: Items/settings desktop/tablet/mobile, empty results, setup tabs and creation dialogs.');
    } else if (receiptsOnly) {
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log('PASS: Receipt desktop/tablet/mobile layouts, statuses, empty results and view-only state.');
    } else if (inventoryOnly) {
        await go('/inventory');
        assert.ok(await page.$eval('table', (el) => el.innerText.includes('250') && el.innerText.includes('piece')));
        assert.equal(await page.$eval('main section', (el) => getComputedStyle(el).boxShadow).catch(() => 'none'), 'none');
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log('PASS: Inventory desktop/tablet/mobile, long names, stock units, inactive stock and empty states.');
    } else if (programsOnly) {
        await go('/programs');
        await clickText('Add program');
        await page.waitForSelector('[role="dialog"]');
        await page.screenshot({ path: path.join(root, 'storage/app/goods-programs-dialog-390.png'), fullPage: true });
        await clickText('Cancel');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        await page.click('button[aria-label="Edit AICS Food Commodities"]');
        await page.waitForFunction(() => [...document.querySelectorAll('[role="dialog"] input')].some((el) => el.value === 'AICS Food Commodities'));
        assert.ok(await page.$$eval('[role="dialog"] input', (inputs) => inputs.some((el) => el.value === 'AICS Food Commodities')));
        await clickText('Cancel');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        await page.type('input[aria-label="Search programs"]', 'AICS');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => location.search.includes('search=AICS'));
        await page.waitForFunction(() => document.querySelector('table tbody').children.length === 1);
        await page.click('button[aria-label="Clear search"]');
        await page.waitForFunction(() => document.querySelector('table tbody').children.length === 4);
        await clickText('Inactive');
        await page.waitForFunction(
            () =>
                document.querySelector('table tbody').children.length === 1 &&
                document.querySelector('table').innerText.includes('Disaster Preparedness'),
        );
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(
            'PASS: Programs desktop/tablet/mobile layouts, long names, empty state, view-only actions, add/edit dialogs, search/clear, and status filters.',
        );
    } else {
        await page.setViewport({ width: 1440, height: 1100 });
        await go('/programs/program-a?tab=items');
        await clickText('Add existing item');
        await page.waitForSelector('[role="dialog"]');
        await page.type('[role="dialog"] input[role="combobox"]', 'Food item 104');
        await page.waitForSelector('[role="option"]');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('[role="dialog"]').innerText.includes('globally inactive'));
        assert.equal(
            await page.$$eval(
                '[role="dialog"] button',
                (buttons) => buttons.find((button) => button.textContent.trim() === 'Enable in program').disabled,
            ),
            true,
        );
        await page.click('[role="dialog"] input[type="checkbox"]');
        await clickText('Enable in program');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.ok(programItems.get('item-104').is_active && catalog[104].is_active);
        await page.click('button[aria-label="Disable Commercial Rice in this program"]');
        await page.waitForSelector('button[aria-label="Enable Commercial Rice in this program"]');
        await page.click('button[aria-label="Enable Commercial Rice in this program"]');
        await page.waitForSelector('button[aria-label="Disable Commercial Rice in this program"]');
        assert.equal(programItems.get('item-0').is_active, true);
        await go('/items');
        await page.click('button[aria-label="Deactivate"]');
        await page.waitForSelector('[role="dialog"]');
        assert.ok(await page.$eval('[role="dialog"]', (el) => el.innerText.includes('Changes apply to every connected program')));
        assert.equal(
            await page.$$eval('[role="dialog"] button', (buttons) => buttons.find((button) => button.textContent.trim() === 'Save item').disabled),
            true,
        );
        assert.equal(await page.$eval('[role="dialog"] input[type="checkbox"]', (input) => input.checked), false);
        await clickText('Cancel');
        await go('/programs/program-a/stock-receipts/create');
        await fillLabel('Reference', 'KEEP-THIS-REFERENCE');
        await page.click('input[role="combobox"]');
        await page.type('input[role="combobox"]', 'Commercial Rice');
        await page.waitForSelector('[role="option"]');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        assert.equal(await page.$eval('input[role="combobox"]', (el) => el.value), 'Commercial Rice');
        await page.click('input[role="combobox"]');
        await page.keyboard.down('Control');
        await page.keyboard.press('a');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some((el) => el.textContent.trim() === 'Load more'));
        await clickText('Load more');
        await page.waitForFunction(() => document.querySelectorAll('[role="option"]').length === 40);
        await clickText('Add item');
        await page.waitForSelector('[role="dialog"]');
        await fillLabel('Item name', 'New Rice Variant');
        await fillLabel('Code', 'NEW-RICE');
        await page.evaluate(() => {
            const select = [...document.querySelectorAll('[role="dialog"] label')]
                .find((el) => el.textContent.trim().startsWith('Category'))
                .querySelector('select');
            select.value = 'food';
            select.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await clickText('Check existing items');
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some((el) => el.textContent.trim() === 'Create item'));
        await clickText('Create item');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.equal(await page.$eval('input[role="combobox"]', (el) => el.value), 'New Rice Variant');
        assert.ok(await page.evaluate(() => [...document.querySelectorAll('input')].some((el) => el.value === 'KEEP-THIS-REFERENCE')));
        await page.evaluate(() => {
            for (const [labelText, value] of [
                ['Source / Donor', 'source'],
                ['Storage location', 'storage'],
                ['Packaging', 'sack'],
            ]) {
                const label = [...document.querySelectorAll('label')].find((el) => el.querySelector('span')?.textContent === labelText);
                const select = label.querySelector('select');
                select.value = value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        await fillLabel('Packages', '10');
        await fillLabel('kg per package', '25');
        await page.waitForFunction(() => document.body.innerText.includes('250 kg'));
        await clickText('Save draft');
        await page.waitForFunction(() => document.body.innerText.includes('Fixture validation: review reference.'));
        const draft = requests.find((req) => req.url.endsWith('/program-a/stock-receipts'));
        assert.equal(draft.body.lines[0].program_id, 'program-a');
        assert.equal(draft.body.lines[0].quantity, '250.000');
        assert.ok(requests.some((req) => req.url.endsWith('/items/check')));
        assert.equal(requests.find((req) => req.url.endsWith('/items/create')).body.category, 'food');
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(
            'PASS: desktop/mobile layouts, 105-item pagination, keyboard selection, inline creation, preserved receipt values, 10 x 25 kg packaging, scoped save, validation display, municipality headers.',
        );
    }
    }
} catch (error) {
    console.error(JSON.stringify({ errors, requests, text: await activePage?.evaluate(() => document.body.innerText) }, null, 2));
    throw error;
} finally {
    await closeGoodsFixture(browser, server);
}
