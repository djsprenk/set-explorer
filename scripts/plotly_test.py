""" Test graphing energy using Plotly."""
from pathlib import Path

import plotly.express as px

from scripts.constants import SONG_LISTS_DIR
from scripts.utils import read_json_file

playlist_file = Path(SONG_LISTS_DIR, "20230113 - Interfusion Day Party.json")
song_data = read_json_file(playlist_file)


title = playlist_file.name
song_indices = [*range(len(song_data))]
energies = [song["Tags"]["@Stars"] for song in song_data]

color_mappings = {
    0: "grey",
    1: "dark blue",
    2: "dark sky blue",
    3: "light green",
    4: "golden yellow",
    5: "red",
}
bar_colors = [color_mappings[int(energy)] for energy in energies]
song_titles = [song["Tags"].get("@Title", "Missing Title") for song in song_data]

# fig = px.bar(df, x="total_bill", y="sex", color='day', orientation='h',
#              hover_data=["tip", "size"],
#              height=400,
#              title='Restaurant bills')

fig = px.bar(
    x=[1 for _ in range(len(song_data))],
    y=[1 for _ in range(len(song_data))],
    title=title,
    color=bar_colors,
    orientation="h",
)
print(fig)
fig.show()
