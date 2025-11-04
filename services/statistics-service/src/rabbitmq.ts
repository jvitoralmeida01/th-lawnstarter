import * as amqp from "amqplib";
import { config } from "./config.js";
import { database } from "./database.js";
import type { QueryEvent } from "./types.js";

class RabbitMQConsumer {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    await this.close();

    const url = `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;

    try {
      this.connection = await amqp.connect(url);
      if (!this.connection) {
        throw new Error("Failed to establish RabbitMQ connection");
      }
      this.channel = await this.connection.createChannel();
      if (!this.channel) {
        throw new Error("Failed to create RabbitMQ channel");
      }

      await this.channel.assertQueue(config.rabbitmq.queue, {
        durable: true,
      });

      console.log("Connected to RabbitMQ");
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  async consumeMessages(): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call connect() first.");
    }

    const events: QueryEvent[] = [];
    const timeout = 5000;
    let consumerTag: string | null = null;

    return new Promise(async (resolve, reject) => {
      const cleanup = async () => {
        // Cancel the consumer if it's still active
        if (consumerTag && this.channel) {
          try {
            await this.channel.cancel(consumerTag);
          } catch (error) {
            console.warn("Error cancelling consumer:", error);
          }
        }
      };

      const finish = async () => {
        await cleanup();
        if (events.length > 0) {
          console.log(`Processing ${events.length} query events`);
          try {
            await database.insertQueryEventsBatch(events);
            console.log(`Successfully inserted ${events.length} events`);
          } catch (error) {
            console.error("Error inserting events:", error);
            reject(error);
            return;
          }
        } else {
          console.log("No events to process");
        }
        resolve();
      };

      const timeoutId = setTimeout(finish, timeout);

      try {
        // Register consumer and store the consumer tag
        if (!this.channel) {
          clearTimeout(timeoutId);
          reject(new Error("Channel was closed during consume setup"));
          return;
        }
        const consumeResult = await this.channel.consume(
          config.rabbitmq.queue,
          async (msg) => {
            if (msg) {
              try {
                const content = JSON.parse(msg.content.toString());

                // Validate message structure
                if (
                  content.path &&
                  content.route &&
                  typeof content.ms === "number"
                ) {
                  events.push({
                    path: content.path,
                    route: content.route,
                    ms: content.ms,
                    source: content.source || "starwars",
                    occurred_at: content.occurred_at,
                  });
                } else {
                  console.warn("Invalid message format:", content);
                }

                this.channel!.ack(msg);
              } catch (error) {
                console.error("Error processing message:", error);
                this.channel!.nack(msg, false, false); // Reject and don't requeue
              }
            }
          },
          { noAck: false }
        );

        // Store the consumer tag for cleanup
        consumerTag = consumeResult.consumerTag;
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
    } catch (error) {
      console.warn("Error closing RabbitMQ channel:", error);
    }

    try {
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
    } catch (error) {
      console.warn("Error closing RabbitMQ connection:", error);
    }
  }
}

export const rabbitMQConsumer = new RabbitMQConsumer();
