import gql from 'graphql-tag'

export const movieTypeDefs = gql`
 type Query {
    movies(genreName: String, rating: String, limit: Int = 100, offset: Int = 0): MoviePage!
    movie(id: ID!): Movie
    actors: [Actor!]!
  }

type Movie {
    film_id: ID
    title: String!
    description: String
    release_year: Int
    rating: String
    rentalCount: Int
    genre: Genre
    actors: [Actor]
  }

  type MoviePage {
    movies: [Movie!]!
    hasMore: Boolean!
  }

  type Actor {
    actor_id: ID!
    first_name: String!
    last_name: String
  }

  type Genre {
    category_id: ID!
    name: String
  }
  `
