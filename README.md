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

Goes like:

```
          raw > JSON >
             Template > Render output
```

1.  The pipeline starts with some **raw** files.
2.  These files are converted to JSON through **converter** files.
3.  You can also specify **template** files.
4.  Thoth will take a template, a set of data files, and handlebar **helpers** to generate one or
    more output files. An **output** file is used to determine the number of output files.
5.  This relationship is defined by a **render** file.

### Raw

-   Raw can come from various sources:

    -   TSV
    -   CSV
    -   Google spreadsheet
    -   XML
    -   YAML
    -   JSON

### Converter

Converter files are JavaScript files. These files must define a function that takes in the source
file and outputs JSON.

### Template and helpers

Template files are written in Handlebars.

### Output

Output files are JavaScript files. These files must define a function that takes in the JSON of the
converted source.

### Render

Render files are YAML files with the following fields:

```
type DATA_TYPE = TSV|CSV|GoogleSpreadsheet|XML|YAML|JSON;

type OUTPUT_TYPE = OUTPUT;

type ROOT = Render[]

/**
 * Path to a file of type T.
 */
type Path<T> = string;

interface Data {
  src: Path<DATA_TYPE>;
  transform: Path<CONVERTER_TYPE>;
}

interface Render {
  deps?: Array<Data|Path<HELPER_TYPE>>;
  src: Data;
  template: Path<TEMPLATE_TYPE>;
  outputFn?: Path<OUTPUT_TYPE>;
}

```

### Output