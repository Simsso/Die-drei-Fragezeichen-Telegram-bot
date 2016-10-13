///<reference path='./spotify.ts'/>
///<reference path='./local-file-storage.ts'/>

module SpotifyArtistWatch {
    "use strict";

    export class Comparator {
        private storage: DataBase.LocalFileStorage;

        private artist: Spotify.Artist;

        private addedAlbums: Spotify.Album[] = new Array<Spotify.Album>();
        private removedAlbums: string[] = new Array<string>();
        private allAlbums: Spotify.Album[] = new Array<Spotify.Album>();

        constructor(private artistID: string) {
            this.storage = new DataBase.LocalFileStorage();
            this.artist = new Spotify.Artist(this.artistID);
        }

        public getAddedAlbums(): Spotify.Album[] {
            return this.addedAlbums;
        }

        public async compare() {
            await this.artist.downloadAlbums();
            this.allAlbums = this.artist.getAlbums();
            let storedAlbumIDs: string[] = await this.storage.getArtistsAlbums(this.artist.getID());
            
            // find removed albums
            for (let i = 0; i < storedAlbumIDs.length; i++) {
                if (!this.albumWithIdExists(storedAlbumIDs[i])) {
                    this.removedAlbums.push(storedAlbumIDs[i]);
                }
            }

            // find new albums
            for (let i = 0; i < this.allAlbums.length; i++) {
                if (storedAlbumIDs.indexOf(this.allAlbums[i].id) === -1) {
                    // new album found
                    this.addedAlbums.push(this.allAlbums[i]);
                }
            }
        }

        private albumWithIdExists(albumID: string): boolean {
            for (let i = 0; i < this.allAlbums.length; i++) {
                if (this.allAlbums[i].id === albumID) {
                    return true;
                }
            }
            return false;
        }

        public async save() {
            await this.storage.saveArtistsAlbums(this.artist.getID(), this.allAlbums);
        }
    }
}