package(default_visibility = ["//:internal"])

# Loads all the GS Bazel dependencies.
load("@gs_tools//bazel/karma:defs.bzl", "karma_run")
load("@gs_tools//bazel/typescript:defs.bzl", "ts_binary", "ts_library")
load("@gs_tools//bazel/tslint:defs.bzl", "tslint_test")
load("@gs_tools//bazel/webpack:defs.bzl", "webpack_binary")
load("@gs_tools//bazel/webc:defs.bzl", "webc_gen_template")

package_group(
    name = "internal",
    packages = ["//..."]
)

ts_library(
    name = "lib_js",
    srcs = [],
    deps = [
        "//src/main"
    ]
)

ts_binary(
    name = "bin_js",
    deps = [":lib_js"],
)

filegroup(
    name = "pack_template",
    srcs = [
        "@gs_ui//:pack_template",
        "//src/main:template",
    ]
)

webpack_binary(
    name = "pack_js",
    package = ":bin_js",
    entry = "src/main/main.js",
)

genrule(
    name = "pack",
    srcs = [
        "//:pack_js",
        "//:pack_template",
    ],
    outs = ["pack.js"],
    cmd = "awk 'FNR==1{print \"\"}1' $(SRCS) > $@",
)

filegroup(
    name = "tslint_config",
    srcs = ["tslint.json"]
)

test_suite(
    name = "lint",
    tests = [
        # "//src/dir:lint",
    ]
)

karma_run(
    name = "test",
    srcs = [
        # "//src/dir:test_src",
    ]
)
