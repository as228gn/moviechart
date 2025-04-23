import gql from 'graphql-tag'

export const movieTypeDefs = gql`
 type Query {
    movieCountsByGenre(rating: String): [GenreCount]
    movieTitles(rating: String, genre: String): [String!]!
    averageRentalCount(rating: String): [AverageRentalCount]
  }

  type GenreCount {
    genre: String!
    count: Int!
  }

  type AverageRentalCount {
    genre: String
    averageRentalCount: Float
  }
  `
