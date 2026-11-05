// Screen + journey registry. Each screen is tied to its Figma frame (node id) so a sync can
// diff "what changed in Figma" against "what's built here". Source file: 4rXmmKuEkeFmzMeZzUdd95
export const FIGMA_FILE = '4rXmmKuEkeFmzMeZzUdd95';
export const figmaLink = (node) => `https://www.figma.com/design/${FIGMA_FILE}/Sports-Prototype?node-id=${node.replace(':', '-')}`;

// status: built | pending (placeholder rendered) | on-hold (excluded until links are sorted)
export const SCREENS = {
  home: { name: 'Homepage', node: '643:19158', status: 'built', journey: 'home' },
  login: { name: 'Login page - Email (default)', node: '640:39648', status: 'built', journey: 'login' },
  loading: { name: 'Loading Screen', node: '638:21321', status: 'built', journey: 'login' },
  fixtures: { name: 'Fixtures', node: '638:19155', status: 'built', journey: 'fixtures' },
  'fixtures-results': { name: 'Fixtures / Results', node: '638:19168', status: 'built', journey: 'fixtures' },
  leagues: { name: 'Leagues', node: '638:19292', status: 'built', journey: 'fixtures' },
  'post-game-stats': { name: 'Fixtures / Results / Post-game / Stats', node: '638:19181', status: 'built', journey: 'fixtures' },
  'live-stats': { name: 'Fixtures / Live stats', node: '638:19209', status: 'built', journey: 'fixtures' },
  'league-page': { name: 'League Page', node: '638:19307', status: 'built', journey: 'fixtures' },
  'team-page': { name: 'Team Page - Overview', node: '638:19317', status: 'built', journey: 'fixtures' },
  'pre-game-stats': { name: 'Fixtures / Pre-game Stats', node: '638:19234', status: 'built', journey: 'fixtures' },
  'player-stats': { name: 'Fixtures / Squads / Stats', node: '638:19330', status: 'built', journey: 'fixtures' },
  'live-player': { name: 'Media/ Video Player', node: '638:20990', status: 'built', journey: 'watch' },
  'video-player-h': { name: 'Media/ Video Player / Horizontal', node: '1309:76812', status: 'built', journey: 'watch' },
  watch: { name: 'Watch / Live Channel / Channels / Free', node: '668:20509', status: 'built', journey: 'watch' },
  'watch-plus': { name: 'Watch / Live Channel / Channels / BETIS+', node: '670:20846', status: 'built', journey: 'watch' },
  'watch-premium': { name: 'Watch / Live Channel / Channels / Premium', node: '674:23712', status: 'built', journey: 'watch' },
  'watch-playback': { name: 'Watch / Live Channel / Playback', node: '670:21345', status: 'built', journey: 'watch' },
  'watch-guide': { name: 'Watch / Live Channel / Guide', node: '670:22709', status: 'built', journey: 'watch' },
  'watch-upcoming': { name: 'Watch / Live Channel / Fixture / Upcoming', node: '674:24485', status: 'built', journey: 'watch' },
  'watch-results': { name: 'Watch / Live Channel / Fixture / Results', node: '674:25066', status: 'built', journey: 'watch' },
  'watch-leagues': { name: 'Watch / Live Channel / Fixture / Leagues', node: '674:25607', status: 'built', journey: 'watch' },
  'watch-og': { name: 'Watch / Betis OG', node: '674:26408', status: 'built', journey: 'watch' },
  'watch-betisplus': { name: 'Watch / BETIS+', node: '674:27334', status: 'built', journey: 'watch' },
  'watch-stats': { name: 'Watch / Stats (+ Squads 638:19084, Table 638:19092)', node: '638:19075', status: 'built', journey: 'watch' },
  community: { name: 'Community / Teams', node: '909:29756', status: 'built', journey: 'community' },
  'community-posts': { name: 'Community / Post (+ Published 638:19895)', node: '914:30563', status: 'built', journey: 'community' },
  'create-post': { name: 'Create Post (empty → filled → Publishing)', node: '638:19889', status: 'built', journey: 'community' },
  'community-fanclubs': { name: 'Community / Fan Clubs', node: '920:34930', status: 'built', journey: 'community' },
  fanclub: { name: 'Community / Fan Clubs / Watch + Posts + Missions', node: '967:33496', status: 'built', journey: 'community' },
  'live-rooms': { name: 'Live Show / Calendar', node: '763:42309', status: 'built', journey: 'live-rooms' },
  'live-programs': { name: 'Live Show / Program / Today + Future', node: '774:60610', status: 'built', journey: 'live-rooms' },
  'live-shows': { name: 'Live Show / Shows', node: '798:35439', status: 'built', journey: 'live-rooms' },
  fantasy: { name: 'Fantasy / Home', node: '638:19447', status: 'built', journey: 'fantasy' },
  'fantasy-pick': { name: 'Fantasy / Pick Team', node: '638:21146', status: 'built', journey: 'fantasy' },
  myspace: { name: 'My Space', node: '996:33722', status: 'built', journey: 'my-space' },
  'social-profile': { name: 'Profile', node: '1270:43788', status: 'built', journey: 'my-space' },
  avatar: { name: 'My Space / Play (empty)', node: '1033:51370', status: 'built', journey: 'my-space' },
  'avatar-create': { name: 'My Space / Play / Create', node: '1130:56343', status: 'built', journey: 'my-space' },
  'avatar-play': { name: 'My Space / Play', node: '1089:68602', status: 'built', journey: 'my-space' },
  'avatar-chat': { name: 'My Space / Play / Chat', node: '1252:160390', status: 'built', journey: 'my-space' },
  wallet: { name: 'Wallet / Token', node: '1228:65161', status: 'built', journey: 'my-space' },
  'wallet-recharged': { name: 'Wallet / Token / Recharged', node: '1247:42700', status: 'built', journey: 'my-space' },
  settings: { name: 'Settings', node: '1334:38890', status: 'built', journey: 'my-space' },
  membership: { name: 'Membership (Pick your plan) → Apple Pay 1182:58620', node: '1040:51806', status: 'built', journey: 'my-space' },
  'live-start': { name: 'Live - Start Room (empty 638:19766 → filled 638:19779)', node: '638:19766', status: 'built', journey: 'live-rooms' },
  'live-host': { name: 'Live - Start Room / host view', node: '638:19937', status: 'built', journey: 'live-rooms' },
  voting: { name: 'Votiong Campaign Detail Page', node: '1190:58703', status: 'built', journey: 'voting' },
  predictions: { name: 'Predictions / Off Day', node: '638:19377', status: 'built', journey: 'predictions' },
  'predictions-ranking': { name: 'Predictions / Ranking', node: '638:19441', status: 'built', journey: 'predictions' },
  // Teammate's flow inside Pre-game Stats (Predictions tab → ticket → success); the journey launcher opens it here.
  'match-predictions': { name: 'Fixtures / Pre-game Stats › Predictions', node: '638:19234', status: 'built', journey: 'predictions' },
  'live-room-list': { name: 'Home/ Full Liveroom List', node: '894:147765', status: 'built', journey: 'live-rooms' },
  'live-room': { name: 'Live / Default (Peña New York) + Gifts, Co-Host, Shop', node: '638:19792', status: 'built', journey: 'live-rooms', overlay: true },
  'watch-party': { name: 'Watch Party', node: '638:21603', status: 'built', journey: 'live-rooms', overlay: true },
  'challenge-room': { name: 'Live Room / Challenge Room', node: '795:42089', status: 'built', journey: 'live-rooms', overlay: true },
  'video-playlist': { name: 'Video Playlist', node: '901:149257', status: 'built', journey: 'watch' },
  'clips-list': { name: 'Clips', node: '894:148801', status: 'built', journey: 'watch' },
  'video-detail': { name: 'Video Detail Page', node: '638:20918', status: 'built', journey: 'watch' },
  clips: { name: 'Clips View / Unlike', node: '727:50937', status: 'built', journey: 'home', overlay: true },
  'clips-liked': { name: 'Clips View / Like', node: '727:51573', status: 'built', journey: 'home' },
  'photo-albums': { name: 'Photos', node: '905:195614', status: 'built', journey: 'home' },
  photos: { name: 'Photos / Unlike ⇄ Like 727:51029', node: '727:51061', status: 'built', journey: 'home' },
  candidate: { name: 'Candidate Detail Page (+ Voted 1195:59128)', node: '1195:59115', status: 'built', journey: 'voting' },
  notifications: { name: 'Notification', node: '1282:36974', status: 'built', journey: 'general' },
  search: { name: 'Search', node: '1282:36986', status: 'built', journey: 'general' },
};

