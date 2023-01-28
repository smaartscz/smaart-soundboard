function play(clicked_id) {
    var audio = new Audio("audio/" + clicked_id + ".mp3");
    audio.play();
  }
  function stop() {
    const audio = document.querySelector("#audio");
    pause();
    audio.currentTime = 0;
  }