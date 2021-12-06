var defaultTitle = document.title;
var hashTags = location.hash.substr(1); //substr removes the leading #

if (hashTags.length > 0) {
  document.title = defaultTitle + ' [' + hashTags + ']';
  console.log('🎮 Current game: ' + hashTags);
} else {
  document.title = defaultTitle
  console.log('❌ No game is currently loaded!')
}