// Journeys = the blue titled sections in Figma. `key` journeys (★ in Figma) are the default client set.
export const JOURNEYS = [
  // Login / Home is one Figma section, split in two so a demo can skip the launch + login screens.
  { id: 'login', name: 'Launch & Login', start: 'loading', key: false, section: '638:19367' },
  // Home is the hub every journey returns to (app-bar Home tab, Login's Log In), so its screens stay
  // reachable when switched off; off only removes it from the journey list.
  { id: 'home', name: 'Homepage', start: 'home', key: false, section: '638:19367', hub: true },
  { id: 'fixtures', name: 'Fixtures', start: 'fixtures', key: true, section: '638:19365' },
  { id: 'predictions', name: 'Predictions', start: 'predictions', key: true, section: '638:19375' },
  { id: 'live-rooms', name: 'Live Rooms', start: 'live-rooms', key: true, section: '1470:37111' },
  { id: 'fantasy', name: 'Fantasy', start: 'fantasy', key: true, section: '638:19371' },
  { id: 'community', name: 'Community', start: 'community', key: true, section: '638:19373' },
  { id: 'watch', name: 'Watch', start: 'watch', key: false, section: '663:20470' },
  { id: 'my-space', name: 'My Space & Profile', start: 'myspace', key: false, section: '982:32719' },
  { id: 'voting', name: 'Voting', start: 'voting', key: false, section: '1190:58626' },
  // Notifications and Search open from the header bell / search on every screen, so they stay reachable when off (hub).
  { id: 'general', name: 'General Use', start: 'notifications', key: false, section: '674:28231', hub: true },
];

