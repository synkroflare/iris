import { reviews } from "../types"

export async function getHTMLContent(objects: reviews[]) {
  const array: any[] = []

  objects.forEach((el) => {
    array.push(el.message)
  })
  return `sample data: ${JSON.stringify(array)}`
}
