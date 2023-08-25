const searchFormElement = document.getElementById('search-form')
const searchInputElement = document.getElementById('search-input')
const resultElement = document.getElementById('search-results')
const localStorageKey = 'searchResults'

/* Because of the way the API's designed. 
There are 3 steps in displaying the list of movies
corresponding the the user keyword */

/* Step 1: 
    - get the keyword from users, 
    - pass it to the API request to get a list of movie ids (movie.imdbID) */
searchFormElement.addEventListener('submit', function (event) {
  event.preventDefault()
  const userKeyword = searchInputElement.value
  fetchMoviesByKeyword(userKeyword)
})

function fetchMoviesByKeyword(userKeyword) {
  const apiKey = 'f53fc1fa'
  const searchAPIUrl = `http://www.omdbapi.com/?s=${encodeURIComponent(userKeyword)}&apikey=${apiKey}`

  fetch(searchAPIUrl)
    .then(response => response.json())
    .then(data => {
      if (data.Response === 'True') {
        const movieIdArray = data.Search.map(movie => movie.imdbID)
        fetchMoviesByIds(movieIdArray)
      } else {
        resultElement.innerHTML = `
        <h3 class="no-result-error-message">
        Unable to find what you're looking for.
        Please try another search.</h3>`
      }
    })
    .catch(error => {
      console.error('Error:', error)
      resultElement.innerHTML = 'An error occurred while fetching the data.'
    })
}

/* Step 2: 
    - map through the movie id array to get the movies with details.  
    - store the movies in an array */
function fetchMoviesByIds(movieIds) {
  const apiKey = 'f53fc1fa' 
  const movieFetchPromises = movieIds.map(movieId => {
    const movieUrl = `http://www.omdbapi.com/?i=${movieId}&apikey=${apiKey}`
    return fetch(movieUrl)
      .then(response => response.json())
  })

  Promise.all(movieFetchPromises)
    .then(fetchedMovies => {
/* Step 3: - display the movies on page */
      renderMovies(fetchedMovies)
    //   Store the results in local storage
      saveSearchResultsToLocalStorage(fetchedMovies)
    })
    .catch(error => {
      console.error('Error:', error)
      resultElement.innerHTML = 'An error occurred while fetching the data.'
    })
}

function renderMovies(movies) {
    resultElement.innerHTML = ''

    movies.forEach(movie => {
        const movieHTML = `
        <div class="movie-container">
            <img class="movie-poster" src="${movie.Poster !== 'N/A' ? movie.Poster : 'images/no_image_placeholder.png'}">
            <div class="movie-body">
                <div class="movie-header">
                    <h3 class="movie-title">${movie.Title}
                    <span class="release-year">${movie.Year}</span>
                    </h3>
                    <span class="star-icon">
                    <i class="fa-solid fa-star fa-xs"></i>
                    </span>
                    <span><p class="rating">${movie.imdbRating}</p></span>
                </div>
                <div class="movie-info">
                    <p class="runtime">${movie.Runtime}</p>
                    <p class="genre">${movie.Genre}</p>
                    <div class="add">
                        <a class="add-watchlist">
                            <i class="fa fa-plus-circle watchlist-btn"></i>
                            <p class="watchlist-text">Watchlist</p>
                        </a>
                    </div>
                </div>
                <div class="movie-description">
                    <p class="movie-plot">${movie.Plot}</p>
                </div>
            </div>
        </div>
        `
        resultElement.innerHTML += movieHTML

        const addToWatchlistButtons = document.querySelectorAll('.add-watchlist')
        addToWatchlistButtons.forEach((button, index) =>{
            button.addEventListener('click',()=>{
                addMovieToWatchlist(movies[index])
            })
        })

        /* Truncate plot text if too long
        WORKING ON THIS FUNCTIONALITY because it is procuding bug 
            * Bug: adding extra "ellipsis" and "Read" in certain cases
        */
        // const moviePlotElements = document.querySelectorAll('.movie-plot')
        // const maxCharLength = 150

        // moviePlotElements.forEach(plotElement =>{
        //     if(plotElement.textContent.length > maxCharLength){
        //         let truncatedText = plotElement.textContent.slice(0, maxCharLength)
        //         const lastSpaceIndex = truncatedText.lastIndexOf(' ')
        //         if(lastSpaceIndex !== -1){
        //             truncatedText = truncatedText.slice(0, lastSpaceIndex)
        //         }
        //         const fullText = plotElement.textContent
        //         const truncatedContent = truncatedText.trim() + '<span class="read-more-dots">...</span> <a href="#" class="read-more-link">Read more</a>'
        //         plotElement.innerHTML = truncatedContent

        //         const readMoreLink = plotElement.querySelector('.read-more-link')
        //         readMoreLink.addEventListener('click', (event => {
        //             event.preventDefault()
        //             plotElement.innerHTML = fullText
        //         }))
        //     }
        // })
    })
}

/* Save and load results from localStorage */
function saveSearchResultsToLocalStorage(fetchedMovies) {
  localStorage.setItem(localStorageKey, JSON.stringify(fetchedMovies))
}

function retrieveSearchResultsFromLocalStorage() {
  const results = localStorage.getItem(localStorageKey)
  return results ? JSON.parse(results) : null
}

const storedResults = retrieveSearchResultsFromLocalStorage()
if (storedResults) {
  renderMovies(storedResults)
}

function addMovieToWatchlist(movie) {
  let watchlistMovies = JSON.parse(localStorage.getItem('watchlist')) || []
  if(watchlistMovies.some(item => item.imdbID === movie.imdbID)) {
    alert('Movie ALREADY added!')
  }
  else{
    watchlistMovies.unshift(movie)
    localStorage.setItem('watchlist', JSON.stringify(watchlistMovies))
    alert('Movie ADDED to Watchlist!')
  }
}

