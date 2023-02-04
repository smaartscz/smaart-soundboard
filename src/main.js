const { changeLanguage } = require("i18next");
const i18n = require('i18next');
const audio = new Audio();
const output = document.querySelector('.output');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let fileName;
//Load buttons on startup
document.addEventListener('DOMContentLoaded', htmlButtons, false); 

i18n.init({
  resources: {
    en: {
      translation: require('./locales/en.json')
    },
    cs: {
      translation: require('./locales/cs.json')
    }
  }
});

//Checking if any audio is playing
function isPlaying(){ 
  if(audio.duration > 0 && !audio.paused)
  return;
}
//Play selected audio
async function play(clicked_id) {
  isPlaying();
  setOutputAudioDevice();
  audio.src = "../audio/" + clicked_id
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
       createJSON(file);
    }
     resolve(JSON.parse(JSONString));
   });
  });
}
//Create config files if they don't exist!
async function createJSON(value) {
  console.log("Received request for creating: " + value)
  const fs = require("fs");
  let file = [];
  switch(value) {
    case "buttons.json":
     await fs.promises.mkdir("cfg/", { recursive: true });
      await fs.promises.writeFile("cfg/buttons.json", JSON.stringify(file), "utf8");
      console.log("File successfully written.");
      htmlButtons();
    break;
    case "settings.json":
      file.push({"general": {"language": "en"}, "audio": {"outputId": "default", "fileVolume": "100", "output": "Default audio output on your device!", "allowMixing":false, "inputId": "default", "input":"Default audio input on your device!"}});
      await fs.promises.mkdir("cfg/", { recursive: true });
      await fs.promises.writeFile("cfg/settings.json", JSON.stringify(file), "utf8");
      console.log("File successfully written.");
      htmlSettings();
    break;
    default:
      console.error("Invalid file name specified.");
  }


}
//Get list of audio output devices available on user's computer
function getAudioOutputDevices(){
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
//Get list of audio input devices available on user's computer
async function getAudioInputDevices(){
  navigator.mediaDevices.enumerateDevices()
    .then(devices => {
      const inputDevices = devices.filter(device => device.kind === 'audioinput');
      const audioInputSelect = document.getElementById('audioInputSelect');
      inputDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.text = device.label || `Device ${device.deviceId}`;
        audioInputSelect.appendChild(option);
      });
  });
}

//Set audio output to selected audio device
async function setOutputAudioDevice(){
  //add function that will read audio settings from /cfg/settings.json
  const data = await getJSON("settings.json");
  const output = data[0].audio.outputId;
  await audio.setSinkId(output);
  audio.volume = (data[0].audio.fileVolume/100);
}

//Save settings picked up from htmlSettings
async function saveSettings(){
//Get audio output settings
const outputAudioDevice = document.getElementById("audioOutputSelect");
const outputAudioDeviceId = outputAudioDevice.value;
const outputAudioDeviceName = outputAudioDevice.options[outputAudioDevice.selectedIndex].text;

//Get audio file volume
const fileAudioVolume = document.getElementById("audioFileVolume").value;

//Get audio input settings
const inputAudioDevice = document.getElementById("audioInputSelect");
const inputAudioDeviceName = inputAudioDevice.options[inputAudioDevice.selectedIndex].text;
const inputAudioDeviceId = inputAudioDevice.value;

//Get state of allowMixing
const allowMixing = document.getElementById("allowMixing").checked;

//Get state of allowMixing
const language = document.getElementById("languageSelect").value;

console.log("Received request for changing audio settings!");
var data = await getJSON("settings.json");

//Store audio output settings into object
data[0].audio.output = outputAudioDeviceName
data[0].audio.outputId = outputAudioDeviceId

//Store file volume into object
data[0].audio.fileVolume = fileAudioVolume

//Store audio input settings into object
data[0].audio.input = inputAudioDeviceName
data[0].audio.inputId = inputAudioDeviceId

//Save state of allowMixing
data[0].audio.allowMixing = allowMixing

//Save selected language
data[0].general.language = language

//Store data into settings.json
saveJSON(data, "settings.json");

//Load buttons page
htmlButtons();

//Reload webpage to refresh variable
window.location.reload();
}

//Remove category selected by user
async function removeCategory(index){
  var data = await getJSON("buttons.json");
  console.log("Received request for category removal: " + index)
  data.splice(index, 1);
  saveJSON(data, "buttons.json");
  buttonSettings()
}

//Remove audio effect selected by user
async function removeSound(audioFile){
  const fs = require("fs");
  var data = await getJSON("buttons.json");
  console.log("Received request for sound removal: " + audioFile)
  for (let i = 0; i < data.length; i++) {
    let index = data[i].files.indexOf(audioFile);
    if (index !== -1) {
      data[i].files.splice(index, 1);
      data[i].fancy.splice(index, 1);
    }
}
fs.unlink('audio/' + audioFile, (err) => {
  if (err) throw err;
  console.log(audioFile + ' was deleted');
});
saveJSON(data, "buttons.json");
buttonSettings();
}

