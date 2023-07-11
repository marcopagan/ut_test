const intWrapper= document.getElementById("intwrapper");
const movWrapper= document.getElementById("movwrapper");
const wTemp= document.getElementById("w_temp");
const wWind= document.getElementById("w_wind");
const u = document.getElementById("ut_u");
const t = document.getElementById("ut_t");
const velocities = [.05, .9, .001];

let uPoints = [];
let tPoints = [];
let mode = "original";
let velocity = velocities[0];
let attractionFactor = 60;
let vectors = [{x: 0.1, y: 0.2}, {x: 0.05, y: 0.01}];
let mx = 0;
let my = 0;
let count = 0;
let time;
let weather;
//windspeed


function move(){
    count += .01;
    for (let i=0; i< u.children.length; i++){
        let circle = u.children[i];
        let cx = parseFloat(circle.getAttribute("cx"));
        let cy = parseFloat(circle.getAttribute("cy"));
        let r = parseFloat(circle.getAttribute("r"));
        let vx, vy;

        if (intersecate(cx, cy, r, r/2)) {
            circle.setAttribute('r', 10);
        }else{
            circle.setAttribute('r', 7);
        }

        if (mode == "original"){
            vx = lerp (cx, uPoints[i].x, velocity);
            vy = lerp (cy, uPoints[i].y, velocity);
        }else if(mode == "follow"){
            vx = lerp(cx, mx, velocity);
            vy = lerp(cy, my, velocity);
        }else if (mode == "random") {
            if (Math.random() > .5) {vx = cx+.5}else{vx = cx -.5}
            if (Math.random() > .5) {vy = cy+.5}else{vy = cy -.5}
        }else if (mode == "attraction") {
            let vector;
            if (intersecate(cx, cy, r, attractionFactor)) {vector = {x: mx, y:my}
            }else{vector = {x: uPoints[i].x, y:uPoints[i].y}}
            vx = lerp (cx, vector.x, velocity);
            vy = lerp (cy, vector.y, velocity);
        }else if (mode == "repulsion") {
            let vector = repulsion(cx, cy, r, i, attractionFactor, uPoints);
            vx = lerp (cx, vector.x, velocity);
            vy = lerp (cy, vector.y, velocity);
        }else if (mode == "size") {
            if (intersecate(cx, cy, r, attractionFactor)) {circle.setAttribute('r', 10)
            }else{circle.setAttribute('r', 7)}
            vx = lerp (cx, uPoints[i].x, velocity);
            vy = lerp (cy, uPoints[i].y, velocity);
        }else if (mode == "wind") {
            let f;
            if (Math.random() < .5) {f = -weather.windspeed}else{f = weather.windspeed}
            vx = lerp (cx, cx+f, weather.windspeed/50);
            vy = lerp (cy, cy, weather.windspeed/50);
        }
        circle.setAttribute('cx', vx);
        circle.setAttribute('cy', vy);

    }
    for (let i=0; i< t.children.length; i++){
        let circle = t.children[i];
        let cx = parseFloat(circle.getAttribute("cx"));
        let cy = parseFloat(circle.getAttribute("cy"));
        let r = parseFloat(circle.getAttribute("r"));
        let vx, vy;

        if (intersecate(cx, cy, r, r/2)) {
            circle.setAttribute('r', 10);
        }else{
            circle.setAttribute('r', 7);
        }

        if (mode == "original"){
            vx = lerp (cx, tPoints[i].x, velocity);
            vy = lerp (cy, tPoints[i].y, velocity);
        }else if(mode == "follow"){
            vx = lerp(cx, mx, velocity);
            vy = lerp(cy, my, velocity);
        }else if (mode == "random") {
            if (Math.random() < .5) {vx = cx+.5}else{vx = cx -.5}
            if (Math.random() < .5) {vy = cy+.5}else{vy = cy -.5}
        }else if (mode == "attraction") {
            let vector;
            if (intersecate(cx, cy, r, attractionFactor)) {vector = {x: mx, y:my}
            }else{vector = {x: tPoints[i].x, y:tPoints[i].y}}
            vx = lerp (cx, vector.x, velocity);
            vy = lerp (cy, vector.y, velocity);
        }else if (mode == "repulsion") {
            let vector = repulsion(cx, cy, r, i, attractionFactor, tPoints);
            vx = lerp (cx, vector.x, velocity);
            vy = lerp (cy, vector.y, velocity);
        }else if (mode == "size") {
            if (intersecate(cx, cy, r, attractionFactor)) {circle.setAttribute('r', 10)
            }else{circle.setAttribute('r', 7)}
            vx = lerp (cx, tPoints[i].x, velocity);
            vy = lerp (cy, tPoints[i].y, velocity);
        }else if (mode == "wind") {
            let f;
            if (Math.random() < .5) {f = -weather.windspeed}else{f = weather.windspeed}
            vx = lerp (cx, cx+f, weather.windspeed/50);
            vy = lerp (cy, cy, weather.windspeed/50);
        }
        circle.setAttribute('cx', vx);
        circle.setAttribute('cy', vy);
    }
}

