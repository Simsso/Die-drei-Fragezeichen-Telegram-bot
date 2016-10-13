///<reference path='./spotify.ts'/>

module SpotifyArtistWatch {
    "use strict";

    class App {
        constructor() {
            let dieDreiFragezeichen = new Spotify.Artist("https://api.spotify.com/v1/artists/3meJIgRw7YleJrmbpbJK6S/albums");
            dieDreiFragezeichen.downloadAlbums();
            console.log(dieDreiFragezeichen.getAlbums());
        }
    }
    new App();
}