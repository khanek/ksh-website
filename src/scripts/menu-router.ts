const PANELS = ['profile', 'skills', 'projects', 'contact'] as const;

type Screen = (typeof PANELS)[number] | 'menu';

/** The screen swap happens while the wipe bands cover the viewport. */
const WIPE_COVERED_MS = 250;
const WIPE_TOTAL_MS = 700;

function screenFromHash(hash: string): Screen {
  const id = hash.replace(/^#/, '');
  return (PANELS as readonly string[]).includes(id) ? (id as Screen) : 'menu';
}

/**
 * Turns the stacked page into the game-style menu: one screen at a time,
 * picked by the URL hash, with a slash wipe between screens.
 * The page stays a normal document when this never runs.
 */
export function initMenuRouter(root: HTMLElement): void {
  const wipe = document.querySelector<HTMLElement>('[data-wipe]');
  const langLink = document.querySelector<HTMLAnchorElement>('[data-lang-link]');
  const langLinkBase = langLink?.getAttribute('href') ?? '';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const baseTitle = document.title;

  let current: Screen = screenFromHash(location.hash);
  let previousPanel: Screen | null = null;
  let openedFromMenu = false;
  let swapTimer = 0;
  let wipeTimer = 0;
  let pending: Screen | null = null;
  let backRequested = false;

  const menuItems = () => Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-menu-item]'));

  function panelTitle(screen: Screen): string {
    return document.querySelector(`#${screen}-title .sr-only`)?.textContent ?? '';
  }

  function applyScreen(screen: Screen) {
    if (current !== 'menu') previousPanel = current;
    current = screen;
    root.dataset.screen = screen;
    window.scrollTo(0, 0);

    if (screen === 'menu') {
      document.title = baseTitle;
      openedFromMenu = false;
      menuItems()
        .find((item) => item.hash === `#${previousPanel}`)
        ?.focus({ preventScroll: true });
    } else {
      document.title = `${panelTitle(screen)} | ${baseTitle}`;
      document.getElementById(`${screen}-title`)?.focus({ preventScroll: true });
    }

    if (langLink) langLink.href = screen === 'menu' ? langLinkBase : `${langLinkBase}#${screen}`;
  }

  function show(screen: Screen) {
    // A newer navigation always wins over a swap still waiting under the wipe.
    window.clearTimeout(swapTimer);
    window.clearTimeout(wipeTimer);
    pending = null;

    if (screen === current) {
      wipe?.classList.remove('is-wiping');
      return;
    }

    if (!wipe || reducedMotion.matches) {
      applyScreen(screen);
      return;
    }

    pending = screen;
    wipe.classList.remove('is-wiping');
    void wipe.offsetWidth;
    wipe.classList.add('is-wiping');
    swapTimer = window.setTimeout(() => {
      pending = null;
      applyScreen(screen);
    }, WIPE_COVERED_MS);
    wipeTimer = window.setTimeout(() => wipe.classList.remove('is-wiping'), WIPE_TOTAL_MS);
  }

  function goBack() {
    // history.back() is asynchronous; a second Back before it lands would leave the site.
    if (pending || backRequested) return;
    if (openedFromMenu) {
      openedFromMenu = false;
      backRequested = true;
      history.back();
      return;
    }
    history.pushState(null, '', location.pathname + location.search);
    show('menu');
  }

  function moveMenuFocus(step: 1 | -1) {
    const items = menuItems();
    const index = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next = index === -1 ? (step === 1 ? 0 : items.length - 1) : (index + step + items.length) % items.length;
    items[next]?.focus();
  }

  window.addEventListener('hashchange', () => {
    backRequested = false;
    show(screenFromHash(location.hash));
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target.closest('[data-back]')) {
      event.preventDefault();
      goBack();
      return;
    }
    const item = target.closest<HTMLAnchorElement>('[data-menu-item]');
    if (item?.hash && current === 'menu') openedFromMenu = true;
  });

  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    if (current === 'menu' && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
      event.preventDefault();
      moveMenuFocus(event.key === 'ArrowDown' ? 1 : -1);
    } else if (current !== 'menu' && event.key === 'Escape') {
      event.preventDefault();
      goBack();
    }
  });

  if (current !== 'menu') {
    document.title = `${panelTitle(current)} | ${baseTitle}`;
    if (langLink) langLink.href = `${langLinkBase}#${current}`;
  }
}
