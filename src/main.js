const audio = new Audio();
const output = document.querySelector('.output');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const http = require('http');
const url = require('url');
var Translator = require('@andreasremdt/simple-translator');

//Load buttons on startup
document.addEventListener('DOMContentLoaded', htmlButtons, false); 


var translator = new Translator({
  filesLocation: 'locales/',
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
  let data = [];
  switch(value) {
    case "buttons.json":
     await fs.promises.mkdir("cfg/", { recursive: true });
      await fs.promises.writeFile("cfg/buttons.json", JSON.stringify(data), "utf8");
      console.log("File successfully written.");
      htmlButtons();
    break;
    case "settings.json":
      data.push({"general": {"languageCode": "en", "languageName": "English"}, "audio": {"outputId": "default", "fileVolume": "100", "output": "Default audio output on your device!", "allowMixing":false, "inputId": "default", "input":"Default audio input on your device!"}});
      await fs.promises.mkdir("cfg/", { recursive: true });
      await fs.promises.writeFile("cfg/settings.json", JSON.stringify(data), "utf8");
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

//Get state of language
const language = document.getElementById("languageSelect");
const languageCode = language.value;
const languageName = language.options[language.selectedIndex].text


console.log("Received request for changing settings!");
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
data[0].general.languageCode = languageCode
data[0].general.languageName = languageName

//Store data into settings.json
saveJSON(data, "settings.json");

//Load buttons page
htmlButtons();

//Reload webpage to refresh variable
//window.location.reload();
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
      data[i].color.splice(index, 1);
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
  const index = Object.keys(data).length;

  //Template for category
  data[index] = {};
  data[index].category = newCategoryName.value;
  data[index].files = [];
  data[index].fancy = [];
  data[index].color = [];

  //Save data
  saveJSON(data, "buttons.json");
  buttonSettings();
}
//Create new sound
async function createNewSound(){
  var data = await getJSON("buttons.json");
  const fileName = await handleFileUpload();
  //Load name and category from request
  const fancyName = document.getElementById("fancyName").value;
  const audioCategory = document.getElementById("newAudioCategory").value;
  const color = document.getElementById("select-color").value
  //Put config for button into corresponding category
  data[audioCategory].files.push(fileName);
  data[audioCategory].fancy.push(fancyName);
  data[audioCategory].color.push(color);
  saveJSON(data, "buttons.json");
  buttonSettings();
}

//Function to handle file upload
function handleFileUpload(event){
  const fs = require('fs');
  const reader = new FileReader();
  const file = document.getElementById("inputFile").files[0]
  const filePath = `audio/${file.name}`;

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
    return file.name
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
  var confirmResult = confirm(translator.translateForKey('settings.alert-factory-settings',translator._currentLanguage));
  if (confirmResult == true) {
    createJSON("buttons.json");
    createJSON("settings.json");
  }
}

//Create HTML menu for language
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

//Change site language
async function changeLanguage(){
  const data = await getJSON("settings.json")
  const lang = await getJSON("languages.json");
  translator.fetch(lang[0].code).then(() => {
    translator.translatePageTo(data[0].general.languageCode);
});
}
async function exportFile() {
  const { dialog } = require('@electron/remote');
  const path = require('path')
  const fs = require('fs');
  const file = document.getElementById("export").value;
  const data = await getJSON(file);

  console.log(data)
  dialog.showSaveDialog({
    defaultPath: path.join(__dirname, file),
    title: 'Save ' + file + ' file',
    filters: [
      { name: 'JSON', extensions: ['json'] }
    ],
    properties: []
}).then(file => {
    console.log(file.canceled);
    if (!file.canceled) {
        console.log(file.filePath.toString());
        // Saving file to selected location
        fs.writeFile(file.filePath.toString(), JSON.stringify(data), function (err) {
            if (err) throw err;
            console.log('Saved!');
        });
    }
}).catch(err => {
    console.log(err)
});
};

async function importFile(){
  const fs = require('fs')
  const type = document.getElementById("import").value; 
  const inputFile = document.getElementById("inputFile")
  const file = inputFile.files[0];
  console.log(inputFile.files);
  const reader = new FileReader();
  reader.readAsText(file);
  reader.onload = async function() {
    switch(type){
      case "buttons.json":
        await fs.promises.writeFile("cfg/buttons.json", reader.result, "utf8");
        break;
      case "settings.json":
        await fs.promises.writeFile("cfg/settings.json", reader.result, "utf8");
        break;
      default:
        console.log("Unknown file: " + inputFile.files[0].name);
    }
  };
}

//Create API server for listening to commands
async function createApiServer(port) {
  const data = await getJSON("buttons.json");
  const requestHandler = (request, response) => {
      const urlParts = url.parse(request.url, true);
      const queryData = urlParts.query;
      const id = queryData.id;
  
      switch (true) {
        case urlParts.pathname.startsWith('/play'):
          console.log(`Received id: ${id}`);
          play(id);
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ id }));
          break;
        case urlParts.pathname.startsWith('/list'):
          console.log("Received request for list");
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify(data));
          break;
        case urlParts.pathname.startsWith('/stop'):
          stop();
          break;
        default:       
          response.writeHead(404);
          response.end();
      }
  }

  const server = http.createServer(requestHandler);

  server.listen(port, (err) => {
    if (err) {
      return console.log('Something went wrong:', err);
    }
    console.log(`API server is listening on http://localhost:${port}`);
  });
}

