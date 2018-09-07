# bigmoji
A server that responds to slash commands in Slack by parsing the argument and returning the link to the emoji image.

Polls Slack's [emoji.list](https://slack.com/api/emoji.list) method using an environment variable `SLACK_TOKEN` for authentication, and matches the argument with the returned list.
