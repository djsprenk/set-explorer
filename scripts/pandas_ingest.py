"""
Use Pandas to do data transforms & joins of set data.
"""
from pathlib import Path

import pandas as pd

from scripts.constants import SONG_LISTS_DIR
from scripts.utils import read_json_file

playlist_file = Path(SONG_LISTS_DIR, "20230113 - Interfusion Day Party.json")
raw_song_data = read_json_file(playlist_file)


# Read and unpack nested data, renaming important columns
song_data = pd.json_normalize(raw_song_data)
song_data = song_data.rename(columns={"Tags.@Title": "Title", "Tags.@Stars": "Energy"})

song_data["index"] = [i for i in range(len(song_data))]
song_data["set"] = playlist_file.name
song_energy = song_data[["index", "set", "Title", "Energy"]]
