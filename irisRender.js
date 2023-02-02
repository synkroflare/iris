const irisBox = document.createElement("div")

async function getRatings() {
  const data = await fetch("http://localhost:4000/product-reviews/", {
    method: "PROPFIND",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      storeId: 1,
      productId: "YLRGJLSR7-telas-60x90cm",
      statusApproved: true,
      statusRejected: false,
    }),
  })
    .then((response) => response.json())
    .then(function (data) {
      irisBox.innerHTML = data.htmlObject
    })
}

function handleImages(htmlObject) {
  const modalImage = document.createElement("div")
  const imageElement = htmlObject.childNodes[1].cloneNode(true)
  imageElement.style.height = "500px"
  modalImage.appendChild(imageElement)
  modalImage.style.position = "fixed"
  modalImage.style.inset = "0"
  modalImage.style.height = "100vh"
  modalImage.style.width = "100vw"
  modalImage.style.backgroundColor = "rgba(0,0,0,0.7)"
  modalImage.style.zIndex = "9999"
  modalImage.style.display = "flex"
  modalImage.style.alignItems = "center"
  modalImage.style.justifyContent = "center"

  document.body.appendChild(modalImage)

  modalImage.addEventListener("click", function (e) {
    this.remove()
  })
}

function toggleFilter(event, filter) {
  const filterButtons = document.querySelectorAll(".iris-filter")
  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].style.borderColor = "lightgray"
    filterButtons[i].style.color = "black"
  }
  event.style.borderColor = "darkturquoise"
  event.style.color = "darkturquoise"

  if (filter && typeof filter === "number") {
    rearrangeListByRating(filter)
  }

  if (filter === "has-comment") {
    showCommentRatings()
  }

  if (filter === "has-photo") {
    showPhotoRatings()
  }

  if (filter === null) {
    showAllRatings()
  }
}

function showAllRatings() {
  const ratings = document.querySelectorAll(".iris-rating-entry")

  for (let i = 0; i < ratings.length; i++) {
    ratings[i].style.display = "flex"
  }
}

function showCommentRatings() {
  const ratings = document.querySelectorAll(".iris-rating-entry")

  for (let i = 0; i < ratings.length; i++) {
    if (ratings[i].getAttribute("data-hascomment") === "true") {
      ratings[i].style.display = "flex"
      continue
    }
    ratings[i].style.display = "none"
  }
}

function showPhotoRatings() {
  const ratings = document.querySelectorAll(".iris-rating-entry")

  for (let i = 0; i < ratings.length; i++) {
    if (ratings[i].getAttribute("data-hasphoto") === "true") {
      ratings[i].style.display = "flex"
      continue
    }
    ratings[i].style.display = "none"
  }
}

function rearrangeListByRating(filter) {
  const ratings = document.querySelectorAll(".iris-rating-entry")

  for (let i = 0; i < ratings.length; i++) {
    if (ratings[i].getAttribute("data-rating") === filter.toString()) {
      ratings[i].style.display = "flex"
      continue
    }
    ratings[i].style.display = "none"
  }
}

getRatings()

document.body.appendChild(irisBox)
