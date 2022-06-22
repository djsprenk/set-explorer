"""From the database, write a filtered list of sets"""

from constants import PROCESSED_FILES_DIR, JSON_DB_FILE
from utils import read_json_file, write_json_file

OUTPUT_FILE = f"{PROCESSED_FILES_DIR}/zouk-sets.json"

# Note: keep these lower case to make case-insensitive compare work
GENRE_FILTER = "zouk set"
ARTIST_FILTER = "dj sprenk"


def set_filter(elem):
    """Filter function for returning a specified genre"""
    genre = elem.get("Tags", {}).get("@Genre", "")
    artist = elem.get("Tags", {}).get("@Author", "")

    return genre.lower() == GENRE_FILTER and artist.lower() == ARTIST_FILTER


if __name__ == "__main__":
    db = read_json_file(JSON_DB_FILE)
    songs = db["VirtualDJ_Database"]["Song"]
    filtered = filter(set_filter, songs)

    filtered_sets = []
    for item in filtered:
        filtered_sets.append(item)

    print(f"Identified {len(filtered_sets)} sets out of {len(songs)} entries.")

    write_json_file(filtered_sets, OUTPUT_FILE)
