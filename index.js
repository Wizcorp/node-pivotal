/**
    # node-pivotal : Node.JS API Library for PivotalTracker

    [![NPM](https://nodei.co/npm/pivotal.png)](https://nodei.co/npm/pivotal/)

    License: MIT

    To install:

        npm install pivotal

    ## To use:

    ```javascript
    var Pivotal = require("pivotal");
    var pivotal = new Pivotal("myToken");
    ```

    You can also retrieve the token initially by using the pivotal.getToken function

    ## Contributing

    When making changes to the library, please run `make doc` before submitting pull requests.

    ## Tests

    Tests are located in test/ directory. To run them you need to install the required dependencies

    ```shell
        npm install
    ```

    and either set your pivotal api-token as a variable

    ```shell
        export token=xxxxxxxxxxxxxx
    ```

    or your username and password (which will result in an additional test for creating the token)

    ```shell
        export username=tester
        export password=testpw
    ```

    for testing against a specific project/story/member

    ```shell
        export project_id=123456
        export story_id=9876546
        export member_id=192837
    ```

    finally run the tests using:

    ```shell
        make test
    ```

    ## For more information:

    - [PivotalTracker API v3 Documentation](https://www.pivotaltracker.com/help/api?version=v3 "PivotalTracker")

    ## API methods

    For examples see tests/test.js

*/
var xml2js      = require("xml2js"),
    url         = require("url"),
    fs          = require("fs"),
    querystring = require("querystring"),
    sanitize    = require("validator").sanitize,
    https       = require("https");

/**
    ### pivotal constructor : set the token to use for all Pivotal calls

    __Arguments__

    + token: A valid Pivotal Token

*/
var Pivotal = function (token) {
    this.token = token;
};

/*
   Switching debug to true will print output to the console.
   Only useful for debugging this API
*/
Pivotal.debug = false;


/**
    ### pivotal.getToken : retrieve a user's token

    ref: https://www.pivotaltracker.com/help/api?version=v3#retrieve_token_post

    __Arguments__

    + user : user name (email)
    + pass : the user's password

*/
Pivotal.getToken = function (user, pass, cb) {
    Pivotal.apiCall("POST", ["tokens", "active"], null, querystring.stringify({"username": user, "password" : pass}), null, cb);
};

/**
    ### pivotal.useToken : set the token to use for all Pivotal callso

    __Arguments__

   + token: A valid Pivotal Token

*/
Pivotal.prototype.useToken = function (token) {
    this.token = token;
};

/**
    ### pivotal.getActivities: list activities for the projects you have access to

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_all_activity

    __Arguments__

    + filters : Limits the return data

    ```javascript
    {
        project (int)       : project id
        limit               : maximum return entries
        occurred_since_date : earliest date for return entries
        newer_than_version  : allows restricting the activity feed to only those items that have a greater than supplied version
    }
    ```

*/
Pivotal.prototype.getActivities = function (filters, cb) {
    var url = ["activities"];

    if (filters && filters.project) {
        url.unshift(filters.project);
        url.unshift("projects");
        delete filters.project;
    }

    this.apiCall("GET", url, filters, null, null, cb);
};

/**
    ### pivotal.getProjectActivities: list activities for the projects you have access to

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_project_activity

    __Arguments__

    + project (int) : project id
    + filters : Limits the return data

    ```javascript
    {
        limit               : maximum return entries
        occurred_since_date : earliest date for return entries
        newer_than_version  : allows restricting the activity feed to only those items that have a greater than supplied version
    }
    ```

*/
Pivotal.prototype.getProjectActivities = function (projectId, filters, cb) {

    filters = filters || {};
    filters.project = projectId;
    this.getActivities(filters, cb);
};

/**
    ### pivotal.getProjects : get all the projects you have access to

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_project_all_projects
*/
Pivotal.prototype.getProjects = function (cb) {
    this.apiCall("GET", ["projects"], null, null, null, cb);
};

/**
    ### pivotal.getProject : access a project

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_project_info

    __Arguments__

    + id (int) : id of the project

*/
Pivotal.prototype.getProject = function (projectId, cb) {
    this.apiCall("GET", ["projects", projectId], null, null, null, cb);
};

