import { getProducer } from "./producer";

export async function publishNotification(data: any) {

    const producer = await getProducer();

    await producer.send({

        topic: "notifications",

        messages: [
            {
                value: JSON.stringify(data),
            },
        ],

    });

}