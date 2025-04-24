/**
 * @file Defines the MovieController class.
 * @module MovieController
 * @author Anna Ståhlberg
 */

import db from '../config/db.js'
/**
 * Encapsulates a controller.
 */
export class MovieController {
  /**
   * Retrieves movies from the database based on optional filters (genre and rating). This function constructs a dynamic SQL query to fetch movies from the database, with optional filters for genre and rating. If either of the filters is provided, the query is modified to include those conditions.
   *
   * @param {string} filter - The rating to filter movies by.
   * @returns {Promise<Array>} A promise that resolves to an array of movies that match the filters.
   * @throws {Error} If there is an issue with the SQL query or database connection.
   */
  async getMovies (filter = {}) {
    try {
      let query = `
        SELECT c.name AS genre, COUNT(*) AS count
        FROM film f
        JOIN film_category fc ON f.film_id = fc.film_id
        JOIN category c ON fc.category_id = c.category_id
      `
      const params = []
      if (filter.rating && filter.rating !== 'All') {
        query += '  WHERE f.rating = ?'
        params.push(filter.rating)
      }

      query += `
        GROUP BY c.name
      `

      const [movies] = await db.query(query, params)
      return movies
    } catch (error) {
      throw new Error('Could not fetch movies: ' + error.message)
    }
  }

  /**
   * Retrieves a list of movie titles from the database, optionally filtered by genre and/or rating. The titles are sorted alphabetically.
   *
   * @param {object} [filter={}] - Optional filters to apply to the movie query.
   * @param {string} [filter.genre] - The genre to filter movies by (e.g., "Action", "Comedy"). Use "All" or omit to disable this filter.
   * @param {string} [filter.rating] - The rating to filter movies by (e.g., "PG", "R"). Use "All" or omit to disable this filter.
   * @returns {Promise<string[]>} A promise that resolves to an array of movie titles (strings).
   * @throws {Error} Throws an error if the database query fails.
   */
  async getTitles (filter = {}) {
    try {
      let query = `
        SELECT f.title
        FROM film f
        JOIN film_category fc ON f.film_id = fc.film_id
        JOIN category c ON fc.category_id = c.category_id
      `

      const conditions = []
      const params = []

      if (filter.genre && filter.genre !== 'All') {
        conditions.push('c.name = ?')
        params.push(filter.genre)
      }

      if (filter.rating && filter.rating !== 'All') {
        conditions.push('f.rating = ?')
        params.push(filter.rating)
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ')
      }

      query += ' ORDER BY f.title ASC'

      const [movies] = await db.query(query, params)
      return movies.map(movie => movie.title)
    } catch (error) {
      throw new Error('Could not fetch movies: ' + error.message)
    }
  }

  /**
   * Retrieves the average rental count for each movie genre from the database.
   *
   * @param {object} [filter={}] - Optional filter object.
   * @param {string} [filter.rating] - Filter to include only movies with the specified rating (e.g., "PG", "R", etc.). If not provided or set to "All", no rating filter is applied.
   * @returns {Promise<object[]>} A Promise that resolves to an array of objects, each containing:
   * @throws {Error} If the database query fails, an error is thrown with a descriptive message.
   */
  async getAverageRentalCount (filter = {}) {
    try {
      let query = `
        SELECT 
          genre,
          ROUND(AVG(rental_count), 1) AS average_rental_count
        FROM (
          SELECT 
            c.name AS genre,
            COUNT(r.rental_id) AS rental_count
          FROM sakila.film f
          JOIN film_category fc ON f.film_id = fc.film_id
          JOIN category c ON fc.category_id = c.category_id
          JOIN inventory i ON f.film_id = i.film_id
          JOIN rental r ON i.inventory_id = r.inventory_id
      `
      const params = []

      if (filter.rating && filter.rating !== 'All') {
        query += ' WHERE f.rating = ?'
        params.push(filter.rating)
      }

      query += `
          GROUP BY f.film_id, c.name
        ) AS rental_counts
        GROUP BY genre
      `

      const [movies] = await db.query(query, params)
      return movies
    } catch (error) {
      throw new Error('Could not fetch average rental count by genre: ' + error.message)
    }
  }
}
