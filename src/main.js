var audio = new Audio();
const output = document.querySelector('.output');
var JSONfile =[];

document.addEventListener('DOMContentLoaded', loadButtons(), false);

function loadButtons(){
  getJSON("buttons.json");
  setTimeout(() => {  createHTML(JSONfile); }, 50);
}

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

function saveJSON(data, file){
  file = "./src/cfg/" + file;
  const fs = require("fs");
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(JSON.stringify(data));
  console.log("JSONfile was saved successfully!");
}

function getJSON(file){
  const fs = require("fs");
  file = "./src/cfg/" + file;
  fs.readFile(file, "utf8", (err, JSONString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    JSONfile = JSON.parse(JSONString);
  });
  return;
}

async function createHTML(value){
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
