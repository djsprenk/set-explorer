"""
Get songs for links in provided playlist(s)"""
import json
import sys
from pathlib import Path

from scripts.constants import SONG_LISTS_DIR, VDJ_EXPORT_DIR
from scripts.convert import read_from_xml
from scripts.utils import (
    command_args_flags,
    lookup_song_from_database,
    read_json_file,
    write_json_file,
)

# Default playlist path search order:
# 1) Direct path
# 2) VDJ/Playlists/Past Events
# 3) VDJ/Playlist/Past Events/{year}
PLAYLIST_SEARCH_ORDER = [
    "",
    Path(VDJ_EXPORT_DIR, "Playlists/Past Events"),
    Path(VDJ_EXPORT_DIR, "Playlists/Past Events/2024"),
    Path(VDJ_EXPORT_DIR, "Playlists/Past Events/2023"),
    Path(VDJ_EXPORT_DIR, "Playlists/Past Events/2022"),
]


def read_m3u_playlist(m3u_path):
    """Get song paths from an M3U-style playlist."""
    song_paths = []

    with open(m3u_path, "r", encoding="utf-8") as file:
        for line in file:
            # #EXTVDJ: is a directive with VDJ metadata, skip these
            if line.startswith("#EXTVDJ:"):
                continue

            song_paths.append(line.strip())

    return song_paths


def read_vdjfolder_xml_playlist(xml_path):
    """Get song paths from a vdjfolder.xml-style playlist."""
    song_paths = []

    xml_data = read_from_xml(xml_path)

    for song in xml_data["VirtualFolder"]["song"]:
        song_paths.append(song["@path"])

    return song_paths


def get_song_list_for_playlist(playlist_path, use_cached=True, write_cache=True):
    """
    Given a VDJ-style or M3U-style playlist, poll the database for song data for those songs.

    Args:
    - playlist_path: Path object pointing to an M3U or vdjfolder.xml playlist

    Kwargs:
    - use_cached: whether to look in the SONG_LISTS_DIR for a matching pre-fetched song list.
    - write_cache: whether to write the fetched song list data to the SONG_LISTS_DIR directory.
    """

    # Playlist
    playlist_name = Path(playlist_path).name

    # Cached version of song lookups
    song_list_file_name = Path(playlist_name).with_suffix(".json")
    song_list_file_path = Path(SONG_LISTS_DIR, song_list_file_name)

    # Check to see if we have a cached mapping file for this playlist
    if use_cached and Path(song_list_file_path).is_file():
        print("Found cached song list, skipping database lookup.")
        return read_json_file(song_list_file_path)

    #  Otherwise, lookup the songs from the database
    else:
        print("No song list file found, looking up songs from database.")

        if playlist_path.suffix.lower() == "m3u":
            # Get song paths from playlist
            song_paths = read_m3u_playlist(playlist_path)
        else:
            song_paths = read_vdjfolder_xml_playlist(playlist_path)
        print(f"Found {len(song_paths)} songs in playlist {playlist_path}")

        # Lookup these songs from the database by @FilePath attribute
        song_list = []
        for song_path in song_paths:
            print(f"Looking up song by filepath: {song_path}")
            song = lookup_song_from_database("@FilePath", song_path)

            if song:
                print(f"Found match: {song['Tags'].get('@Title', 'MISSING TITLE')}")
            song_list.append(song)

    # Write a cached version of the song_list file, if enabled
    if write_cache:
        print(f"Writing song_list to {song_list_file_path}")
        write_json_file(song_list, song_list_file_path)

    return song_list


def search_playlist(playlist_name_or_path, search_order=None):
    """
    Search for a playlist given a name or relative path to the playlist.

    Args:
    - playlist_name_or_path: playlist name (with or without extension) or path to playlist
        (M3U) file.

    Kwargs:
    - search_order: override for search order (list of paths).

    Returns:
    - Path or None
    """

    if not search_order:
        search_order = PLAYLIST_SEARCH_ORDER

    for folder in search_order:
        search_path = Path(
            folder,
            f"{playlist_name_or_path}{'.m3u' if not playlist_name_or_path.suffix else ''}",
        )
        if search_path.exists():
            return search_path


if __name__ == "__main__":
    import time

    start_time = time.time()

    # Get arguments from command line
    playlists_args, flags = command_args_flags()

    # We expect only 1 arg, a playlist name
    if len(playlists_args) < 1:
        print(
            "Expected at least 1 arg: path(s) to / name(s) of playlist(s) or to run in --file mode"
        )
        sys.exit()

    if "--file" in flags:
        if len(playlists_args) != 1:
            print(
                "Expected exactly 1 arg when in --file mode, path to playlist.json file"
            )
            sys.exit()

        playlists_file = Path(playlists_args[0])
        playlist_paths = Path(playlists_file).read_text(encoding="utf-8")
        playlists = json.loads(playlist_paths)
    else:
        playlists = playlists_args

    song_lists = []
    playlist_names = []

    # Search for that playlist file
    for playlist in playlists:
        playlist = Path(playlist)
        playlist_file = search_playlist(playlist)

        if not playlist_file:
            print(f"Failed fo find match for {playlist}")
            sys.exit()
        print(f"Found matched playlist: {playlist_file}")

        # Get the song list from that file (using cache or writing if new)
        print("Fetching song list...")
        song_list_for_playlist = get_song_list_for_playlist(
            playlist_file, use_cached=True, write_cache=True
        )

        song_lists.append(song_list_for_playlist)
        playlist_names.append(playlist_file.stem)

    print(f"--- {round(time.time() - start_time, 4)} seconds ---")
