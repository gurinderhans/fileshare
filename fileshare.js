// Collections
var Files = new Mongo.Collection('files'); // stores all files with their respective links

// Routes
Router.route('/', function () {
    // track home page hit
    mixpanel.track("hithomepage");
    this.render('filezone');
});
Router.route('/:_id', function () {
    var file = Files.findOne({ _id: this.params._id });
    if (file) {
        if (file.file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            this.render('imagefile', { data: file });
        } else {
            this.render('genericfile', { data: file });
        }
        
        // track single file page link hit
        mixpanel.track("hitsinglefilelink", { 'fileid': this.params._id });
    } else {
        // show no file found
        this.render('fileloading');
    }
});

if (Meteor.isClient) {
    
    /**
     * Helper function to upload files
     */
    function uploadFiles(files) {
        // file empty checks
        if (!files || files.length == 0)
            return;
        
        // upload `files` to S3
        S3.upload({ files: files }, function (e, uploadedFile) {
            if (e) {
                alert("Error uploading a file, max allowed size is 100MB")
            } else {
                new Clipboard('.btn');
                uploadedFile.date = Date.now()
                Meteor.call("addFile", uploadedFile);
            }
        });
    }

    Template.filezone.helpers({
        dropHandlers: function () {
            return {
                onEnter: function (event) { /**/ },
                onDrop: uploadFiles
            };
        },

        files: function () {
            return S3.collection.find();
        }
    })

    Template.filezone.events({
        "change #file-picker": function (ev) {
            uploadFiles($("#file-picker")[0].files);
        },

        "click .btn": function (ev) {
            ev.preventDefault();
            ev.stopPropogation();
        }
    })

    Template.imagefile.helpers({
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
            maxFileSize: Meteor.settings.AWS.MaxFileSize,
            bucketRootPath: Meteor.settings.AWS.BucketRootPath
        };
    }
}

// Meteor methods
Meteor.methods({
    addFile: function (file) {
        Files.insert(file);
    },
});