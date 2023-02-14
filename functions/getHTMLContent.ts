import { reviews } from "../types"

export async function getHTMLContent(objects: reviews[]) {
  const ratingsArray: string[] = []
  const ratingScores: number[] = []

  let ratings = ""
  let ratingMedian: number = 0

  for (let i = 0; i < objects.length; i++) {
    const newRating = await createRatingElement(objects[i])
    ratingsArray.push(newRating)
    ratingMedian += objects[i].rating
    ratings += newRating
  }

  ratingMedian = ratingMedian / objects.length
  let starMaskWidth: string = (1 - ratingMedian / 5) * 100 + "%"

  if (objects.length === 0) {
    starMaskWidth = "100%"
  }
  const irisOuterHTML = `
<div  
      id="iris-outerbox"
      style="
        border-radius: 10px;
        border: solid 1px lightgray;
        display: flex;
        flex-direction: column;
        gap: 20px;
        width: 70%;
        margin: 50px auto;
        position: relative;
        overflow: hidden;
      "
    >
      <div class="" style="padding: 20px">
        <div
          class="iris-title-tab"
          style="
            display: flex;
            flex-direction: row;
            justify-content: space-between;
          "
        >
          <h2 class="iris-title" style="font-weight: bold">Avaliações</h2>
          <div
            class="iris-star-rating"
            style="display: flex; flex-direction: column"
          >
            <span>${ratingMedian ? ratingMedian + " de 5" : ""}</span>
            <div
              class="stars"
              style="display: flex; flex-direction: row; gap: 2px; position: relative"
            >
            <div class="star-mask" style="position: absolute; top:0; right:0; z-index: 50; height: 100%; background-color: white; width: ${
              starMaskWidth ? starMaskWidth : "100%"
            }">
            </div>
              <div class="">
                <img
                  src="https://www.svgrepo.com/show/407521/star.svg"
                  alt=""
                  style="height: 30px"
                />
              </div>
              <div class="">
                <img
                  src="https://www.svgrepo.com/show/407521/star.svg"
                  alt=""
                  style="height: 30px"
                />
              </div>
              <div class="">
                <img
                  src="https://www.svgrepo.com/show/407521/star.svg"
                  alt=""
                  style="height: 30px"
                />
              </div>
              <div class="">
                <img
                  src="https://www.svgrepo.com/show/407521/star.svg"
                  alt=""
                  style="height: 30px"
                />
              </div>
              <div class="">
                <img
                  src="https://www.svgrepo.com/show/407521/star.svg"
                  alt=""
                  style="height: 30px"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          class="iris-tab"
          style="
            border-radius: 10px;
            padding: 20px;
            display: flex;
            flex-direction: row;
            justify-content: space-around;
            background-color: rgb(158 158 158 / 15%);
            margin-bottom: 40px;
          "
        >
          <div
            class="iris-filter-tab"
            style="display: flex; flex-direction: row; gap: 10px; flex-wrap: wrap"
          >
            <div
              class="iris-filter"
              onclick="toggleFilter(this, null);"
              id="iris-filter-all"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              Todas
            </div>
            <div
              class="iris-filter"
              onclick="toggleFilter(this, 5);"
              id="iris-filter-5"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              5 Estrelas
            </div>
            <div
              class="iris-filter"
              onclick="toggleFilter(this, 4);"
              id="iris-filter-4"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              4 Estrelas
            </div>
            <div
              class="iris-filter"
              onclick="toggleFilter(this, 3);"
              id="iris-filter-3"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              3 Estrelas
            </div>
            <div
              class="iris-filter"
              onclick="toggleFilter(this, 2);"
              id="iris-filter-2"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              2 Estrelas
            </div>
            <div
              class="iris-filter"
              onclick="toggleFilter(this, 1);"
              id="iris-filter-1"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              1 Estrelas
            </div>
            <div
              class="iris-filter"
              onclick="toggleFilter(this, 'has-comment');"
              id="iris-filter-comment"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              Com coméntario
            </div>
            <div
              class="iris-filter"
              onclick="toggleFilter(this, 'has-photo');"
              id="iris-filter-photo"
              style="
                border-radius: 5px;
                border: solid 1px lightgray;
                padding: 10px;
                background-color: white;
                cursor: pointer;
              "
            >
              Com fotos
            </div>
          </div>
        </div>
        <div
          class="iris-ratings-box"
          style="display: flex; flex-direction: column; gap: 20px"
        >

        ${ratings}
          
        </div>
      </div>
      <div
        class="iris-bottom"
        style="
          position: absolute;
          bottom: 0;
          width: 100%;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;

          background-color: rgb(43, 43, 43);
          color: white;
          font-size: smaller;
          text-align: end;
        "
      >
        <span style="padding: 15px"
          >Avaliações obtidas pelo sistema Arauta Alabarda.</span
        >
      </div>
    </div>
`

  return irisOuterHTML
}

async function getStars(rating: number) {
  return new Promise((resolve, reject) => {
    let stars = ""
    for (let i = 0; i < rating; i++) {
      stars += `
      <img
                src="https://www.svgrepo.com/show/407521/star.svg"
                alt=""
                style="height: 20px"
              />
      `
    }
    resolve(stars)
  })
}

async function getPhotos(photoUrls: string[]) {
  return new Promise((resolve, reject) => {
    let photos = ""
    for (let i = 0; i < photoUrls.length; i++) {
      photos += `
      <div
                class=""
                style="height: 150px; "
              >
              <a class='iris-rating-entry-image' onclick="handleImages(this)" style="cursor:pointer">
              <img  src="${photoUrls[i]}" style="height: 100%"/>
               </a></div>
      `
    }
    resolve(photos)
  })
}

async function createRatingElement(ratingData: any) {
  console.log(ratingData)

  const dateTime = ratingData.createdAt

  const stars = await getStars(ratingData.rating)
  const photos = await getPhotos(ratingData.images)

  let hasComment, hasPhoto

  if (ratingData.message) hasComment = "true"
  if (ratingData.images.length > 0) hasPhoto = "true"

  const ratingHTML = `
  <div
            class="iris-rating-entry"
            id="iris-rating-entry-1"
            style="
              border: 1px solid lightgray;
              border-radius: 5px;
              padding: 11px;
              display: flex;
              flex-direction: column;
              gap: 10px;
            "
            data-rating="${ratingData.rating}"
            data-hasComment="${hasComment}"
            data-hasPhoto="${hasPhoto}"

          >
            <div class="iris-rating-entry-name">${ratingData.userFirstName} ${
    ratingData.userLastName
  } | ${ratingData.userCity ? ratingData.userCity : ""} - ${
    ratingData.userState ? ratingData.userState : ""
  } </div>
            <div
              class="iris-rating-entry-stars"
              style="display: flex; flex-direction: row"
            >
              ${stars}
            </div>
            <div class="iris-rating-entry-product-info" style="color: gray">
              ${dateTime.getDate()}/${
    dateTime.getMonth() + 1
  }/${dateTime.getFullYear()}   | ${ratingData.productInfo}
            </div>
            <div class="iris-rating-entry-comment" style="margin-top: 20px">
              ${ratingData.message == null ? "" : ratingData.message}
            </div>
            <div
              class="iris-rating-entry-photos"
              style="
                display: flex;
                flex-direction: row;
                gap: 10px;
                margin-top: 25px;
              "
            >
              ${photos}
              
            </div>
          </div>
          <style>
            .iris-rating-box {
              background-color: navyblue !important;
            }
          </style>
  `

  return ratingHTML
}
