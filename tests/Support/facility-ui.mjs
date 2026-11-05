import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { Readable } from 'node:stream';
import puppeteer from 'puppeteer';

// Render production assets against an isolated Inertia fixture. No application database is accessed.
const root = process.cwd();
const manifest = JSON.parse(await readFile(path.join(root, 'public/build/manifest.json'), 'utf8'));
const entry = manifest['resources/js/app.tsx'];
const slug = 'gasan-4905';
const id = '01m6jtpn7avv4t5zetbhbsae1w';
const adminPath = `/${slug}/admin/facility/${id}/edit`;
const publicPath = `/${slug}/facility/${id}`;
const types = [{ value: 'park', label: 'Park' }, { value: 'amusement_ride', label: 'Amusement ride' }];
const statuses = [
    { value: 'following_schedule', label: 'Following schedule' }, { value: 'delayed', label: 'Delayed' },
    { value: 'temporarily_closed', label: 'Temporarily closed' }, { value: 'permanently_closed', label: 'Permanently closed' },
];
const noticeTypes = [{ value: 'closed', label: 'Closed' }, { value: 'special_hours', label: 'Special hours' }, { value: 'cancelled', label: 'Cancelled' }, { value: 'delayed', label: 'Confirmed later opening' }];
const normalAvailability = () => ({ timezone: 'Asia/Manila', date: '2026-11-02', computed_at: '2026-11-02T10:00:00+08:00', next_refresh_at: '2026-11-02T10:01:00+08:00',
    is_open: true, status: 'open', label: 'Open now', closes_at: '2026-11-02T12:00:00+08:00', next_opens_at: null, expected_reopens_at: null,
    today_periods: [{ opening_minute: 480, closing_minute: 720 }, { opening_minute: 780, closing_minute: 1020 }], notice: null, notice_type: null });
const facility = { id, name: 'Children’s Train Ride', type: types[1], location_name: 'Municipal Plaza', address: 'Gasan, Marinduque',
    description: 'A train ride for children with its own operating schedule.', contact_name: 'Municipal Office', contact_phone: '09123456789', contact_email: 'office@example.test',
    image_url: null, is_published: true, revision: 1, operating_status: 'following_schedule', operating_notice: null, expected_reopens_at_input: null,
    weekly_days: Array.from({ length: 7 }, (_, i) => ({ day_of_week: i + 1, is_closed: i !== 0, periods: i === 0 ? normalAvailability().today_periods : [] })),
    exceptions: [], audit_log: [], availability: normalAvailability() };
