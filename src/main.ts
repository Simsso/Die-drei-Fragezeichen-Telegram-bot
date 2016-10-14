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

            var CronJob = require('cron').CronJob;
            var job = new CronJob({
                cronTime: '00 0 0-23 * * *',
                onTick: App.checkForChanges.bind(this),
                start: false
            });
            job.start();
        }

        public static async checkForChanges() {
            console.log("checking for changes");
            App.watchedArtists.map(async (artistID: string) => {
                let comparator = new Comparator(artistID);
                await comparator.compare();
                let addedAlbums: Spotify.Album[] = comparator.getAddedAlbums();
                comparator.save();
                if (addedAlbums.length !== 0) {
                    console.log("new albums found");
                    let notification: Notification.Album = new Notification.Album(App.bot, addedAlbums);
                    await notification.broadcast();
                }
            });
        }

        public static startBot() {
            this.bot = new Telegram.Bot("DieDreiFragezeichenBot", Secret.DieDreiFragezeichenBotToken);
        }
    }
    
    App.main();
}