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
    name = "main_lib_js",
    srcs = [],
    deps = [
        "//src/main"
    ]
)

ts_library(
    name = "preview_lib_js",
    srcs = [],
    deps = [
        "//src/preview",
    ],
)

ts_binary(
    name = "main_bin_js",
    deps = [":main_lib_js"],
)

ts_binary(
    name = "preview_bin_js",
    deps = [":preview_lib_js"],
)

ts_binary(
    name = "render_bin_js",
    deps = [":main_lib_js"],
)

filegroup(
    name = "main_pack_template",
    srcs = [
        "@gs_ui//:pack_template",
        "//src/main:template",
        "//src/render:template",
    ]
)

filegroup(
    name = "preview_pack_template",
    srcs = [
        "@gs_ui//:pack_template",
        "//src/preview:template",
    ]
)

filegroup(
    name = "render_pack_template",
    srcs = [
        "@gs_ui//:pack_template",
        "//src/render:template",
    ]
)

webpack_binary(
    name = "main_pack_js",
    package = ":main_bin_js",
    entry = "src/main/main.js",
)

webpack_binary(
    name = "preview_pack_js",
    package = ":preview_bin_js",
    entry = "src/preview/main.js",
)

webpack_binary(
    name = "render_pack_js",
    package = ":render_bin_js",
    entry = "src/render/render-default-script.js",
)

genrule(
    name = "main_pack",
    srcs = [
        "//:main_pack_js",
        "//:main_pack_template",
    ],
    outs = ["main_pack.js"],
    cmd = "awk 'FNR==1{print \"\"}1' $(SRCS) > $@",
)

genrule(
    name = "preview_pack",
    srcs = [
        "//:preview_pack_js",
        "//:preview_pack_template",
    ],
    outs = ["preview_pack.js"],
    cmd = "awk 'FNR==1{print \"\"}1' $(SRCS) > $@",
)

genrule(
    name = "render_pack",
    srcs = [
        "//:render_pack_js",
        "//:render_pack_template",
    ],
    outs = ["render_pack.js"],
    cmd = "awk 'FNR==1{print \"\"}1' $(SRCS) > $@",
)

filegroup(
    name = "pack",
    srcs = [
        ":main_pack",
        ":preview_pack",
        ":render_pack",
    ]
)

filegroup(
    name = "tslint_config",
    srcs = ["tslint.json"]
)

test_suite(
    name = "lint",
    tests = [
        "//src/data:lint",
        "//src/datasource:lint",
        "//src/main:lint",
        "//src/preview:lint",
        "//src/render:lint",
    ]
)

karma_run(
    name = "test",
    srcs = [
        "//src/data:test_src",
        "//src/datasource:test_src",
        "//src/main:test_src",
        "//src/preview:test_src",
        "//src/render:test_src",
    ]
)
