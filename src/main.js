var audio = new Audio();
const output = document.querySelector('.output');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
var JSONfile =[];

//Load buttons on startup
document.addEventListener('DOMContentLoaded', loadButtons(), false); 

function loadButtons(){
  getJSON("buttons.json");
  setTimeout(() => {  htmlButtons(JSONfile); }, 50); //hotfix
}
//Checking if any audio is playing
function isPlaying(){ 
  if(audio.duration > 0 && !audio.paused)
  return;
}
//Play selected audio
function play(clicked_id) {
  isPlaying();
  audio.src = "audio/" + clicked_id
  audio.play();
}
//Stop audio
function stop() {
  audio.pause();
  audio.currentTime = 0;
}
//Writing data into JSON file
function saveJSON(data, file){
  file = "./cfg/" + file;
  const fs = require("fs");
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(JSON.stringify(data));
  console.log("JSONfile was saved successfully!");
}

//Reading data from JSON file
function getJSON(file){
  const fs = require("fs");
  file = "./cfg/" + file;
  fs.readFile(file, "utf8", (err, JSONString) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }
    JSONfile = JSON.parse(JSONString);
  });
  return;
}

//Get list of audio devices available on user's computer
function getAudioDevices(){
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const outputDevices = devices.filter(device => device.kind === 'audiooutput');
    outputDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Device ${device.deviceId}`;
      console.log(device.label);
    });
});
}

//Set audio output to selected audio device
function setAudioDevice(device){
  //add function that will read audio settings from /cfg/settings.json and save them
  const selectedDeviceId = device;
  audioContext.destination = audioContext.outputs.get(selectedDeviceId);
}

//Generating HTML for settings page
async function htmlSettings(value){
  let html = '';
  console.log(value);
  value.forEach(function(general){
    //generate buttons for general settings(language, etc)
  });
  value.forEach(function(audio){
    //generate buttons for general settings(language, etc)
  });
  output.innerHTML = html;
}
//Generating HTML for buttons
async function htmlButtons(value){
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
