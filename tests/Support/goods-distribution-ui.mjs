import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { closeGoodsFixture, inspectGoodsPages } from './goods-responsive-checks.mjs';

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
let requirementsApplied = false;
let rejectRequirementsApply = false;
let draftFlow = false;
const requirement = { document_key: 'id', label: 'Certificate of Indigency', description: null, is_required: true, evidence_mode: 'both', physical_copy_requirement: 'original', sort_order: 0 };
const requirementsPreview = {
    changed: true, fingerprint: 'b'.repeat(64), error: null,
    changes: [
        { document_key: 'id', label: requirement.label, kind: 'updated', before: requirement, after: { ...requirement, physical_copy_requirement: 'photocopy' }, resets_inspection: true },
        { document_key: 'clearance', label: 'Barangay clearance with a long label for mobile review', kind: 'added', before: null, after: { ...requirement, document_key: 'clearance', label: 'Barangay clearance with a long label for mobile review', evidence_mode: 'physical', sort_order: 1 }, resets_inspection: false },
        { document_key: 'obsolete', label: 'Previous supporting document', kind: 'removed', before: { ...requirement, document_key: 'obsolete' }, after: null, resets_inspection: false },
    ],
};
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
            is_active: true,
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
const initialAllocations = structuredClone(record.allocations);
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
let cooldownActive = false;
let cooldownAuthorized = false;
let cooldownStale = false;
let rejectCooldownLookup = false;
let programCooldown = { cooldown_enabled: false, cooldown_scope: 'household', cooldown_duration: null, cooldown_unit: null };
const registryHousehold = { id: 'household', household_code: 'HH-GD-1', head_name: 'Kenneth Solis', street: 'Main street', barangay: 'Uno' };
let registrationDraft = null;
let registrationError = null;
let rejectRegistration = false;
function pageFor(url) {
    const filters = Object.fromEntries(url.searchParams);
    const props = {
        filters,
        options,
        permissions: filters.release_only ? { ...permissions, intake: false, process: false, decide: false }
            : filters.view_only ? { ...permissions, intake: false, process: false, decide: false, release: false }
            : filters.process_only ? { ...permissions, intake: false, decide: false, release: false } : permissions,
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
            errors: registrationError ? { registration_check: registrationError } : {},
            canManage: !filters.view_only,
            canCorrect: !filters.view_only,
            canIntakeDistribution: !filters.view_only,
            canViewGoodsProfile: true,
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
    } else if (url.pathname.includes('/recipients/') || url.pathname.includes('/household-members/')) {
        component = 'GoodsDistribution/RecipientProfile';
        const member = url.pathname.includes('/household-members/');
        Object.assign(props, {
            profile: { id: member ? 'member' : 'person', kind: member ? 'member' : 'beneficiary',
                name: member ? 'Kenneth Solis' : 'Susan Palomares Solis with a very long registry name for mobile layout',
                beneficiary_number: member ? null : 'PERSON-1', birth_date: '1960-01-01', is_active: true,
                archived: false, identity_verified: member ? null : false,
                household: { code: 'HH-NEW', head_name: 'Kenneth Solis', barangay: 'Pinggan', is_current: true } },
            canCreate: !member && !filters.view_only,
            canOpenFullProfile: !member && !!filters.full_profile,
            programs: [{ id: 'program', name: 'AICS Food Commodities', is_active: true }, { id: 'old-program', name: 'Previous Program', is_active: false }],
            cooldowns: filters.cooldown_warning ? [
                { program_id: 'program', program_name: 'AICS FOOD COMMODITIES', next_eligible_on: '2027-01-13',
                    sources: [{ request_id: 'request', reference: 'GD-01M4SWAB09GYS0DB2V091HT2F9', scope: 'household' }] },
                ...(filters.long_cooldown ? [{ program_id: 'second-program',
                    program_name: 'Community relief goods program with a long name for recipient and household distribution tracking',
                    next_eligible_on: '2027-02-03', sources: [{ request_id: 'previous', reference: 'GD-' + 'LONGREFERENCE'.repeat(6), scope: 'recipient' }] }] : []),
            ] : [],
        });
        if (!filters.tab || filters.tab === 'overview') props.summary = { released_count: 21, latest_handover_on: '2026-10-10' };
        else {
            const received = filters.tab === 'received';
            const rows = Array.from({ length: filters.page === '2' ? 1 : 3 }, (_, index) => ({
                id: index === 0 ? 'request' : 'request-' + index, reference: 'GD-PROFILE-' + (index + 1), status: received || index === 0 ? 'released' : 'pending',
                program_name: 'AICS Food Commodities', created_at: '2026-10-09T08:00:00+08:00', actual_release_on: '2026-10-10',
                role: index === 0 ? 'both' : 'filer', recipient_name: index === 0 ? 'Susan Solis' : 'Kenneth Solis', filer_name: 'Susan Solis',
                household_code: 'HH-OLD', barangay: 'Uno', collector_name: 'Kenneth Solis',
                lines: [{ item_id: 'rice', item_name_snapshot: 'Commercial rice with a long product name', quantity: '0.125', base_unit: 'kg' },
                    { item_id: 'cans', item_name_snapshot: 'Sardines', quantity: '3.000', base_unit: 'piece' }],
            }));
            const next = new URL(url); next.searchParams.set('page', '2');
            props.records = { data: rows, meta: { current_page: filters.page === '2' ? 2 : 1, last_page: 2, total: 21, from: 1, to: 3 },
                links: { prev: null, next: filters.page === '2' ? null : next.pathname + next.search } };
            props.totals = received ? [
                { program_id: 'program', program_name: 'AICS Food Commodities', item_id: 'rice', item_name: 'Commercial Rice', quantity: '2.625', base_unit: 'kg' },
                { program_id: 'program', program_name: 'AICS Food Commodities', item_id: 'cans', item_name: 'Sardines', quantity: '63.000', base_unit: 'piece' },
            ] : [];
        }
    } else if (url.pathname.endsWith('/registration/create')) {
        component = 'ActionCenter/Admin/Walkin/CreateWalkInBeneficiary';
        Object.assign(props, {
            religions: [], educationalAttainment: [], civilStatus: [], relationships: [],
            submitUrl: '/api/goods-distribution/registration/head',
            checkUrl: '/api/goods-distribution/identity-check',
            canCorrect: true, goodsDistribution: true, canVerify: true,
            returnUrl: prefix, registrationDraft,
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
    } else if (url.pathname.endsWith('/create') || url.pathname.endsWith('/distribution/request/edit')) {
        component = 'GoodsDistribution/Distribution/Form';
        Object.assign(props, { request: url.pathname.endsWith('/edit') ? record : null, selectedRecipient: filters.beneficiary_id || url.pathname.endsWith('/edit') ? person : null, canRegister: false });
    } else if (url.pathname.endsWith('/request')) {
        component = 'GoodsDistribution/Distribution/Details';
        Object.assign(props, {
            request: { ...record, snapshot: householdSynced ? liveSnapshot : snapshot, status: filters.status || record.status },
            requirementsUpdate: filters.requirements_update && !requirementsApplied && !['released', 'cancelled'].includes(filters.status)
                ? requirementsPreview : null,
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
            previousDistributions: filters.no_previous ? [] : Array.from({ length: 4 }, (_, index) => ({
                ...record, id: 'past-' + index, reference: filters.long_previous && index === 0 ? 'GD-' + 'LONGREFERENCE'.repeat(6) : 'GD-PREVIOUS-' + (index + 1),
                program_name: filters.long_previous ? 'AICS Food Commodities program with a long historical program name' : record.program_name,
                snapshot: { ...snapshot, subject: { ...person, name: 'Later registry name' } },
                handover_snapshot: { ...snapshot, subject: { ...person, name: filters.long_previous ? 'RecipientName'.repeat(9) : person.name } },
                status: 'released', actual_release_on: index === 3 ? null : '2026-09-20',
            })),
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
            tab: filters.tab === 'cooldown' ? 'cooldown' : 'documents',
            canManage: !filters.view_only,
            canAdjust: false,
            canIntakeDistribution: true,
            program: { id: 'program', name: 'AICS Food Commodities', code: 'AICS', is_active: true, ...programCooldown },
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
            const multipart = req.headers['content-type']?.startsWith('multipart/form-data');
            const body = multipart ? { multipart: raw } : raw ? JSON.parse(raw) : {};
            calls.push({ path: url.pathname, body });
            if (url.pathname.endsWith('/cooldown-context')) {
                if (rejectCooldownLookup) return json({ message: 'Could not verify current cooldowns. Refresh and review.' }, 422);
                const date = body.actual_release_on || url.searchParams.get('actual_release_on') || '2026-10-09';
                return json({ data: { date, policy: { enabled: cooldownActive, scope: 'household', duration: 3, unit: 'months', starts_on: date, ends_on: '2027-01-09' },
                    blocked: cooldownActive, next_eligible_on: cooldownActive ? '2027-01-09' : null, fingerprint: (cooldownStale ? 'd' : 'c').repeat(64), authorization_current: cooldownAuthorized,
                    conflicts: cooldownActive ? [{ request_id: 'previous', reference: 'GD-REVIEWED-SOURCE', kind: 'active', scope: 'household', starts_on: '2026-10-09', ends_on: '2027-01-09' }] : [] } });
            }
            if (url.pathname.endsWith('/programs/program/cooldown') && Object.hasOwn(body, 'cooldown_enabled')) {
                assert.equal(Object.hasOwn(body, 'name'), false);
                programCooldown = Object.fromEntries(Object.entries(body).filter(([key]) => key.startsWith('cooldown_')));
                return json({ data: { id: 'program' } });
            }
            if (cooldownActive && (url.pathname.endsWith('/approve') || url.pathname.endsWith('/cooldown-exception'))) {
                assert.equal(body.cooldown_fingerprint, (cooldownStale ? 'd' : 'c').repeat(64));
                assert.ok(body.cooldown_exception_reason.trim().length >= 10);
                if (body.cooldown_exception_reason === 'Stale cooldown review') {
                    cooldownStale = true;
                    return json({ errors: { distribution: ['Cooldown context changed. Review the updated sources.'] } }, 422);
                }
                if (url.pathname.endsWith('/cooldown-exception')) assert.equal(body.actual_release_on, '2026-10-09');
                cooldownAuthorized = true;
                record = { ...record, status: 'approved', version: record.version + 1,
                    allocations: url.pathname.endsWith('/approve') ? structuredClone(initialAllocations) : record.allocations };
                return json({ data: { id: record.id } });
            }
            if (url.pathname.endsWith('/registration/begin')) {
                assert.equal(body.identity_check_context, 'checked');
                assert.equal(Object.hasOwn(body, 'household_id'), false);
                if (rejectRegistration) {
                    registrationError = 'Registry matches changed. Check the person again.';
                    res.writeHead(303, { Location: prefix });
                    return res.end();
                }
                registrationError = null;
                registrationDraft = {
                    identity: Object.fromEntries(['first_name', 'middle_name', 'last_name', 'suffix', 'birth_date'].map(field => [field, body[field]])),
                    context: body.identity_check_context, reason: body.different_person_reason || null,
                };
                res.writeHead(303, { Location: prefix + '/registration/create?draft=fixture' });
                return res.end();
            }
            if (draftFlow && (url.pathname.endsWith('/requests') || url.pathname.endsWith('/requests/request'))) {
                if (url.pathname.endsWith('/requests/request')) assert.equal(body.version, record.version);
                record = {
                    ...record, status: body.intent === 'submit' ? 'pending' : 'draft',
                    version: url.pathname.endsWith('/requests') ? 1 : record.version + 1, allocations: [],
                    lines: body.lines.map(line => ({ ...line, id: 'draft-line', item_name_snapshot: 'Commercial Rice', item_code_snapshot: 'RICE', base_unit: 'kg' })),
                };
                return json({ data: { id: record.id } });
            }
            if (draftFlow && url.pathname.endsWith('/submit')) {
                assert.equal(body.version, record.version);
                assert.ok(body.operation_key);
                assert.equal(record.status, 'draft');
                assert.ok(record.lines.length && record.lines.every(line => Number(line.quantity) > 0));
                record = { ...record, status: 'pending', version: record.version + 1 };
                return json({ data: { id: record.id } });
            }
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
            if (url.pathname.endsWith('/documents/check')) {
                assert.equal(req.method, 'PATCH');
                assert.equal(body.version, record.version);
                if (body.remarks === 'Stale review') {
                    return json({ errors: { version: ['Refresh and review the current version.'] } }, 422);
                }
                record = {
                    ...record,
                    version: record.version + 1,
                    documents: record.documents.map((document) => document.id === 'check'
                        ? { ...document, ...body, checked_at: '2026-10-12T09:00:00+08:00' } : document),
                };
                return json({ data: { id: record.id } });
            }
            if (url.pathname.endsWith('/documents/check/upload')) {
                assert.equal(req.method, 'POST');
                assert.ok(multipart);
                assert.ok(raw.includes(`name="version"\r\n\r\n${record.version}`));
                assert.ok(raw.includes('filename="evidence.pdf"'));
                record = {
                    ...record,
                    version: record.version + 1,
                    documents: record.documents.map((document) => document.id === 'check'
                        ? { ...document, current_media_id: 2, status: 'pending', remarks: null, checked_at: null } : document),
                };
                return json({ data: { id: record.id } });
            }
            if (url.pathname.endsWith('/apply-requirements')) {
                assert.equal(body.version, record.version);
                assert.equal(body.requirements_fingerprint, 'b'.repeat(64));
                assert.equal(body.changes_reviewed, true);
                assert.ok(body.operation_key);
                if (rejectRequirementsApply) return json({ errors: { distribution: ['Program requirements changed after your preview. Refresh and review the changes again.'] } }, 422);
                requirementsApplied = true;
                record = {
                    ...record, version: record.version + 1,
                    documents: [
                        ...record.documents.map(document => document.id === 'check'
                            ? { ...document, physical_copy_requirement: 'photocopy', status: 'pending', checked_at: null, remarks: null }
                            : { ...document, is_active: false }),
                        { ...record.documents[0], id: 'clearance', label: requirementsPreview.changes[1].label, evidence_mode: 'physical', current_media_id: null, presented_copy_type: null, status: 'pending', checked_at: null, remarks: null },
                    ],
                };
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
    if (process.argv.includes('--responsive-only')) {
        await inspectGoodsPages(page, go, [
            '', '?beneficiary_id=person&long_name=1', '/distribution', '/distribution/create',
            '/distribution/request', '/distribution/request?tab=household&status=pending',
            '/distribution/request?tab=documents&status=under_review', '/distribution/request?tab=history',
            '/programs/program?tab=documents', '/programs/program?tab=cooldown',
            '/recipients/person', '/recipients/person?tab=received', '/recipients/person?tab=requests',
        ], output, [
            { suffix: '/distribution/request?tab=documents&status=under_review', button: 'Review' },
            { suffix: '/distribution/request?tab=documents&status=under_review&requirements_update=1', button: 'Review changes' },
            { suffix: '/distribution/request?tab=household&status=pending', button: 'Sync household' },
            { suffix: '/distribution/request?status=approved', button: 'Record handover' },
        ]);
        assert.deepEqual(errors, []);
        console.log('PASS: recipient, distribution, documents, household and cooldown pages at phone/tablet/desktop sizes.');
    } else {
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 960 });
        await go('/distribution/request?long_previous=1');
        const previousPanel = 'section[aria-label="Previous household distributions"]';
        assert.equal(await page.$$eval(previousPanel + ' li', rows => rows.length), 4);
        assert.equal(await page.$$eval(previousPanel + ' a', links => links.length), 4);
        assert.ok(await page.$eval(previousPanel, el => el.innerText.includes('4 recent records') && el.innerText.includes('Handover date') && el.innerText.includes('Not recorded')));
        assert.ok(await page.$eval(previousPanel, el => el.innerText.includes('RecipientName') && !el.innerText.includes('Later registry name')));
        assert.ok(await page.$eval(previousPanel, el => el.scrollWidth <= el.clientWidth + 1));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        assert.ok(await page.$(previousPanel + ' a[href$="/distribution/past-0"]'));
        await page.screenshot({ path: path.join(output, `previous-household-distributions-${width}.png`), fullPage: true });
        await go('/distribution/request?no_previous=1');
        assert.equal(await page.$(previousPanel), null);
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
    // Document checklist dialogs retain the GD payload and permission rules.
    const originalRecord = structuredClone(record);
    record.documents.push(
        { ...record.documents[0], id: 'physical', label: 'Barangay clearance', evidence_mode: 'physical', current_media_id: null, status: 'pending', presented_copy_type: null, remarks: null, checked_at: null },
        { ...record.documents[0], id: 'upload-only', label: 'Supporting evidence with a long document name for mobile review', evidence_mode: 'upload', current_media_id: null, status: 'rejected', is_required: false, remarks: 'The uploaded copy is not readable.', checked_at: null },
    );
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 960 });
        await go('/distribution/request?tab=documents&status=under_review');
        assert.ok(await page.evaluate(() => document.body.innerText.includes('1 of 3 documents verified')));
        assert.ok(await page.evaluate(() => document.body.innerText.includes('1 of 2 required documents verified')));
        assert.equal(await page.$$eval('section[aria-labelledby="goods-document-checklist"] form', forms => forms.length), 0);
        assert.equal(await page.$$eval('section[aria-labelledby="goods-document-checklist"] > ul > li:nth-child(2) button', buttons => buttons.length), 1);
        assert.equal(await page.$eval('section[aria-labelledby="goods-document-checklist"] > ul > li:nth-child(2)', li => li.innerText.includes('No file uploaded')), false);
        await page.screenshot({ path: path.join(output, `documents-checklist-${width}.png`), fullPage: true });
        await click('Review');
        await page.waitForSelector('[role="dialog"]');
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[role="dialog"]')).opacity) === 1);
        assert.equal(await page.$eval('[role="dialog"] select', select => select.value), 'verified');
        await page.screenshot({ path: path.join(output, `documents-review-${width}.png`), fullPage: true });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await click('Cancel');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        await click('Replace evidence');
        await page.waitForSelector('[role="dialog"]');
        assert.ok(await page.$eval('[role="dialog"]', dialog => dialog.innerText.includes('resets its inspection to pending review')));
        assert.ok(await page.$eval('[role="dialog"] button[type="submit"]', button => button.disabled));
        await click('Cancel');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
    }
    await go('/distribution/request?tab=documents&status=under_review');
    await click('Review');
    await page.waitForSelector('[role="dialog"] textarea');
    await page.$eval('[role="dialog"] textarea', textarea => { textarea.focus(); textarea.select(); });
    await page.keyboard.type('Stale review');
    await click('Save inspection');
    await page.waitForFunction(() => document.querySelector('[role="dialog"] [role="alert"]')?.innerText.includes('Refresh'));
    await page.select('[role="dialog"] select', 'rejected');
    await page.$eval('[role="dialog"] textarea', textarea => { textarea.focus(); textarea.select(); });
    await page.keyboard.type('Bring a clearer copy.');
    await click('Save inspection');
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]') && document.body.innerText.includes('Bring a clearer copy.'));
    const inspection = calls.findLast(call => call.path.endsWith('/documents/check'));
    assert.equal(inspection.body.status, 'rejected');
    assert.equal(inspection.body.presented_copy_type, 'original');
    await click('Replace evidence');
    await page.waitForSelector('[role="dialog"] input[type="file"]');
    await page.$eval('[role="dialog"] input[type="file"]', input => {
        const transfer = new DataTransfer();
        transfer.items.add(new File(['%PDF-1.4\nTest evidence'], 'evidence.pdf', { type: 'application/pdf' }));
        input.files = transfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForFunction(() => !document.querySelector('[role="dialog"] button[type="submit"]').disabled);
    await page.$eval('[role="dialog"] button[type="submit"]', button => button.click());
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]') && !document.body.innerText.includes('Bring a clearer copy.'));
    for (const suffix of [
        '&status=approved', '&status=released', '&status=cancelled', '&status=under_review&view_only=1',
    ]) {
        await go('/distribution/request?tab=documents' + suffix);
        assert.equal(await page.$$eval('section[aria-labelledby="goods-document-checklist"] button', buttons => buttons.length), 0);
    }
    await go('/distribution/request?tab=documents&status=pending');
    assert.equal(await page.$$eval('section[aria-labelledby="goods-document-checklist"] button', buttons => buttons.filter(button => button.innerText === 'Review').length), 0);
    record.documents = [];
    await go('/distribution/request?tab=documents&status=pending');
    assert.ok(await page.evaluate(() => document.body.innerText.includes('No document requirements were configured')));
    record = originalRecord;

    const beforeRequirements = structuredClone(record);
    record.documents.push({ ...record.documents[0], id: 'obsolete', label: 'Previous supporting document' });
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 960 });
        await go('/distribution/request?tab=documents&status=under_review&requirements_update=1');
        assert.ok(await page.evaluate(() => document.body.innerText.includes('Program requirements have changed')));
        await click('Review changes');
        await page.waitForSelector('[role="dialog"]');
        await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[role="dialog"]')).opacity) === 1);
        assert.ok(await page.$$eval('[role="dialog"] button', buttons => buttons.find(button => button.textContent.trim() === 'Apply updated requirements')?.disabled));
        assert.ok(await page.$eval('[role="dialog"]', dialog => ['Before:', 'After:', 'removed', 'added', 'Inspection will reset'].every(text => dialog.innerText.toLowerCase().includes(text.toLowerCase()))));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await page.screenshot({ path: path.join(output, `requirements-preview-${width}.png`), fullPage: true });
        await click('Cancel');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
    }
    await go('/distribution/request?tab=documents&status=approved&requirements_update=1');
    assert.ok(await page.evaluate(() => document.body.innerText.includes('Updates require return for correction')));
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].some(button => button.innerText === 'Review changes')), false);
    await go('/distribution/request?tab=documents&status=under_review&requirements_update=1&view_only=1');
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].some(button => button.innerText === 'Review changes')), false);
    await go('/distribution/request?tab=documents&status=under_review&requirements_update=1');
    await click('Review changes');
    await page.waitForSelector('[role="dialog"]');
    await page.click('[role="dialog"] button[role="checkbox"]');
    rejectRequirementsApply = true;
    await click('Apply updated requirements');
    await page.waitForFunction(() => document.querySelector('[role="dialog"] [role="alert"]')?.innerText.includes('Refresh'));
    const failedApply = calls.findLast(call => call.path.endsWith('/apply-requirements'));
    rejectRequirementsApply = false;
    await click('Apply updated requirements');
    await page.waitForFunction(() => !document.querySelector('[role="dialog"]') && document.body.innerText.includes('Removed requirements (1)'));
    assert.equal(calls.findLast(call => call.path.endsWith('/apply-requirements')).body.operation_key, failedApply.body.operation_key);
    assert.ok(await page.evaluate(() => !document.body.innerText.includes('Program requirements have changed')));
    assert.ok(await page.evaluate(() => document.body.innerText.includes('0 of 2 required documents verified')));
    await page.click('section[aria-labelledby="goods-document-checklist"] details summary');
    assert.equal(await page.$$eval('section[aria-labelledby="goods-document-checklist"] details button', buttons => buttons.length), 0);
    assert.ok(await page.$eval('section[aria-labelledby="goods-document-checklist"] details', details => details.innerText.includes('Reviewed original and upload.')));
    await page.screenshot({ path: path.join(output, 'requirements-applied-390.png'), fullPage: true });
    record = beforeRequirements;
    requirementsApplied = false;

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
    assert.equal(await page.$('section[aria-label="Registration household"]'), null);
    assert.equal(await page.$('input[name="household-mode"]'), null);
    assert.equal(await page.evaluate(() => document.body.innerText.includes('Register the actual household head first')), false);
    await page.setViewport({ width: 1440, height: 960 });
    await page.screenshot({ path: path.join(output, 'desktop-recipient-direct-registration.png'), fullPage: true });
    await page.setViewport({ width: 390, height: 960 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await page.screenshot({ path: path.join(output, 'mobile-recipient-direct-registration.png'), fullPage: true });
    await page.type('#check-first_name', ' changed');
    assert.equal(await page.evaluate(() => document.body.innerText.includes('Continue to registration')), false);
    await page.focus('#check-first_name');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.type('#check-first_name', 'New');
    await click('Check registry');
    await page.waitForFunction(() => document.body.innerText.includes('No possible match found'));
    rejectRegistration = true;
    await click('Continue to registration');
    await page.waitForFunction(() => document.body.innerText.includes('Registry matches changed. Check the person again.'));
    assert.ok(await page.$('[role="alert"]'));
    assert.equal(await page.$eval('#check-first_name', input => input.value), 'New');
    rejectRegistration = false;
    await click('Continue to registration');
    await page.waitForSelector('#first_name');
    assert.equal(await page.$eval('#first_name', input => input.value), 'New');
    assert.equal(await page.$eval('#last_name', input => input.value), 'Recipient');
    assert.ok(page.url().endsWith('/registration/create?draft=fixture'));
    assert.ok(await page.evaluate(() => document.body.innerText.includes('This person is the actual head of this new household.')));
    assert.equal(await page.$('#check-first_name'), null);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await page.screenshot({ path: path.join(output, 'mobile-recipient-registration-prefill.png'), fullPage: true });
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
    await click('Submit for review');
    await page.waitForFunction(() => document.body.innerText.includes('Refresh and review the current version.'));
    assert.ok(calls.some((c) => c.path.endsWith('/requests') && c.body.lines[0].quantity === '2'));
    const beforeDraft = structuredClone(record);
    draftFlow = true;
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 960 });
        await go('/distribution/create?beneficiary_id=person');
        await page.evaluate(() => {
            for (const [index, value] of [[1, 'program'], [2, 'storage']]) {
                const select = document.querySelectorAll('select')[index];
                select.value = value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
        assert.ok(await page.$$eval('button', buttons => buttons.find(button => button.innerText === 'Submit for review').disabled));
        await page.screenshot({ path: path.join(output, `draft-create-${width}.png`), fullPage: true });
        await click('Save as draft');
        await page.waitForFunction(() => document.body.innerText.includes('Goods not yet specified.'));
        assert.equal(calls.findLast(call => call.path.endsWith('/requests')).body.intent, 'draft');
        assert.deepEqual(calls.findLast(call => call.path.endsWith('/requests')).body.lines, []);
        assert.ok(await page.$$eval('button', buttons => buttons.find(button => button.innerText === 'Submit for review').disabled));
        assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].some(button => ['Start review', 'Approve', 'Record handover'].includes(button.innerText))), false);
        await go('/distribution/request/edit?process_only=1');
        assert.equal(await page.$('input[aria-label="Search beneficiary registry"]'), null);
        assert.ok(await page.$eval('select', select => select.disabled));
        await click('Add item');
        await page.type('input[aria-label="Item"]', 'Rice');
        await page.waitForSelector('[role="option"]');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await click('Save as draft');
        await page.waitForFunction(() => document.body.innerText.includes('Quantity not set'));
        assert.equal(calls.findLast(call => call.path.endsWith('/requests/request')).body.lines[0].quantity, null);
        await page.screenshot({ path: path.join(output, `draft-unspecified-quantity-${width}.png`), fullPage: true });
        await go('/distribution/request/edit?process_only=1');
        await fill('Quantity (kg)', '2');
        await click('Add item');
        await page.screenshot({ path: path.join(output, `draft-complete-${width}.png`), fullPage: true });
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        await click(width === 1440 ? 'Submit for review' : 'Save as draft');
        if (width === 390) {
            await page.waitForFunction(() => document.body.innerText.includes('Draft goods'));
            await click('Submit for review');
            await page.waitForSelector('[role="dialog"]');
            await page.$$eval('[role="dialog"] button', buttons => buttons.find(button => button.innerText === 'Submit for review').click());
        }
        await page.waitForFunction(() => document.body.innerText.includes('Start review'));
        assert.equal(record.status, 'pending');
        assert.deepEqual(record.allocations, []);
    }
    record = beforeDraft;
    draftFlow = false;
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
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 960 });
        for (const tab of ['overview', 'received', 'requests']) {
            await go('/recipients/person?tab=' + tab);
            assert.ok(await page.$('a[href*="/distribution/create?beneficiary_id=person"]'));
            assert.equal(await page.$('a[href*="beneficiary/profile"]'), null);
            assert.equal(await page.$('input[type="file"]'), null);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
            if (width === 1440) {
                const activeSidebar = await page.$$eval('[data-sidebar="menu-sub-button"][aria-current="page"]', elements => elements.map(el => el.textContent.trim()));
                assert.deepEqual(activeSidebar, ['Distribution']);
            }
            await page.screenshot({ path: path.join(output, `recipient-profile-${tab}-${width}.png`), fullPage: true });
            if (tab === 'received') {
                assert.ok(await page.evaluate(() => document.body.innerText.includes('2.625 kg') && document.body.innerText.includes('63 piece')));
                assert.ok(await page.evaluate(() => document.body.innerText.includes('HH-OLD')));
                await page.click('a[href*="profile_tab=received"]');
                await page.waitForFunction(() => document.body.innerText.includes('Back to goods profile'));
                await page.click('a[href*="/recipients/person?tab=received"]');
                await page.waitForFunction(() => document.body.innerText.includes('Received totals'));
            }
        }
        await go('/household-members/member?tab=received');
        assert.equal(await page.$('a[href*="/distribution/create"]'), null);
        assert.equal(await page.evaluate(() => document.body.innerText.includes('Open Full Profile')), false);
        await page.screenshot({ path: path.join(output, `member-profile-${width}.png`), fullPage: true });
        for (const long of [false, true]) {
            await go('/recipients/person?cooldown_warning=1' + (long ? '&long_cooldown=1' : ''));
            const panel = 'section[aria-label="Active goods cooldowns"]';
            assert.ok(await page.$(panel + ' svg'));
            assert.ok(await page.$(panel + ' a[href$="/distribution/request"]'));
            assert.ok(await page.$eval(panel, el => el.innerText.includes('Next eligible:') && el.innerText.includes('Jan') && el.innerText.includes('Scope: Household')));
            const warningStyle = await page.$eval(panel, el => {
                const style = getComputedStyle(el);
                return { border: style.borderTopWidth, shadow: style.boxShadow, background: style.backgroundColor };
            });
            assert.equal(warningStyle.border, '1px');
            assert.ok([...warningStyle.shadow.matchAll(/(-?\d*\.?\d+)px/g)].every(([, value]) => Number(value) === 0), JSON.stringify(warningStyle));
            assert.notEqual(warningStyle.background, 'rgba(0, 0, 0, 0)');
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
            assert.ok(await page.$eval(panel, el => el.scrollWidth <= el.clientWidth + 1));
            await page.screenshot({ path: path.join(output, `recipient-cooldown-warning-${long ? 'long-' : ''}${width}.png`), fullPage: true });
        }
    }
    await go('/recipients/person?tab=received&program_id=program&from=2026-01-01&to=2026-12-31');
    await page.click('button[aria-label="Next page"]');
    await page.waitForFunction(() => location.search.includes('page=2'));
    assert.ok(page.url().includes('program_id=program') && page.url().includes('from=2026-01-01'));
    await go('/recipients/person?full_profile=1');
    assert.ok(await page.evaluate(() => document.body.innerText.includes('Open Full Profile')));
    await go('/recipients/person?view_only=1');
    assert.equal(await page.$('a[href*="/distribution/create"]'), null);
    for (const width of [1440, 390]) {
        await page.setViewport({ width, height: 960 });
        await go('/programs/program?tab=cooldown');
        if (!(await page.$eval('section[aria-label="Program cooldown settings"] input[type="checkbox"]', el => el.checked))) await page.click('section[aria-label="Program cooldown settings"] input[type="checkbox"]');
        await page.$eval('section[aria-label="Program cooldown settings"] input[type="number"]', input => {
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(input, '2'); input.dispatchEvent(new Event('input', { bubbles: true }));
        });
        await page.select('section[aria-label="Program cooldown settings"] select', 'weeks');
        await click('Save cooldown policy');
        await page.waitForSelector('[role="dialog"]');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]').getAnimations().some(animation => animation.playState === 'running'));
        await page.screenshot({ path: path.join(output, `program-cooldown-${width}.png`), fullPage: true });
        await click('Apply policy');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.equal(programCooldown.cooldown_duration, 2);
        assert.equal(programCooldown.cooldown_unit, 'weeks');
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
        record = { ...record, status: 'under_review', allocations: [] };
        cooldownActive = true; cooldownAuthorized = false;
        await go('/distribution/request?status=under_review');
        const cooldownPanel = 'section[aria-label="Goods cooldown eligibility"]';
        assert.ok(await page.$(cooldownPanel + ' svg'));
        assert.ok(await page.$(cooldownPanel + ' a[href$="/distribution/previous"]'));
        assert.ok(await page.$eval(cooldownPanel, el => el.innerText.includes('Active Cooldown') && el.innerText.includes('Next eligible: Jan 9, 2027') && el.innerText.includes('Scope: Household')));
        assert.ok(await page.$eval(cooldownPanel, el => el.classList.contains('bg-amber-50') && el.classList.contains('shadow-none') && el.scrollWidth <= el.clientWidth + 1));
        await page.screenshot({ path: path.join(output, `request-cooldown-warning-${width}.png`), fullPage: true });
        const callsBeforeRefresh = calls.filter(call => call.path.endsWith('/cooldown-context')).length;
        const refreshResponse = page.waitForResponse(response => new URL(response.url()).pathname.endsWith('/cooldown-context'));
        await page.click(cooldownPanel + ' button[aria-label="Refresh cooldown eligibility"]');
        await refreshResponse;
        await page.waitForFunction(() => !!document.querySelector('section[aria-label="Goods cooldown eligibility"]'));
        assert.ok(calls.filter(call => call.path.endsWith('/cooldown-context')).length > callsBeforeRefresh);
        await click('Approve');
        await page.waitForSelector('[role="dialog"] textarea');
        assert.ok(await page.$eval('[role="dialog"] [data-slot="dialog-footer"] button:last-child', button => button.disabled));
        await page.type('[role="dialog"] textarea', 'Reviewed urgent walk-in need');
        await page.click('[role="dialog"] input[type="checkbox"]');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]').getAnimations().some(animation => animation.playState === 'running'));
        await page.screenshot({ path: path.join(output, `cooldown-approval-exception-${width}.png`), fullPage: true });
        await click('Approve and reserve stock');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.ok(cooldownAuthorized);
        record = { ...record, status: 'under_review' }; cooldownAuthorized = false;
        await go('/distribution/request?status=under_review');
        await click('Approve');
        await page.waitForSelector('[role="dialog"] textarea');
        await page.type('[role="dialog"] textarea', 'Stale cooldown review');
        await page.click('[role="dialog"] input[type="checkbox"]');
        await click('Approve and reserve stock');
        await page.waitForFunction(() => document.body.innerText.includes('Cooldown context changed. Review the updated sources.'));
        await page.waitForFunction(() => document.querySelector('[role="dialog"] textarea').value === '' && !document.querySelector('[role="dialog"] input[type="checkbox"]').checked);
        assert.ok(await page.$eval('[role="dialog"] [data-slot="dialog-footer"] button:last-child', button => button.disabled));
        await click('Close');
        record = { ...record, status: 'approved', allocations: structuredClone(initialAllocations) };
        cooldownAuthorized = false;
        await go('/distribution/request?status=approved');
        await click('Authorize cooldown exception');
        await page.waitForSelector('[role="dialog"] textarea');
        await page.type('[role="dialog"] textarea', 'Reviewed changed handover context');
        await page.$$eval('[role="dialog"] button', buttons => buttons.find(button => button.innerText === 'Authorize cooldown exception').click());
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
        assert.ok(cooldownAuthorized);
        cooldownAuthorized = false;
        await go('/distribution/request?release_only=1');
        assert.equal(await page.evaluate(() => [...document.querySelectorAll('button')].some(button => button.innerText === 'Authorize cooldown exception')), false);
        await click('Record handover');
        await page.waitForSelector('[role="dialog"]');
        await page.waitForFunction(() => !document.querySelector('[role="dialog"]').getAnimations().some(animation => animation.playState === 'running'));
        assert.ok(await page.$eval('[role="dialog"] [data-slot="dialog-footer"] button:last-child', button => button.disabled));
        await page.screenshot({ path: path.join(output, `cooldown-release-only-${width}.png`), fullPage: true });
        await click('Close');
    }
    await go('/programs/program?tab=cooldown&view_only=1');
    assert.ok(await page.$eval('section[aria-label="Program cooldown settings"] input', input => input.disabled));
    assert.equal(await page.evaluate(() => document.body.innerText.includes('Save cooldown policy')), false);
    rejectCooldownLookup = true;
    await go('/distribution/request');
    assert.ok(await page.evaluate(() => document.body.innerText.includes('Could not verify current cooldowns')));
    rejectCooldownLookup = false;
    cooldownActive = false;
    assert.deepEqual(errors, []);
    console.log(
        'Desktop/mobile screens, cooldown policy confirmation, reviewed exceptions and stale-context resets, release-only restrictions, recipient profiles/tabs and permission controls, profile return navigation and pagination, direct registration and prefills, draft saving with empty goods and unset quantities, MSWD draft completion and submission, document checklist/review/upload dialogs, reviewed requirement diffs/application, retained removed checks, stale-preview errors, inspection errors and saves, evidence replacement, terminal/permission locks, reviewed household sync, recipient selection, searchable items, validation, municipality headers, collector-switch clearing and re-confirmation, representative/recipient release, and view-only controls passed.',
    );
    console.log('Screenshots: ' + output);
    }
} finally {
    await closeGoodsFixture(browser, server);
}
