import { test, expect } from '@playwright/test';

test.describe('SyncDo ToDo Application - Comprehensive Test Suite', () => {

    // Helper for login
    async function performLogin(page, email = 'admin', password = 'admin') {
        await page.goto('/login');
        await page.getByPlaceholder('e.g. john@example.com').fill(email);
        await page.getByPlaceholder('••••••••').fill(password);
        await page.getByRole('button', { name: 'Sign In Now' }).click();
        await expect(page.getByText("Hello! Let's get things done.")).toBeVisible();
    }

    // Helper for task creation with unique names
    async function createTask(page, baseTitle, description = '', priority = 'medium') {
        const uniqueTitle = `${baseTitle} - ${Date.now()}`;
        await page.getByRole('button', { name: 'Add a New Task' }).click();
        await page.getByPlaceholder('e.g. Buy groceries').fill(uniqueTitle);
        if (description) await page.getByPlaceholder('Add some notes here...').fill(description);

        // Add a valid due date (required for calendar sync logic in backend)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 16);
        await page.locator('input[type="datetime-local"]').fill(dateStr);

        await page.locator('select').selectOption(priority);
        await page.getByRole('button', { name: 'Save Task' }).click();

        // Wait for task to appear
        await expect(page.getByText(uniqueTitle)).toBeVisible();
        return uniqueTitle;
    }

    // --- AUTHENTICATION TESTS ---

    test('1. Successful login with admin credentials', async ({ page }) => {
        await performLogin(page);
    });

    test('2. Failed login with wrong password', async ({ page }) => {
        await page.goto('/login');
        await page.getByPlaceholder('e.g. john@example.com').fill('admin');
        await page.getByPlaceholder('••••••••').fill('wrong_pass');
        await page.getByRole('button', { name: 'Sign In Now' }).click();
        await expect(page.getByText("Invalid email or password")).toBeVisible();
    });

    test('3. Failed login with non-existent user', async ({ page }) => {
        await page.goto('/login');
        await page.getByPlaceholder('e.g. john@example.com').fill('ghost_user@example.com');
        await page.getByPlaceholder('••••••••').fill('12345678');
        await page.getByRole('button', { name: 'Sign In Now' }).click();
        await expect(page.getByText("Invalid email or password")).toBeVisible();
    });

    test('4. Toggle between Login and Signup forms', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: "I don't have an account yet" }).click();
        await expect(page.getByText("Let's create your free account!")).toBeVisible();
        await page.getByRole('button', { name: "I already have an account" }).click();
        await expect(page.getByText("Welcome back! Please sign in.")).toBeVisible();
    });

    test('5. Form validation - stay on login if empty', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: 'Sign In Now' }).click();
        await expect(page).toHaveURL(/.*login/);
    });

    test('6. Successful signup of a new user', async ({ page }) => {
        const randomEmail = `test_${Date.now()}@example.com`;
        await page.goto('/login');
        await page.getByRole('button', { name: "I don't have an account yet" }).click();
        await page.getByPlaceholder('e.g. John Doe').fill('Test User');
        await page.getByPlaceholder('e.g. john@example.com').fill(randomEmail);
        await page.getByPlaceholder('••••••••').fill('password123');
        await page.getByRole('button', { name: 'Create My Account' }).click();
        await expect(page.getByText("Hello! Let's get things done.")).toBeVisible();
    });

    // --- TASK MANAGEMENT TESTS ---

    test('7. Add a "Urgent" (High) priority task', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'URGENT TASK', 'Fix the production bug', 'high');
        const badge = page.locator('.task-item').filter({ hasText: title }).locator('.priority-badge');
        await expect(badge).toHaveText('Urgent');
    });

    test('8. Add a "Normal" (Low) priority task', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'LOW TASK', 'Water the plants', 'low');
        const badge = page.locator('.task-item').filter({ hasText: title }).locator('.priority-badge');
        await expect(badge).toHaveText('Normal');
    });

    test('9. Create a task with only a title', async ({ page }) => {
        await performLogin(page);
        await createTask(page, 'Simple Title Only');
    });

    test('10. Handle very long task titles', async ({ page }) => {
        await performLogin(page);
        const longTitle = 'Task-Long-'.repeat(10);
        await createTask(page, longTitle);
    });

    test('11. Delete a task using the Trash icon', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'Delete Me');

        page.once('dialog', dialog => dialog.accept());
        await page.locator('.task-item').filter({ hasText: title }).locator('.delete-hover').click();

        await expect(page.getByText(title)).not.toBeVisible();
    });

    test('12. Mark a task as completed', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'Completable');

        const taskItem = page.locator('.task-item').filter({ hasText: title });
        await taskItem.locator('.checkbox').click();

        // After marking done, it moves to History tab
        await page.getByRole('button', { name: 'History' }).click();
        await expect(taskItem.locator('.task-title')).toHaveClass(/done/);
    });

    test('13. Unmark a completed task', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'Toggle Done');

        const taskItem = page.locator('.task-item').filter({ hasText: title });
        await taskItem.locator('.checkbox').click(); // Mark Done

        await page.getByRole('button', { name: 'History' }).click();
        await expect(taskItem.locator('.task-title')).toHaveClass(/done/);

        await taskItem.locator('.checkbox').click(); // Unmark Done
        await page.getByRole('button', { name: 'Active Tasks' }).click();
        await expect(taskItem.locator('.task-title')).not.toHaveClass(/done/);
    });

    test('14. "To Do" statistics update correctly', async ({ page }) => {
        await performLogin(page);
        // Wait for loading to finish
        await expect(page.locator('.pulsating')).not.toBeVisible();

        const statValue = page.locator('.stat-card').first().locator('.stat-value');
        const initialCount = parseInt(await statValue.innerText());

        await createTask(page, 'New Count Task');
        await expect(statValue).toHaveText((initialCount + 1).toString());
    });

    test('15. "Finished" statistics update correctly', async ({ page }) => {
        await performLogin(page);
        // Wait for loading to finish
        await expect(page.locator('.pulsating')).not.toBeVisible();

        const finishedValue = page.locator('.stat-card').nth(1).locator('.stat-value');
        const initialCount = parseInt(await finishedValue.innerText());

        const title = await createTask(page, 'Stat Task');
        await page.locator('.task-item').filter({ hasText: title }).locator('.checkbox').click();

        await expect(finishedValue).toHaveText((initialCount + 1).toString());
    });

    // --- UI/UX & STABILITY TESTS ---

    test('16. Redirect to login if unauthenticated', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/.*login/);
    });

    test('17. Refresh button reloads tasks', async ({ page }) => {
        await performLogin(page);
        const responsePromise = page.waitForResponse('**/tasks/');
        await page.locator('button[title="Refresh"]').click();
        const response = await responsePromise;
        expect(response.status()).toBe(200);
    });

    test('18. Logout clears session and redirects', async ({ page }) => {
        await performLogin(page);
        await page.locator('button[title="Logout"]').click();
        await expect(page).toHaveURL(/.*login/);
    });

    test('19. Persistence: Task remains after page reload', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'Persistent Task');
        await page.reload();
        await expect(page.getByText(title)).toBeVisible();
    });

    test('20. Appearance: Check "Add Form" toggle states', async ({ page }) => {
        await performLogin(page);
        const addBtn = page.getByRole('button', { name: 'Add a New Task' });
        await addBtn.click();
        await expect(page.getByRole('button', { name: 'Close Form' })).toBeVisible();
        await page.getByRole('button', { name: 'Close Form' }).click();
        await expect(addBtn).toBeVisible();
    });

    test('21. WhatsApp Share: Modal opens and validates input', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'Share Test Task');

        const taskItem = page.locator('.task-item').filter({ hasText: title });
        await taskItem.locator('button[title="Share to WhatsApp"]').click();

        // Modal should be visible
        await expect(page.getByRole('heading', { name: 'Share Task' })).toBeVisible();
        await expect(page.getByText('Enter mobile number to send via WhatsApp')).toBeVisible();

        // Send button should be disabled initially
        const sendBtn = page.getByRole('button', { name: 'Send to WhatsApp' });
        await expect(sendBtn).toBeDisabled();

        // Fill mobile number (less than 5 digits should remain disabled)
        const phoneInput = page.getByPlaceholder('Enter number');
        await phoneInput.fill('123');
        await expect(sendBtn).toBeDisabled();

        // Fill valid-ish mobile number
        await phoneInput.fill('9876543210');
        await expect(sendBtn).toBeEnabled();

        // Close modal (use icon name or unique position)
        await page.locator('.card button .lucide-x').click();
        await expect(page.getByRole('heading', { name: 'Share Task' })).not.toBeVisible();
    });

    test('22. Email Share: Modal opens and validates input', async ({ page }) => {
        await performLogin(page);
        const title = await createTask(page, 'Email Share Task');

        const taskItem = page.locator('.task-item').filter({ hasText: title });
        await taskItem.locator('button[title="Share via Email"]').click();

        // Modal should be visible
        await expect(page.getByRole('heading', { name: 'Share Task' })).toBeVisible();
        await expect(page.getByText('Enter recipient email address')).toBeVisible();

        // Send button should be disabled initially
        const sendBtn = page.getByRole('button', { name: 'Send via Email' });
        await expect(sendBtn).toBeDisabled();

        // Fill partial email
        const emailInput = page.getByPlaceholder('friend@example.com');
        await emailInput.fill('invalid-email');
        await expect(sendBtn).toBeDisabled();

        // Fill valid email
        await emailInput.fill('test@example.com');
        await expect(sendBtn).toBeEnabled();

        // Close modal
        await page.locator('.card button .lucide-x').click();
        await expect(page.getByRole('heading', { name: 'Share Task' })).not.toBeVisible();
    });

});
