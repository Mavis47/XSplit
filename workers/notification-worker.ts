import { kafka } from "../lib/kafka/kafka";
import { prisma } from "../app/lib/prisma";

const consumer = kafka.consumer({
    groupId: "notification-group",
});

async function run() {
    console.log("Connecting to Kafka...");

    await consumer.connect();

    console.log("Connected!");


    await consumer.subscribe({
        topic: "notifications",
    });

    console.log("Subscribed to notifications topic");

    await consumer.run({

        eachMessage: async ({ message }) => {
            try {
                if (!message.value) return;

                const data = JSON.parse(message.value.toString());

                switch (data.type) {

                    case "expense_created":

                        for (const userId of data.recipients) {

                            await prisma.notifications.create({
                                data: {
                                    userId,
                                    message: `${data.senderName} added "${data.description}"`,
                                    isRead: false,
                                },
                            });

                        }

                        break;

                    case "friend_request":

                        await prisma.notifications.create({
                            data: {
                                userId: data.receiverId,
                                message: `${data.senderName} sent you a friend request.`,
                                isRead: false,
                            },
                        });

                        break;

                    case "friend_request_accepted":

                        await prisma.notifications.create({
                            data: {
                                userId: data.senderId,
                                message: `${data.receiverName} accepted your friend request.`,
                                isRead: false,
                            },
                        });
                        break;
                }
            } catch (error) {
                console.error("Failed to process Kafka message:", error);
            }


        }
    });
}

run();