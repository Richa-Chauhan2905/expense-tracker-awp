import os
import re
import time

from playwright.sync_api import expect, sync_playwright


def api_matcher(path_fragment, method=None):
    def matcher(response):
        request = response.request
        if path_fragment not in response.url:
            return False
        if method and request.method.upper() != method.upper():
            return False
        return True

    return matcher


def open_sidebar(page):
    sidebar = page.locator("#sidebar")
    sidebar_class = sidebar.get_attribute("class") or ""
    if "open" not in sidebar_class:
        page.click("#burgerMenu")
        expect(sidebar).to_have_class(re.compile(r".*\bopen\b.*"))


def click_sidebar_link(page, label):
    open_sidebar(page)
    page.locator("#sidebar .nav-item", has_text=label).first.click()


def wait_until(predicate, timeout_ms=10000, interval_ms=250, error_message="Timed out"):
    deadline = time.time() + (timeout_ms / 1000)
    while time.time() < deadline:
        result = predicate()
        if result:
            return result
        time.sleep(interval_ms / 1000)
    raise AssertionError(error_message)


def wait_for_route_or_selector(page, route_pattern, selector, timeout_ms=10000):
    route_regex = re.compile(route_pattern)

    def ready():
        if route_regex.search(page.url):
            return True
        locator = page.locator(selector)
        return locator.count() > 0 and locator.first.is_visible()

    wait_until(
        ready,
        timeout_ms=timeout_ms,
        error_message=(
            f"Expected route '{route_pattern}' or selector '{selector}', "
            f"but current URL is {page.url}"
        ),
    )


def wait_for_modal_state(page, selector, should_be_open, timeout_ms=10000):
    modal = page.locator(selector)

    def has_expected_state():
        modal_class = modal.get_attribute("class") or ""
        is_open = "show" in modal_class.split()
        return is_open == should_be_open

    expected = "open" if should_be_open else "closed"
    wait_until(
        has_expected_state,
        timeout_ms=timeout_ms,
        error_message=f"Modal {selector} did not become {expected}.",
    )


def get_alert_text(page, selector):
    locator = page.locator(selector)
    if locator.count() == 0:
        return ""
    text = locator.first.text_content() or ""
    return text.strip()


def ensure_login_form_visible(page, timeout_ms=10000):
    login_form = page.locator("form[ng-submit='auth.login()']")
    signup_form = page.locator("form[ng-submit='auth.signup()']")

    def login_ready():
        if login_form.is_visible():
            return True

        if signup_form.is_visible():
            login_button = page.locator("button", has_text="Login")
            if login_button.count() > 0:
                login_button.last.click()
                return False

        return False

    wait_until(
        login_ready,
        timeout_ms=timeout_ms,
        error_message="Login form did not become visible after signup.",
    )


def wait_for_home_screen(page, timeout_ms=10000):
    def home_ready():
        if page.url.endswith("#/home"):
            return True

        welcome_user = page.locator("#welcomeUser")
        if welcome_user.count() > 0 and welcome_user.first.is_visible():
            return True

        error_text = get_alert_text(page, ".alert.alert-danger")
        if error_text:
            raise AssertionError(f"Login failed: {error_text}")

        return False

    wait_until(
        home_ready,
        timeout_ms=timeout_ms,
        error_message=f"Login did not reach the home screen. Current URL: {page.url}",
    )


def ensure_edit_form_is_submittable(page):
    date_input = page.locator("#editDate")
    current_date = date_input.input_value().strip()
    if not current_date:
        expense_date_text = page.locator(".expense-item").first.locator(".expense-date").text_content() or ""
        raise AssertionError(
            "Edit form date is empty before submit, so the browser blocks the form. "
            f"Visible row date text: {expense_date_text.strip()}"
        )

    page.fill("#editDate", current_date)


