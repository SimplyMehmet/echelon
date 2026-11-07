// Stand-in for the echelon API. POST /__scenario/{normal|long-names|empty|error} switches the data.
import { createServer } from 'node:http';

let scenario = 'normal';

const names = {
  normal: [
    'ShadowKing',
    'xX_Reaper_Xx',
    'Mehmet',
    'Nova',
    'BlazeRunner',
    'Ghost',
    'Viper99',
    'Kaito',
    'Luna',
    'Rook',
  ],
  'long-names': [
    'ThisIsAnExtremelyLongPlayerNameWithoutAnySpacesAtAll_2026',
    'A Very Long Player Name With Many Separate Words In It',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'Nova',
    'Ghost',
  ],
};
const teamNames = ['Red Dragons', 'Blue Wolves', 'Team Levels', 'Night Owls'];

const players = () =>
  (names[scenario] ?? []).map((name, i) => ({
    id: `p${i}`,
    name,
    attended: 20 - i,
    scoreTotal: 2400 - i * 137,
    // Tied scores on purpose: each player must still get their own row.
    scoreCurrent: 900 - (i - (i % 2)) * 61,
    team: i % 3 === 2 ? null : teamNames[i % 4],
  }));

const teams = () =>
  scenario === 'empty'
    ? []
    : teamNames.map((name, i) => ({ id: `t${i}`, name, score: 5000 - i * 811 }));

const year = new Date().getFullYear();
const event = (season, i, startYear) => ({
  id: `${season}e${i}`,
  name:
    scenario === 'long-names'
      ? 'Levels Gaming Grand Championship Finals Invitational 2026 Edition'
      : `Levels Battle #${i + 1}`,
  location: 'Amsterdam',
  entrants: 16 + i * 8,
  startsAt: `${startYear}-0${i + 1}-15T19:30:00Z`,
});

const seasons = () =>
  scenario === 'empty'
    ? []
    : [
        {
          id: 's1',
          name: 'Season 1',
          currentSeason: false,
          events: [0, 1, 2].map((i) => event('s1', i, year - 1)),
        },
        // Two past events and three future ones, so upcoming-first sorting has something to do.
        {
          id: 's2',
          name: 'Season 2',
          currentSeason: true,
          events: [
            event('s2', 0, year - 1),
            event('s2', 1, year + 1),
            event('s2', 2, year - 1),
            event('s2', 3, year + 2),
            event('s2', 4, year + 1),
          ],
        },
      ];

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const change = req.url.match(/^\/__scenario\/([\w-]+)/);
  if (change) {
    scenario = change[1];
    return res.end('{}');
  }
  if (scenario === 'error') {
    res.statusCode = 500;
    return res.end('{}');
  }
  if (req.url.startsWith('/api/v1/player')) return res.end(JSON.stringify({ players: players() }));
  if (req.url.startsWith('/api/v1/team')) return res.end(JSON.stringify({ teams: teams() }));
  if (req.url.startsWith('/api/v1/season')) return res.end(JSON.stringify({ seasons: seasons() }));
  res.statusCode = 404;
  res.end('{}');
}).listen(8080);
