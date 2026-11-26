"""Screenshots of the mobile web version for review, using the demo accounts (servers must be running).

Usage: uv run python review_shots.py   (from backend/, so playwright is available)
"""

import re
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
OUT = HERE / "review"
OUT.mkdir(exist_ok=True)
SITE = "http://127.0.0.1:5500"

text = (HERE / "demo_accounts.txt").read_text(encoding="utf-8")
client_email, client_pw = re.search(r"Client:\s+(\S+) / (\S+)", text).groups()
designer_email, designer_pw = re.search(r"Designer:\s+(\S+) / (\S+)", text).groups()
pid = re.search(r"Project:\s+(\S+)", text).group(1)

PHONE = dict(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True, device_scale_factor=2)
SMALL = dict(viewport={"width": 320, "height": 640}, has_touch=True, is_mobile=True, device_scale_factor=2)
TABLET = dict(viewport={"width": 768, "height": 1024}, has_touch=True, is_mobile=True, device_scale_factor=2)
DESKTOP = dict(viewport={"width": 1440, "height": 900}, device_scale_factor=1)


def shot(page, name):
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT / f"{name}.png"))
    print("saved", name)


def sign_in(page, email, password, target):
    page.goto(f"{SITE}/auth.html?next={target.replace('?', '%3F').replace('=', '%3D')}")
    page.get_by_label("Email").fill(email)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Sign in").click()
    page.wait_for_url(f"**/{target.split('?')[0]}*")
    page.wait_for_load_state("networkidle")


def editor(page):
    page.locator("#canvas [data-kind=furniture]").first.wait_for(state="attached")


with sync_playwright() as p:
    browser = p.chromium.launch()

    # Phone: client
    ctx = browser.new_context(**PHONE)
    page = ctx.new_page()
    page.goto(f"{SITE}/index.html")
    shot(page, "phone-01-landing")
    sign_in(page, client_email, client_pw, "projects.html")
    shot(page, "phone-02-projects")
    page.goto(f"{SITE}/editor.html?project={pid}")
    editor(page)
    shot(page, "phone-03-editor-notice")
    page.get_by_role("button", name="Dismiss notice").tap()
    shot(page, "phone-04-editor")
    page.get_by_role("button", name=re.compile("^Sofa")).tap()
    shot(page, "phone-05-sofa-selected")
    page.locator("#sheet-toggle").tap()
    shot(page, "phone-06-sheet-collapsed")
    page.locator("#canvas [data-kind=walls]").first.focus()
    shot(page, "phone-07-wall-read-only")
    page.locator("#tools button[data-tool=furniture]").tap()
    shot(page, "phone-08-catalog")
    page.keyboard.press("Escape")
    page.get_by_role("button", name="Open menu").tap()
    shot(page, "phone-09-menu")
    page.keyboard.press("Escape")
    page.get_by_role("button", name="3D walkthrough").tap()
    page.locator("#walk canvas[data-position]").wait_for()
    page.wait_for_timeout(800)
    shot(page, "phone-09b-walkthrough")
    page.get_by_role("button", name="Back to 2D plan").tap()
    page.goto(f"{SITE}/design.html?project={pid}")
    page.get_by_role("heading", name="Demo Apartment", level=1).wait_for()
    shot(page, "phone-10-brief")
    page.get_by_role("tab", name="Styles & materials", exact=True).click()
    shot(page, "phone-11-materials")
    page.goto(f"{SITE}/consultant.html?project={pid}")
    page.wait_for_load_state("networkidle")
    shot(page, "phone-12-consultant")
    ctx.close()

    # Phone: designer
    ctx = browser.new_context(**PHONE)
    page = ctx.new_page()
    sign_in(page, designer_email, designer_pw, "studio.html")
    page.get_by_role("article", name="Demo Apartment").first.wait_for()
    shot(page, "phone-13-studio")
    page.get_by_role("button", name="Open menu").tap()
    shot(page, "phone-14-studio-menu")
    ctx.close()

    # Small phone
    ctx = browser.new_context(**SMALL)
    page = ctx.new_page()
    sign_in(page, client_email, client_pw, f"editor.html?project={pid}")
    editor(page)
    shot(page, "small-15-editor")
    ctx.close()

    # Tablet
    ctx = browser.new_context(**TABLET)
    page = ctx.new_page()
    sign_in(page, client_email, client_pw, f"editor.html?project={pid}")
    editor(page)
    shot(page, "tablet-16-editor")
    page.get_by_role("button", name="Open menu").tap()
    shot(page, "tablet-17-menu")
    ctx.close()

    # Desktop (unchanged layout, for comparison)
    ctx = browser.new_context(**DESKTOP)
    page = ctx.new_page()
    sign_in(page, client_email, client_pw, f"editor.html?project={pid}")
    editor(page)
    shot(page, "desktop-18-editor")
    ctx.close()

    browser.close()
