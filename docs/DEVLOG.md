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

### Web-based graphing

I want to (eventually) move this into a web-based visualization. This makes it more
easily sharable on the web and gets us lots of cool visualization / scaling tools like
D3 and reactive web development.

Using [this example](https://d3-graph-gallery.com/graph/barplot_basic.html), only lightly edited, I was able to get a version graphing from the exact same output data (`song-list.json`) produced by my other scripts.

2 Tricks I had to figure out:

1. CORS, how I loathe thee. Remembering that it is difficult to load local files for
  early JS development, I had to copy-paste song data in to a file, set it to a variable,
  and inject our data that way. Eventually, I'll likely move to putting that data either
  in the cloud or making a lightweight server to host those to the frontend.

2. D3 needs some form of unique index for each item. Our items were ordered but otherwise
  not guaranteed to be unique. I added a pre-processing step to add an index to each
  entry to keep them unique and ordered.

So by adding a file called `song-data.js` in `static`, and copy pasting the output from a `song-list.json` file, setting it to a variable referenced in our `graph.js` file..

```js
song_data = [ { <song data> }, { <song data> }...]
```

... we can get a super simple implementation in D3!

![D3 Graph V1](./energy-graph-d3-v1.png)

Next up I want to work on scaling and adding sub-plots as well as actually fetching the data (likely from a Flask backend?) to avoid hard-coding the source data.

### Using Plotly?

Chatting with my dad (also a software engineer and data nerd), he suggested looking at [Plotly](https://plotly.com/python/getting-started/) which has the ability to write graphs using a Python API and then export to HTML. Seems really cool!

[I played with this a bit](../scripts/plotly-test.py) and found it was pretty easy to make really basic graphs but it made a lot of annoying assumptions about desired behavior which I had trouble figuring out how to override. One example was assuming I wanted to group bars by color, which *did* let me color the bars, but failed to preserve order:

![Plotly graph attempt](./energy-graph-plotly-v1.png)

### Using Pandas

This did lead me to investigate using Pandas to ingest data (as it unlocked some cool, more advanced behaviors). It was powerful enough, I will probably [keep some of the data joining / ingest behavior going forward](../scripts/pandas-ingest.py), but I did end up abandoning Plotly.

### Return to D3

So, finally, I return to D3. I started trying to tweak some of the graph examples to look more like the horizontal timeline I desired:

![D3 energy graph V2](./energy-graph-d3-v2.png)

This got me closer, but I ended up abandoning D3's built in Graphing capabilities (again for the base assumptions built in that I didn't need) when I found I was able to build a timeline manually using colored rectangles to represent the songs.

Here is an early example:

![D3 energy graph V3](./energy-graph-d3-v3.png)

### Multiple Charts

Next I had to do a bunch of refactors to split out behaviors into more discrete components.
This included splitting playlist data gathering and graphing, keeping around my tests
using Matplotlib and Plotly just for posterity.

This was largely inspired by moving to a different laptop, having to re-test earlier
scripts and by the fact that the VDJ playlist format changed recently.

New workflow looks like this:

1. `python scripts/convert.py` - creates JSON database
2. `ls vdj-database/MyLists/Past Events.subfolders > data/processed-files/sets-list.json` - lists out
  the playlists in the location I want to work with.
3. Convert that list to a JSON array using some regex.
4. `python scripts/playlists.py --file data/processed-files/sets-list.json` - reads that list and
  collects song metadata for the songs in each playlist.
4. `python scripts/pandas_ingest.py` - formats the song data using Pandas for easier
  unpacking. Outputs to `song-data.json`.
5. Copy that file into `static/`, imported into `index.html` for use in `graph.js`

This semi-convoluted workflow DOES result in a page full of graphs!

![Energy Graph multi D3 v1](./energy-graph-d3-multi-v1.png)

### Page layout with Flexbox & CSS Grid

After some consideration, I decided it was probably better to just switch over to divs
for displaying songs instead of drawing an SVG. This gets us better display wrap
behavior with HTML page layout / styling options.

This also allowed me to move most of the styling from D3 into a standalone stylesheet.

To get everything to display correctly, I decided to use flexbox for dynamically resizing
sets to the container when there are too many songs.

I ended up coupling this with CSS grid to get a nice layout on the overall page, still
relying on flexbox for the actual timelines.

Result now:

![Energy Graph multi D3 v2](./energy-graph-d3-multi-v2.png)

### Linking Mixcloud Data

The graphs above are a really good start, but I would like several improvements:

1. Human-readable titles instead of folder paths.
2. Links to Mixcloud.
3. Album art?

These would be trivial (if extremely time consuming) to manually link. First I started
extending `sets-data.json` to look like below:

```json
[
  {
    "playlist": "20240211 - SBKZ 4.vdjfolder",
    "name": "Crystalize | NY SBKZ Congress (Sunday Night)",
    "url": "https://www.mixcloud.com/djsprenk/20240211-ny-sbkz-4/",
    "img": "url"
  }...
]
```

However! I like automating things. Instead, going back to the Mixcloud API, I decided
it would be good to poll those APIs for the relevant data and then join it to my
existing data.

Playing with this endpoint, testing different limits, I can get 100 sets at a time.

```
https://api.mixcloud.com/{username}/cloudcasts/?limit=200&metadata=1
```

Returning this format:

```json
{
    "data": [
        {
            "key": "/{user}/{slug}/",
            "url": "https://www.mixcloud.com/{user}/{slug}",
            "name": "{name}",
            "tags": [ ... ],
            ...
            "pictures": {
                "{size}": "https://thumbnailer.mixcloud.com/unsafe/{w}x{h}/extaudio/{guid}",
                ...
            },
            "slug": "{slug}",
            ...
            "audio_length": {seconds},
        },
```

This did require a manual mapping of playlist path to Mixcloud slug.

Here I modified `sets-data.json` to now have both a playlist and a slug:

```json
[
    {
        "playlist": "{playlist}.vdjfolder",
        "slug": "{slug}"
    }
]
```

With that, I could update `pandas_ingest.py` to link Mixcloud title, URL, and thumbnail URL to the output `song-data.js`.

By tapping into this linked data, I could now mirror titles / URLS to the entries in my
graphs.

![Energy graphs with linked Mixcloud titles / URLs](./energy-graph-d3-multi-v3.png)