from pathlib import Path
import matplotlib.pyplot as plt

from constants import SONG_LISTS_DIR, VDJ_EXPORT_DIR
from utils import (
    lookup_song_from_database,
    read_json_file,
    write_json_file,
)


def read_playlist(m3u_path):
    """Get song paths from an M3U-style playlist."""
    song_paths = []

    with open(m3u_path, "r") as file:
        for line in file:

            # #EXTVDJ: is a directive with VDJ metadata, skip these
            if line.startswith("#EXTVDJ:"):
                continue

            song_paths.append(line.strip())

    return song_paths


def graph_energy(song_list, playlist_name=None):
    """Given a list of songs and playlist name, plot the energy."""

    # X value is the song number
    x_values = [*range(len(song_list))]

    # Y value is the energy (in @Stars) for each song
    y_values = [int(song["Tags"].get("@Stars", 0)) for song in song_list]

    plt.plot(x_values, y_values)

    # Energies range from 1-5
    plt.ylim(0, 5)

    # Label the axes
    plt.xlabel("Song No.")
    plt.ylabel("Energy (1-5)")

    # Label the title
    plt.title(playlist_name)

    plt.show()


def get_song_list_for_playlist(playlist_path, use_cached=True, write_cache=True):
    """
    Given an M3U-style playlist, poll the database for song data for those songs.

    Args:
    - playlist_path: Path object pointing to an M3U file

    Kwargs:
    - use_cached: whether to look in the SONG_LISTS_DIR for a matching pre-fetched song list.
    - write_cache: whether to write the fetched song list data to the SONG_LISTS_DIR directory.
    """

    # Playlist
    playlist_name = Path(playlist_path).name

    # Cached version of song lookups
    song_list_file_name = playlist_name.replace(playlist_path.suffix, ".json")
    song_list_file_path = Path(SONG_LISTS_DIR, song_list_file_name)

    # Check to see if we have a cached mapping file for this playlist
    if use_cached and Path(song_list_file_path).is_file():

        print("Found cached song list, skipping database lookup.")
        return read_json_file(song_list_file_path)

    #  Otherwise, lookup the songs from the database
    else:
        print("No song list file found, looking up songs from database.")

        # Get song paths from playlist
        song_paths = read_playlist(playlist_path)
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


if __name__ == "__main__":

    playlist_path = Path(VDJ_EXPORT_DIR, "Playlists/Past Events/20240128 - RVA 4.m3u")
    playlist_name = playlist_path.name

    print("Fetching song list...")
    song_list = get_song_list_for_playlist(playlist_path)

    # Chart the energies
    print(f"Graphing energy...")
    graph_energy(song_list, playlist_name=playlist_name)
