const themeScript = `
(() => {
  const storageKey = 'creepjs-theme';
  // localStorage throws when site data is blocked; fall back to the OS theme.
  let stored = null;
  try {
    stored = localStorage.getItem(storageKey);
  } catch {}
  const theme =
    stored === 'light' || stored === 'dark'
      ? stored
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
