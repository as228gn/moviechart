let selectedRating = null
let slider = null

document.getElementById('ratingFilter').addEventListener('change', (event) => {
  selectedRating = event.target.value
  fetchMovieAndGenre(selectedRating)
  fetchAverageRentalCount(selectedRating, slider)
})

document.getElementById('rentalSlider').addEventListener('input', () => {
  const sliderValue = document.getElementById('rentalSlider').value
  document.getElementById('sliderValue').textContent = sliderValue
  slider = sliderValue
  fetchAverageRentalCount(selectedRating, sliderValue)
})

/**
 * Fetches movie data grouped by genre from the GraphQL API, filtered optionally by rating. Renders the result as a bar chart using Plotly, where each bar represents a genre and the number of movies in it. Attaches a click event listener to the chart, so when a user clicks on a bar (genre), it fetches and displays movie titles for that genre.
 *
 * @param {string} rating - Optional rating to filter the movie genres by (e.g., "PG", "R", "G"). If null or "All", no filter is applied.
 * @returns {Promise<void>} A Promise that resolves when the chart is rendered and click handler is attached.
 */
async function fetchMovieAndGenre (rating) {
  const movieList = document.getElementById('movieList')
  movieList.textContent = ''
  try {
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
          color: '#21918c'
        }
      }
    ]

    // eslint-disable-next-line no-undef
    Plotly.newPlot('barChart', chartData)

    document.getElementById('barChart').on('plotly_click', function (data) {
      const point = data.points[0]
      const genre = point.x

      getTitles(genre, selectedRating)
    })
  } catch (error) {
    console.error(error)
  }
}

/**
 * Fetches the average rental count per genre from a GraphQL API, optionally filtered by movie rating. It then filters the results to include only genres with an average rental count greater than or equal to the given threshold (minAverage)
 *
 * @param {string|null} rating - Optional movie rating to filter by (e.g., "PG", "R", "G"). If `null` or `"All"`, all ratings are included.
 * @param {number} minAverage - Minimum average rental count required for a genre to be included in the chart.
 * @returns {Promise<void>} A Promise that resolves when the bubble chart has been rendered.
 */
async function fetchAverageRentalCount(rating, minAverage) {
  const movieList = document.getElementById('movieList')
  movieList.textContent = ''

  try {
    const query = `
 query MovieCountsByGenre($rating: String) {
  averageRentalCount(rating: $rating) {
    averageRentalCount
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
    const filtered = data.averageRentalCount.filter(item => item.averageRentalCount >= minAverage)

    const genres = filtered.map(item => item.genre ?? 'Unknown')
    const averages = filtered.map(item => item.averageRentalCount)

    const bubbleData = [
      {
        x: genres,
        y: averages,
        mode: 'markers',
        marker: {
          size: averages.map(avg => avg * 2),
          color: averages,
          colorscale: 'Viridis',
          showscale: true,
          sizemode: 'area',
          sizeref: 2.0 * Math.max(...averages) / 100 ** 2
        },
        text: genres,
        type: 'scatter'
      }
    ]

    // eslint-disable-next-line no-undef
    Plotly.newPlot('bubble', bubbleData, {
      title: 'Average Rental Count per Genre',
      xaxis: { title: 'Genre' },
      yaxis: { title: 'Average Rental Count' }
    })

    document.getElementById('bubble').on('plotly_click', function (data) {
      const point = data.points[0]
      const genre = point.x

      getTitles(genre, selectedRating)
    })
  } catch (error) {
    console.error(error)
  }
}

/**
 * Fetches movie titles from the GraphQL API based on selected genre and rating. Sends a POST request to the /graphql endpoint, retrieves an array of movie titles, and passes them to the displayMovieTitles function for rendering.
 *
 * @param {string} genre - The genre to filter movies by (can be null or "All" for no filtering).
 * @param {string} rating - The rating to filter movies by (can be null or "All" for no filtering).
 * @returns {Promise<void>} A Promise that resolves once movie titles are fetched and displayed.
 */
async function getTitles (genre, rating) {
  try {
    const query = `
  query MovieCountsByGenre($genre: String, $rating: String) {
  movieTitles(genre: $genre, rating: $rating)
}
  `
    const res = await fetch('/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { genre, rating } })
    })

    const { data } = await res.json()

    if (data.errors) {
      console.error('GraphQL Error:', data.errors)
      return
    }

    displayMovieTitles(data)
  } catch (error) {
    console.error(error)
  }
}
/**
 * Displays a list of movie titles in the HTML element with the ID 'movieList'. This function clears the existing content and appends a list item for each movie title.
 *
 * @param {string[]} movieTitles - An array of movie titles to be displayed. Each title will be added as a separate list item in the movie list.
 */
function displayMovieTitles(movieTitles) {
  const movieList = document.getElementById('movieList')
  movieList.textContent = ''

  movieTitles.movieTitles.forEach(title => {
    const listItem = document.createElement('li')
    listItem.textContent = title
    movieList.appendChild(listItem)
  })
}

fetchMovieAndGenre()
