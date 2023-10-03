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

To get the actual set of tracks, I'm using the (published) APIs to get a list of set slugs:

https://api.mixcloud.com/{username}/cloudcasts/?metadata=1

And wrote the `sets_from_cloudcast_data.py` script to extract the slugs into a JSON file for running through Postman.

This allowed me to use the Postman runner with the output JSON (and, importantly `Preserve Responses` setting checked) to get the stats for a bunch of sets in bulk.

**Note** that the list of slugs from the Mixcloud API is paginated at 20 responses at a time, so there is some manual collection of this data (or future enhancements of the scripts) to get to a place where all uploaded sets can be analyzed easily.

