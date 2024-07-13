"""
Use Pandas to do data transforms & joins of set data.

Reads from sets_list.json and writes to data-processed-files/song-data.js.
"""

import json
from math import nan
from pathlib import Path

import pandas as pd
from constants import (
    MIXCLOUD_DATA_FILE,
    RECORDINGS_DATA_DIR,
    RECORDINGS_DATA_OVERRIDE_DIR,
    SET_MAPPER_FILE,
    SONG_DATA_FILE,
    SONG_LISTS_DIR,
    SONGS_LIST_OVERRIDE_DIR,
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

    # Check to see if we have an override first
    recording_file_name = Path(set_data["recording"]).with_suffix(".json").name
    recording_override_path = Path(RECORDINGS_DATA_OVERRIDE_DIR, recording_file_name)
    if recording_override_path.exists():
        recording_data_raw = read_json_file(recording_override_path)

    # Otherwise, get the existing recording file
    else:
        recording_data_file = Path(RECORDINGS_DATA_DIR, recording_file_name)
        recording_data_raw = read_json_file(recording_data_file)

    # Read and unpack nested data, renaming important columns
    recording_data_frame = pd.json_normalize(recording_data_raw)

    # Expand POIs
    pois_data_frame = pd.json_normalize(
        recording_data_frame["Poi"].explode(ignore_index=True)
    )

    # If a set has constant BPM, none of the POIs will include a BPM. Seed it:
    if "@Bpm" not in pois_data_frame.columns:
        pois_data_frame["@Bpm"] = nan

    # Get POIs
    pois = pois_data_frame[["@Pos", "@Name", "@Bpm", "@Type"]]

    # Limit to just beatgrid & cues
    pois = pois.loc[(pois["@Type"] == "beatgrid") | (pois["@Type"] == "cue")]

    # BPM is left blank if it is the same as set BPM
    # Fill this in with set BPM (stored confusingly as seconds per beat)
    # i.e. VDJ BPM of 0.857143 correlates to 70 BPM
    set_bpm = (60 / recording_data_frame["Scan.@Bpm"].astype(float)[0]).round()
    beatgrid = pois["@Type"] == "beatgrid"
    pois.loc[beatgrid, "@Bpm"] = pois.loc[beatgrid, "@Bpm"].fillna(set_bpm)

    # Fill in missing timestamps with zeroes
    pois["@Pos"].fillna("0", inplace=True)

    # Sort by position (treating as floats)
    pois["@Pos"] = pois["@Pos"].astype(float)
    pois = pois.sort_values(by="@Pos")

    # Fill in missing BPMs from songs, starting with backfill, then forward fill
    pois["@Bpm"] = pois["@Bpm"].fillna(method="bfill")
    pois["@Bpm"] = pois["@Bpm"].fillna(method="ffill")

    # Rename the columns for export
    pois = pois.rename(
        columns={"@Pos": "timestamp", "@Name": "song", "@Bpm": "bpm", "@Type": "type"}
    )

    recording_data = {
        "bpmMin": pois["bpm"].astype(float).min(),
        "bpmMax": pois["bpm"].astype(float).max(),
        "length": recording_data_frame["Infos.@SongLength"].astype(float).round()[0],
        "pois": pois[["timestamp", "song", "bpm", "type"]].to_dict(orient="records"),
    }

    return recording_data


def extract_song_data_for_playlist(set_data, additional_meta):
    """Get song data for a playlist file.

    Returns dict of cleaned and formatted data.
    """

    # Check to see if we have an override first
    playlist_file_name = Path(set_data["playlist"]).with_suffix(".json").name
    playlist_override_file_path = Path(SONGS_LIST_OVERRIDE_DIR, playlist_file_name)
    if playlist_override_file_path.exists():
        raw_song_data = read_json_file(playlist_override_file_path)

    # Otherwise, get the existing recording file
    else:
        playlist_file_path = Path(SONG_LISTS_DIR, playlist_file_name)
        raw_song_data = read_json_file(playlist_file_path)

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
        playlist_file = Path(set_data["playlist"])
        extracted_data = extract_song_data_for_playlist(set_data, additional_meta)
        if not extracted_data:
            continue
        sets_data.append(extracted_data)

    with open(SONG_DATA_FILE, "w", encoding="utf-8") as output_file:
        print(f"Writing compiled set data to {SONG_DATA_FILE}")
        output_file.write("const songData = ")
        output_file.write(json.dumps(sets_data))
        output_file.write("\n export default songData")
        output_file.close()
        print("DONE")
