import { PrismaClient } from "@prisma/client";
import { BotData } from "./bots";
const startTime = performance.now();

const prisma = new PrismaClient();

await BotData(prisma);

const endTime = performance.now();

console.log(`Took ${endTime - startTime}ms`);
