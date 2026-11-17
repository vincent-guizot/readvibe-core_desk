/**
 * Navigation Items & Route Paths
 */

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Explore & Search' },
  { href: '/vibe-matcher', label: 'AI Vibe Matcher' },
  { href: '/my-reading', label: 'My Reading' },
  { href: '/wishlist', label: 'Wishlist' },
];

export const FOOTER_SECTIONS = [
  {
    title: 'Explore',
    links: [
      { href: '/', label: 'Featured Books' },
      { href: '/search', label: 'Mood Explorer' },
      { href: '/vibe-matcher', label: 'AI Matcher' },
      { href: '/stats', label: 'Reading Stats' },
    ],
  },
  {
    title: 'Reader Space',
    links: [
      { href: '/my-reading', label: 'Ongoing Reads' },
      { href: '/wishlist', label: 'Smart Wishlist' },
      { href: '/finished-reads', label: 'Finished Journal' },
      { href: '/profile', label: 'Reader Profile' },
    ],
  },
  {
    title: 'Ecosystem',
    links: [
      { href: 'http://localhost:3360/api', label: 'VibeCore API', external: true },
      { href: 'http://localhost:3370', label: 'VibeDesk Staff Portal', external: true },
    ],
  },
];
