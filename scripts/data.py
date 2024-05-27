"""
Use Pandas to do data transforms & joins of set data.

Reads from sets_list.json and writes to data-processed-files/song-data.js.
"""

import json
from pathlib import Path

import pandas as pd
from constants import (
    MIXCLOUD_DATA_FILE,
    RECORDINGS_DATA_DIR,
    SET_MAPPER_FILE,
    SONG_DATA_FILE,
    SONG_LISTS_DIR,
)
from utils import read_json_file


def get_recording_data(set_data):
    """
    Get recording data for joining.
    """
    if not set_data.get("recording"):
        print(
            f"No recording data for set {Path(set_data['playlist']).name}, skipping data join."
        )
        return

    recording_data_file = Path(RECORDINGS_DATA_DIR, Path(set_data["recording"]).name)
    recording_data = read_json_file(recording_data_file.with_suffix(".json"))

    # Read and unpack nested data, renaming important columns
    recording_data_frame = pd.json_normalize(recording_data)

    # Expand POIs
    pois = recording_data_frame["Poi"].explode(ignore_index=True)
    pois_expanded = pd.json_normalize(pois)

    # Try to get BPM columns
    if pois_expanded.get("@Bpm") is not None:
        bpm_markers = pois_expanded["@Bpm"].dropna().astype(float)
        return {
            "bpmMin": bpm_markers.min().round(),
            "bpmMax": bpm_markers.max().round(),
        }

    return {"bpmMin": "n/a", "bpmMax": "n/a"}


def extract_song_data_for_playlist(set_data, additional_meta):
    """Get song data for a playlist file.

    Returns dict of cleaned and formatted data.
    """
    playlist_file = Path(SONG_LISTS_DIR, Path(set_data["playlist"]).name)
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

    # Join recording data
    recording_data = get_recording_data(set_data) or {}

    song_data["index"] = [i for i in range(len(song_data))]
    song_data["set"] = playlist_file.name
    song_energy = song_data[["index", "Title", "Artist", "Energy"]]

    return {
        "title": mixcloud_data.get("name") or playlist_file.name,
        "url": mixcloud_data.get("url"),
        "uploadTimestamp": mixcloud_data.get("created_time"),
        "img": mixcloud_data.get("pictures.large"),
        "data": song_energy.to_dict(orient="records"),
        **recording_data,
        **additional_meta,
    }


if __name__ == "__main__":

    # Load set mapper
    set_mapper = read_json_file(SET_MAPPER_FILE)

    sets_data = []

    mixcloud_slugs_raw = read_json_file(MIXCLOUD_DATA_FILE)
    mixcloud_slugs = pd.json_normalize(mixcloud_slugs_raw["data"])

    for set_data in set_mapper:
        additional_meta = {"type": set_data["type"]}
        playlist_file = set_data["playlist"]
        extracted_data = extract_song_data_for_playlist(set_data, additional_meta)
        if not extracted_data:
            continue
        sets_data.append(extracted_data)

    with open(SONG_DATA_FILE, "w", encoding="utf-8") as output_file:
        print(f"Writing compiled set data to {SONG_DATA_FILE}")
        output_file.write("const songData = ")
        output_file.write(json.dumps(sets_data))
        output_file.close()
        print("DONE")
