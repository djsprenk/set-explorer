from pathlib import Path
import matplotlib.pyplot as plt  # type: ignore

from constants import SONG_LISTS_DIR, VDJ_EXPORT_DIR
from utils import (
    command_args_flags,
    lookup_song_from_database,
    read_json_file,
    write_json_file,
)


# Default playlist path search order:
# 1) Direct path
# 2) VDJ/Playlists/Past Events
# 3) VDJ root
PLAYLIST_SEARCH_ORDER = ["", Path(VDJ_EXPORT_DIR, "Playlists/Past Events")]


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


def graph_energy(ax, song_list, playlist_name=None, x_limit=None):
    """
    Graph energy levels for an individual set using colored bars.

    Args:
    - ax: Matplotlib Axis object
    - song_list: A list of song metadata from VirtualDJ database.

    Kwargs:
    - playlist_name: Playlist name, used as title of figure.
    """
    # X value is the song number
    x_values = [*range(len(song_list))]

    # Y value is the energy (in @Stars) for each song
    y_values = [int(song["Tags"].get("@Stars", 0)) for song in song_list]

    # Get colors for each energy level (from https://xkcd.com/color/rgb/)
    color_mappings = {
        0: "xkcd:grey",
        1: "xkcd:dark blue",
        2: "xkcd:dark sky blue",
        3: "xkcd:light green",
        4: "xkcd:golden yellow",
        5: "xkcd:red",
    }
    bar_colors = [color_mappings[energy] for energy in y_values]

    # Plot a bar graph
    ax.bar(x_values, y_values, color=bar_colors)

    # Energies range from 1-5
    ax.set_ylim(0, 5)

    # If x_limit is set, set it here
    if x_limit:
        ax.set_xlim([0, x_limit])

    # Label the axes
    ax.set_xlabel("Song No.")
    ax.set_ylabel("Energy (1-5)")

    # Label the title
    ax.set_title(playlist_name)


def multi_graph_energy(song_lists, playlist_names=None, song_align=False):
    """
    Given a list of song_lists and matching playlist_names, plot the energy of several
    sets using colored bar graphs.
    """
    # Create subplots for each playlist
    fig, ax = plt.subplots(len(song_lists))

    # Individual case
    if len(song_lists) <= 1:
        graph_energy(ax, song_lists[0], playlist_name=playlist_names[0])

    # Multi set case
    else:
        # Set the overall title
        fig.suptitle("DJ Sprenk - Energy Graphs")

        # If song_align enabled, z-fill extra space
        max_length = None
        if song_align:
            max_length = max([len(song_list) for song_list in song_lists])

        for i, song_list in enumerate(song_lists):
            subplot = ax[i]
            graph_energy(
                subplot, song_list, playlist_name=playlist_names[i], x_limit=max_length
            )

    # Fixes overlapping labels
    plt.tight_layout()

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


def search_playlist(name_or_path, search_order=None):
    """
    Search for a playlist given a name or relative path to the playlist.

    Args:
    - name_or_path: playlist name (with or without extension) or path to playlist
        (M3U) file.

    Kwargs:
    - search_order: override for search order (list of paths).

    Returns:
    - Path or None
    """

    if not search_order:
        search_order = PLAYLIST_SEARCH_ORDER

    for folder in search_order:
        search_path = Path(folder, f"{playlist}{'.m3u' if not playlist.suffix else ''}")
        if search_path.exists():
            return search_path


if __name__ == "__main__":

    # Get arguments from command line
    playlists, flags = command_args_flags()

    # We expect only 1 arg, a playlist name
    if len(playlists) < 1:
        print("Expected at least 1 arg: path(s) to / name(s) of playlist(s)")
        exit()

    # Handle flags
    align = False
    if "--align" in flags:
        align = True

    song_lists = []
    playlist_names = []

    # Search for that playlist file
    for playlist in playlists:
        playlist = Path(playlist)
        playlist_file = search_playlist(playlist)

        if not playlist_file:
            print(f"Failed fo find match for {playlist}")
            exit()
        print(f"Found matched playlist: {playlist_file}")

        # Get the song list from that file (using cache or writing if new)
        print("Fetching song list...")
        song_list = get_song_list_for_playlist(
            playlist_file, use_cached=True, write_cache=True
        )

        song_lists.append(song_list)
        playlist_names.append(playlist_file.stem)

    # Chart the energies
    print(f"Graphing energy...")
    multi_graph_energy(song_lists, playlist_names=playlist_names, song_align=align)