const errors = [];
const requests = [];
let origin;
function pageFor(url) {
    const admin = url.pathname.includes('/admin/');
    const list = url.pathname.endsWith('/facility');
    return { component: list ? `Facility/${admin ? 'Admin' : 'Client'}/Index` : admin ? 'Facility/Admin/Form' : 'Facility/Client/Show',
        url: url.pathname + url.search, version: 'fixture', clearHistory: false, encryptHistory: false,
        props: { currentMunicipality: { id: 'test-town', name: 'Gasan', slug, zip_code: '4905', settings: null },
            seo: { site_url: origin, default_image: '/assets/gasan-poster-banner.png' }, app_name: 'Municipal Portal', flash: {}, errors: {},
            auth: { user: admin ? { id: 'test-staff', first_name: 'Test', last_name: 'Staff', municipality: { slug } } : null,
                roles: { isAdmin: admin, isClient: false, isSuperAdmin: false }, permissions: admin ? ['facility.access', 'facility.view', 'facility.manage', 'facility.publish', 'facility.delete'] : [] },
            types, statuses, notice_types: noticeTypes, address_barangays: [{ id: '1', name: 'Pinggan' }], filters: {}, facility: structuredClone(facility),
            facilities: { data: [structuredClone(facility)], meta: { links: [] } },
        } };
}
const server = createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/build/')) {
            const file = path.resolve(root, 'public', '.' + url.pathname);
            assert.ok(file.startsWith(path.resolve(root, 'public/build') + path.sep));
            res.setHeader('Content-Type', file.endsWith('.js') ? 'application/javascript' : file.endsWith('.css') ? 'text/css' : 'application/octet-stream');
            return res.end(await readFile(file));
        }
        if (url.pathname.startsWith('/api/facility')) {
            assert.equal(req.headers['x-municipality-slug'], slug);
            const request = new Request(origin + url.pathname, { method: req.method, headers: req.headers, body: Readable.toWeb(req), duplex: 'half' });
            const body = request.headers.get('content-type')?.includes('application/json') ? await request.json() : Object.fromEntries(await request.formData());
            assert.equal(body.municipal_id, undefined);
            assert.equal(Number(body.revision), facility.revision);
            requests.push({ path: url.pathname, body });
            facility.revision++;
            if (body._method === 'put') {
                facility.location_name = body.location_name;
                facility.address = Object.keys(body).some(key => key.startsWith('address_parts['))
                    ? ['street', 'barangay'].map(key => (body[`address_parts[${key}]`] || '').trim()).filter(Boolean).join(', ')
                    : body.address;
            }
            if (url.pathname.endsWith('/weekly-hours')) facility.weekly_days = body.days;
            if (url.pathname.endsWith('/operating-status')) {
                facility.operating_status = body.operating_status;
                facility.operating_notice = body.operating_notice;
                facility.availability = body.operating_status === 'following_schedule' ? normalAvailability() : { ...normalAvailability(), is_open: false, status: body.operating_status,
                    label: statuses.find(status => status.value === body.operating_status).label, closes_at: null, notice: body.operating_notice };
            }
            if (url.pathname.endsWith('/exceptions')) facility.exceptions.push({ ...body, id: 'exception-test' });
            res.writeHead(303, { Location: adminPath });
            return res.end();
        }
        if (!url.pathname.startsWith(`/${slug}/`)) { res.writeHead(204); return res.end(); }
        const page = pageFor(url);
        if (req.headers['x-inertia']) {
            res.writeHead(200, { 'Content-Type': 'application/json', 'X-Inertia': 'true' });
            return res.end(JSON.stringify(page));
        }
        const data = JSON.stringify(page).replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
        res.setHeader('Content-Type', 'text/html');
        res.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">${(entry.css || []).map(file => `<link rel="stylesheet" href="/build/${file}">`).join('')}</head><body><div id="app" data-page='${data}'></div><script type="module" src="/build/${entry.file}"></script></body></html>`);
    } catch (error) { errors.push(String(error)); res.writeHead(500); res.end(String(error)); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
origin = `http://127.0.0.1:${server.address().port}`;
if (process.argv.includes('--serve-only')) {
    console.log(JSON.stringify({ origin, admin: adminPath, public: publicPath }));
    await new Promise(() => {});
}
let browser;
try {
    browser = await puppeteer.launch({ headless: true, ...(process.env.FACILITY_UI_BROWSER ? { executablePath: process.env.FACILITY_UI_BROWSER } : {}) });
    const page = await browser.newPage();
    await page.emulateTimezone('America/New_York');
    page.on('pageerror', error => errors.push(String(error)));
    const go = async suffix => { await page.goto(origin + suffix, { waitUntil: 'networkidle0' }); await page.waitForSelector('main'); };
    const click = async text => {
        const clicked = await page.evaluate(text => { const button = [...document.querySelectorAll('main button')].find(node => node.textContent.trim() === text); button?.click(); return !!button; }, text);
        assert.ok(clicked, 'Missing button: ' + text);
        await page.waitForNetworkIdle({ idleTime: 300 });
    };
    await page.setViewport({ width: 1440, height: 960 });
    await go(adminPath);
    await click('Save details');
    assert.equal(requests.at(-1).body.address, 'Gasan, Marinduque');
    await click('Change address');
    await click('Cancel address change');
    await click('Save details');
    assert.equal(requests.at(-1).body.address, 'Gasan, Marinduque');
    await click('Change address');
    const pickAddress = async (selector, name) => {
        await page.click(selector);
        await page.waitForSelector('[role="option"]');
        const options = await page.$$('[role="option"]');
        for (const option of options) {
            if ((await option.evaluate(node => node.textContent)).trim() === name) {
                await option.click();
                await page.waitForNetworkIdle({ idleTime: 300 });
                return;
            }
        }
        assert.fail('Address choice missing: ' + name);
    };
    assert.equal(await page.$('#facility-address-province'), null);
    assert.equal(await page.$('#facility-address-municipality'), null);
    await pickAddress('#facility-address-barangay', 'Pinggan');
    await page.type('#facility-address-line', 'Beside the entrance');
    await click('Save details');
    assert.equal(requests.at(-1).body['address_parts[municipality]'], undefined);
    assert.equal(requests.at(-1).body['address_parts[province]'], undefined);
    assert.equal(requests.at(-1).body['address_parts[barangay]'], 'Pinggan');
    assert.equal(requests.at(-1).body.location_name, 'Municipal Plaza');
    assert.equal(facility.address, 'Beside the entrance, Pinggan');
    assert.equal(requests.at(-1).body.address_barangay, undefined);
    await click('Save weekly hours');
    assert.equal(requests.at(-1).body.days.length, 7);
    assert.equal(requests.at(-1).body.days[0].periods.length, 2);
    const statusSection = (await page.evaluateHandle(() => [...document.querySelectorAll('main section')].find(section => section.querySelector('h2')?.textContent === 'Operating status'))).asElement();
    const select = await statusSection.$('select');
    await select.select('delayed');
    const notice = await statusSection.$('textarea');
    await notice.type('The train is awaiting repairs.');
    await click('Save operating status');
    assert.equal(requests.at(-1).body.operating_status, 'delayed');
    assert.equal(requests.at(-1).body.today_exception, null);
    const output = path.join(root, 'tmp/facility-ui');
    await mkdir(output, { recursive: true });
    for (const width of [390, 768, 1440]) {
        await page.setViewport({ width, height: 900 });
        for (const [name, url] of [['admin-list', `/${slug}/admin/facility`], ['admin-form', adminPath], ['public-list', `/${slug}/facility`], ['public-show', publicPath]]) {
            await go(url);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${name} overflows at ${width}px`);
            if (name.startsWith('public')) assert.ok((await page.$eval('main', node => node.textContent)).includes('awaiting repairs'));
            if (name === 'public-show') assert.ok((await page.$eval('main', node => node.textContent)).includes('Beside the entrance, Pinggan'));
            if (width === 390 || width === 1440) await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
        }
    }
    assert.deepEqual(errors, []);
    console.log('PASS: facility forms send slug headers and revisions without municipal_id; public/admin pages render at 390/768/1440px in a non-Manila browser timezone.');
} finally {
    server.closeAllConnections();
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
}
