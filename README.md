# What is Thoth?

Thoth is a file based wiki page generator.

## Features

-   Create markdown files and render them as HTML.
-   Use handlebar to add templating.
-   Additional markdown features:
    -   Variables
    -   Asides
    -   Graphs

## Design

Goes from Data > JSON > Markdown > Handlebars > HTML

### Data

-   First step is to convert the data to JSON object.
-   Data can come from various sources:

    -   TSV
    -   CSV
    -   Google spreadsheet
    -   XML
    -   JSON

-   Data are initially converted to JSON. The converted format depends on
    the original data type.
-   Users can specify the function to transform the JSON.

### JSON

-   JSON data can be converted to Markdown in two ways:

    1.  Embed using variables.
    1.  If the JSON is an array, it can be used to generate markdown files

### Handlebars

-   Conversion is straightforward.

### HTML

-   This is where data from JSON and handlebar templates are applied.