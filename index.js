const { PrismaClient } = require("@prisma/client")
const express = require("express")
const { getHTMLContent } = require("./functions/getHTMLContent")

const app = express()

// Add headers before the routes are defined
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*")

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
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
        productId: data.productId,
        storeId: data.storeId,
        userId: data.userId,
        rating: data.rating,
      },
    })

    const htmlObject = await getHTMLContent(reviews)
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

app.listen(3000, (req, res) =>
  console.log("running on http://localhost:3000 " + process.version)
)
