import json
import sys
import xmltodict

INPUT_FILE = "vdj-export/database.xml"

OUTPUT_DIR = "processed-files"
OUTPUT_FILE = f"{OUTPUT_DIR}/database.json"


def xml_to_json(database_xml_path=INPUT_FILE, output_json_path=OUTPUT_FILE):
    """
    Load input XML from database_xml_path, normalize song data, and write to output_json_path
    """
    # open the input xml file and read
    # data in form of python dictionary
    # using xmltodict module
    with open(database_xml_path) as xml_file:

        data_dict = xmltodict.parse(xml_file.read())
        xml_file.close()

        # generate the object using json.dumps()
        # corresponding to json data
        json_data = json.dumps(data_dict)

        # Write the json data to output
        # json file
        with open(output_json_path, "w") as json_file:
            json_file.write(json_data)
            json_file.close()


def bpm_formatter(database):
    for song in database['VirtualDJ_Database']['Song']:
        bpm = song.get('Tags', {}).get('@Bpm')
        yield song


def time_format(seconds):
    """
    Convert seconds to formatted hh:mm:ss string or empty
    """
    if not seconds:
        return ""
    m, s = divmod(int(float(seconds)), 60)
    h, m = divmod(m, 60)

    return f"{h:d}:{m:02d}:{s:02d}"


def bpm_format(spb):
    """
    Beats per minute (BPM) is actually saved as a seconds per beat (SPB) float.
    Convert to the more standard BPM with one decimal precision or empty string.
    """
    if not spb:
        return ""

    return round(60 / float(spb), 1)


if __name__ == "__main__":

    # # Can call with default args
    # if len(sys.argv) == 1:
    #     xml_to_json()

    # # Or can call with provided args
    # elif len(sys.argv) == 3:
    #     database_xml_path = sys.argv[1]
    #     output_csv_path = sys.argv[2]
    #     xml_to_json(database_xml_path=database_xml_path, output_json_path=output_json_path)

    # else:
    #     print(
    #         "Incorrect number of arguments. Should be: python db-to-csv.py <database-xml-path> <output-csv-path>"
    #     )
    #     sys.exit(2)


