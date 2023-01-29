var audio = new Audio();
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