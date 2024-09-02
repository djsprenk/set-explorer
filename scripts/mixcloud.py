from datetime import datetime
from pathlib import Path

import requests
from constants import MIXCLOUD_ACCOUNT_NAME, MIXCLOUD_DATA_FILE, PROCESSED_FILES_DIR
from utils import write_csv_file, write_json_file


def get_cloudcasts():
    """Get cloudcasts for a given mixcloud account, paging where required."""
    cloudcast_slugs = set()
    cloudcasts = {"data": []}

    # Max available page size on Mixcloud
    request_url = (
        f"https://api.mixcloud.com/{MIXCLOUD_ACCOUNT_NAME}/cloudcasts/?limit=100"
    )

    while request_url != None:
        print(f"Querying Mixcloud at {request_url}")
        response = requests.get(request_url)

        # Interrupt if any request fails
        if response.status_code != 200:
            print(f"FAILURE CODE: {response.status_code}")
            return

        # Get page data
        cloudcasts_page = response.json()
        request_url = cloudcasts_page.get("paging").get("next")

        # Add new entries only
        for cloudcast in cloudcasts_page.get("data"):
            if cloudcast.get("slug") in cloudcast_slugs:
                continue

            # Remove user data (redundant)
            cloudcast.pop("user")
            cloudcast_slugs.add(cloudcast.get("slug"))
            cloudcasts["data"].append(cloudcast)

    return cloudcasts


def cloudcasts_to_csv(cloudcasts):
    """Convert cloudcasts into a CSV for data analysis."""

    sets = cloudcasts["data"]
    output = []

    for item in sets:
        # Convert date from YYYY-MM-DDTHH:mm:ssZ to YYYY-MM-DD HH:mm:ss
        date_str = item["created_time"]
        dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%SZ")

        data = {
            "name": item["name"],
            "date": dt.strftime("%Y-%m-%d %H:%M:%S"),
            "plays": item["play_count"],
            "listeners": item["listener_count"],
            "reposts": item["repost_count"],
            "favorites": item["favorite_count"],
            "length": item["audio_length"],
        }
        output.append(data)

    write_csv_file(output, Path(PROCESSED_FILES_DIR, "mixcloud.csv"))


if __name__ == "__main__":

    # Get set info from Mixcloud
    cloudcasts = get_cloudcasts()

    print(f"Writing cloudcasts to file: {MIXCLOUD_DATA_FILE}")
    write_json_file(cloudcasts, MIXCLOUD_DATA_FILE)
    print("DONE")
