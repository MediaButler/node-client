module.exports = class mediabutlerTautulli {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getActivity() {
        try {
            const req = await this.mbService._get('tautulli/activity');
            return req;
        } catch (err) { throw err; }
    }

    async getLibrary() {
        try {
            const req = await this.mbService._get('tautulli/library');
            return req;
        } catch (err) { throw err; }
    }

    async getHistory({user, limit}) {
        try {
            const req = await this.mbService._get('tautulli/history', {user, limit});
            return req;
        } catch (err) { throw err; }
    }
}