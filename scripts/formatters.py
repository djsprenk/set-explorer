"""Different formatters for time, BPM, etc."""


def bpm_formatter(database):
    for song in database["VirtualDJ_Database"]["Song"]:
        bpm = song.get("Tags", {}).get("@Bpm")
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
