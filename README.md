# spidermonkey.dev

Static content for https://spidermonkey.dev/

This website is a landing page connecting to resources useful for people working on or with the Mozilla SpiderMonkey JavaScript Engine.

Note: Documentation itself should be kept in-tree when possible and linked to from here.

## Running locally

Ruby and [Bundler](https://bundler.io/) must be installed. On Ubuntu the following
should work (replace $REPO_URL with the GitHub repository URL):

```
$ sudo apt-get install git ruby bundler zlib1g-dev
$ git clone $REPO_URL spidermonkey.dev
$ cd spidermonkey.dev
$ bundle install --path vendor # If this complains about Bundler version, see below.
$ bundle exec jekyll serve
```

This will start a webserver on localhost. It rebuilds the website in the background
when you update the markdown files.

If `bundle install` fails with an error about the Bundler version, do what it suggests,
for example:

```
$ gem install bundler:2.0.2
```

## Adding a new post

- Create an entry in `_posts`, with title layout of `YYYY-MM-DD-title.markdown`
- Add a frontsmatter:

```
---
layout: post
title: "My Title"
date: 2021-05-03 09:30:00 +0700
---
```

## Contributing to this site

To contribute changes to https://spidermonkey.dev/, submit a pull request. It will be reviewed by someone in the "Website Reviewers Group". There isn't a formal policy for what is needed for a review, but we do want to second set of eyes checking for typos, phrasing, and other editorial things.

Material for the website is focused around communication between the SpiderMonkey team and community (such as "What chat service can the team be found on this year?"). Low-level technical details on using SpiderMonkey usually are best documented in the source as `[SMDOC]` comments, and version-specific information (such as build, debug, and testing information) is best documented on https://firefox-source-docs.mozilla.org/.

