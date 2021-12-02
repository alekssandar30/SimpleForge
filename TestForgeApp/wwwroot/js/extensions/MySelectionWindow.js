function MySelectionWindow(viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    //Forge Viewer
    var _viewer = this.viewer;
    //bounding sphere of this model
    var _boundingSphere = null;
    //container DIV of the viewer
    var _container = _viewer.canvas.parentElement;
    //start point of select window
    var _mouseStart = new THREE.Vector3(0, 0, -10);
    //end point of select window
    var _mouseEnd = new THREE.Vector3(0, 0, -10);
    //is selecting window running
    var _running = false;
    //rectangle lines of select window
    var _lineGeom = null;
    var _rectGroup = null;
    //material for rectangle lines of select window
    var _materialLine = null;

    //when extension is loaded
    this.load = function () {
        console.log('MySelectionWindow is loaded!');
        //bind keyup event
        $(document).bind('keyup', onKeyUp);
        _viewer.impl.invalidate(true);
        return true;
    };

    //when extension is unloaded 
    this.unload = function () {
        console.log('MySelectionWindow is now unloaded!');
        //unbind keyup event
        $(document).unbind('keyup', this.onKeyUp);
        return true;
    };

    //onToolbarCreated() {
    //    let toolbar = this.viewer.toolbar;

    //    this.selectionBox = new Autodesk.Viewing.UI.Button('window-selection-button');
    //    this.selectionBox.setDisplay('Box');

    //    this.selectionBox.addClass('window-selection-button');
    //    this.selectionBox.setToolTip('Window selection');

    //    this.selectionBox.onClick = (e) => {

    //    }

    //}

    //build boundingbox info of each fragments
    this.init = function () {

        var model = _viewer.model;
        var instanceTree = model.getInstanceTree();

        //get bounding sphere of  whole model
        _boundingSphere = model.getBoundingBox().getBoundingSphere();

        //fragments list array
        var fragList = model.getFragmentList();
        //boxes array 
        var boxes = fragList.fragments.boxes;
        //map from frag to dbid
        var fragid2dbid = fragList.fragments.fragId2dbId;

        //build _boundingBoxInfo by the data of Viewer directly
        //might probably be a bit slow with large model..
        _boundingBoxInfo = [];
        var index = 0;
        for (var step = 0; step < fragid2dbid.length; step++) {
            index = step * 6;
            var thisBox = new THREE.Box3(new THREE.Vector3(boxes[index], boxes[index + 1], boxes[index + 2]),
                new THREE.Vector3(boxes[index + 3], boxes[index + 4], boxes[index + 5]));


            _boundingBoxInfo.push({ bbox: thisBox, dbId: fragid2dbid[step] });
        }

        //create a material for the selection rectangle
        _materialLine = new THREE.LineBasicMaterial({
            color: new THREE.Color(0xFF00FF),
            linewidth: 1,
            opacity: .6
        });
    }

    //when key up
    function onKeyUp(evt) {
        console.log('onKeyUp:' + evt.keyCode);

        //when key 'S' is pressed
        if (evt.keyCode == 83) {

            //lock navigation to fix the camera
            _viewer.navigation.setIsLocked(true);

            //start to monitor mouse down
            _container.addEventListener('mousedown', onMouseDown);

            //get current camera
            var canvas = _viewer.canvas;
            var canvasWidth = canvas.clientWidth;
            var canvasHeight = canvas.clientHeight;

            var camera = new THREE.OrthographicCamera(
                0, canvasWidth, 0, canvasHeight, 1, 1000)

            //create overlay scene for selection window
            _viewer.impl.createOverlayScene(
                "selectionWindowOverlay",
                _materialLine,
                _materialLine,
                camera);
        }

        //when key 'Q' is pressed
        if (evt.keyCode == 81) {

            //unlock current navigation
            _viewer.navigation.setIsLocked(false);

            //remove mouse events
            _container.removeEventListener('mouseup', onMouseUp);
            _container.removeEventListener('mousemove', onMouseMove);

            _running = false;

            //remove the Overlay Scene
            _viewer.impl.removeOverlayScene(
                "selectionWindowOverlay");
        }

        return true;
    }

    function onMouseMove(evt) {

        //var viewport = _viewer.impl.clientToViewport(evt.clientX, evt.clientY); 

        if (_running) {
            //calculate the offset with viewer container position, for Three.js geometry
            const viewer_pos = _viewer.container.getBoundingClientRect();
            //get mouse points
            _mouseEnd.x = evt.clientX - viewer_pos.x;
            _mouseEnd.y = evt.clientY - viewer_pos.y;


            //update rectange lines
            _lineGeom.vertices[1].x = _mouseStart.x;
            _lineGeom.vertices[1].y = _mouseEnd.y;
            _lineGeom.vertices[2] = _mouseEnd.clone();
            _lineGeom.vertices[3].x = _mouseEnd.x;
            _lineGeom.vertices[3].y = _mouseStart.y;
            _lineGeom.vertices[4] = _lineGeom.vertices[0];

            _lineGeom.verticesNeedUpdate = true;
            _viewer.impl.invalidate(false, false, true);
        }
    }

    function onMouseUp(evt) {


        if (_running) {
            //calculate the offset with viewer container position, for Three.js geometry
            const viewer_pos = _viewer.container.getBoundingClientRect();

            //get mouse points 
            _mouseEnd.x = evt.clientX - viewer_pos.x;
            _mouseEnd.y = evt.clientY - viewer_pos.y;

            //remove the overlay of one time rectangle
            _viewer.impl.removeOverlay("selectionWindowOverlay", _rectGroup);
            _running = false;

            //remove mouse event
            _container.removeEventListener('mouseup', onMouseUp);
            _container.removeEventListener('mousemove', onMouseMove);

            //get box within the area of select window, or partially intersected. 
            //now we need to offset the screenpoint back without viewer container position.
            var ids = compute({
                clientX: _mouseStart.x + viewer_pos.x,
                clientY: _mouseStart.y + viewer_pos.y
            },
                {
                    clientX: _mouseEnd.x + viewer_pos.x,
                    clientY: _mouseEnd.y + viewer_pos.y
                },
                false); // true:  partially intersected.  false: inside the area only

            //highlight the selected objects
            _viewer.select(ids);
        }
    }

    function onMouseDown(evt) {

        _viewer.clearSelection();

        //calculate the offset with viewer container position, for Three.js geometry
        const viewer_pos = _viewer.container.getBoundingClientRect();
        //get mouse points  
        _mouseStart.x = evt.clientX - viewer_pos.x;
        _mouseStart.y = evt.clientY - viewer_pos.y;
        _running = true;

        //build the rectangle lines of select window
        if (_rectGroup === null) {
            _lineGeom = new THREE.Geometry();

            _lineGeom.vertices.push(
                _mouseStart.clone(),
                _mouseStart.clone(),
                _mouseStart.clone(),
                _mouseStart.clone(),
                _mouseStart.clone());

            // add geom to group
            var line_mesh = new THREE.Line(_lineGeom, _materialLine, THREE.LineStrip);

            _rectGroup = new THREE.Group();
            _rectGroup.add(line_mesh);
        }
        else {
            _lineGeom.vertices[0] = _mouseStart.clone();
            _lineGeom.vertices[1] = _mouseStart.clone();
            _lineGeom.vertices[2] = _mouseStart.clone();
            _lineGeom.vertices[3] = _mouseStart.clone();
            _lineGeom.vertices[4] = _mouseStart.clone();

            _lineGeom.verticesNeedUpdate = true;
        }

        _viewer.impl.addOverlay("selectionWindowOverlay", _rectGroup);
        _viewer.impl.invalidate(false, false, true);

        //start to mornitor the mouse events
        _container.addEventListener('mouseup', onMouseUp);
        _container.addEventListener('mousemove', onMouseMove);
    }

    //prepare the range of select window and filter out those objects
    function compute(pointer1, pointer2, partialSelect) {

        // build 4 rays to project the 4 corners
        // of the selection window

        var xMin = Math.min(pointer1.clientX, pointer2.clientX)
        var xMax = Math.max(pointer1.clientX, pointer2.clientX)

        var yMin = Math.min(pointer1.clientY, pointer2.clientY)
        var yMax = Math.max(pointer1.clientY, pointer2.clientY)

        var ray1 = pointerToRay({
            clientX: xMin,
            clientY: yMin
        })

        var ray2 = pointerToRay({
            clientX: xMax,
            clientY: yMin
        })

        var ray3 = pointerToRay({
            clientX: xMax,
            clientY: yMax
        })

        var ray4 = pointerToRay({
            clientX: xMin,
            clientY: yMax
        })

        // first we compute the top of the pyramid
        var top = new THREE.Vector3(0, 0, 0)

        top.add(ray1.origin)
        top.add(ray2.origin)
        top.add(ray3.origin)
        top.add(ray4.origin)

        top.multiplyScalar(0.25)

        // we use the bounding sphere to determine
        // the height of the pyramid
        var { center, radius } = _boundingSphere

        // compute distance from pyramid top to center
        // of bounding sphere

        var dist = new THREE.Vector3(
            top.x - center.x,
            top.y - center.y,
            top.z - center.z)

        // compute height of the pyramid:
        // to make sure we go far enough,
        // we add the radius of the bounding sphere

        var height = radius + dist.length()

        // compute the length of the side edges

        var angle = ray1.direction.angleTo(
            ray2.direction)

        var length = height / Math.cos(angle * 0.5)

        // compute bottom vertices

        var v1 = new THREE.Vector3(
            ray1.origin.x + ray1.direction.x * length,
            ray1.origin.y + ray1.direction.y * length,
            ray1.origin.z + ray1.direction.z * length)

        var v2 = new THREE.Vector3(
            ray2.origin.x + ray2.direction.x * length,
            ray2.origin.y + ray2.direction.y * length,
            ray2.origin.z + ray2.direction.z * length)

        var v3 = new THREE.Vector3(
            ray3.origin.x + ray3.direction.x * length,
            ray3.origin.y + ray3.direction.y * length,
            ray3.origin.z + ray3.direction.z * length)

        var v4 = new THREE.Vector3(
            ray4.origin.x + ray4.direction.x * length,
            ray4.origin.y + ray4.direction.y * length,
            ray4.origin.z + ray4.direction.z * length)

        // create planes

        var plane1 = new THREE.Plane()
        var plane2 = new THREE.Plane()
        var plane3 = new THREE.Plane()
        var plane4 = new THREE.Plane()
        var plane5 = new THREE.Plane()

        plane1.setFromCoplanarPoints(top, v1, v2)
        plane2.setFromCoplanarPoints(top, v2, v3)
        plane3.setFromCoplanarPoints(top, v3, v4)
        plane4.setFromCoplanarPoints(top, v4, v1)
        plane5.setFromCoplanarPoints(v3, v2, v1)

        var planes = [
            plane1,
            plane2,
            plane3,
            plane4,
            plane5
        ]

        var vertices = [
            v1, v2, v3, v4, top
        ]

        // filter all bounding boxes to determine
        // if inside, outside or intersect

        var result = filterBoundingBoxes(
            planes, vertices, partialSelect)

        // all inside bboxes need to be part of the selection

        var dbIdsInside = result.inside.map((bboxInfo) => {

            return bboxInfo.dbId
        })

        // if partialSelect = true
        // we need to return the intersect bboxes

        if (partialSelect) {

            var dbIdsIntersect = result.intersect.map((bboxInfo) => {

                return bboxInfo.dbId
            })


            return [...dbIdsInside, ...dbIdsIntersect]
        }

        return dbIdsInside
    }

    //rays of the corners of select window
    function pointerToRay(pointer) {

        var camera = _viewer.navigation.getCamera();
        var pointerVector = new THREE.Vector3()
        var rayCaster = new THREE.Raycaster()
        var pointerDir = new THREE.Vector3()
        var domElement = _viewer.canvas

        var rect = domElement.getBoundingClientRect()

        var x = ((pointer.clientX - rect.left) / rect.width) * 2 - 1
        var y = -((pointer.clientY - rect.top) / rect.height) * 2 + 1

        if (camera.isPerspective) {

            pointerVector.set(x, y, 0.5)

            pointerVector.unproject(camera)

            rayCaster.set(camera.position,
                pointerVector.sub(
                    camera.position).normalize())

        } else {

            pointerVector.set(x, y, -15)

            pointerVector.unproject(camera)

            pointerDir.set(0, 0, -1)

            rayCaster.set(pointerVector,
                pointerDir.transformDirection(
                    camera.matrixWorld))
        }

        return rayCaster.ray
    }

    //filter out those objects in the range of select window
    function filterBoundingBoxes(planes, vertices, partialSelect) {

        var intersect = []
        var outside = []
        var inside = []

        var triangles = [
            { a: vertices[0], b: vertices[1], c: vertices[2] },
            { a: vertices[0], b: vertices[2], c: vertices[3] },
            { a: vertices[1], b: vertices[0], c: vertices[4] },
            { a: vertices[2], b: vertices[1], c: vertices[4] },
            { a: vertices[3], b: vertices[2], c: vertices[4] },
            { a: vertices[0], b: vertices[3], c: vertices[4] }
        ]

        for (let bboxInfo of _boundingBoxInfo) {

            // if bounding box inside, then we can be sure
            // the mesh is inside too

            if (containsBox(planes, bboxInfo.bbox)) {
                inside.push(bboxInfo)
            } else if (partialSelect) {

                //reconstructed by using AABBCollision lib.
                if (boxIntersectVertex(bboxInfo.bbox, triangles))
                    intersect.push(bboxInfo)
                else
                    outside.push(bboxInfo)

            } else {
                outside.push(bboxInfo)
            }
        }

        return {
            intersect,
            outside,
            inside
        }
    }


    //get those boxes which are included in the
    //range of select window
    function containsBox(planes, box) {

        var { min, max } = box

        var vertices = [
            new THREE.Vector3(min.x, min.y, min.z),
            new THREE.Vector3(min.x, min.y, max.z),
            new THREE.Vector3(min.x, max.y, max.z),
            new THREE.Vector3(max.x, max.y, max.z),
            new THREE.Vector3(max.x, max.y, min.z),
            new THREE.Vector3(max.x, min.y, min.z),
            new THREE.Vector3(min.x, max.y, min.z),
            new THREE.Vector3(max.x, min.y, max.z)
        ]

        for (let vertex of vertices) {

            for (let plane of planes) {

                if (plane.distanceToPoint(vertex) < 0) {

                    return false
                }
            }
        }

        return true
    }

    //get those boxes which are initersected with the
    //range of select window (triangles)
    function boxIntersectVertex(box, triangles) {
        for (index in triangles) {
            var t = triangles[index];
            if (collision.isIntersectionTriangleAABB(t.a, t.b, t.c, box))
                return true;
        }
        return false;
    }

}

MySelectionWindow.prototype = Object.create(Autodesk.Viewing.Extension.prototype);
MySelectionWindow.prototype.constructor = MySelectionWindow;

Autodesk.Viewing.theExtensionManager.registerExtension('MySelectionWindow', MySelectionWindow);