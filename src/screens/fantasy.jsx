// Fantasy (Figma 638:19447 Home, 638:21146 Pick Team, 638:21227, 638:19629).
// Written by a teammate straight into the published bundle (artifact 2026-11-03 17:48 UTC) and ported here unchanged:
// only the minified names were mapped back to the source modules below.
/* eslint-disable */
import * as React from 'react';
import * as l from 'react/jsx-runtime';
import { Header, AppBar, SectionTitle, Icon, useCopy, useSlot, asset, tx } from '../components/ui.jsx';
import { useNav } from '../proto/runtime.jsx';
import { resolveTokens } from '../tokens/theme.js';
import { ConceptCard } from './home.jsx';
import { PGS_blurDark, PGS_blurLight } from './pregame.jsx';

function Screen({ header, appbar, children, bg = 'var(--colour-surface-default)' }) {
  return l.jsxs('div', { className: 'p-screen', style: { background: bg }, children: [header, l.jsx('main', { className: 'p-main', children }), appbar] });
}

const PGF_h = (type, props, ...children) => {
      // theme text (tx) applied to text children at render
      const c = children.flat().filter((x) => x != null && x !== !1).map((x) => (typeof x === "string" ? tx(x) : x));
      return l.jsx(type, {
        ...(props || {}),
        children: c.length === 0 ? void 0 : c.length === 1 ? c[0] : c,
      });
    },
    PGF_a = (n) => asset("assets/fantasy/" + n),
    PGF_players = {
      gomez: [
        "G\xF3mez",
        "Valent\xEDn G\xF3mez",
        "main",
        "Defender",
        "betis",
        "IPS (H)",
        16,
      ],
      porro: [
        "Pedro Porro",
        "Pedro Porro",
        "Spurs",
        "Defender",
        "spurs",
        "NEW (H)",
        1,
      ],
      calafiori: [
        "Calafiori",
        "Riccardo Calafiori",
        "Arsenal",
        "Defender",
        "arsenal",
        "AVL (A)",
        9,
      ],
      maguire: [
        "Maguire",
        "Harry Maguire",
        "Man Utd",
        "Defender",
        "manutd",
        "IPS (H)",
        1,
      ],
      diop: [
        "Diop",
        "Issa Diop",
        "Ipswich",
        "Defender",
        "ipswich",
        "MUN (A)",
        0,
      ],
      rice: [
        "Rice",
        "Declan Rice",
        "Arsenal",
        "Midfielder",
        "arsenal",
        "AVL (A)",
        3,
      ],
      bruno: [
        "B.Fernandes",
        "Bruno Fernandes",
        "Man Utd",
        "Midfielder",
        "manutd",
        "IPS (H)",
        2,
      ],
      rogers: [
        "Rogers",
        "Morgan Rogers",
        "Chelsea",
        "Midfielder",
        "chelsea",
        "BHA (H)",
        8,
      ],
      joao: [
        "Joao Pedro",
        "Jo\xE3o Pedro",
        "Chelsea",
        "Forward",
        "chelsea",
        "BHA (H)",
        11,
      ],
      haaland: [
        "Haaland",
        "Erling Haaland",
        "Man City",
        "Forward",
        "mancity",
        "CRY (A)",
        4,
      ],
      thiago: [
        "Thiago",
        "Igor Thiago",
        "Brentford",
        "Forward",
        "brentford",
        "LEE (A)",
        9,
      ],
      steele: [
        "Steele",
        "Jason Steele",
        "Brighton",
        "Goalkeeper",
        "brighton-gk",
        "CHE (A)",
        0,
      ],
      steele2: [
        "Steele",
        "Jason Steele",
        "Brighton",
        "Goalkeeper",
        "brighton-gk",
        "CHE (A)",
        0,
      ],
      onien: [
        "O'Nien",
        "Luke O'Nien",
        "Sunderland",
        "Defender",
        "sunderland",
        "FUL (H)",
        0,
      ],
      hughes: [
        "Hughes",
        "Will Hughes",
        "Crystal Palace",
        "Midfielder",
        "palace",
        "MCI (H)",
        0,
      ],
      guiu: [
        "Marc Guiu",
        "Marc Guiu",
        "Chelsea",
        "Forward",
        "chelsea",
        "BHA (H)",
        0,
      ],
    };
  let PGF_pitch = [
      ["steele2"],
      ["porro", "gomez", "maguire", "diop"],
      ["rice", "bruno", "rogers"],
      ["joao", "haaland", "thiago"],
    ],
    PGF_bench = ["steele", "onien", "hughes", "guiu"],
    PGF_captain = "bruno",
    PGF_vice = "haaland",
    PGF_gw = 2;
  const PGF_lastSwap = [0, 0, 0, 0],
    PGF_benchLabels = ["GKP", "DEF", "MID", "FWD"],
    PGF_leagues = [
      {
        name: "Soothers League",
        teams: 18,
        rows: [
          ["Bayern Munched", "Cookie Monster", "lg-1", 67, "1,452"],
          ["Expected Toulouse", "Marta Ruiz", "lg-2", 61, "1,418"],
          ["Team Name", "John McGinn", "team", 54, "1,380", !0],
          ["Real Sosobad", "Pablo Herrera", "lg-4", 49, "1,341"],
          ["Kinder Bueno", "Luc\xEDa Navarro", "lg-5", 58, "1,307"],
        ],
      },
      {
        name: "Office League",
        teams: 12,
        rows: [
          ["Inter Muchachos", "Dani Ortega", "lg-3", 72, "1,503"],
          ["Hakuna Mattip", "Sara Molina", "lg-5", 45, "1,466"],
          ["Team Name", "John McGinn", "team", 54, "1,380", !0],
          ["Lord of the Ings", "Javi Castro", "lg-1", 63, "1,355"],
          ["Ctrl Alt Defeat", "Elena Prieto", "lg-4", 38, "1,298"],
        ],
      },
    ];
  function PGF_HomeScreen() {
    const nav = useNav();
    return PGF_h(
      Screen,
      {
        header: PGF_h(Header, { title: "Fantasy" }),
        appbar: PGF_h(AppBar, { active: "fantasy" }),
      },
      PGF_h(
        "div",
        { className: "p-fanhome" },
        PGF_h(
          "section",
          { className: "p-fanhero" },
          PGF_h("span", {
            className: "p-fanhero__fill",
            "aria-hidden": "true",
          }),
          PGF_h(
            "div",
            { className: "p-fanhero__glass" },
            PGF_h(
              "button",
              { className: "p-fanhero__team", onClick: () => nav.dead() },
              PGF_h("img", { src: PGF_a("team.webp"), alt: "" }),
              PGF_h(
                "span",
                { className: "p-fanhero__teamtext" },
                PGF_h("b", null, "Team Name"),
                PGF_h("span", null, "John McGinn"),
              ),
              PGF_h(Icon, { name: "chevron-right", size: 24 }),
            ),
            PGF_h("i", { className: "p-fanhero__div" }),
            PGF_h(
              "div",
              { className: "p-fanhero__gw" },
              PGF_h("span", { className: "p-fanhero__label" }, "Gameweek 1"),
              PGF_h(
                "div",
                { className: "p-fanhero__pts" },
                PGF_h(
                  "span",
                  null,
                  PGF_h("b", null, "54"),
                  PGF_h("small", null, "Average"),
                ),
                PGF_h(
                  "span",
                  { className: "is-main" },
                  PGF_h("b", null, "54"),
                  PGF_h("small", null, "Points"),
                ),
                PGF_h(
                  "span",
                  null,
                  PGF_h("b", null, "131"),
                  PGF_h("small", null, "Highest"),
                ),
              ),
            ),
            PGF_h("i", { className: "p-fanhero__div" }),
            PGF_h(
              "div",
              { className: "p-fanhero__gw" },
              PGF_h("span", { className: "p-fanhero__label" }, "Gameweek 2"),
              PGF_h(
                "b",
                { className: "p-fanhero__deadline" },
                "Deadline Friday 28 Aug at 10:30",
              ),
            ),
            PGF_h(
              "div",
              { className: "p-fanhero__ctas" },
              PGF_h(
                "button",
                {
                  className: "p-btn p-btn--primary p-fanhero__btn",
                  onClick: () => {
                    ((PGF_gw = 2), nav.go("fantasy-pick"));
                  },
                },
                PGF_h(Icon, {
                  name: "nav-fantasy",
                  size: 18,
                  color: "var(--colour-icon-on-primary)",
                }),
                PGF_h("span", null, "Pick Team"),
              ),
              PGF_h(
                "button",
                {
                  className: "p-btn p-fanhero__btn is-glass",
                  onClick: () => nav.dead(),
                },
                PGF_h(Icon, {
                  name: "chat-swap",
                  size: 18,
                  color: "var(--colour-icon-primary)",
                }),
                PGF_h("span", null, "Transfers"),
              ),
              PGF_h(
                "button",
                {
                  className: "p-btn p-fanhero__btn is-glass",
                  onClick: () => nav.dead(),
                },
                PGF_h(Icon, {
                  name: "sparkle",
                  size: 18,
                  color: "var(--colour-icon-primary)",
                }),
                PGF_h("span", null, "Gameweek Recap"),
              ),
            ),
          ),
        ),
        PGF_h(
          "section",
          null,
          PGF_h(SectionTitle, {
            title: "Leagues",
            action: "All",
            onAction: () => nav.dead(),
          }),
          PGF_h(
            "div",
            { className: "p-hscroll p-fanleagues" },
            PGF_leagues.map((lg) =>
              PGF_h(
                "div",
                { key: lg.name, className: "p-fanleague" },
                PGF_h(
                  "div",
                  { className: "p-fanleague__head" },
                  PGF_h("b", null, lg.name),
                  PGF_h("span", null, "GW"),
                  PGF_h("span", null, "Total"),
                ),
                lg.rows.map(([team, mgr, photo, gwPts, total, you], i) =>
                  PGF_h(
                    "div",
                    {
                      key: i,
                      className: "p-fanleague__row" + (you ? " is-you" : ""),
                      "aria-current": you ? "true" : void 0,
                    },
                    PGF_h("span", { className: "p-fanleague__pos" }, i + 1),
                    PGF_h("img", { src: PGF_a(photo + ".webp"), alt: "" }),
                    PGF_h(
                      "span",
                      { className: "p-fanleague__meta" },
                      PGF_h("b", null, team),
                      PGF_h("span", null, mgr),
                    ),
                    PGF_h("b", { className: "p-fanleague__gw" }, gwPts),
                    PGF_h("b", { className: "p-fanleague__total" }, total),
                  ),
                ),
                PGF_h(
                  "div",
                  { className: "p-fanleague__foot" },
                  PGF_h("span", null, lg.teams, " teams"),
                  PGF_h(
                    "button",
                    { onClick: () => nav.dead() },
                    "View League ",
                    PGF_h(Icon, { name: "chevron-right", size: 14 }),
                  ),
                ),
              ),
            ),
          ),
        ),
        PGF_h(
          "section",
          null,
          PGF_h(SectionTitle, {
            title: "News",
            action: "All",
            onAction: () => nav.go("video-playlist"),
          }),
          PGF_h(
            "div",
            { className: "p-hscroll", style: { gap: 10 } },
            [
              [
                "news-1",
                "Pre-Match Media Day",
                "Aug 17 2026 \u2022 Press Conference",
              ],
              ["news-2", "Tactical Talk", "Aug 17 2026 \u2022 Podcast"],
              [
                "news-1",
                "Pre-Match Media Day",
                "Aug 17 2026 \u2022 Press Conference",
              ],
            ].map(([p, t, s], i) =>
              PGF_h(ConceptCard, {
                key: i,
                photo: PGF_a(p + ".webp"),
                title: t,
                sub: s,
                more: !1,
                play: !0,
                onClick: () => nav.go("video-detail"),
              }),
            ),
          ),
        ),
      ),
    );
  }
  function PGF_Card({ id, gw, onPick, bench }) {
    const p = PGF_players[id];
    return PGF_h(
      "button",
      {
        className: "p-fancard" + (bench ? " is-bench" : ""),
        onClick: () => onPick(id),
        "aria-label":
          p[1] +
          (id === PGF_captain
            ? ", captain"
            : id === PGF_vice
              ? ", vice captain"
              : ""),
      },
      PGF_h("img", {
        className: "p-fancard__kit",
        src: PGF_a("kit-" + p[4] + ".webp"),
        alt: "",
      }),
      PGF_h(
        "span",
        { className: "p-fancard__label" },
        PGF_h("b", null, p[0]),
        PGF_h("span", null, gw === 1 ? p[6] : p[5]),
      ),
      (id === PGF_captain || id === PGF_vice) &&
        PGF_h(
          "span",
          { className: "p-fancard__badge" },
          id === PGF_captain ? "C" : "V",
        ),
    );
  }
  const PGF_chips = [
    ["Triple Captain", !0],
    ["Bench Boost", !1],
    ["Triple Captain", !1],
  ];
  function PGF_PickScreen() {
    const nav = useNav(),
      isLight = !!resolveTokens(nav.config.theme.mode, nav.config.theme.overrides)[
        "theme/light"
      ],
      [gw, setGwState] = React.useState(PGF_gw),
      setGw = (g) => {
        ((PGF_gw = g), setGwState(g));
      },
      [sel, setSel] = React.useState(null),
      [, bump] = React.useState(0),
      refresh = () => bump((n) => n + 1),
      where = (id) => {
        for (let r = 0; r < PGF_pitch.length; r++) {
          const i = PGF_pitch[r].indexOf(id);
          if (i >= 0) return { r, i, bench: !1 };
        }
        return { r: PGF_bench.indexOf(id), i: -1, bench: !0 };
      },
      substitute = (id) => {
        const w = where(id);
        if (w.bench) {
          const i = Math.min(PGF_lastSwap[w.r], PGF_pitch[w.r].length - 1),
            out = PGF_pitch[w.r][i];
          ((PGF_pitch[w.r][i] = id),
            (PGF_bench[w.r] = out),
            nav.notify(
              PGF_players[id][0] +
                " in, " +
                PGF_players[out][0] +
                " to the bench",
            ));
        } else {
          const inn = PGF_bench[w.r];
          ((PGF_bench[w.r] = id),
            (PGF_pitch[w.r][w.i] = inn),
            (PGF_lastSwap[w.r] = w.i),
            nav.notify(
              PGF_players[inn][0] +
                " in, " +
                PGF_players[id][0] +
                " to the bench",
            ));
        }
        setSel(null);
      },
      setRole = (id, role) => {
        (role === "captain" && PGF_captain !== id
          ? (PGF_vice === id && (PGF_vice = PGF_captain), (PGF_captain = id))
          : role === "vice" &&
            PGF_vice !== id &&
            (PGF_captain === id && (PGF_captain = PGF_vice), (PGF_vice = id)),
          refresh());
      };
    return PGF_h(
      Screen,
      {
        header: PGF_h(Header, { back: nav.canBack, title: "Pick Team" }),
        appbar: PGF_h(
          l.Fragment,
          null,
          PGF_h(
            "div",
            { className: "p-fanpick__glow", "aria-hidden": "true" },
            isLight
              ? PGF_h(
                  l.Fragment,
                  null,
                  PGF_h("img", {
                    className: "p-fanpick__net is-light",
                    src: asset("assets/fixtures/net.png"),
                    alt: "",
                  }),
                  PGF_h("span", {
                    className: "p-fanpick__blur is-light",
                    dangerouslySetInnerHTML: { __html: PGS_blurLight },
                  }),
                )
              : PGF_h(
                  l.Fragment,
                  null,
                  PGF_h("span", {
                    className: "p-fanpick__blur is-dark",
                    dangerouslySetInnerHTML: { __html: PGS_blurDark },
                  }),
                  PGF_h("img", {
                    className: "p-fanpick__net is-dark",
                    src: asset("assets/fixtures/net.png"),
                    alt: "",
                  }),
                ),
            PGF_h("span", { className: "p-fanpick__wash" }),
          ),
          sel &&
            PGF_h(PGF_PlayerSheet, {
              id: sel,
              gw,
              onClose: () => setSel(null),
              onRole: setRole,
              onSub: substitute,
              isBench: where(sel).bench,
            }),
        ),
      },
      PGF_h(
        "div",
        { className: "p-fanpick is-gw" + gw },
        PGF_h(
          "div",
          { className: "p-fanpick__top" },
          PGF_h(
            "div",
            { className: "p-fangw" },
            PGF_h(
              "button",
              {
                className: "p-fangw__arrow is-prev",
                "aria-label": "Previous gameweek",
                disabled: gw === 1,
                onClick: () => setGw(1),
              },
              PGF_h(Icon, { name: "chevron-right", size: 16 }),
            ),
            gw === 2
              ? PGF_h(
                  "span",
                  { className: "p-fangw__text" },
                  PGF_h("span", null, "Gameweek 2:"),
                  PGF_h("b", null, "Deadline Friday 28 Aug at 10:30"),
                )
              : PGF_h(
                  "span",
                  { className: "p-fangw__text" },
                  PGF_h("b", null, "Gameweek 1"),
                ),
            PGF_h(
              "button",
              {
                className: "p-fangw__arrow" + (gw === 2 ? " is-hidden" : ""),
                "aria-label": "Next gameweek",
                disabled: gw === 2,
                onClick: () => setGw(2),
              },
              PGF_h(Icon, { name: "chevron-right", size: 16 }),
            ),
          ),
          gw === 2
            ? PGF_h(
                "div",
                { className: "p-fanchips" },
                PGF_chips.map(([name, active], i) =>
                  PGF_h(
                    "button",
                    {
                      key: i,
                      className: "p-fanchip" + (active ? " is-active" : ""),
                      onClick: () =>
                        nav.notify(
                          active
                            ? name + " is active this gameweek"
                            : name + " is unavailable",
                        ),
                    },
                    PGF_h("span", null, name),
                    PGF_h("b", null, active ? "ACTIVE" : "UNAVAILABLE"),
                  ),
                ),
              )
            : PGF_h(
                "div",
                { className: "p-fanpts" },
                PGF_h(
                  "span",
                  null,
                  PGF_h("b", null, "54"),
                  PGF_h("small", null, "Average"),
                ),
                PGF_h(
                  "span",
                  { className: "is-main" },
                  PGF_h("b", null, "54"),
                  PGF_h("small", null, "Points"),
                ),
                PGF_h(
                  "span",
                  null,
                  PGF_h("b", null, "131"),
                  PGF_h("small", null, "Highest"),
                ),
              ),
        ),
        PGF_h(
          "div",
          { className: "p-fanpick__field" },
          PGF_h(
            "div",
            { className: "p-fanpitch" },
            PGF_h("img", {
              className: "p-fanpitch__bg",
              src: PGF_a("pitch.svg"),
              alt: "",
            }),
            PGF_h("img", {
              className: "p-fanpitch__net",
              src: PGF_a("goal-net.webp"),
              alt: "",
            }),
            PGF_h(
              "div",
              { className: "p-fanpitch__rows" },
              PGF_pitch.map((row, r) =>
                PGF_h(
                  "div",
                  { key: r, className: "p-fanpitch__row" },
                  row.map((id) =>
                    PGF_h(PGF_Card, { key: id, id, gw, onPick: setSel }),
                  ),
                ),
              ),
            ),
          ),
          PGF_h(
            "div",
            { className: "p-fanbench" },
            PGF_h(
              "div",
              { className: "p-fanbench__inner" },
              PGF_h("b", { className: "p-fanbench__title" }, "Bench"),
              PGF_h(
                "div",
                { className: "p-fanbench__row" },
                PGF_bench.map((id, r) =>
                  PGF_h(
                    "div",
                    { key: r, className: "p-fanbench__slot" },
                    PGF_h("span", null, PGF_benchLabels[r]),
                    PGF_h(PGF_Card, { id, gw, onPick: setSel, bench: !0 }),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
  const PGF_news = `Valent\xEDn G\xF3mez is shaping up to be one of the more reliable figures in Real Betis's backline as the club looks to improve on last season's league finish. After a strong preseason, including a confident performance in Betis's win over Almer\xEDa, G\xF3mez spoke about the squad's progress, saying the team "played a good match in all lines" and that the group is continuing to improve both individually and collectively heading into the campaign.`;
  function PGF_PlayerSheet({ id, gw, onClose, onRole, onSub, isBench }) {
    const nav = useNav(),
      p = PGF_players[id],
      main = p[2] === "main",
      club = main ? useCopy("team.main") : p[2],
      stats = [
        ["Price", "$12.0m", "1 of 269"],
        ["Pts/Match", "2.0", "87 of 269"],
        ["Form", "2.0", "87 of 269"],
        ["Selected", "49.0%", "1 of 269"],
      ],
      fixtures = [
        ["GW2", "crest-ips", "IPS (H)", "9/14"],
        ["GW3", "crest-eve", "EVE (A)", "9/20"],
        ["GW4", "crest-mci", "MCI (H)", "9/23"],
      ],
      check = (on, label, role) =>
        PGF_h(
          "button",
          {
            className: "p-fansheet__check",
            role: "checkbox",
            "aria-checked": on,
            onClick: () => onRole(id, role),
          },
          PGF_h(Icon, { name: on ? "checkbox-on" : "checkbox-off", size: 24 }),
          PGF_h("span", null, label),
        );
    return PGF_h(
      "div",
      {
        className: "p-sheet",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Player details",
      },
      PGF_h("button", {
        type: "button",
        className: "p-sheet__scrim",
        "aria-label": "Close player details",
        onClick: onClose,
      }),
      PGF_h(
        "div",
        { className: "p-sheet__panel p-fansheet" },
        PGF_h(
          "div",
          { className: "p-sheet__head" },
          PGF_h("h2", null, "Player Details"),
          PGF_h(
            "button",
            { type: "button", "aria-label": "Close", onClick: onClose },
            PGF_h(Icon, { name: "pgs-close", size: 20 }),
          ),
        ),
        PGF_h(
          "div",
          { className: "p-fansheet__body" },
          PGF_h(
            "div",
            { className: "p-fansheet__hero" },
            PGF_h(
              "span",
              { className: "p-fansheet__photo" },
              id === "gomez"
                ? PGF_h("img", {
                    className: "is-photo",
                    src: PGF_a("player-gomez.webp"),
                    alt: "",
                  })
                : PGF_h("img", {
                    className: "is-kit",
                    src: PGF_a("kit-" + p[4] + ".webp"),
                    alt: "",
                  }),
            ),
            PGF_h(
              "span",
              { className: "p-fansheet__who" },
              PGF_h("span", { className: "p-fansheet__pos" }, p[3]),
              PGF_h(
                "span",
                { className: "p-fansheet__names" },
                PGF_h("span", null, club),
                PGF_h("b", null, p[1]),
              ),
              PGF_h("span", { className: "p-fansheet__next" }, "Next: ", p[5]),
            ),
            main &&
              PGF_h("img", {
                className: "p-fansheet__mark",
                src: useSlot("club-crest"),
                alt: "",
              }),
          ),
          PGF_h(
            "div",
            { className: "p-fansheet__links" },
            PGF_h(
              "button",
              {
                className: "p-btn p-btn--secondary",
                onClick: () => nav.dead(),
              },
              PGF_h(Icon, {
                name: "share",
                size: 18,
                color: "var(--colour-icon-on-secondary)",
              }),
              PGF_h("span", null, "Player Profile"),
            ),
            PGF_h(
              "button",
              {
                className: "p-btn p-btn--secondary",
                onClick: () => nav.dead(),
              },
              PGF_h(Icon, {
                name: "share",
                size: 18,
                color: "var(--colour-icon-on-secondary)",
              }),
              PGF_h("span", null, "Purchase Shirt"),
            ),
          ),
          PGF_h(
            "button",
            { className: "p-fansheet__news", onClick: () => nav.dead() },
            PGF_h(
              "span",
              { className: "p-fansheet__newshead" },
              PGF_h("b", null, "Latest news"),
              PGF_h(Icon, { name: "chevron-right", size: 14 }),
            ),
            PGF_h(
              "span",
              { className: "p-fansheet__newstext" },
              id === "gomez" ? PGF_news : "No recent news for " + p[1] + ".",
            ),
          ),
          PGF_h(
            "div",
            { className: "p-fansheet__stats" },
            // was ([l, v, r]): the label shadowed the jsx-runtime import `l`, so l.Fragment was undefined (crash)
            stats.map(([label, v, r], i) =>
              PGF_h(
                l.Fragment,
                { key: label },
                i > 0 && PGF_h("i", null),
                PGF_h(
                  "span",
                  { className: "p-fansheet__stat" },
                  PGF_h("small", null, label),
                  PGF_h("b", null, v),
                  PGF_h("span", null, r),
                ),
              ),
            ),
          ),
          PGF_h(
            "div",
            { className: "p-fansheet__form" },
            PGF_h(
              "div",
              { className: "p-fansheet__col" },
              PGF_h("b", null, "Form"),
              PGF_h(
                "div",
                { className: "p-fansheet__gws" },
                PGF_h(
                  "span",
                  { className: "p-fansheet__gw" },
                  PGF_h("small", null, "GW1"),
                  PGF_h("img", { src: useSlot("club-crest"), alt: "" }),
                  PGF_h("span", null, "BET (A)"),
                  PGF_h("em", { className: "is-pts" }, p[6], " pts"),
                ),
              ),
            ),
            PGF_h(
              "div",
              { className: "p-fansheet__col" },
              PGF_h("b", null, "Fixtures"),
              PGF_h(
                "div",
                { className: "p-fansheet__gws" },
                fixtures.map(([g, crest, code, date]) =>
                  PGF_h(
                    "span",
                    { key: g, className: "p-fansheet__gw" },
                    PGF_h("small", null, g),
                    PGF_h("img", { src: PGF_a(crest + ".webp"), alt: "" }),
                    PGF_h("span", null, code),
                    PGF_h("em", null, date),
                  ),
                ),
              ),
            ),
          ),
          PGF_h(
            "div",
            { className: "p-fansheet__checks" },
            check(PGF_captain === id, "Captain", "captain"),
            check(PGF_vice === id, "Vice Captain", "vice"),
          ),
        ),
        PGF_h(
          "div",
          { className: "p-fansheet__ctas" },
          PGF_h(
            "button",
            { className: "p-btn p-btn--tertiary", onClick: () => nav.dead() },
            "Full Profile",
          ),
          PGF_h(
            "button",
            { className: "p-btn p-btn--primary", onClick: () => onSub(id) },
            isBench ? "Bring On" : "Substitute",
          ),
        ),
      ),
    );
  }

export { PGF_HomeScreen, PGF_PickScreen };
