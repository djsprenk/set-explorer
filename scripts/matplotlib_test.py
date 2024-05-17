"""
Graph song energy using Matplotlib
"""
import json
import sys
from pathlib import Path

import matplotlib.pyplot as plt  # type: ignore

from scripts.playlists import get_song_list_for_playlist, search_playlist
from scripts.utils import command_args_flags


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


if __name__ == "__main__":
    import time

    start_time = time.time()

    # Get arguments from command line
    playlists, flags = command_args_flags()

    # We expect only 1 arg, a playlist name
    if len(playlists) < 1:
        print(
            "Expected at least 1 arg: path(s) to / name(s) of playlist(s) or to run in --file mode"
        )
        exit()

    if "--file" in flags:
        if len(playlists) != 1:
            print(
                "Expected exactly 1 arg when in --file mode, path to playlist.json file"
            )
            exit()

        playlists_file = Path(playlists[0])
        playlist_paths = Path(playlists_file).read_text(encoding="utf-8")
        playlists = json.loads(playlist_paths)

    # Handle flags
    align = "--align" in flags  # pylint: disable=invalid-name

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

    # Chart the energies
    print("Graphing energy...")
    multi_graph_energy(song_lists, playlist_names=playlist_names, song_align=align)