// Bottom app bar (Navigation/App-Bar). A tab hides when its journey is off (decision: hide + reflow).
export const TABS = [
  { id: 'home', icon: 'nav-home', screen: 'home', journey: 'home', always: true },
  // Live Rooms and Community share this tab (Live Rooms | Communities pills); it opens Live Rooms first.
  { id: 'community', icon: 'nav-community', screen: 'live-rooms', journey: 'live-rooms', alt: { screen: 'community', journey: 'community' } },
  { id: 'watch', icon: 'nav-watch', screen: 'watch', journey: 'watch' },
  { id: 'predictions', icon: 'nav-predictions', screen: 'predictions', journey: 'predictions' },
  { id: 'fantasy', icon: 'nav-fantasy', screen: 'fantasy', journey: 'fantasy' },
];

// BD-swappable image slots, grouped as they appear in Configure › Images. `default` ships with the build;
// uploads override per client. Anything not listed here is demo content that a developer replaces in public/assets/.
export const ASSET_SLOTS = [
  { group: 'Brand', id: 'club-crest', label: 'Club crest (header, launch screen, match cards, posts)', default: 'assets/brand/club-crest.png', size: '256×256 PNG, transparent' },
  { group: 'Brand', id: 'login-logo', label: 'Login screen logo (empty = club crest)', default: 'assets/brand/club-crest.png', size: '144×144 SVG or PNG' },
  { group: 'Brand', id: 'club-avatar', label: 'Round club badge (Community teams, fan clubs, fan club page)', default: 'assets/community/club-av.webp', size: '176×176 JPG/PNG, square' },
  { group: 'Brand', id: 'stadium', label: 'Stadium banner (Fan Club page header)', default: 'assets/community/fc-banner.webp', size: '686×200 JPG' },
  { group: 'Home', id: 'home-banner-1', label: 'Home banner 1 (Who Wins Tonight?)', default: 'assets/home/banner-1.webp', size: '672×400 JPG/PNG' },
  { group: 'Home', id: 'home-banner-2', label: 'Home banner 2 (Post-match Interview)', default: 'assets/home/banner-2.webp', size: '672×400 JPG/PNG' },
  { group: 'Home', id: 'home-banner-3', label: 'Home banner 3 (Fan Derby)', default: 'assets/home/banner-1.webp', size: '672×400 JPG/PNG' },
  { group: 'Home', id: 'home-bottom-player', label: 'Home bottom banner player cut-out', default: 'assets/home/banner-bottom-player.webp', size: '262×350 PNG, transparent' },
  { group: 'Fixtures', id: 'opponent-1', label: 'Opponent 1 logo', default: 'assets/logos/real-madrid.png', size: '256×256 PNG, transparent' },
  { group: 'Fixtures', id: 'opponent-2', label: 'Opponent 2 logo', default: 'assets/logos/palmeiras.png', size: '256×256 PNG, transparent' },
  { group: 'Fixtures', id: 'opponent-3', label: 'Opponent 3 logo', default: 'assets/logos/elche.png', size: '256×256 PNG, transparent' },
  { group: 'Fixtures', id: 'opponent-4', label: 'Opponent 4 logo', default: 'assets/logos/barcelona.png', size: '256×256 PNG, transparent' },
  { group: 'Fixtures', id: 'player-cutout', label: 'Player page photo (Squads › player)', default: 'assets/fixtures/player/player-cutout.png', size: '340×356 PNG, transparent' },
  { group: 'Watch', id: 'watch-live', label: 'Watch: live channel still (mini player)', default: 'assets/watch/player.webp', size: '750×384 JPG' },
  { group: 'Community', id: 'star-1', label: 'Community › Monthly Star 1 photo', default: 'assets/community/isco.webp', size: '112×112 JPG/PNG, square' },
  { group: 'Community', id: 'star-2', label: 'Community › Monthly Star 2 photo', default: 'assets/community/antony.webp', size: '112×112 JPG/PNG, square' },
  { group: 'Community', id: 'star-3', label: 'Community › Monthly Star 3 photo', default: 'assets/community/cucho.webp', size: '112×112 JPG/PNG, square' },
  { group: 'Voting', id: 'candidate-photo', label: 'Voting: lead candidate photo (Home card, ranking, profile, pop-up)', default: 'assets/voting/sofia.webp', size: '750×906 JPG, portrait' },
  { group: 'My Space', id: 'user-avatar', label: 'My Space: profile photo (also Create Post)', default: 'assets/myspace/avatar.webp', size: '200×200 JPG/PNG' },
  { group: 'My Space', id: 'avatar-player', label: 'My Space › Play: avatar (default plays the looping video; an upload replaces it with your still)', default: 'assets/myspace/banner-player.webp', size: '640×960 PNG, transparent' },
];