function loadOGPoints(){
    for (let i=0; i< u.children.length; i++){
        let circle = u.children[i];
        let cx = circle.getAttribute("cx");
        let cy = circle.getAttribute("cy");
        uPoints.push({x: cx, y:cy});
    }
    for (let i=0; i< t.children.length; i++){
        let circle = t.children[i];
        let cx = circle.getAttribute("cx");
        let cy = circle.getAttribute("cy");
        tPoints.push({x: cx, y:cy});
    }
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}

function intersecate(x, y, r, tollerance){
    if (mx > x-(r/2)-tollerance && mx < x+(r/2)+tollerance && my > y-(r/2)-tollerance && my < y+(r/2)+tollerance) {
        return true;
    }else{
        return false;
    }
}

function refreshMouse(){
    mx = window.event.clientX;
    my = window.event.clientY;
}

async function fetchMeteo(){
    let url = "https://api.open-meteo.com/v1/forecast?latitude=47.36667&longitude=8.55&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m&windspeed_unit=ms";

    await fetch(url)
        .then(res => {
            return res.json();
        })
        .then(data => {
            // Getting data
            weather = data.current_weather;
            wTemp.innerHTML = data.current_weather.temperature;
            wWind.innerHTML = data.current_weather.windspeed;
        });
}

function repulsion(x, y, r, i, tollerance, OGPointList){
    let rx, ry;
    if (mx > x-(r/2)-tollerance && my > y-(r/2)-tollerance && my < y+(r/2)+tollerance){
        rx = mx + 50;
    }else{
        rx = OGPointList[i].x;
    }


    if (mx < x+(r/2)+tollerance && my > y-(r/2)-tollerance && my < y+(r/2)+tollerance){
        rx = mx - 50;
    }else{
        rx = OGPointList[i].x;
    }


    if (my > y-(r/2)-tollerance && mx > x-(r/2)-tollerance && mx < x+(r/2)+tollerance){
        ry = my + 50;
    }else{
        ry = OGPointList[i].y;
    }


    if (my < y+(r/2)+tollerance && mx > x-(r/2)-tollerance && mx < x+(r/2)+tollerance){
        ry = my - 50;
    }else{
        ry = OGPointList[i].y;
    }

    return {x: rx, y: ry}
}


document.addEventListener('keypress', (event) => {
    let key = event.key;
    console.log(key);
    if(key == "o"){mode = "original"}
    else if(key == "f"){mode = "follow"}
    else if(key == "r"){mode = "random"}
    else if(key == "a"){mode = "attraction"}
    else if(key == "e"){mode = "repulsion"}
    else if(key == "z"){mode = "size"}
    else if(key == "w"){mode = "wind"}
    else if(key == "1"){velocity = velocities[0]; movWrapper.innerHTML = "natural"}
    else if(key == "2"){velocity = velocities[1]; movWrapper.innerHTML = "quantum"}
    else if(key == "3"){velocity = velocities[2]; movWrapper.innerHTML = "slow natural"}
    intWrapper.innerHTML = mode;
}, false);





loadOGPoints();
fetchMeteo();
setTimeout(function() {
    console.log("start");
    setInterval(function() {
        move()
    }, 10);
}, 2000);






/*function loadShape(filename) {
    let toLoad = document.createElement("div");
    fetch('res/'+filename+".svg")
        .then(response => response.text())
        .then((data) => {

        toLoad.innerHTML = data;
        let svg = toLoad.children[0];
        let ul = svg.children[0];
        let tl = svg.children[1];

        for (let i=0; i< ul.children.length; i++){
            let circle = ul.children[i];
            let cx = circle.getAttribute("cx");
            let cy = circle.getAttribute("cy");
            uLoaded.push({x: cx, y:cy});
        }
        for (let i=0; i< tl.children.length; i++){
            let circle = tl.children[i];
            let cx = circle.getAttribute("cx");
            let cy = circle.getAttribute("cy");
            tLoaded.push({x: cx, y:cy});
        }
    });

}*/













