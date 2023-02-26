export const createRatingElement = (ratingData: any) => {
  const dateTime = ratingData.createdAt

  const stars = getStars(ratingData.rating)
  const photos = getPhotos(ratingData.images)

  const hasComment = ratingData.message ? true : null
  const hasPhoto = ratingData.images.length > 0 ? true : null

  return `
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
}

const StarIcon = `<img
      src="https://www.svgrepo.com/show/407521/star.svg"
      alt=""
      style={{ height: "20px" }}
    />`

const getStars = (rating: number) => {
  let stars = ""
  for (let i = 0; i < rating; i++) {
    stars += StarIcon
  }
  return stars
}
const photoImage = (url: string) => {
  return `
      <div style="height: 150px;">
        <a class='iris-rating-entry-image' onclick="handleImages(this)" style="cursor:pointer">
          <img  src="${url}" style="height: 100%"/>
        </a>
      </div>
      `
}
const getPhotos = (photoUrls: string[]) => {
  let photos = ""
  for (let i = 0; i < photoUrls.length; i++) {
    photos += photoImage(photoUrls[i])
  }
  return photos
}