/**
    ### pivotal.addProject : create a project

    ref: https://www.pivotaltracker.com/help/api?version=v3#add_project

    __Arguments__
    + project : Data of the project to add

    ```javascript
    {
        name (string)                   : The project's name
        iteration_length (int)          : Iteration length
        no_owner (boolean, optional)    : Does the project have an owner?
    }
    ```

*/
Pivotal.prototype.addProject = function (projectData, cb) {

    if (projectData.no_owner === undefined) {
        projectData.no_owner = true;
    }

    this.apiCall("POST", ["projects"], null, { project : projectData }, null, cb);
};

/**
    ### pivotal.getMemberships : get the members of this projects

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_memberships

    __Arguments__

    + projectId (int) : id of the project

*/
Pivotal.prototype.getMemberships = function (projectId, cb) {
    this.apiCall("GET", ["projects", projectId, "memberships"], null, null, null, cb);
};

/**
    ### pivotal.getMembership : get a single member of this projects

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_membership_info

    __Arguments__

    + projectId (int)     : id of the project
    + membershipId (int)  : id of the member

*/
Pivotal.prototype.getMembership = function (projectId, membershipId, cb) {
    this.apiCall("GET", ["projects", projectId, "memberships", membershipId], null, null, null, cb);
};

/**
    ### pivotal.addMembership : add a member to this projects

    ref: https://www.pivotaltracker.com/help/api?version=v3#add_membership

    __Arguments__

    + projectId (int)          : id of the project
    + membershipData : Data of the new member

    ```javascript
    {
        role : Member or Owner
        person : Personal information {
            name     : Person's full name
            initials : Name's initials
            email    : E-mail
        }
    }
    ```

    __Note__: The user does not have to be in the system already. He will receieve
    an email asking him to join if he does not have a project already.

*/
Pivotal.prototype.addMembership = function (projectId, membershipData, cb) {
    this.apiCall("POST", ["projects", projectId, "memberships"], null, { "membership" : membershipData }, null, cb);
};

/**
    ### pivotal.removeMembership : remove a single member of this projects

    ref: https://www.pivotaltracker.com/help/api?version=v3#remove_membership

    __Arguments__

    + projectId (int)     : id of the project
    + membershipId (int)  : id of the member

*/
Pivotal.prototype.removeMembership = function (projectId, membershipId, cb) {
    this.apiCall("DELETE", ["projects", projectId, "memberships", membershipId], null, null, null, cb);
};

/**
    ### pivotal.getIterations : get a project list of iterations

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_iterations

    __Arguments__

    + projectId (int)     : id of the project
    + filters : Limits the return data

    ```javascript
    {
        group               : filter by iteration type [done|current|backlog|current_backlog]
        limit               : maximum return entries
        offset              : start from story num. N in the list
    }
    ```

*/
Pivotal.prototype.getIterations = function (projectId, filters, cb) {

    var url = ["projects", projectId, "iterations"];

    if (filters && filters.group) {
        url.push(filters.group);
        delete filters.group;
    }

    this.apiCall("GET", url, filters, null, null, cb);
};

/**
    ### pivotal.getDoneIterations: get a project completed iterations

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_iterations

    __Arguments__

    + projectId (int)     : id of the project
    + filters : Limits the return data

    ```javascript
    {
        limit               : maximum return entries
        offset              : start from story num. N in the list
    }
    ```

*/
Pivotal.prototype.getDoneIterations = function (projectId, filters, cb) {

    filters = filters || {};
    filters.group = "done";
    this.getIterations(projectId, filters, cb);
};

/**
    ### pivotal.getCurrentIteration : get a project current iteration

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_iterations

    __Arguments__

    + projectId (int)     : id of the project

*/
Pivotal.prototype.getCurrentIteration = function (projectId, cb) {

    this.getIterations(projectId, { group: "current" }, cb);
};

/**
    ### pivotal.getBacklogIterations: get a project backlog

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_iterations

    __Arguments__

    + projectId (int)     : id of the project
    + filters : Limits the return data

    ```javascript
    {
        limit               : maximum return entries
        offset              : start from story num. N in the list
    }
    ```

*/
Pivotal.prototype.getBacklogIterations = function (projectId, filters, cb) {

    filters = filters || {};
    filters.group = "backlog";
    this.getIterations(projectId, filters, cb);
};

/**
    ### pivotal.getCurrentBacklogIterations: get a project backlog and current iterations

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_iterations

    __Arguments__

    + projectId (int)     : id of the project

*/
Pivotal.prototype.getCurrentBacklogIterations = function (projectId, cb) {

    this.apiCall("GET", ["projects", projectId, "iterations"], { group: "current_backlog" }, null, null, cb);
};

