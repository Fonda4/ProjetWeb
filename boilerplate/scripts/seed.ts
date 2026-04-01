import fs from 'fs';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';

const SALT_ROUNDS = 10;
const NOW = new Date().toISOString();
const HASHED_PASSWORD_ADMIN = bcrypt.hashSync('admin', SALT_ROUNDS); // clear: admin
const HASHED_PASSWORD_PLAYER = bcrypt.hashSync('player', SALT_ROUNDS); // clear: player
const HASHED_PASSWORD_TRAINER = bcrypt.hashSync('trainer', SALT_ROUNDS); // clear: trainer
const HASHED_PASSWORD_REF = bcrypt.hashSync('ref', SALT_ROUNDS); // clear: ref
const HASHED_PASSWORD_INACTIVE = bcrypt.hashSync('12345', SALT_ROUNDS); // clear: 12345

// --- Users (UserDBO format) ---
// ERole: admin | user | referee
const users = [
  {
    id: 1,
    email: 'admin@vinci.be',
    first_name: 'Admin',
    last_name: 'player',
    username: 'admin',
    password: HASHED_PASSWORD_ADMIN, // clear: admin
    role: 'admin',
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 2,
    email: 'player@vinci.be',
    first_name: 'player',
    last_name: 'player',
    username: 'player',
    password: HASHED_PASSWORD_PLAYER, // clear: player
    role: 'player',
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 3,
    email: 'bob@example.com',
    first_name: 'Bob',
    last_name: 'Jones',
    username: 'bob',
    password: HASHED_PASSWORD_PLAYER, // clear: player
    role: 'player',
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 4,
    email: 'trainer@vinci.be',
    first_name: 'trainer',
    last_name: 'trainer',
    username: 'trainer',
    password: HASHED_PASSWORD_TRAINER, // clear: trainer
    role: 'trainer',
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 5,
    email: 'trainer2@vinci.be',
    first_name: 'Alice',
    last_name: 'Trainer',
    username: 'alice',
    password: HASHED_PASSWORD_TRAINER, // clear: trainer
    role: 'trainer',
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 6,
    email: 'trainer3@vinci.be',
    first_name: 'Yassin',
    last_name: 'Trainer',
    username: 'yassin',
    password: HASHED_PASSWORD_TRAINER, // clear: trainer
    role: 'trainer',
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 7,
    email: 'ref@vinci.be',
    first_name: 'ref',
    last_name: 'ref',
    username: 'ref',
    password: HASHED_PASSWORD_REF, // clear: ref
    role: 'referee',
    status: 'active',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 7,
    email: 'inactive@example.com',
    first_name: 'Inactive',
    last_name: 'player',
    username: 'inactive',
    password: HASHED_PASSWORD_INACTIVE, // clear: 12345
    role: 'player',
    status: 'inactive',
    created_at: NOW,
    updated_at: NOW,
  },
];

// --- Teams (TeamDBO format) ---
// ESportType: FOOTBALL='football', BASKETBALL='basketball', TENNIS='tennis', VOLLEYBALL='volleyball', HANDBALL='handball'
const teams = [
  {
    id: 1,
    name: 'Football Club Bruxelles',
    description: 'A competitive football team',
    sport_type: 'football',
    players: [2, 3], // alice, bob
    trainer_id: 4, // trainer
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 2,
    name: 'Basket Club Bruxelles',
    description: 'A rising basketball team',
    sport_type: 'basketball',
    players: [4], // charlie
    trainer_id: 5, // alice
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 3,
    name: "Football Club Mons",
    description: "A not so competitive football team",
    sport_type: "football",
    players: [2, 3], // alice, bob
    trainer_id: 4, // trainer
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 4,
    name: 'Basket Club Mons',
    description: 'A rising basketball team',
    sport_type: 'basketball',
    players: [2, 3], // alice, bob
    trainer_id: 4, // trainer
    created_at: NOW,
    updated_at: NOW,
  },
];

// --- Games (GameDBO format) ---
// EGameStatus: CREATED | SCHEDULED | STARTED | FINISHED | CANCELLED
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const games = [
  {
    id: 2,
    name: 'Football Game',
    status: 'SCHEDULED',
    home_team_id: 1,
    away_team_id: 3,
    home_score: 0,
    away_score: 0,
    referee_id: 5,
    fieldId: 1,
    scheduled_date: new Date(Date.now() + ONE_WEEK_MS).toISOString(),
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 1,
    name: 'Basketball Game',
    status: 'FINISHED',
    home_team_id: 2,
    away_team_id: 4,
    home_score: 3,
    away_score: 1,
    referee_id: 5,
    fieldId: 2,
    scheduled_date: new Date(Date.now() - ONE_WEEK_MS).toISOString(),
    created_at: NOW,
    updated_at: NOW,
  },
];

// --- Fields (FieldDBO format) ---
const fields = [
  {
    id: 1,
    name: 'Nice Field',
    location: 'Belgium',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 2,
    name: 'Not so nice Field',
    location: 'Belgium',
    created_at: NOW,
    updated_at: NOW,
  },
  {
    id: 3,
    name: 'Le Terrain Français',
    location: 'France',
    created_at: NOW,
    updated_at: NOW,
  },
];

export function seed(): void {
  // if data folder does not exist, create it
  if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
  }

  const teamsById = new Map<number, (typeof teams)[number]>();
  for (const team of teams) {
    teamsById.set(team.id, team);
  }

  for (const game of games) {
    const homeTeam = teamsById.get(game.home_team_id);
    const awayTeam = teamsById.get(game.away_team_id);

    if (!homeTeam || !awayTeam) {
      throw new Error(
        `Invalid seed game (id=${game.id}): unknown team id (home_team_id=${game.home_team_id}, away_team_id=${game.away_team_id})`
      );
    }

    if (homeTeam.sport_type !== awayTeam.sport_type) {
      throw new Error(
        `Invalid seed game (id=${game.id}): teams must share the same sport (home=${homeTeam.sport_type}, away=${awayTeam.sport_type})`
      );
    }
  }
  // create the files if not existing
  fs.writeFileSync('data/users.json', JSON.stringify(users, null, 2), 'utf-8');
  console.log(`Seeded: data/users.json (${users.length} users)`);

  fs.writeFileSync('data/teams.json', JSON.stringify(teams, null, 2), 'utf-8');
  console.log(`Seeded: data/teams.json (${teams.length} teams)`);

  fs.writeFileSync('data/games.json', JSON.stringify(games, null, 2), 'utf-8');
  console.log(`Seeded: data/games.json (${games.length} games)`);

  fs.writeFileSync('data/fields.json', JSON.stringify(fields, null, 2), 'utf-8');
  console.log(`Seeded: data/fields.json (${fields.length} fields)`);

  console.log('Done. Demo data is ready.');
  console.log('');
  console.log('Credentials:');
  console.log('  admin   / admin   (role: admin)');
  console.log('  player  / player  (role: player)');
  console.log('  trainer / trainer (role: trainer)');
  console.log('  ref     / ref     (role: referee)');
}

// Run only when this file is executed directly (not when imported)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed();
}
