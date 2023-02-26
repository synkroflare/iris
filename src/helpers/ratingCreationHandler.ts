import { PrismaClient } from "@prisma/client"
import fetch from "node-fetch"
import { inject, injectable } from "tsyringe"

interface IRatingCreationHandler {
  execute(data: TProps): Promise<any>
}

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

const apiLimit = 50

@injectable()
export class ratingCreationHandler implements IRatingCreationHandler {
  constructor(
    @inject("PrismaClient")
    private readonly client: PrismaClient
  ) {}

  async execute(data: TProps) {
    const store = await this.client.store.findFirst({
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

    /*  const storeApiInfo: any = await new Promise((resolve, reject) => {
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
  }) */

    const storeApiInfo = await getLIApiData(0)

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
        continue
      }
      orderIds.push(storeApiInfo.objects[i].numero)
      storeApiInfoToCreate.push(storeApiInfo.objects[i])
    }

    if (orderIds.length <= 0) return "Tudo em dia."

    const TEST__infoarray: any = []

    for (let i = 0; i < orderIds.length; i++) {
      const newinfo = await this.createUncreatedRatings(
        orderIds[i],
        storeApiInfoToCreate[i]
      )
      TEST__infoarray.push(newinfo)
    }

    return TEST__infoarray
  }

  async createUncreatedRatings(orderId: number, storeInfo: any) {
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

    const newRatingForm = await this.client.review.create({
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
}

async function getLIApiData(offset: number) {
  return await new Promise<any>((resolve) => {
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
        const remainingOrders = data.meta.total_count - (apiLimit + offset)
        if (remainingOrders <= 0) {
          resolve(data)
        }
        console.log(
          "Iterating again in getLIApiData with remainingOrders: ",
          remainingOrders
        )
        getLIApiData(apiLimit + offset)
      })
  })
}
