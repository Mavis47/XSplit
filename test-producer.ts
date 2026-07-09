import "dotenv/config";
import { publishNotification } from "./lib/kafka/notification";

async function main() {
  await publishNotification({
    type: "expense_created",
    senderName: "Manish",
    description: "Pizza",
    recipients: [1],
  });

  console.log("Message sent!");
}

main()
  .catch(console.error)
  .finally(() => process.exit());