import axios from 'axios';
import { Decipher } from './Decipher.js';

export class Downloader {
    constructor(url) {
        this.url = url;
        this.type = 'audio/mp4';
    }

    async download() {
        if (!this.isValidUrl()) {
            return this.errorResponse(400, 'Invalid download URL.', 'FAILED_PRECONDITION');
        }

        if (!await this.getPlayerResponse()) {
            return this.errorResponse(400, 'Unable to download.', 'FAILED_PRECONDITION');
        }

        const videoDetails = this.getVideoDetails();
        const streamingDetails = await this.getStreamingData();

        return { videoDetails, streamingDetails };
    }

    async getPlayerResponse() {
        try {
            const { data } = await axios.get(`https://youtu.be/${this.getVideoID()}`);
            const matches = Array.from(data.matchAll(/(?:<script src="\/s\/player\/([a-f0-9]+)\/player_ias\.vflset|var ytInitialPlayerResponse = ({.*?});)/gs));

            this.playerResponse = matches[0] ? JSON.parse(matches[0][2]) : { };
            this.player_ias = matches[1] ? matches[1][1] : '';

            return this.playerResponse?.playabilityStatus?.status === 'OK';
        } catch (error) {
            console.error('getPlayerResponse: ', error.message);
        }
    }

    async getStreamingData() {
        const formats = this.filterFormatsByMimeType();
        const signature = new Decipher(this.player_ias);
        await signature.initialize();

        for (const format of formats) {
            if (format.signatureCipher) {
                format.url = signature.deobfuscate(format.signatureCipher);
                delete format.signatureCipher;
            }

            this.cleanFormatProperties(format);
        }

        return formats;
    }

    cleanFormatProperties(format) {
        const propertiesToDelete = ['lengthSeconds', 'mimeType', 'itag', 'bitrate', 'initRange', 'indexRange', 'projectionType', 'averageBitrate', 'audioChannels', 'loudnessDb', 'colorInfo', 'highReplication', 'lastModified', 'audioQuality', 'approxDurationMs', 'audioSampleRate', 'quality', 'trackAbsoluteLoudnessLkfs'];

        propertiesToDelete.forEach(property => delete format[property]);
        format.contentLength = this.formatBytes(format.contentLength ?? 0);
    }

    filterFormatsByMimeType() {
        const adaptiveFormats = this.playerResponse.streamingData.adaptiveFormats ?? { };

        return adaptiveFormats.filter(format => format.mimeType.includes(this.type));
    }

    getVideoDetails() {
        const { thumbnails } = this.playerResponse.videoDetails.thumbnail ?? { thumbnails: { } };
        const { url } = thumbnails[thumbnails.length - 1] ?? { url: '' };

        return {
            title: this.playerResponse.videoDetails.title ?? '',
            thumbnail: url,
        };
    }

    formatBytes(bytes) {
        const kilobytes = bytes / 1024;
        const megabytes = kilobytes / 1024;
        const gigabytes = megabytes / 1024;

        if (gigabytes >= 1) {
            return `${gigabytes.toFixed(2)} GB`;
        } else if (megabytes >= 1) {
            return `${megabytes.toFixed(2)} MB`;
        } else {
            return `${kilobytes.toFixed(2)} KB`;
        }
    }

    isValidUrl() {
        const parse = new URL(this.url);
        const host = parse.hostname;

        return ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(host);
    }

    getVideoID() {
        const match = this.url.match(/^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/);

        return match[1] ?? '';
    }

    errorResponse(code, message, status) {
        return { error: { code, message, status } };
    }
}