createApiServer(3000);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Generating HTML
async function htmlSettings() {
  mixMicWithAudio();
  changeLanguage();
  const data = await getJSON("settings.json");
  let html = '<h1 data-i18n="settings.name">SETTINGS</h1>';

    //generate buttons for general settings(language, etc)
    html += '<h2 data-i18n="settings.general">General Settings</h2>';
    html += translator.translateForKey('general.language',translator._currentLanguage) + data[0].general.languageName + "<br><br>";
    html += translator.translateForKey('settings.change-language',translator._currentLanguage);
    html += '<select id="languageSelect"></select>';
    
    //generate buttons for audio settings(device output, etc)
    html += '<h2 data-i18n="settings.audio">Audio Settings</h2>';
    html += translator.translateForKey('settings.current-audio-output',translator._currentLanguage) + data[0].audio.output +"<br>";
    html += '<select class="audio-select" id="audioOutputSelect"></select>';
    html += '<br><br>'
    html += translator.translateForKey('settings.current-audio-input',translator._currentLanguage) + data[0].audio.input +"<br>";
    html += '<select id="audioInputSelect"></select>';
    html += '<br><br>'
    html += translator.translateForKey('settings.allow-mic',translator._currentLanguage);
    html += `<input type="checkbox" id="allowMixing"></input>`;
    html += '<br><br>'
    html += translator.translateForKey('settings.change-audio-volume',translator._currentLanguage);
    html += `<input type="range" value="${data[0].audio.fileVolume}" id="audioFileVolume"></input>`;
    html += '<br><button id="save" data-i18n="general.save" class="btn btn-save" onClick="saveSettings()">Save</button> <button class="btn btn-primary" data-i18n="settings.buttons" onClick="buttonSettings()">Edit buttons</button> <button id="cancel" data-i18n="general.cancel" class="btn btn-cancel" onClick="htmlButtons()">Cancel</button>'
    
    //Import/export settings and factory reset
    html += '<h1 data-i18n="settings.backup">Export/Import settings</h1>';
    html += translator.translateForKey('settings.export-select',translator._currentLanguage)
    html += '<select id="export">';
    html += '<option value="buttons.json">'+ translator.translateForKey('general.buttons',translator._currentLanguage) + '</options>'
    html += '<option value="settings.json">' + translator.translateForKey('settings.name',translator._currentLanguage) + '</options></select> '
    html += '<button data-i18n="settings.export-file" class="btn btn-export" onClick="exportFile()"></button>'
    html += '<br><br>'
    html += translator.translateForKey('settings.import-select',translator._currentLanguage)
    html += '<select id="import">';
    html += '<option value="buttons.json">'+ translator.translateForKey('general.buttons',translator._currentLanguage) + '</options>'
    html += '<option value="settings.json">' + translator.translateForKey('settings.name',translator._currentLanguage) + '</options></select>  '
    html += '<input type="file" id="inputFile" style="display: none" accept="application/JSON"> <label for="inputFile" class="btn btn-selectFile">' + translator.translateForKey('settings.choose-file',translator._currentLanguage) +  '</label> <button class="btn btn-import"onclick="importFile()">' + translator.translateForKey('settings.upload-file',translator._currentLanguage) + '</button>';
    html += '<br><br>'
    html += `<br><button data-i18n="settings.reset-factory" class="btn btn-reset" onClick="showAlert()">Reset to factory settings</button>`
  

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
  changeLanguage();
  const value = await getJSON("buttons.json");
  let html = '<h1 data-i18n="settings.buttons">Buttons settings</h1>';
  html += '<h2> ';
  html += translator.translateForKey('createNew.categories',translator._currentLanguage)
  html += ' <button id="createNewCategory" data-i18n="createNew.category" class="btn btn-newCategory" onClick="htmlNewCategory()">Create New Category</button></h2>'
  value.forEach(function(nazev, index){
    html += `${nazev.category} - <span><button id="${index}" class="btn btn-delete" data-i18n="createNew.delete" onClick="removeCategory(this.id)">Remove</button></span><p>`
    });
    html += '<h2> ';
    html += translator.translateForKey('createNew.sounds',translator._currentLanguage)
    html += ' <button data-i18n="createNew.sound" id="addNewSound" class="btn btn-newCategory" onClick="htmlNewSound()">Add new sound</button></h2>';
    value.forEach(function(nazev){
      nazev.files.forEach(function(file, index){
        html += `<span>${nazev.fancy[index]} - <button id="${file}" data-i18n="createNew.delete" class="btn btn-delete" onClick="removeSound(this.id)">Remove</button></span><p> `
      });
    });
  html += '<center><button data-i18n="general.go-back" class="btn btn-cancel" onClick="htmlButtons()">Go back</button>'
  output.innerHTML = html;
}
//Create new HTML for adding audio sounds
async function htmlNewSound(){
  mixMicWithAudio();
  changeLanguage();
  let html = '<h1 data-i18n="createNew.sound">Add new sound effect</h1>';
  html += translator.translateForKey('createNew.sound-name',translator._currentLanguage)
  html += '<input type="text" id="fancyName">'
  html += '<br><br>'
  html += translator.translateForKey('createNew.select-category',translator._currentLanguage)
  html += '<select id="newAudioCategory">';
  const categories = await getJSON("buttons.json");
  categories.forEach(function(category, index) {
    html += `<option value="${index}">${category.category}</option>`;
  });
  html += '</select>';
  html += '<br><br>'
  html += translator.translateForKey('createNew.select-color',translator._currentLanguage)
  html += '<input type="color" id="select-color" value="#004FFF" />'
  html += '<br><br>'
  html += translator.translateForKey('createNew.upload-file',translator._currentLanguage)
  html += '<input type="file" id="inputFile" style="display: none" accept=".mp3,audio/*"> <label for="inputFile" class="btn btn-selectFile">' + translator.translateForKey('createNew.upload-audio',translator._currentLanguage) +  '</label>'
  html += '<br><button class="btn btn-save" data-i18n="general.save" onClick="createNewSound()">Save</button> <button id="cancel" data-i18n="general.cancel" class="btn btn-cancel" onClick="buttonSettings()">Cancel</button>'
  output.innerHTML = html;
}
async function htmlNewCategory(){
  mixMicWithAudio();
  changeLanguage();
  let html = '<h1 data-i18n="createNew.category">Add new category</h1>';
  html += translator.translateForKey('createNew.category-name',translator._currentLanguage) ;
  html += '<input type="text" id="newCategoryName">'
  html += '<br><button class="btn btn-save" data-i18n="general.save" onClick="createNewCategory()">Save</button> <button id="cancel" class="btn btn-cancel" data-i18n="general.cancel" onClick="buttonSettings()">Cancel</button>'
  output.innerHTML = html;
}
//Generating HTML for buttons
async function htmlButtons(){
  const data = await getJSON("buttons.json")
  mixMicWithAudio();
  changeLanguage();
  let html = '<span class="header"><button id="stop" data-i18n="general.stop-panic" class="btn btn-stop" onClick="stop()">STOP PANIK EMERGENCY</button><button data-i18n="settings.name"class="btn btn-primary" onClick="htmlSettings();">Settings</button></span>';
  data.forEach(function(buttons){
    html += `<h2 style="text-align: center;">${buttons.category}</h2><p>`
    buttons.files.forEach(function(file, index){
      html += `<span><button id="${file}" class="btn btn-primary" style="background-color: ${buttons.color[index]}" onClick="play(this.id)">${buttons.fancy[index]}</button></span> `
    });
  });
  output.innerHTML = html;
}