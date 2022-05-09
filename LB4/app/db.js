const database = require("mime-db");
const { MongoClient } =  require("mongodb");

// методы CRUD (пользователь, любимые треки)
module.exports = {
    createUser: async (client, newUser) => {
        return await client.db("test").collection("user").insertOne(newUser);
    },
     
    findUser: async (client, user) => {
        return await client.db("test").collection("user").findOne(user);
    },

    updateUser: async (client, email, newEmail) => {
        const result = await client.db("test").collection("user").updateOne(
            { "email": email },    
            { $set: { "email": newEmail } },
            { upsert: true }
        )
    } ,

    createUserFavorites: async(client, newUser) => {
        return await client.db("test").collection("favorites").insertOne(
            {
                "user": newUser.user,
                "trackIDS": []
            }
        )
    },

    updateUserFavorites: async (client, id, user) => {
        return await client.db("test").collection("favorites").updateOne(
            { "user": user },
            { $addToSet: { "trackIDS": id } }
        )
    },

    removeUserFavorites: async (client, id, user) => {
        return await client.db("test").collection("favorites").updateOne({user: user}, {$pull: {trackIDS: id}});
    },



    getUserFavorites: async (client, user) => {
        const data = await client.db("test").collection("favorites").findOne(
            {"user": user}
        )
        if (data) return data.trackIDS;
    },

    // createUserHistory: async(client, newUser) => {
    //     return await client.db("test").collection("history").insertOne(
    //         {
    //             "user": newUser.user,
    //             "trackIDS": []
    //         }
    //     )
    // },

    // updateUserHistory: async (client, id, user) => {
    //     return await client.db("test").collection("history").updateOne(
    //         { "user": user },
    //         { $addToSet: { "trackIDS": id } }
    //     )
    // },

    // getUserHistory: async (client, user) => {
    //     const data = await client.db("test").collection("history").findOne(
    //         {"user": user}
    //     )
    //     if (data) return data.trackIDS;
    // },

    checkTokensCollection:  async (client) => {
        return await client.db("test").collection("tokens").count()
    },

    getCredentialsFromDB: async (client) => {
        return await client.db('test').collection('tokens').find({}).toArray()
    },

    insertCredentialsInDB: async (client, creds) => {
        await client.db('test').collection('tokens').insertOne(creds)
    }, 
    
    updateCredentialsInDB: async (client, newCreds) => {
        await client.db('test').collection('tokens').updateOne({}, { $set: newCreds})
    },

    removeUserFavorites: async (client, id, user) => {
        return await client.db("test").collection("favorites").updateOne({user: user}, {$pull: {trackIDS: id}});
    },

    // findDublicateInFavorites: async (client, id, user) => {
    //     return await client.db("test").collection("favorites").find(
    //         { user: user, trackIDS: { $in: [id] } }
    //     )
    // }

}



