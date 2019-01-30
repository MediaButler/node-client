const axios = require('axios');
const TVDB = require('node-tvdb');
const imdb = require('imdb-api');
const url = require('url');
const events = require('events');

const toTitleCase = (phrase) => { return phrase.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); };

const asyncForEach = async (array, cb) => {
    for (let index = 0; index < array.length; index++) {
        await cb(array[index], index, array)
    }
}

const getReadableFileSizeString = (fileSizeInBytes) => {
    let i = -1;
    let byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);
    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

module.exports = class mbService {
    constructor(settings, guild = false, startup = false) {
        this._settings = settings;
        this.clientId = 'fc5e13ca-e0ab-4d15-8dbd-9cf915ee6c0a';
        if (guild) this.guild = guild;
        if (!settings.mbUrl) throw new Error('URL not set');
        if (!settings.mbToken) throw new Error('APIKey not set');
        if (settings.mbUrl.slice(-1) != '/') settings.mbUrl = `${settings.mbUrl}/`;
        this.mburl = url.parse(settings.mbUrl);
        this.logChannel = false;
        if (settings.logChannel) this.logChannel = settings.logChannel;
        this.getMyUser().then((user) => {
            this.user = user;
        });
        if (startup) {
            this.notificationAgent = require('socket.io-client')(`${this.mburl.protocol}//${this.mburl.host}`, { path: `${this.mburl.path}socket.io`, reconnection: true, reconnectionDelay: 1000, reconnectionDelayMax: (2070 * 1000), reconnectionAttempts: Infinity, pingInterval: 30000, pingTimeout: 1000 });
            this.notificationAgent.on('connect', async (socket) => {
                this.notificationAgent.emit('authenticate', { token: settings.mbToken });

            });
            this.notificationAgent.on('disconnect', async (socket) => {
                const channel = this.guild.channels.find((x) => x.name === this.logChannel.admin) || false;
                if (!channel) return;
                const embed = new Discord.RichEmbed();
                embed.setTitle('API Disconnected');
                embed.setColor(12961221);
                embed.setAuthor('MediaButler', 'https://github.com/vertig0ne/MediaButler/blob/v1/mb.png?raw=true');
                embed.setDescription('API Connection has been disconnected. Notifications may not work until sucessful connection. Attempting to reconnect.');
                embed.setTimestamp();
                channel.send({ embed });
            });
            this.notificationAgent.on('request', (data) => { this.requestMessage(data); });
            this.notificationAgent.on('sonarr', (data) => { this.tvshowMessage(data); });
            this.notificationAgent.on('sonarr4k', (data) => { this.tvshowMessage(data, true); });
            this.notificationAgent.on('radarr', (data) => { this.movieMessage(data); });
            this.notificationAgent.on('radarr4k', (data) => { this.movieMessage(data, true); });
            this.notificationAgent.on('radarr3d', (data) => { this.movieMessage(data, false, true); });
            //this.notificationAgent.on('plex', (data) => { this.plexMessage(data); });
            this.notificationAgent.on('tautulli', (data) => { this.tautulliMessage(data); });
        }
    }

    async _checkPlugins(plugins = []) {
        this.enabledPlugins = new Array();
        this.disabledPlugins = new Array();
        if (plugins.length == 0) return setTimeout(() => { this._checkPlugins(plugins) }, 5000);
        for (let i = 0; i < plugins.length; i++) {
            try {
                const r = await this._get(plugins[i]);
                this.enabledPlugins.push(plugins[i]);
            } catch (err) {
                if (err.response && err.response.status == 400 && err.response.data.name == 'NotEnabled') {
                    this.disabledPlugins.push(plugins[i]);
                } else { this.enabledPlugins.push(plugins[i]); }
            }
        }
    }

    async getVersion() {
        const req = await this._get('version');
        return req;
    }

    // RULES
    async getAllRules() {
        const req = await this._get('rules');
        return req;
    }

    // REQUESTS
    async addRequest(request) {
        const req = await this._post('requests', request);
        return req;
    }

    async delRequest(id) {
        const req = await this._delete(`requests/${id}`, { confirmed: true });
        return req;
    }

    async approveRequest(id, args = {}) {
        try {
            const req = await this._post(`requests/${id}`, args);
            return req;
        } catch (err) { throw err; }
    }

    async getRequests() {
        const requests = await this._get('requests');
        return requests;
    }

    async addAllowApprove(username, types) {
        const data = { username, types };
        const req = await this._post('requests/allowapprove', data);
    }

    async getAllowApprove() {
        try {
            const req = await this._get('requests/allowapprove');
            return req;
        } catch (err) { throw err; }
    }

    async getAllowApproveForUsername(username) {
        try {
            const req = await this._get(`requests/allowapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async updateAllowApprove(username, types, shouldReplace = false) {
        try {
            const req = await this._put(`requests/allowapprove/${username}`, { types, replace: shouldReplace });
            return req;
        } catch (err) { throw err; }
    }

    async deleteAllowApprove(username) {
        try {
            const req = await this._delete(`requests/allowapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async addAutoApprove(username, types) {
        const data = { username, types };
        const req = await this._post('requests/autoapprove', data);
    }

    async getAutoApprove() {
        try {
            const req = await this._get('requests/autoapprove');
            return req;
        } catch (err) { throw err; }
    }

    async getAutoApprove(username) {
        try {
            const req = await this._get(`requests/autoapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async updateAutoApprove(username, types, shouldReplace = false) {
        try {
            const req = await this._put(`requests/autoapprove/${username}`, { types, replace: shouldReplace });
            return req;
        } catch (err) { throw err; }
    }

    async deleteAutoApprove(username) {
        try {
            const req = await this._delete(`requests/autoapprove/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async getCalendarSonarr() {
        try {
            const req = await this._get('sonarr/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getCalendarRadarr() {
        try {
            const req = await this._get('radarr/calendar');
            return req;
        } catch (err) { throw err; }
    }

    async getNowPlaying() {
        try {
            const req = await this._get('tautulli/activity');
            return req;
        } catch (err) { throw err; }
    }

    async searchAudio(terms) {
        try {
            const req = await this._get(`plex/search/audio?query=${encodeURIComponent(terms)}`);
            return req;
        } catch (err) { throw err; }
    }

    async getTautulliHistory(user) {
        try {
            const params = {user};
            const req = await this._get('tautulli/history', params);
            return req.response;
        } catch (err) { throw err; }
    }

    async getTraktUrl() {
        try {
            const req = await this._get('trakt');
            return req;
        } catch (err) { throw err; }
    }

    async setTraktToken(code) {
        try {
            const req = await this._post('trakt', { code });
            return req;
        } catch (err) { throw err; }
    }

    async getMyUser() {
        try {
            const req = await this._get('user/@me');
            return req;
        } catch (err) { throw err; }
    }

    async getUser(username) {
        try {
            const req = await this._get(`user/${username}`);
            return req;
        } catch (err) { throw err; }
    }

    async addPermission(username, permission) {
        try {
            const user = await this.getUser(username);
            user.permissions.push(permission);
            const req = await this._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async delPermission(username, permission) {
        try {
            const user = await this.getUser(username);
            if (user.permissions.indexOf(permission) == -1) return;
            user.permissions.splice(user.permissions.indexOf(permission), 1);
            const req = await this._put(`user/${username}`, user);
            return req;
        } catch (err) { throw err; }
    }

    async requestMessage(data) {
        const channel = this.guild.channels.find((x) => x.name === this.logChannel.admin);
        if (!channel) return;
        const embed = new Discord.RichEmbed();
        embed.setAuthor('MediaButler', 'https://github.com/vertig0ne/MediaButler/blob/v1/mb.png?raw=true');
        embed.setColor(12961221);
        switch (data.type) {
            case "approve":
                embed.setTitle(`Request Approved`);
                embed.setDescription(`Request has been APPROVED for ${data.request.title}`);
                embed.setFooter(data.who);
                embed.setTimestamp();
                break;
            case "add":
                embed.setTitle(`Request Added`);
                embed.setDescription(`Request has been added for ${data.request.title}`);
                embed.setFooter(data.who);
                embed.setTimestamp();
                break;
            case "delete":
                embed.setTitle(`Request Deleted`);
                embed.setDescription(`Request for ${data.request.title} has been deleted`);
                embed.setFooter(data.who);
                embed.setTimestamp();
                break;
            case "filled":
                embed.setTitle(`Request Filled`);
                embed.setDescription(`${data.request.username}'s request for ${data.request.title} has been filled`);
                embed.setFooter(data.who);
                embed.setTimestamp();
                break;
        }
        channel.send({ embed });
    }

    async tvshowMessage(data, is4k = false) {
        const channel = this.guild.channels.find((x) => x.name === this.logChannel.tvshowNotification);
        if (!channel) return;
        const tvdb = new TVDB('88D2ED25A2539ECE');
        const embed = new Discord.RichEmbed();
        embed.setColor(3655155);
        const tvdbId = data.series.tvdbId;
        switch (data.eventType) {
            case "Test":
                embed.setAuthor(`Sonarr${(is4k) ? ' 4K' : ''}`, 'https://raw.githubusercontent.com/Sonarr/sonarr.github.io/master/logo/sonarr-128.png');
                embed.setTitle('Received Test Notifcation');
                embed.setDescription('Test notification sucessful from Sonarr');
                embed.setTimestamp();
                break;
            case "Grab":
                const posters = await tvdb.getSeriesPosters(tvdbId);
                embed.setAuthor('Sonarr', 'https://raw.githubusercontent.com/Sonarr/sonarr.github.io/master/logo/sonarr-128.png');
                embed.setTitle('Grabbed Episode');
                embed.setDescription(data.series.title);
                embed.setTimestamp();
                embed.setThumbnail(`http://thetvdb.com/banners/${posters[0].fileName}`);
                embed.addField('Release Name', data.release.releaseTitle, false);
                let episodes = '';
                data.episodes.forEach((episode) => {
                    if (episode.seasonNumber < 10) episode.seasonNumber = `0${episode.seasonNumber}`;
                    if (episode.episodeNumber < 10) episode.episodeNumber = `0${episode.episodeNumber}`;
                    episodes += `S${episode.seasonNumber}E${episode.episodeNumber} - ${episode.title}\n`;
                });
                embed.addField('Episode', episodes, false);
                embed.addField('Quality', data.release.quality, true);
                embed.addField('Source', data.release.indexer, true);
                embed.addField('Size', `${getReadableFileSizeString(data.release.size)}`, true);
                break;
            case "Download":
                const postersDownload = await tvdb.getSeriesPosters(tvdbId);
                embed.setAuthor('Sonarr', 'https://raw.githubusercontent.com/Sonarr/sonarr.github.io/master/logo/sonarr-128.png');
                embed.setTitle('Imported Episode');
                embed.setDescription(data.series.title);
                embed.setTimestamp();
                embed.setThumbnail(`http://thetvdb.com/banners/${postersDownload[0].fileName}`);
                embed.addField('Release Name', data.episodes[0].sceneName, false);
                embed.addField('Episode', `S${data.episodes[0].seasonNumber}E${data.episodes[0].episodeNumber} - ${data.episodes[0].title}`, false);
                embed.addField('Quality', data.episodeFile.quality, true);
                embed.addField('Upgrade', (data.isUpgrade) ? 'Yes' : 'No', true);
                break;
        }
        channel.send({ embed });
    }

    async movieMessage(data, is4k = false, is3d = false) {
        const channel = this.guild.channels.find((x) => x.name === this.logChannel.movieNotification);
        if (!channel) return;
        const embed = new Discord.RichEmbed();
        embed.setColor(16761649);
        switch (data.eventType) {
            case "Test":
                embed.setAuthor(`Radarr${(is4k) ? ' 4K' : ''}${(is3d) ? ' 3D' : ''}`, 'https://raw.githubusercontent.com/Radarr/radarr.github.io/master/logo/radarr-128.png');
                embed.setTitle('Received Test Notifcation');
                embed.setDescription('Test notification sucessful from Radarr');
                embed.setTimestamp();
                break;
            case "Grab":
                const imdbGetGrab = await imdb.get({ id: data.remoteMovie.imdbId }, { apiKey: '5af02350' });
                embed.setAuthor('Radarr', 'https://raw.githubusercontent.com/Radarr/radarr.github.io/master/logo/radarr-128.png');
                embed.setTitle('Grabbed Movie');
                embed.setDescription(data.remoteMovie.title);
                embed.setTimestamp();
                embed.setThumbnail(imdbGetGrab.poster);
                embed.addField('Release Name', data.release.releaseTitle, false);
                embed.addField('Quality', data.release.quality, true);
                embed.addField('Source', data.release.indexer, true);
                embed.addField('Size', `${getReadableFileSizeString(data.release.size)}`, true);
                break;
            case "Download":
                const imdbGetDownload = await imdb.get({ id: data.remoteMovie.imdbId }, { apiKey: '5af02350' });
                embed.setAuthor('Radarr', 'https://raw.githubusercontent.com/Radarr/radarr.github.io/master/logo/radarr-128.png');
                embed.setTitle('Imported Movie');
                embed.setDescription(data.remoteMovie.title);
                embed.setTimestamp();
                embed.setThumbnail(imdbGetDownload.poster);
                embed.addField('Release Name', data.movieFile.sceneName, false);
                embed.addField('Quality', data.movieFile.quality, true);
                embed.addField('Upgrade', (data.isUpgrade) ? 'Yes' : 'No', true);
                break;
        }
        channel.send({ embed });
    }

    async plexMessage(data) {
        console.log('Plex Message');
        console.log(data);
    }

    createMessageView(model, admin = false) {
        const embed = new Discord.RichEmbed();
        if (model.media_type == 'episode') {
            if (model.season_num.toString().length < 2) model.season_num = `0${model.season_num}`;
            if (model.episode_num.toString().length < 2) model.episode_num = `0${model.episode_num}`;
        }
        embed.setColor(14983436);
        embed.setAuthor('Tautulli', 'https://raw.githubusercontent.com/Tautulli/Tautulli/master/data/interfaces/default/images/logo-circle.png');
        embed.setTimestamp();
        if (admin) {
            embed.addField('Username', model.username, true);
            embed.addField('IP Address', model.ip_address, true);
            embed.addField('Device', model.player, true);
        }
        if (model.media_type == 'episode') embed.addField('Playing', `${model.show_name} - S${model.season_num}E${model.episode_num} - ${model.episode_name}`, false);
        if (model.media_type == 'movie') embed.addField('Playing', `${model.title} (${model.year})`, false);
        if (model.media_type == 'track') embed.addField('Playing', `${model.grandparent_title} - ${model.title}`, false);
        embed.addField('Playback Type', model.transcode_decision, true);
        embed.addField('Profile', model.quality_profile, true);
        if (admin) embed.addField('Session Key', model.session_key, true);
        return embed;
    }

    async tautulliMessage(data) {
        const mainLogChannel = this.guild.channels.find((x) => x.name === this.logChannel.statisticAdmin);
        let channel = this.guild.channels.find((x) => x.name === `log-${data.username}`) || false;
        if (!channel && mainLogChannel) channel = mainLogChannel;
        if (!channel) return;
        const userNotification = this.createMessageView(data, false);
        const adminNotification = this.createMessageView(data, true);

        switch (data.action) {
            case "play":
                userNotification.setTitle('Playback Started');
                adminNotification.setTitle('Playback Started');
                break;
            case "pause":
                userNotification.setTitle('Playback Paused');
                adminNotification.setTitle('Playback Paused');
                break;
            case "resume":
                userNotification.setTitle('Playback Resumed');
                adminNotification.setTitle('Playback Resumed');
                break;
            case "watched":
                userNotification.setTitle('Watched');
                adminNotification.setTitle('Watched');
                break;
            case "stop":
                userNotification.setTitle('Playback Stopped');
                adminNotification.setTitle('Playback Stopped');
                break;
            default:
                return;
        }
        channel.send({ embed: adminNotification });

        const userChannel = this.guild.channels.find((x) => x.name === this.logChannel.statisticUser);
        if (userChannel) userChannel.send({ embed: userNotification });
        return;
    }

    async _getPipe(command) {
        try {
            if (command.startsWith('/')) command = command.substring(1, command.length);
            const a = await axios({ method: 'get', responseType: 'stream', url: `${this._settings.mbUrl}${command}`, headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response && err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }

    async _delete(command, data = {}) {
        try {
            const a = await axios.delete(`${this._settings.mbUrl}${command}`, { data, headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _put(command, args) {
        try {
            const a = await axios.put(`${this._settings.mbUrl}${command}`, args, { headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _post(command, args) {
        try {
            const a = await axios.post(`${this._settings.mbUrl}${command}`, args, { headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }
    async _get(command, args) {
        try {
            let params = '?';
			if (typeof (args) == 'object') {
				for (let key of Object.keys(args)) {
					params += `${key}=${args[key]}&`;
				}
            }
            const a = await axios.get(`${this.mburl.protocol}//${this.mburl.host}${this.mburl.path}${command}${params}`, { headers: { 'Authorization': `Bearer ${this._settings.mbToken}`, 'MB-Client-Identifier': this.clientId } });
            return a.data;
        } catch (err) {
            if (err.response && err.response.status == 400 && err.response.data.name == 'NotFound') throw new Error('Plugin is not enabled');
            else throw err;
        }
    }

    destroy() {
        if (this.notificationAgent) this.notificationAgent.disconnect();
    }
}