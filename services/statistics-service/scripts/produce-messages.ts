import * as amqp from "amqplib";
import { config } from "../src/config.js";
import type { QueryEvent } from "../src/types.js";

async function produceMessages(messages: QueryEvent[]): Promise<void> {
  let connection: amqp.ChannelModel | null = null;
  let channel: amqp.Channel | null = null;

  try {
    const url = `amqp://${config.rabbitmq.user}:${config.rabbitmq.password}@${config.rabbitmq.host}:${config.rabbitmq.port}`;

    console.log("Connecting to RabbitMQ...");
    console.log(`  Host: ${config.rabbitmq.host}:${config.rabbitmq.port}`);
    connection = await amqp.connect(url);
    if (!connection) {
      throw new Error("Failed to establish RabbitMQ connection");
    }
    channel = await connection.createChannel();
    if (!channel) {
      throw new Error("Failed to create RabbitMQ channel");
    }

    // Assert queue exists
    await channel.assertQueue(config.rabbitmq.queue, {
      durable: true,
    });

    console.log(
      `\nProducing ${messages.length} message(s) to queue: ${config.rabbitmq.queue}`
    );

    // Send each message
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const messageBuffer = Buffer.from(JSON.stringify(message));

      const sent = channel.sendToQueue(config.rabbitmq.queue, messageBuffer, {
        persistent: true,
      });

      if (sent) {
        console.log(`✓ Message ${i + 1} sent:`, JSON.stringify(message));
      } else {
        console.error(`✗ Failed to send message ${i + 1}`);
      }
    }

    if (channel) {
      await channel.close();
    } else {
      console.error("❌ Channel not closed");
    }
    if (connection) {
      await connection.close();
    } else {
      console.error("❌ Connection not closed");
    }
    console.log("\nAll messages produced successfully");
  } catch (error) {
    console.error("Error producing messages:", error);
    process.exit(1);
  }
}

// Generate a random timestamp within the specified hour window (UTC)
function generateRandomTimestamp(startHour: number, endHour: number): string {
  const now = new Date();
  // Use UTC methods to avoid timezone issues
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      startHour,
      0,
      0,
      0
    )
  );
  const endDate = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      endHour,
      59,
      59,
      999
    )
  );

  // Generate random timestamp between start and end
  const randomTime =
    today.getTime() + Math.random() * (endDate.getTime() - today.getTime());

  return new Date(randomTime).toISOString();
}

// Generate a random query event
function generateRandomQueryEvent(
  startHour: number,
  endHour: number
): QueryEvent {
  const routes = [
    { path: "/api/people", route: "GET /api/people", msRange: [100, 300] },
    {
      path: "/api/people/1",
      route: "GET /api/people/:id",
      msRange: [80, 200],
    },
    {
      path: "/api/people/2",
      route: "GET /api/people/:id",
      msRange: [80, 200],
    },
    {
      path: "/api/planets",
      route: "GET /api/planets",
      msRange: [120, 250],
    },
    {
      path: "/api/planets/3",
      route: "GET /api/planets/:id",
      msRange: [100, 180],
    },
    { path: "/api/films", route: "GET /api/films", msRange: [150, 300] },
    {
      path: "/api/starships",
      route: "GET /api/starships",
      msRange: [200, 400],
    },
    {
      path: "/api/starships/5",
      route: "GET /api/starships/:id",
      msRange: [180, 350],
    },
  ];

  const randomRoute = routes[Math.floor(Math.random() * routes.length)];
  const ms =
    randomRoute.msRange[0] +
    Math.floor(
      Math.random() * (randomRoute.msRange[1] - randomRoute.msRange[0])
    );

  return {
    path: randomRoute.path,
    route: randomRoute.route,
    ms: ms,
    source: "starwars",
    occurred_at: generateRandomTimestamp(startHour, endHour),
  };
}

// Parse command line arguments or use sample messages
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  let messages: QueryEvent[];

  if (args.length === 2) {
    // New format: count and hour window
    const count = parseInt(args[0], 10);
    const hourWindow = args[1];

    if (isNaN(count) || count <= 0) {
      console.error("Error: First argument must be a positive number");
      console.log("\nUsage examples:");
      console.log(
        "  npm run produce 25 12:17  # Produce 25 messages between 12:00 and 17:00"
      );
      console.log("  npm run produce  # Uses sample messages");
      process.exit(1);
    }

    // Parse hour window (format: "12:17" means hours 12 to 17)
    const hourMatch = hourWindow.match(/^(\d{1,2}):(\d{1,2})$/);
    if (!hourMatch) {
      console.error(
        'Error: Hour window must be in format "HH:HH" (e.g., "12:17")'
      );
      console.log("\nUsage examples:");
      console.log(
        "  npm run produce 25 12:17  # Produce 25 messages between 12:00 and 17:00"
      );
      console.log("  npm run produce  # Uses sample messages");
      process.exit(1);
    }

    const startHour = parseInt(hourMatch[1], 10);
    const endHour = parseInt(hourMatch[2], 10);

    if (
      startHour < 0 ||
      startHour > 23 ||
      endHour < 0 ||
      endHour > 23 ||
      startHour >= endHour
    ) {
      console.error(
        "Error: Hours must be between 0-23 and start hour must be less than end hour"
      );
      process.exit(1);
    }

    console.log(
      `Generating ${count} messages with random timestamps between ${startHour}:00 and ${endHour}:59...`
    );

    messages = Array.from({ length: count }, () =>
      generateRandomQueryEvent(startHour, endHour)
    );
  } else if (args.length > 0) {
    // Try to parse JSON from command line (legacy support)
    try {
      const jsonInput = args.join(" ");
      messages = JSON.parse(jsonInput);
      if (!Array.isArray(messages)) {
        messages = [messages];
      }
    } catch (error) {
      console.error("Error parsing JSON input:", error);
      console.log("\nUsage examples:");
      console.log(
        "  npm run produce 25 12:17  # Produce 25 messages between 12:00 and 17:00"
      );
      console.log(
        '  npm run produce \'[{"path":"/api/people/1","route":"GET /api/people/:id","ms":150,"source":"starwars"}]\''
      );
      console.log("  npm run produce  # Uses sample messages");
      process.exit(1);
    }
  } else {
    // Default sample messages
    messages = [
      {
        path: "/api/people/1",
        route: "GET /api/people/:id",
        ms: 150,
        source: "starwars",
      },
      {
        path: "/api/people",
        route: "GET /api/people",
        ms: 200,
        source: "starwars",
      },
      {
        path: "/api/planets/3",
        route: "GET /api/planets/:id",
        ms: 120,
        source: "starwars",
      },
      {
        path: "/api/films",
        route: "GET /api/films",
        ms: 180,
        source: "starwars",
      },
      {
        path: "/api/starships/5",
        route: "GET /api/starships/:id",
        ms: 250,
        source: "starwars",
      },
    ];
    console.log("No arguments provided, using sample messages:");
  }

  await produceMessages(messages);
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
