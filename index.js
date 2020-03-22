(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io/'
  const INDEX_URL = BASE_URL + 'api/v1/movies/'
  const POSTER_URL = BASE_URL + 'posters/'
  const data = []

  const dataPanel = document.getElementById('data-panel')

  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  const pagination = document.getElementById('pagination')
  const ITEM_PER_PAGE = 12

  const listModal = document.getElementById('listModal')

  const dataUsingNow = {
    dataResults: [],   //記錄所有頁數需使用的資料
    pageNow: 1,        //記錄當下的頁碼
    listbarFlag: false //記錄當下是否使用列表模式
  }

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    dataUsingNow.dataResults = data
    getTotalPages()
    getPageData()
  }).catch((err) => console.log(err))

  // Listen to data panel
  dataPanel.addEventListener('click', evnet => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id)
    }
  })

  listModal.addEventListener('click', event => {
    // 記錄是否為列表模式
    if (event.target.matches('#listTh')) {
      dataUsingNow.listbarFlag = false
    } else if (event.target.matches('#listBar')) {
      dataUsingNow.listbarFlag = true
    }
    getPageData()
  })

  searchForm.addEventListener('submit', event => {
    dataUsingNow.pageNow = 1　// 若使用搜尋則頁數會回到第一頁
    event.preventDefault()
    const regex = new RegExp(searchInput.value, 'i')
    dataUsingNow.dataResults = data.filter(movie => movie.title.match(regex))
    getTotalPages()
    getPageData()
  })

  pagination.addEventListener('click', event => {
    if (event.target.tagName === 'A') {
      dataUsingNow.pageNow = event.target.dataset.page // 點選頁碼並記錄，以全域變數使用
      getPageData()
    }
  })

  function getTotalPages() {
    let totalPages = Math.ceil(dataUsingNow.dataResults.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData() {
    let offset = (dataUsingNow.pageNow - 1) * ITEM_PER_PAGE
    let pageData = dataUsingNow.dataResults.slice(offset, offset + ITEM_PER_PAGE)
    if (dataUsingNow.listbarFlag) {
      displayDataListBar(pageData)
    } else {
      displayDataList(pageData)
    }
  }

  function displayDataList(Data) {
    let htmlcontent = ''
    Data.forEach(function (item, index) {
      htmlcontent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h6 class="card-title">${item.title}</h6>
            </div>

            <!-- Button trigger modal -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id = "${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      `
    })
    dataPanel.innerHTML = htmlcontent
  }

  function displayDataListBar(Data) {
    let htmlcontent = `
      <div class="col-12">
        <ul class="list-group list-group-flush" id="list-tab" role="tablist">
    `
    Data.forEach(function (item, index) {
      htmlcontent += `
      <li class="list-group-item d-flex justify-content-between">
        <div class="col-8">${item.title}</div>
        <div class="col-4">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id = "${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
      `
    })
    dataPanel.innerHTML = htmlcontent + '</ul></div>'
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)

      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${movie.title} is already in your favorite list.`)
    } else {
      list.push(movie)
      alert(`Added ${movie.title} to your favorite list!`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }
})()

