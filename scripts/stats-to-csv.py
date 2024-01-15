import csv
from constants import MIXCLOUD_EXPORT_DIR
from utils import read_json_file

INPUT_FILE = f"{MIXCLOUD_EXPORT_DIR}/set-stats.json"
OUTPUT_FILE = f"{MIXCLOUD_EXPORT_DIR}/set-stats.csv"


def get_set_engagement_stats(input_file=INPUT_FILE):
    cloudcasts = read_json_file(input_file)

    sets_stats = []

    for cloudcast in cloudcasts:
        set_info = cloudcast["data"]["cloudcastLookup"]
        sets_stats.append(
            {
                "name": set_info["name"],
                "engagement": [
                    data["value"] for data in set_info["stats"]["engagement"]["data"]
                ],
            }
        )

    return sets_stats


def write_engagement_data_to_csv(
    engagement_data, percentage=True, output_file=OUTPUT_FILE
):
    """
    Write engagement numbers to CSV in form
    name, minute 1 stats, minute 2 stats, ...

    percentage=True instructs the output to be in percentages (where first listen count is 100%)
    percentage=False uses raw listener counts
    """
    max_minute_length = 0

    # find the max length of a set, this will help us pad columns for CSV
    for set in engagement_data:
        if len(set["engagement"]) > max_minute_length:
            max_minute_length = len(set["engagement"])
    field_names = ["name"] + [str(i) for i in range(max_minute_length)]

    rows = []

    for set_data in engagement_data:
        # Load set name and pad all engagement numbers to 0
        row = {
            "name": set_data["name"],
            **{str(i): None for i in range(max_minute_length)},
        }

        baseline_listener_count = set_data["engagement"][0]

        # Load engagement numbers (as listeners or percentages)
        for minute, value in enumerate(set_data["engagement"]):
            if percentage:
                row[str(minute)] = round(value / baseline_listener_count, 2)
            else:
                row[str(minute)] = value

        rows.append(row)

    with open(output_file, "w", newline="") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=field_names)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    # Get set engagement stats
    sets_stats = get_set_engagement_stats()

    # Format data for write to CSV
    write_engagement_data_to_csv(sets_stats)
