export function isSafeInternalPath(pathname) {
  if (typeof pathname !== "string") {
    return false;
  }

  if (!pathname.startsWith("/") || pathname.startsWith("//")) {
    return false;
  }

  if (pathname.includes("\\") || pathname.includes("\0")) {
    return false;
  }

  return true;
}

export function getSafeInternalPath(pathname, fallback = "/dashboard") {
  const safeFallback = isSafeInternalPath(fallback) ? fallback : "/";
  return isSafeInternalPath(pathname) ? pathname : safeFallback;
}