/**
    ### pivotal.getStories: Get a list of stories for this project

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_all_stories

    __Arguments__

    + projectId (int)     : id of the project
    + filters : Limits the return data

    ```javascript
    {
        limit               : maximum return entries
        offset              : start from story num. N in the list
        filter              : search string to use (ex: filter=label:"needs feedback" type:bug)
    }
    ```

*/
Pivotal.prototype.getStories = function (projectId, filters, cb) {
    function isEmptyObject (obj) {
        for (var d in obj){
            return false;
        }
        return true;
    }
    this.apiCall("GET", ["projects", projectId, "stories"], filters, null, null, function (err, data) {
        if (err) {
            cb(err);
        }
        if (isEmptyObject(data)) {
            data = {story: []};
        }
        else if (isEmptyObject(data.story)) {
            data.story = [];
        }
        else if (!Array.isArray(data.story)) {
            data.story = [data.story];
        }
        cb(null, data);
    });
};

/**
    ### pivotal.getStory: Get a story from a project

    ref: https://www.pivotaltracker.com/help/api?version=v3#get_story

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story

*/
Pivotal.prototype.getStory = function (projectId, storyId, cb) {
    this.apiCall("GET", ["projects", projectId, "stories", storyId], null, null, null, cb);
};

/**
    ### pivotal.addStory: Add a story to a project

    ref: https://www.pivotaltracker.com/help/api?version=v3#add_story

            and

         https://www.pivotaltracker.com/help/api?version=v3#link_story

    __Arguments__

    + projectId (int)     : id of the project
    + storyData : data of the story

    ```javascript
    {
        name           : Name of this story
        story_type     : bug, feature, chore, release
        estimate (int) : number which indicates the level of difficulty of the story
        description    : description,
        labels         : Comma-separated list of labels
        requested_by   : Name of the requester
                       (should be an existing member person name,
                       but I dont know if this is an actual limitation)
    }
    ```

*/
Pivotal.prototype.addStory = function (projectId, storyData, cb) {
    this.apiCall("POST", ["projects", projectId, "stories"], null, { story : storyData }, null, cb);
};

/**
    ### pivotal.addStoryAttachment: Add a file to a story

    ref: https://www.pivotaltracker.com/help/api?version=v3#upload_attachment

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + fileData : information of file to upload

    ```javascript
    {
        name : filename of the file after upload
        path : path to the file on disk
        data : if no path is provided, one may
               simply put the data of the file in there instead
    }
    ```

*/
Pivotal.prototype.addStoryAttachment = function (projectId, storyId, fileData, cb) {
    this.apiCall("POST", ["projects", projectId, "stories", storyId, "attachments"], null, null, fileData, cb);
};

/**
    ### pivotal.addStoryComment: Add a comment to a story

    ref: https://www.pivotaltracker.com/help/api?version=v3#add_note

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + comment (string)    : The text of the comment to add

*/
Pivotal.prototype.addStoryComment = function (projectId, storyId, comment, cb) {
    this.apiCall("POST", ["projects", projectId, "stories", storyId, "notes"], null, { note: { text : comment } }, null, cb);
};

/**
    ### pivotal.updateStory: Update story infos and/or move a story to a different project

    ref: https://www.pivotaltracker.com/help/api?version=v3#update_story

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + storyData (obj)     : data of the story
    + callback (function) : callback function

    ```javascript
    {
        project_id     : Id of the project
        name           : Name of this story
        story_type     : bug, feature, chore, release
        estimate (int) : number which indicates the level of difficulty of the story
        description    : description,
        labels         : Comma-separated list of labels
        requested_by   : Name of the requester
                       (should be an existing member person name,
                       but I dont know if this is an actual limitation)
    }
    ```

*/
Pivotal.prototype.updateStory = function (projectId, storyId, storyData, cb) {
    this.apiCall("PUT", ["projects", projectId, "stories", storyId], null, { story : storyData }, null, cb);
};

