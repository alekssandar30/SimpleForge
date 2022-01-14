$(document).ready(function () {

    // first, check if current visitor is signed in
    jQuery.ajax({
        url: '/api/forge/oauth3/token',
        success: function (res) {
            // yes, it is signed in...
            $('#signOut').show();
            $('#refreshHubs').show();

            // prepare sign out
            $('#signOut').click(function () {
                $('#hiddenFrame').on('load', function (event) {
                    location.href = '/api/forge/oauth/signout';
                });
                $('#hiddenFrame').attr('src', 'https://accounts.autodesk.com/Authentication/LogOut');
                // learn more about this signout iframe at
                // https://forge.autodesk.com/blog/log-out-forge
            })

            // and refresh button
            $('#refreshHubs').click(function () {
                $('#userHubs').jstree(true).refresh();
            });

            // finally:
            prepareUserHubsTree();
            showUser();
        }
    });

    $('#autodeskSigninButton').click(function () {
        jQuery.ajax({
            url: '/api/forge/oauth/url',
            success: function (url) {
                location.href = url;
            }
        });
    })

    $.getJSON("/api/forge/clientid", function (res) {
        $("#ClientID").val(res.id);
        $("#provisionAccountSave").click(function () {
            $('#provisionAccountModal').modal('toggle');
            $('#userHubs').jstree(true).refresh();
        });
    });


    prepareAppBucketTree();
    $('#refreshBuckets').click(function () {
        $('#appBuckets').jstree(true).refresh();
    });

    $('#createNewBucket').click(function () {
        createNewBucket();
    });

    $('#createBucketModal').on('shown.bs.modal', function () {
        $("#newBucketKey").focus();
    })

    

    $('#hiddenUploadField').change(function () {

        var node = $('#appBuckets').jstree(true).get_selected(true)[0];
        var _this = this;
        if (_this.files.length == 0) return;
        var file = _this.files[0];

        //max file chunk size set to 100 KB change as per requirement.
        var maxFileSizeKB = 100;

        var fileChunks = [];
        var bufferChunkSizeInBytes = maxFileSizeKB * (1024);

        var currentStreamPosition = 0;
        var endPosition = bufferChunkSizeInBytes;
        var size = file.size;

        while (currentStreamPosition < size) {
            fileChunks.push(file.slice(currentStreamPosition, endPosition));
            currentStreamPosition = endPosition;
            endPosition = currentStreamPosition + bufferChunkSizeInBytes;
        }

        //Append random number to file name to make it unique
        var fileName = Math.random() + "_" + file.name;
        uploadFileChunk(fileChunks, fileName, 1, fileChunks.length);

        switch (node.type) {
            case 'bucket':
                var formData = new FormData();
                formData.append('fileToUpload', file);
                formData.append('bucketKey', node.id);


                $.ajax({
                    url: `/api/uploadModel`,
                    // url: 'api/forge/oss/objects',
                    data: formData,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    success: function (data) {
                        $('#appBuckets').jstree(true).refresh_node(node);
                        _this.value = '';
                    }
                });
                break;
        }

    });
});


    


// ******************************** CREATE A BUCKET ****************************************

function createNewBucket() {
    console.log('creating a bucket');
    var bucketKey = $('#newBucketKey').val();
    jQuery.post({
        url: '/api/forge/oss/buckets',
        contentType: 'application/json',
        data: JSON.stringify({ 'bucketKey': bucketKey }),
        success: function (res) {
            $('#appBuckets').jstree(true).refresh();
            $('#createBucketModal').modal('toggle');
        },
        error: function (err) {
            console.log(err);
            if (err.status == 409)
                alert('Bucket already exists - 409: Duplicated')
            console.log(err);
        }
    });
}

// ********************************** MENU - tree js ***************************************

