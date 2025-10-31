import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();
const REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN || process.env.REDIS_TOKEN;
const REDIS_URL = process.env.UPSTASH_REDIS_URL || process.env.REDIS_URL;

function normalizeHost(raw) {
  if (!raw) return null;
  // If raw looks like a full URL, parse and return hostname:port (if present)
  try {
    const u = new URL(raw);
    // If the provided value is already a redis(s) URL, return it (without trailing slash)
    if (u.protocol === "redis:" || u.protocol === "rediss:") {
      return raw.replace(/\/$/, "");
    }
    // Otherwise return host (hostname[:port])
    return u.host;
  } catch (e) {
    // Not a full URL — assume it's already a host or host:port string
    return raw;
  }
}

const host = normalizeHost(REDIS_URL);
let hostWithPort = host;
if (host && !host.includes(":")) {
  // default to 6379 if no port provided
  hostWithPort = `${host}:6379`;
}

if (!hostWithPort || !REDIS_TOKEN) {
  console.warn(
    "⚠️ Missing Redis configuration. UPSTASH_REDIS_URL (or REDIS_URL) or UPSTASH_REDIS_TOKEN (or REDIS_TOKEN) may be unset."
  );
}

const connectionUrl = hostWithPort && REDIS_TOKEN ? `rediss://default:${REDIS_TOKEN}@${hostWithPort}` : undefined;

const clientOptions = connectionUrl ? { url: connectionUrl } : {};

const redisClient = createClient(clientOptions);

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

// Only attempt to connect when we have a usable connection URL
if (connectionUrl) {
  await redisClient.connect();
} else {
  console.log("Skipping Redis connect due to missing connection URL");
}

export default redisClient;
