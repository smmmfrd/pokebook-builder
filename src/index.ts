import { PrismaClient } from "@prisma/client";
import { BotData } from "./bots";

const prisma = new PrismaClient();

await BotData(prisma);
