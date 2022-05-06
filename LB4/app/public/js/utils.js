

// add track with current ID to favorites
const addTrackToFavorites = async (user, trackID) => {
    const json = {
        user: user,
        trackID: trackID
    }
    return fetch('/spotify/update/favorites', {
        method: 'POST',
        body: JSON.stringify(json),
        headers: { "Content-Type": "application/json" }
    }).then((response) => response.json());
}

// get json data to put in body of POST request later
const getJson = (formData) => {
    var object = {};
    formData.forEach((value, key) => object[key] = value);
    return object;
}


// remove all child Nodes of html tag
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}


// function loadUserAvatar() {
//     if (document.getElementById("user_avatar")) {
//         document.getElementById("user_avatar").setAttribute('src', avatarSrc)
//     }
// }


// making a loading spinner div and pushing it in page
function addLoadingSpinner(parent) {
    let circle = document.createElement('div')
    circle.classList.add('circle')

    let spinner = document.createElement('div')
    spinner.classList.add('spinner')

    spinner.appendChild(circle)
    parent.appendChild(spinner)
}

//add user to localStorage
const addUser = (data) => {
    localStorage.clear();
    console.log(data.email)
    localStorage.setItem("email", data["email"]);
    localStorage.setItem("user", data["user"]);
    localStorage.setItem("password", data["password"]);
} 

// check if user exists in current session (may be I'll upgrade this logic)
const userExists = () => {
    if (localStorage.getItem("user")) return true;
    else return false;
}

// validate input to correct email
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}


// pushing all searched tracks to search page
const searchHandler =  async (event) =>{
    event.preventDefault()

    const json = {
        value: document.getElementById('search_text').value
    }

    let searchedTracksElem = document.getElementById('searched-tracks');
    removeAllChildNodes(searchedTracksElem)
    addLoadingSpinner(searchedTracksElem)
    searchedTracksElem.classList.remove('grid');
    for(let childIndex in document.getElementById('playlists').children){
        let child = document.getElementById('playlists').children[childIndex];
        if(child.tagName === 'SECTION'){
            loadTracks(child, json).then(r => {
                if (child.querySelector('.spinner'))  child.removeChild(child.querySelector('.spinner'))
                searchedTracksElem.classList.add('grid');
                console.log(r + 'playlist loaded');
            }).catch(err => {
                console.log(err);
            })
        }
    }

} 


function sortTracks() {
    console.log('asdasdasdasdasd')
    loadFavoriteTracks()
}

