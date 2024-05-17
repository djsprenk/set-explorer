"""
Use Pandas to do data transforms & joins of set data.

Reads from sets_list.json and writes to data-processed-files/song-data.js.
"""
import json
from pathlib import Path

import pandas as pd

from scripts.constants import DATA_DIR, PROCESSED_FILES_DIR, SONG_LISTS_DIR
from scripts.utils import read_json_file

sets_list = read_json_file(Path(DATA_DIR, "sets_list.json"))
OUTPUT_FILE_PATH = Path(PROCESSED_FILES_DIR, "song-data.js")

sets_data = []

for playlist in sets_list:
    playlist_file = Path(SONG_LISTS_DIR, playlist)
    raw_song_data = read_json_file(playlist_file.with_suffix(".json"))

    # Read and unpack nested data, renaming important columns
    song_data = pd.json_normalize(raw_song_data)
    song_data = song_data.rename(
        columns={"Tags.@Title": "Title", "Tags.@Stars": "Energy"}
    )

    song_data["index"] = [i for i in range(len(song_data))]
    song_data["set"] = playlist_file.name
    song_energy = song_data[["index", "Title", "Energy"]]

    sets_data.append(
        {"set_title": playlist_file.name, "data": song_energy.to_dict(orient="records")}
    )

with open(OUTPUT_FILE_PATH, "w", encoding="utf-8") as output_file:
    output_file.write("const song_data = ")
    output_file.write(json.dumps(sets_data))
    output_file.close()
