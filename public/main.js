
/**
 *
 */
async function fetchMovieAndGenre () {
  const query = `
   query MoviesByCategory {
    moviesByCategory {
     moviesByCategory {
      genre {
        name
      }
      movies {
        film_id
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
}

fetchMovieAndGenre()
