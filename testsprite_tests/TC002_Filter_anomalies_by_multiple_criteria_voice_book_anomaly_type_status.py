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
        # -> Input username and password and click login button to access the application
        frame = context.pages[-1]
        # Input username admin
        await page.wait_for_selector('[data-testid="username-input"]')
        await page.fill('[data-testid="username-input"]', 'admin')

        frame = context.pages[-1]
        # Input password admin123
        await page.fill('[data-testid="password-input"] input', 'admin123')

        frame = context.pages[-1]
        # Click login button
        await page.click('[data-testid="login-submit-button"]')
        
        # Wait for redirect to home and then navigate back to anomalies
        await page.wait_for_url("**/")
        await page.goto("http://localhost:5173/anomalies", wait_until="commit")
        

        # -> Click on the 'Anomalies' link to navigate to the Bible Anomalies page
        # ALREADY AT ANOMALIES PAGE via explicit goto above
        # frame = context.pages[-1]
        # Click on the 'Anomalies' link in the navigation menu
        # elem = frame.locator('xpath=html/body/div/div/div/div/div[2]/ul/li[2]/ul/li[2]/a').nth(0)
        # await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select a voice from the 'Select voice' filter dropdown
        frame = context.pages[-1]
        # Click on 'Select voice' dropdown to choose a voice
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[3]/div/div/div/div/span').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select the first voice option 'Александр Бондаренко (SYNO - ru)' from the 'Select voice' dropdown
        frame = context.pages[-1]
        # Select the first voice option 'Александр Бондаренко (SYNO - ru)' from the dropdown
        elem = frame.locator('xpath=html/body/div[4]/div/ul/li').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the 'All books' filter dropdown to select a specific book
        frame = context.pages[-1]
        # Click on 'All books' dropdown to select a book
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[3]/div/div/div[2]/div/span').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Select the book 'Бытие (1)' from the 'All books' dropdown
        frame = context.pages[-1]
        # Select the book 'Бытие (1)' from the 'All books' dropdown
        elem = frame.locator('xpath=html/body/div[4]/div/ul/li').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # -> Click on the 'All types' filter dropdown to select an anomaly type
        frame = context.pages[-1]
        # Click on 'All types' dropdown to select an anomaly type
        elem = frame.locator('xpath=html/body/div/div/div[2]/div/div/div[3]/div[2]/div[2]/table/thead/tr/th[4]').nth(0)
        await page.wait_for_timeout(3000); await elem.click(timeout=5000)
        

        # --> Assertions to verify final state
        frame = context.pages[-1]
        try:
            await expect(frame.locator('text=Voice:').first).to_be_visible(timeout=5000)
        except AssertionError:
            raise AssertionError("Test case failed: The filtering functionality did not work properly when multiple filters were applied simultaneously as per the test plan.")
        await asyncio.sleep(5)
    
    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()
            
asyncio.run(run_test())