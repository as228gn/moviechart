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

  async getTitles(filter = {}) {
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
   * A query that gives you the genre for a specific movie.
   *
   * @param {number} id - The id of the movie to retrieve the genre from.
   * @returns {string} - The genre of the movie.
   */
  async getGenreForMovie (id) {
    try {
      const [result] = await db.query(`
        SELECT c.category_id, c.name
        FROM category c
        JOIN film_category fc ON fc.category_id = c.category_id
        WHERE fc.film_id = ?`, [id])
      const genre = result[0]
      return genre
    } catch (error) {
      throw new Error('Could not fetch genre: ' + error.message)
    }
  }

  /**
   * A query that gives you the rental count for a specific movie..
   *
   * @param {number} id - The id of the film to retrieve the rental count from.
   * @returns {number} - The rental count.
   */
  async getRentalCountForMovie (id) {
    try {
      const query = `
        SELECT f.film_id, f.title, COUNT(r.rental_id) AS rental_count
        FROM film f
        JOIN inventory i ON f.film_id = i.film_id
        JOIN rental r ON i.inventory_id = r.inventory_id
        WHERE f.film_id = ?
        GROUP BY f.film_id, f.title;
      `

      const [rows] = await db.query(query, [id])

      if (rows.length > 0) {
        return rows[0].rental_count
      } else {
        return 0
      }
    } catch (error) {
      throw new Error('Error fetching rental count: ' + error.message)
    }
  }
}
