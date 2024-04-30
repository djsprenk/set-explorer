import matplotlib.pyplot as plt

from constants import PROCESSED_FILES_DIR, VDJ_EXPORT_DIR
from utils import (
    file_in_directory,
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


if __name__ == "__main__":

    playlist_name = "20240128 - RVA 4"
    playlist_path = f"{VDJ_EXPORT_DIR}/Playlists/Past Events/20240128 - RVA 4.m3u"
    song_list_file = f"{playlist_name}.song_list.json"
    song_list_file_path = f"{PROCESSED_FILES_DIR}/{song_list_file}"

    # Check to see if we have a cached mapping file for this playlist
    if file_in_directory(song_list_file, PROCESSED_FILES_DIR):
        print("Found cached song list, skipping database lookup.")
        cached_file = True
        song_list = read_json_file(f"{PROCESSED_FILES_DIR}/{song_list_file}")

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

        # Write songs to a file
        write_json_file(song_list, song_list_file_path)

    # Chart the energies
    print(f"Graphing energy...")
    graph_energy(song_list, playlist_name=playlist_name)
