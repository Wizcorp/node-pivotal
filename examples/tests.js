/*jslint
    forin: true
*/
var pivotal = require("../index.js"),
    colors  = require("colors"),
    async   = require("async"),
    tests   = null,
    resNum = 1,
    defaultProjectId = process.argv[2] || null;

async.waterfall(tests = [
        function (cb) {
            pivotal.useToken(process.env.token);
            return cb(null, []);
        },
        function (errStack, cb) {

            console.log("Calling getActivities (unfiltered)".grey);

            pivotal.getActivities(null, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got activities (unfiltered)!".green, ret.activity.length.toString().grey);

                if (pivotal.debug) {
                    for(i in ret.activity) {
                        console.log("Got activity:".green, JSON.stringify(ret.activity[i]).grey);
                    }
                }

                return cb(null, defaultProjectId || ret.activity[0].project_id, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getActivities (filtered)".grey);

            var intResNum = resNum;
            resNum += 1;

            pivotal.getActivities({project:projectId, limit:2}, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got activities (filtered)!".green, ret.activity.length.toString().grey);

                if (pivotal.debug) {
                    for(i in ret.activities.activity) {
                        console.log("Got activity:".green, JSON.stringify(ret.activity[i]).grey);
                    }
                }

                return cb(null, errStack);
            });
        },
        function (errStack, cb) {

            console.log("Calling getProjects".grey);

            pivotal.getProjects(function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got projects!".green, ret.project.length.toString().grey);

                if (pivotal.debug) {
                    for (i in ret.project) {
                        console.log("Got project:".green, JSON.stringify(ret.project[i]).grey);
                    }
                }

                return cb(null, defaultProjectId || ret.project[0].id, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getProject".grey);

            pivotal.getProject(projectId, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project!".green, ret.name.grey);

                if (pivotal.debug) {
                    for(i in ret.project) {
                        console.log("Got project attribute:".green, JSON.stringify(ret.project[i]).grey);
                    }
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getMemberships".grey, projectId);

            pivotal.getMemberships(projectId, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project members!".green, ret.membership.length.toString().grey);

                if (pivotal.debug) {
                    for (i in ret.membership) {
                        console.log("Got project memberships :".green, JSON.stringify(ret.membership[i]).grey);
                    }
                }

                return cb(null, projectId, ret.membership[0].id, errStack);
            });
        },
        function (projectId, membershipId, errStack, cb) {

            console.log("Calling getMembership".grey, projectId, membershipId);

            pivotal.getMembership(projectId, membershipId, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project member!".green, ret.person.name.grey, ret.role);

                if (pivotal.debug) {
                    for (i in ret.membership) {
                        console.log("Got project membership attribute:".green, JSON.stringify(ret.membership[i]).grey);
                    }
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling addMembership".grey, projectId);

            pivotal.addMembership(projectId, {
                role    : "Member",
                person  : {
                    name        : "Jane Fonda",
                    initials    : "JF",
                    email       : "j@f.jf"
                }
            }, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project member!".green, ret.id, ret.role);

                if (pivotal.debug) {
                    for (i in ret) {
                        console.log("Got project membership attribute:".green, JSON.stringify(ret[i]).grey);
                    }
                }

                return cb(null, projectId, ret.id, errStack);
            });
        },
        function (projectId, membershipId, errStack, cb) {

            console.log("Calling removeMembership".grey, projectId);

            pivotal.removeMembership(projectId, membershipId, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Dropped project member!".green, ret.id, ret.person.name, ret.role);

                if (pivotal.debug) {
                    for (i in ret) {
                        console.log("Got project membership attribute:".green, JSON.stringify(ret[i]).grey);
                    }
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getIterations (limited:5)".grey, projectId);

            pivotal.getIterations(projectId, { limit:5 }, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project's iterations!".green, ret.iteration.length);

                if (pivotal.debug) {
                    for (i in ret.iteration) {
                        console.log("Got project iteration:".green, JSON.stringify(ret.iteration[i]).grey);
                    }
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getIterations (current)".grey, projectId);

            pivotal.getIterations(projectId, { group : "current" }, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project's current iteration!".green, ret.iteration.number);

                if (pivotal.debug) {
                    for(i in ret.iteration) {
                        console.log("Got project iteration attribute:".green, JSON.stringify(ret.iteration[i]).grey);
                    }
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getStories".grey, projectId);

            pivotal.getStories(projectId, { limit : 5 }, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project's stories!".green, ret.story.length);

                if (pivotal.debug) {
                    for (i in ret.story) {
                        console.log("Got project iteration attribute:".green, JSON.stringify(ret.story[i]).grey);
                    }
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling addStoryAttachment".grey, projectId);

            pivotal.addStoryAttachment(projectId, 14690145, {
                name: "example.js",
                path: "pivotal.js"
            }, function (err, ret) {

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Its working!".green, ret.status, ret.id);

                return cb(null, projectId, errStack);
            });
        },
    ],
    function (fatalErr, errStack) {
        console.log("");
        console.log("Summary".blue);
        console.log("~~~~~~~".cyan.bold);
        console.log("Success: ".green, tests.length - (errStack.length+1));
        console.log("Failure: ".green, errStack.length);
    }
);
