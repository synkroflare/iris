import { PrismaClient } from "@prisma/client"
import fetch from "node-fetch"
import { container } from "tsyringe"

type TProps = {
  name: string
  siteUrl: string
  phone: number
  id: number
  plan: string
  lastPayment: Date
  reviews: boolean | undefined
  users: boolean | undefined
}

type TApiInfo = {
  objects: TApiInfoObject[]
}

type TApiInfoObject = {
  numero: number
}

const prisma: PrismaClient = container.resolve("PrismaClient")

const API_LIMIT = 50
const API_URL =
  "https://api.awsli.com.br/v1/pedido/search/?situacao_id=14&limit=50&format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a"

export const handleUncreatedReviewForms = async (data: TProps) => {
  const { id } = data

  const store = await prisma.store.findFirst({
    where: { id },

    include: {
      reviews: true,
      users: true,
    },
  })

  const storeApiInfo = await fetchAllApiData()

  const existingOrderIds =
    store?.reviews.map((review) => review.reviewIdInStore) ?? []

  const ordersToCreate = storeApiInfo.objects.filter(
    (order) => !existingOrderIds.includes(order.numero)
  )

  if (ordersToCreate.length === 0) return "All is up to date."

  return await Promise.all(
    ordersToCreate.map(async (order) => {
      return await createUncreatedRatings(order.numero, order)
    })
  )
}

const fetchApiData = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch API data from ${url}`)
  }

  return response.json()
}

const fetchAllApiData = async (): Promise<TApiInfo> => {
  const initialData = await fetchApiData(API_URL)

  const offset = initialData.meta.total_count - API_LIMIT
  if (offset <= 0) {
    return initialData
  }

  console.log("going to the next get request")

  return await fetchApiData(
    `https://api.awsli.com.br/v1/pedido/search/?situacao_id=14&limit=50&offset=${offset}&format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a`
  )
}

async function createUncreatedRatings(orderId: number, storeInfo: any) {
  console.log(storeInfo.cliente, "fetch1")
  console.log(storeInfo.resource_uri, "fetch2")

  const clientInfo: any = await new Promise((resolve, reject) => {
    fetch(
      "https://api.awsli.com.br" +
        storeInfo.cliente +
        "/?format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then(function (data) {
        resolve(data)
      })
  })

  const orderInfo: any = await new Promise((resolve, reject) => {
    fetch(
      "https://api.awsli.com.br" +
        storeInfo.resource_uri +
        "/?format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then(function (data) {
        resolve(data)
      })
  })

  console.log(orderInfo.itens[0], "fetch3")

  const apiProductInfo = orderInfo.itens[0].produto_pai
    ? orderInfo.itens[0].produto_pai
    : orderInfo.itens[0].produto

  const productInfo: any = await new Promise((resolve, reject) => {
    fetch(
      "https://api.awsli.com.br" +
        apiProductInfo +
        "/?format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then(function (data) {
        resolve(data)
      })
  })

  const fixedProductInfo = orderInfo.itens[0].nome.slice(
    orderInfo.itens[0].nome.indexOf("]") + 1
  )

  const newRatingForm = await prisma.review.create({
    data: {
      userFirstName: clientInfo.nome,
      userLastName: "",
      reviewIdInStore: orderId,
      productId: orderInfo.itens[0].sku,
      productInfo: fixedProductInfo,
      userCity: clientInfo.enderecos[0].cidade,
      userState: clientInfo.enderecos[0].estado,
      userMail: clientInfo.email,
      userPhone: clientInfo.telefone_celular,
      userId: 1,
      storeId: 1,
      productImageUrl: productInfo.imagem_principal.grande,
    },
  })

  return newRatingForm
}
