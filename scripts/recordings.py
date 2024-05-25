"""
Get songs for links in provided playlist(s)"""

from pathlib import Path

from constants import JSON_DB_FILE, RECORDINGS_DATA_DIR, SET_MAPPER_FILE
from database import lookup_song_from_database
from utils import read_json_file, write_json_file


def get_recording_data_for_set(recording_path, use_cached=True, write_cache=True):
    """
    Given a VDJ-style or M3U-style playlist, poll the database for song data for those songs.

    Args:
    - playlist_path: Path object pointing to an M3U or vdjfolder.xml playlist

    Kwargs:
    - use_cached: whether to look in the SONG_LISTS_DIR for a matching pre-fetched song list.
    - write_cache: whether to write the fetched song list data to the SONG_LISTS_DIR directory.
    """

    # Store cache just using filename
    recording_name = Path(recording_path).name

    # Cached version of song lookups
    recording_scan_file = Path(recording_name).with_suffix(".json")
    recording_scan_path = Path(RECORDINGS_DATA_DIR, recording_scan_file)

    # Check to see if we have a cached mapping file for this playlist
    if use_cached and Path(recording_scan_path).is_file():
        if DEBUG:
            print("Found cached song list, skipping database lookup.")
        return read_json_file(recording_scan_path)

    #  Otherwise, lookup the recording from the database
    else:
        print("No cached recording data found, looking up recording from database.")

        recording_entry = lookup_song_from_database("@FilePath", str(recording_path))
        print(f"Found match, caching data")

    # Write a cached version of the song_list file, if enabled
    if write_cache:
        print(f"Writing cached copy to {recording_scan_path}")
        write_json_file(recording_entry, recording_scan_path)

    return recording_entry


if __name__ == "__main__":
    import time

    start_time = time.time()

    print(f"Loading set mapper file: {Path(SET_MAPPER_FILE)}")
    set_mapper = read_json_file(SET_MAPPER_FILE)
    database = read_json_file(JSON_DB_FILE)

    recording_scans = []

    # Find or create playlist files for sets in the set mapper
    for set_data in set_mapper:
        if not set_data.get("recording"):
            print(
                f"Skipping entry without mapped recording: {set_data.get('playlist')}"
            )
            continue

        recording_file_path = Path(set_data["recording"])

        recording_data = get_recording_data_for_set(
            recording_file_path, use_cached=True, write_cache=True
        )

        recording_scans.append(recording_data)

    print(
        f"Scanned {len(set_mapper)} playlists in {round(time.time() - start_time, 4)} seconds"
    )
    print("DONE")
