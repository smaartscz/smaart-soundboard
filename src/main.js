const audio = new Audio();
const output = document.querySelector('.output');

//Load buttons on startup
document.addEventListener('DOMContentLoaded', loadButtons(), false); 

async function loadButtons(){
  const file = await getJSON("buttons.json");
  htmlButtons(file); //hotfix
}
async function createSettings(){
  const file = await getJSON("settings.json");
  htmlSettings(file);
}

//Checking if any audio is playing
function isPlaying(){ 
  if(audio.duration > 0 && !audio.paused)
  return;
}
//Play selected audio
async function play(clicked_id) {
  isPlaying();
  setAudioDevice();
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
  file = "./src/cfg/" + file;
  const fs = require("fs");
  fs.writeFileSync(file, JSON.stringify(data));
  console.log(JSON.stringify(data));
  console.log("JSONfile was saved successfully!");
}

//Reading data from JSON file
async function getJSON(file) {
  const fs = require("fs");
  return new Promise((resolve, reject) => {
   fs.readFile("./src/cfg/" + file, "utf8", (err, JSONString) => {
      if (err) {
      console.log("File read failed:", err);
       reject(err);
    }
     resolve(JSON.parse(JSONString));
   });
  });
}

//Get list of audio devices available on user's computer
function getAudioDevices(){
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const outputDevices = devices.filter(device => device.kind === 'audiooutput');
    const option = document.createElement('option');
    outputDevices.forEach(device => {
      option.value = device.deviceId;
      option.text = device.label || `Device ${device.deviceId}`;
    });
});
}

//Set audio output to selected audio device
async function setAudioDevice(){
  //add function that will read audio settings from /cfg/settings.json and save them
  let output;
  const settings = await getJSON("settings.json");
    settings.forEach(async (ele) => {
      if (ele.audio){
        output = ele.audio.outputId;
      }
      console.log(ele);
      console.log(output);
      await audio.setSinkId(output);

    })
  //audioContext.destination = audioContext.outputs.get(selectedDeviceId);
}

//Generating HTML for settings page
async function htmlSettings(value) {
  let html = '<h1>SETTINGS</h1>';
  console.log(value);

  html += '<h2>General Settings</h2>';
  value.forEach(function(general) {
    //generate buttons for general settings(language, etc)
    html += `Language: ${general.general.language}`;
  });

  html += '<h2>Audio Settings</h2>';
  value.forEach(function(audio) {
    //generate buttons for audio settings(device output, etc)
    console.log(audio.audio.output);
    html += `Current audio output: ${audio.audio.output}`;
  });

  output.innerHTML = html;
}
//Generating HTML for buttons
async function htmlButtons(value){
  let html = '<button id="stop"  class="btn btn-stop" onClick="stop()">STOP PANIK EMERGENCY</button> ';
  console.log(value);
  value.forEach(function(nazev){
    html += `<h2 style="text-align: center;">${nazev.name}</h2><p>`
    nazev.files.forEach(function(file, index){
      html += `<span><button id="${file}" class="btn btn-primary" onClick="play(this.id)">${nazev.fancy[index]}</button></span> `
    });
  });
  output.innerHTML = html;
}
