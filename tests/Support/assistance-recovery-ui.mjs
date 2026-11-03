import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import assert from 'node:assert/strict';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer';
import { build } from 'vite';

// Isolated production component build with a synthetic Inertia transport, not application data.
const root = process.cwd();
const output = path.join(tmpdir(), 'codex-assistance-recovery-ui');
await mkdir(output, { recursive: true });
const entry = `import React,{useState} from 'react';import{createRoot}from'react-dom/client';
import Dialog from '@/components/ActionCenter/ReopenCancelledRequestDialog';
import History from '@/components/ActionCenter/AssistanceRecoveryHistory';import '@/../css/app.css';
function App(){const[open,setOpen]=useState(false);return <main style={{padding:16,maxWidth:1000,margin:'auto'}}>
<button onClick={()=>setOpen(true)}>Reopen for Review</button><History events={[{approved_amount:'5000.00',approved_at:'2026-11-01T08:00:00Z',cancelled_at:'2026-11-02T08:00:00Z',reopened_at:'2026-11-03T08:00:00Z',reopened_by_name:'Authorized Supervisor',reason:'Recovered an incorrectly cancelled amount.'}]}/>
<Dialog id="request-test" slug="gasan-4905" token={'a'.repeat(64)} blocker={location.search.includes('blocked')?'Resolve the existing open request REQ-REPLACEMENT before reopening this request.':null} amount={5000} cancelledAt="2026-11-02T08:00:00Z" open={open} onClose={()=>setOpen(false)}/></main>};createRoot(document.getElementById('app')).render(<App/>);`;
const transport = `import{useState}from'react';export function useForm(initial){const[data,set]=useState(initial);const[errors,setErrors]=useState({});return{data,errors,processing:false,setData:(key,value)=>set(old=>({...old,[key]:value})),post:(url,options)=>{window.__submission={url,data,headers:options.headers};setErrors({reopen_cancelled:'Fixture validation: cancellation changed. Refresh and review again.'});}}}`;
await build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [
        react(),
        tailwind(),
        {
            name: 'recovery-fixture',
            resolveId(id) {
                if (id === 'recovery-entry') return '\0recovery-entry';
                if (id === '@inertiajs/react') return '\0recovery-transport';
            },
            load(id) {
                if (id === '\0recovery-entry') return { code: entry, map: null };
                if (id === '\0recovery-transport') return transport;
            },
            transform(code, id) {
                if (id === '\0recovery-entry')
                    return import('typescript').then(
                        ({ default: ts }) =>
                            ts.transpileModule(code, {
                                compilerOptions: { jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
                            }).outputText,
                    );
            },
        },
    ],
    resolve: {
        alias: [
            { find: '@inertiajs/react', replacement: '\0recovery-transport' },
            { find: '@', replacement: path.join(root, 'resources/js') },
        ],
    },
    build: { outDir: output, emptyOutDir: false, rollupOptions: { input: 'recovery-entry', output: { entryFileNames: 'entry.js' } } },
});
const css = (await readdir(path.join(output, 'assets'))).filter((file) => file.endsWith('.css'));
const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.end(
            `<html><head><meta name="viewport" content="width=device-width,initial-scale=1">${css.map((file) => `<link rel="stylesheet" href="/assets/${file}">`).join('')}</head><body><div id="app"></div><script type="module" src="/entry.js"></script></body></html>`,
        );
        return;
    }
    const file = path.resolve(output, '.' + pathname);
    if (!file.startsWith(output + path.sep)) {
        res.writeHead(404);
        res.end();
        return;
    }
    try {
        res.setHeader(
            'Content-Type',
            pathname.endsWith('.js') ? 'application/javascript' : pathname.endsWith('.css') ? 'text/css' : 'application/octet-stream',
        );
        res.end(await readFile(file));
    } catch {
        res.writeHead(404);
        res.end();
    }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.RECOVERY_UI_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const errors = [];
try {
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(String(error)));
    for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewport({ width, height: 900 });
        await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle0' });
        await page.click('main > button');
        await page.waitForFunction(
            () => document.querySelector('[role="dialog"]') && getComputedStyle(document.querySelector('[role="dialog"]')).opacity === '1',
        );
        assert.equal(await page.$eval('form button:not([type="button"])', (button) => button.disabled), true);
        await page.type('#reopen-reason', 'Recover the mistakenly cancelled amount.');
        for (const checkbox of await page.$$('form input[type="checkbox"]')) await checkbox.click();
        assert.equal(await page.$eval('form button:not([type="button"])', (button) => button.disabled), false);
        assert.equal(await page.$eval('[role="dialog"]', (dialog) => dialog.scrollWidth > dialog.clientWidth + 1), false);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        await page.screenshot({ path: path.join(output, `dialog-${width}.png`) });
        await page.click('form button:not([type="button"])');
        assert.deepEqual(errors, []);
        assert.ok(
            await page.evaluate(() => !!window.__submission),
            JSON.stringify(
                await page.evaluate(() => ({
                    valid: document.querySelector('form').checkValidity(),
                    reason: document.querySelector('textarea').value,
                    html: document.querySelector('form').innerHTML,
                })),
            ),
        );
        await page.waitForSelector('[role="alert"]');
        const submitted = await page.evaluate(() => window.__submission);
        assert.equal(submitted.headers['X-Municipality-Slug'], 'gasan-4905');
        assert.equal(submitted.data.context_token.length, 64);
        assert.equal(submitted.data.confirm_not_released, true);
        assert.equal(submitted.data.confirm_papers_invalid, true);
        assert.ok(submitted.url.endsWith('/request-test/reopen-cancelled'));
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/?blocked=1`, { waitUntil: 'networkidle0' });
    await page.click('main > button');
    assert.ok((await page.$eval('[role="alert"]', (node) => node.textContent)).includes('REQ-REPLACEMENT'));
    assert.equal(await page.$eval('form button:not([type="button"])', (button) => button.disabled), true);
    assert.deepEqual(errors, []);
    console.log(
        'PASS: recovery dialog/history at 320/390/768/1024/1440px, confirmations, blockers, validation errors, and municipality-scoped payload.',
    );
} finally {
    await browser.close();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
}
