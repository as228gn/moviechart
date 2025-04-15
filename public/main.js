/**
 * Fetches movie data grouped by category (genre) from the GraphQL API, processes the data to extract genre names and the count of movies per genre, and renders a bar chart using Plotly.
 *
 * @returns {Promise<void>} A Promise that resolves when the chart is rendered.
 */
async function fetchMovieAndGenre() {
  const query = `
   query MoviesByCategory {
    moviesByCategory {
     moviesByCategory {
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
    body: JSON.stringify({ query })
  })

  const { data } = await res.json()

  if (data.errors) {
    console.error('GraphQL Error:', data.errors)
    return
  }

  const categories = data.moviesByCategory.moviesByCategory
  const x = categories.map(cat => cat.genre?.name ?? 'Unknown')
  const y = categories.map(cat => cat.movies.length)

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

      // Visa titlar på sidan
      displayMovieTitles(movieTitles)
    }
  })
}

/**
 *
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

fetchMovieAndGenre()
