import * as amqp from "amqplib";
import { config } from "../../config.js";
import type { EventBrokerRepository } from "../../application/ports/EventBrokerRepository.js";
import type { QueryEvent } from "../../domain/entities/queryEvent.js";

export class RabbitMQEventBrokerRepository implements EventBrokerRepository {
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

  async consumeQueryEvents(
    onEventsBatch: (events: QueryEvent[]) => Promise<void>
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call connect() first.");
    }

    const events: QueryEvent[] = [];
    const timeout = 5000;
    let consumerTag: string | null = null;

    return new Promise(async (resolve, reject) => {
      const cleanup = async () => {
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
            await onEventsBatch(events);
            console.log(`Successfully processed ${events.length} events`);
          } catch (error) {
            console.error("Error processing events:", error);
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
                this.channel!.nack(msg, false, false);
              }
            }
          },
          { noAck: false }
        );

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
