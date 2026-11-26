"""Records phone-sized clips of the mobile web version for the PR video (servers must be running).

Writes WebM files to pr-video/public/clips/. A tap indicator is injected (bypass_csp is used for the
recording context only, never in the app) so viewers can see where each tap lands. Nothing is saved.
"""

import re
import shutil
from pathlib import Path

from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent
OUT = HERE / "pr-video" / "public" / "clips"
TMP = HERE / "recording-tmp"
OUT.mkdir(parents=True, exist_ok=True)
SITE = "http://127.0.0.1:5500"

text = (HERE / "demo_accounts.txt").read_text(encoding="utf-8")
email, password = re.search(r"Client:\s+(\S+) / (\S+)", text).groups()
pid = re.search(r"Project:\s+(\S+)", text).group(1)

TAPS = """
addEventListener('pointerdown', (e) => {
  const dot = document.createElement('div');
  Object.assign(dot.style, {
    position: 'fixed', left: (e.clientX - 22) + 'px', top: (e.clientY - 22) + 'px', width: '44px', height: '44px',
    borderRadius: '50%', background: 'rgba(191,84,44,0.35)', border: '2px solid rgba(159,60,22,0.9)',
    pointerEvents: 'none', zIndex: 2147483647, transition: 'transform 0.5s ease-out, opacity 0.5s ease-out',
  });
  document.documentElement.appendChild(dot);
  requestAnimationFrame(() => { dot.style.transform = 'scale(1.6)'; dot.style.opacity = '0'; });
  setTimeout(() => dot.remove(), 600);
}, true);
"""

PHONE = {"width": 390, "height": 844}


def centre(locator):
    box = locator.bounding_box()
    return box["x"] + box["width"] / 2, box["y"] + box["height"] / 2


def tap(page, locator, pause=900):
    x, y = centre(locator)
    page.mouse.click(x, y)  # mouse events, so the indicator and the app see a pointer
    page.wait_for_timeout(pause)


def drag(page, locator, dx, dy, pause=900):
    x, y = centre(locator)
    page.mouse.move(x, y)
    page.mouse.down()
    for i in range(1, 16):
        page.mouse.move(x + dx * i / 15, y + dy * i / 15)
        page.wait_for_timeout(30)
    page.mouse.up()
    page.wait_for_timeout(pause)


def hold(page, locator, ms):
    x, y = centre(locator)
    page.mouse.move(x, y)
    page.mouse.down()
    page.wait_for_timeout(ms)
    page.mouse.up()


with sync_playwright() as p:
    browser = p.chromium.launch()

    # Sign in once, without recording.
    login = browser.new_context(viewport=PHONE, is_mobile=True, has_touch=True)
    page = login.new_page()
    page.goto(f"{SITE}/auth.html?next=projects.html")
    page.get_by_label("Email").fill(email)
    page.get_by_label("Password").fill(password)
    page.get_by_role("button", name="Sign in").click()
    page.wait_for_url("**/projects.html")
    page.wait_for_load_state("networkidle")
    state = login.storage_state()
    login.close()

    def recorder(name):
        if TMP.exists():
            shutil.rmtree(TMP)
        ctx = browser.new_context(
            viewport=PHONE, device_scale_factor=2, is_mobile=True, has_touch=True, bypass_csp=True,
            storage_state=state, record_video_dir=str(TMP), record_video_size=PHONE,  # Playwright records at the CSS viewport size; larger sizes only pad
        )
        ctx.add_init_script(TAPS)
        return ctx

    def finish(ctx, page, name):
        video = page.video
        ctx.close()
        shutil.move(video.path(), OUT / f"{name}.webm")
        print("saved", name)

    # Clip 1: the phone editor.
    ctx = recorder("editor")
    page = ctx.new_page()
    page.goto(f"{SITE}/editor.html?project={pid}")
    page.locator("#canvas [data-kind=furniture]").first.wait_for(state="attached")
    page.wait_for_timeout(1800)
    tap(page, page.get_by_role("button", name="Dismiss notice"), 1000)
    sofa = page.get_by_role("button", name=re.compile("^Sofa"))
    tap(page, sofa, 1500)
    drag(page, sofa, 40, -50, 1000)
    tap(page, page.locator("#rotate"), 1200)
    tap(page, page.locator("#sheet-toggle"), 1000)
    tap(page, page.locator("#tools button[data-tool=furniture]"), 1300)
    tap(page, page.locator("#catalog button[data-type=armchair]"), 700)
    box = page.locator("#canvas").bounding_box()
    page.mouse.click(box["x"] + box["width"] * 0.62, box["y"] + box["height"] * 0.42)
    page.wait_for_timeout(1500)
    tap(page, page.locator("#undo"), 1200)
    finish(ctx, page, "editor")

    # Clip 2: read-only walls and the menu.
    ctx = recorder("walls")
    page = ctx.new_page()
    page.goto(f"{SITE}/editor.html?project={pid}")
    page.locator("#canvas [data-kind=furniture]").first.wait_for(state="attached")
    page.evaluate("sessionStorage.setItem('atelier.phoneNoticeDismissed', '1')")
    page.reload()
    page.locator("#canvas [data-kind=furniture]").first.wait_for(state="attached")
    page.wait_for_timeout(1000)
    wall = page.locator("#canvas [data-kind=walls]").nth(1)
    x, y = centre(wall)
    page.mouse.click(x, y)
    page.wait_for_timeout(2600)
    tap(page, page.get_by_role("button", name="Open menu"), 2400)
    page.keyboard.press("Escape")
    page.wait_for_timeout(800)
    finish(ctx, page, "walls")

    # Clip 3: the 3D walkthrough on a phone.
    ctx = recorder("walk")
    page = ctx.new_page()
    page.goto(f"{SITE}/editor.html?project={pid}")
    page.locator("#canvas [data-kind=furniture]").first.wait_for(state="attached")
    page.evaluate("sessionStorage.setItem('atelier.phoneNoticeDismissed', '1')")
    page.reload()
    page.locator("#canvas [data-kind=furniture]").first.wait_for(state="attached")
    page.wait_for_timeout(900)
    tap(page, page.get_by_role("button", name="3D walkthrough"), 0)
    page.locator("#walk canvas[data-position]").wait_for()
    page.wait_for_timeout(1500)
    hold(page, page.get_by_role("button", name="Walk back"), 1100)
    hold(page, page.get_by_role("button", name="Turn left"), 900)
    hold(page, page.get_by_role("button", name="Walk forward"), 1400)
    hold(page, page.get_by_role("button", name="Turn right"), 1300)
    page.wait_for_timeout(600)
    tap(page, page.get_by_role("button", name="Back to 2D plan"), 1200)
    finish(ctx, page, "walk")

    browser.close()
    if TMP.exists():
        shutil.rmtree(TMP)
