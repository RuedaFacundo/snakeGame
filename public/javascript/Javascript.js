let paper = document.querySelector("canvas");
let context = paper.getContext("2d");
var modal = new bootstrap.Modal(document.getElementById('Modal'), {})
let buttonModal = document.getElementById('buttonModal');
let up = document.getElementById('up');
let down = document.getElementById('down');
let left = document.getElementById('left');
let right = document.getElementById('right');
let scoreDiv = document.getElementById('score');
let gameOver = new bootstrap.Modal(document.getElementById('gameOver'), {});
let buttonClose = document.getElementById('buttonClose');
let game = document.getElementById('game');
let error = document.getElementById('error');
var table = document.getElementById("table");
let play = document.getElementById('play');
let namePlayer = "";
let scoreFinal = 0;

// Variables
let direction; 
const INTERVAL = 80;
const WEIGHT = 10;
const WIDTH = 500;
let score = 1;

// Objetos
DIRECCIÓN = {      
	A: [-1, 0], 
	D: [1, 0],
    S:  [0, 1], 
    W: [0, -1],
    a: [-1, 0], 
    d: [1, 0],
    s:  [0, 1], 
    w: [0, -1],
	ArrowDown: [0, 1],         
	ArrowUp:[0, -1], 	  
    ArrowRight:[1, 0],  
    ArrowLeft: [-1, 0], 
}

class Person {
    constructor(position, name, score) {
        this.position = position;
        this.name = name;
        this.score = score;
    }

}

// Eventos para los botones de movimiento
up.addEventListener('click', function() {clickBtn(up); joystick(0, -1); }) 
down.addEventListener('click', function() {clickBtn(down); joystick(0, 1) }) 
left.addEventListener('click', function() {clickBtn(left); joystick(-1, 0) }) 
right.addEventListener('click', function() {clickBtn(right); joystick(1, 0) })

function joystick (dx, dy) {
    direction = [dx, dy]
    const [x, y] = direction
    if(-x !== controls.direccion.x && -y !== controls.direccion.y){
        controls.direccion.x = x;
        controls.direccion.y = y;
    }
}

let controls = {
    direccion: {x:1, y:0}, 
    snake:[{x:0, y:0}], 
    victim:{x:0, y:250}, 
    playing: false, 
    increase: 0
}

// detectar cuando se apreta una tecla y hacer un condicional para no vuelva sobre si misma.
document.onkeydown = (e) =>{
    direction = DIRECCIÓN[e.key]
    selectedKey(e.key);
    const [x, y] = direction
    if(-x !== controls.direccion.x && -y !== controls.direccion.y){
        controls.direccion.x = x;
        controls.direccion.y = y;
    }
}

// Animacion al tocar una tecla
function selectedKey (e) {
    let key = e.toUpperCase();
    switch (key) {
        case "A":
        case "ARROWLEFT":
            clickBtn(left);
            break;
        case "ARROWDOWN":
        case "S":
            clickBtn(down);
            break;
        case "ARROWUP":
        case "W":
            clickBtn(up);
            break;
        case "ARROWRIGHT":
        case "D":
            clickBtn(right);
            break;
    }
}

// animacion de los botones del joystick
function clickBtn (btn){
    btn.classList.add("active")
    setTimeout(function (){
        btn.classList.remove("active")
    }, 150);
}

// mueve la serpiente cada 80 milisegundos
let looper = () => {
    let tail = {};
    Object.assign(tail, controls.snake[controls.snake.length -1])
    const sq = controls.snake[0];
    let isTrapped = sq.x === controls.victim.x && sq.y === controls.victim.y
    if(crash()){
        score = 1;
        scoreDiv.innerHTML=("SCORE: ");
        controls.playing = false;
        gameOver.show();
        document.getElementById('nameModalFinal').innerHTML= "¡Congratulations! " + namePlayer;
        document.getElementById('scoreFinal').innerHTML= "Score: " + scoreFinal;
        deleteRow();
        savePlayer("https://apisnakegame.herokuapp.com/player", data = { name: namePlayer, score: scoreFinal } );
        scoreFinal = 0;
        return;
    } 
    let dx = controls.direccion.x;
    let dy = controls.direccion.y;
    let tamaño = controls.snake.length -1;
    if(controls.playing){
        for(let idx = tamaño; idx>-1; idx--){
            const sq = controls.snake[idx];
            if (idx === 0){
                sq.x += dx;
                sq.y += dy;
            } else {
                sq.x = controls.snake[idx-1].x;
                sq.y = controls.snake[idx-1].y;
            }
        }
    }
    if (isTrapped){
        controls.increase += 5
        revictim()
        scoreFinal = score;
        scoreDiv.innerHTML=("SCORE: " + score++);
    }
    if (controls.increase >0){
        controls.snake.push(tail)
        controls.increase -=1
    }
    requestAnimationFrame(draw);
    setTimeout(looper, INTERVAL);
}

