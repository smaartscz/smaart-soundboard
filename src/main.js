let fileName;

const audio = new Audio();
const output = document.querySelector('.output');
//Load buttons on startup
document.addEventListener('DOMContentLoaded', loadButtons, false); 

async function loadButtons(){
  const file = await getJSON("buttons.json");
  htmlButtons(file);
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
  audio.src = "../../../audio/" + clicked_id
  audio.play();
}
//Stop audio
function stop() {
  audio.pause();
  audio.currentTime = 0;
}
//Writing data into JSON file
function saveJSON(data, file){
  file = "cfg/" + file;
  const fs = require("fs");
  fs.writeFileSync(file, JSON.stringify(data));
  console.log("JSONfile was saved successfully!");
}

//Reading data from JSON file
async function getJSON(file) {
  const fs = require("fs");
  return new Promise((resolve, reject) => {
   fs.readFile("cfg/" + file, "utf8", (err, JSONString) => {
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
    const audioOutputSelect = document.getElementById('audioOutputSelect');
    outputDevices.forEach(device => {
      const option = document.createElement('option');
      option.value = device.deviceId;
      option.text = device.label || `Device ${device.deviceId}`;
      audioOutputSelect.appendChild(option);
    });
});
}

//Set audio output to selected audio device
async function setAudioDevice(){
  //add function that will read audio settings from /cfg/settings.json
  let output;
  const settings = await getJSON("settings.json");
    settings.forEach(async (ele) => {
      if (ele.audio){
        output = ele.audio.outputId;
      }
      await audio.setSinkId(output);
    })
}
//Save audio settings picked up from select 
async function saveAudioSettings(){
const AudioDevice = document.getElementById("audioOutputSelect");
const AudioDeviceId = AudioDevice.value;
const AudioDeviceName = AudioDevice.options[AudioDevice.selectedIndex].text;
console.log("Received request for changing audio settings!");
var data = await getJSON("settings.json");
data[0].audio.output = AudioDeviceName
data[0].audio.outputId = AudioDeviceId
saveJSON(data, "settings.json");
loadButtons();
}

async function removeCategory(value){
  var file = await getJSON("buttons.json");
  console.log("Received request for category removal: " + value)
  file.splice(value, 1);
  saveJSON(file, "buttons.json");
  buttonSettings()
}

async function removeSound(index, audioFile){
  const file = getJSON("buttons.json");
  console.log("Received request for sound removal: ")
  console.log(index, file);
}

async function createNewCategory(name){
  var file = await getJSON("buttons.json");
  console.log("Received request for creating new category: ");
  const newCategoryName = document.getElementById("newCategoryName");
  console.log(newCategoryName.value);
  const index = Object.keys(file).length;
  console.log(index);
  file[index] = {};
  file[index].category = newCategoryName.value;
  file[index].files = [];
  file[index].fancy = [];
  saveJSON(file, "buttons.json");
  buttonSettings();
}

async function createNewSound(){
  var file = await getJSON("buttons.json");
  const newAudioName = document.getElementById("newAudioName").value;
  const newAudioCategory = document.getElementById("newAudioCategory").value;
  console.log(newAudioName + " " + newAudioCategory);
  file[newAudioCategory].files.push(fileName);
  file[newAudioCategory].fancy.push(newAudioName);
  console.log(file);
  saveJSON(file, "buttons.json");
  buttonSettings();
}
//Function to handle file upload
function handleFileUpload(event){
  const fs = require('fs');
  const reader = new FileReader();
  const files = event.target.files;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    fileName = file.name.replace(/[^\w\s]/gi, '').replace(/\s/g, '') + ".mp3";
    const filePath = `audio/${fileName}`;
    reader.onload = function() {
      fs.writeFile(filePath, Buffer.from(reader.result), (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`File saved to ${filePath}`);
        }
      });
    };
    reader.readAsArrayBuffer(file);
  }
}
//Generating HTML for settings page
async function htmlSettings(value) {
  let html = '<h1>SETTINGS</h1>';
  html += '<h2>General Settings</h2>';
  value.forEach(function(general) {
    //generate buttons for general settings(language, etc)
    html += `Language: ${general.general.language}`;
  });

  html += '<h2>Audio Settings</h2>';
  value.forEach(function(audio) {
    //generate buttons for audio settings(device output, etc)
    html += `Current audio output: ${audio.audio.output}<br>`;
    html += '<select class="audio-select" id="audioOutputSelect"></select>';
  });

  getAudioDevices();
  html += '<br><button class="btn btn-primary" onClick="buttonSettings()">Edit buttons</button><button id="save" class="btn btn-save" onClick="saveAudioSettings()">Save</button> <button id="cancel" class="btn btn-cancel" onClick="loadButtons()">Cancel</button>'
  output.innerHTML = html;
}
async function buttonSettings(){
  const value = await getJSON("buttons.json")
  let html = '<h1>Buttons settings</h1>';
  html += '<h2>Categories <button id="createNewCategory" class="btn btn-newCategory" onClick="htmlNewCategory()">Create New Category</button></h2>';
  value.forEach(function(nazev, index){
    html += `${nazev.category} - <span><button id="${index}" class="btn btn-delete" onClick="removeCategory(this.id)">Remove</button></span><p>`
    });
    html += '<h2>Sounds <button id="addNewSound" class="btn btn-newCategory" onClick="htmlNewSound()">Add new sound</button></h2>';
    value.forEach(function(nazev){
      nazev.files.forEach(function(file, index){
        html += `<span>${nazev.fancy[index]} - <button id="${file}" class="btn btn-delete" onClick="removeSound(this.id)">Remove</button></span><p> `
      });
    });
  html += '<br><button id="cancel" class="btn btn-cancel" onClick="loadButtons()">Go back</button>'
  output.innerHTML = html;
}
//Create new HTML for adding audio sounds
async function htmlNewSound(value){
  let html = '<h1>Add new category</h1>';
  html += 'Enter sound effect name: '
  html += '<input type="text" id="newAudioName"><p>'
  html += 'Select category: '
  html += '<select id="newAudioCategory">';
  const categories = await getJSON("buttons.json");
  categories.forEach(function(category, index) {
    html += `<option value="${index}">${category.category}</option>`;
  });
  html += '</select><p>';
  html += 'Upload your audio file: '
  html += '<input type="file" onchange="handleFileUpload(event)">'
  html += '<br><button class="btn btn-save" onClick="createNewSound()">Save</button> <button id="cancel" class="btn btn-cancel" onClick="buttonSettings()">Cancel</button>'
  output.innerHTML = html;
}
async function htmlNewCategory(){
  let html = '<h1>Add new category</h1>';
  html += 'Enter category name: '
  html += '<input type="text" id="newCategoryName">'
  html += '<br><button class="btn btn-save" onClick="createNewCategory()">Save</button> <button id="cancel" class="btn btn-cancel" onClick="buttonSettings()">Cancel</button>'
  output.innerHTML = html;
}
//Generating HTML for buttons
async function htmlButtons(){
  const value = await getJSON("buttons.json")
  let html = '<span><button id="stop" class="btn btn-stop" onClick="stop()">STOP PANIK EMERGENCY</button><button id="settings" class="btn btn-primary" onClick="createSettings();">Settings</button></span>';
  value.forEach(function(nazev){
    html += `<h2 style="text-align: center;">${nazev.category}</h2><p>`
    nazev.files.forEach(function(file, index){
      html += `<span><button id="${file}" class="btn btn-primary" onClick="play(this.id)">${nazev.fancy[index]}</button></span> `
    });
  });
  output.innerHTML = html;
}