package(default_visibility = ["//:internal"])

load("//:defs.bzl", "thoth")
load("@gs_tools//bazel/typescript:defs.bzl", "ts_binary", "ts_library")

thoth(
    deps = [
      "@gs_tools//src",
    ])

ts_library(
    name = "test_base",
    srcs = [
      "test-base.ts"
    ],
    deps = [
      "@gs_tools//src",
      "@gs_tools//src/path/testing",
    ])