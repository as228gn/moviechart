import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { movieTypeDefs as typeDefs } from './schemas/movieSchema.js'
import { movieResolver as resolvers } from './resolvers/movieResolver.js'
import db from './config/db.js'

const app = express()

app.use(express.json())

// Anslut till databasen
db.getConnection()
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => {
    console.error('Database connection failed: ', err)
    process.exit(1)
  })

// Skapa Apollo Server
const serverApollo = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true
})

await serverApollo.start()

// Koppla Apollo till Express
app.use('/graphql', expressMiddleware(serverApollo))

// Starta servern
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`)
})
