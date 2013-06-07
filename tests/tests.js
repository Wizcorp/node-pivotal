/*jslint
    forin: true
*/
var pivotal = require("../index.js"),
    colors  = require("colors"),
    async   = require("async"),
    tests   = null,
    resNum  = 1,
    token   = process.env.token || null,
    debug   = (process.env.debug !== undefined),
    defaultProjectId = parseInt(process.env.project_id,10) || null,
    defaultStoryId = parseInt(process.env.story_id,10) || null,
    defaultProjectMemberId = parseInt(process.env.member_id,10) || null;

pivotal.debug = debug;

async.waterfall(tests = [
        function(cb) {
            if(!token) {
                var username = process.env.username,
                    password = process.env.password;

                console.log("Calling getToken".grey);
                pivotal.getToken(username, password, function(err, res){
                    if(err){
                        console.error("Could not retrieve token".red.bold, err);
                        return cb(null, [err]);
                    }
                    token = res.guid;
                    return cb(null, []);
                });
            } else {
                return cb(null, []);
            }
        },
        function (errStack, cb) {
            console.log("Token: ".grey, token);
            console.log("");
            pivotal.useToken(token);
            return cb(null, errStack);
        },
        function (errStack, cb) {

            console.log("Calling getActivities (unfiltered)".grey);

            pivotal.getActivities(null, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, defaultProjectId, errStack);
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

            console.log("Calling getProjectActivities (limit:2)".grey);

            var intResNum = resNum;
            resNum += 1;

            pivotal.getProjectActivities(projectId, {limit:2}, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Got project activities!".green, ret.activity.length.toString().grey);

                if (pivotal.debug) {
                    for(i in ret.activity) {
                        console.log("Got activity:".green, JSON.stringify(ret.activity[i]).grey);
                    }
                }

                return cb(null, errStack);
            });
        },
        function (errStack, cb) {

            console.log("Calling getProjects".grey);

            pivotal.getProjects(function (err, ret) {

                var i,
                    project;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, defaultProjectId, errStack);
                }

                project = Object.prototype.toString.call(ret.project) === '[object Array]' ? ret.project[0] : ret.project;

                console.log("Got projects!".green);

                if (pivotal.debug) {
                    for (i in ret.project) {
                        console.log("Got project:".green, JSON.stringify(project).grey);
                    }
                }

                return cb(null, defaultProjectId || project.id, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getProject".grey);

            pivotal.getProject(projectId, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, projectId, errStack);
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

            console.log("Calling getIterations (limit:5)".grey, projectId);

            pivotal.getIterations(projectId, { limit:5 }, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, projectId, errStack);
                }

                if (!ret.iteration.length) {
                    console.log("No iterations were found".green);
                    return cb(null, projectId, errStack);
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

            console.log("Calling getCurrentIteration".grey, projectId);

            pivotal.getCurrentIteration(projectId, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, projectId, errStack);
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

            console.log("Calling getDoneIterations (limit:3)".grey, projectId);

            pivotal.getDoneIterations(projectId, { limit: 3 }, function (err, ret) {

                var i, iteration;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, projectId, errStack);
                }

                if (!ret) {
                    console.log("No project iterations found!".green);
                    return cb(null, projectId, errStack);
                }

                iteration = Object.prototype.toString.call(ret.iteration) === '[object Array]' ? ret.iteration : [ret.iteration];

                console.log("Got project's done iteration!".green, iteration[0].number);

                if (pivotal.debug) {
                    for(i in iteration) {
                        console.log("Got project iteration attribute:".green, JSON.stringify(iteration[i]).grey);
                    }
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getMemberships".grey, projectId);

            pivotal.getMemberships(projectId, function (err, ret) {

                var i, membership;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, projectId, defaultProjectMemberId, errStack);
                }

                console.log("Got project members!".green);

                membership = Object.prototype.toString.call(ret.membership) === '[object Array]' ? ret.membership : [ret.membership];

                if (pivotal.debug) {
                    for (i in ret.membership) {
                        console.log("Got project memberships :".green, JSON.stringify(ret.membership[i]).grey);
                    }
                }

                return cb(null, projectId, defaultProjectMemberId || membership[0].id, errStack);
            });
        },
        function (projectId, membershipId, errStack, cb) {

            console.log("Calling getMembership".grey, projectId, membershipId);

            pivotal.getMembership(projectId, membershipId, function (err, ret) {

                var i;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, projectId, errStack);
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
                    return cb(null, projectId, null, errStack);
                }

                console.log("Added project member!".green, ret.id, "(" + ret.person.name + ", " + ret.role + ")");

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
                    return cb(null, projectId, errStack);
                }

                console.log("Dropped project member!".green);

                if (pivotal.debug) {
                    console.log(ret.grey);
                }

                return cb(null, projectId, errStack);
            });
        },
        function (projectId, errStack, cb) {

            console.log("Calling getStories".grey, projectId);

            pivotal.getStories(projectId, { limit : 5 }, function (err, ret) {

                var i, story, firstStory;

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, projectId, defaultStoryId, errStack);
                }

                story = Object.prototype.toString.call(ret.story) === '[object Array]' ? ret.story : [ret.story];
                console.log("Got project's stories!".green, ret.story.length);

                if (pivotal.debug) {
                    for (i in ret.story) {
                        console.log("Got project iteration attribute:".green, JSON.stringify(ret.story[i]).grey);
                    }
                }

                firstStory = (ret.story.length > 0) ? ret.story[0].id : null;
                return cb(null, projectId, defaultStoryId || firstStory, errStack);
            });
        },
        function (projectId, storyId, errStack, cb) {

            if (storyId === null) {
                console.log("No stories found, skipping addStoryAttachment".grey, projectId);
                return cb (null, errStack);
            }

            console.log("Calling addStoryAttachment".grey, projectId, storyId);

            pivotal.addStoryAttachment(projectId, storyId, {
                name: "example.js",
                path: "index.js"
            }, function (err, ret) {

                if (err) {
                    console.log("Error".red, JSON.stringify(err));
                    errStack.push(err);
                    return cb(null, errStack);
                }

                console.log("Its working!".green, ret.status, ret.id);

                return cb(null, errStack);
            });
        }
    ],
    function (fatalErr, errStack) {
        console.log("");
        console.log("Summary".blue);
        console.log("~~~~~~~".cyan.bold);
        console.log("Success: ".green, tests.length - (errStack.length+1));
        console.log("Failure: ".green, errStack.length);
    }
);
