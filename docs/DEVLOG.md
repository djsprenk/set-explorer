# Developer Log

Random assorted notes from trying to analyze data from DJing.

## VirtualDJ data discovery

I played around a lot in trying to understand what sort of data we can get from
VirtualDJ, see [VirtualDJ notes](./VirtualDJ%20notes.md).

**TL;DR**

- The `database.xml` has representations of all songs and song metadata.
- This metadata requires a fair amount of cleaning and data transform to be useful.
- This can be combined with data from playlists (etc.) to do interesting things.

## Mixcloud data discovery

By poking around in the network tools while looking at Mixcloud, I was able to find some
ways to extract data that is otherwise not easily queryable from the documented APIs. See
[Mixcloud notes](./Mixcloud%20notes.md).

**TL;DR**

- Mixcloud stores pretty much everything in a Graph database.
- This is hard to query without an understanding of that data shape, but we can use /
lightly modify existing queries to get data we want.
- This includes stuff like set metadata, engagement statistics, and links.

## Create energy graph from sets

The first big project I want to do is create graphs showing the energy curves of sets
I've recorded.

Initially, my thought was to:

1. Read the cue points from recorded set files (since VDJ adds
these automatically while recording).
2. Look up the songs by title (with possible mapping for places where these don't match).
3. Pull the energy from the song metadata (encoded as "Rating") for my system.

But then I realized that I *also* have matching playlists for each set I record. It would
be easier to just point my scripts to those playlists, which makes the job of matching
the song order just a little bit easier. The new idea:

1. Point to a playlist, get the songs / order from playlist.
2. Look up songs by path (these should be an exact match and less prone to ambiguity).
3. Pull energy from song metadata in the database.
4. Profit!

A playlist has this schema:

```m3u
#EXTVDJ:<filesize>{bytes}</filesize><artist>{string}</artist><title>{title}</title><remix>{remix}</remix><songlength>{seconds}</songlength>
{filepath}
```

First, we gotta get our `database.xml` into a better form, using `scripts/convert.py` to convert the `database.xml` to `database.json`.

Next, I created a `playlists.py` to go to a specific playlist and get song metadata.

This finds the playlist `.m3u` file and reads out the filepaths there for each song.

Then it has to look up these songs from the database. Since the database is just a list
of songs, it has to manually iterate through them to find a matching entry... so this is
slower, but it works.

Once it finds a matching song, we have all the song metadata. Iterating over this list we
can query each song for its Rating (encoded as the `@Stars` attribute) and then use
`matplotlib` to graph the result.

**An early example**:

![Graph v1](./energy-graph-v1.png)

### Graph & Script Improvements

Next I played with some improvements both to the script and the graphs:

- Take set name from command line arguments.
- Added search, will search several locations (including direct path, and "Past Sets")
  for provided playlist.
- Added color-coded bars for prettier graphs.

At the end of all of this, I have a script that looks like this:

```sh
python scripts/playlists.py <name-or-path-to-playlist>
```

And produces graphs like this:

![Graph v2](./energy-graph-v2.png)

### Multi Graph

Next up I wanted the abliity to show multiple sets at the same time. I refactored the
script to take multiple input arguments and convert into subplots in the graph.

This required a few tweaks to the initial graphing function, but now works for both
individual and multiple inputs.

```sh
python scripts/playlists.py "playlist 1" "playlist 2" "playlist 3" "playlist 4"
```

Creates an example like this one, where I graphed all 4 sets from  Richmond:

![Multi-graph v2](./energy-graph-v2-multi.png)

### Song align

Next, I wanted a way to show sets aligned to each other (by song). Another quick tweak
(as simple as setting x-axis based on the max set length) and we have the following,
togglable with the `--align` flag (which pointed out a bug I had to fix with how I was)
getting flags from my command line.

```sh
python scripts/playlists.py --align "playlist 1" "playlist 2" "playlist 3" "playlist 4"
```

![Multi-graph v2](./energy-graph-v2-multi-aligned.png)

### Read playlists from file

A quality of life improvement I added was the ability to read playlists from a file.

This was to keep me from typing in lots of text when I could, instead, get this to a file.

I did this by first getting a list of playlists from a folder:

```sh
cd {playlist folder}
ls > playlists.txt
```

Then with some light regex, I was able to convert this to an array to make it even easier
to load into Python with `json.loads(playlist path)`.

So now I can run:

```sh
python scripts/playlists.py --file {playlists.json file path}
```

And run the script for many playlists.

This, however, has surfaced some pain points:

1. This is SLOW, since it has to do a song lookup for each song in each set. e.g. running
  this for all 48 playlists from 2023, this took 3 minutes. That's only a few seconds per
  set, but still...

2. For a long list of sets, the visuals are useless, they scale to fit in a single
  window (below)

![Too many graphs](./energy-graph-v2-crowded.png)

But this gives me new ideas for improvements:

1. Thinking a speed enhancement might be to add a better song lookup instead (or in
  addition to) a playlist lookup.

2. There isn't a way in Matplotlib to fix this, but this was never the end-game.
  Thinking of moving to web-based visualization / discovery. The other option is looking
  into PyQt programming which seems... hard.

Yay, new ideas!