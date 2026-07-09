import dotenv from "dotenv";
dotenv.config();

import { Kafka } from "kafkajs";

console.log("cwd:", process.cwd());
console.log("Broker:", process.env.KAFKA_BROKER);

console.log("Broker:", process.env.KAFKA_BROKER);

export const kafka = new Kafka({
  clientId: "XSplit",
  brokers: [process.env.KAFKA_BROKER!],
});