/**
    ### pivotal.moveStory: move a story in the list of priority

    ref: https://www.pivotaltracker.com/help/api?version=v3#move_stories

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + moveData : Information on how the move should happen

    ```javascript
    {
        target : Id of the destination story
        move   : before or after (the target story)
    }
    ```

*/
Pivotal.prototype.moveStory = function (projectId, storyId, moveData, cb) {

    var postData = {},
        m        = null;

    for (m in moveData) {
        if(moveData.hasOwnProperty(m)) {
            postData["move[" + m + "]"] = moveData[m];
        }
    }

    this.apiCall("POST", ["projects", projectId, "stories", storyId, "moves"], postData, null, null, cb);
};

/**
    ### pivotal.removeStory: remove a story from a project

    ref: https://www.pivotaltracker.com/help/api?version=v3#delete_story

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story

*/
Pivotal.prototype.removeStory = function (projectId, storyId, cb) {
    this.apiCall("DELETE", ["projects", projectId, "stories", storyId], null, null, null, cb);
};

/**
    ### pivotal.deliverAllFinishedStories: self-explanatory

    ref: https://www.pivotaltracker.com/help/api?version=v3#deliver_all_finished

    __Arguments__

    + projectId (int)     : id of the project

*/
Pivotal.prototype.deliverAllFinishedStories = function (projectId, cb) {
    this.apiCall("PUT", ["projects", projectId, "stories", "deliver_all_finished"], null, null, null, cb);
};

/**
    ### pivotal.getTasks: Get tasks for a story

    ref: https://www.pivotaltracker.com/help/api?version=v3#view_task

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story

*/
Pivotal.prototype.getTasks = function (projectId, storyId, cb) {
    this.apiCall("GET", ["projects", projectId, "stories", storyId, "tasks"], null, null, null, cb);
};

/**
    ### pivotal.getTask: Get a task from a story

    ref: https://www.pivotaltracker.com/help/api?version=v3#view_task

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + taskId (int)        : id of the task

*/
Pivotal.prototype.getTask = function (projectId, storyId, taskId, cb) {
    this.apiCall("GET", ["projects", projectId, "stories", storyId, "tasks", taskId], null, null, null, cb);
};

/**
    ### pivotal.addTask : add a task to a story

    ref: https://www.pivotaltracker.com/help/api?version=v3#add_task

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + taskData : data of the task

    ```javascript
    {
        description : text of the task
        complete    : true of false
    }
    ```

*/
Pivotal.prototype.addTask = function (projectId, storyId, taskData, cb) {
    this.apiCall("POST", ["projects", projectId, "stories", storyId, "tasks"], null, { task : taskData }, null, cb);
};

/**
    ### pivotal.updateTask : add a task to a story

    ref: https://www.pivotaltracker.com/help/api?version=v3#update_task

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + taskId (int)        : id of the task
    + taskData : data of the task

    ```javascript
    {
        description : text of the task
        complete    : true of false
    }
    ```

*/
Pivotal.prototype.updateTask = function (projectId, storyId, taskId, taskData, cb) {
    this.apiCall("PUT", ["projects", projectId, "stories", storyId, "tasks", taskId], null, { task : taskData }, null, cb);
};

/**
    ### pivotal.removeTask : remove a task from a story

    ref: https://www.pivotaltracker.com/help/api?version=v3#delete_task

    __Arguments__

    + projectId (int)     : id of the project
    + storyId (int)       : id of the story
    + taskId (int)        : id of the task

*/
Pivotal.prototype.removeTask = function (projectId, storyId, taskId, cb) {
    this.apiCall("DELETE", ["projects", projectId, "stories", storyId, "tasks", taskId], null, null, null, cb);
};

Pivotal.prototype.apiCall = function (method, pathSegments, query, data, file, cb) {
    Pivotal.apiCall(method, pathSegments, query, data, file, cb, this.token);
};

