const routes = {
    404: "404",
    "/": "home",
    "/account":  "account",
    "/info": "info",
    "/signup": "signup",
    "/search": "search",
    "/library": "library",
    "/intelligence": 'intelligence',
    "/settings": "settings"
}

const handleLocation = async () => {
    const path = window.location.pathname;
    const routeName = routes[path] || routes[404];

    if (userExists()) {
        await renderContent(routeName);
        linkCss(routeName);
        setUserInfo();
        setContent();
    }
    else {
        if (window.location.pathname != '/signup') window.location.assign('/signup');
        await renderContent('signup');
        linkCss('signup');
    }

}

async function renderContent(routeName) {
    const url = generateRouteUrl(routeName);
    document.getElementById("content").innerHTML = await fetch(url).then((data) => data.text());
}


function generateRouteUrl(routeName) {
    return '../pages/' + routeName + '.html';
}

function generateCssUrl(routeName){
    return '../css/' + routeName + '.css';
}

function linkCss(routeName) {
    const styles = document.styleSheets;
    const styleMap = {};
    for(let i=0; i< styles.length; i++){
        let style = styles[i];
        let styleId = style.ownerNode.id;
        if(styleId){
            styleMap[styleId] = style;
        }
    }

    if(!styleMap[routeName]){
        const cssUrl = generateCssUrl(routeName);
        const head = document.head;
        const link = document.createElement("link");
        link.id = routeName;
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = cssUrl;

        head.appendChild(link);
    }

    for(let styleId in styleMap){
        if(styleId === routeName){
            styleMap[styleId].disabled = false;
            continue;
        }
        styleMap[styleId].disabled = true;
    }

}


window.onpopstate = handleLocation;
window.route = route;


handleLocation();