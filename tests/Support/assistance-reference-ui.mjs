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

const root = process.cwd();
const output = path.join(tmpdir(), 'codex-assistance-reference-ui');
await mkdir(output, { recursive: true });
const entry = `import React,{useEffect,useState}from'react';import{createRoot}from'react-dom/client';
import Dialog from '@/pages/ActionCenter/Admin/RequestDetails/Components/PrepareDisbursementDialog';
import Card from '@/pages/ActionCenter/Admin/RequestList/Components/AssistanceRequestRegistryItem';import '@/../css/app.css';
function App(){const[open,setOpen]=useState(false);const[revision,setRevision]=useState(0);useEffect(()=>{const refresh=()=>setRevision(v=>v+1);window.addEventListener('fixture-refresh',refresh);return()=>window.removeEventListener('fixture-refresh',refresh)},[]);
return <main style={{padding:16,maxWidth:1000,margin:'auto'}}><button onClick={()=>setOpen(true)}>Prepare</button>
<Card viewUrl='/request' row={{id:'other',transaction_number:'REQ-OTHER',status:'approved',filed_for_self:true,subject_full_name:'Historical Payee',mswd_verification_status:'verified',is_walkin:true,submitted_at:'2026-11-01',snapshot_barangay:'Dili',matching_payment_references:[{id:'payment',method:'check',reference:'000012-VERY-LONG-REFERENCE-'.repeat(3),status:'released'}]}}/>
<Dialog open={open} onClose={()=>setOpen(false)} requestId='current' amount={1500} claimantName='Current Payee' existing={null} locations={[{key:'treasury',label:'Treasury '+revision}]}/></main>};createRoot(document.getElementById('app')).render(<App/>);`;
const transport = `import{useState,useCallback}from'react';const props={currentMunicipality:{slug:'gasan-4905'}};
export const usePage=()=>({props});export const Link=({children,...props})=>React.createElement('a',props,children);
export function useForm(initial){const[data,set]=useState(initial);const[errors,setErrors]=useState({});const setData=useCallback((key,value)=>set(old=>typeof key==='object'?key:({...old,[key]:value})),[]);const clearErrors=useCallback(()=>setErrors({}),[]);return{data,setData,errors,clearErrors,processing:false,reset:()=>set(initial),post:(url,options)=>{window.__submission={url,data,headers:options.headers};setErrors({disbursement:'That check or cash-voucher reference is already recorded.'});window.dispatchEvent(new Event('fixture-refresh'));options.onError?.();}}}`;
await build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [
        react(),
        tailwind(),
        {
            name: 'reference-fixture',
            resolveId(id) {
                if (id === 'reference-entry') return '\0reference-entry';
            },
            load(id) {
                if (id === '\0reference-entry') return { code: entry, map: null };
                if (id === '\0reference-transport') return `import React from 'react';${transport}`;
            },
            transform(code, id) {
                if (id === '\0reference-entry')
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
            { find: '@inertiajs/react', replacement: '\0reference-transport' },
            { find: '@', replacement: path.join(root, 'resources/js') },
        ],
    },
    build: { outDir: output, emptyOutDir: false, rollupOptions: { input: 'reference-entry', output: { entryFileNames: 'entry.js' } } },
});
const css = (await readdir(path.join(output, 'assets'))).filter((file) => file.endsWith('.css'));
const lookups = [];
let raceLookups = 0;
const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.includes('/reference-matches')) {
        const reference = url.searchParams.get('reference');
        const method = url.searchParams.get('method');
        lookups.push({ reference, method, slug: req.headers['x-municipality-slug'] });
        if (reference === 'SLOW') await new Promise((resolve) => setTimeout(resolve, 900));
        if (reference === 'FAIL') {
            res.writeHead(503);
            res.end();
            return;
        }
        const noMatch = reference === 'NONE' || method === 'cash' || (reference === 'RACE' && raceLookups++ === 0);
        const page = Number(url.searchParams.get('page') || 1);
        const data = noMatch
            ? []
            : [
                  {
                      id: 'match-' + page,
                      request_id: 'other',
                      transaction_number: 'REQ-OTHER-' + page,
                      payee_name: 'Historical Payee With A Long Recorded Name',
                      amount: '1500.00',
                      method,
                      reference,
                      instrument_date: '2026-11-01',
                      status: reference === 'VOID' ? 'voided' : 'released',
                      blocking: reference !== 'VOID',
                  },
              ];
        res.setHeader('Content-Type', 'application/json');
        res.end(
            JSON.stringify({
                data,
                blocking: data.length > 0 && reference !== 'VOID',
                meta: { current_page: page, last_page: reference === 'MANY' ? 2 : 1, total: noMatch ? 0 : reference === 'MANY' ? 11 : 1 },
            }),
        );
        return;
    }
    if (url.pathname === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.end(
            `<html><head><meta name='viewport' content='width=device-width,initial-scale=1'>${css.map((file) => `<link rel='stylesheet' href='/assets/${file}'>`).join('')}</head><body><div id='app'></div><script type='module' src='/entry.js'></script></body></html>`,
        );
        return;
    }
    const file = path.resolve(output, '.' + url.pathname);
    if (!file.startsWith(output + path.sep)) {
        res.writeHead(404);
        res.end();
        return;
    }
    try {
        res.setHeader(
            'Content-Type',
            url.pathname.endsWith('.js') ? 'application/javascript' : url.pathname.endsWith('.css') ? 'text/css' : 'application/octet-stream',
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
    executablePath: process.env.REFERENCE_UI_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
const errors = [];
try {
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(String(error)));
    const setReference = async (value) => {
        await page.$eval('#instrument_reference_number', (input) => input.focus());
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.type('#instrument_reference_number', value);
    };
    for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewport({ width, height: 1000 });
        await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'networkidle0' });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        await page.click('main > button');
        await page.waitForSelector('#instrument_reference_number');
        await setReference('000012-VERY-LONG-REFERENCE-'.repeat(3));
        await page.waitForSelector('section[aria-label="Matching payment references"]');
        assert.equal(await page.$eval('[role="dialog"]', (dialog) => dialog.scrollWidth > dialog.clientWidth + 1), false);
        assert.equal(await page.$eval('section a', (link) => link.target), '_blank');
        assert.ok((await page.$eval('section a', (link) => link.href)).includes('/profile/assistance-request/other'));
        await page.screenshot({ path: path.join(output, `dialog-${width}.png`), fullPage: true });
    }
    await setReference('VOID');
    await page.waitForFunction(() => document.body.textContent.includes('Voided reference history'));
    await setReference('FAIL');
    await page.waitForFunction(() => document.body.textContent.includes('Reference check unavailable'));
    const beforeRetry = lookups.length;
    await page.evaluate(() =>
        Array.from(document.querySelectorAll('button'))
            .find((button) => button.textContent.includes('Retry'))
            .click(),
    );
    await page.waitForFunction(() => document.body.textContent.includes('Reference check unavailable'));
    assert.ok(lookups.length > beforeRetry);
    await setReference('SLOW');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await setReference('NONE');
    await page.waitForFunction(() => document.body.textContent.includes('No other recorded reference'));
    await new Promise((resolve) => setTimeout(resolve, 1000));
    assert.equal(await page.$('section[aria-label="Matching payment references"]'), null);
    await setReference('MANY');
    await page.waitForSelector('button[aria-label="Next matches"]');
    await page.click('button[aria-label="Next matches"]');
    await page.waitForFunction(() => document.body.textContent.includes('REQ-OTHER-2'));
    await page.click('[role="combobox"]');
    await page.waitForSelector('[role="option"]');
    await page.evaluate(() =>
        Array.from(document.querySelectorAll('[role="option"]'))
            .find((option) => option.textContent === 'Cash')
            .click(),
    );
    await page.waitForFunction(() => document.body.textContent.includes('No other recorded reference'));
    await page.click('[role="combobox"]');
    await page.waitForSelector('[role="option"]');
    await page.evaluate(() =>
        Array.from(document.querySelectorAll('[role="option"]'))
            .find((option) => option.textContent === 'Check')
            .click(),
    );
    await page.waitForFunction(() => document.body.textContent.includes('REQ-OTHER-1'));
    await setReference('RACE');
    await page.waitForFunction(() => document.body.textContent.includes('No other recorded reference'));
    await page.type('#disbursement_notes', 'Keep these unsaved notes');
    await page.click('button[type="submit"]');
    await page.waitForFunction(() => document.body.textContent.includes('Reference already recorded'));
    assert.equal(await page.$eval('#instrument_reference_number', (input) => input.value), 'RACE');
    assert.equal(await page.$eval('#disbursement_notes', (input) => input.value), 'Keep these unsaved notes');
    assert.equal(await page.evaluate(() => window.__submission.headers['X-Municipality-Slug']), 'gasan-4905');
    assert.ok(lookups.every((lookup) => lookup.slug === 'gasan-4905'));
    assert.ok(lookups.some((lookup) => lookup.method === 'cash'));
    assert.deepEqual(errors, []);
    console.log(
        'PASS: responsive dialog/cards, matching links, voided history, failure/retry, stale responses, pagination, and save-conflict form preservation.',
    );
} finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
}
