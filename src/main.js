var audio = new Audio();
var request = new XMLHttpRequest();
request.open("GET", "./cfg/settings.json", false);
request.send(null)
const buttons = JSON.parse(request.responseText);

buttons.array.forEach(button =>{
  const btn = document.createElement("button")
  btn.classList.add(btn)

  btn.innerText = button

  document.getElementById(buttons).appendChild(btn)

});
function isPlaying(){
  if(audio.duration > 0 && !audio.paused)
  return;
}

function play(clicked_id) {
  isPlaying();
  audio.src = "audio/" + clicked_id + ".mp3"
  audio.play();
}

function stop() {
  audio.pause();
  audio.currentTime = 0;
}