import { PrismaClient } from "@prisma/client"
import fetch from "node-fetch"

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

const prisma = new PrismaClient()

export const handleUncreatedReviewForms = async (data: TProps) => {
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

  const storeApiInfo: any = await new Promise((resolve, reject) => {
    fetch(
      "https://api.awsli.com.br/v1/pedido/search/?situacao_id=14&format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a",
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

  const orderIds: number[] = []
  const orderIdsInDatabase: number[] = []
  const storeApiInfoToCreate: any[] = []

  for (
    let i = 0;
    i < (store?.reviews.length ? store?.reviews.length : 0);
    i++
  ) {
    orderIdsInDatabase.push(store?.reviews[i].reviewIdInStore!)
  }

  for (let i = 0; i < storeApiInfo.objects.length; i++) {
    const check = orderIdsInDatabase.includes(storeApiInfo.objects[i].numero)
    if (check) {
      console.log("checked")
      continue
    }
    orderIds.push(storeApiInfo.objects[i].numero)
    storeApiInfoToCreate.push(storeApiInfo.objects[i])
  }

  console.log("orderIds", orderIds)
  console.log("store reviews", store?.reviews)

  if (orderIds.length <= 0) return "Tudo em dia."

  const TEST__infoarray: any = []

  for (let i = 0; i < orderIds.length; i++) {
    const newinfo = await createUncreatedRatings(
      orderIds[i],
      storeApiInfoToCreate[i]
    )
    TEST__infoarray.push(newinfo)
  }

  return TEST__infoarray

  if (!store) {
    return "ERROR: No store found with given parameters"
  }

  return store
}

async function createUncreatedRatings(orderId: number, storeInfo: any) {
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
      userId: 1,
      storeId: 1,
    },
  })

  return newRatingForm
}
