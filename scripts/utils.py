"""Utility functions used across multiple files"""

import json

from constants import JSON_DB_FILE


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


def read_json_file(file_path):
    """Load the file and return the parsed data"""
    with open(file_path) as json_file:
        data = json.load(json_file)
        json_file.close()

    return data


def write_json_file(data, output_json_path):
    """Serialize the data dict to JSON and write to the output_json_path location"""
    json_data = json.dumps(data)

    with open(output_json_path, "w") as json_file:
        json_file.write(json_data)
        json_file.close()