def run_expense_tracker_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=400)
        page = browser.new_page()

        base_url = os.getenv("EXPENSE_TRACKER_URL", "http://localhost:4200")

        print("\n--- STARTING EXPENSE TRACKER (AngularJS + Node.js) TEST SUITE ---")

        unique_email = f"testuser_{int(time.time())}@expense.com"

        print("Running TC1: User Registration...")
        page.goto(f"{base_url}/#/login")
        page.wait_for_selector(
            "form[ng-submit='auth.login()']",
            state="visible",
            timeout=10000,
        )

        page.locator("button", has_text="Create an account").click()
        page.wait_for_selector(
            "form[ng-submit='auth.signup()']",
            state="visible",
            timeout=10000,
        )

        page.fill("input[ng-model='auth.signupData.fullName']", "TestUser")
        page.fill("input[ng-model='auth.signupData.email']", unique_email)
        page.fill("input[ng-model='auth.signupData.phone']", "9876543210")
        page.select_option("select[ng-model='auth.signupData.currencyPreference']", "INR")
        page.fill("input[ng-model='auth.signupData.city']", "Mumbai")
        page.fill("input[ng-model='auth.signupData.state']", "Maharashtra")
        page.fill("input[ng-model='auth.signupData.password']", "Test@123")
        page.fill("input[ng-model='auth.signupData.confirmPassword']", "Test@123")

        with page.expect_response(api_matcher("/api/users/signup", "POST"), timeout=15000) as signup_response_info:
            page.locator("form[ng-submit='auth.signup()'] button[type='submit']").click()

        signup_response = signup_response_info.value
        if signup_response.status >= 400:
            raise AssertionError(
                f"Signup failed with API response {signup_response.status}: {signup_response.text()}"
            )

        wait_until(
            lambda: (
                "Account created! Please login." in get_alert_text(page, ".alert.alert-success")
                or page.locator("form[ng-submit='auth.login()']").is_visible()
            ),
            timeout_ms=10000,
            error_message="Signup did not show success feedback or return to login.",
        )
        ensure_login_form_visible(page)
        print("  TC1 Registration: PASS")

        print("Running TC2: Valid Login...")
        page.fill("input[ng-model='auth.loginData.email']", unique_email)
        page.fill("input[ng-model='auth.loginData.password']", "Test@123")

        with page.expect_response(api_matcher("/api/users/login", "POST"), timeout=15000) as login_response_info:
            page.locator("form[ng-submit='auth.login()'] button[type='submit']").click()

        login_response = login_response_info.value
        if login_response.status >= 400:
            raise AssertionError(
                f"Login failed with API response {login_response.status}: {login_response.text()}"
            )

        wait_for_home_screen(page)
        expect(page.locator("#welcomeUser")).to_contain_text("TestUser")
        print("  TC2 Valid Login: PASS")

        print("Running TC3: Add Expense...")
        page.fill("#expenseDate", "2026-04-20")
        page.select_option("#expenseCategory", "food")
        page.fill("#expenseItem", "Lunch at Cafe")
        page.fill("#expenseAmount", "12.50")

        with page.expect_response(api_matcher("/api/expenses", "POST"), timeout=15000) as create_response_info:
            page.click("#expenseForm button[type='submit']")

        create_response = create_response_info.value
        if create_response.status >= 400:
            raise AssertionError(
                f"Create expense failed with API response {create_response.status}: {create_response.text()}"
            )

        wait_until(
            lambda: page.locator("#expenseItem").input_value() == "",
            timeout_ms=10000,
            error_message="Expense form did not reset after creating an expense.",
        )

        click_sidebar_link(page, "Manage Expenses")
        wait_for_route_or_selector(page, r"#/(manage-expenses|expenses)$", "#expensesContainer")
        expect(page.locator("#expensesContainer")).to_contain_text("Lunch at Cafe")
        print("  TC3 Add Expense: PASS")

        print("Running TC4: Edit Expense...")
        first_row = page.locator(".expense-item").first
        expect(first_row).to_contain_text("Lunch at Cafe")
        first_row.locator(".edit-btn").click()
        wait_for_modal_state(page, "#editModal", True)

        page.fill("#editDescription", "Lunch at Cafe")
        ensure_edit_form_is_submittable(page)
        page.fill("#editAmount", "15.00")

        with page.expect_response(re.compile(r".*/api/expenses/[^/]+$"), timeout=15000) as update_response_info:
            page.locator("#editModal button[type='submit']").click()

        update_response = update_response_info.value
        if update_response.request.method.upper() != "PUT":
            raise AssertionError("Unexpected request captured while editing expense.")
        if update_response.status >= 400:
            raise AssertionError(
                f"Edit expense failed with API response {update_response.status}: {update_response.text()}"
            )

        wait_for_modal_state(page, "#editModal", False)
        wait_until(
            lambda: "15.00" in (page.locator("#expensesContainer").text_content() or ""),
            timeout_ms=10000,
            error_message="Updated expense amount did not appear in the expenses list.",
        )
        print("  TC4 Edit Expense: PASS")

        print("Running TC5: Delete Expense...")
        page.locator(".expense-item").first.locator(".delete-btn").click()
        wait_for_modal_state(page, "#deleteModal", True)

        with page.expect_response(re.compile(r".*/api/expenses/[^/]+$"), timeout=15000) as delete_response_info:
            page.locator("#deleteModal .btn-danger", has_text="Delete").click()

        delete_response = delete_response_info.value
        if delete_response.request.method.upper() != "DELETE":
            raise AssertionError("Unexpected request captured while deleting expense.")
        if delete_response.status >= 400:
            raise AssertionError(
                f"Delete expense failed with API response {delete_response.status}: {delete_response.text()}"
            )

        wait_for_modal_state(page, "#deleteModal", False)
        wait_until(
            lambda: "Lunch at Cafe" not in (page.locator("#expensesContainer").text_content() or ""),
            timeout_ms=10000,
            error_message="Deleted expense still appears in the expenses list.",
        )
        print("  TC5 Delete Expense: PASS")

        print("Running TC6: Set Monthly Budget...")
        click_sidebar_link(page, "Home")
        wait_for_route_or_selector(page, r"#/home$", "#budgetDisplay")
        page.click("#editBudgetBtn")
        page.wait_for_selector("#budgetForm", state="visible", timeout=10000)
        page.fill("#budgetInput", "500")

        with page.expect_response(api_matcher("/api/budget", "PUT"), timeout=15000) as budget_response_info:
            page.click("#saveBudgetBtn")

        budget_response = budget_response_info.value
        if budget_response.status >= 400:
            raise AssertionError(
                f"Set budget failed with API response {budget_response.status}: {budget_response.text()}"
            )

        wait_until(
            lambda: "500" in (page.locator("#monthlyBudget").text_content() or ""),
            timeout_ms=10000,
            error_message="Monthly budget did not update on the home screen.",
        )
        print("  TC6 Set Budget: PASS")

        print("Running TC7: View Expense Report...")
        click_sidebar_link(page, "Expense Report")
        wait_for_route_or_selector(page, r"#/(expense-report|reports)$", "#currentMonthChart")
        expect(page.locator("#currentMonthChart")).to_be_visible()
        expect(page.locator("#previousMonthChart")).to_be_visible()
        print("  TC7 View Report: PASS")

        print("Running TC8: Logout...")
        click_sidebar_link(page, "Logout")

        logout_modal = page.locator("#logoutModal")
        if logout_modal.count() > 0:
            try:
                wait_for_modal_state(page, "#logoutModal", True, timeout_ms=3000)
                with page.expect_response(api_matcher("/api/users/logout", "POST"), timeout=15000):
                    page.locator("#logoutModal .btn-danger", has_text="Logout").click()
            except AssertionError:
                pass

        if not page.url.endswith("#/login"):
            wait_for_route_or_selector(page, r"#/login$", "form[ng-submit='auth.login()']")

        expect(page.locator("form[ng-submit='auth.login()']")).to_be_visible()
        print("  TC8 Logout: PASS")

        print("Running TC9: Unauthorized Access...")
        page.goto(f"{base_url}/#/home")
        wait_for_route_or_selector(page, r"#/login$", "form[ng-submit='auth.login()']")
        expect(page.locator("form[ng-submit='auth.login()']")).to_be_visible()
        print("  TC9 Unauthorized Access: PASS")

        print("\n--- ALL 9 TEST CASES COMPLETED SUCCESSFULLY ---")

        browser.close()


if __name__ == "__main__":
    run_expense_tracker_tests()
