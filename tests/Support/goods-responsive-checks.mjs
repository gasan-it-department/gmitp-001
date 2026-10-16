import assert from 'node:assert/strict';
import path from 'node:path';

export const responsiveWidths = [320, 390, 768, 1024, 1440];

export async function closeGoodsFixture(browser, server) {
    server.closeAllConnections();
    if (browser) {
        let timer;
        try {
            await Promise.race([
                browser.close(),
                new Promise((resolve) => {
                    timer = setTimeout(() => {
                        browser.disconnect();
                        browser.process()?.kill();
                        resolve();
                    }, 5000);
                }),
            ]);
        } finally {
            clearTimeout(timer);
        }
    }
    await new Promise((resolve) => server.close(resolve));
}

export async function assertGoodsLayout(page, context) {
    await page.evaluate(() => document.fonts.ready);
    const issues = await page.evaluate(() => {
        const problems = [];
        if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('Page scrolls horizontally');
        const surfaces = [...document.querySelectorAll('.goods-workspace, [role="dialog"]')];
        for (const surface of surfaces) {
            const bounds = surface.getBoundingClientRect();
            if (!bounds.width) continue;
            if (surface.matches('[role="dialog"]') && (bounds.top < -1 || bounds.bottom > innerHeight + 1))
                problems.push('Dialog exceeds screen height');
            if (surface.scrollWidth > surface.clientWidth + 1) problems.push('Surface content is clipped');
            for (const control of surface.querySelectorAll('input, select, textarea, [data-slot="button"]')) {
                const box = control.getBoundingClientRect();
                if (!box.width || !box.height || control.closest('[data-slot="tabs-list"]')) continue;
                if (box.left < bounds.left - 1 || box.right > bounds.right + 1)
                    problems.push('Control exceeds surface: ' + (control.getAttribute('aria-label') || control.textContent));
                if (innerWidth <= 1024 && control.matches('[data-slot="button"]') && (box.width < 43 || box.height < 43))
                    problems.push('Small touch control: ' + control.textContent);
            }
        }
        const receiving = document.querySelector('fieldset[aria-label="Item 1"]');
        if (receiving && innerWidth <= 1024) {
            const footer = receiving.closest('form')?.querySelector('footer');
            if (footer && getComputedStyle(footer).position === 'sticky') problems.push('Receiving actions can cover fields');
        }
        return [...new Set(problems)];
    });
    assert.deepEqual(issues, [], context);
}

export async function inspectGoodsPages(page, go, paths, output, dialogs = []) {
    const filter = process.argv.find((arg) => arg.startsWith('--page-filter='))?.slice('--page-filter='.length);
    if (filter) {
        paths = paths.filter((suffix) => suffix.includes(filter));
        dialogs = dialogs.filter(({ suffix }) => suffix.includes(filter));
        assert.ok(paths.length || dialogs.length, 'No responsive cases match ' + filter);
    }
    for (const width of responsiveWidths) {
        await page.setViewport({ width, height: width === 320 ? 640 : width === 390 ? 740 : width === 1024 ? 768 : 960, isMobile: false });
        for (const suffix of paths) {
            await go(suffix);
            await assertGoodsLayout(page, `${width}px ${suffix}`);
            await page.screenshot({
                path: path.join(output, `responsive-${width}-${suffix.replace(/[^a-z0-9]/gi, '_') || 'recipients'}.png`),
                fullPage: true,
            });
        }
        for (const { suffix, button } of dialogs) {
            await go(suffix);
            const found = await page.evaluate((text) => {
                const candidate = [...document.querySelectorAll('button')].find(
                    (node) => node.textContent.trim() === text && node.getBoundingClientRect().width > 0,
                );
                candidate?.click();
                return !!candidate;
            }, button);
            assert.ok(found, `Missing dialog action: ${button}`);
            await page.waitForSelector('[role="dialog"]');
            await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('[role="dialog"]')).opacity) === 1);
            await assertGoodsLayout(page, `${width}px ${suffix} / ${button}`);
            await page.screenshot({
                path: path.join(output, `responsive-dialog-${width}-${button.replace(/[^a-z0-9]/gi, '_')}.png`),
                fullPage: true,
            });
        }
    }
}
