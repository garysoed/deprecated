# Loads all the GS Bazel dependencies.
load("@gs_tools//bazel/karma:defs.bzl", "karma_run")
load("@gs_tools//bazel/typescript:defs.bzl", "ts_binary", "ts_library")
load("@gs_tools//bazel/tslint:defs.bzl", "tslint_test")
load("@gs_tools//bazel/webpack:defs.bzl", "webpack_binary")
load("@gs_tools//bazel/webc:defs.bzl", "webc_gen_template")

def thoth(deps = [], test_deps = []):
    """Generic bazel target for all packages in thoth.

    Generates some default targets for thoth.

    Generated targets:
        test: A `test_suite` containing all the tests in this directory.
        test_run: A `karma_run` target for debugging.

        Assuming that the BUILD file is located under directory `dir`:
        {dir}: A `ts_library` target that packs together all production files.
        {dir}_bin: A `ts_binary` target that compiles all the production files into a file.
        {dir}_test: A `ts_library` target that packs all the test files.

        For every test file called `test`:
        {test}_bin: A `ts_binary` target that compiles the test file and all its dependencies
            into a single file.
        {test}_pack: A `webpack_binary` target that packs `test.js` and all its dependencies into a
            single `.js` file.
        {test}_run: A `karma_run` target for debugging.
    """

    lib_name = PACKAGE_NAME.split("/")[-1]

    testlib_name = lib_name + "_test"
    testbin_name = testlib_name + "_bin"

    # Prod files.
    ts_library(
        name = lib_name,
        srcs = native.glob(["*.ts"], exclude = ["*_test.ts"]),
        deps = ["@gs_tools//declarations"] + deps
    )

    # Generate a template file for every html file.
    html_files = native.glob(["*.html"])
    template_targets = []
    for html_file in html_files:
        name = html_file[:-5]

        templatetarget_name = "%s_template" % name
        webc_gen_template(
            name = templatetarget_name,
            key = "%s/%s" % (PACKAGE_NAME, name),
            template = html_file,
        )
        template_targets.append(":" + templatetarget_name)

    native.filegroup(
        name = "template",
        srcs = template_targets,
    )

    # Test files.
    test_srcs = native.glob(["*_test.ts"])
    ts_library(
        name = testlib_name,
        srcs = test_srcs,
        deps = [":" + lib_name] + ["//src:test_base"],
    )

    # Generates a pack, debug, and test file for every test.
    test_src_pack_labels = []
    test_targets = []
    for test_src in test_srcs:
        test_src_name = test_src[:-3]
        test_src_bin_name = "%s_bin" % test_src_name
        test_src_pack_name = "%s_pack" % test_src_name
        test_src_pack_label = ":" + test_src_pack_name

        ts_binary(
            name = test_src_bin_name,
            deps = [":" + testlib_name]
        )

        webpack_binary(
            name = test_src_pack_name,
            package = ":" + test_src_bin_name,
            entry = "%s/%s.js" % (PACKAGE_NAME, test_src[:-3]),
        )

        karma_run(
            name = test_src_name,
            srcs = [test_src_pack_label],
            deps = test_deps,
        )

        test_src_pack_labels.append(test_src_pack_label)
        test_targets.append(test_src_name)

    native.filegroup(
        name = "test_src",
        srcs = test_src_pack_labels,
        data = test_deps,
    )

    karma_run(
        name = "test",
        srcs = [":test_src"],
    )

    tslint_test(
        name = "lint",
        srcs = native.glob(["*.ts"]),
        config = "//:tslint_config"
    )