//Create new category
async function createNewCategory(name){
  var data = await getJSON("buttons.json");
  console.log("Received request for creating new category: " + name);
  const newCategoryName = document.getElementById("newCategoryName");
  const index = Object.keys(file).length;

  //Template for category
  data[index] = {};
  data[index].category = newCategoryName.value;
  data[index].files = [];
  data[index].fancy = [];

  //Save data
  saveJSON(data, "buttons.json");
  buttonSettings();
}
//Create new sound
async function createNewSound(){
  var data = await getJSON("buttons.json");

  //Load name and category from request
  const fancyName = document.getElementById("fancyName").value;
  const newAudioCategory = document.getElementById("newAudioCategory").value;
  //Put config for button into corresponding category
  data[newAudioCategory].files.push(fileName);
  data[newAudioCategory].fancy.push(fancyName);
  saveJSON(data, "buttons.json");
  buttonSettings();
}

//Function to handle file upload
function handleFileUpload(event){
  const fs = require('fs');
  const reader = new FileReader();
  const files = event.target.files;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    fileName = file.name;
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

//Mix audio from sound effect with user microphone
async function mixMicWithAudio(){
  const data = await getJSON("settings.json");
  if(data[0].audio.allowMixing === true === true){
  isPlaying();
  const output = data[0].audio.outputId
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  microphone = audioContext.createMediaStreamSource(stream);
  audioContext.setSinkId(output)
  microphone.connect(audioContext.destination);

}
}

//Show alert for reset do default
function showAlert() {
  var confirmResult = confirm("Are you sure you want to reset? This CAN NOT be undone!");
  if (confirmResult == true) {
    createJSON("buttons.json");
    createJSON("settings.json");
  }
}

//Set translation
async function languageSelect(){
  const languages = await getJSON("languages.json");
  const languageSelect = document.getElementById('languageSelect')
  const codes = languages[0].code;
  const names = languages[0].name;
  for (let i = 0; i < codes.length; i++) {
    const option = document.createElement('option');
    option.value = codes[i];
    option.text = names[i]
    languageSelect.appendChild(option);
  };
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Generating HTML
async function htmlSettings() {
  mixMicWithAudio();
  const data = await getJSON("settings.json");
  let html = '<h1 data-i18n-key="settings">SETTINGS</h1>';

    //generate buttons for general settings(language, etc)
    html += '<h2>General Settings</h2>';
    html += `Language: ${data[0].general.language}`;
    html += '<br><br>Select your desired language:';
    html += '<select id="languageSelect"></select>';
    
    //generate buttons for audio settings(device output, etc)
    html += '<h2>Audio Settings</h2>';
    html += `Current audio output: ${data[0].audio.output}<br>`;
    html += '<select class="audio-select" id="audioOutputSelect"></select>';
    html += `<br><br>Current audio output: ${data[0].audio.input}<br>`;
    html += '<select id="audioInputSelect"></select>';
    html += `<br><br>Allow microphone passthrough: `;
    html += `<input type="checkbox" id="allowMixing"></input>`;
    html += `<br><br>Change audio file volume: `;
    html += `<input type="range" value="${data[0].audio.fileVolume}" id="audioFileVolume"></input>`;
    html += '<br><button id="save" class="btn btn-save" onClick="saveSettings()">Save</button> <button class="btn btn-primary" onClick="buttonSettings()">Edit buttons</button> <button id="cancel" class="btn btn-cancel" onClick="htmlButtons()">Cancel</button>'
    html += `<br><button id="save" class="btn btn-reset" onClick="showAlert()">Reset to factory settings</button>`
  

    //Call functions to fill select element
    getAudioOutputDevices();
    getAudioInputDevices();
    languageSelect();
    
  //Show HTML
  output.innerHTML = html;
  document.getElementById("allowMixing").checked = data[0].audio.allowMixing
}
//Settings for buttons
async function buttonSettings(){
  mixMicWithAudio();
  const value = await getJSON("buttons.json");
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
  html += '<br><button id="cancel" class="btn btn-cancel" onClick="htmlButtons()">Go back</button>'
  output.innerHTML = html;
}
//Create new HTML for adding audio sounds
async function htmlNewSound(value){
  mixMicWithAudio();
  let html = '<h1>Add new category</h1>';
  html += 'Enter sound effect name: '
  html += '<input type="text" id="fancyName"><p>'
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
  mixMicWithAudio();
  let html = '<h1>Add new category</h1>';
  html += 'Enter category name: '
  html += '<input type="text" id="newCategoryName">'
  html += '<br><button class="btn btn-save" onClick="createNewCategory()">Save</button> <button id="cancel" class="btn btn-cancel" onClick="buttonSettings()">Cancel</button>'
  output.innerHTML = html;
}
//Generating HTML for buttons
async function htmlButtons(){
  const data = await getJSON("buttons.json")
  mixMicWithAudio();
  let html = '<span class="header"><button id="stop" class="btn btn-stop" onClick="stop()">STOP PANIK EMERGENCY</button><button id="settings" class="btn btn-primary" onClick="htmlSettings();">Settings</button></span>';
  data.forEach(function(buttons){
    html += `<h2 style="text-align: center;">${buttons.category}</h2><p>`
    buttons.files.forEach(function(file, index){
      html += `<span><button id="${file}" class="btn btn-primary" onClick="play(this.id)">${buttons.fancy[index]}</button></span> `
    });
  });
  output.innerHTML = html;
}