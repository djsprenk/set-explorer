# Getting data out of Virtual DJ

Step 1 was to figure out how to get data out of Virtual DJ. A while back I learned that database backups were a thing, primarily for migrating VDJ to a new machine. Digging through that export, I found the `database.xml` file which is VDJ's way of encoding info about songs. This was the starting point for realizing that I might be able to use that as a place to mine for analytics/visualization.

Step 2 was to get that into a format I could clean/work with. XML is a pain so I wrote a quick Node script to transform that into a JSON representation of that file. I did end up replacing this with a Python script, just because I'm more comfortable using that for data transformation/analysis.

## My Sets

Once I had a database I was more comfortable working in, I wanted to filter it to just the bits I cared about: my sets. I wrote a simple Python filter to only pass sets (matching the genre I use "Zouk Sets") where I was the artist.

## Beatgrid

The first bit of info I was interested in was digging into sets and seeing how the BPM changed over the course of a set.

Each song has a `Scan` and a `Poi` (points of interest) section. `Scan` appears to be the top-level info about the set, `Key`, single `Bpm`, etc. For longer sets, what we actually care about are the changes in BPM encoded in the POI section.

Reverse engineering slightly, using an example:

```
{
    "@Pos": "235.679551",
    "@Type": "beatgrid",
    "@Bpm": "81.0"
},
```

Looking at the same example in Virtual DJ:

```
position=03:55:680 (320.000 beat)
```

This shows us that the `@Pos` is just seconds into the song, making graphing that relatively easy.