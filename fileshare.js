// Collections
var Files = new Mongo.Collection('files'); // stores all files with their respective links

if (Meteor.isClient) {

    Template.registerHelper('_', function () {
        return _
    })

    Template.filezone.helpers({
        dropHandlers: function () {
            return {
                onEnter: function (event) {
                    // console.log("enter", event);
                },
                onDrop: function (files) {
                    if (files.length > 0) {
                        // upload `file` to S3
                        S3.upload({ files: files }, function (e, uploadedFile) {
                            if (e) {
                                console.log(e);
                                S3.collection.remove(uploadedFile)
                            } else {
                                new Clipboard('.btn');
                                console.log(uploadedFile)
                                uploadedFile.date = Date.now()
                                Files.insert(uploadedFile)
                            }
                        });
                    }
                }
            };
        },

        files: function () {
            return S3.collection.find();
        }
    })
}

if (Meteor.isServer) {
    if (Meteor.settings.AWS) {
        S3.config = {
            key: Meteor.settings.AWS.AWSAccessKeyId,
            secret: Meteor.settings.AWS.AWSSecretAccessKey,
            bucket: Meteor.settings.AWS.AWSBucket,
            region: Meteor.settings.AWS.AWSRegion,
        };
    }

    Meteor.startup(function () {
        // code to run on server at startup
    });
}