// metodo que dibuja la serpiente
let draw = () => {
	context.clearRect(0,0,WIDTH,WIDTH)
    for (let idx =0; idx < controls.snake.length; idx ++){
        const {x, y} = controls.snake[idx]
        drawActors("#5D8233", x, y)
    }
    const victim = controls.victim   
    drawActors("#CD113B", victim.x, victim.y)
}

let drawActors = (color, x, y) => {
    context.fillStyle = color;
    context.fillRect(x*WEIGHT, y*WEIGHT, WEIGHT, WEIGHT)
}

// cuando come la victima, la reposiciona en otro lado.
let revictim = () => {
    let newPosition = random ();
    let victim = controls.victim;
    victim.x = newPosition.x;
    victim.y = newPosition.y;
}

let crash = () =>{
    const head = controls.snake[0]
    // para verificar que no salga del canvas
    if(head.x <0 || head.x >=WIDTH/WEIGHT || head.y<0 || head.y>=WIDTH/WEIGHT ){
        return true;
    }
    // for para verificar que no choque sobre si misma
    for(let idx = 1; idx < controls.snake.length; idx ++){
        const sq = controls.snake[idx];
        if (sq.x === head.x && sq.y === head.y){
            return true;
        }
    }

}

// funcion que da posiciones random
let random = () => {
    let direc = Object.values(DIRECCIÓN);
    return {
        x: parseInt(Math.random()*WIDTH/WEIGHT),
        y: parseInt(Math.random()*WIDTH/WEIGHT),
        d: direc[parseInt(Math.random()*11)]
    }
}

// funcion que reincia el juego en caso de choque 
let restart = () =>{
    controls = {direccion: {x:1, y:0}, snake:[{x:0, y:0}], victim:{x:0, y:250}, playing: false, increase: 0}
    // random de la serpiente
    positions = random();
    let head = controls.snake[0]
    head.x = positions.x;
    head.y = positions.y;
    controls.direccion.x = positions.d[0];
    controls.direccion.y = positions.d[1];
    // random de la victima
    victimPosition = random();
    let victim = controls.victim;
    victim.x = victimPosition.x;
    victim.y = victimPosition.y;
    controls.playing = true;
}

buttonModal.addEventListener('click', function(){
    namePlayer = document.getElementById('name').value;
    modal.hide();
    restart();
    looper();
})

buttonClose.addEventListener('click', function(){
    gameOver.hide();
})

play.addEventListener('click', function(){
    gameOver.hide();
    modal.show()
})

// cuando carga la web ejecuta looper
window.onload = () => {
    if (isScreenValid()) {
        gameOver.hide();
    } else {
        game.classList.add("invisible");
        error.classList.remove("invisible");
        swal("Oops!", "To play this game your screen width must be at least 1024px", "error");
    }
}

// para agregar a la tabla
function updateTable (arrayPersons){
    for (let i = 0; i < arrayPersons.length ; i++) {
        var filePerson = '<tr>'+
        '<td>' + arrayPersons[i].position + '</td>'+
        '<td>' + arrayPersons[i].name + '</td>'+
        '<td>' + arrayPersons[i].score + '</td>'+
        '</tr>';
    
        $('#table').append(filePerson);
    }
}

function deleteRow(){
    var rowCount = table.rows.length;
    console.log('Cantidad de filas: ' + rowCount);
    for (i=0; i < rowCount ; i++){
        $('#table').empty();
        console.log('removi la fila')
    }
}

function isScreenValid (){
    return (screen.width < 997) ? false : true ;
}

function obtenerDatosApi() {
    let datosApi = fetch('https://apisnakegame.herokuapp.com/player/top');
    datosApi.then((res) =>{
        return res.json();
    }).then((json)=>{
        arrayPersons = new Array();
        for(let player of json){
            var person = new Person(player.position, player.name, player.score);
            arrayPersons.push(person);
        }
        updateTable(arrayPersons);
    }).catch(() => "Fallo el obtener datos a la API de resultados");
    
}

async function savePlayer(url, data) {
    const response = await fetch(url, {
        method: 'POST', 
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    obtenerDatosApi();
}