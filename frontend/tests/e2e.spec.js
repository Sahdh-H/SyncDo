import { test, expect } from '@playwright/test';

test.describe('ToDo App E2E', () => {
    test('should login and manage tasks', async ({ page }) => {
        // 1. Visit the app
        await page.goto('/login');

        // 2. Login as admin/admin
        await page.getByPlaceholder('e.g. john@example.com').fill('admin');
        await page.getByPlaceholder('••••••••').fill('admin');
        await page.getByRole('button', { name: 'Sign In Now' }).click();

        // 3. Verify we are on Dashboard
        await expect(page.getByText("Hello! Let's get things done.")).toBeVisible();

        // 4. Create a new task
        await page.getByRole('button', { name: 'Add a New Task' }).click();
        await page.getByPlaceholder('e.g. Buy groceries').fill('Automated Test Task');
        await page.getByPlaceholder('Add some notes here...').fill('This task was created by Playwright');

        // Set a due date (e.g., tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 16); // Formats to YYYY-MM-DDTHH:mm
        await page.locator('input[type="date"], input[type="datetime-local"]').fill(dateStr);

        // Select priority
        await page.locator('select').selectOption('medium');

        // Save task
        await page.getByRole('button', { name: 'Save Task' }).click();

        // 5. Verify task is in the list
        await expect(page.getByText('Automated Test Task')).toBeVisible();

        // 6. Toggle task completion (clicking the checkbox div)
        // Note: The checkbox is the div before the task title
        const checkbox = page.locator('.task-item').filter({ hasText: 'Automated Test Task' }).locator('.checkbox');
        await checkbox.click();

        // Check if it's marked as done (title should have 'done' class)
        const taskTitle = page.locator('.task-title').filter({ hasText: 'Automated Test Task' });
        await expect(taskTitle).toHaveClass(/done/);

        // 7. Delete task
        // Playwright needs to handle the window.confirm
        page.once('dialog', async dialog => {
            expect(dialog.message()).toContain('Are you sure you want to delete this task?');
            await dialog.accept();
        });

        await page.locator('.task-item').filter({ hasText: 'Automated Test Task' }).locator('.delete-hover').click();

        // 8. Verify task is gone
        await expect(page.getByText('Automated Test Task')).not.toBeVisible();
    });
});
