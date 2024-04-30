import matplotlib.pyplot as plt

from constants import VDJ_EXPORT_DIR
from utils import lookup_song_from_database


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

    # Chart the energies
    print(f"Graphing energy...")
    graph_energy(song_list, playlist_name=playlist_name)
