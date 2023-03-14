import { PrismaClient } from "@prisma/client"
import "dotenv/config"
import express, { NextFunction, Request, Response } from "express"
import fs from "fs"
import https from "https"
import "reflect-metadata"
import { container } from "tsyringe"
import { getHTMLContent } from "./helpers/getHTMLContent"
import { ratingCreationHandler } from "./helpers/ratingCreationHandler"
import { startContainer } from "./infra/container"

startContainer().then(() => {
  const app = express()
  // Add headers before the routes are defined
  app.use(function (req: Request, res: Response, next: NextFunction) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", "*")

    // Request methods you wish to allow
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE, PROPFIND"
    )

    // Request headers you wish to allow
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,Content-Type,Accept"
    )

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", "true")

    // Pass to next layer of middleware
    next()
  })
  app.use(express.json())

  const options = {
    key: fs.readFileSync(
      "../../../etc/letsencrypt/live/alabarda.link/privkey.pem"
    ),
    cert: fs.readFileSync(
      "../../../etc/letsencrypt/live/alabarda.link/cert.pem"
    ),
  }

  const prisma: PrismaClient = container.resolve("PrismaClient")
  const ratingCreationHandlerInstance = new ratingCreationHandler(prisma)

  app.get("/", async (req: Request, res: Response) => {
    try {
      res.send("Hello, welcome to Arauta!")
    } catch (error: any) {
      res.send("There was an error. Sorry ):")
    }
  })

  app.propfind("/product-reviews", async (req: Request, res: Response) => {
    try {
      const data = req.body
      const store = await prisma.store.findFirst({
        where: {
          id: data.storeId,
        },
      })

      if (!data.productInfo) {
        console.log("undefined from: ", req.originalUrl)
      }

      if (data.storeId && store) {
        const newVisitsObject: any = store.visits
        if (!newVisitsObject[data.productInfo]) {
          newVisitsObject[data.productInfo] = 0
        }
        newVisitsObject[data.productInfo] += 1

        const visitUpdate = await prisma.store.update({
          where: {
            id: data.storeId,
          },
          data: {
            visits: newVisitsObject,
          },
        })

        console.log(
          `New visit on product: ${data.productInfo}, in store: ${
            store.name
          }. Count is: ${
            store.visits ? (store.visits as any)[data.productInfo] : ""
          }`
        )
      }

      const reviews = await prisma.review.findMany({
        where: {
          id: data.id,
          storeId: data.storeId,
          productInfo: data.productInfo,
          statusApproved: data.statusApproved,
          statusRejected: data.statusRejected,
          statusResponded: data.statusResponded,
          statusSent: data.statusSent,
          statusCreated: data.statusCreated,
        },
      })

      const htmlObjects = await getHTMLContent(reviews)

      const htmlObject = htmlObjects.htmlObject
      const starsHTMLObject = htmlObjects.starsHTMLObject
      res.send(
        JSON.stringify({
          reviews: reviews,
          htmlObject: htmlObject,
          starsHTMLObject: starsHTMLObject,
        })
      )
    } catch (error: any) {
      res.send(error.message)
    }
  })

  app.propfind("/store", async (req: Request, res: Response) => {
    try {
      const data = req.body

      const store = await prisma.store.findFirst({
        where: {
          name: data.name,
          siteUrl: data.siteUrl,
          phone: data.phone,
          id: data.id,
          plan: data.plan,
          lastPayment: data.lastPayment,
        },
        include: {
          reviews: data.reviews,
          users: data.users,
        },
      })

      res.send(JSON.stringify({ store }))
    } catch (error: any) {
      res.send(error.message)
    }
  })

  app.post("/handle-new-ratings", async (req: Request, res: Response) => {
    try {
      const response = await ratingCreationHandlerInstance.execute(req.body)

      res.send(JSON.stringify(response))
    } catch (error: any) {
      res.send([error.message, error])
    }
  })

  app.post("/product-reviews", async (req: Request, res: Response) => {
    try {
      const data = req.body
      const user = await prisma.user.findFirst({
        where: {
          idInStore: data.idInStore,
          storeId: data.storeId,
        },
      })
      if (!user) {
        await prisma.user.create({
          data,
        })
      }
      const newReview = await prisma.review.create({ data })
      res.send(JSON.stringify(newReview))
    } catch (error: any) {
      res.send(error.message)
    }
  })

  app.patch("/product-reviews", async (req: Request, res: Response) => {
    try {
      const data = req.body
      const newReview = await prisma.review.update({
        where: {
          id: data.id,
        },
        data,
      })
      res.send(JSON.stringify(newReview))
    } catch (error: any) {
      res.send(error.message)
    }
  })

  https
    .createServer(options, app)
    .listen(3000, () =>
      console.log(
        "Arauta v0.0.4 https server online on 3000 and using node version " +
          process.version
      )
    )
})
