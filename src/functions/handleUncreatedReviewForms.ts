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
    const apiLimit = 50
    fetch(
      "https://api.awsli.com.br/v1/pedido/search/?situacao_id=14&limit=50&format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a",
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
        const offset = data.meta.total_count - apiLimit
        if (offset <= 0) {
          resolve(data)
          return
        }

        console.log("going to the next get request")

        fetch(
          "https://api.awsli.com.br/v1/pedido/search/?situacao_id=14&limit=50&offset=" +
            offset +
            "&format=json&chave_api=aaba145ba78dc7524820&chave_aplicacao=92fae45b-dd41-46c2-ac0d-840642d6982a",
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
    console.log(orderIdsInDatabase, storeApiInfo.objects[i].numero)
    const check = orderIdsInDatabase.includes(storeApiInfo.objects[i].numero)
    if (check) {
      console.log("checked")
      continue
    }
    orderIds.push(storeApiInfo.objects[i].numero)
    storeApiInfoToCreate.push(storeApiInfo.objects[i])
  }

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
