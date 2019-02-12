module.exports = class mediabutlerLidarr {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getArtists() {
        try {
            const req = await this.mbService._get('lidarr');
            return req;
        } catch (err) { throw err; }
    }

    async getArtistId(id) {
        try {
            const req = await this.mbService._get(`lidarr/${id}`);
            return req;
        } catch (err) { throw err; }
    }

    async getCalendar() {
        try {
            const req = await this.mbService._get('lidarr/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getHistory() {
        try {
            const req = await this.mbService._get('lidarr/history');
            return req;
        } catch (err) { throw err; }
    }

    async getStatus() {
        try {
            const req = await this.mbService._get('lidarr/status');
            return req;
        } catch (err) { throw err; }
    }

    async getArtistLookup(query) {
        try {
            const req = await this.mbService._get('lidarr/lookup', {query});
            return req;
        } catch (err) { throw err; }
    }

    async getSearchAlbum() {
        try {
            const req = await this.mbService._get('lidarr/search');
            return req;
        } catch (err) { throw err; }
    }

    async postSearchAlbum(item) {
        try {
            const req = await this.mbService._post('lidarr/search', item);
            return req;
        } catch (err) { throw err; }
    }

    async getQueue() {
        try {
            const req = await this.mbService._get('lidarr/queue');
            return req;
        } catch (err) { throw err; }
    }

    async postQueue(item) {
        try {
            const req = await this.mbService._post('lidarr/queue', item);
            return req;
        } catch (err) { throw err; }
    }
}