const { MongoClient, ObjectId } = require('mongodb');
const uri = "mongodb+srv://dbUser:Password@cluster0.1tj1ppj.mongodb.net/";
const client = new MongoClient(uri);

client.connect();
const db = client.db('GameExchangerDB');



let dal = {
    // Game Methods
    async addGame(game) {
        try {
            const gamesCollection = db.collection('Games');
            game.ownerId = null;
            const result = await gamesCollection.insertOne(game);
            return result;
        } catch (error) {
            console.error("Error adding game:", error);
        }
    },

    async getAllGames() {
        try {
            const gamesCollection = db.collection('Games');
            const games = await gamesCollection.find({}).toArray();
            return games;
        } catch (error) {
            console.error("Error getting games:", error);
        }
    },

    async updateGame(id, updateData) {
        try {
            const gamesCollection = db.collection('Games');
            const result = await gamesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            return result;
        } catch (error) {
            console.error("Error updating game:", error);
        }
    },

    async replaceGame(id, newGameData) {
        try {
            const gamesCollection = db.collection('Games');
            newGameData.ownerId = newGameData.ownerId || null; 
            const result = await gamesCollection.replaceOne({ _id: new ObjectId(id) }, newGameData);
            return result;
        } catch (error) {
            console.error("Error replacing game:", error);
        }
    },

    async deleteGame(id) {
        try {
            const gamesCollection = db.collection('Games');
            const result = await gamesCollection.deleteOne({ _id: new ObjectId(id) });
            return result;
        } catch (error) {
            console.error("Error deleting game:", error);
        }
    },

    //User Methods

    async addUser(user) {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const usersCollection = db.collection('Users');
            const result = await usersCollection.insertOne(user);
            return result;
        } catch (error) {
            console.error("Error adding user:", error);
        }
    },

    async getAllUsers() {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const usersCollection = db.collection('Users');
            const users = await usersCollection.find({}).toArray();
            return users;
        } catch (error) {
            console.error("Error getting users:", error);
        }
    },

    async updateUser(id, updateData) {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const usersCollection = db.collection('Users');
            const result = await usersCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            return result;
        } catch (error) {
            console.error("Error updating user:", error);
        }
    },

    async replaceUser(id, newUserData) {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const usersCollection = db.collection('Users');
            const result = await usersCollection.replaceOne({ _id: new ObjectId(id) }, newUserData);
            return result;
        } catch (error) {
            console.error("Error replacing user:", error);
        }
    },

    async deleteUser(id) {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const usersCollection = db.collection('Users');
            const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
            return result;
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    },

    async getUserGames(userId) {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const gamesCollection = db.collection('Games');
            const userGames = await gamesCollection.find({ ownerId: userId }).toArray();
            return userGames;
        } catch (error) {
            console.error("Error getting user games:", error);
        }
    },

    //Exchange Methods
    async addExchange(exchange) {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const exchangesCollection = db.collection('Exchanges');
            const result = await exchangesCollection.insertOne(exchange);
            return result;
        } catch (error) {
            console.error("Error adding exchange:", error);
        }
    },

    async getAllExchanges() {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const exchangesCollection = db.collection('Exchanges');
            const exchanges = await exchangesCollection.find({}).toArray();
            return exchanges;
        } catch (error) {
            console.error("Error getting exchanges:", error);
        }
    },

    async updateExchange(id, updateData) {
        try {
            await client.connect();
            const db = client.db('GameExchangerDB');
            const exchangesCollection = db.collection('Exchanges');
            const result = await exchangesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
            return result;
        } catch (error) {
            console.error("Error updating exchange:", error);
        }
    },

}

exports.dal = dal;