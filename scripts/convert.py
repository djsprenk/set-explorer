"""Convert the VDJ XML database to a JSON database"""

import json
import sys
import xmltodict

from constants import VDJ_DB_FILE, JSON_DB_FILE


def xml_to_json(xml_path, json_path):
    """
    Load input XML from database_xml_path, normalize song data, and write to output_json_path
    """
    # open the input xml file and read data in form of python dictionary using xmltodict module
    with open(xml_path) as xml_file:

        data_dict = xmltodict.parse(xml_file.read())
        xml_file.close()

        # generate the object using json.dumps() corresponding to json data
        json_data = json.dumps(data_dict)

        # Write the json data to output json file
        with open(json_path, "w") as json_file:
            json_file.write(json_data)
            json_file.close()


if __name__ == "__main__":
    xml_to_json(VDJ_DB_FILE, JSON_DB_FILE)
