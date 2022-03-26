let papel = document.querySelector("canvas");
let context = papel.getContext("2d");
var modal = new bootstrap.Modal(document.getElementById('Modal'), {})
let botonModal = document.getElementById('botonModal');
let superior = document.getElementById('superior');
let fondo = document.getElementById('fondo');
let izquierda = document.getElementById('izquierda');
let derecha = document.getElementById('derecha');
let scoreDiv = document.getElementById('score');
let modalCierre = new bootstrap.Modal(document.getElementById('ModalCierre'), {});
let buttonClose = document.getElementById('buttonClose');
let namePlayer = "";
let scoreFinal = 0;

// Variables
let direction; 
const INTERVALO = 80;
const PESO = 10;
const ANCHO = 500;
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

function Person(name, score) {
    this.name = name;
    this.score = score;
}

let arrayPersons = new Array();

// Eventos para los botones de movimiento
superior.addEventListener('click', function() {clickBtn(superior); joystick(0, -1); }) 
fondo.addEventListener('click', function() {clickBtn(fondo); joystick(0, 1) }) 
izquierda.addEventListener('click', function() {clickBtn(izquierda); joystick(-1, 0) }) 
derecha.addEventListener('click', function() {clickBtn(derecha); joystick(1, 0) })

function joystick (dx, dy) {
    direction = [dx, dy]
    const [x, y] = direction
    if(-x !== controles.direccion.x && -y !== controles.direccion.y){
        controles.direccion.x = x;
        controles.direccion.y = y;
    }
}

let controles = {
    direccion: {x:1, y:0}, 
    bicho:[{x:0, y:0}], 
    victima:{x:0, y:250}, 
    jugando: false, 
    crecimiento: 0
}

// detectar cuando se apreta una tecla y hacer un condicional para no vuelva sobre si misma.
document.onkeydown = (e) =>{
    direction = DIRECCIÓN[e.key]
    selectedKey(e.key);
    const [x, y] = direction
    if(-x !== controles.direccion.x && -y !== controles.direccion.y){
        controles.direccion.x = x;
        controles.direccion.y = y;
    }
}

// Animacion al tocar una tecla
function selectedKey (e) {
    let key = e.toUpperCase();
    switch (key) {
        case "A":
        case "ARROWLEFT":
            clickBtn(izquierda);
            break;
        case "ARROWDOWN":
        case "S":
            clickBtn(fondo);
            break;
        case "ARROWUP":
        case "W":
            clickBtn(superior);
            break;
        case "ARROWRIGHT":
        case "D":
            clickBtn(derecha);
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
    let cola = {};
    Object.assign(cola, controles.bicho[controles.bicho.length -1])
    const sq = controles.bicho[0];
    let atrapado = sq.x === controles.victima.x && sq.y === controles.victima.y
    if(choque()){
        score = 1;
        scoreDiv.innerHTML=("SCORE: ");
        controles.jugando = false;
        modalCierre.show();
        document.getElementById('nameModalFinal').innerHTML= "¡Congratulations! " + namePlayer;
        document.getElementById('scoreFinal').innerHTML= "Score: " + scoreFinal;
        var person = new Person(namePlayer, scoreFinal);
        arrayPersons.push(person);
        updateTable(arrayPersons);
        return;
    } 
    let dx = controles.direccion.x;
    let dy = controles.direccion.y;
    let tamaño = controles.bicho.length -1;
    if(controles.jugando){
        for(let idx = tamaño; idx>-1; idx--){
            const sq = controles.bicho[idx];
            if (idx === 0){
                sq.x += dx;
                sq.y += dy;
            } else {
                sq.x = controles.bicho[idx-1].x;
                sq.y = controles.bicho[idx-1].y;
            }
        }
    }
    if (atrapado){
        controles.crecimiento += 1
        revictima()
        scoreFinal = score;
        scoreDiv.innerHTML=("SCORE: " + score++);
    }
    if (controles.crecimiento >0){
        controles.bicho.push(cola)
        controles.crecimiento -=1
    }
    requestAnimationFrame(dibujar);
    setTimeout(looper, INTERVALO);
}

// metodo que dibuja la serpiente
let dibujar = () => {
	context.clearRect(0,0,ANCHO,ANCHO)
    for (let idx =0; idx < controles.bicho.length; idx ++){
        const {x, y} = controles.bicho[idx]
        dibujarActores("#5D8233", x, y)
    }
    const victima = controles.victima   
    dibujarActores("#CD113B", victima.x, victima.y)
}

let dibujarActores = (color, x, y) => {
    context.fillStyle = color;
    context.fillRect(x*PESO, y*PESO, PESO, PESO)
}

// cuando come la victima, la reposiciona en otro lado.
let revictima = () => {
    let nuevaPosicion = random ();
    let victima = controles.victima;
    victima.x = nuevaPosicion.x;
    victima.y = nuevaPosicion.y;
}

let choque = () =>{
    const head = controles.bicho[0]
    // para verificar que no salga del canvas
    if(head.x <0 || head.x >=ANCHO/PESO || head.y<0 || head.y>=ANCHO/PESO ){
        return true;
    }
    // for para verificar que no choque sobre si misma
    for(let idx = 1; idx < controles.bicho.length; idx ++){
        const sq = controles.bicho[idx];
        if (sq.x === head.x && sq.y === head.y){
            return true;
        }
    }

}

// funcion que da posiciones random
let random = () => {
    let direc = Object.values(DIRECCIÓN);
    return {
        x: parseInt(Math.random()*ANCHO/PESO),
        y: parseInt(Math.random()*ANCHO/PESO),
        d: direc[parseInt(Math.random()*11)]
    }
}

// funcion que reincia el juego en caso de choque 
let reiniciar = () =>{
    controles = {direccion: {x:1, y:0}, bicho:[{x:0, y:0}], victima:{x:0, y:250}, jugando: false, crecimiento: 0}
    // random de la serpiente
    posiciones = random();
    let head = controles.bicho[0]
    head.x = posiciones.x;
    head.y = posiciones.y;
    controles.direccion.x = posiciones.d[0];
    controles.direccion.y = posiciones.d[1];
    // random de la victima
    posicionVictima = random();
    let victima = controles.victima;
    victima.x = posicionVictima.x;
    victima.y = posicionVictima.y;
    controles.jugando = true;
}

botonModal.addEventListener('click', function(){
    namePlayer = document.getElementById('name').value;
    modal.hide();
    reiniciar();
    looper();
})

buttonClose.addEventListener('click', function(){
    modalCierre.hide();
    modal.show()
})

// cuando carga la web ejecuta looper
window.onload = () => {
    modal.show()
    modalCierre.hide();
}

// ideas
// con score a la hora de aumentar velocidad, si score es mayor a 5 duplicar velocidad etc.

// para agregar a la tabla
function updateTable (arrayPersons){
    arrayPersons.sort(function (a, b) {
        if (a.name > b.name) {
            return 1;
        }
        if (a.name < b.name) {
            return -1;
        }
        return 0;
    });
    deleteRow();

    for (let i = 1; i <= arrayPersons.length && i < 6; i++) {
        addrow(i, arrayPersons[i]);
    }
}

function addrow(number, arrayPersons){
    var table = document.getElementById("table");
    var row = table.insertRow(0);
    row.innerHTML = "<td>"+ number + "</td><td>" + arrayPersons.name + "</td><td>" + arrayPersons.score + "</td>";
}

function deleteRow(){
    var table = document.getElementById("table");
    var rowCount = table.rows.length;
    
    if(rowCount > 1){
        table.deleteRow(rowCount -1);
    }
}