const { PrismaClient } = require("@prisma/client")
const express = require("express")
const https = require("https")
const fs = require("fs")
const { getHTMLContent } = require("./functions/getHTMLContent")
const {
  handleUncreatedReviewForms,
} = require("./functions/handleUncreatedReviewForms")

const app = express()

// Add headers before the routes are defined
app.use(function (req, res, next) {
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
  cert: fs.readFileSync("../../../etc/letsencrypt/live/alabarda.link/cert.pem"),
}

const prisma = new PrismaClient()

app.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findMany()
    res.send(JSON.stringify(user))
  } catch (error) {
    res.send(error.message)
  }
})

app.post("/user/create", async (req, res) => {
  try {
    const data = req.body
    const user = await prisma.user.findFirst({
      where: {
        idInStore: data.idInStore,
        storeId: data.storeId,
      },
    })
    if (user) {
      res.send("User already exists")
    }
    const newUser = await prisma.user.create({
      data: {
        idInStore: data.idInStore,
        storeId: data.storeId,
        name: data.name,
        email: data.email,
        image: data.image,
      },
    })

    res.send(JSON.stringify(newUser))
  } catch (error) {
    res.send(error.message)
  }
})

app.propfind("/product-reviews", async (req, res) => {
  try {
    const data = req.body
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

    const htmlObject = await getHTMLContent(reviews)

    console.log(reviews)
    res.send(
      JSON.stringify({
        reviews: reviews,
        htmlObject: htmlObject,
      })
    )
  } catch (error) {
    res.send(error.message)
  }
})

app.propfind("/store", async (req, res) => {
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
  } catch (error) {
    res.send(error.message)
  }
})

app.post("/handle-new-ratings", async (req, res) => {
  try {
    const response = await handleUncreatedReviewForms(req.body)

    res.send(JSON.stringify(response))
  } catch (error) {
    res.send(error.message)
  }
})

app.post("/product-reviews", async (req, res) => {
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
        data: {
          idInStore: data.idInStore,
          storeId: data.storeId,
          name: data.name,
          email: data.email,
          image: data.image,
        },
      })
    }
    const newReview = await prisma.review.create({
      data: {
        storeId: data.storeId,
        userId: data.userId,
        userName: data.name,
        productInfo: data.productInfo,
        productId: data.productId,
        rating: data.rating,
        message: data.message,
        images: data.images,
      },
    })
    res.send(JSON.stringify(newReview))
  } catch (error) {
    res.send(error.message)
  }
})

app.patch("/product-reviews", async (req, res) => {
  try {
    const data = req.body
    const review = await prisma.review.findFirst({
      where: {
        storeId: data.storeId,
        id: data.id,
      },
    })
    const newReview = await prisma.review.update({
      where: {
        id: data.id,
      },
      data: {
        storeId: data.storeId,
        userId: data.userId,
        userFirstName: data.userFirstName,
        userLastName: data.userLastName,
        productInfo: data.productInfo,
        productId: data.productId,
        rating: data.rating,
        message: data.message,
        images: data.images,
        statusCreated: data.statusCreated,
        statusSent: data.statusSent,
        statusResponded: data.statusResponded,
        statusRejected: data.statusRejected,
        statusApproved: data.statusApproved,
        statusTrashed: data.statusTrashed,
      },
    })
    res.send(JSON.stringify(newReview))
  } catch (error) {
    res.send(error.message)
  }
})

https
  .createServer(options, app)
  .listen(3000, (req, res) =>
    console.log(
      "Arauta v0.0.3 https server online on 3000 and using node version " +
        process.version
    )
  )
