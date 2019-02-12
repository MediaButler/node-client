module.exports = class mediabutlerUser {
    constructor({ mbService }) {
        this.mbService = mbService;
    }

    async getAllUser() {
        try {
            const req = await this.mbService._get('user');
            return req;
        } catch (err) { throw err; }
    }

    async getMyUser() {
        try {
            const req = await this.mbService._get('user/@me');
            return req;
        } catch (err) { throw err; }
    }

    async getUser(username) {
        try {
            const req = await this.mbService._get(`user/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async putUser(username, user) {
        try {
            const req = await this.mbService._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async deleteUser(username) {
        try {
            const req = await this.mbService._delete(`user/${username}`);
            return req;
        } catch (err) { throw err; }
    }
}