Pivotal.apiCall = function (method, pathSegments, query, data, file, cb, token) {

    if (data && file) {
        throw new Error("The Pivotal API does not support file upload and XML POSTing at the same time");
    }

    // Build Request URL
    var path        =  "/services/v3/" + pathSegments.join("/"),
        postData     = null,
        options     = null,
        req         = null,
        boundaryKey = null;

    // Append query string
    if (query) {
        path += "?" + querystring.stringify(query);
    }

    // Request options
    options = {
        headers : {
            "X-TrackerToken" : token,
            "Accept"         : "text/html,application/xhtml+xml,application/xml",
            "Host"           : "www.pivotaltracker.com",
            "Connection"     : "keep-alive",
            "Content-Length" : 0
        },
        host    : "www.pivotaltracker.com",
        path    : path,
        method  : method
    };

    // format data if required
    if (data) {
        if (typeof data === "string"){
            postData = data;
        }
        else {
            postData = Pivotal.toXml(data);
            options.headers["Content-Type"]   = "application/xml";
        }

        options.headers["Content-Length"] = Buffer.byteLength(postData, 'utf8');
    }

    if (file) {

        boundaryKey = Math.random().toString(12).substr(2,12);

        if (file.path) {
            options.headers["Content-Length"]   = fs.statSync(file.path).size;
        }
        else {
            options.headers["Content-Length"]   = Buffer.byteLength(file.data, 'utf8');
        }

        options.headers["Content-Length"]   += 196 + Buffer.byteLength(file.name, 'utf8');

        options.headers.Expect = "100-continue";
        options.headers["Content-Type"]         = "multipart/form-data; boundary=----------------------------" + boundaryKey;
    }

    // Create request
    Pivotal.log("requesting", options.path, options.method, data);

    req = https.request(options, function (res) {

        var content = "",
            parser = new xml2js.Parser({
                explicitArray : false,
                ignoreAttrs   : true,
                explicitRoot  : false
            });

        res.on('data', function (chunk) {
            content += chunk;
        });

        res.on('end', function(){

            if (this.statusCode !== 200) {
                return cb({code: this.statusCode, desc: "API returned an HTTP error"}, null);
            }

            if (content === "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<nil-classes type=\"array\"/>\n") {
                return cb(null, null);
            }

            parser.parseString(content, function (err, ret) {

                Pivotal.log("info", "Result:", content);

                if (err) {

                    Pivotal.log("error", "Result:", content);

                    err = {
                        "errors" : {
                            "error" : [ "Error while parsing PT HTTP service response", err ]
                        }
                    };
                }

                if (ret && ret.errors) {
                    err = ret;
                    ret = null;
                }

                //
                // We do this so that any error generated by the callback function
                // will not bubble up and trigger the on('error') of the parser.
                //
                process.nextTick(function () {
                    cb(err, ret);
                });
            });
        });
    });

    // Error Reporting
    req.on('error', function(e) {
        cb({
            "errors" : {
                "error" :[e]
            }
        }, null);
    });

    // PUT / POST data
    if (postData) {
        return req.end(postData);
    }

    /*
        Upload data

        file should be an object with the following structure
        {
            "name" : "myfilename.ext",
            "data" : somedatawhatever,
            "path" : "/path/to/the/file.ext"
        }

        If no data is provided, we will look for the file on the
        disk at the location given in path;

        This currently limits to one upload at a time, but could
        be adapted in the case where the Pivotal API would start
        to have multiple-upload capacities
    */

    if (!file) {
        return req.end();
    }

    req.write("------------------------------" + boundaryKey + "\r\n");
    req.write("Content-Disposition: form-data; name=\"Filedata\"; filename=\"" + file.name + "\"\r\n");
    req.write("Content-Type: application/octet-stream\r\n\r\n");

    // If the file object holds the data, we write and close
    if (file.data) {
        req.write(file.data);
        return req.end("\r\n------------------------------" + boundaryKey + "--\r\n");
    }

    // If we have a path, we stream the content to HTTP and
    // close the req object once were done.
    return fs.createReadStream(file.path, { bufferSize: 4 * 1024 })
        .on("end", function(){
            return req.end("\r\n------------------------------" + boundaryKey + "--\r\n");
        })
        .pipe(req, { end: false });
};

// Debug logging
Pivotal.log = function(){
    if (Pivotal.debug) {
        console.log.apply(null, arguments);
    }
};

// Format a JS object to XML string
Pivotal.toXml = function (data) {

    var ret = "",
        val = null,
        d   = null,
        t   = '',
        fieldTypes = {
            'no_owner': 'type=\"boolean\"'
        };

    for(d in data){
        if (data.hasOwnProperty(d)) {

            if (typeof(data[d]) === "object") {
                    val = Pivotal.toXml(data[d]);
            } else {
                    val = sanitize(data[d].toString()).entityEncode();
            }

            if (fieldTypes[d] !== undefined) {
                t = fieldTypes[d];
            }

            ret += "<" + d + ' ' + t + ">" + val + "</" + d + ">";
        }
    }

    return ret;
};

module.exports = Pivotal;
