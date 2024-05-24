from pathlib import Path
import requests

from constants import MIXCLOUD_ACCOUNT_NAME, PROCESSED_FILES_DIR
from utils import write_json_file


def get_cloudcasts():
    """Get cloudcasts for a given mixcloud account, paging where required."""
    cloudcast_slugs = set()
    cloudcasts = {"data": []}
    iterator = 0
    next_page = True

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


if __name__ == "__main__":

    # Get set info from Mixcloud
    cloudcasts = get_cloudcasts()

    mixcloud_slugs_file = Path(PROCESSED_FILES_DIR, "mixcloud-data.json")
    print(f"Writing cloudcasts to file: {mixcloud_slugs_file}")
    write_json_file(cloudcasts, mixcloud_slugs_file)
