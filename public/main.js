/**
 * Fetches movie data grouped by category (genre) from the GraphQL API, processes the data to extract genre names and the count of movies per genre, and renders a bar chart using Plotly.
 *
 * @returns {Promise<void>} A Promise that resolves when the chart is rendered.
 */
async function fetchMovieAndGenre () {
  const rating = document.getElementById('ratingFilter').value
  const minRentalCount = parseInt(document.getElementById('rentalSlider').value)

  const query = `
   query MoviesByCategory($rating: String) {
    moviesByCategory(rating: $rating) {
     moviesByCategory {
     averageRentalCount
      genre {
        name
      }
      movies {
        film_id
        title
      }
    }
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

  const categories = data.moviesByCategory.moviesByCategory
  const filteredCategories = categories.filter(cat => cat.averageRentalCount >= minRentalCount) // Filtrera baserat på slidervärde
  const x = filteredCategories.map(cat => cat.genre?.name ?? 'Unknown')
  const y = filteredCategories.map(cat => cat.movies.length)

  const chartData = [
    {
      x,
      y,
      type: 'bar',
      marker: {
        color: 'orange'
      }
    }
  ]

  // eslint-disable-next-line no-undef
  Plotly.newPlot('barChart', chartData)
  document.getElementById('barChart').on('plotly_click', function (eventData) {
    const clickedData = eventData.points[0]
    const genre = clickedData.x
    const selectedCategory = categories.find(cat => cat.genre.name === genre)

    if (selectedCategory) {
      const movieTitles = selectedCategory.movies.map(movie => movie.title)

      displayMovieTitles(movieTitles)
    }
  })
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

document.getElementById('ratingFilter').addEventListener('change', fetchMovieAndGenre)
document.getElementById('rentalSlider').addEventListener('input', () => {
  document.getElementById('sliderValue').textContent = document.getElementById('rentalSlider').value
  fetchMovieAndGenre()
})

fetchMovieAndGenre()
