# node-pivotal : Node.JS API Library for PivotalTracker

License: MIT

To install:

    _npm install pivotal_

## To use:

```javascript
var pivotal = require("pivotal");
pivotal.useToken("myToken");
```

You can also retrieve the token initially by using the pivotal.getToken function

## For more information:

- [PivotalTracker API v3 Documentation][https://www.pivotaltracker.com/help/api?version=v3]

## API methods
### pivotal.getToken : retrieve a user's token

ref: https://www.pivotaltracker.com/help/api?version=v3#retrieve_token_post

arguments:
    user : user name (email)
    pass : the user's password
### pivotal.useToken : set the token to use for all Pivotal callso

arguments:
    token: A valid Pivotal Token
pivotal.getActivities: list activities for the projects you have access to

ref: https://www.pivotaltracker.com/help/api?version=v3#get_all_activity
        and
     https://www.pivotaltracker.com/help/api?version=v3#get_project_activity

arguments:
    filters : Limits the return data {
        project (int)       : project id
        limit               : maximum return entries
        occurred_since_date : earliest date for return entries
        newer_than_version  : allows restricting the activity feed to only those items that have a greater than supplied version
    }
this.getProjects : get all the projects you have access to

ref: https://www.pivotaltracker.com/help/api?version=v3#get_project_all_projects
### pivotal.getProject : access a project

ref: https://www.pivotaltracker.com/help/api?version=v3#get_project_info

arguments:
    id (int) : id of the project
### pivotal.addProject : create a project

ref: https://www.pivotaltracker.com/help/api?version=v3#add_project

arguments:
    project : Data of the project to add {
        name (string)                   : The project's name
        iteration_length (int)          : Iteration length
        no_owner (boolean, optional)    : Does the project have an owner?
    }
### pivotal.getMemberships : get the members of this projects

ref: https://www.pivotaltracker.com/help/api?version=v3#get_memberships

arguments:
    projectId (int) : id of the project
### pivotal.getMembership : get a single member of this projects

ref: https://www.pivotaltracker.com/help/api?version=v3#get_membership_info

arguments:
    projectId (int)     : id of the project
    membershipId (int)  : id of the member
### pivotal.addMembership : add a member to this projects

ref: https://www.pivotaltracker.com/help/api?version=v3#add_membership

arguments:
    projectId (int)          : id of the project
    membershipData : Data of the new member {
        role : Member or Owner
        person : Personal information {
            name     : Person's full name
            initials : Name's initials
            email    : E-mail
        }
    }

Note: The user does not have to be in the system already. He will receieve
an email asking him to join if he does not have a project already.
### pivotal.removeMembership : remove a single member of this projects

ref: https://www.pivotaltracker.com/help/api?version=v3#remove_membership

arguments:
    projectId (int)     : id of the project
    membershipId (int)  : id of the member
### pivotal.getIterations : get a project list of iterations

ref: https://www.pivotaltracker.com/help/api?version=v3#get_iterations

arguments:
    projectId (int)     : id of the project
    membershipId (int)  : id of the member
pivotal.getStories: Get a list of stories for this project

ref: https://www.pivotaltracker.com/help/api?version=v3#get_all_stories

arguments:
    projectId (int)     : id of the project
    filters : Limits the return data {
        limit               : maximum return entries
        offset              : start from story num. N in the list
        filter              : search string to use (ex: filter=label:"needs feedback" type:bug)
    }
pivotal.getStory: Get a story from a project

ref: https://www.pivotaltracker.com/help/api?version=v3#get_story

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
pivotal.addStory: Add a story to a project

ref: https://www.pivotaltracker.com/help/api?version=v3#add_story
        and
     https://www.pivotaltracker.com/help/api?version=v3#link_story

arguments:
    projectId (int)     : id of the project
    storyData : data of the story {
        name           : Name of this story
        story_type     : bug, feature, chore, release
        estimate (int) : number which indicates the level of difficulty of the story
        description    : description,
        labels         : Comma-separated list of labels
        requested_by   : Name of the requester
                       (should be an existing member person name,
                       but I dont know if this is an actual limitation)
    }
pivotal.addStoryAttachment: Add a file to a story

ref: https://www.pivotaltracker.com/help/api?version=v3#upload_attachment

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
    fileData : information of file to upload {
        name : filename of the file after upload
        path : path to the file on disk
        data : if no path is provided, one may
               simply put the data of the file in there instead
    }
pivotal.addStoryComment: Add a comment to a story

ref: https://www.pivotaltracker.com/help/api?version=v3#add_note

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
    comment (string)    : The text of the comment to add
pivotal.updateStory: Update story infos and/or move a story to a different project

ref: https://www.pivotaltracker.com/help/api?version=v3#update_story

arguments:
    projectId (int)     : id of the project
    storyData : data of the story {
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
pivotal.moveStory: move a story in the list of priority

ref: https://www.pivotaltracker.com/help/api?version=v3#move_stories

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
    moveData : Information on how the move should happen {
        target : Id of the destination story
        move   : before or after (the target story)
    }
pivotal.removeStory: remove a story from a project

ref: https://www.pivotaltracker.com/help/api?version=v3#delete_story

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
pivotal.deliverAllFinishedStories: self-explanatory

ref: https://www.pivotaltracker.com/help/api?version=v3#deliver_all_finished

arguments:
    projectId (int)     : id of the project
pivotal.getTasks: Get tasks for a story

ref: https://www.pivotaltracker.com/help/api?version=v3#view_task

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
pivotal.getTask: Get a task from a story

ref: https://www.pivotaltracker.com/help/api?version=v3#view_task

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
    taskId (int)        : id of the task
### pivotal.addTask : add a task to a story

ref: https://www.pivotaltracker.com/help/api?version=v3#add_task

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
    taskData : data of the task {
        description : text of the task
        complete    : true of false
    }
### pivotal.updateTask : add a task to a story

ref: https://www.pivotaltracker.com/help/api?version=v3#update_task

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
    taskId (int)        : id of the task
    taskData : data of the task {
        description : text of the task
        complete    : true of false
    }
### pivotal.removeTask : remove a task from a story

ref: https://www.pivotaltracker.com/help/api?version=v3#delete_task

arguments:
    projectId (int)     : id of the project
    storyId (int)       : id of the story
    taskId (int)        : id of the task