// BD-editable copy, grouped as in Configure › Copy. Defaults mirror the Figma text. Placeholders:
// {team} club name · {full} full club name · {fans} fan name · {stadium} · {tags} hashtags.
export const COPY_FIELDS = [
  { group: 'Brand', id: 'team.main', label: 'Club name', default: 'Real Betis' },
  { group: 'Brand', id: 'team.full', label: 'Full club name (Community, Fan Club page)', default: 'Real Betis Balompié' },
  { group: 'Brand', id: 'team.second', label: 'Second team / B team', default: 'Betis Deportivo Balompié' },
  { group: 'Brand', id: 'team.fans', label: 'What fans are called (used in posts)', default: 'Béticos' },
  { group: 'Brand', id: 'stadium', label: 'Home stadium (used in posts)', default: 'Benito Villamarín' },
  { group: 'Brand', id: 'team.hashtags', label: 'Post hashtags', default: '#RealBetis #ManquePierda' },
  { group: 'Home', id: 'home.slogan', label: 'Home bottom banner slogan', default: 'Viva er Beti manqué pierda!' },
  { group: 'Home', id: 'home.match-1.opponent', label: 'Home Matches: first card opponent', default: 'Real Madrid' },
  { group: 'Home', id: 'home.match-2.opponent', label: 'Home Matches: second card opponent', default: 'Santos' },
  { group: 'Fixtures', id: 'competition', label: 'Competition line', default: '2025-2026 LaLiga · {team} · Group Stage' },
  { group: 'Fixtures', id: 'opponent-1', label: 'Opponent 1', default: 'Real Madrid' },
  { group: 'Fixtures', id: 'opponent-2', label: 'Opponent 2', default: 'Palmeiras' },
  { group: 'Fixtures', id: 'opponent-3', label: 'Opponent 3', default: 'Elche' },
  { group: 'Fixtures', id: 'opponent-4', label: 'Opponent 4', default: 'Barcelona' },
  { group: 'Fixtures', id: 'fixture.kickoff', label: 'Pre-game stats: kick-off', default: 'Fri 4 September, 14:00' },
  { group: 'Fixtures', id: 'fixture.league', label: 'Pre-game stats: competition', default: 'LaLiga' },
  { group: 'Fixtures', id: 'fixture.venue', label: 'Pre-game stats: venue', default: 'Estadio de La Cartuja, Seville' },
  { group: 'Fixtures', id: 'player.name', label: 'Player page: player name', default: 'Diego Llorente' },
  { group: 'Watch', id: 'watch.show', label: 'Watch: live show title', default: 'Betis Tonight' },
  { group: 'Watch', id: 'watch.channel', label: 'Watch: club TV channel', default: 'RTV Betis' },
  { group: 'Community', id: 'community.stars', label: 'Monthly Star names (comma-separated, 3)', default: 'Isco, Antony, Cucho' },
  { group: 'Community', id: 'fanclub.prefix', label: 'Fan club name prefix (e.g. "Peña Bética" de Madrid)', default: 'Peña Bética' },
  { group: 'Voting', id: 'home.voting.title', label: 'Voting campaign title', default: 'Concurso Musa do {team}' },
  { group: 'Voting', id: 'voting.candidate', label: 'Voting: lead candidate name', default: 'Sofía Reyes' },
  { group: 'My Space', id: 'user.name', label: 'My Space: username', default: 'sergio_torcedor95' },
  { group: 'My Space', id: 'membership.name', label: 'My Space: membership name', default: 'Betis Pass' },
];
