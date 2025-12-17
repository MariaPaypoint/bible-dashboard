import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None
    
    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()
        
        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )
        
        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)
        
        # Open a new page in the browser context
        page = await context.new_page()
        
        # Navigate to your target URL and wait until the network request is committed
        await page.goto("http://localhost:5173/anomalies", wait_until="commit", timeout=10000)
        
        # Wait for the main page to reach DOMContentLoaded state (optional for stability)
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=3000)
        except async_api.Error:
            pass
        
        # Iterate through all iframes and wait for them to load as well
        for frame in page.frames:
            try:
                await frame.wait_for_load_state("domcontentloaded", timeout=3000)
            except async_api.Error:
                pass
        
        # Interact with the page elements to simulate user flow
        # -> Input username and password and click login button
        frame = context.pages[-1]
        # Input username 'admin'
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin')
        

        frame = context.pages[-1]
        # Input password 'admin123'
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/div[2]/div/input').nth(0)
        await page.wait_for_timeout(3000); await elem.fill('admin123')
        

        frame = context.pages[-1]
        # Click login button
        elem = frame.locator('xpath=html/body/div/div/div/div[2]/form/button').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the 'Anomalies' menu item to load the anomalies list
        frame = context.pages[-1]
        # Click on 'Anomalies' menu item to load anomalies list
        elem = frame.locator('xpath=html/body/div/div/div/div/div[2]/ul/li[2]/ul/li[2]/a').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select a voice from the 'Select voice' dropdown to load anomalies data and verify table data correctness
        frame = context.pages[-1]
        # Click on 'Select voice' dropdown to open options
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[3]/div/div/div/div/span').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Try clicking the parent container or another element around the 'Select voice' dropdown to open the voice selection list
        frame = context.pages[-1]
        # Click on the parent container of 'Select voice' dropdown to try opening the voice selection list
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[3]/div/div/div/div').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select the first voice option 'Александр Бондаренко (SYNO - ru)' to load anomalies data and verify table data correctness
        frame = context.pages[-1]
        # Select the first voice option 'Александр Бондаренко (SYNO - ru)' from the dropdown
        elem = frame.locator('xpath=html/body/div[4]/div/ul/li').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        await expect(frame.locator('text=Code').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Reference').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Word').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Anomaly Type').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Info').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Ratio').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Status').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Actions').first).to_be_visible(timeout=30000)
        await expect(frame.locator('text=Select a voice to view anomalies').first).to_be_visible(timeout=30000)
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())
    