import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_SESSION_COOKIE = "admin_session";
const ADMIN_LOGIN_PATH = "/admin/login";
const ADMIN_DASHBOARD_PATH = "/dashboard";
const SESSION_MAX_AGE = 60 * 60 * 12;

function getAdminConfig() {
  return {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    secret: process.env.ADMIN_SESSION_SECRET,
  };
}

export function isAdminAuthConfigured() {
  const { username, password, secret } = getAdminConfig();
  return Boolean(username && password && secret);
}

export function assertAdminAuthConfigured() {
  if (!isAdminAuthConfigured()) {
    throw new Error(
      "Faltan ADMIN_USERNAME, ADMIN_PASSWORD y ADMIN_SESSION_SECRET en las variables de entorno."
    );
  }
}

function buildSessionToken() {
  const { username, secret } = getAdminConfig();

  return createHash("sha256")
    .update(`${username}:${secret}`)
    .digest("hex");
}

export function validateAdminCredentials(username, password) {
  assertAdminAuthConfigured();

  const config = getAdminConfig();
  return username === config.username && password === config.password;
}

export function getAdminSessionCookieName() {
  return ADMIN_SESSION_COOKIE;
}

export function getAdminSessionMaxAge() {
  return SESSION_MAX_AGE;
}

export function createAdminSessionValue() {
  assertAdminAuthConfigured();
  return buildSessionToken();
}

export async function hasAdminSession() {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    return false;
  }

  const expected = Buffer.from(buildSessionToken());
  const actual = Buffer.from(sessionCookie);

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export async function requireAdminSession() {
  const authenticated = await hasAdminSession();

  if (!authenticated) {
    redirect(`${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(ADMIN_DASHBOARD_PATH)}`);
  }
}
