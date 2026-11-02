// Screen + journey registry. Each screen is tied to its Figma frame (node id) so a sync can
// diff "what changed in Figma" against "what's built here". Source file: 4rXmmKuEkeFmzMeZzUdd95
export const FIGMA_FILE = '4rXmmKuEkeFmzMeZzUdd95';
export const figmaLink = (node) => `https://www.figma.com/design/${FIGMA_FILE}/Sports-Prototype?node-id=${node.replace(':', '-')}`;

// status: built | pending (placeholder rendered) | on-hold (excluded until links are sorted)
export const SCREENS = {
  home: { name: 'Homepage', node: '643:19158', status: 'built', journey: 'login-home' },
  login: { name: 'Login page - Email (default)', node: '640:39648', status: 'pending', journey: 'login-home' },
  loading: { name: 'Loading Screen', node: '638:21321', status: 'pending', journey: 'login-home' },
  fixtures: { name: 'Fixtures', node: '638:19155', status: 'built', journey: 'fixtures' },
  'fixtures-results': { name: 'Fixtures / Results', node: '638:19168', status: 'pending', journey: 'fixtures' },
  leagues: { name: 'Leagues', node: '638:19292', status: 'pending', journey: 'fixtures' },
  'pre-game-stats': { name: 'Fixtures / Pre-game Stats', node: '638:19234', status: 'pending', journey: 'fixtures' },
  'live-player': { name: 'Media/ Video Player', node: '638:20990', status: 'pending', journey: 'watch' },
  watch: { name: 'Watch / Live Channel / Channels / Free', node: '668:20509', status: 'pending', journey: 'watch' },
  community: { name: 'Community / Teams', node: '909:29756', status: 'pending', journey: 'community' },
  'live-rooms': { name: 'Live Show / Calendar', node: '763:42309', status: 'pending', journey: 'live-rooms' },
  fantasy: { name: 'Fantasy / Home', node: '638:19447', status: 'pending', journey: 'fantasy' },
  myspace: { name: 'My Space', node: '996:33722', status: 'pending', journey: 'my-space' },
  voting: { name: 'Votiong Campaign Detail Page', node: '1190:58703', status: 'pending', journey: 'voting' },
  predictions: { name: 'Predictions / Off Day', node: '638:19377', status: 'on-hold', journey: 'predictions' },
  notifications: { name: 'Notification', node: '1282:36974', status: 'pending', journey: 'general' },
  search: { name: 'Search', node: '1282:36986', status: 'pending', journey: 'general' },
};

// Journeys = the blue titled sections in Figma. `key` journeys (★ in Figma) are the default client set.
export const JOURNEYS = [
  { id: 'login-home', name: 'Login / Home', start: 'home', key: false, section: '638:19367' },
  { id: 'fixtures', name: 'Fixtures', start: 'fixtures', key: true, section: '638:19365' },
  { id: 'predictions', name: 'Predictions', start: 'predictions', key: true, section: '638:19375', onHold: true },
  { id: 'live-rooms', name: 'Live Rooms', start: 'live-rooms', key: true, section: '1470:37111' },
  { id: 'fantasy', name: 'Fantasy', start: 'fantasy', key: true, section: '638:19371' },
  { id: 'community', name: 'Community', start: 'community', key: true, section: '638:19373' },
  { id: 'watch', name: 'Watch', start: 'watch', key: false, section: '663:20470' },
  { id: 'my-space', name: 'My Space & Profile', start: 'myspace', key: false, section: '982:32719' },
  { id: 'voting', name: 'Voting', start: 'voting', key: false, section: '1190:58626' },
  { id: 'general', name: 'General Use', start: 'notifications', key: false, section: '674:28231' },
];

// Bottom app bar (Navigation/App-Bar). A tab hides when its journey is off (decision: hide + reflow).
export const TABS = [
  { id: 'home', icon: 'nav-home', screen: 'home', journey: 'login-home', always: true },
  { id: 'community', icon: 'nav-community', screen: 'community', journey: 'community' },
  { id: 'watch', icon: 'nav-watch', screen: 'watch', journey: 'watch' },
  { id: 'predictions', icon: 'nav-predictions', screen: 'predictions', journey: 'predictions' },
  { id: 'fantasy', icon: 'nav-fantasy', screen: 'fantasy', journey: 'fantasy' },
];

// BD-swappable image slots. `default` ships with the build; uploads override per client.
export const ASSET_SLOTS = [
  { id: 'club-crest', label: 'Club crest (header + match cards)', default: 'assets/brand/club-crest.png', size: '256×256 PNG, transparent' },
  { id: 'opponent-1', label: 'Opponent 1 logo', default: 'assets/logos/real-madrid.png', size: '256×256 PNG, transparent' },
  { id: 'opponent-2', label: 'Opponent 2 logo', default: 'assets/logos/palmeiras.png', size: '256×256 PNG, transparent' },
  { id: 'opponent-3', label: 'Opponent 3 logo', default: 'assets/logos/elche.png', size: '256×256 PNG, transparent' },
  { id: 'opponent-4', label: 'Opponent 4 logo', default: 'assets/logos/barcelona.png', size: '256×256 PNG, transparent' },
];

// BD-editable copy. Defaults mirror the Figma text (team/main lives in Figma as a string variable).
export const COPY_FIELDS = [
  { id: 'team.main', label: 'Club name', default: 'Real Betis' },
  { id: 'competition', label: 'Competition line', default: '2025-2026 LaLiga · {team} · Group Stage' },
  { id: 'opponent-1', label: 'Opponent 1', default: 'Real Madrid' },
  { id: 'opponent-2', label: 'Opponent 2', default: 'Palmeiras' },
  { id: 'opponent-3', label: 'Opponent 3', default: 'Elche' },
  { id: 'opponent-4', label: 'Opponent 4', default: 'Barcelona' },
];
