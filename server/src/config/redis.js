import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();
const REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN;
const REDIS_URL = process.env.UPSTASH_REDIS_URL;
console.log("Redis Client Initialized:", {REDIS_TOKEN, REDIS_URL});

const redisClient = createClient({
  url: `rediss://default:${REDIS_TOKEN}@${REDIS_URL}:6379`,
});

redisClient.on("error", (err) => {
  console.error("❌ Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("✅ Redis Connected");
});

await redisClient.connect();
await redisClient.disconnect();

export default redisClient;
