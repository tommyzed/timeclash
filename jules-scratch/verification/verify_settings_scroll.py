import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            # Set a smaller viewport to test scrolling
            await page.set_viewport_size({"width": 800, "height": 600})

            # Navigate to the game page
            await page.goto("http://localhost:5000")

            # Wait for the lobby to load and click the new game button
            await expect(page.get_by_role("button", name="New Game")).to_be_visible()
            await page.get_by_role("button", name="New Game").click()

            # Wait for the game to load
            await expect(page.get_by_test_id("game-header")).to_be_visible()

            # Click the settings button
            await page.get_by_test_id("settings-button").click()

            # Wait for the settings modal to appear
            await expect(page.get_by_text("Game Settings")).to_be_visible()

            # Take a screenshot
            await page.screenshot(path="jules-scratch/verification/verification.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
