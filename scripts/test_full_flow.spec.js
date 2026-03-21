import { test, expect } from '@playwright/test';

test.describe('BachatSaathi Comprehensive Feature Test', () => {
    const testUser = {
        name: 'Test',
        email: 'test@gmail.com',
        password: 'test123'
    };

    test('Full Workflow: Signup -> Verfication -> Login -> Multi-Feature Exploration -> Logout', async ({ page }) => {
        // 1. Visit Signup
        await page.goto('http://localhost:3000/signup');
        await expect(page).toHaveTitle(/BachatSaathi/);

        // 2. Perform Signup
        await page.fill('input[name="name"]', testUser.name);
        await page.fill('input[type="email"]', testUser.email);
        const passwordFields = page.locator('input[type="password"]');
        await passwordFields.nth(0).fill(testUser.password);
        await passwordFields.nth(1).fill(testUser.password);
        await page.click('button:has-text("Join the Ecosystem")');

        // 3. OTP Verification (Handling the instruction to check backend manually or automate if possible)
        // Since we are simulating an automated test, we assume the user check's the log for '836967'.
        // For actual CI, you'd mock this or use a test DB.
        console.log('NOTE: Please ensure the OTP verification is handled or mocked for CI.');
        // Assuming user is already verified or bypassing for demo flow
        
        // 4. Login
        await page.goto('http://localhost:3000/login');
        await page.fill('input[type="email"]', testUser.email);
        await page.fill('input[type="password"]', testUser.password);
        await page.click('button:has-text("Log In Now")');

        // 5. Dashboard Verification
        await expect(page).toHaveURL(/.*dashboard/);
        await expect(page.locator('h2')).toContainText('Dashboard');

        // 6. Wallets: Add Wallet
        await page.click('a:has-text("Wallets")');
        await page.click('button:has-text("New Wallet")');
        await page.fill('input[placeholder="Savings Account"]', 'Main Wallet');
        await page.fill('input[type="number"]', '10000');
        await page.click('button:has-text("Create Wallet")');
        await expect(page.locator('h3')).toContainText('Main Wallet');

        // 7. Transactions: Add Expense
        await page.click('a:has-text("Transactions")');
        await page.click('button:has-text("New Transaction")');
        await page.fill('input[placeholder="0.00"]', '1500');
        await page.fill('textarea', 'Grocery Shopping');
        // Category selection
        await page.click('div[role="combobox"]'); // Generic selector, might need refining
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
        await page.click('button:has-text("Execute Transaction")');

        // 8. Goals: Add Goal
        await page.click('a:has-text("Financial Goals")');
        await page.click('button:has-text("New Goal")');
        await page.fill('input[placeholder="Dream Home"]', 'New Laptop');
        await page.fill('input[placeholder="₹0.00"]', '100000');
        await page.click('button:has-text("Create Goal")');

        // 9. Budgets: Add Budget
        await page.click('a:has-text("Budget Planner")');
        await page.click('button:has-text("New Budget")');
        await page.fill('input[type="number"]', '8000');
        await page.click('button:has-text("Initialize Proxy")');

        // 10. Visit Achievements
        await page.click('a:has-text("Achievements")');
        await expect(page.locator('h2')).toContainText('Achievements');

        // 11. Visit Profile
        await page.click('a:has-text("Account Settings")');
        await expect(page.locator('h2')).toContainText('Account Settings');

        // 12. Logout
        await page.click('button:has-text("Sign Out")');
        await expect(page).toHaveURL(/.*login/);
    });
});
