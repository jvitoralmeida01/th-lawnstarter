// This script is purely for testing purposes !!

import * as amqp from "amqplib";
import { config } from "../src/config.js";

const routes = [
  "/people/1",
  "/people/2",
  "/people/3",
  "/films/1",
  "/films/2",
  "/search?q=luke",
  "/search?q=vader",
  "/search?q=leia",
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateTimestamp(startHour: number, endHour: number): string {
  const now = new Date();
  const hour = randomInt(startHour, endHour);
  const minute = randomInt(0, 59);
  const second = randomInt(0, 59);

  const timestamp = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    second
  );

  return timestamp.toISOString();
}

async function produceMessages(
  count: number,
  startHour: number,
  endHour: number
): Promise<void> {
  const url = `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;

  let connection: amqp.ChannelModel | null = null;
  let channel: amqp.Channel | null = null;

  try {
    connection = await amqp.connect(url);
    if (!connection) {
      throw new Error("Failed to establish RabbitMQ connection");
    }

    channel = await connection.createChannel();
    if (!channel) {
      throw new Error("Failed to create RabbitMQ channel");
    }

    await channel.assertQueue(config.rabbitmq.queue, {
      durable: true,
    });

    console.log(`Producing ${count} messages...`);

    for (let i = 0; i < count; i++) {
      const route = randomElement(routes);
      const path = route.split("?")[0];
      const ms = randomInt(50, 500);
      const occurred_at = generateTimestamp(startHour, endHour);

      const message = {
        path,
        route,
        ms,
        source: "starwars",
        occurred_at,
      };

      channel.sendToQueue(
        config.rabbitmq.queue,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
        }
      );
    }

    console.log(
      `Successfully produced ${count} messages between ${startHour}:00 and ${endHour}:59`
    );
  } catch (error) {
    console.error("Error producing messages:", error);
    throw error;
  } finally {
    if (channel) {
      await channel.close();
    }
    if (connection) {
      await connection.close();
    }
  }
}

const args = process.argv.slice(2);

if (args.length < 2) {
  console.error("Usage: tsx produce-messages.ts <count> <startHour:endHour>");
  console.error("Example: tsx produce-messages.ts 25 12:17");
  process.exit(1);
}

const count = parseInt(args[0], 10);
const timeRange = args[1].split(":");

if (isNaN(count) || count <= 0) {
  console.error("Error: count must be a positive number");
  process.exit(1);
}

if (timeRange.length !== 2) {
  console.error("Error: time range must be in format HH:HH (e.g., 12:17)");
  process.exit(1);
}

const startHour = parseInt(timeRange[0], 10);
const endHour = parseInt(timeRange[1], 10);

if (
  isNaN(startHour) ||
  isNaN(endHour) ||
  startHour < 0 ||
  startHour > 23 ||
  endHour < 0 ||
  endHour > 23
) {
  console.error("Error: hours must be between 0 and 23");
  process.exit(1);
}

if (startHour > endHour) {
  console.error("Error: start hour must be less than or equal to end hour");
  process.exit(1);
}

produceMessages(count, startHour, endHour)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to produce messages:", error);
    process.exit(1);
  });