function prepareAppBucketTree() {
    $('#appBuckets').jstree({
        'core': {
            'themes': { "icons": true },
            'data': {
                "url": '/api/forge/oss/buckets',
                "dataType": "json",
                'multiple': false,
                "data": function (node) {
                    return { "id": node.id };
                }
            }
        },
        'types': {
            'default': {
                'icon': 'glyphicon glyphicon-question-sign'
            },
            '#': {
                'icon': 'glyphicon glyphicon-cloud'
            },
            'bucket': {
                'icon': 'glyphicon glyphicon-folder-open'
            },
            'object': {
                'icon': 'glyphicon glyphicon-file'
            }
        },
        "plugins": ["types", "state", "sort", "contextmenu"],
        contextmenu: { items: autodeskCustomMenu }
    }).on('loaded.jstree', function () {
        $('#appBuckets').jstree('open_all');
    }).bind("activate_node.jstree", function (evt, data) {
        if (data != null && data.node != null && data.node.type == 'object') {
            $("#forgeViewer").empty();
            var urn = data.node.id;
            getForgeToken(function (access_token) {
                jQuery.ajax({
                    url: 'https://developer.api.autodesk.com/modelderivative/v2/designdata/' + urn + '/manifest',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    success: function (res) {
                        if (res.status === 'success') launchViewer(urn);
                        else $("#forgeViewer").html('The translation job still running: ' + res.progress + '. Please try again in a moment.');
                    },
                    error: function (err) {
                        var msgButton = 'This file is not translated yet! ' +
                            '<button class="btn btn-xs btn-info" onclick="translateObject()"><span class="glyphicon glyphicon-eye-open"></span> ' +
                            'Start translation</button>'
                        $("#forgeViewer").html(msgButton);
                    }
                });
            })
        }
    });
}

function autodeskCustomMenu(autodeskNode) {
    var items;

    switch (autodeskNode.type) {
        case "bucket":
            items = {
                uploadFile: {
                    label: "Upload file",
                    action: function () {
                        uploadFile();
                    },
                    icon: 'glyphicon glyphicon-cloud-upload'
                },
                deleteBucket: {
                    label: "Delete bucket",
                    action: function () {
                        var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
                        deleteBucket(treeNode);
                    },
                    icon: 'glyphicon glyphicon-trash'
                }
            };
            break;
        case "object":
            items = {
                translateFile: {
                    label: "Translate",
                    action: function () {
                        var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
                        translateObject(treeNode);
                    },
                    icon: 'glyphicon glyphicon-eye-open'
                },
                deleteFile: {
                    label: "Delete",
                    action: function () {
                        var treeNode = $('#appBuckets').jstree(true).get_selected(true)[0];
                        deleteObject(treeNode);
                    },
                    icon: 'glyphicon glyphicon-trash'
                }
            };
            break;
    }

    return items;
}

function uploadFile() {
    $('#hiddenUploadField').click();
}

function uploadFileChunk(fileChunks, fileName, currentPart, totalPart, bucketKey) {
    var formData = new FormData();
    formData.append('fileToUpload', fileChunks[currentPart - 1], fileName);
    formData.append('bucketKey', bucketKey);

    $.ajax({
        type: "POST",
        url: '/api/uploadModel',
        contentType: false,
        processData: false,
        data: formData,
        enctype: 'multipart/form-data',
        success: function (data)
        {
            if (totalPart > currentPart) {
                console.log("uploading file part no: " + currentPart, " out of " + totalPart);
                if (data.status == true) {
                    if (totalPart == currentPart) {
                        //Whole file uploaded
                        console.log("whole file uploaded successfully");
                    } else {
                        //Show uploading progress
                        uploadFileChunk(fileChunks, fileName, currentPart + 1, totalPart);
                    }
                } else {
                    //retry message to upload rest of the file
                    console.log("failed to upload file part no: " + currentPart);
                }
            }
        },
        error: function (err) {
            //retry message to upload rest of the file
            console.log("error to upload file part no: " + currentPart);
        }
    });

}


function translateObject(node) {
    $("#forgeViewer").empty();
    if (node == null) node = $('#appBuckets').jstree(true).get_selected(true)[0];
    var bucketKey = node.parents[0];
    var objectKey = node.id;
    jQuery.post({
        url: '/api/forge/modelderivative/jobs',
        contentType: 'application/json',
        data: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey }),
        success: function (res) {
            $("#forgeViewer").html('Translation started! Please try again in a moment.');
        },
    });
}


// delete bucket
function deleteBucket(node) {
    if (node == undefined) return;
    if (node.type != 'bucket') return;
    jQuery.ajax({
        url: '/api/forge/oss/buckets',
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ 'bucketKey': node.id }),
        success: function (res) {
            $('#appBuckets').jstree(true).refresh();
        },
    });
}

