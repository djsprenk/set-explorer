"""
Given a set name, generate a cue file.

Args: Set file name

Outputs: {set file name}.cue file with cue points to processed-files dir
"""

from math import floor
from os.path import basename, splitext
import sys

from constants import JSON_DB_FILE, PROCESSED_FILES_DIR
from utils import read_json_file

DJ_SET_FILE = f"{PROCESSED_FILES_DIR}/zouk-sets.json"

DJ_NAME = "DJ Sprenk"

# Note: keep these lower case to make case-insensitive compare work
GENRE_FILTER = "zouk set"
ARTIST_FILTER = "dj sprenk"


def set_name_from_title(title):
    """Get title from YYMMDD - {title}.mp3 format"""
    return splitext(title)[0]


def cue_filter(elem):
    """Filter function for returning cue points"""
    return elem.get("@Type") == "cue"


def find_set_metadata(set_list, file_name):
    """Find matching set metadata"""
    for set_metadata in set_list:
        if basename(set_metadata.get("@FilePath")) == file_name:
            return set_metadata


def seconds_to_minutes_and_seconds(time):
    """Convert cue format ss.mm to MM:ss:mm format"""
    rounded_seconds = floor(float(time))
    minutes = floor(rounded_seconds / 60)
    seconds = rounded_seconds % 60

    return f"{str(minutes).zfill(2)}:{str(seconds).zfill(2)}:00"


if __name__ == "__main__":
    # Get set from args
    if len(sys.argv) == 2:
        set_file = sys.argv[1]
        set_title = set_name_from_title(set_file)
    else:
        print(f"Expected 1 arg: set file name")
        exit(1)

    songs = read_json_file(JSON_DB_FILE)["VirtualDJ_Database"]["Song"]
    set_metadata = find_set_metadata(songs, set_file)

    if set_metadata is None:
        print(f"No set found in database for file {set_file}")
        exit(1)

    cue_points = filter(cue_filter, set_metadata["Poi"])

    text_data = ""

    # Write Header
    text_data += f'PERFORMER "{DJ_NAME}"\n'
    text_data += f'TITLE "{set_title}"\n'
    text_data += f'FILE "{set_file}"\n'

    for cue in cue_points:
        cue_number = cue.get("@Num", "0").zfill(2)

        if len(cue.get("@Name", "").split(" - ")) == 2:
            performer, title = cue.get("@Name", " - ").split(" - ")
        else:
            print(f"Bad cue point found at [{cue_number}]: f{cue.get('@Name')}")
            title = cue.get("@Name", "Unknown")
            performer = "Unknown"
        timestamp = seconds_to_minutes_and_seconds(cue.get("@Pos", "0"))

        text_data += f"  TRACK {cue_number} AUDIO\n"
        text_data += f'    TITLE "{title}"\n'
        text_data += f'    PERFORMER "{performer}"\n'
        text_data += f"    INDEX 01 {timestamp}\n"

    output_file = f"{PROCESSED_FILES_DIR}/{set_title}.cue"

    # Write the json data to output json file
    with open(output_file, "w") as cue_file:
        cue_file.write(text_data)
        print(f"Wrote CUE file to {output_file}")
