import json
from constants import MIXCLOUD_EXPORT_DIR, PROCESSED_FILES_DIR
from utils import read_json_file

INPUT_FILE = f"{MIXCLOUD_EXPORT_DIR}/collected-cloudcasts.json"
OUTPUT_FILE = f"{MIXCLOUD_EXPORT_DIR}/set-slugs.json"


def get_set_slugs(input_file=INPUT_FILE):
    cloudcasts = read_json_file(input_file)

    set_slugs = []

    for set_info in cloudcasts["data"]:
        set_slugs.append({"set_slug": set_info["slug"]})

    return set_slugs


if __name__ == "__main__":
    # Get set slugs
    set_slugs = get_set_slugs()

    # Dump to string
    json_data = json.dumps(set_slugs)

    # Write the json data to output json file
    with open(OUTPUT_FILE, "w") as json_file:
        json_file.write(json_data)
        json_file.close()
