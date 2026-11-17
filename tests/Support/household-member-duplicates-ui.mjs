import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import puppeteer from 'puppeteer';
import { build } from 'vite';

const root = process.cwd();
const output = path.join(tmpdir(), 'codex-household-duplicate-ui');
await mkdir(output, { recursive: true });
const entry = `import React,{useState}from'react';import{createRoot}from'react-dom/client';
import Dialog from '@/pages/ActionCenter/Admin/Beneficiary/Profile/Components/MemberFormDialog';
import {OnBehalfOfSection}from '@/pages/ActionCenter/Client/Apply/Components/OnBehalfOfSection';
import Legacy from '@/pages/ActionCenter/Admin/Beneficiary/Components/MemberFormDialog';import '@/../css/app.css';
function App(){const[open,setOpen]=useState(false);const props={open,onClose:()=>setOpen(false),mode:'add',storeUrl:'/api/action-center/households/current/members',beneficiaryId:'filer',religions:[],civilStatus:[],educationalAttainment:[],relationships:[{value:'sibling',label:'Sibling'}]};return <main style={{padding:16}}>{location.search.includes('inline')?<OnBehalfOfSection audience={location.search.includes('citizen')?'citizen':'admin'} data={{household_member_id:'',first_name:'',middle_name:'',last_name:'',suffix:'',date_of_death:'',relationship:''}} onChange={()=>{}} relationships={props.relationships} householdRelationshipOptions={props.relationships} filerBeneficiaryId='filer' isDeceasedRequest={false} requiresDateOfDeath={false} applicantBirthDate='1990-01-01' householdMembers={[]} storeHouseholdMemberUrl={props.storeUrl} municipalitySlug='gasan-4905' onMemberCreated={member=>{window.__inlineCreated=member}}/>:<><button onClick={()=>setOpen(true)}>Add member</button>{location.search.includes('legacy')?<Legacy {...props}/>:<Dialog {...props}/>}</>}</main>};createRoot(document.getElementById('app')).render(<App/>);`;
const transport = `import{useState,useCallback,useRef}from'react';const props={currentMunicipality:{slug:'gasan-4905'},auth:{permissions:['action_center.beneficiaries.view']}};export const usePage=()=>({props});export function useForm(initial){const[data,set]=useState(initial);const[errors,setErrors]=useState({});const transformRef=useRef(v=>v);const setData=useCallback((key,value)=>set(old=>typeof key==='object'?key:({...old,[key]:value})),[]);const clearErrors=useCallback(()=>setErrors({}),[]);return{data,setData,errors,clearErrors,processing:false,reset:()=>set(initial),transform:fn=>{transformRef.current=fn},post:(url,options)=>{window.__submission={url,data:transformRef.current(data),headers:options.headers};setErrors({member:'The household match results changed. Check again.'});options.onError?.();}}}`;
await build({
    configFile: false,
    root,
    logLevel: 'warn',
    plugins: [
        react(),
        tailwind(),
        {
            name: 'household-fixture',
            resolveId(id) {
                if (id === 'household-entry') return '\0household-entry';
            },
            load(id) {
                if (id === '\0household-entry') return { code: entry, map: null };
                if (id === '\0household-transport') return transport;
            },
            transform(code, id) {
                if (id === '\0household-entry')
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
            { find: '@inertiajs/react', replacement: '\0household-transport' },
            { find: '@', replacement: path.join(root, 'resources/js') },
        ],
    },
    build: { outDir: output, emptyOutDir: false, rollupOptions: { input: 'household-entry', output: { entryFileNames: 'entry.js' } } },
});
const css = (await readdir(path.join(output, 'assets'))).filter((file) => file.endsWith('.css'));
const calls = [];
const inlineSubmissions = [];
const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.endsWith('/members')) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const data = JSON.parse(Buffer.concat(chunks).toString());
        inlineSubmissions.push(data);
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(201);
        res.end(JSON.stringify({ data: { ...data, id: 'created' } }));
        return;
    }
    if (url.pathname.endsWith('/members/check')) {
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const identity = JSON.parse(Buffer.concat(chunks).toString());
        calls.push({ identity, slug: req.headers['x-municipality-slug'], csrf: req.headers['x-csrf-token'] });
        if (identity.first_name === 'SLOW') await new Promise((resolve) => setTimeout(resolve, 900));
        if (identity.first_name === 'ERROR') {
            res.writeHead(503);
            res.end();
            return;
        }
        const candidates =
            identity.first_name === 'NONE'
                ? []
                : [
                      {
                          key: 'member:existing',
                          full_name: 'PEDRO SANTOS CRUZ',
                          birth_date: null,
                          household_id: 'other',
                          household_code: 'HH-OTHER-LONG-CODE-12345678901234567890',
                          head_name: 'A Household Head With A Long Registered Name',
                          barangay: 'Dili',
                          membership_status: 'Active household member',
                      },
                  ];
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ candidates, context: 'context-' + calls.length }));
        return;
    }
    if (url.pathname === '/') {
        res.setHeader('Content-Type', 'text/html');
        res.end(
            `<html><head><meta name='viewport' content='width=device-width,initial-scale=1'><meta name='csrf-token' content='test-csrf'>${css.map((file) => `<link rel='stylesheet' href='/assets/${file}'>`).join('')}</head><body><div id='app'></div><script type='module' src='/entry.js'></script></body></html>`,
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
    executablePath: process.env.HOUSEHOLD_UI_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
});
try {
    const errors = [];
    const page = await browser.newPage();
    page.on('pageerror', (error) => errors.push(String(error)));
    const setFirst = async (text) => {
        await page.focus('#m_first_name');
        await page.keyboard.down('Control');
        await page.keyboard.press('A');
        await page.keyboard.up('Control');
        await page.keyboard.press('Backspace');
        await page.type('#m_first_name', text);
    };
    for (const mode of ['modern', 'legacy']) {
        for (const width of [320, 390, 768, 1024, 1440]) {
            await page.setViewport({ width, height: 1000 });
            await page.goto(`http://127.0.0.1:${server.address().port}/?${mode}`, { waitUntil: 'networkidle0' });
            await page.click('main > button');
            await page.waitForSelector('#m_first_name');
            await page.type('#m_first_name', 'Pedro');
            await page.type('#m_last_name', 'Cruz');
            await page.click('#m_relationship');
            await page.waitForSelector('[role="option"]');
            await page.click('[role="option"]');
            await page.waitForSelector('section[aria-label="Possible existing household members"]');
            assert.equal(await page.$eval('button[type="submit"]', (button) => button.disabled), true);
            assert.equal(await page.$eval('section a', (link) => link.target), '_blank');
            assert.equal(await page.$eval('[role="dialog"]', (dialog) => dialog.scrollWidth > dialog.clientWidth + 1), false);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
            await page.evaluate(() =>
                Array.from(document.querySelectorAll('section button'))
                    .find((b) => b.textContent.includes('Different person'))
                    .click(),
            );
            await page.type('#different-person-reason', 'Interview confirms a different person.');
            assert.equal(await page.$eval('button[type="submit"]', (button) => button.disabled), false);
            await page.$eval('section', (section) => section.scrollIntoView({ block: 'center' }));
            await page.screenshot({ path: path.join(output, `${mode}-${width}.png`), fullPage: true });
        }
        const before = calls.length;
        await page.type('#m_occupation', 'FARMER');
        await new Promise((resolve) => setTimeout(resolve, 700));
        assert.equal(calls.length, before, 'Nonidentity edits must not repeat the registry lookup');
        await page.click('button[type="submit"]');
        await page.waitForFunction(() => !!window.__submission);
        const submission = await page.evaluate(() => window.__submission);
        assert.equal(submission.data.confirm_different_person, true);
        assert.ok(submission.data.duplicate_review_context.startsWith('context-'));
        assert.equal(submission.data.different_person_reason, 'Interview confirms a different person.');
        assert.equal(await page.$eval('#m_first_name', (input) => input.value), 'Pedro');
        await page.waitForSelector('section[aria-label="Possible existing household members"]');
        await setFirst('SLOW');
        await new Promise((resolve) => setTimeout(resolve, 600));
        await setFirst('NONE');
        await page.waitForFunction(() => document.body.textContent.includes('No possible existing member found.'));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        assert.equal(await page.$('section[aria-label="Possible existing household members"]'), null);
        await setFirst('ERROR');
        await page.waitForFunction(() => document.body.textContent.includes('Match check unavailable'));
        const beforeRetry = calls.length;
        await page.evaluate(() =>
            Array.from(document.querySelectorAll('button'))
                .find((b) => b.textContent.includes('Retry'))
                .click(),
        );
        await page.waitForFunction(() => document.body.textContent.includes('Match check unavailable'));
        assert.ok(calls.length > beforeRetry);
    }
    for (const width of [320, 768, 1440]) {
        await page.setViewport({ width, height: 1000 });
        await page.goto(`http://127.0.0.1:${server.address().port}/?inline`, { waitUntil: 'networkidle0' });
        await page.evaluate(() =>
            Array.from(document.querySelectorAll('button'))
                .find((b) => b.textContent.includes('Add a household member'))
                .click(),
        );
        await page.type('input[placeholder="e.g. Jose"]', 'Pedro');
        await page.type('input[placeholder="e.g. Dela Cruz"]', 'Cruz');
        await page.evaluate(() =>
            Array.from(document.querySelectorAll('button'))
                .find((b) => b.textContent.includes('Sibling'))
                .click(),
        );
        await page.waitForSelector('section[aria-label="Possible existing household members"]');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
        await page.evaluate(() =>
            Array.from(document.querySelectorAll('section button'))
                .find((b) => b.textContent.includes('Different person'))
                .click(),
        );
        await page.type('#different-person-reason', 'Interview confirmed a different person.');
        await page.screenshot({ path: path.join(output, `inline-${width}.png`), fullPage: true });
        await page.evaluate(() =>
            Array.from(document.querySelectorAll('button'))
                .find((b) => b.textContent.includes('Save Family Member'))
                .click(),
        );
        await page.waitForFunction(() => window.__inlineCreated?.id === 'created');
        assert.equal(inlineSubmissions.at(-1).confirm_different_person, true);
    }
    await page.goto(`http://127.0.0.1:${server.address().port}/?inline-citizen`, { waitUntil: 'networkidle0' });
    const beforeCitizen = calls.length;
    await page.evaluate(() =>
        Array.from(document.querySelectorAll('button'))
            .find((b) => b.textContent.includes('Add a household member'))
            .click(),
    );
    await page.type('input[placeholder="e.g. Jose"]', 'Pedro');
    await page.type('input[placeholder="e.g. Dela Cruz"]', 'Cruz');
    await new Promise((resolve) => setTimeout(resolve, 800));
    assert.equal(calls.length, beforeCitizen, 'Citizens must never fetch another household context');
    assert.equal(await page.$('section[aria-label="Possible existing household members"]'), null);
    assert.ok(calls.every((call) => call.slug === 'gasan-4905' && call.csrf === 'test-csrf'));
    assert.deepEqual(errors, []);
    console.log(
        'PASS: both admin dialogs at phone/tablet/desktop widths; reviewed reason, new-tab navigation, payload, retained input, stale responses, retries, and nonidentity edits.',
    );
} finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
}
