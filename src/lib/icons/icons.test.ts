import { describe, expect, it } from 'vitest';
import { logoIconUrl, logoInputOf, logoSummary, readLogoInput } from './icons';

const NETFLIX = 'https://www.google.com/s2/favicons?sz=128&domain=netflix.com';

describe('readLogoInput', () => {
  it('uses a website’s icon, however it’s typed', () => {
    for (const typed of ['netflix.com', ' Netflix.com ', 'www.netflix.com', 'netflix.com/']) {
      expect(readLogoInput(typed)).toEqual({ kind: 'site', site: 'netflix.com', iconUrl: NETFLIX });
    }
    expect(readLogoInput('https://www.netflix.com/')).toEqual({
      kind: 'site',
      site: 'netflix.com',
      iconUrl: NETFLIX
    });
    expect(readLogoInput('tsb.co.uk')).toMatchObject({ kind: 'site', site: 'tsb.co.uk' });
  });

  it('keeps a link to an image as it is', () => {
    const link = 'https://example.com/logos/netflix.png?v=2';
    expect(readLogoInput(link)).toEqual({ kind: 'image', iconUrl: link });
  });

  it('is nothing when blank, and can’t use anything else', () => {
    expect(readLogoInput('  ')).toEqual({ kind: 'none' });
    for (const typed of ['netflix', 'http://example.com/a.png', 'not a link', 'javascript:x']) {
      expect(readLogoInput(typed)).toEqual({ kind: 'invalid' });
    }
    expect(readLogoInput(`https://example.com/${'a'.repeat(2048)}`)).toEqual({ kind: 'invalid' });
  });
});

describe('logoIconUrl', () => {
  it('is the link to save, or null when there’s none or it can’t be used', () => {
    expect(logoIconUrl(readLogoInput('netflix.com'))).toBe(NETFLIX);
    expect(logoIconUrl(readLogoInput(''))).toBeNull();
    expect(logoIconUrl(readLogoInput('netflix'))).toBeNull();
  });
});

describe('logoInputOf', () => {
  it('shows a saved site icon as its website, and any other link as it is', () => {
    expect(logoInputOf(NETFLIX)).toBe('netflix.com');
    expect(logoInputOf('https://example.com/a.png')).toBe('https://example.com/a.png');
    expect(logoInputOf(null)).toBe('');
  });

  it('reads back what readLogoInput saves', () => {
    const saved = readLogoInput('trading212.com');
    expect(saved.kind === 'site' && logoInputOf(saved.iconUrl)).toBe('trading212.com');
  });
});

describe('logoSummary', () => {
  it('says where the logo comes from', () => {
    expect(logoSummary(readLogoInput('netflix.com'))).toBe('logo from netflix.com');
    expect(logoSummary(readLogoInput('https://example.com/a.png'))).toBe('logo from a link');
    expect(logoSummary(readLogoInput(''))).toBeNull();
  });
});
