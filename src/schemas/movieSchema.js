import gql from 'graphql-tag'

export const movieTypeDefs = gql`
 type Query {
    moviesByCategory(rating: String): MoviesByCategory!
    movieCountsByGenre(rating: String): [GenreCount]
  }

type Movie {
    film_id: ID
    title: String!
    rating: String
    rentalCount: Int
    genre: Genre
  }
  
   type MoviesByCategory {
    moviesByCategory: [MovieCategory!]!
  }

    type MovieCategory {
    genre: Genre!
    movies: [Movie!]!
    averageRentalCount: Float!
  }

  type Genre {
    category_id: ID!
    name: String
  }

  type GenreCount {
  genre: String!
  count: Int!
}
  `
