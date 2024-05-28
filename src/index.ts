import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import db from './_db';

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        authors: () => db.authors,
        author: (_, args) => db.authors.find(author => author.id === args.id),
        games: () => db.games,
        game: (_, args) => db.games.find(game => game.id === args.id) ,
        reviews: () => db.reviews,
        review: (_, args) => db.reviews.find(review => review.id === args.id) 
    },
    Game: {
        reviews: (parent) => db.reviews.filter(review => review.game_id === parent.id) ?? []
    },
    Author: {
        reviews: (parent) => db.reviews.filter(review => review.author_id === parent.id) ?? []
    },
    Review: {
        author: (parent) => db.authors.find(author => author.id === parent.author_id),
        game: (parent) => db.games.find(game => game.id === parent.game_id)
    },
    Mutation: {
        addGame: (_, args) => {
            const game = {
                ...args.game,
                id: Math.floor(Math.random() * 1000).toString(),
            }
            db.games.push(game);

            return game;
        },
        updateGame: (_, args) => {
            const index = db.games.findIndex(g => g.id === args.id);
            const game = {
                ...db.games[index],
                ...args.edits,
            };
            db.games[index] = game;
            return game;
        },
        deleteGame: (_, args) => {
            db.games = db.games.filter(game => game.id !== args.id);
            return db.games;
        },
        deleteAuthor: (_, args) => {
            db.authors = db.authors.filter(author => author.id !== args.id);
            return db.authors;
        },
        addReview: (_, args) => {
            const review = {
                ...args.review,
                author_id: args.authorId,
                game_id: args.gameId,
                id: Math.floor(Math.random() * 1000).toString(),
            };

            db.reviews.push(review);

            return review;
        },
        deleteReview: (_, args) => {
            db.reviews = db.reviews.filter(review => review.id !== args.id);
            return db.reviews;
        }
    }
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);