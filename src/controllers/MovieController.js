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
   * @param {object} params - The parameters object containing optional filter values.
   * @param {string} [params.genreName] - The name of the genre to filter movies by.
   * @param {number} [params.rating] - The rating to filter movies by.
   * @param {number} limit - The number of movies to return. Defaults to 100.
   * @param {number} offset - The number of movies to skip from the beginning of the result set.
   * @returns {Promise<Array>} A promise that resolves to an array of movies that match the filters.
   * @throws {Error} If there is an issue with the SQL query or database connection.
   */
  async getMovies ({ genreName, rating }, limit = 100, offset = 0) {
    try {
      let query = `
    SELECT f.film_id, f.title, f.description, f.release_year, f.rating 
    FROM film f
    JOIN film_category fc ON f.film_id = fc.film_id
    JOIN category c ON fc.category_id = c.category_id
  `
      const params = []
      // Add filter for genre if genre exists
      if (genreName) {
        query += ' WHERE c.name = ?'
        params.push(genreName)
      }

      // Add filter for rating if rating exists
      if (rating) {
        if (params.length > 0) {
          query += ' AND f.rating = ?'
        } else {
          query += ' WHERE f.rating = ?'
        }
        params.push(rating)
      }

      query += ' ORDER BY f.film_id LIMIT ? OFFSET ?'
      params.push(limit)
      params.push(offset)

      const [movies] = await db.query(query, params)
      return movies
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
