"""Utility functions used across multiple files"""

import json
import os
import sys

from constants import JSON_DB_FILE


def command_args_flags():
    """
    Util for getting arguments / flags from command line.

    Returns (Tuple): args, flags
    """

    # The first element in sys.argv is the script name itself
    script_name = sys.argv[0]

    # The subsequent elements are the command line arguments
    # sys.argv[1:] contains all command line arguments passed to the script
    arguments = sys.argv[1:]

    command_args = []
    command_flags = []

    # Flags are arguments starting with a dash or double dash
    for arg in arguments:
        if arg.strip().startswith("-"):
            command_flags.append(arg.strip())
        command_args.append(arg.strip())

    return command_args, command_flags


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


def file_in_directory(filename, directory):
    """Check for a file in a directory."""
    files = os.listdir(directory)

    return filename in files


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
