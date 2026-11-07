import { expect, Page, test } from '@playwright/test';

const pages = ['/', '/events', '/leaderboards', '/full-screen'];
const widths = [320, 375, 390, 430, 600, 768, 1023, 1024, 1440, 1920];

const useData = (scenario: string) =>
  fetch(`http://localhost:8080/__scenario/${scenario}`, { method: 'POST' });

// Keeps the tests independent of Twitch being reachable, or the channel being live.
const stubTwitch = (page: Page) =>
  page.route('https://player.twitch.tv/**', (route) =>
    route.fulfill({ contentType: 'text/html', body: '<body></body>' }),
  );

test.beforeEach(async ({ page }) => {
  await stubTwitch(page);
  await useData('normal');
});

for (const scenario of ['normal', 'long-names', 'empty', 'error']) {
  test(`nothing runs off the side of the screen with ${scenario} data`, async ({ page }) => {
    test.setTimeout(240_000);
    await useData(scenario);
    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      for (const path of pages) {
        await page.goto(path, { waitUntil: 'networkidle' });
        const offscreen = await page.evaluate(() => {
          const viewport = document.documentElement.clientWidth;
          return [...document.querySelectorAll('body *')]
            .filter((el) => {
              const rect = el.getBoundingClientRect();
              return rect.width > 0 && (rect.right > viewport + 0.5 || rect.left < -0.5);
            })
            .map((el) => el.tagName);
        });
        expect(offscreen, `${path} at ${width}px`).toEqual([]);
      }
    }
  });
}

test.describe('mobile menu', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  const link = (page: Page, name: string) => page.locator('.mobile-link', { hasText: name });

  test('opens, navigates and closes', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(link(page, 'Events')).toBeHidden();

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(link(page, 'Events')).toBeVisible();

    await link(page, 'Events').click();
    await expect(page).toHaveURL(/\/events$/);
    await expect(link(page, 'Events')).toBeHidden();
  });

  test('closes on Escape and returns focus to the button', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.keyboard.press('Escape');

    await expect(link(page, 'Events')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  });

  test('is replaced by the desktop links from 1024px', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.locator('.menu-toggle')).toBeHidden();
    await expect(page.getByRole('link', { name: 'Leaderboards' }).first()).toBeVisible();
  });
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('filter and tab buttons are at least 44px tall', async ({ page }) => {
    for (const path of ['/', '/events', '/leaderboards']) {
      await page.goto(path, { waitUntil: 'networkidle' });
      for (const button of await page.locator('.filter-button').all()) {
        expect((await button.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('home shows one leaderboard at a time, switched by tabs', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const boards = page.locator('.leaderboard-wrapper');
    await expect(boards.filter({ hasText: 'Top 8 - Current season' })).toBeVisible();
    await expect(boards.filter({ hasText: 'Top 8 - All time' })).toBeHidden();

    await page.locator('.filter-button', { hasText: 'All time' }).click();
    await expect(boards.filter({ hasText: 'Top 8 - All time' })).toBeVisible();
    await expect(boards.filter({ hasText: 'Top 8 - Current season' })).toBeHidden();
  });

  test('full-screen page scrolls all the way to the logo', async ({ page }) => {
    await page.goto('/full-screen', { waitUntil: 'networkidle' });
    await page.locator('app-full-screen img').scrollIntoViewIfNeeded();
    await expect(page.locator('app-full-screen img')).toBeInViewport();
  });
});

test('home shows every leaderboard side by side on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const boards = page.locator('.leaderboard-wrapper');
  await expect(boards).toHaveCount(4);
  const tops = await boards.evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
  await expect(page.locator('app-leaderboards-banner .filter-button').first()).toBeHidden();
});

test('events list upcoming first and mark the next one', async ({ page }) => {
  await page.goto('/events', { waitUntil: 'networkidle' });
  const cards = page.locator('.card');

  await expect(cards).toHaveCount(5);
  await expect(cards.first().locator('.next-badge')).toBeVisible();
  await expect(page.locator('.next-badge')).toHaveCount(1);
});

test('tied scores keep separate rows', async ({ page }) => {
  await page.goto('/leaderboards', { waitUntil: 'networkidle' });
  await expect(page.locator('.placing-wrapper')).toHaveCount(10);
});

test('data comes from the API on each visit, not from the prerendered page', async ({ page }) => {
  await page.goto('/leaderboards', { waitUntil: 'networkidle' });
  await expect(page.getByText('ShadowKing')).toBeVisible();

  await useData('long-names');
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByText('ShadowKing')).toHaveCount(0);
  await expect(page.getByText('ThisIsAnExtremely')).toBeVisible();
});

test('a failed API request shows a message on each page', async ({ page }) => {
  await useData('error');
  for (const path of ['/', '/events', '/leaderboards']) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page.getByText("Couldn't load").first()).toBeVisible();
  }
});

test('pages have their own titles', async ({ page }) => {
  await page.goto('/events', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Events | Levels Gaming');
  await page.goto('/leaderboards', { waitUntil: 'networkidle' });
  await expect(page).toHaveTitle('Leaderboards | Levels Gaming');
});

test('the header logo links home', async ({ page }) => {
  await page.goto('/events', { waitUntil: 'networkidle' });
  await page.locator('app-header a:has(img)').click();
  await expect(page).toHaveURL(/\/$/);
});
