///<reference path='./compare-logic.ts'/>
///<reference path='./telegram.ts'/>
///<reference path='./notification.ts'/>

module SpotifyArtistWatch {
    "use strict";

    class App {
        private static watchedArtists: string[] =  ["3meJIgRw7YleJrmbpbJK6S"];
        private static bot: Telegram.Bot;

        public static main() {
            console.log("running");

            App.startBot();
            setTimeout(App.checkForChanges, 10000);
        }

        public static async checkForChanges() {
            App.watchedArtists.map(async (artistID: string) => {
                let comparator = new Comparator(artistID);
                await comparator.compare();
                let addedAlbums: Spotify.Album[] = comparator.getAddedAlbums();
                comparator.save();
                addedAlbums.map(async (album: Spotify.Album) => {
                    let notification: Notification.Album = new Notification.Album(App.bot, album);
                    await notification.broadcast();
                    console.log("message broadcasted");
                });
            });
        }

        public static startBot() {
            this.bot = new Telegram.Bot("DieDreiFragezeichenBot", Secret.DieDreiFragezeichenBotToken);
        }
    }
    App.main();
}