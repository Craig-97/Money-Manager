/*
 * A payment's or account's logo, typed into its Logo box as a website (netflix.com) or a link to an
 * image. A website is saved as Google's icon for it, so the API only ever keeps a link.
 */

const SITE_ICON = 'https://www.google.com/s2/favicons';
// The API's limit
const MAX_LENGTH = 2048;
const SITE = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

export type LogoInput =
  | { kind: 'none' }
  | { kind: 'site'; site: string; iconUrl: string }
  | { kind: 'image'; iconUrl: string }
  // Neither a website nor an https link, so it can't be saved
  | { kind: 'invalid' };

const siteLogo = (site: string): LogoInput => {
  const bare = site.toLowerCase().replace(/^www\./, '');
  return { kind: 'site', site: bare, iconUrl: `${SITE_ICON}?sz=128&domain=${bare}` };
};

/* What's in the box: nothing, a website, an image's link, or something that can't be used */
export const readLogoInput = (text: string): LogoInput => {
  const value = text.trim();
  if (!value) return { kind: 'none' };
  if (value.length > MAX_LENGTH) return { kind: 'invalid' };
  const site = value.replace(/\/$/, '');
  if (SITE.test(site)) return siteLogo(site);
  if (!URL.canParse(value)) return { kind: 'invalid' };
  const url = new URL(value);
  if (url.protocol !== 'https:') return { kind: 'invalid' };
  // A site's own address rather than an image, so its icon
  return url.pathname === '/' && !url.search
    ? siteLogo(url.hostname)
    : { kind: 'image', iconUrl: value };
};

// Why the box can't be saved
export const LOGO_INVALID = 'Type a website, or a link that starts https://';

/* The link to save and show: null for none, or when it can't be used */
export const logoIconUrl = (logo: LogoInput) => ('iconUrl' in logo ? logo.iconUrl : null);

/* What the box shows for a saved logo: the website for a site's icon, otherwise the link */
export const logoInputOf = (iconUrl: string | null) => {
  if (!iconUrl) return '';
  const url = URL.canParse(iconUrl) ? new URL(iconUrl) : null;
  return (
    (url && `${url.origin}${url.pathname}` === SITE_ICON && url.searchParams.get('domain')) ||
    iconUrl
  );
};

/* The logo in More options' line: "logo from netflix.com", "logo from a link" */
export const logoSummary = (logo: LogoInput) =>
  logo.kind === 'site'
    ? `logo from ${logo.site}`
    : logo.kind === 'image'
      ? 'logo from a link'
      : null;
