const { chromium } = require("playwright-core");
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = "C:\\Users\\SonuKushwah\\AppData\\Local\\Temp\\pw-test\\";

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE_PATH, headless: false });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  await page.goto("http://localhost:3002/login");
  await page.fill('input[type="email"]', "krishna.singh@example.com");
  await page.fill('input[type="password"]', "admin123");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/admin/dashboard", { timeout: 15000 });
  await page.waitForTimeout(1200);

  const heading = page.locator("text=Recent Activity");
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: OUT + "polish-recent-activity.png" });

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: OUT + "polish-titles-top.png" });

  await browser.close();
})().catch((e) => {
  console.error("SCRIPT FAILED:", e.message);
  process.exit(1);
});
