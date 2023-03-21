const modeWrapper= document.getElementById("modewrapper");
let uPoints = [];
let tPoints = [];
let uLoaded = [];
let tLoaded = [];
let mode = "original";
let velocity = .05;
let attractionFactor = 60;
let vectors = [{x: 0.1, y: 0.2}, {x: 0.05, y: 0.01}];
let mx = 0;
let my = 0;
let time, sin;
let count = 0;

const u = document.getElementById("ut_u");
const t = document.getElementById("ut_t");

function move(){
    count += .01;
    for (let i=0; i< u.children.length; i++){
        time = new Date();
        sin = Math.sin(count);
        //sin = Math.sin(count*(((i/2)+1)*.3));
        let circle = u.children[i];
        let cx = parseFloat(circle.getAttribute("cx"));
        let cy = parseFloat(circle.getAttribute("cy"));
        let r = parseFloat(circle.getAttribute("r"));
        let vx, vy;

        if (intersecate(cx, cy, r, r/2)) {
            circle.setAttribute('r', 15);
        }else{
            circle.setAttribute('r', 10);
        }

        if (mode == "original"){
            vx = lerp (cx, uPoints[i].x, velocity);
            vy = lerp (cy, uPoints[i].y, velocity);
        }else if(mode == "follow"){
            vx = lerp(cx, mx, velocity);
            vy = lerp(cy, my, velocity);
        }else if (mode == "diagonal") {
            vx = lerp(cx, cy, .005);
            vy = lerp(cy, cx, .005);
        }else if (mode == "random") {
            if (Math.random() > .5) {vx = cx+.5}else{vx = cx -.5}
            if (Math.random() > .5) {vy = cy+.5}else{vy = cy -.5}
        }else if (mode == "transition") {
            vx = lerp (cx, uLoaded[i].x, velocity);
            vy = lerp (cy, uLoaded[i].y, velocity);
        }else if (mode == "sin") {
            vx = lerp (cx, uPoints[i].x*(sin+1), velocity);
            vy = lerp (cy, cy, velocity);
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
            if (intersecate(cx, cy, r, attractionFactor)) {circle.setAttribute('r', 15)
            }else{circle.setAttribute('r', 10)}
            vx = lerp (cx, uPoints[i].x, velocity);
            vy = lerp (cy, uPoints[i].y, velocity);
        }
        circle.setAttribute('cx', vx);
        circle.setAttribute('cy', vy);

    }
    for (let i=0; i< t.children.length; i++){
        time = new Date();
        sin = Math.sin(count);
        //sin = Math.sin(count*(((i/2)+1)*.3));
        let circle = t.children[i];
        let cx = parseFloat(circle.getAttribute("cx"));
        let cy = parseFloat(circle.getAttribute("cy"));
        let r = parseFloat(circle.getAttribute("r"));
        let vx, vy;

        if (intersecate(cx, cy, r, r/2)) {
            circle.setAttribute('r', 15);
        }else{
            circle.setAttribute('r', 10);
        }

        if (mode == "original"){
            vx = lerp (cx, tPoints[i].x, velocity);
            vy = lerp (cy, tPoints[i].y, velocity);
        }else if(mode == "follow"){
            vx = lerp(cx, mx, velocity);
            vy = lerp(cy, my, velocity);
        }else if (mode == "diagonal") {
            vx = lerp(cx, cy, .005);
            vy = lerp(cy, cx, .005);
        }else if (mode == "random") {
            if (Math.random() < .5) {vx = cx+.5}else{vx = cx -.5}
            if (Math.random() < .5) {vy = cy+.5}else{vy = cy -.5}
        }else if (mode == "transition") {
            vx = lerp (cx, tLoaded[i].x, velocity);
            vy = lerp (cy, tLoaded[i].y, velocity);
        }else if (mode == "sin") {
            vx = lerp (cx, tPoints[i].x*(sin+1), velocity);
            vy = lerp (cy, cy, velocity);
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
            if (intersecate(cx, cy, r, attractionFactor)) {circle.setAttribute('r', 15)
            }else{circle.setAttribute('r', 10)}
            vx = lerp (cx, tPoints[i].x, velocity);
            vy = lerp (cy, tPoints[i].y, velocity);
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

function refreshMouse(){
    mx = window.event.clientX;
    my = window.event.clientY;
}

function loadShape(filename) {
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

}

function intersecate(x, y, r, tollerance){
    if (mx > x-(r/2)-tollerance && mx < x+(r/2)+tollerance && my > y-(r/2)-tollerance && my < y+(r/2)+tollerance) {
        return true;
    }else{
        return false;
    }
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


function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function lerp (start, end, amt){
  return (1-amt)*start+amt*end
}


document.addEventListener('keypress', (event) => {
    let key = event.key;
    if(key == "o"){mode = "original"}
    else if(key == "f"){mode = "follow"}
    else if(key == "d"){mode = "diagonal"}
    else if(key == "r"){mode = "random"}
    else if(key == "t"){mode = "transition"}
    else if(key == "s"){mode = "sin"}
    else if(key == "a"){mode = "attraction"}
    else if(key == "e"){mode = "repulsion"}
    else if(key == "z"){mode = "size"}
    modeWrapper.innerHTML = mode;
}, false);





loadOGPoints();
loadShape("circle");
setTimeout(function() {
    console.log("start");
    setInterval(function() {
        move()
    }, 10);
}, 2000);













