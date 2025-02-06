from pathlib import Path

from constants import SET_MAPPER_FILE
from playlists import get_song_list_for_playlist
from recordings import get_recording_data_for_set
from utils import read_json_file


def get_stats():

    stats = {
        "total_mixes": 0,
        "total_songs": 0,
        "total_unique_songs": 0,
        "total_time_played": 0,
        "total_transitions": 0,
        "reused_transitions": 0,
    }

    sets = read_json_file(SET_MAPPER_FILE)
    unique_songs = set()
    unique_transitions = {}

    # Iterate through each set
    for set_mapping in sets:
        stats["total_mixes"] += 1

        # Get playlist
        playlist_file = Path(set_mapping["playlist"])
        playlist = get_song_list_for_playlist(playlist_file)
        stats["total_songs"] += len(playlist)

        # Get song paths
        songs = [song["@FilePath"] for song in playlist]

        # Get unique songs
        unique_songs.update(songs)

        # Get transitions
        stats["total_transitions"] += len(songs) - 1

        # Get unique transitions
        for i in range(len(songs) - 1):
            transition = (songs[i], songs[i + 1])

            if transition in unique_transitions.keys():
                unique_transitions[transition].append(set_mapping["playlist"])
            else:
                unique_transitions[transition] = [set_mapping["playlist"]]

        # Get recordings
        recording_file_path = Path(set_mapping["recording"])
        recording_data = get_recording_data_for_set(recording_file_path)

        # Get total time played
        stats["total_time_played"] += float(recording_data["Infos"]["@SongLength"])

    # Call out reused transitions
    for transition, usage in unique_transitions.items():
        if len(usage) > 1:
            transition_str = (
                f"{transition[0].split('/')[-1]} -> {transition[1].split('/')[-1]}"
            )
            usage_str = [
                usage_item.split("/")[-1].strip(".vdjfolder") for usage_item in usage
            ]
            print(
                f"Used transition in {len(usage)} sets\t({transition_str}) in : {usage_str}"
            )

    # Update stats
    stats["total_unique_songs"] = len(unique_songs)
    stats["reused_transitions"] = stats["total_transitions"] - len(unique_transitions)

    # Convert a number of seconds to days, hours, minutes, and seconds, rounded
    total_seconds = stats["total_time_played"]
    print(
        f"Total time played: {int(total_seconds // (24 * 3600))} days, {int(total_seconds // 3600 % 24)} hours, {int(total_seconds // 60 % 60)} minutes, {int(total_seconds % 60)} seconds"
    )
    return stats


if __name__ == "__main__":
    stats = get_stats()
    print(stats)
