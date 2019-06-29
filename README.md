# What is Thoth?

Thoth is a file based wiki page generator.

Thoth operates on files in the file system and forms a chain of processes and eventually outputs
the result.

## Config

Thoth utilizes `THOTH.yml` files. These files define the "program" used for rendering.

A `THOTH.yml` file consists of **rules**. Each rule can be one of the following types:

-   **Processor**: This defines a processor used to process input files.
-   **Render**: This runs the processor and optionally outputs file(s) to the output directory.

### Processor

A Processor is just a rule that declares an executable. This executable are JavaScripts with given
input and output types.
