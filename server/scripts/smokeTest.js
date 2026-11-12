import 'dotenv/config';
import pool from '../db/pool.js';

const BASE = `http://localhost:${process.env.PORT || 5001}/api`;
let passed = 0;
let failed = 0;

async function call(method, path, { body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data };
}

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}`);
  }
}

const stamp = Date.now();
const user = {
  firstName: 'Smoke',
  lastName: 'Test',
  username: `smoke${stamp}`,
  email: `smoke.${stamp}@example.com`,
  password: 'abcdef1!',
};

try {
  console.log('Health');
  let r = await call('GET', '/health');
  check('GET /health returns 200 and status ok', r.status === 200 && r.data.status === 'ok');
  r = await call('GET', '/does-not-exist');
  check('Unknown route returns 404 JSON', r.status === 404 && r.data.message === 'Route not found');

  console.log('Genres');
  r = await call('GET', '/genres');
  const featured = (r.data?.genres || []).filter((g) => g.featured);
  check('GET /genres returns 12 featured genres', r.status === 200 && featured.length === 12);
  const genreIds = featured.slice(0, 3).map((g) => g.id);

  console.log('Register');
  r = await call('POST', '/auth/register', { body: { ...user, password: 'abc' } });
  check('Weak password returns 400', r.status === 400 && Boolean(r.data.errors?.password));
  r = await call('POST', '/auth/register', { body: { ...user, genreIds: [99999] } });
  check('Invalid genre id returns 400', r.status === 400 && Boolean(r.data.errors?.genreIds));
  r = await call('POST', '/auth/register', { body: { ...user, genreIds } });
  check('Valid register returns 201', r.status === 201);
  check('Register response has no password data', !JSON.stringify(r.data).includes('password'));
  check('Register response has the chosen genres', r.data?.user?.genres?.length === 3);
  r = await call('POST', '/auth/register', { body: { ...user, username: `other${stamp}` } });
  check('Duplicate email returns 409', r.status === 409 && Boolean(r.data.errors?.email));
  r = await call('POST', '/auth/register', {
    body: { ...user, email: `other.${stamp}@example.com` },
  });
  check('Duplicate username returns 409', r.status === 409 && Boolean(r.data.errors?.username));
  r = await call('POST', '/auth/register', { body: '{"email": ' });
  check('Broken JSON returns 400', r.status === 400 && r.data.message === 'Invalid JSON in request body');

  console.log('Login');
  r = await call('POST', '/auth/login', { body: { email: user.email, password: 'wrong1!x' } });
  const wrongPasswordMessage = r.data?.message;
  check('Wrong password returns 401', r.status === 401);
  r = await call('POST', '/auth/login', { body: { email: `nobody.${stamp}@example.com`, password: 'abcdef1!' } });
  check('Unknown email returns the same 401 message', r.status === 401 && r.data?.message === wrongPasswordMessage);
  r = await call('POST', '/auth/login', { body: { email: user.email.toUpperCase(), password: user.password } });
  check('Login works with an uppercase email', r.status === 200 && Boolean(r.data.token));
  const token = r.data?.token;
  check('Login response has no hash', !JSON.stringify(r.data).includes('password'));

  console.log('Me');
  r = await call('GET', '/auth/me');
  check('/me without token returns 401', r.status === 401);
  r = await call('GET', '/auth/me', { token: `${token}x` });
  check('/me with a modified token returns 401', r.status === 401);
  r = await call('GET', '/auth/me', { token });
  check('/me with a valid token returns 200', r.status === 200 && r.data.user.email === user.email.toLowerCase());
  check('/me returns the genres and no hash', r.data?.user?.genres?.length === 3 && !JSON.stringify(r.data).includes('password'));

  console.log('Titles');
  r = await call('GET', '/titles/movie/popular');
  check('Popular movies returns 20 results', r.status === 200 && r.data.results.length === 20);
  r = await call('GET', '/titles/tv/popular?page=2');
  check('Popular series page 2 returns 200', r.status === 200 && r.data.page === 2);
  r = await call('GET', '/titles/search?q=breaking bad');
  check(
    'Search returns only movies and series',
    r.status === 200 && r.data.results.every((x) => x.mediaType === 'movie' || x.mediaType === 'tv')
  );
  r = await call('GET', '/titles/search?q=');
  check('Empty search returns 400', r.status === 400 && Boolean(r.data.errors?.q));
  r = await call('GET', '/titles/movie/popular?page=501');
  check('Page 501 returns 400', r.status === 400);
  r=await call('GET','/titles/trending');
  check(
    'Trending returns only movies and series',
    r.status===200 && r.data.results.length>0 && r.data.results.every((x)=> x.mediaType==='movie' || x.mediaType==='tv')
  );
  r=await call('GET','/titles/trending?type=person');
  check('Invalid trending type returns 400',r.status===400 && Boolean(r.data.errors?.type));
  r = await call('GET', '/titles/movie/550');
  check('Movie details return runtime and genres', r.status === 200 && r.data.title.runtime > 0 && r.data.title.genres.length > 0);
  r = await call('GET', '/titles/tv/1396');
  check('Series details return seasons', r.status === 200 && r.data.title.numberOfSeasons > 0);
  r = await call('GET', '/titles/movie/99999999');
  check('Unknown title returns 404', r.status === 404 && r.data.message === 'Title not found');
  r = await call('GET', '/titles/book/550');
  check('Invalid type returns 400', r.status === 400 && Boolean(r.data.errors?.type));
} catch (err) {
  failed += 1;
  console.log('\nThe test run stopped with an error. Is the server running?');
  console.log(err.message);
} finally {
  await pool.query('DELETE FROM users WHERE email LIKE $1', [`%${stamp}@example.com`]);
  await pool.end();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exitCode = failed > 0 ? 1 : 0;
}