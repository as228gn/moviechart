import { MovieController } from '../controllers/MovieController.js'
const controller = new MovieController()

/**
 * GraphQL resolvers for movie-related queries and mutations.
 *
 * @constant {object} movieResolver - The resolver object for movie queries and mutations.
 * @property {object} Query - Contains query resolvers for fetching movie data.
 * @property {Function} Query.movies - Resolves the query to fetch movies based on optional filters (genreName, rating).
 * @property {Function} Query.movie - Resolves the query to fetch a single movie by its ID.
 * @property {Function} Query.actors - Resolves the query to fetch all actors.
 */
export const movieResolver = {
  Query: {
    /**
     * Fetches movies grouped by their genre and optionally filtered by rating. It calculates the average rental count for each genre and returns a list of genres with their associated movies and the average rental count.
     *
     * @param {object} _ - Placeholder for the root resolver (not used).
     * @param {object} args - The arguments for the query.
     * @param {string} [args.rating] - Optional rating filter. If provided, filters movies by the given rating.
     * @returns {Promise<object>} - An object containing the list of movies grouped by category.
     */
    moviesByCategory: async (_, { rating }) => {
      const filters = {}
      if (rating) {
        filters.rating = rating
      }
      const movies = await controller.getMovies(filters, 1000, 0)
      const groupedByCategory = {}

      for (const movie of movies) {
        const genre = await controller.getGenreForMovie(movie.film_id)
        const rentalCount = await controller.getRentalCountForMovie(movie.film_id)

        if (!genre) continue

        movie.genre = genre // Add genre in movie
        movie.rentalCount = rentalCount

        const genreName = genre.name

        if (!groupedByCategory[genreName]) {
          groupedByCategory[genreName] = {
            genre,
            movies: [],
            totalRentals: 0
          }
        }

        groupedByCategory[genreName].movies.push(movie)
        groupedByCategory[genreName].totalRentals += rentalCount
      }

      const result = Object.values(groupedByCategory).map(group => ({
        genre: group.genre,
        movies: group.movies,
        averageRentalCount: group.totalRentals / group.movies.length
      }))

      return {
        moviesByCategory: result
      }
    },

    movieCountsByGenre: async (_, { rating }) => {
      try {
        const filter = {}
        if (rating) {
          filter.rating = rating
        }
        const movies = await controller.getMovies(filter)

        // Returnera resultatet från getMovies
        return movies.map(movie => ({
          genre: movie.genre,
          count: movie.count
        }))
      } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch movie counts by genre')
      }
    }
  }
}
