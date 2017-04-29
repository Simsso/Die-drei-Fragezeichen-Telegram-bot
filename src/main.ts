///<reference path='./compare-logic.ts'/>
///<reference path='./telegram.ts'/>
///<reference path='./notification.ts'/>

module SpotifyArtistWatch {
    "use strict";

    class App {
        private static watchedArtists: string[] =  ["3meJIgRw7YleJrmbpbJK6S"];
        private static bot: Telegram.Bot;

        public static main() {
            console.log("["  + new Date() + "] running");

            App.startBot(this.watchedArtists[0]);

            var CronJob = require('cron').CronJob;
            var job = new CronJob({
                cronTime: '0 0 */4 * * *', // every four hours
                onTick: App.checkForChanges.bind(this),
                start: false
            });
            
            App.checkForChanges();
            job.start();
        }

        public static async checkForChanges() {
            App.watchedArtists.map(async (artistID: string) => {
                let comparator = new Comparator(artistID);
                await comparator.compare();
                let addedAlbums: Spotify.Album[] = comparator.getAddedAlbums();
                comparator.save();
                if (addedAlbums.length !== 0) {
                    console.log("[" + new Date() + "] new albums found");
                    addedAlbums.sort((a: Spotify.Album, b: Spotify.Album) => {
                        let aNr:number = a.getDieDreiFragezeichenEpisodeNumber(), bNr: number = b.getDieDreiFragezeichenEpisodeNumber();
                        if (aNr < bNr || isNaN(aNr) && isNaN(bNr)) return -1;
                        else return 1;
                    });
                    let notification: Notification.Album = new Notification.Album(App.bot, addedAlbums, Notification.Type.NowAvailable);
                    await notification.broadcast();
                }
                else {
                    console.log("[" + new Date() + "] no new albums found");
                }
            });
        }

        public static startBot(artistID: string) {
            this.bot = new Telegram.Bot("DieDreiFragezeichenBot", Secret.DieDreiFragezeichenBotToken, artistID);
        }
    }
    
    App.main();
}