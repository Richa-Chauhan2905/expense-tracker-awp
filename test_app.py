from playwright.sync_api import sync_playwright, expect
import time
import re

def open_sidebar(page):
    """Open the sidebar (burger menu) if not already open"""
    if page.locator(".sidebar.open").count() == 0:
        page.click("#burgerMenu")
        page.wait_for_selector(".sidebar.open", state="visible")

def run_expense_tracker_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=500)
        page = browser.new_page()
        
        base_url = "http://localhost:4200"
        
        print("\n--- STARTING EXPENSE TRACKER (AngularJS + Node.js) TEST SUITE ---")
        
        unique_email = f"testuser_{int(time.time())}@expense.com"
        
        # ========== TC1: User Registration ==========
        print("Running TC1: User Registration...")
        page.goto(f"{base_url}/#/login")
        # Switch to signup mode
        page.click("a:has-text('Create an account')")
        page.wait_for_selector("form[ng-submit='vm.signup()']", state="visible")
        page.fill("input[ng-model='vm.signupData.fullName']", "TestUser")
        page.fill("input[ng-model='vm.signupData.email']", unique_email)
        page.fill("input[ng-model='vm.signupData.phone']", "9876543210")
        # optional currency selection (select first option)
        page.select_option("select[ng-model='vm.signupData.currencyPreference']", "USD")
        page.fill("input[ng-model='vm.signupData.password']", "Test@123")
        page.fill("input[ng-model='vm.signupData.confirmPassword']", "Test@123")
        page.click("button[type='submit']")
        
        # Wait for success message and redirect to login (as per your controller)
        page.wait_for_selector(".alert-success:has-text('Account created! Please login.')", timeout=5000)
        page.wait_for_timeout(2000)
        # After redirect, we should be on #/login with login form visible
        expect(page).to_have_url(re.compile(r".*#/login"))
        print("  TC1 Registration: PASS")
        
        # ========== TC2: Valid Login ==========
        print("Running TC2: Valid Login...")
        # Already on login page, fill credentials
        page.fill("input[ng-model='vm.loginData.email']", unique_email)
        page.fill("input[ng-model='vm.loginData.password']", "Test@123")
        page.click("button[type='submit']")
        # Wait for redirect to home
        page.wait_for_url(re.compile(r".*#/home"), timeout=5000)
        expect(page.locator("#welcomeUser")).to_contain_text("TestUser")
        print("  TC2 Valid Login: PASS")
        
        # ========== TC3: Add Expense ==========
        print("Running TC3: Add Expense...")
        # Home page has expense form
        page.fill("#expenseDate", "2026-04-20")
        page.select_option("#expenseCategory", "food")
        page.fill("#expenseItem", "Lunch at Cafe")
        page.fill("#expenseAmount", "12.50")
        # Submit the form
        page.click("#expenseForm button[type='submit']")
        # Wait for success notification (toast)
        page.wait_for_selector(".notification.success:has-text('Expense added successfully!')", timeout=5000)
        page.wait_for_timeout(2000)
        
        # Navigate to Manage Expenses to verify
        open_sidebar(page)
        page.click("a[href='#/expenses']")
        page.wait_for_selector("#expensesContainer", state="visible")
        page.wait_for_timeout(1000)  # let AngularJS render
        expect(page.locator("#expensesContainer")).to_contain_text("Lunch at Cafe")
        print("  TC3 Add Expense: PASS")
        
        # ========== TC4: Edit Expense ==========
        print("Running TC4: Edit Expense...")
        # Locate first edit button (✏️) in the expenses list
        edit_btn = page.locator(".expense-actions button.edit-btn").first
        edit_btn.click()
        page.wait_for_selector("#editModal.show", state="visible")
        page.fill("#editAmount", "15.00")
        page.click("#editModal button.btn-primary:has-text('Save Changes')")
        page.wait_for_selector("#editModal.show", state="hidden")
        page.wait_for_selector(".notification.success", timeout=5000)
        page.wait_for_timeout(1000)
        expect(page.locator("#expensesContainer")).to_contain_text("15.00")
        print("  TC4 Edit Expense: PASS")
        
        # ========== TC5: Delete Expense ==========
        print("Running TC5: Delete Expense...")
        # Set up dialog handler for confirm() pop-up
        page.once("dialog", lambda dialog: dialog.accept())
        delete_btn = page.locator(".expense-actions button.delete-btn").first
        delete_btn.click()
        page.wait_for_selector(".notification.success", timeout=5000)
        page.wait_for_timeout(2000)
        expect(page.locator("#expensesContainer")).not_to_contain_text("Lunch at Cafe")
        print("  TC5 Delete Expense: PASS")
        
        # ========== TC6: Set Monthly Budget ==========
        print("Running TC6: Set Monthly Budget...")
        # Go back to Home page
        open_sidebar(page)
        page.click("a[href='#/home']")
        page.wait_for_selector("#budgetDisplay", state="visible")
        page.click("#editBudgetBtn")
        page.wait_for_selector("#budgetForm", state="visible")
        page.fill("#budgetInput", "500")
        page.click("#saveBudgetBtn")
        page.wait_for_timeout(1000)
        expect(page.locator("#monthlyBudget")).to_contain_text("500")
        print("  TC6 Set Budget: PASS")
        
        # ========== TC7: View Expense Report ==========
        print("Running TC7: View Expense Report...")
        open_sidebar(page)
        page.click("a[href='#/reports']")
        page.wait_for_selector("#currentMonthChart", state="visible")
        expect(page.locator("#currentMonthChart")).to_be_visible()
        expect(page.locator("#previousMonthChart")).to_be_visible()
        print("  TC7 View Report: PASS")
        
        # ========== TC8: Logout ==========
        print("Running TC8: Logout...")
        open_sidebar(page)
        page.click("#logoutModalTrigger")  # your logout button may have a different selector
        # In your home HTML, logout is triggered by ng-click="vm.openLogoutModal()", so you may need:
        # page.click("a[ng-click='vm.openLogoutModal()']")
        # I'll assume the logout button has id="logoutBtn" (similar to your earlier code)
        page.click("#logoutBtn")  # adjust based on actual id
        page.wait_for_selector("#logoutModal.show", state="visible")
        page.click("#confirmLogout")
        page.wait_for_url(re.compile(r".*#/login"), timeout=5000)
        expect(page).to_have_url(re.compile(r".*#/login"))
        print("  TC8 Logout: PASS")
        
        # ========== TC9: Unauthorized Access ==========
        print("Running TC9: Unauthorized Access...")
        page.goto(f"{base_url}/#/home")
        # Should be redirected to login because no valid cookie/session
        expect(page).to_have_url(re.compile(r".*#/login"))
        print("  TC9 Unauthorized Access: PASS")
        
        print("\n--- ALL 9 TEST CASES COMPLETED SUCCESSFULLY ---")
        
        browser.close()

if __name__ == "__main__":
    run_expense_tracker_tests()