Changelog
==========

## v0.2.0

* getStories always returns an array. This behavior will become common in future updates to other API calls

## v0.1.4

* Bugfix: callback in the parser now wrapped into process.nextTick to avoid the error bubbling from the user's code into xml2js
* Bugfix: addProject - no_owner defaults to true only on undefined
* Bugfix: Fixed tests, added filters for group-specific getIteration methods, added getProjectActivities method
