import * as amqp from "amqplib";
import { config } from "../../config.js";
import type { EventPublisher } from "../../application/ports/EventPublisher.js";
import type { QueryEvent } from "../../domain/entities/queryEvent.js";

export class RabbitMQEventPublisher implements EventPublisher {
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  async connect(): Promise<void> {
    await this.close();

    const url = `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;

    // Retry until RabbitMQ is ready
    const maxRetries = 10;
    const baseDelay = 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
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
        return;
      } catch (error: any) {
        if (attempt === maxRetries) {
          console.error(
            "Failed to connect to RabbitMQ after",
            maxRetries,
            "attempts:",
            error
          );
          throw error;
        }
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(
          `RabbitMQ connection attempt ${attempt}/${maxRetries} failed, retrying in ${delay}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  async publish(event: QueryEvent): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not initialized. Call connect() first.");
    }

    try {
      const message = JSON.stringify({
        path: event.path,
        route: event.route,
        ms: event.ms,
        source: event.source || "starwars",
        occurred_at: event.occurred_at || new Date().toISOString(),
      });

      this.channel.sendToQueue(config.rabbitmq.queue, Buffer.from(message), {
        persistent: true,
      });
    } catch (error) {
      console.error("Error publishing event:", error);
      throw error;
    }
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
