module.exports = class mediabutlerRadarr3d {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getMovies() {
        try {
            const req = await this.mbService._get('radarr3d');
            return req;
        } catch (err) { throw err; }
    }

    async getMovieId() {
        try {
            const req = await this.mbService._get(`radarr3d/${id}`);
            return req;
        } catch (err) { throw err; }
    }

    async getCalendar() {
        try {
            const req = await this.mbService._get('radarr3d/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getHistory() {
        try {
            const req = await this.mbService._get('radarr3d/history');
            return req;
        } catch (err) { throw err; }
    }

    async getStatus() {
        try {
            const req = await this.mbService._get('radarr3d/status');
            return req;
        } catch (err) { throw err; }
    }

    async getMovieLookup(query) {
        try {
            const req = await this.mbService._get('radarr3d/lookup', {query});
            return req;
        } catch (err) { throw err; }
    }

    async getSearchEpisode() {
        try {
            const req = await this.mbService._get('radarr3d/search');
            return req;
        } catch (err) { throw err; }
    }

    async postSearchEpisode(item) {
        try {
            const req = await this.mbService._post('radarr3d/search', item);
            return req;
        } catch (err) { throw err; }
    }

    async getQueue() {
        try {
            const req = await this.mbService._get('radarr3d/queue');
            return req;
        } catch (err) { throw err; }
    }

    async postQueue(item) {
        try {
            const req = await this.mbService._post('radarr3d/queue', item);
            return req;
        } catch (err) { throw err; }
    }
}