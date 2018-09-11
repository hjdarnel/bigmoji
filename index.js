const { text, send } = require('micro');
const request = require('request-promise-native');
const qs = require('query-string');
const url = require('url');

const { createLogger } = require('bunyan');

const logger = createLogger({
    name: 'emoji',
    level: 'debug'
});

const auth = process.env.SLACK_TOKEN;

if (!auth) {
    throw new Error('No auth token!');
}

const respond = async (req, res) => {
    const body = await qs.parse(await text(req));

    logger.debug('Received command', body.text);

    const input = body.text;
    const responseUrl = body.response_url;

    if (!responseUrl) {
        send(res, 400);
    } else if (!input) {
        return 'No emoji provided!';
    } else {
        send(res, 200, {
            response_type: 'ephemeral',
            text: `Getting raw URL for ${input}`
        });

        try {
            await getEmoji(input, responseUrl);
        } catch (e) {
            logger.warn('Error getting emoji', e);
        }
    }
};

const getEmoji = async (input, responseUrl) => {
    const { emoji } = await request.get('https://slack.com/api/emoji.list', {
        qs: {
            token: auth
        },
        json: true
    });

    const regex = /:/g;
    const parsedInput = input.replace(regex, '');

    const bigUrl = emoji[parsedInput];

    let response;
    if (bigUrl) {
        response = {
            response_type: 'ephemeral',
            text: emoji[parsedInput]
        };
    } else {
        response = {
            response_type: 'ephemeral',
            text: `${input} not found. Perhaps it's a default emoji?`
        };
    }

    return request.post({
        url: responseUrl,
        headers: { 'Content-Type': 'application/json' },
        body: response,
        json: true
    });
};

module.exports = respond;
