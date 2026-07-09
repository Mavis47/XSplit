import dotenv from "dotenv";

const result = dotenv.config();

console.log(result);

console.log("Broker:", process.env.KAFKA_BROKER);