function deleteManifest() {
    var node = $('#appBuckets').jstree(true).get_selected(true)[0];
    if (node == undefined) return;
    if (node.type != 'object') return;
    jQuery.ajax({
        url: '/api/forge/modelderivative/manifest',
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ 'objectName': node.id }),
        success: function (res) {
        },
    });
}

// delete object

function deleteObject(node) {
    if (node == undefined) return;
    if (node.type != 'object') return;
    var bucketKey = node.parents[0];
    var objectKey = node.id;
    jQuery.ajax({
        url: '/api/forge/oss/objects',
        type: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ 'bucketKey': bucketKey, 'objectName': objectKey }),
        success: function (res) {
            $('#appBuckets').jstree(true).refresh_node(node.parent);
        },
    });
}


function prepareUserHubsTree() {
    var haveBIM360Hub = false;
    $('#userHubs').jstree({
        'core': {
            'themes': { "icons": true },
            'multiple': false,
            'data': {
                "url": '/api/forge/datamanagement',
                "dataType": "json",
                'cache': false,
                'data': function (node) {
                    $('#userHubs').jstree(true).toggle_node(node);
                    return { "id": node.id };
                },
                "success": function (nodes) {
                    nodes.forEach(function (n) {
                        if (n.type === 'bim360Hubs' && n.id.indexOf('b.') > 0)
                            haveBIM360Hub = true;
                    });

                    if (!haveBIM360Hub) {
                        $("#provisionAccountModal").modal();
                        haveBIM360Hub = true;
                    }
                }
            }
        },
        'types': {
            'default': {
                'icon': 'glyphicon glyphicon-question-sign'
            },
            '#': {
                'icon': 'glyphicon glyphicon-user'
            },
            'hubs': {
                'icon': 'https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/raw/master/img/a360hub.png'
            },
            'personalHub': {
                'icon': 'https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/raw/master/img/a360hub.png'
            },
            'bim360Hubs': {
                'icon': 'https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/raw/master/img/bim360hub.png'
            },
            'bim360projects': {
                'icon': 'https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/raw/master/img/bim360project.png'
            },
            'a360projects': {
                'icon': 'https://github.com/Autodesk-Forge/learn.forge.viewhubmodels/raw/master/img/a360project.png'
            },
            'items': {
                'icon': 'glyphicon glyphicon-file'
            },
            'bim360documents': {
                'icon': 'glyphicon glyphicon-file'
            },
            'folders': {
                'icon': 'glyphicon glyphicon-folder-open'
            },
            'versions': {
                'icon': 'glyphicon glyphicon-time'
            },
            'unsupported': {
                'icon': 'glyphicon glyphicon-ban-circle'
            }
        },
        "sort": function (a, b) {
            var a1 = this.get_node(a);
            var b1 = this.get_node(b);
            var parent = this.get_node(a1.parent);
            if (parent.type === 'items') {
                var id1 = Number.parseInt(a1.text.substring(a1.text.indexOf('v') + 1, a1.text.indexOf(':')))
                var id2 = Number.parseInt(b1.text.substring(b1.text.indexOf('v') + 1, b1.text.indexOf(':')));
                return id1 > id2 ? 1 : -1;
            }
            else return a1.text > b1.text ? 1 : -1;
        },
        "plugins": ["types", "state", "sort"],
        "state": { "key": "autodeskHubs" }// key restore tree state
    }).bind("activate_node.jstree", function (evt, data) {
        if (data != null && data.node != null && (data.node.type == 'versions' || data.node.type == 'bim360documents')) {
            var urn;
            var viewableId
            if (data.node.id.indexOf('|') > -1) {
                urn = data.node.id.split('|')[1];
                viewableId = data.node.id.split('|')[2];
                launchViewer(urn, viewableId);
            }
            else {
                launchViewer(data.node.id);
            }
        }
    });
}


function showUser() {
    jQuery.ajax({
        url: '/api/forge/user/profile',
        success: function (profile) {
            var img = '<img src="' + profile.picture + '" height="30px">';
            $('#userInfo').html(img + profile.name);
        }
    });
}

