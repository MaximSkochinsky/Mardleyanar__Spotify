const playlistUrls = {
    'popular-album' : '/spotify/tracks',
    'popular-playlist': '/spotify/topPlaylist',
    'popular-rock' : '/spotify/topRockPlaylist',
    'popular-electronic': '/spotify/topElectronicPlaylist',
    'searched-tracks': '/spotify/searchTracksByCriteria',
    'favorite-tracks': '/spotify/library/favorites',
    'popular-gaming': '/spotify/topVideoGamePlaylist',
    'global-top': '/spotify/globalTop',
    'fifa-soundtrack': '/spotify/fifaSoundtrack'
}


function createNoTracksText () {
    if (window.location.pathname === '/search') {
        if (document.getElementById('searched-tracks').childNodes.length == 0) {
            const noTracksDiv = document.createElement('div')
            noTracksDiv.style.color = "white";
            noTracksDiv.style.fontSize = "55px";
            noTracksDiv.style.textAlign = "center";
            noTracksDiv.style.margin = "0px auto";
            noTracksDiv.style.display = "block";
            const span = document.createElement('span')
            span.innerHTML = "No tracks..."

            noTracksDiv.appendChild(span)
            document.getElementById('searched-tracks').appendChild(noTracksDiv)
        }
    } 

    if (window.location.pathname !== '/library') return
    if (document.getElementById('favorite-tracks').childNodes.length < 2 && !document.getElementById('no-tracks-text')) {
        const noTracksText = document.createElement('span');
        noTracksText.innerHTML = "You don't have any favorite tracks..."
        if (window.innerWidth > 600) noTracksText.style.fontSize = "60px"
        else noTracksText.style.fontSize = "20px"
        noTracksText.style.color = "white"
        noTracksText.id = "no-tracks-text"
        document.getElementById('favorite').appendChild(noTracksText)
    }
}


function loadTracks(playlistElement, crieteria){
    return new Promise((resolve, reject) => {
        let playlistName = playlistElement.id;
        if(! playlistUrls[playlistName]){
            reject('Playlist ' + playlistName + ' not endpoint url');
            return;
        }

        fetch(playlistUrls[playlistName], {
            method:'POST', 
            body: JSON.stringify(crieteria),
            headers: { "Content-Type": "application/json" }
        }).then(response => {
            return response.json()
        }).then(data => {
            if(data.length === 0) {
                document.querySelector('.spinner').remove()
                console.log('asdasdasdasd')
                createNoTracksText()
                return;
            }

           

            data.forEach(element => {
                if (element.track) {
                    createTrackCard(playlistElement, element.track);
                }
                else createTrackCard(playlistElement, element)
            });


            console.log(document.getElementById('no-tracks-text'))
            createNoTracksText()

            resolve(playlistName);
        });
    });
}



function loadPlaylist(playlistElement){
    return new Promise((resolve, reject) => {
        let playlistName = playlistElement.id;
        if(! playlistUrls[playlistName]){
            reject('Playlist ' + playlistName + ' not endpoint url');
            return;
        }

        fetch(playlistUrls[playlistName]).then(response => {
            return response.json()
        }).then(data => {
            if(data.length === 0) {
                console.log('reject');
                reject('Playlist ' + playlistName + ' empty data');
                return;
            }

            data.forEach(element => {
                if (element.track) createTrackCard(playlistElement, element.track);
                else createTrackCard(playlistElement, element)
            });

            resolve(playlistName);
        });
    });
}

let currentPlayed = null;


