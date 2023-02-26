import { PrismaClient } from "@prisma/client"
import { container } from "tsyringe"

export const startContainer = async () => {
  container.registerInstance<PrismaClient>("PrismaClient", new PrismaClient())
}
