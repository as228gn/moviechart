import { MovieController } from '../controllers/MovieController.js'
const controller = new MovieController()

export const movieResolver = {
  Query: {

    /**
     * GraphQL resolver for fetching the number of movies grouped by genre, optionally filtered by rating. Calls the controller to retrieve aggregated movie data and formats the result for the GraphQL response.
     *
     * @param {object} _ - The parent resolver (not used).
     * @param {object} args - The arguments passed to the resolver.
     * @returns {Promise<Array<{ genre: string, count: number }>>} A promise that resolves to an array of objects, each containing a movie genre and the count of movies in that genre.
     * @throws {Error} Throws an error if the data fetch fails.
     */
    movieCountsByGenre: async (_, args) => {
      try {
        const movies = await controller.getMovies(args)

        return movies.map(movie => ({
          genre: movie.genre,
          count: movie.count
        }))
      } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch movie counts by genre')
      }
    },

    /**
     * GraphQL resolver for fetching a list of movie titles, optionally filtered by genre and/or rating. Delegates the filtering logic to the controller's getTitles function.
     *
     * @param {object} _ - The parent resolver (unused in this context).
     * @param {object} args - The arguments provided to the resolver.
     * @returns {Promise<string[]>} A promise that resolves to an array of movie title strings.
     * @throws {Error} Throws an error if the titles could not be fetched.
     */
    movieTitles: async (_, args) => {
      try {
        const movies = await controller.getTitles(args)
        return movies
      } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch movie titles')
      }
    },

    /**
     * GraphQL resolver for fetching the average rental count per genre.
     *
     * @param {object} _ - Unused parent resolver parameter (standard in GraphQL).
     * @param {object} args - Resolver arguments.
     * @returns {Promise<object[]>} A Promise that resolves to an array of objects.
     * @throws {Error} If fetching data fails, an error is thrown and logged to the console.
     */
    averageRentalCount: async (_, args) => {
      try {
        const averageRentalCounts = await controller.getAverageRentalCount(args)

        return averageRentalCounts.map(item => ({
          genre: item.genre,
          averageRentalCount: item.average_rental_count
        }))
      } catch (error) {
        console.error(error)
        throw new Error('Failed to fetch average rental counts by genre')
      }
    }
  }
}
