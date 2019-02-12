module.exports = class mediabutlerPlex {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getAudioByKey(key) {
        try {
            const req = await this.mbService._get(`plex/audio/${key}`);
            return req;
        } catch (err) { throw err; }
    }

    async getImageByKey(key) {
        try {
            const req = await this.mbService._get(`plex/image/${key}`);
            return req;
        } catch (err) { throw err; }
    }

    async searchAudio(query) {
        try {
            const req = await this.mbService._get('plex/search/audio', {query});
            return req;
        } catch (err) { throw err; }
    }

    async getHistory() {
        try {
            const req = await this.mbService._get('plex/history');
            return req;
        } catch (err) { throw err; }
    }

    async postHistory(history) {
        try {
            const req = await this.mbService._post('plex/history', history);
            return req;
        } catch (err) { throw err; }
    }
}