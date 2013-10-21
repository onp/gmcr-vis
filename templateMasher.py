import os
import re
import json

TEMPLATE_DIR = os.path.abspath("templates_html")
files = os.listdir(TEMPLATE_DIR)

first = True
templates = {}

for fn in files:
    m = re.match(r"^(?P<varname>.*)\.html$", fn)
    if m:
        with open(os.path.join(TEMPLATE_DIR, fn), "r") as f:
            tmpl_str = f.read()
            templates[m.group('varname')] = tmpl_str.replace("\n", " ")

with open("templates/mTemps.js", "w") as outfile:
    outfile.write("window.templates = ")
    outfile.write(json.dumps(templates))
    outfile.write(";")