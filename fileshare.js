// Collections
var Files = new Mongo.Collection('files'); // stores all files with their respective links


// Routes
Router.route('/', function () {
    // track home page hit
    mixpanel.track("hithomepage");
    this.render('filezone');
});
Router.route('/:_id', function () {
    // track home page hit
    mixpanel.track("hitsinglefilelink", { 'fileid': this.params._id });
    var file = Files.findOne({ _id: this.params._id });
    if (file && file.file.name.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
        console.log(file)
        this.render('imageFile', { data: file });
    } else {
        this.render('downloadFile', { data: file });
    }
});

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
                                alert("Error uploading a file, max allowed size is 10MB")
                            } else {
                                new Clipboard('.btn');
                                uploadedFile.date = Date.now()
                                Meteor.call("addFile", uploadedFile);
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

    Template.imageFile.helpers({
        windowHeight: function () {
            return window.innerHeight * 0.7;
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
            maxFileSize: Meteor.settings.AWS.MaxFileSize
        };
    }
}

// Meteor methods
Meteor.methods({
    addFile: function (file) {
        Files.insert(file);
    },
});