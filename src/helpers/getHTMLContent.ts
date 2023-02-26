import { reviews } from "../types"
import { createRatingElement } from "./createRatingElement"

export const getHTMLContent = async (objects: reviews[]) => {
  let ratingMedian: number = 0
  const preRatings = await Promise.allSettled(
    objects.map((object) => {
      if (!object) return
      if (object.rating) {
        ratingMedian += object.rating
      }
      return createRatingElement(object)
    })
  )

  const ratings = preRatings.map((rating: any) => {
    return rating.value
  })

  ratingMedian = ratingMedian / objects.length
  const starMaskWidth =
    objects.length === 0 ? "100%" : (1 - ratingMedian / 5) * 100 + "%"

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
  const starsHTMLObject = `

    <a class='iris-stars-top' href='#iris-outerbox'>
    <div
    class="iris-star-rating"
    style="display: flex; flex-direction: row; margin-top: 10px; justify-content: space-between;align-items: center;
    gap: 20px

;"
  >
    
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
          style="height: 25px"
        />
      </div>
      <div class="">
        <img
          src="https://www.svgrepo.com/show/407521/star.svg"
          alt=""
          style="height: 25px"
        />
      </div>
      <div class="">
        <img
          src="https://www.svgrepo.com/show/407521/star.svg"
          alt=""
          style="height: 25px"
        />
      </div>
      <div class="">
        <img
          src="https://www.svgrepo.com/show/407521/star.svg"
          alt=""
          style="height: 25px"
        />
      </div>
      <div class="">
        <img
          src="https://www.svgrepo.com/show/407521/star.svg"
          alt=""
          style="height: 25px"
        />
      </div>
    </div>

    <span style="font-size: medium; font-weight: bold;">${
      ratingMedian ? ratingMedian + " de 5" : ""
    }</span>

    <span style="
    font-size: medium;
    font-weight: bold;
">
       
            ${
              objects.length > 0 ? objects.length + " Avaliações" : ""
            }           
        </span>
  </div>
    </a>
    
    `

  return {
    htmlObject: irisOuterHTML,
    starsHTMLObject: starsHTMLObject,
  }
}