function createTrackCard(playlistElement, track){
    if (!track['preview_url']) return

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add("image_wrapper")
    imageWrapper.id = track.id
    // imageWrapper.onclick = (event) => {
    //     let path = event.path
    //     if (path[0].className === "fa fa-pause") {
    //         path.shift()
    //     }
    //     if (path[1].id) {
    //         addToHistory(path[1].id)
    //     }
    // }

    const image = document.createElement('img');
    image.src  = track.album.images[0]['url'];
    image.classList.add("item__avatar");

    const albom = document.createElement('span')
    albom.classList.add('item__caption-item_albom');
    albom.innerHTML = track.name;

    const artist = document.createElement('span')
    artist.classList.add('item__caption-item_author');
    artist.innerHTML = track.artists.map(artist => {return artist.name}).join(', ');

    const figcaption = document.createElement("figcaption")
    figcaption.classList.add('item__caption-wrapper')

    const figure = document.createElement("figure");
    figure.classList.add("item");

    const extraOptions = document.createElement("div")
    extraOptions.classList.add('extra-buttons')

    const addToFavoritesButton = document.createElement("i")
    addToFavoritesButton.classList.add("fa-regular", "fa-heart", 'favorites-icon')
    addToFavoritesButton.setAttribute("aria-hidden", "true")
    addToFavoritesButton.onclick = (event) => {
        console.log(event.path[2].firstChild.id)
        const trackID = event.path[2].firstChild.id;
        addTrackToFavorites(localStorage.getItem("user"), trackID).then(data => {
            if(data.result === 'add'){
                addToFavoritesButton.classList.remove('fa-regular');
                addToFavoritesButton.classList.add('fa-solid');
                return;
            }
            addToFavoritesButton.classList.add('fa-regular');
            addToFavoritesButton.classList.remove('fa-solid');
        })
    }

    const removeFromFavoritesButton = document.createElement("i")
    removeFromFavoritesButton.classList.add("fa", "fa-trash")
    removeFromFavoritesButton.setAttribute("aria-hidden", "true")
    removeFromFavoritesButton.onclick = (event) => {
        console.log(event.path[2].firstChild.id)
        const trackID = event.path[2].firstChild.id;
        
        removeTrackFromFavorites(localStorage.getItem("user"), trackID).then(data => {
            window.location.reload()
        })
    }


    extraOptions.appendChild(addToFavoritesButton)
    extraOptions.appendChild(removeFromFavoritesButton)
    figcaption.appendChild(artist)
    figcaption.appendChild(albom)

    imageWrapper.append(image)
    figure.appendChild(imageWrapper)
    figure.appendChild(extraOptions)
    figure.appendChild(figcaption)

    if(track['preview_url']){
        let playButtonElem = document.createElement('div');
        playButtonElem.classList.add('play-button');
     
        playButtonElem.onclick = function (event){
            let player = document.getElementById('player');
            let playIcon = event.currentTarget.querySelector('i');

            if(currentPlayed === event.currentTarget){
                if(player.paused){
                    player.play()
                    playIcon.classList.remove('fa-play');
                    playIcon.classList.add('fa-pause');
                    return
                }
                player.pause();
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
                return
            }
            if(currentPlayed !== null){
                let playIcon = currentPlayed.querySelector('i');
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
            }

            currentPlayed = event.currentTarget;

            player.src = track['preview_url'];
            player.load();
            player.play();

            playIcon.classList.add('fa-pause');
            playIcon.classList.remove('fa-play');
        }

        let playIcon = document.createElement('i');
        playIcon.classList.add('fa', 'fa-play');
        playButtonElem.appendChild(playIcon);
        imageWrapper.appendChild(playButtonElem);

    }

    playlistElement.appendChild(figure)
}



const setContent = async () => {
    if (window.location.pathname === '/') {
        for(let childIndex in document.getElementById('playlists').children){
            let child = document.getElementById('playlists').children[childIndex];
            if(child.tagName === 'SECTION'){
                loadPlaylist(child).then(r => {
                    if (child.querySelector('.spinner')) child.removeChild(child.querySelector('.spinner'))
                    console.log(r + 'playlist loaded');
                }).catch(err => {
                    console.log(err);
                })
            }
        }
    }
    if (window.location.pathname === '/library') {
        loadFavoriteTracks()
    }
}


function loadFavoriteTracks () {
    const json = {
        user: localStorage.getItem("user"),
        sort: document.getElementById('sort').value
    }
    removeAllChildNodes(document.getElementById('favorite-tracks'))
    addLoadingSpinner(document.getElementById('favorite-tracks'))
    for(let childIndex in document.getElementById('favorite').children){
        let child = document.getElementById('favorite').children[childIndex];
        if(child.tagName === 'SECTION'){
            loadTracks(child, json).then(r => {
                if (child.querySelector('.spinner'))  child.removeChild(child.querySelector('.spinner'))
                console.log(r)
            }).catch(err => {
                console.log(err);
            })
        }
    }
}



