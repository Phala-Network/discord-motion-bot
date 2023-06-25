# Discord Motion Bot

This is a simple bot to send Phala & Khala pending voting motion notification to a discord group.

Tested with node v14. Must config `.env` file like below:

```
WEBHOOK_URL=https://discord.com/api/webhooks/..../....
MENTION=<@&.....>
```

Usage:

```
# Test to preview without sending messages
DRY_RUN=1 node .
# Actually run it
node .
```
