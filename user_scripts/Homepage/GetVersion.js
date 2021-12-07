function httpGet (theUrl) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", theUrl, false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

function getCurrent () {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", "VERSION", false); // false for synchronous request
  xmlHttp.send(null);
  return xmlHttp.responseText;
}

function getLatest () {
  return JSON.parse(httpGet("https://api.github.com/repos/frogweezer/gba/releases/latest"))["name"];
}


window.addEventListener ("load", (event) => {
  var current = "v" + getCurrent();
  var latest = getLatest();

  console.log("Current Version: " + current);
  console.log("Latest Version: " + latest);
  document.getElementById("version-title-currentver").innerText = "Current Version: " + current;
  document.getElementById("version-title-latestver").innerText = "Latest Version: " + latest;
});
