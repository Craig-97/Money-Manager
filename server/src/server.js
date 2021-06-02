import { ApolloServer } from "apollo-server-express";
import { schema } from "./schema";
import express from "express";
import { connectToDatabase } from "./db/mongodb";

const startServer = async () => {
  const app = express();

  const server = new ApolloServer({
    schema
  });

  server.applyMiddleware({ app });

  await connectToDatabase();

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();
