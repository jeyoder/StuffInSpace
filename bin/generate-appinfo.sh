#!/bin/bash

build_date=`date -u +"%Y-%m-%dT%H:%M:%SZ"`
mode="unknown"
method="unknown"

if [ "$GITHUB_REF_TYPE" == "tag" ]; then
    ## GitHub Tag
    version="$GITHUB_REF"
    git_hash="$GITHUB_SHA"
    git_branch="$GITHUB_REF"
    mode="tag"
    method="github-tag"
elif [ -n "GITHUB_SHA"]; then
    ## GitHub Ref
    version="$GITHUB_SHA"
    git_hash="$GITHUB_SHA"
    git_branch="$GITHUB_REF"
    mode="ref"
    method="github-ref"
elif [ -n "$CI_COMMIT_TAG" ]; then
    ## GitLab Tag
    version="$CI_COMMIT_TAG"
    git_hash="$CI_COMMIT_SHA"
    git_branch="$CI_COMMIT_BRANCH"
    mode="tag"
    method="gitlab-ref"
elif [ -n "$CI_COMMIT_REF_NAME" ]; then
    ## GitLab Ref
    version="$CI_COMMIT_SHA"
    git_hash="$CI_COMMIT_SHA"
    git_branch="$CI_COMMIT_BRANCH"
    mode="ref"
    method="gitlab-ref"
elif command -v git &> /dev/null; then
    #version=`git describe --tags --abbrev=0`
    git_hash=`git rev-parse HEAD`
    git_branch=`git branch --show-current`
    mode="cmd"
    method="default"
fi

echo "APPINFO buildDate ..... $build_date"
echo "APPINFO version ....... $version"
echo "APPINFO gitHash ....... $git_hash"
echo "APPINFO gitBranch ..... $git_branch"
echo "APPINFO method ........ $method"
json=$(cat <<EOF
{
    "buildDate": "$build_date",
    "version": "$version",
    "gitHash": "$git_hash",
    "gitBranch": "$git_branch",
    "mode": "$mode"
}
EOF
)

echo "$json" > "$1"

