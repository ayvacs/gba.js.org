$.getJSON("assets/user_data/GamesList.json", function (data) {
  var games = data;

  var defaultTitle = document.title;
  var hashTags = location.hash.substr(1); //substr removes the leading #
  var gameName = games[hashTags];
  var startLetter = hashTags.charAt(0);

  if (hashTags.length > 0) {
    var title = gameName + " on GBA Online";

    // document.title = defaultTitle + " [" + gameName + "]";
    if (startLetter === "-") {
      document.title = "[DEBUG] " + title;
    } else {
      document.title = title;
    }

    console.log("Current game: " + gameName + " [" + hashTags + "]");
  } else {
    document.title = defaultTitle
    console.log("No game is currently loaded!")
  }
});
