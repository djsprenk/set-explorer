import json

JSON_DB_FILE = "./processed-files/database.json"
OUTPUT_FILE = "./processed-files/zouk-sets.json"

# Note: keep these lower case to make case-insensitive compare work
GENRE_FILTER = "zouk set"
ARTIST_FILTER = "dj sprenk"


def load_file(file_name=JSON_DB_FILE):
    """Load the file and return the parsed data"""
    with open(file_name) as json_file:
        return json.load(json_file)


def set_filter(elem):
    """Filter function for returning a specified genre"""
    genre = elem.get("Tags", {}).get("@Genre", "")
    artist = elem.get("Tags", {}).get("@Author", "")

    return genre.lower() == GENRE_FILTER and artist.lower() == ARTIST_FILTER


def write_json_file(data, output_json_path):
    """Serialize the data dict to JSON and write to the output_json_path location"""
    # generate the object using json.dumps() corresponding to json data
    json_data = json.dumps(data)

    # Write the json data to output json file
    with open(output_json_path, "w") as json_file:
        json_file.write(json_data)
        json_file.close()


if __name__ == "__main__":
    db = load_file()
    songs = db["VirtualDJ_Database"]["Song"]
    filtered = filter(set_filter, songs)

    breakpoint()
    filtered_sets = []
    for item in filtered:
        filtered_sets.append(item)

    breakpoint()

    print(f"Identified {len(filtered_sets)} sets out of {len(songs)} entries.")

    write_json_file(filtered_sets, OUTPUT_FILE)
