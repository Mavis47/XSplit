import { kafka } from "./kafka";

const producer = kafka.producer();

let connected = false;

export async function getProducer() {
  if (!connected) {
    await producer.connect();
    connected = true;
  }

  return producer;
}