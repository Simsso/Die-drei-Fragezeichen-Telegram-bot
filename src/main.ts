///<reference path='./compare-logic.ts'/>

module SpotifyArtistWatch {
    "use strict";

    class App {
        private static watchedArtists: string[] =  ["3meJIgRw7YleJrmbpbJK6S", "3b8QkneNDz4JHKKKlLgYZg"];

        public static async main() {
            App.watchedArtists.map(async (artistID: string) => {
                let comparator = new Comparator(artistID);
                await comparator.compare();
                console.log(artistID + " ");
                console.log(comparator.getAddedAlbums());
                comparator.save();
            });
        }
    }

    App.main();
}