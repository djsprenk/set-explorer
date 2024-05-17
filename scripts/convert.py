"""Convert the VDJ XML database to a JSON database"""

import json

import xmltodict

from scripts.constants import JSON_DB_FILE, VDJ_DB_FILE


def read_from_xml(xml_path):
    """Read data from XML file"""
    data_dict = {}

    # open the input xml file and read data in form of python dictionary using xmltodict module
    with open(xml_path, encoding="utf-8") as xml_file:
        data_dict = xmltodict.parse(xml_file.read())
        xml_file.close()

    return data_dict


def xml_to_json(xml_path, json_path):
    """
    Load XML and write to JSON
    """

    data_dict = read_from_xml(xml_path)

    # generate the object using json.dumps() corresponding to json data
    json_data = json.dumps(data_dict)

    with open(json_path, "w", encoding="utf-8") as json_file:
        json_file.write(json_data)
        json_file.close()


if __name__ == "__main__":
    # Convert XML data to JSON and write to default file locations
    xml_to_json(VDJ_DB_FILE, JSON_DB_FILE)
