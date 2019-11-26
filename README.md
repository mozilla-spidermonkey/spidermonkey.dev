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
