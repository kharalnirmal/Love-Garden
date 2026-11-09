type OriginConfig = {
  appOrigin?: string;
  nodeEnv?: string;
  vercel?: string;
  vercelUrl?: string;
  vercelProductionUrl?: string;
};

function parseOrigin(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isAllowedBouquetOrigin(origin: string | null, requestUrl: string, config: OriginConfig): boolean {
  // Origin is a browser cross-site safeguard, not authentication. Never derive
  // production allowlists from Host or arbitrary forwarded request headers.
  if (!origin || parseOrigin(origin) !== origin) return false;
  const allowed = new Set<string>();
  const canonical = parseOrigin(config.appOrigin);
  if (canonical) allowed.add(canonical);
  if (config.nodeEnv === "development") {
    const developmentOrigin = parseOrigin(new URL(requestUrl).origin);
    if (developmentOrigin) allowed.add(developmentOrigin);
  }
  if (config.vercel === "1") {
    for (const host of [config.vercelUrl, config.vercelProductionUrl]) {
      const deploymentOrigin = host ? parseOrigin(`https://${host}`) : null;
      if (deploymentOrigin) allowed.add(deploymentOrigin);
    }
  }
  return allowed.has(origin);
}
