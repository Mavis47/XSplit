import { redis } from "./lib/redis/redis";

async function run() {

    await redis.set("hello", "world");

    const value = await redis.get("hello");

    console.log(value);

    process.exit();
}

run();