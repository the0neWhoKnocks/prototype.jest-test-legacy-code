# Testing Legacy Code with Jest

How do you go about testing a legacy JS codebase that utilizes a custom 
dependency loader and stores everything on a global Object that causes 
data/function bleed?

---

## Install

```
npm i
```

---

## Running Tests

```sh
# Runs tests (no watch)
npm test [--] [args]
npm test -- folder.filename
# Use this to test/watch an individual file
npm run test-watch [--] [args]
npm run test-watch -- folder.filename
# Use this to test/watch all files
npm run test-watch-all
```

Each test runs in it's own sandboxed environment so you don't have to worry 
about code bleed-over from test to test, but that environment comes with the 
added setup & teardown time for each test. Small price to pay for the assurance 
that when a dev edits one test, they don't have to worry about breaking others.

Jest utilizes jsDom, so if you find that you're getting errors because it can't
access a standard `window` or `document` property, head over to 
`test/_shims/document.js` and add in whatever you need.

## Notes About Writing Tests

- If you get `Unexpected token <` it's most likely because there's a script tag 
  in your template. Just wrap your Handlebars template in 
  `testCtx.unescapeScriptTags`.
- To run a single file you'd do `folder.filename` if you wanted the `FileName` 
  test within the `folder` directory. Jest uses regex to match file names - if 
  you use slashes for directory separators it won't work.
- If you make a change to `bootstrap.js` while watching a test file, the 
  bootstrap changes won't be applied. A way around this (without having to stop 
  and start) is to just add a space somewhere in your test file and save, the 
  watcher will then bring in the new changes.
- When in `watch` mode, take note of the options that appear at the bottom of 
  the terminal. After you've run a single test you can then run all tests 
  (`a` option), and then start working on another single file if it errors out 
  (`p` option).

