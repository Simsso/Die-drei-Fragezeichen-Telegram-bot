export module Telegram {
    export class Bot {
        private token;
        public constructor(token: string) {
            this.token = token;
        }
    }
}