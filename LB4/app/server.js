// берём Express
const express = require('express');
const path = require('path');
const {createUser, findUser, updateUser, createUserFavorites, updateUserFavorites, getUserFavorites, removeUserFavorites, 
    checkTokensCollection, getCredentialsFromDB, insertCredentialsInDB, updateCredentialsInDB} = require("./db")
const bodyParser = require('body-parser');
const {MongoClient} = require("mongodb");
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');


const {uri, spotifyConfig} = require('./config')
const spotifyApi = new SpotifyWebApi(spotifyConfig);



const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});


client.connect().then(async () => {

    
    let spotifyCred = {access_token: '', refresh_token: ''};
   

    if (await checkTokensCollection(client) != 0) {
        spotifyCred = (await getCredentialsFromDB(client))[0];
        console.log(spotifyCred)
        updateApiCred();
        if(spotifyCred['time']){
            refreshAccessToken().catch(err => {
                console.log(err);
                process.exit(0);
            });
        } else{
            console.log('invalid cred. no time');
            process.exit(0);
        }
    }
    
    
    function updateApiCred(){
        spotifyApi.setAccessToken(spotifyCred['access_token']);
        spotifyApi.setRefreshToken(spotifyCred['refresh_token']);
    }
    
    async function saveCred(){
        spotifyCred['time'] = Date.now();
        console.log('hereууууууу')
        if (await checkTokensCollection(client) == 0) {
            insertCredentialsInDB(client, spotifyCred)
        }
        else {
            updateCredentialsInDB(client, spotifyCred)
        }
    }
    
    function refreshAccessToken() {
        return new Promise((reject) => {
            let expiresUnixTime = spotifyCred['time'] + (3600 * 1000);
            if (Date.now() > expiresUnixTime) {
                spotifyApi.clientCredentialsGrant().then(async (data) => {
                        spotifyCred['access_token'] = data.body['access_token'];
                        await saveCred();
                    },
                    function (err) {
                        reject(err);
                    });
            }
            setTimeout(refreshAccessToken, 1000 * 60);
        });
    }

    
    // создаём Express-приложение
    const app = express();
    
    
    app.use(express.static(__dirname + '/public'))
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    
    app.post('/content/signup', async (req, res) => {
        const data = req.body;
        const user = await findUser(client, {
            user: data.user
        })
        if (user) {
            res.send("Such user already exists!")
        } else {
            await createUser(client, {
                email: data.email,
                user: data.user,
                password: data.password,
                avatar: data.avatar
            })
            await createUserFavorites(client, {user: data.user})
            res.send("OK")
        }
    })
    
    
    
    
    
    app.post('/content/login', async (req, res) => {
        const data = req.body;
        const user = await findUser(client, {
            email: data.email,
            password: data.password
        })
    
        if (user) {
            res.send(user.user)
        } else {
            res.send("ERROR!")
        }
    })
    
    
    app.post('/update/email', async (req, res) => {
        const data = req.body
        const user = await findUser(client, {
            email: data.email
        })
        const dublicate = await findUser(client, {
            email: data.newEmail
        })
        if (user && !dublicate) {
            await updateUser(client, data.email, data.newEmail);
            res.send("OK");
        } else {
            res.send("Dublicate User!");
        }
    })
    
    
    
    
    
    //Spotify routes
    app.post('/spotify/update/favorites', async (req, res) => {
        const data = req.body;
        const favorites = await getUserFavorites(client, data.user);
    
        if(favorites.includes(data.trackID)){
            await removeUserFavorites(client, data.trackID, data.user);
            res.send({result: "remove"})
            return;
        }
    
        await updateUserFavorites(client, data.trackID, data.user)
        res.send({result: "add"})
    })
    
    
    app.post('/spotify/searchTracksByCriteria', (req, res) => {
        const search = req.body.value;
        let searchedByAuthor = [];
        let searchedByTrack = [];
    
        spotifyApi.searchTracks(`artist:${search}`)
        .then(function(data) {
            searchedByAuthor = data.body.tracks.items;
        }, function(err) {
            console.log('Something went wrong!', err);
        }).then(() => {
            spotifyApi.searchTracks(`track:${search}`)
            .then(function(data) {
                searchedByTrack = data.body.tracks.items;
                let result = [...new Set([...searchedByTrack ,...searchedByAuthor])];
                console.log(result)
                res.send(result)
            }, function(err) {
                console.log('Something went wrong!', err);
            });
        });
    })
    
    
    
    app.post('/spotify/library/favorites', async (req, res) => {
        const user = req.body.user
        const sort = req.body.sort
        const tracks = await getUserFavorites(client, user)
        if (!tracks) {
            res.send([])
            return
        }
        if (tracks.length == 0) {
            res.send([])
            return
        }
        spotifyApi.getTracks(tracks).then(
            (data) => {
                console.log(data.body)
                let sortedTracks = data.body.tracks
                if (sort == 2) {
                    console.log('asdasdasdasd')
                    sortedTracks.sort((a,b) => (a.popularity > b.popularity) ? 1 : ((b.popularity > a.popularity) ? -1 : 0))
                }
                else if (sort == 3) {
                    sortedTracks.sort(function(a, b){
                        var nameA = a.name.toLowerCase(), nameB = b.name.toLowerCase();
                        if (nameA < nameB) //sort string ascending
                         return -1;
                        if (nameA > nameB)
                         return 1;
                        return 0; //default return value (no sorting)
                    });
                }
                else if (sort == 4) {
                    sortedTracks.sort((a, b) => {
                            if (new Date(a.album.release_date) > new Date(b.album.release_date)) return 1
                            else if (new Date(b.album.release_date) > new Date(a.album.release_date)) return -1;
                            else return 0;
                    })
                }
                res.send(sortedTracks)
            }
        )
    })
    
    
    
    
    
    app.get('/spotify/tracks', (req, res) => {
        spotifyApi.getMyTopTracks()
            .then(function (data) {
                let topTracks = data.body.items;
                res.send(topTracks)
            }, function (err) {
                console.log(err);
                res.send([]);
            });
    });
    
    
    
    
    app.get('/spotify/topPlaylist', (req, res) => {
        spotifyApi.getPlaylist('3ZgmfR6lsnCwdffZUan8EA', {limit: 15})
        .then(function(data) {
            let topPlaylistTracks = data.body.tracks.items;
            res.send(topPlaylistTracks)
        }, function(err) {
            console.error(err);
            res.send([]);
        });
    })
    
    
    app.get('/spotify/topRockPlaylist', (req, res) => {
        spotifyApi.getPlaylist('37i9dQZF1DWWSuZL7uNdVA', {limit: 15})
        .then(function(data) {
            let topPlaylistTracks = data.body.tracks.items;
            res.send(topPlaylistTracks)
        }, function(err) {
            console.error(err);
            res.send([]);
        });
    })
    
    app.get('/spotify/topElectronicPlaylist', (req, res) => {
        spotifyApi.getPlaylist('37i9dQZF1DXdXliePGSvEb', {limit: 15})
        .then(function(data) {
            let topPlaylistTracks = data.body.tracks.items;
            res.send(topPlaylistTracks)
        }, function(err) {
            console.error(err);
            res.send([]);
        });
    })
    
    
    
    app.get('/spotify/auth', (req, res) => {
        console.log('sadasdasd');
        const authorizeURL = spotifyApi.createAuthorizeURL(['user-read-private', 'user-read-email', 'user-top-read']);
        res.redirect(authorizeURL);
    });
    
    app.get('/spotify/callback', (req, res) => {
        let code = req.query.code
        spotifyApi.authorizationCodeGrant(code).then(
            function (data) {
                spotifyCred = data.body;
                saveCred();
                updateApiCred();
                res.redirect('/');
            },
            function (err) {
                res.send(err);
                process.exit(0);
            }
        );
    })
    
    
    app.get('*', function (req, res) {
        res.sendFile(path.join(__dirname, 'index.html'));
    });
    
    
    // запускаем сервер на порту 8080
    app.listen(process.env.PORT || 8080);
    // отправляем сообщение
    console.log('Сервер стартовал!');
})
