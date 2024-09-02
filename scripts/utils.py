"""Utility functions used across multiple files"""

import csv
import json
import os
import sys

import xmltodict


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
        else:
            command_args.append(arg.strip())

    return command_args, command_flags


def read_from_xml(xml_path):
    """Read data from XML file"""
    data_dict = {}

    # open the input xml file and read data in form of python dictionary using xmltodict module
    with open(xml_path, encoding="utf-8") as xml_file:
        data_dict = xmltodict.parse(xml_file.read())
        xml_file.close()

    return data_dict


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


def write_csv_file(data, output_path, field_names=None):
    """Write list or list of dict data to a CSV file."""
    with open(output_path, "w", newline="") as file:

        # Dict writer
        if isinstance(data[0], dict):
            field_names = field_names if field_names else data[0].keys()
            writer = csv.DictWriter(file, fieldnames=field_names)

            writer.writeheader()
            writer.writerows(data)

        # List writer
        elif isinstance(data[0], list):
            writer = csv.writer(file)
            writer.writerows(data)

        # Failure case
        else:
            raise ValueError(
                "Unsupported data format. Provide a list of lists or a list of dictionaries."
            )


def file_in_directory(filename, directory):
    """Check for a file in a directory."""
    files = os.listdir(directory)

    return filename in files
