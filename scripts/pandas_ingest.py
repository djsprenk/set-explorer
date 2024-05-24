"""
Use Pandas to do data transforms & joins of set data.

Reads from sets_list.json and writes to data-processed-files/song-data.js.
"""

import json
from pathlib import Path

import pandas as pd
from constants import PROCESSED_FILES_DIR, SONG_LISTS_DIR, STATIC_DIR
from utils import read_json_file

live_sets = read_json_file(Path(PROCESSED_FILES_DIR, "live-sets-data.json"))
produced_sets = read_json_file(Path(PROCESSED_FILES_DIR, "produced-sets-data.json"))
OUTPUT_FILE_PATH = Path(STATIC_DIR, "song-data.js")

sets_data = []

mixcloud_slugs_raw = read_json_file(Path(PROCESSED_FILES_DIR, "mixcloud-data.json"))
mixcloud_slugs = pd.json_normalize(mixcloud_slugs_raw["data"])


def extract_song_data_for_playlist(set_data, additional_meta):
    """Get song data for a playlist file.

    Returns dict of cleaned and formatted data.
    """
    playlist_file = Path(SONG_LISTS_DIR, set_data["playlist"])
    raw_song_data = read_json_file(playlist_file.with_suffix(".json"))

    # Read and unpack nested data, renaming important columns
    song_data = pd.json_normalize(raw_song_data)
    song_data = song_data.rename(
        columns={
            "Tags.@Title": "Title",
            "Tags.@Author": "Artist",
            "Tags.@Stars": "Energy",
        }
    )

    # A few, rare playlists don't have any songs with energy associated, zero them out
    if song_data.get("Energy") is None:
        song_data["Energy"] = 0

    # Fill NaN values
    song_data["Energy"] = song_data["Energy"].fillna(0)

    # Find match in mixcloud_slugs
    matches = mixcloud_slugs.index[
        mixcloud_slugs["slug"] == set_data.get("slug")
    ].tolist()

    # For now, skip anything not published to mixcloud
    if not matches:
        return
    mixcloud_data = mixcloud_slugs.iloc[matches[0]] if matches else {}

    song_data["index"] = [i for i in range(len(song_data))]
    song_data["set"] = playlist_file.name
    song_energy = song_data[["index", "Title", "Artist", "Energy"]]

    return {
        "title": mixcloud_data.get("name") or playlist_file.name,
        "url": mixcloud_data.get("url"),
        "uploadTimestamp": mixcloud_data.get("created_time"),
        "img": mixcloud_data.get("pictures.large"),
        "data": song_energy.to_dict(orient="records"),
        **additional_meta,
    }


for set_data in live_sets:
    extracted_data = extract_song_data_for_playlist(set_data, {"type": "live"})
    if not extracted_data:
        continue
    sets_data.append(extracted_data)

for set_data in produced_sets:
    extracted_data = extract_song_data_for_playlist(set_data, {"type": "produced"})
    if not extracted_data:
        continue
    sets_data.append(extracted_data)

with open(OUTPUT_FILE_PATH, "w", encoding="utf-8") as output_file:
    output_file.write("const songData = ")
    output_file.write(json.dumps(sets_data))
    output_file.close()
