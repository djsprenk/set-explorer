# Getting Data From Mixcloud

There is an existing API framework, reached by adding `api` subdomain instead of `www`, but it does not do everything.

One area in particular I really wanted was to get engagement stats out of Mixcloud.

## Digging in network requests

From digging around in the network requests, I found the GraphQL query that returns data behind the engagement stats.

```
POST https://app.mixcloud.com/graphql

{
    "query": "query CloudcastStatsQuery(\n $lookup: CloudcastLookup!\n) {\n  cloudcastLookup(lookup: $lookup) {\n    id\n    name\n    slug\n    stats {\n      plays {\n        totalCount\n      }\n    }\n    owner {\n      username\n      id\n    }\n    ...EngagementChart_cloudcast\n  }\n}\n\nfragment EngagementChart_cloudcast on Cloudcast {\n  sections {\n    __typename\n    ... on TrackSection {\n      artistName\n      songName\n    }\n    ... on ChapterSection {\n      chapter\n    }\n    ... on SectionBase {\n      __isSectionBase: __typename\n      startSeconds\n    }\n    ... on Node {\n      __isNode: __typename\n      id\n    }\n  }\n  stats {\n    engagement {\n      data {\n        value\n      }\n    }\n  }\n}\n",
    "variables": {
        "lookup":{
            "username":"{{username}}",
            "slug":"{{slug}}"
        }
    }
}
```

With a Response:
```
{
    "data": {
        "cloudcastLookup": {
            "id": "{{Lookup ID}}",
            "name": "{{Set Name}}",
            "slug": "{{Set Slug}}",
            "stats": {
                "plays": {
                    "totalCount": {{int}}
                },
                "engagement": {
                    "data": [
                        {
                            "value": {{int}}
                        },
                        {
                            "value": {{int}}
                        },
                        {
                            "value": {{int}}
                        },
                        ... etc.
                    ]
                }
            },
            "owner": {
                "username": "{{username}}",
                "id": "{{user ID}}"
            },
            "sections": [
                {
                    "__typename": "TrackSection",
                    "artistName": {{Artist Name}}",
                    "songName": "{{Song Name}}",
                    "__isSectionBase": "TrackSection",
                    "startSeconds": 0,
                    "__isNode": "TrackSection",
                    "id": "{{Node ID?}}"
                },
                ... etc.
            ]
        },
        "__requestId": "{{request ID}}"
    }
}
```

Next is to figure out what those engagement stats actually mean. In the example response under `engagement.data`, there were 107 "value" fields. As that is (roughly) also the length in minutes of the sample set, I think it is safe to assume these are taken at the minute mark, per minute. Since the numbers also (roughly) lineup at the start with the number of listens the set has, I'm going to run off the assumption that the value in each ordered field is the number of people listening at each minute mark.

After playing around in Postman for a while I was able to get the specific request for stats working in the environment.

The next task is to automate it!

## Automating Stat Collection

I want to go through every set in a list and pull stats. To do this, I'm learning how to use the [Runner in postman to run a set of requests using data file input](https://blog.postman.com/looping-through-a-data-file-in-the-postman-collection-runner/).

### Get Set Slugs

First thing is to get a list of track URLs. To do this, I'm using one of the (published) APIs to get a list of set slugs:

https://api.mixcloud.com/{{username}}/cloudcasts/?metadata={{page}}

Running this returns data like this:

```
{
    "data": [
        {
            "key": "/{{username}}/{{slug}}/",
            "url": "https://www.mixcloud.com/{{username}}/{{slug}}",
            "name": "{{name}}",
            "tags": [ ... ]
            ...
            "play_count": {{play_count}},
            "favorite_count": {{favorite_count}},
            "comment_count": {{comment_count}},
            "listener_count": {{listener_count}},
            "repost_count": {{repost_count}},
            "pictures": { ... },
            "slug": "{{slug}}",
            "user": { ... }
            "audio_length": {{audio_length}},
            "type": "cloudcast"
        },
        ...
    ],
    "paging": {
        "next": "https://api.mixcloud.com/{{username}}/cloudcasts/?limit=20&metadata=1&until={{datetime}}",
        "previous": "https://api.mixcloud.com/djsprenk/cloudcasts/?limit=20&metadata=1&since={{datetime}}"
    }
}
```

**Note** that the list of slugs from the Mixcloud API is paginated at 20 responses at a time, so there is some manual collection of this data (or future enhancements of the scripts) to get to a place where all uploaded sets can be analyzed easily.

Next I wrote the wrote the `sets-from-cloudcast-data.py` script to pull the set slugs and format into a JSON file for running through Postman.

### Pull engagement stats

To run, I created a Postman request to `https://app.mixcloud.com/graphql` using the reverse-engineered graphql query above.

To hit any request that gets your specific stats, you need to be authenticated so I used the Postman Interceptor.

1. Log into Mixcloud.
2. Activate the extension to pull cookies / CSRF tokens from logged in session of Mixcloud.
3. Run the request in Postman to see it gets a valid response.

### Automate pulling engagement stats

Now that we know we can pull stats and we have a list of set slugs, we can use the Postman runner with the output JSON (and, importantly `Preserve Responses` setting checked) to get the stats for a bunch of sets in bulk.

1. Open the Postman runner.
2. Select the `POST Get Stats` query to run.
3. For data, select the output `set-slugs.json` file, this sets the set slug variable per file.
4. Check "Persist Responses" for a session to save the output stats.
5. Run.

Unfortunately, there's not a good built-in way to export the response bodies of these requests. So, sing responses from [this stack overflow post](https://stackoverflow.com/questions/56448021/bulk-post-put-api-requests-using-postman-or-any-other-means/71899537#71899537) I added a test to the collection to dump the responses into a collection variable. You do have to manually pull out the response but it is at least some level of persistence.

I saved this to `mixcloud-export/set-stats.json`.

### Graphing engagement over time

The next thing I wanted to do was see how set engagement mapped over time across many sets.

The task here is relatively simple, I want to turn that JSON into a CSV of the schema:

```
set name, engagement (minute 1), engagement (minute 2) .... etc.
```

This will chart engagement for all sets aligned together.