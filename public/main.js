/**
 * Fetches movie data grouped by category (genre) from the GraphQL API, processes the data to extract genre names and the count of movies per genre, and renders a bar chart using Plotly.
 *
 * @returns {Promise<void>} A Promise that resolves when the chart is rendered.
 */
async function fetchMovieAndGenre (rating) {
  const query = `
 query MovieCountsByGenre($rating: String) {
  movieCountsByGenre(rating: $rating) {
    count
    genre
  }
}
  `

  const res = await fetch('/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { rating } })
  })

  const { data } = await res.json()

  if (data.errors) {
    console.error('GraphQL Error:', data.errors)
    return
  }

  const genres = data.movieCountsByGenre.map(item => item.genre ?? 'Unknown')
  const counts = data.movieCountsByGenre.map(item => item.count)

  const chartData = [
    {
      x: genres,
      y: counts,
      type: 'bar',
      marker: {
        color: 'orange'
      }
    }
  ]

  // eslint-disable-next-line no-undef
  Plotly.newPlot('barChart', chartData)
}

/**
 * Displays a list of movie titles in the HTML element with the ID 'movieList'. This function clears the existing content and appends a list item for each movie title.
 *
 * @param {string[]} movieTitles - An array of movie titles to be displayed. Each title will be added as a separate list item in the movie list.
 */
function displayMovieTitles (movieTitles) {
  const movieList = document.getElementById('movieList')
  movieList.textContent = ''

  movieTitles.forEach(title => {
    const listItem = document.createElement('li')
    listItem.textContent = title
    movieList.appendChild(listItem)
  })
}

document.getElementById('ratingFilter').addEventListener('change', (event) => {
  const selectedRating = event.target.value
  fetchMovieAndGenre(selectedRating)
})

document.getElementById('rentalSlider').addEventListener('input', () => {
  document.getElementById('sliderValue').textContent = document.getElementById('rentalSlider').value
  fetchMovieAndGenre()
})

fetchMovieAndGenre()
