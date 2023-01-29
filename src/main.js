var audio = new Audio();
const output = document.querySelector('.output');
var JSONfile =[];

document.addEventListener('DOMContentLoaded', function() {
  getJSON();
}, false);

function isPlaying(){
  if(audio.duration > 0 && !audio.paused)
  return;
}

function play(clicked_id) {
  isPlaying();
  audio.src = "audio/" + clicked_id
  audio.play();
}

function stop() {
  audio.pause();
  audio.currentTime = 0;
}
function getJSON(){

  var request = new XMLHttpRequest();
  request.open("GET", "./cfg/settings.json", false);
  request.send(null)
  JSONfile = JSON.parse(request.responseText);
  createHTML(JSONfile);
  return JSONfile;
}


function createHTML(value){
  let html = '<button id="stop" style="text-align: center; width:100%; height:20%" class="btn btn-danger" onClick="stop()">STOP PANIK EMERGENCY</button> ';
  console.log(value);
  value.forEach(function(nazev){
    html += `<h2 style="text-align: center;">${nazev.name}</h2><p>`
    nazev.files.forEach(function(file, index){
      html += `<span><button id="${file}" class="btn btn-primary" onClick="play(this.id)">${nazev.fancy[index]}</button></span> `
    });
  });
  output.innerHTML = html;
}
