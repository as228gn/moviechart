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
     * Fetches a list of movies filtered by genre or rating.
     *
     * @async
     * @param {object} _ - Placeholder for the root resolver (not used).
     * @param {object} args - The arguments for the query.
     * @param {string} [args.genreName] - Optional genre filter.
     * @param {number} [args.rating] - Optional rating filter.
     * @param {number} [args.limit=100] - The number of movies to return. Defaults to 100.
     * @param {number} [args.offset=0] - The number of movies to skip from the beginning of the result set.
     * @returns {Promise<Array>} List of movies that match the filters.
     */
    movies: async (_, { genreName, rating, limit = 100, offset = 0 }) => {
      const filters = {}

      if (genreName) {
        filters.genreName = genreName
      }

      if (rating) {
        filters.rating = rating
      }

      const movies = await controller.getMovies(filters, limit + 1, offset)

      const hasMore = movies.length > limit
      if (hasMore) movies.pop()

      for (const movie of movies) {
        const [actors, genre, rentalCount] = await Promise.all([
          controller.getActorsForMovie(movie.film_id),
          controller.getGenreForMovie(movie.film_id),
          controller.getRentalCountForMovie(movie.film_id)
        ])
        movie.actors = actors
        movie.genre = genre
        movie.rentalCount = rentalCount
      }

      return { movies, hasMore }
    },

    /**
     * Fetches a single movie by its ID along with its actors, genre, and rental count.
     *
     * @async
     * @param {object} _ - Placeholder for the root resolver (not used).
     * @param {object} args - The arguments for the query.
     * @param {string} args.id - The ID of the movie to fetch.
     * @returns {Promise<object>} The movie object with additional details (actors, genre, rental count).
     */
    movie: async (_, { id }) => {
      const movie = await controller.getMovieById(id)
      const actors = await controller.getActorsForMovie(id)
      const genres = await controller.getGenreForMovie(id)
      const rentalCount = await controller.getRentalCountForMovie(id)

      movie.actors = actors
      movie.genre = genres
      movie.rentalCount = rentalCount
      return movie
    },

    /**
     * Fetches all actors.
     *
     * @async
     * @returns {Promise<Array>} A list of all actors.
     */
    actors: async () => {
      return await controller.getActors()
    },

    /**
     *
     */
    moviesByCategory: async () => {
      const movies = await controller.getMovies({}, 1000, 0)
      const groupedByCategory = {}

      for (const movie of movies) {
        const genre = await controller.getGenreForMovie(movie.film_id)

        if (!genre) continue

        movie.genre = genre // Lägg till genren i movie

        const genreName = genre.name

        if (!groupedByCategory[genreName]) {
          groupedByCategory[genreName] = {
            genre,
            movies: []
          }
        }

        groupedByCategory[genreName].movies.push(movie)
      }

      return {
        moviesByCategory: Object.values(groupedByCategory)
      }
    }

  }
}
