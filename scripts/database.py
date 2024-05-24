"""
Scripts for dealing with VirtualDJ's database.
Running the script from the command line will convert XML database to JSON.
"""

import json

from constants import JSON_DB_FILE, VDJ_DB_FILE
from utils import read_from_xml, read_json_file


def lookup_song_from_database(tag, value, database=None):
    """
    Look up a value in the JSON database

    Returns: First matched database entry for query

    Raises: ValueError if not found
    """

    if database is None:
        database = read_json_file(JSON_DB_FILE)

    song_list = database["VirtualDJ_Database"]["Song"]

    for song in song_list:
        if song[tag] == value:
            return song

    raise ValueError


def database_to_json():
    """Convert XML database to JSON database."""

    # Read database from XML
    data_dict = read_from_xml(VDJ_DB_FILE)

    # generate the object using json.dumps() corresponding to json data
    json_data = json.dumps(data_dict)

    # Write data to JSON file
    with open(JSON_DB_FILE, "w", encoding="utf-8") as json_file:
        print(f"Writing data to {JSON_DB_FILE}")
        json_file.write(json_data)
        json_file.close()


if __name__ == "__main__":
    print(f"Converting VDJ database to JSON...")
    database_to_json()
    print(f"DONE")
