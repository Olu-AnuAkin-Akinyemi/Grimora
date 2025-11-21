No 4) only change the math color of the Hall Sigils. 

and bring down the brightness of each sigil(Be sure to implement optimization for THREE.js, here is some info:

Aligning HTML Elements to 3D
This article is part of a series of articles about three.js. The first article is three.js fundamentals. If you haven't read that yet and you're new to three.js you might want to consider starting there.

Sometimes you'd like to display some text in your 3D scene. You have many options each with pluses and minuses.

Use 3D text

If you look at the primitives article you'll see TextGeometry which makes 3D text. This might be useful for flying logos but probably not so useful for stats, info, or labelling lots of things.

Use a texture with 2D text drawn into it.

The article on using a Canvas as a texture shows using a canvas as a texture. You can draw text into a canvas and display it as a billboard. The plus here might be that the text is integrated into the 3D scene. For something like a computer terminal shown in a 3D scene this might be perfect.

Use HTML Elements and position them to match the 3D

The benefits to this approach is you can use all of HTML. Your HTML can have multiple elements. It can by styled with CSS. It can also be selected by the user as it is actual text.

This article will cover this last approach.

Let's start simple. We'll make a 3D scene with a few primitives and then add a label to each primitive. We'll start with an example from the article on responsive pages

We'll add some OrbitControls like we did in the article on lighting.

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0, 0);
controls.update();
We need to provide an HTML element to contain our label elements

<body>
  <canvas id="c"></canvas>
  <div id="container">
    <canvas id="c"></canvas>
    <div id="labels"></div>
  </div>
</body>
By putting both the canvas and the <div id="labels"> inside a parent container we can make them overlap with this CSS

#c {
    width: 100%;
    height: 100%;
    width: 100%;  /* let our container decide our size */
    height: 100%;
    display: block;
}
#container {
  position: relative;  /* makes this the origin of its children */
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#labels {
  position: absolute;  /* let us position ourself inside the container */
  left: 0;             /* make our position the top left of the container */
  top: 0;
  color: white;
}
let's also add some CSS for the labels themselves

#labels>div {
  position: absolute;  /* let us position them inside the container */
  left: 0;             /* make their default position the top left of the container */
  top: 0;
  cursor: pointer;     /* change the cursor to a hand when over us */
  font-size: large;
  user-select: none;   /* don't let the text get selected */
  text-shadow:         /* create a black outline */
    -1px -1px 0 #000,
     0   -1px 0 #000,
     1px -1px 0 #000,
     1px  0   0 #000,
     1px  1px 0 #000,
     0    1px 0 #000,
    -1px  1px 0 #000,
    -1px  0   0 #000;
}
#labels>div:hover {
  color: red;
}
Now into our code we don't have to add too much. We had a function makeInstance that we used to generate cubes. Let's make it so it also adds a label element.

const labelContainerElem = document.querySelector('#labels');
 
function makeInstance(geometry, color, x) {
function makeInstance(geometry, color, x, name) {
  const material = new THREE.MeshPhongMaterial({color});
 
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
 
  cube.position.x = x;
 
  const elem = document.createElement('div');
  elem.textContent = name;
  labelContainerElem.appendChild(elem);
 
  return cube;
  return {cube, elem};
}
As you can see we're adding a <div> to the container, one for each cube. We're also returning an object with both the cube and the elem for the label.

Calling it we need to provide a name for each

const cubes = [
  makeInstance(geometry, 0x44aa88,  0),
  makeInstance(geometry, 0x8844aa, -2),
  makeInstance(geometry, 0xaa8844,  2),
  makeInstance(geometry, 0x44aa88,  0, 'Aqua'),
  makeInstance(geometry, 0x8844aa, -2, 'Purple'),
  makeInstance(geometry, 0xaa8844,  2, 'Gold'),
];
What remains is positioning the label elements at render time

const tempV = new THREE.Vector3();
 
...
 
cubes.forEach((cube, ndx) => {
cubes.forEach((cubeInfo, ndx) => {
  const {cube, elem} = cubeInfo;
  const speed = 1 + ndx * .1;
  const rot = time * speed;
  cube.rotation.x = rot;
  cube.rotation.y = rot;
 
  // get the position of the center of the cube
  cube.updateWorldMatrix(true, false);
  cube.getWorldPosition(tempV);
 
  // get the normalized screen coordinate of that position
  // x and y will be in the -1 to +1 range with x = -1 being
  // on the left and y = -1 being on the bottom
  tempV.project(camera);
 
  // convert the normalized position to CSS coordinates
  const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
  const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
 
  // move the elem to that position
  elem.style.transform = 
translate(-50%, -50%) translate(${x}px,${y}px)
;
});
And with that we have labels aligned to their corresponding objects.


click here to open in a separate window
There are a couple of issues we probably want to deal with.

One is that if we rotate the objects so they overlap all the labels overlap as well.


Another is that if we zoom way out so that the objects go outside the frustum the labels will still appear.

A possible solution to the problem of overlapping objects is to use the picking code from the article on picking. We'll pass in the position of the object on the screen and then ask the RayCaster to tell us which objects were intersected. If our object is not the first one then we are not in the front.

const tempV = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
 
...
 
cubes.forEach((cubeInfo, ndx) => {
  const {cube, elem} = cubeInfo;
  const speed = 1 + ndx * .1;
  const rot = time * speed;
  cube.rotation.x = rot;
  cube.rotation.y = rot;
 
  // get the position of the center of the cube
  cube.updateWorldMatrix(true, false);
  cube.getWorldPosition(tempV);
 
  // get the normalized screen coordinate of that position
  // x and y will be in the -1 to +1 range with x = -1 being
  // on the left and y = -1 being on the bottom
  tempV.project(camera);
 
  // ask the raycaster for all the objects that intersect
  // from the eye toward this object's position
  raycaster.setFromCamera(tempV, camera);
  const intersectedObjects = raycaster.intersectObjects(scene.children);
  // We're visible if the first intersection is this object.
  const show = intersectedObjects.length && cube === intersectedObjects[0].object;
 
  if (!show) {
    // hide the label
    elem.style.display = 'none';
  } else {
    // un-hide the label
    elem.style.display = '';
 
    // convert the normalized position to CSS coordinates
    const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
 
    // move the elem to that position
    elem.style.transform = 
translate(-50%, -50%) translate(${x}px,${y}px)
;
  }
});
This handles overlapping.

To handle going outside the frustum we can add this check if the origin of the object is outside the frustum by checking tempV.z

  if (!show) {
  if (!show || Math.abs(tempV.z) > 1) {
    // hide the label
    elem.style.display = 'none';
This kind of works because the normalized coordinates we computed include a z value that goes from -1 when at the near part of our camera frustum to +1 when at the far part of our camera frustum.


click here to open in a separate window
For the frustum check, the solution above fails as we're only checking the origin of the object. For a large object. That origin might go outside the frustum but half of the object might still be in the frustum.

A more correct solution would be to check if the object itself is in the frustum or not. Unfortunate that check is slow. For 3 cubes it will not be a problem but for many objects it might be.

Three.js provides some functions to check if an object's bounding sphere is in a frustum

// at init time
const frustum = new THREE.Frustum();
const viewProjection = new THREE.Matrix4();
 
...
 
// before checking
camera.updateMatrix();
camera.updateMatrixWorld();
camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
 
...
 
// then for each mesh
someMesh.updateMatrix();
someMesh.updateMatrixWorld();
 
viewProjection.multiplyMatrices(
    camera.projectionMatrix, camera.matrixWorldInverse);
frustum.setFromProjectionMatrix(viewProjection);
const inFrustum = frustum.contains(someMesh));
Our current overlapping solution has similar issues. Picking is slow. We could use gpu based picking like we covered in the picking article but that is also not free. Which solution you chose depends on your needs.

Another issue is the order the labels appear. If we change the code to have longer labels

const cubes = [
  makeInstance(geometry, 0x44aa88,  0, 'Aqua'),
  makeInstance(geometry, 0x8844aa, -2, 'Purple'),
  makeInstance(geometry, 0xaa8844,  2, 'Gold'),
  makeInstance(geometry, 0x44aa88,  0, 'Aqua Colored Box'),
  makeInstance(geometry, 0x8844aa, -2, 'Purple Colored Box'),
  makeInstance(geometry, 0xaa8844,  2, 'Gold Colored Box'),
];
and set the CSS so these don't wrap

#labels>div {
  white-space: nowrap;
Then we can run into this issue


You can see above the purple box is in the back but its label is in front of the aqua box.

We can fix this by setting the zIndex of each element. The projected position has a z value that goes from -1 in front to positive 1 in back. zIndex is required to be an integer and goes the opposite direction meaning for zIndex greater values are in front so the following code should work.

// convert the normalized position to CSS coordinates
const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
 
// move the elem to that position
elem.style.transform = 
translate(-50%, -50%) translate(${x}px,${y}px)
;
 
// set the zIndex for sorting
elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
Because of the way the projected z value works we need to pick a large number to spread out the values otherwise many will have the same value. To make sure the labels don't overlap with other parts of the page we can tell the browser to create a new stacking context by setting the z-index of the container of the labels

#labels {
  position: absolute;  /* let us position ourself inside the container */
  z-index: 0;          /* make a new stacking context so children don't sort with rest of page */
  left: 0;             /* make our position the top left of the container */
  top: 0;
  color: white;
  z-index: 0;
}
and now the labels should always be in the correct order.


click here to open in a separate window
While we're at it let's do one more example to show one more issue. Let's draw a globe like Google Maps and label the countries.

I found this data which contains the borders of countries. It's licensed as CC-BY-SA.

I wrote some code to load the data, and generate country outlines and some JSON data with the names of the countries and their locations.


The JSON data is an array of entries something like this

[
  {
    "name": "Algeria",
    "min": [
      -8.667223,
      18.976387
    ],
    "max": [
      11.986475,
      37.091385
    ],
    "area": 238174,
    "lat": 28.163,
    "lon": 2.632,
    "population": {
      "2005": 32854159
    }
  },
  ...
where min, max, lat, lon, are all in latitude and longitude degrees.

Let's load it up. The code is based on the examples from optimizing lots of objects though we are not drawing lots of objects we'll be using the same solutions for rendering on demand.

The first thing is to make a sphere and use the outline texture.

{
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/data/world/country-outlines-4k.png', render);
  const geometry = new THREE.SphereGeometry(1, 64, 32);
  const material = new THREE.MeshBasicMaterial({map: texture});
  scene.add(new THREE.Mesh(geometry, material));
}
Then let's load the JSON file by first making a loader

async function loadJSON(url) {
  const req = await fetch(url);
  return req.json();
}
and then calling it

let countryInfos;
async function loadCountryData() {
  countryInfos = await loadJSON('resources/data/world/country-info.json');
     ...
  }
  requestRenderIfNotRequested();
}
loadCountryData();
Now let's use that data to generate and place the labels.

In the article on optimizing lots of objects we had setup a small scene graph of helper objects to make it easy to compute latitude and longitude positions on our globe. See that article for an explanation of how they work.

const lonFudge = Math.PI * 1.5;
const latFudge = Math.PI;
// these helpers will make it easy to position the boxes
// We can rotate the lon helper on its Y axis to the longitude
const lonHelper = new THREE.Object3D();
// We rotate the latHelper on its X axis to the latitude
const latHelper = new THREE.Object3D();
lonHelper.add(latHelper);
// The position helper moves the object to the edge of the sphere
const positionHelper = new THREE.Object3D();
positionHelper.position.z = 1;
latHelper.add(positionHelper);
We'll use that to compute a position for each label

const labelParentElem = document.querySelector('#labels');
for (const countryInfo of countryInfos) {
  const {lat, lon, name} = countryInfo;
 
  // adjust the helpers to point to the latitude and longitude
  lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
  latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;
 
  // get the position of the lat/lon
  positionHelper.updateWorldMatrix(true, false);
  const position = new THREE.Vector3();
  positionHelper.getWorldPosition(position);
  countryInfo.position = position;
 
  // add an element for each country
  const elem = document.createElement('div');
  elem.textContent = name;
  labelParentElem.appendChild(elem);
  countryInfo.elem = elem;
The code above looks very similar to the code we wrote for making cube labels making an element per label. When we're done we have an array, countryInfos, with one entry for each country to which we've added an elem property for the label element for that country and a position with its position on the globe.

Just like we did for the cubes we need to update the position of the labels and render time.

const tempV = new THREE.Vector3();
 
function updateLabels() {
  // exit if we have not yet loaded the JSON file
  if (!countryInfos) {
    return;
  }
 
  for (const countryInfo of countryInfos) {
    const {position, elem} = countryInfo;
 
    // get the normalized screen coordinate of that position
    // x and y will be in the -1 to +1 range with x = -1 being
    // on the left and y = -1 being on the bottom
    tempV.copy(position);
    tempV.project(camera);
 
    // convert the normalized position to CSS coordinates
    const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
 
    // move the elem to that position
    elem.style.transform = 
translate(-50%, -50%) translate(${x}px,${y}px)
;
 
    // set the zIndex for sorting
    elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
  }
}
You can see the code above is substantially similar to the cube example before. The only major difference is we pre-computed the label positions at init time. We can do this because the globe never moves. Only our camera moves.

Lastly we need to call updateLabels in our render loop

function render() {
  renderRequested = false;
 
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
 
  controls.update();
 
  updateLabels();
 
  renderer.render(scene, camera);
}
And this is what we get


click here to open in a separate window
That is way too many labels!

We have 2 problems.

Labels facing away from us are showing up.

There are too many labels.

For issue #1 we can't really use the RayCaster like we did above as there is nothing to intersect except the sphere. Instead what we can do is check if that particular country is facing away from us or not. This works because the label positions are around a sphere. In fact we're using a unit sphere, a sphere with a radius of 1.0. That means the positions are already unit directions making the math relatively easy.

const tempV = new THREE.Vector3();
const cameraToPoint = new THREE.Vector3();
const cameraPosition = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();
 
function updateLabels() {
  // exit if we have not yet loaded the JSON file
  if (!countryInfos) {
    return;
  }
 
  const minVisibleDot = 0.2;
  // get a matrix that represents a relative orientation of the camera
  normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
  // get the camera's position
  camera.getWorldPosition(cameraPosition);
  for (const countryInfo of countryInfos) {
    const {position, elem} = countryInfo;
 
    // Orient the position based on the camera's orientation.
    // Since the sphere is at the origin and the sphere is a unit sphere
    // this gives us a camera relative direction vector for the position.
    tempV.copy(position);
    tempV.applyMatrix3(normalMatrix);
 
    // compute the direction to this position from the camera
    cameraToPoint.copy(position);
    cameraToPoint.applyMatrix4(camera.matrixWorldInverse).normalize();
 
    // get the dot product of camera relative direction to this position
    // on the globe with the direction from the camera to that point.
    // 1 = facing directly towards the camera
    // 0 = exactly on tangent of the sphere from the camera
    // < 0 = facing away
    const dot = tempV.dot(cameraToPoint);
 
    // if the orientation is not facing us hide it.
    if (dot < minVisibleDot) {
      elem.style.display = 'none';
      continue;
    }
 
    // restore the element to its default display style
    elem.style.display = '';
 
    // get the normalized screen coordinate of that position
    // x and y will be in the -1 to +1 range with x = -1 being
    // on the left and y = -1 being on the bottom
    tempV.copy(position);
    tempV.project(camera);
 
    // convert the normalized position to CSS coordinates
    const x = (tempV.x *  .5 + .5) * canvas.clientWidth;
    const y = (tempV.y * -.5 + .5) * canvas.clientHeight;
 
    // move the elem to that position
    countryInfo.elem.style.transform = 
translate(-50%, -50%) translate(${x}px,${y}px)
;
 
    // set the zIndex for sorting
    elem.style.zIndex = (-tempV.z * .5 + .5) * 100000 | 0;
  }
}
Above we use the positions as a direction and get that direction relative to the camera. Then we get the camera relative direction from the camera to that position on the globe and take the dot product. The dot product returns the cosine of the angle between the to vectors. This gives us a value from -1 to +1 where -1 means the label is facing the camera, 0 means the label is directly on the edge of the sphere relative to the camera, and anything greater than zero is behind. We then use that value to show or hide the element.

17.188733853924695
In the diagram above we can see the dot product of the direction the label is facing to direction from the camera to that position. If you rotate the direction you'll see the dot product is -1.0 when the direction is directly facing the camera, it's 0.0 when exactly on the tangent of the sphere relative to the camera or to put it another way it's 0 when the 2 vectors are perpendicular to each other, 90 degrees It's greater than zero with the label is behind the sphere.

For issue #2, too many labels we need some way to decide which labels to show. One way would be to only show labels for large countries. The data we're loading contains min and max values for the area a country covers. From that we can compute an area and then use that area to decide whether or not to display the country.

At init time let's compute the area

const labelParentElem = document.querySelector('#labels');
for (const countryInfo of countryInfos) {
  const {lat, lon, min, max, name} = countryInfo;
 
  // adjust the helpers to point to the latitude and longitude
  lonHelper.rotation.y = THREE.MathUtils.degToRad(lon) + lonFudge;
  latHelper.rotation.x = THREE.MathUtils.degToRad(lat) + latFudge;
 
  // get the position of the lat/lon
  positionHelper.updateWorldMatrix(true, false);
  const position = new THREE.Vector3();
  positionHelper.getWorldPosition(position);
  countryInfo.position = position;
 
  // compute the area for each country
  const width = max[0] - min[0];
  const height = max[1] - min[1];
  const area = width * height;
  countryInfo.area = area;
 
  // add an element for each country
  const elem = document.createElement('div');
  elem.textContent = name;
  labelParentElem.appendChild(elem);
  countryInfo.elem = elem;
}
Then at render time let's use the area to decide to display the label or not

const large = 20 * 20;
const maxVisibleDot = 0.2;
// get a matrix that represents a relative orientation of the camera
normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
// get the camera's position
camera.getWorldPosition(cameraPosition);
for (const countryInfo of countryInfos) {
  const {position, elem} = countryInfo;
  const {position, elem, area} = countryInfo;
  // large enough?
  if (area < large) {
    elem.style.display = 'none';
    continue;
  }
 
  ...
Finally, since I'm not sure what good values are for these settings lets add a GUI so we can play with them

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
const settings = {
  minArea: 20,
  maxVisibleDot: -0.2,
};
const gui = new GUI({width: 300});
gui.add(settings, 'minArea', 0, 50).onChange(requestRenderIfNotRequested);
gui.add(settings, 'maxVisibleDot', -1, 1, 0.01).onChange(requestRenderIfNotRequested);
 
function updateLabels() {
  if (!countryInfos) {
    return;
  }
 
  const large = 20 * 20;
  const maxVisibleDot = -0.2;
  const large = settings.minArea * settings.minArea;
  // get a matrix that represents a relative orientation of the camera
  normalMatrix.getNormalMatrix(camera.matrixWorldInverse);
  // get the camera's position
  camera.getWorldPosition(cameraPosition);
  for (const countryInfo of countryInfos) {
 
    ...
 
    // if the orientation is not facing us hide it.
    if (dot > maxVisibleDot) {
    if (dot > settings.maxVisibleDot) {
      elem.style.display = 'none';
      continue;
    }
and here's the result


click here to open in a separate window
You can see as you rotate the earth labels that go behind disappear. Adjust the minVisibleDot to see the cutoff change. You can also adjust the minArea value to see larger or smaller countries appear.

The more I worked on this the more I realized just how much work is put into Google Maps. They have also have to decide which labels to show. I'm pretty sure they use all kinds of criteria. For example your current location, your default language setting, your account settings if you have an account, they probably use population or popularity, they might give priority to the countries in the center of the view, etc ... Lots to think about.

_-Optimize Lots of Objects
This article is part of a series of articles about three.js. The first article is three.js fundamentals. If you haven't read that yet and you're new to three.js you might want to consider starting there.

There are many ways to optimize things for three.js. One way is often referred to as merging geometry. Every Mesh you create and three.js represents 1 or more requests by the system to draw something. Drawing 2 things has more overhead than drawing 1 even if the results are the same so one way to optimize is to merge meshes.

Let's show an example of when this is a good solution for an issue. Let's re-create the WebGL Globe.

The first thing we need to do is get some data. The WebGL Globe said the data they use comes from SEDAC. Checking out the site I saw there was demographic data in a grid format. I downloaded the data at 60 minute resolution. Then I took a look at the data

It looks like this

 ncols         360
 nrows         145
 xllcorner     -180
 yllcorner     -60
 cellsize      0.99999999999994
 NODATA_value  -9999
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
 9.241768 8.790958 2.095345 -9999 0.05114867 -9999 -9999 -9999 -9999 -999...
 1.287993 0.4395509 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999...
 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 -9999 ...
There's a few lines that are like key/value pairs followed by lines with a value per grid point, one line for each row of data points.

To make sure we understand the data let's try to plot it in 2D.

First some code to load the text file

async function loadFile(url) {
  const res = await fetch(url);
  return res.text();
}
The code above returns a Promise with the contents of the file at url;

Then we need some code to parse the file

function parseData(text) {
  const data = [];
  const settings = {data};
  let max;
  let min;
  // split into lines
  text.split('\n').forEach((line) => {
    // split the line by whitespace
    const parts = line.trim().split(/\s+/);
    if (parts.length === 2) {
      // only 2 parts, must be a key/value pair
      settings[parts[0]] = parseFloat(parts[1]);
    } else if (parts.length > 2) {
      // more than 2 parts, must be data
      const values = parts.map((v) => {
        const value = parseFloat(v);
        if (value === settings.NODATA_value) {
          return undefined;
        }
        max = Math.max(max === undefined ? value : max, value);
        min = Math.min(min === undefined ? value : min, value);
        return value;
      });
      data.push(values);
    }
  });
  return Object.assign(settings, {min, max});
}
The code above returns an object with all the key/value pairs from the file as well as a data property with all the data in one large array and the min and max values found in the data.

Then we need some code to draw that data

function drawData(file) {
  const {min, max, data} = file;
  const range = max - min;
  const ctx = document.querySelector('canvas').getContext('2d');
  // make the canvas the same size as the data
  ctx.canvas.width = ncols;
  ctx.canvas.height = nrows;
  // but display it double size so it's not too small
  ctx.canvas.style.width = px(ncols * 2);
  ctx.canvas.style.height = px(nrows * 2);
  // fill the canvas to dark gray
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // draw each data point
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;
      const hue = 1;
      const saturation = 1;
      const lightness = amount;
      ctx.fillStyle = hsl(hue, saturation, lightness);
      ctx.fillRect(lonNdx, latNdx, 1, 1);
    });
  });
}
 
function px(v) {
  return 
${v | 0}px
;
}
 
function hsl(h, s, l) {
  return 
hsl(${h * 360 | 0},${s * 100 | 0}%,${l * 100 | 0}%)
;
}
And finally gluing it all together

loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(drawData);
Gives us this result


click here to open in a separate window
So that seems to work.

Let's try it in 3D. Starting with the code from rendering on demand We'll make one box per data in the file.

First let's make a simple sphere with a texture of the world. Here's the texture


And the code to set it up.

{
  const loader = new THREE.TextureLoader();
  const texture = loader.load('resources/images/world.jpg', render);
  const geometry = new THREE.SphereGeometry(1, 64, 32);
  const material = new THREE.MeshBasicMaterial({map: texture});
  scene.add(new THREE.Mesh(geometry, material));
}
Notice the call to render when the texture has finished loading. We need this because we're rendering on demand instead of continuously so we need to render once when the texture is loaded.

Then we need to change the code that drew a dot per data point above to instead make a box per data point.

function addBoxes(file) {
  const {min, max, data} = file;
  const range = max - min;
 
  // make one box geometry
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  // make it so it scales away from the positive Z axis
  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.5));
 
  // these helpers will make it easy to position the boxes
  // We can rotate the lon helper on its Y axis to the longitude
  const lonHelper = new THREE.Object3D();
  scene.add(lonHelper);
  // We rotate the latHelper on its X axis to the latitude
  const latHelper = new THREE.Object3D();
  lonHelper.add(latHelper);
  // The position helper moves the object to the edge of the sphere
  const positionHelper = new THREE.Object3D();
  positionHelper.position.z = 1;
  latHelper.add(positionHelper);
 
  const lonFudge = Math.PI * .5;
  const latFudge = Math.PI * -0.135;
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;
      const material = new THREE.MeshBasicMaterial();
      const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
      const saturation = 1;
      const lightness = THREE.MathUtils.lerp(0.1, 1.0, amount);
      material.color.setHSL(hue, saturation, lightness);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
 
      // adjust the helpers to point to the latitude and longitude
      lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
      latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;
 
      // use the world matrix of the position helper to
      // position this mesh.
      positionHelper.updateWorldMatrix(true, false);
      mesh.applyMatrix4(positionHelper.matrixWorld);
 
      mesh.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
    });
  });
}
The code is mostly straight forward from our test drawing code.

We make one box and adjust its center so it scales away from positive Z. If we didn't do this it would scale from the center but we want them to grow away from the origin.

default
adjusted
Of course we could also solve that by parenting the box to more THREE.Object3D objects like we covered in scene graphs but the more nodes we add to a scene graph the slower it gets.

We also setup this small hierarchy of nodes of lonHelper, latHelper, and positionHelper. We use these objects to compute a position around the sphere were to place the box.

0
0
Above the green bar represents lonHelper and is used to rotate toward longitude on the equator. The blue bar represents latHelper which is used to rotate to a latitude above or below the equator. The red sphere represents the offset that that positionHelper provides.

We could do all of the math manually to figure out positions on the globe but doing it this way leaves most of the math to the library itself so we don't need to deal with.

For each data point we create a MeshBasicMaterial and a Mesh and then we ask for the world matrix of the positionHelper and apply that to the new Mesh. Finally we scale the mesh at its new position.

Like above, we could also have created a latHelper, lonHelper, and positionHelper for every new box but that would be even slower.

There are up to 360x145 boxes we're going to create. That's up to 52000 boxes. Because some data points are marked as "NO_DATA" the actual number of boxes we're going to create is around 19000. If we added 3 extra helper objects per box that would be nearly 80000 scene graph nodes that THREE.js would have to compute positions for. By instead using one set of helpers to just position the meshes we save around 60000 operations.

A note about lonFudge and latFudge. lonFudge is π/2 which is a quarter of a turn. That makes sense. It just means the texture or texture coordinates start at a different offset around the globe. latFudge on the other hand I have no idea why it needs to be π * -0.135, that's just an amount that made the boxes line up with the texture.

The last thing we need to do is call our loader

loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(drawData)
  .then(addBoxes)
  .then(render);
Once the data has finished loading and parsing then we need to render at least once since we're rendering on demand.


click here to open in a separate window
If you try to rotate the example above by dragging on the sample you'll likely notice it's slow.

We can check the framerate by opening the devtools and turning on the browser's frame rate meter.


On my machine I see a framerate under 20fps.


That doesn't feel very good to me and I suspect many people have slower machines which would make it even worse. We'd better look into optimizing.

For this particular problem we can merge all the boxes into a single geometry. We're currently drawing around 19000 boxes. By merging them into a single geometry we'd remove 18999 operations.

Here's the new code to merge the boxes into a single geometry.

function addBoxes(file) {
  const {min, max, data} = file;
  const range = max - min;
 
  // make one box geometry
  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
  // make it so it scales away from the positive Z axis
  geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.5));
 
  // these helpers will make it easy to position the boxes
  // We can rotate the lon helper on its Y axis to the longitude
  const lonHelper = new THREE.Object3D();
  scene.add(lonHelper);
  // We rotate the latHelper on its X axis to the latitude
  const latHelper = new THREE.Object3D();
  lonHelper.add(latHelper);
  // The position helper moves the object to the edge of the sphere
  const positionHelper = new THREE.Object3D();
  positionHelper.position.z = 1;
  latHelper.add(positionHelper);
  // Used to move the center of the box so it scales from the position Z axis
  const originHelper = new THREE.Object3D();
  originHelper.position.z = 0.5;
  positionHelper.add(originHelper);
 
  const lonFudge = Math.PI * .5;
  const latFudge = Math.PI * -0.135;
  const geometries = [];
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (value === undefined) {
        return;
      }
      const amount = (value - min) / range;
 
      const material = new THREE.MeshBasicMaterial();
      const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
      const saturation = 1;
      const lightness = THREE.MathUtils.lerp(0.1, 1.0, amount);
      material.color.setHSL(hue, saturation, lightness);
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
 
      const boxWidth = 1;
      const boxHeight = 1;
      const boxDepth = 1;
      const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
 
      // adjust the helpers to point to the latitude and longitude
      lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
      latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;
 
      // use the world matrix of the position helper to
      // position this mesh.
      positionHelper.updateWorldMatrix(true, false);
      mesh.applyMatrix4(positionHelper.matrixWorld);
 
      mesh.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
 
      // use the world matrix of the origin helper to
      // position this geometry
      positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
      originHelper.updateWorldMatrix(true, false);
      geometry.applyMatrix4(originHelper.matrixWorld);
 
      geometries.push(geometry);
    });
  });
 
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(
      geometries, false);
  const material = new THREE.MeshBasicMaterial({color:'red'});
  const mesh = new THREE.Mesh(mergedGeometry, material);
  scene.add(mesh);
 
}
Above we removed the code that was changing the box geometry's center point and are instead doing it by adding an originHelper. Before we were using the same geometry 19000 times. This time we are creating new geometry for every single box and since we are going to use applyMatrix to move the vertices of each box geometry we might as well do it once instead of twice.

At the end we pass an array of all the geometries to BufferGeometryUtils.mergeGeometries which will combined all of them into a single mesh.

We also need to include the BufferGeometryUtils

import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
And now, at least on my machine, I get 60 frames per second


click here to open in a separate window
So that worked but because it's one mesh we only get one material which means we only get one color where as before we had a different color on each box. We can fix that by using vertex colors.

Vertex colors add a color per vertex. By setting all the colors of each vertex of each box to specific colors every box will have a different color.

const color = new THREE.Color();
 
const lonFudge = Math.PI * .5;
const latFudge = Math.PI * -0.135;
const geometries = [];
data.forEach((row, latNdx) => {
  row.forEach((value, lonNdx) => {
    if (value === undefined) {
      return;
    }
    const amount = (value - min) / range;
 
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
 
    // adjust the helpers to point to the latitude and longitude
    lonHelper.rotation.y = THREE.MathUtils.degToRad(lonNdx + file.xllcorner) + lonFudge;
    latHelper.rotation.x = THREE.MathUtils.degToRad(latNdx + file.yllcorner) + latFudge;
 
    // use the world matrix of the origin helper to
    // position this geometry
    positionHelper.scale.set(0.005, 0.005, THREE.MathUtils.lerp(0.01, 0.5, amount));
    originHelper.updateWorldMatrix(true, false);
    geometry.applyMatrix4(originHelper.matrixWorld);
 
    // compute a color
    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
    const saturation = 1;
    const lightness = THREE.MathUtils.lerp(0.4, 1.0, amount);
    color.setHSL(hue, saturation, lightness);
    // get the colors as an array of values from 0 to 255
    const rgb = color.toArray().map(v => v * 255);
 
    // make an array to store colors for each vertex
    const numVerts = geometry.getAttribute('position').count;
    const itemSize = 3;  // r, g, b
    const colors = new Uint8Array(itemSize * numVerts);
 
    // copy the color into the colors array for each vertex
    colors.forEach((v, ndx) => {
      colors[ndx] = rgb[ndx % 3];
    });
 
    const normalized = true;
    const colorAttrib = new THREE.BufferAttribute(colors, itemSize, normalized);
    geometry.setAttribute('color', colorAttrib);
 
    geometries.push(geometry);
  });
});
The code above looks up the number or vertices needed by getting the position attribute from the geometry. We then create a Uint8Array to put the colors in. It then adds that as an attribute by calling geometry.setAttribute.

Lastly we need to tell three.js to use the vertex colors.

const mergedGeometry = BufferGeometryUtils.mergeGeometries(
    geometries, false);
const material = new THREE.MeshBasicMaterial({color:'red'});
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
});
const mesh = new THREE.Mesh(mergedGeometry, material);
scene.add(mesh);
And with that we get our colors back


click here to open in a separate window
Merging geometry is a common optimization technique. For example rather than 100 trees you might merge the trees into 1 geometry, a pile of individual rocks into a single geometry of rocks, a picket fence from individual pickets into one fence mesh. Another example in Minecraft it doesn't likely draw each cube individually but rather creates groups of merged cubes and also selectively removing faces that are never visible.

The problem with making everything one mesh though is it's no longer easy to move any part that was previously separate. Depending on our use case though there are creative solutions. We'll explore one in another article. 

---

Optimize Lots of Objects Animated
This article is a continuation of an article about optimizing lots of objects . If you haven't read that yet please read it before proceeding.

In the previous article we merged around 19000 cubes into a single geometry. This had the advantage that it optimized our drawing of 19000 cubes but it had the disadvantage of make it harder to move any individual cube.

Depending on what we are trying to accomplish there are different solutions. In this case let's graph multiple sets of data and animate between the sets.

The first thing we need to do is get multiple sets of data. Ideally we'd probably pre-process data offline but in this case let's load 2 sets of data and generate 2 more

Here's our old loading code

loadFile('resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc')
  .then(parseData)
  .then(addBoxes)
  .then(render);
Let's change it to something like this

async function loadData(info) {
  const text = await loadFile(info.url);
  info.file = parseData(text);
}
 
async function loadAll() {
  const fileInfos = [
    {name: 'men',   hueRange: [0.7, 0.3], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014mt_2010_cntm_1_deg.asc' },
    {name: 'women', hueRange: [0.9, 1.1], url: 'resources/data/gpw/gpw_v4_basic_demographic_characteristics_rev10_a000_014ft_2010_cntm_1_deg.asc' },
  ];
 
  await Promise.all(fileInfos.map(loadData));
 
  ...
}
loadAll();
The code above will load all the files in fileInfos and when done each object in fileInfos will have a file property with the loaded file. name and hueRange we'll use later. name will be for a UI field. hueRange will be used to choose a range of hues to map over.

The two files above are apparently the number of men per area and the number of women per area as of 2010. Note, I have no idea if this data is correct but it's not important really. The important part is showing different sets of data.

Let's generate 2 more sets of data. One being the places where the number men are greater than the number of women and vice versa, the places where the number of women are greater than the number of men.

The first thing let's write a function that given a 2 dimensional array of arrays like we had before will map over it to generate a new 2 dimensional array of arrays

function mapValues(data, fn) {
  return data.map((row, rowNdx) => {
    return row.map((value, colNdx) => {
      return fn(value, rowNdx, colNdx);
    });
  });
}
Like the normal Array.map function the mapValues function calls a function fn for each value in the array of arrays. It passes it the value and both the row and column indices.

Now let's make some code to generate a new file that is a comparison between 2 files

function makeDiffFile(baseFile, otherFile, compareFn) {
  let min;
  let max;
  const baseData = baseFile.data;
  const otherData = otherFile.data;
  const data = mapValues(baseData, (base, rowNdx, colNdx) => {
    const other = otherData[rowNdx][colNdx];
      if (base === undefined || other === undefined) {
        return undefined;
      }
      const value = compareFn(base, other);
      min = Math.min(min === undefined ? value : min, value);
      max = Math.max(max === undefined ? value : max, value);
      return value;
  });
  // make a copy of baseFile and replace min, max, and data
  // with the new data
  return {...baseFile, min, max, data};
}
The code above uses mapValues to generate a new set of data that is a comparison based on the compareFn function passed in. It also tracks the min and max comparison results. Finally it makes a new file with all the same properties as baseFile except with a new min, max and data.

Then let's use that to make 2 new sets of data

{
  const menInfo = fileInfos[0];
  const womenInfo = fileInfos[1];
  const menFile = menInfo.file;
  const womenFile = womenInfo.file;
 
  function amountGreaterThan(a, b) {
    return Math.max(a - b, 0);
  }
  fileInfos.push({
    name: '>50%men',
    hueRange: [0.6, 1.1],
    file: makeDiffFile(menFile, womenFile, (men, women) => {
      return amountGreaterThan(men, women);
    }),
  });
  fileInfos.push({
    name: '>50% women',
    hueRange: [0.0, 0.4],
    file: makeDiffFile(womenFile, menFile, (women, men) => {
      return amountGreaterThan(women, men);
    }),
  });
}
Now let's generate a UI to select between these sets of data. First we need some UI html

<body>
  <canvas id="c"></canvas>
  <div id="ui"></div>
</body>
and some CSS to make it appear in the top left area

#ui {
  position: absolute;
  left: 1em;
  top: 1em;
}
#ui>div {
  font-size: 20pt;
  padding: 1em;
  display: inline-block;
}
#ui>div.selected {
  color: red;
}
Then we can go over each file and generate a set of merged boxes per set of data and an element which when hovered over will show that set and hide all others.

// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  fileInfos.forEach((info) => {
    const visible = fileInfo === info;
    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
  });
  requestRenderIfNotRequested();
}
 
const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
  const boxes = addBoxes(info.file, info.hueRange);
  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  div.addEventListener('mouseover', () => {
    showFileInfo(fileInfos, info);
  });
});
// show the first set of data
showFileInfo(fileInfos, fileInfos[0]);
The one more change we need from the previous example is we need to make addBoxes take a hueRange

function addBoxes(file) {
function addBoxes(file, hueRange) {
 
  ...
 
    // compute a color
    const hue = THREE.MathUtils.lerp(0.7, 0.3, amount);
    const hue = THREE.MathUtils.lerp(...hueRange, amount);
 
  ...
and with that we should be able to show 4 sets of data. Hover the mouse over the labels or touch them to switch sets


click here to open in a separate window
Note, there are a few strange data points that really stick out. I wonder what's up with those!??! In any case how do we animate between these 4 sets of data.

Lots of ideas.

Just fade between them using Material.opacity

The problem with this solution is the cubes perfectly overlap which means there will be z-fighting issues. It's possible we could fix that by changing the depth function and using blending. We should probably look into it.

Scale up the set we want to see and scale down the other sets

Because all the boxes have their origin at the center of the planet if we scale them below 1.0 they will sink into the planet. At first that sounds like a good idea but the issue is all the low height boxes will disappear almost immediately and not be replaced until the new data set scales up to 1.0. This makes the transition not very pleasant. We could maybe fix that with a fancy custom shader.

Use Morphtargets

Morphtargets are a way were we supply multiple values for each vertex in the geometry and morph or lerp (linear interpolate) between them. Morphtargets are most commonly used for facial animation of 3D characters but that's not their only use.

Let's try morphtargets.

We'll still make a geometry for each set of data but we'll then extract the position attribute from each one and use them as morphtargets.

First let's change addBoxes to just make and return the merged geometry.

function addBoxes(file, hueRange) {
function makeBoxes(file, hueRange) {
  const {min, max, data} = file;
  const range = max - min;
 
  ...
 
  const mergedGeometry = BufferGeometryUtils.mergeGeometries(
      geometries, false);
  const material = new THREE.MeshBasicMaterial({
    vertexColors: true,
  });
  const mesh = new THREE.Mesh(mergedGeometry, material);
  scene.add(mesh);
  return mesh;
  return BufferGeometryUtils.mergeGeometries(
     geometries, false);
}
There's one more thing we need to do here though. Morphtargets are required to all have exactly the same number of vertices. Vertex #123 in one target needs have a corresponding Vertex #123 in all other targets. But, as it is now different data sets might have some data points with no data so no box will be generated for that point which would mean no corresponding vertices for another set. So, we need to check across all data sets and either always generate something if there is data in any set or, generate nothing if there is data missing in any set. Let's do the latter.

function dataMissingInAnySet(fileInfos, latNdx, lonNdx) {
  for (const fileInfo of fileInfos) {
    if (fileInfo.file.data[latNdx][lonNdx] === undefined) {
      return true;
    }
  }
  return false;
}
 
function makeBoxes(file, hueRange) {
function makeBoxes(file, hueRange, fileInfos) {
  const {min, max, data} = file;
  const range = max - min;
 
  ...
 
  const geometries = [];
  data.forEach((row, latNdx) => {
    row.forEach((value, lonNdx) => {
      if (dataMissingInAnySet(fileInfos, latNdx, lonNdx)) {
        return;
      }
      const amount = (value - min) / range;
 
  ...
Now we'll change the code that was calling addBoxes to use makeBoxes and setup morphtargets

// make geometry for each data set
const geometries = fileInfos.map((info) => {
  return makeBoxes(info.file, info.hueRange, fileInfos);
});
 
// use the first geometry as the base
// and add all the geometries as morphtargets
const baseGeometry = geometries[0];
baseGeometry.morphAttributes.position = geometries.map((geometry, ndx) => {
  const attribute = geometry.getAttribute('position');
  const name = 
target${ndx}
;
  attribute.name = name;
  return attribute;
});
baseGeometry.morphAttributes.color = geometries.map((geometry, ndx) => {
  const attribute = geometry.getAttribute('color');
  const name = 
target${ndx}
;
  attribute.name = name;
  return attribute;
});
const material = new THREE.MeshBasicMaterial({
  vertexColors: true,
});
const mesh = new THREE.Mesh(baseGeometry, material);
scene.add(mesh);
 
const uiElem = document.querySelector('#ui');
fileInfos.forEach((info) => {
  const boxes = addBoxes(info.file, info.hueRange);
  info.root = boxes;
  const div = document.createElement('div');
  info.elem = div;
  div.textContent = info.name;
  uiElem.appendChild(div);
  function show() {
    showFileInfo(fileInfos, info);
  }
  div.addEventListener('mouseover', show);
  div.addEventListener('touchstart', show);
});
// show the first set of data
showFileInfo(fileInfos, fileInfos[0]);
Above we make geometry for each data set, use the first one as the base, then get a position attribute from each geometry and add it as a morphtarget to the base geometry for position.

Now we need to change how we're showing and hiding the various data sets. Instead of showing or hiding a mesh we need to change the influence of the morphtargets. For the data set we want to see we need to have an influence of 1 and for all the ones we don't want to see to we need to have an influence of 0.

We could just set them to 0 or 1 directly but if we did that we wouldn't see any animation, it would just snap which would be no different than what we already have. We could also write some custom animation code which would be easy but because the original webgl globe uses an animation library let's use the same one here.

We need to include the library

import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import TWEEN from 'three/addons/libs/tween.module.js';
And then create a Tween to animate the influences.

// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  const targets = {};
  fileInfos.forEach((info) => {
  fileInfos.forEach((info, i) => {
    const visible = fileInfo === info;
    info.root.visible = visible;
    info.elem.className = visible ? 'selected' : '';
    targets[i] = visible ? 1 : 0;
  });
  const durationInMs = 1000;
  new TWEEN.Tween(mesh.morphTargetInfluences)
    .to(targets, durationInMs)
    .start();
  requestRenderIfNotRequested();
}
We're also suppose to call TWEEN.update every frame inside our render loop but that points out a problem. "tween.js" is designed for continuous rendering but we are rendering on demand. We could switch to continuous rendering but it's sometimes nice to only render on demand as it well stop using the user's power when nothing is happening so let's see if we can make it animate on demand.

We'll make a TweenManager to help. We'll use it to create the Tweens and track them. It will have an update method that will return true if we need to call it again and false if all the animations are finished.

class TweenManger {
  constructor() {
    this.numTweensRunning = 0;
  }
  _handleComplete() {
    --this.numTweensRunning;
    console.assert(this.numTweensRunning >= 0);
  }
  createTween(targetObject) {
    const self = this;
    ++this.numTweensRunning;
    let userCompleteFn = () => {};
    // create a new tween and install our own onComplete callback
    const tween = new TWEEN.Tween(targetObject).onComplete(function(...args) {
      self._handleComplete();
      userCompleteFn.call(this, ...args);
    });
    // replace the tween's onComplete function with our own
    // so we can call the user's callback if they supply one.
    tween.onComplete = (fn) => {
      userCompleteFn = fn;
      return tween;
    };
    return tween;
  }
  update() {
    TWEEN.update();
    return this.numTweensRunning > 0;
  }
}
To use it we'll create one

function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
  const tweenManager = new TweenManger();
 
  ...
We'll use it to create our Tweens.

// show the selected data, hide the rest
function showFileInfo(fileInfos, fileInfo) {
  const targets = {};
  fileInfos.forEach((info, i) => {
    const visible = fileInfo === info;
    info.elem.className = visible ? 'selected' : '';
    targets[i] = visible ? 1 : 0;
  });
  const durationInMs = 1000;
  new TWEEN.Tween(mesh.morphTargetInfluences)
  tweenManager.createTween(mesh.morphTargetInfluences)
    .to(targets, durationInMs)
    .start();
  requestRenderIfNotRequested();
}
Then we'll update our render loop to update the tweens and keep rendering if there are still animations running.

function render() {
  renderRequested = false;
 
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
 
  if (tweenManager.update()) {
    requestRenderIfNotRequested();
  }
 
  controls.update();
  renderer.render(scene, camera);
}
render();
And with that we should be animating between data sets.


click here to open in a separate window
I hope going through this was helpful. Using morphtargets is a common technique to move lots of objects. As an example we could give every cube a random place in another target and morph from that to their first positions on the globe. That might be a cool way to introduce the globe.

Next you might be interested in adding labels to a globe which is covered in Aligning HTML Elements to 3D.

Note: We could try to just graph percent of men or percent of women or the raw difference but based on how we are displaying the info, cubes that grow from the surface of the earth, we'd prefer most cubes to be low. If we used one of these other comparisons most cubes would be about 1/2 their maximum height which would not make a good visualization. Feel free to change the amountGreaterThan from Math.max(a - b, 0) to something like (a - b) "raw difference" or a / (a + b) "percent" and you'll see what I mean.
---

OffscreenCanvas
OffscreenCanvas is a relatively new browser feature currently only available in Chrome but apparently coming to other browsers. OffscreenCanvas allows a web worker to render to a canvas. This is a way to offload heavy work, like rendering a complex 3D scene, to a web worker so as not to slow down the responsiveness of the browser. It also means data is loaded and parsed in the worker so possibly less jank while the page loads.

Getting started using it is pretty straight forward. Let's port the 3 spinning cube example from the article on responsiveness.

Workers generally have their code separated into another script file whereas most of the examples on this site have had their scripts embedded into the HTML file of the page they are on.

In our case we'll make a file called offscreencanvas-cubes.js and copy all the JavaScript from the responsive example into it. We'll then make the changes needed for it to run in a worker.

We still need some JavaScript in our HTML file. The first thing we need to do there is look up the canvas and then transfer control of that canvas to be offscreen by calling canvas.transferControlToOffscreen.

function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();
 
  ...
We can then start our worker with new Worker(pathToScript, {type: 'module'}). and pass the offscreen object to it.

function main() {
  const canvas = document.querySelector('#c');
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-cubes.js', {type: 'module'});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
}
main();
It's important to note that workers can't access the DOM. They can't look at HTML elements nor can they receive mouse events or keyboard events. The only thing they can generally do is respond to messages sent to them and send messages back to the page.

To send a message to a worker we call worker.postMessage and pass it 1 or 2 arguments. The first argument is a JavaScript object that will be cloned and sent to the worker. The second argument is an optional array of objects that are part of the first object that we want transferred to the worker. These objects will not be cloned. Instead they will be transferred and will cease to exist in the main page. Cease to exist is the probably the wrong description, rather they are neutered. Only certain types of objects can be transferred instead of cloned. They include OffscreenCanvas so once transferred the offscreen object back in the main page is useless.

Workers receive messages from their onmessage handler. The object we passed to postMessage arrives on event.data passed to the onmessage handler on the worker. The code above declares a type: 'main' in the object it passes to the worker. This object has no meaning to the browser. It's entirely for our own usage. We'll make a handler that based on type calls a different function in the worker. Then we can add functions as needed and easily call them from the main page.

const handlers = {
  main,
};
 
self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (typeof fn !== 'function') {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
You can see above we just look up the handler based on the type pass it the data that was sent from the main page.

So now we just need to start changing the main we pasted into offscreencanvas-cubes.js from the responsive article.

Instead of looking up the canvas from the DOM we'll receive it from the event data.

function main() {
  const canvas = document.querySelector('#c');
function main(data) {
  const {canvas} = data;
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
 
  ...
Remembering that workers can't see the DOM at all the first problem we run into is resizeRendererToDisplaySize can't look at canvas.clientWidth and canvas.clientHeight as those are DOM values. Here's the original code

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
Instead we'll need to send sizes as they change to the worker. So, let's add some global state and keep the width and height there.

const state = {
  width: 300,  // canvas default
  height: 150,  // canvas default
};
Then let's add a 'size' handler to update those values.

function size(data) {
  state.width = data.width;
  state.height = data.height;
}
 
const handlers = {
  main,
  size,
};
Now we can change resizeRendererToDisplaySize to use state.width and state.height

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const width = state.width;
  const height = state.height;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
and where we compute the aspect we need similar changes

function render(time) {
  time *= 0.001;
 
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.aspect = state.width / state.height;
    camera.updateProjectionMatrix();
  }
 
  ...
Back in the main page we'll send a size event anytime the page changes size.

const worker = new Worker('offscreencanvas-picking.js', {type: 'module'});
worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
 
function sendSize() {
  worker.postMessage({
    type: 'size',
    width: canvas.clientWidth,
    height: canvas.clientHeight,
  });
}
 
window.addEventListener('resize', sendSize);
sendSize();
We also call it once to send the initial size.

And with just those few changes, assuming your browser fully supports OffscreenCanvas it should work. Before we run it though let's check if the browser actually supports OffscreenCanvas and if not display an error. First let's add some HTML to display the error.

<body>
  <canvas id="c"></canvas>
  <div id="noOffscreenCanvas" style="display:none;">
    <div>no OffscreenCanvas support</div>
  </div>
</body>
and some CSS for that

#noOffscreenCanvas {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background: red;
    color: white;
}
and then we can check for the existence of transferControlToOffscreen to see if the browser supports OffscreenCanvas

function main() {
  const canvas = document.querySelector('#c');
  if (!canvas.transferControlToOffscreen) {
    canvas.style.display = 'none';
    document.querySelector('#noOffscreenCanvas').style.display = '';
    return;
  }
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-picking.js', {type: 'module});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
 
  ...
and with that, if your browser supports OffscreenCanvas this example should work


click here to open in a separate window
So that's great but since not every browser supports OffscreenCanvas at the moment let's change the code to work with both OffscreenCanvas and if not then fallback to using the canvas in the main page like normal.

As an aside, if you need OffscreenCanvas to make your page responsive then it's not clear what the point of having a fallback is. Maybe based on if you end up running on the main page or in a worker you might adjust the amount of work done so that when running in a worker you can do more than when running in the main page. What you do is really up to you.

The first thing we should probably do is separate out the three.js code from the code that is specific to the worker. That way we can use the same code on both the main page and the worker. In other words we will now have 3 files

our html file.

threejs-offscreencanvas-w-fallback.html

a JavaScript that contains our three.js code.

shared-cubes.js

our worker support code

offscreencanvas-worker-cubes.js

shared-cubes.js and offscreencanvas-worker-cubes.js are basically the split of our previous offscreencanvas-cubes.js file. First we copy all of offscreencanvas-cubes.js to shared-cube.js. Then we rename main to init since we already have a main in our HTML file and we need to export init and state

import * as THREE from 'three';
 
const state = {
export const state = {
  width: 300,   // canvas default
  height: 150,  // canvas default
};
 
function main(data) {
export function init(data) {
  const {canvas} = data;
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
and cut out the just the non three.js relates parts

function size(data) {
  state.width = data.width;
  state.height = data.height;
}
 
const handlers = {
  main,
  size,
};
 
self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (typeof fn !== 'function') {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
Then we copy those parts we just deleted to offscreencanvas-worker-cubes.js and import shared-cubes.js as well as call init instead of main.

import {init, state} from './shared-cubes.js';
 
function size(data) {
  state.width = data.width;
  state.height = data.height;
}
 
const handlers = {
  main,
  init,
  size,
};
 
self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (typeof fn !== 'function') {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
Similarly we need to include shared-cubes.js in the main page

<script type="module">
import {init, state} from './shared-cubes.js';
We can remove the HTML and CSS we added previously

<body>
  <canvas id="c"></canvas>
  <div id="noOffscreenCanvas" style="display:none;">
    <div>no OffscreenCanvas support</div>
  </div>
</body>
and some CSS for that

#noOffscreenCanvas {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    background: red;
    color: white;
}
Then let's change the code in the main page to call one start function or another depending on if the browser supports OffscreenCanvas.

function main() {
  const canvas = document.querySelector('#c');
  if (!canvas.transferControlToOffscreen) {
    canvas.style.display = 'none';
    document.querySelector('#noOffscreenCanvas').style.display = '';
    return;
  }
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-picking.js', {type: 'module'});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
  if (canvas.transferControlToOffscreen) {
    startWorker(canvas);
  } else {
    startMainPage(canvas);
  }
  ...
We'll move all the code we had to setup the worker inside startWorker

function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-cubes.js', {type: 'module'});
  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
 
  function sendSize() {
    worker.postMessage({
      type: 'size',
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  }
 
  window.addEventListener('resize', sendSize);
  sendSize();
 
  console.log('using OffscreenCanvas');
}
and send init instead of main

  worker.postMessage({type: 'main', canvas: offscreen}, [offscreen]);
  worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);
for starting in the main page we can do this

function startMainPage(canvas) {
  init({canvas});
 
  function sendSize() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
  }
  window.addEventListener('resize', sendSize);
  sendSize();
 
  console.log('using regular canvas');
}
and with that our example will run either in an OffscreenCanvas or fallback to running in the main page.


click here to open in a separate window
So that was relatively easy. Let's try picking. We'll take some code from the RayCaster example from the article on picking and make it work offscreen.

Let's copy the shared-cube.js to shared-picking.js and add the picking parts. We copy in the PickHelper

class PickHelper {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.pickedObject = null;
    this.pickedObjectSavedColor = 0;
  }
  pick(normalizedPosition, scene, camera, time) {
    // restore the color if there is a picked object
    if (this.pickedObject) {
      this.pickedObject.material.emissive.setHex(this.pickedObjectSavedColor);
      this.pickedObject = undefined;
    }
 
    // cast a ray through the frustum
    this.raycaster.setFromCamera(normalizedPosition, camera);
    // get the list of objects the ray intersected
    const intersectedObjects = this.raycaster.intersectObjects(scene.children);
    if (intersectedObjects.length) {
      // pick the first object. It's the closest one
      this.pickedObject = intersectedObjects[0].object;
      // save its color
      this.pickedObjectSavedColor = this.pickedObject.material.emissive.getHex();
      // set its emissive color to flashing red/yellow
      this.pickedObject.material.emissive.setHex((time * 8) % 2 > 1 ? 0xFFFF00 : 0xFF0000);
    }
  }
}
 
const pickPosition = {x: 0, y: 0};
const pickHelper = new PickHelper();
We updated pickPosition from the mouse like this

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * canvas.width  / rect.width,
    y: (event.clientY - rect.top ) * canvas.height / rect.height,
  };
}
 
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.width ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.height) * -2 + 1;  // note we flip Y
}
window.addEventListener('mousemove', setPickPosition);
A worker can't read the mouse position directly so just like the size code let's send a message with the mouse position. Like the size code we'll send the mouse position and update pickPosition

function size(data) {
  state.width = data.width;
  state.height = data.height;
}
 
function mouse(data) {
  pickPosition.x = data.x;
  pickPosition.y = data.y;
}
 
const handlers = {
  init,
  mouse,
  size,
};
 
self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (typeof fn !== 'function') {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
Back in our main page we need to add code to pass the mouse to the worker or the main page.

let sendMouse;
 
function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-picking.js', {type: 'module'});
  worker.postMessage({type: 'init', canvas: offscreen}, [offscreen]);
 
  sendMouse = (x, y) => {
    worker.postMessage({
      type: 'mouse',
      x,
      y,
    });
  };
 
  function sendSize() {
    worker.postMessage({
      type: 'size',
      width: canvas.clientWidth,
      height: canvas.clientHeight,
    });
  }
 
  window.addEventListener('resize', sendSize);
  sendSize();
 
  console.log('using OffscreenCanvas');  /* eslint-disable-line no-console */
}
 
function startMainPage(canvas) {
  init({canvas});
 
  sendMouse = (x, y) => {
    pickPosition.x = x;
    pickPosition.y = y;
  };
 
  function sendSize() {
    state.width = canvas.clientWidth;
    state.height = canvas.clientHeight;
  }
  window.addEventListener('resize', sendSize);
  sendSize();
 
  console.log('using regular canvas');  /* eslint-disable-line no-console */
}
Then we can copy in all the mouse handling code to the main page and make just minor changes to use sendMouse

function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  pickPosition.x = (pos.x / canvas.clientWidth ) *  2 - 1;
  pickPosition.y = (pos.y / canvas.clientHeight) * -2 + 1;  // note we flip Y
  sendMouse(
      (pos.x / canvas.clientWidth ) *  2 - 1,
      (pos.y / canvas.clientHeight) * -2 + 1);  // note we flip Y
}
 
function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  pickPosition.x = -100000;
  pickPosition.y = -100000;
  sendMouse(-100000, -100000);
}
window.addEventListener('mousemove', setPickPosition);
window.addEventListener('mouseout', clearPickPosition);
window.addEventListener('mouseleave', clearPickPosition);
 
window.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});
 
window.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});
 
window.addEventListener('touchend', clearPickPosition);
and with that picking should be working with OffscreenCanvas.


click here to open in a separate window
Let's take it one more step and add in the OrbitControls. This will be little more involved. The OrbitControls use the DOM pretty extensively checking the mouse, touch events, and the keyboard.

Unlike our code so far we can't really use a global state object without re-writing all the OrbitControls code to work with it. The OrbitControls take an HTMLElement to which they attach most of the DOM events they use. Maybe we could pass in our own object that has the same API surface as a DOM element. We only need to support the features the OrbitControls need.

Digging through the OrbitControls source code it looks like we need to handle the following events.

contextmenu
pointerdown
pointermove
pointerup
touchstart
touchmove
touchend
wheel
keydown
For the pointer events we need the ctrlKey, metaKey, shiftKey, button, pointerType, clientX, clientY, pageX, and pageY, properties.

For the keydown events we need the ctrlKey, metaKey, shiftKey, and keyCode properties.

For the wheel event we only need the deltaY property.

And for the touch events we only need pageX and pageY from the touches property.

So, let's make a proxy object pair. One part will run in the main page, get all those events, and pass on the relevant property values to the worker. The other part will run in the worker, receive those events and pass them on using events that have the same structure as the original DOM events so the OrbitControls won't be able to tell the difference.

Here's the code for the worker part.

import {EventDispatcher} from 'three';
 
class ElementProxyReceiver extends EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
}
All it does is if it receives a message it dispatches it. It inherits from EventDispatcher which provides methods like addEventListener and removeEventListener just like a DOM element so if we pass it to the OrbitControls it should work.

ElementProxyReceiver handles 1 element. In our case we only need one but it's best to think head so lets make a manager to manage more than one of them.

class ProxyManager {
  constructor() {
    this.targets = {};
    this.handleEvent = this.handleEvent.bind(this);
  }
  makeProxy(data) {
    const {id} = data;
    const proxy = new ElementProxyReceiver();
    this.targets[id] = proxy;
  }
  getProxy(id) {
    return this.targets[id];
  }
  handleEvent(data) {
    this.targets[data.id].handleEvent(data.data);
  }
}
We can make a instance of ProxyManager and call its makeProxy method with an id which will make an ElementProxyReceiver that responds to messages with that id.

Let's hook it up to our worker's message handler.

const proxyManager = new ProxyManager();
 
function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
  init({
    canvas: data.canvas,
    inputElement: proxy,
  });
}
 
function makeProxy(data) {
  proxyManager.makeProxy(data);
}
 
...
 
const handlers = {
  init,
  mouse,
  start,
  makeProxy,
  event: proxyManager.handleEvent,
   size,
};
 
self.onmessage = function(e) {
  const fn = handlers[e.data.type];
  if (typeof fn !== 'function') {
    throw new Error('no handler for type: ' + e.data.type);
  }
  fn(e.data);
};
In our shared three.js code we need to import the OrbitControls and set them up.

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
 
export function init(data) {
  const {canvas} = data;
  const {canvas, inputElement} = data;
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
 
  const controls = new OrbitControls(camera, inputElement);
  controls.target.set(0, 0, 0);
  controls.update();
Notice we're passing the OrbitControls our proxy via inputElement instead of passing in the canvas like we do in other non-OffscreenCanvas examples.

Next we can move all the picking event code from the HTML file to the shared three.js code as well while changing canvas to inputElement.

function getCanvasRelativePosition(event) {
  const rect = canvas.getBoundingClientRect();
  const rect = inputElement.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}
 
function setPickPosition(event) {
  const pos = getCanvasRelativePosition(event);
  sendMouse(
      (pos.x / canvas.clientWidth ) *  2 - 1,
      (pos.y / canvas.clientHeight) * -2 + 1);  // note we flip Y
  pickPosition.x = (pos.x / inputElement.clientWidth ) *  2 - 1;
  pickPosition.y = (pos.y / inputElement.clientHeight) * -2 + 1;  // note we flip Y
}
 
function clearPickPosition() {
  // unlike the mouse which always has a position
  // if the user stops touching the screen we want
  // to stop picking. For now we just pick a value
  // unlikely to pick something
  sendMouse(-100000, -100000);
  pickPosition.x = -100000;
  pickPosition.y = -100000;
}
 
inputElement.addEventListener('mousemove', setPickPosition);
inputElement.addEventListener('mouseout', clearPickPosition);
inputElement.addEventListener('mouseleave', clearPickPosition);
 
inputElement.addEventListener('touchstart', (event) => {
  // prevent the window from scrolling
  event.preventDefault();
  setPickPosition(event.touches[0]);
}, {passive: false});
 
inputElement.addEventListener('touchmove', (event) => {
  setPickPosition(event.touches[0]);
});
 
inputElement.addEventListener('touchend', clearPickPosition);
Back in the main page we need code to send messages for all the events we enumerated above.

let nextProxyId = 0;
class ElementProxy {
  constructor(element, worker, eventHandlers) {
    this.id = nextProxyId++;
    this.worker = worker;
    const sendEvent = (data) => {
      this.worker.postMessage({
        type: 'event',
        id: this.id,
        data,
      });
    };
 
    // register an id
    worker.postMessage({
      type: 'makeProxy',
      id: this.id,
    });
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function(event) {
        handler(event, sendEvent);
      });
    }
  }
}
ElementProxy takes the element who's events we want to proxy. It then registers an id with the worker by picking one and sending it via the makeProxy message we setup earlier. The worker will make an ElementProxyReceiver and register it to that id.

We then have an object of event handlers to register. This way we can pass handlers only for these events we want to forward to the worker.

When we start the worker we first make a proxy and pass in our event handlers.

function startWorker(canvas) {
  const offscreen = canvas.transferControlToOffscreen();
  const worker = new Worker('offscreencanvas-worker-orbitcontrols.js', {type: 'module'});
 
  const eventHandlers = {
    contextmenu: preventDefaultHandler,
    mousedown: mouseEventHandler,
    mousemove: mouseEventHandler,
    mouseup: mouseEventHandler,
    pointerdown: mouseEventHandler,
    pointermove: mouseEventHandler,
    pointerup: mouseEventHandler,
    touchstart: touchEventHandler,
    touchmove: touchEventHandler,
    touchend: touchEventHandler,
    wheel: wheelEventHandler,
    keydown: filteredKeydownEventHandler,
  };
  const proxy = new ElementProxy(canvas, worker, eventHandlers);
  worker.postMessage({
    type: 'start',
    canvas: offscreen,
    canvasId: proxy.id,
  }, [offscreen]);
  console.log('using OffscreenCanvas');  /* eslint-disable-line no-console */
}
And here are the event handlers. All they do is copy a list of properties from the event they receive. They are passed a sendEvent function to which they pass the data they make. That function will add the correct id and send it to the worker.

const mouseEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'button',
  'pointerType',
  'clientX',
  'clientY',
  'pointerId',
  'pageX',
  'pageY',
]);
const wheelEventHandlerImpl = makeSendPropertiesHandler([
  'deltaX',
  'deltaY',
]);
const keydownEventHandler = makeSendPropertiesHandler([
  'ctrlKey',
  'metaKey',
  'shiftKey',
  'keyCode',
]);
 
function wheelEventHandler(event, sendFn) {
  event.preventDefault();
  wheelEventHandlerImpl(event, sendFn);
}
 
function preventDefaultHandler(event) {
  event.preventDefault();
}
 
function copyProperties(src, properties, dst) {
  for (const name of properties) {
      dst[name] = src[name];
  }
}
 
function makeSendPropertiesHandler(properties) {
  return function sendProperties(event, sendFn) {
    const data = {type: event.type};
    copyProperties(event, properties, data);
    sendFn(data);
  };
}
 
function touchEventHandler(event, sendFn) {
  // preventDefault() fixes mousemove, mouseup and mousedown 
  // firing when doing a simple touchup touchdown
  // Happens only at offscreen canvas
  event.preventDefault(); 
  const touches = [];
  const data = {type: event.type, touches};
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touches.push({
      pageX: touch.pageX,
      pageY: touch.pageY,
      clientX: touch.clientX,
      clientY: touch.clientY,
    });
  }
  sendFn(data);
}
 
// The four arrow keys
const orbitKeys = {
  '37': true,  // left
  '38': true,  // up
  '39': true,  // right
  '40': true,  // down
};
function filteredKeydownEventHandler(event, sendFn) {
  const {keyCode} = event;
  if (orbitKeys[keyCode]) {
    event.preventDefault();
    keydownEventHandler(event, sendFn);
  }
}
This seems close to running but if we actually try it we'll see that the OrbitControls need a few more things.

One is they call element.focus. We don't need that to happen in the worker so let's just add a stub.

class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}
Another is they call event.preventDefault and event.stopPropagation. We're already handling that in the main page so those can also be a noop.

function noop() {
}
 
class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  handleEvent(data) {
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}
Another is they look at clientWidth and clientHeight. We were passing the size before but we can update the proxy pair to pass that as well.

In the worker...

class ElementProxyReceiver extends THREE.EventDispatcher {
  constructor() {
    super();
  }
  get clientWidth() {
    return this.width;
  }
  get clientHeight() {
    return this.height;
  }
  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height,
    };
  }
  handleEvent(data) {
    if (data.type === 'size') {
      this.left = data.left;
      this.top = data.top;
      this.width = data.width;
      this.height = data.height;
      return;
    }
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }
  focus() {
    // no-op
  }
}
back in the main page we need to send the size and the left and top positions as well. Note that as is we don't handle if the canvas moves, only if it resizes. If you wanted to handle moving you'd need to call sendSize anytime something moved the canvas.

class ElementProxy {
  constructor(element, worker, eventHandlers) {
    this.id = nextProxyId++;
    this.worker = worker;
    const sendEvent = (data) => {
      this.worker.postMessage({
        type: 'event',
        id: this.id,
        data,
      });
    };
 
    // register an id
    worker.postMessage({
      type: 'makeProxy',
      id: this.id,
    });
    sendSize();
    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, function(event) {
        handler(event, sendEvent);
      });
    }
 
    function sendSize() {
      const rect = element.getBoundingClientRect();
      sendEvent({
        type: 'size',
        left: rect.left,
        top: rect.top,
        width: element.clientWidth,
        height: element.clientHeight,
      });
    }
 
    window.addEventListener('resize', sendSize);
  }
}
and in our shared three.js code we no longer need state

export const state = {
  width: 300,   // canvas default
  height: 150,  // canvas default
};
 
...
 
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = state.width;
  const height = state.height;
  const width = inputElement.clientWidth;
  const height = inputElement.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
 
function render(time) {
  time *= 0.001;
 
  if (resizeRendererToDisplaySize(renderer)) {
    camera.aspect = state.width / state.height;
    camera.aspect = inputElement.clientWidth / inputElement.clientHeight;
    camera.updateProjectionMatrix();
  }
 
  ...
A few more hacks. The OrbitControls add pointermove and pointerup events to the ownerDocument of the element to handle mouse capture (when the mouse goes outside the window).

Further the code references the global document but there is no global document in a worker.

We can solve all of these with a 2 quick hacks. In our worker code we'll re-use our proxy for both problems.

function start(data) {
  const proxy = proxyManager.getProxy(data.canvasId);
  proxy.ownerDocument = proxy; // HACK!
  self.document = {} // HACK!
  init({
    canvas: data.canvas,
    inputElement: proxy,
  });
}
This will give the OrbitControls something to inspect which matches their expectations.

I know that was kind of hard to follow. The short version is: ElementProxy runs on the main page and forwards DOM events to ElementProxyReceiver in the worker which masquerades as an HTMLElement that we can use both with the OrbitControls and with our own code.

The final thing is our fallback when we are not using OffscreenCanvas. All we have to do is pass the canvas itself as our inputElement.

function startMainPage(canvas) {
  init({canvas});
  init({canvas, inputElement: canvas});
  console.log('using regular canvas');
}
and now we should have OrbitControls working with OffscreenCanvas


click here to open in a separate window
This is probably the most complicated example on this site. It's a little hard to follow because there are 3 files involved for each sample. The HTML file, the worker file, the shared three.js code.

I hope it wasn't too difficult to understand and that it provided some useful examples of working with three.js, OffscreenCanvas and web workers.
____

Transparency
Transparency in three.js is both easy and hard.

First we'll go over the easy part. Let's make a scene with 8 cubes placed in a 2x2x2 grid.

We'll start with the example from the article on rendering on demand which had 3 cubes and modify it to have 8. First let's change our makeInstance function to take an x, y, and z

function makeInstance(geometry, color) {
function makeInstance(geometry, color, x, y, z) {
  const material = new THREE.MeshPhongMaterial({color});
 
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
 
  cube.position.x = x;
  cube.position.set(x, y, z);
 
  return cube;
}
Then we can create 8 cubes

function hsl(h, s, l) {
  return (new THREE.Color()).setHSL(h, s, l);
}
 
makeInstance(geometry, 0x44aa88,  0);
makeInstance(geometry, 0x8844aa, -2);
makeInstance(geometry, 0xaa8844,  2);
 
{
  const d = 0.8;
  makeInstance(geometry, hsl(0 / 8, 1, .5), -d, -d, -d);
  makeInstance(geometry, hsl(1 / 8, 1, .5),  d, -d, -d);
  makeInstance(geometry, hsl(2 / 8, 1, .5), -d,  d, -d);
  makeInstance(geometry, hsl(3 / 8, 1, .5),  d,  d, -d);
  makeInstance(geometry, hsl(4 / 8, 1, .5), -d, -d,  d);
  makeInstance(geometry, hsl(5 / 8, 1, .5),  d, -d,  d);
  makeInstance(geometry, hsl(6 / 8, 1, .5), -d,  d,  d);
  makeInstance(geometry, hsl(7 / 8, 1, .5),  d,  d,  d);
}
I also adjusted the camera

const fov = 75;
const aspect = 2;  // the canvas default
const near = 0.1;
const far = 5;
const far = 25;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 4;
camera.position.z = 2;
Set the background to white

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');
And added a second light so all sides of the cubes get some lighting.

{
function addLight(...pos) {
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  light.position.set(...pos);
  scene.add(light);
}
addLight(-1, 2, 4);
addLight( 1, -1, -2);
To make the cubes transparent we just need to set the transparent flag and to set an opacity level with 1 being completely opaque and 0 being completely transparent.

function makeInstance(geometry, color, x, y, z) {
  const material = new THREE.MeshPhongMaterial({color});
  const material = new THREE.MeshPhongMaterial({
    color,
    opacity: 0.5,
    transparent: true,
  });
 
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
 
  cube.position.set(x, y, z);
 
  return cube;
}
and with that we get 8 transparent cubes


click here to open in a separate window
Drag on the example to rotate the view.

So it seems easy but ... look closer. The cubes are missing their backs.


no backs
We learned about the side material property in the article on materials. So, let's set it to THREE.DoubleSide to get both sides of each cube to be drawn.

const material = new THREE.MeshPhongMaterial({
  color,
  map: loader.load(url),
  opacity: 0.5,
  transparent: true,
  side: THREE.DoubleSide,
});
And we get


click here to open in a separate window
Give it a spin. It kind of looks like it's working as we can see backs except on closer inspection sometimes we can't.


the left back face of each cube is missing
This happens because of the way 3D objects are generally drawn. For each geometry each triangle is drawn one at a time. When each pixel of the triangle is drawn 2 things are recorded. One, the color for that pixel and two, the depth of that pixel. When the next triangle is drawn, for each pixel if the depth is deeper than the previously recorded depth no pixel is drawn.

This works great for opaque things but it fails for transparent things.

The solution is to sort transparent things and draw the stuff in back before drawing the stuff in front. THREE.js does this for objects like Mesh otherwise the very first example would have failed between cubes with some cubes blocking out others. Unfortunately for individual triangles shorting would be extremely slow.

The cube has 12 triangles, 2 for each face, and the order they are drawn is the same order they are built in the geometry so depending on which direction we are looking the triangles closer to the camera might get drawn first. In that case the triangles in the back aren't drawn. This is why sometimes we don't see the backs.

For a convex object like a sphere or a cube one kind of solution is to add every cube to the scene twice. Once with a material that draws only the back facing triangles and another with a material that only draws the front facing triangles.

function makeInstance(geometry, color, x, y, z) {
  [THREE.BackSide, THREE.FrontSide].forEach((side) => {
    const material = new THREE.MeshPhongMaterial({
      color,
      opacity: 0.5,
      transparent: true,
      side,
    });
 
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
 
    cube.position.set(x, y, z);
  });
}
Any with that it seems to work.


click here to open in a separate window
It assumes that the three.js's sorting is stable. Meaning that because we added the side: THREE.BackSide mesh first and because it's at the exact same position that it will be drawn before the side: THREE.FrontSide mesh.

Let's make 2 intersecting planes (after deleting all the code related to cubes). We'll add a texture to each plane.

const planeWidth = 1;
const planeHeight = 1;
const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
 
const loader = new THREE.TextureLoader();
 
function makeInstance(geometry, color, rotY, url) {
  const texture = loader.load(url, render);
  const material = new THREE.MeshPhongMaterial({
    color,
    map: texture,
    opacity: 0.5,
    transparent: true,
    side: THREE.DoubleSide,
  });
 
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
 
  mesh.rotation.y = rotY;
}
 
makeInstance(geometry, 'pink',       0,             'resources/images/happyface.png');
makeInstance(geometry, 'lightblue',  Math.PI * 0.5, 'resources/images/hmmmface.png');
This time we can use side: THREE.DoubleSide since we can only ever see one side of a plane at a time. Also note we pass our render function to the texture loading function so that when the texture finishes loading we re-render the scene. This is because this sample is rendering on demand instead of rendering continuously.


click here to open in a separate window
And again we see a similar issue.


half a face is missing
The solution here is to manually split the each pane into 2 panes so that there really is no intersection.

function makeInstance(geometry, color, rotY, url) {
  const base = new THREE.Object3D();
  scene.add(base);
  base.rotation.y = rotY;
 
  [-1, 1].forEach((x) => {
    const texture = loader.load(url, render);
    texture.offset.x = x < 0 ? 0 : 0.5;
    texture.repeat.x = .5;
    const material = new THREE.MeshPhongMaterial({
      color,
      map: texture,
      opacity: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
    });
 
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    base.add(mesh);
 
    mesh.rotation.y = rotY;
    mesh.position.x = x * .25;
  });
}
How you accomplish that is up to you. If I was using modeling package like Blender I'd probably do this manually by adjusting texture coordinates. Here though we're using PlaneGeometry which by default stretches the texture across the plane. Like we covered before By setting the texture.repeat and texture.offset we can scale and move the texture to get the correct half of the face texture on each plane.

The code above also makes a Object3D and parents the 2 planes to it. It seemed easier to rotate a parent Object3D than to do the math required do it without.


click here to open in a separate window
This solution really only works for simple things like 2 planes that are not changing their intersection position.

For textured objects one more solution is to set an alpha test.

An alpha test is a level of alpha below which three.js will not draw the pixel. If we don't draw a pixel at all then the depth issues mentioned above disappear. For relatively sharp edged textures this works pretty well. Examples include leaf textures on a plant or tree or often a patch of grass.

Let's try on the 2 planes. First let's use different textures. The textures above were 100% opaque. These 2 use transparency.



Going back to the 2 planes that intersect (before we split them) let's use these textures and set an alphaTest.

function makeInstance(geometry, color, rotY, url) {
  const texture = loader.load(url, render);
  const material = new THREE.MeshPhongMaterial({
    color,
    map: texture,
    opacity: 0.5,
    transparent: true,
    alphaTest: 0.5,
    side: THREE.DoubleSide,
  });
 
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
 
  mesh.rotation.y = rotY;
}
 
makeInstance(geometry, 'pink',       0,             'resources/images/happyface.png');
makeInstance(geometry, 'lightblue',  Math.PI * 0.5, 'resources/images/hmmmface.png');
makeInstance(geometry, 'white', 0,             'resources/images/tree-01.png');
makeInstance(geometry, 'white', Math.PI * 0.5, 'resources/images/tree-02.png');
Before we run this let's add a small UI so we can more easily play with the alphaTest and transparent settings. We'll use lil-gui like we introduced in the article on three.js's scenegraph.

First we'll make a helper for lil-gui that sets every material in the scene to a value

class AllMaterialPropertyGUIHelper {
  constructor(prop, scene) {
    this.prop = prop;
    this.scene = scene;
  }
  get value() {
    const {scene, prop} = this;
    let v;
    scene.traverse((obj) => {
      if (obj.material && obj.material[prop] !== undefined) {
        v = obj.material[prop];
      }
    });
    return v;
  }
  set value(v) {
    const {scene, prop} = this;
    scene.traverse((obj) => {
      if (obj.material && obj.material[prop] !== undefined) {
        obj.material[prop] = v;
        obj.material.needsUpdate = true;
      }
    });
  }
}
Then we'll add the gui

const gui = new GUI();
gui.add(new AllMaterialPropertyGUIHelper('alphaTest', scene), 'value', 0, 1)
    .name('alphaTest')
    .onChange(requestRenderIfNotRequested);
gui.add(new AllMaterialPropertyGUIHelper('transparent', scene), 'value')
    .name('transparent')
    .onChange(requestRenderIfNotRequested);
and of course we need to include lil-gui

import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GUI} from 'three/addons/libs/lil-gui.module.min.js';
and here's the results


click here to open in a separate window
You can see it works but zoom in and you'll see one plane has white lines.


This is the same depth issue from before. That plane was drawn first so the plane behind is not drawn. There is no perfect solution. Adjust the alphaTest and/or turn off transparent to find a solution that fits your use case.

The take way from this article is perfect transparency is hard. There are issues and trade offs and workarounds.

For example say you have a car. Cars usually have windshields on all 4 sides. If you want to avoid the sorting issues above you'd have to make each window its own object so that three.js can sort the windows and draw them in the correct order.

If you are making some plants or grass the alpha test solution is common.

Which solution you pick depends on your needs.

---

Multiple Canvases Multiple Scenes
A common question is how to use THREE.js with multiple canvases. Let's say you want to make an e-commerce site or you want to make a page with lots of 3D diagrams. At first glance it appears easy. Just make a canvas every where you want a diagram. For each canvas make a Renderer.

You'll quickly find though that you run into problems.

The browser limits how many WebGL contexts you can have.

Typically that limit is around 8 of them. As soon as you create the 9th context the oldest one will be lost.

WebGL resources can not be shared across contexts

That means if you want to load a 10 meg model into 2 canvases and that model uses 20 meg of textures your 10 meg model will have to be loaded twice and your textures will also be loaded twice. Nothing can be shared across contexts. This also means things have to be initialized twice, shaders compiled twice, etc. It gets worse as there are more canvases.

So what's the solution?

The solution is one canvas that fills the viewport in the background and some other element to represent each "virtual" canvas. We make a single Renderer and then one Scene for each virtual canvas. We'll then check the positions of the virtual canvas elements and if they are on the screen we'll tell THREE.js to draw their scene at the correct place.

With this solution there is only 1 canvas so we solve both problem 1 and 2 above. We won't run into the WebGL context limit because we will only be using one context. We also won't run into the sharing issues for the same reasons.

Let's start with a simple example with just 2 scenes. First we'll make the HTML

<canvas id="c"></canvas>
<p>
  <span id="box" class="diagram left"></span>
  I love boxes. Presents come in boxes.
  When I find a new box I'm always excited to find out what's inside.
</p>
<p>
  <span id="pyramid" class="diagram right"></span>
  When I was a kid I dreamed of going on an expedition inside a pyramid
  and finding a undiscovered tomb full of mummies and treasure.
</p>
Then we can setup the CSS maybe something like this

#c {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: -1;
}
.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
  border: 1px solid black;
}
.left {
  float: left;
  margin-right: .25em;
}
.right {
  float: right;
  margin-left: .25em;
}
We set the canvas to fill the screen and we set its z-index to -1 to make it appear behind other elements. We also need to specify some kind of width and height for our virtual canvas elements since there is nothing inside to give them any size.

Now we'll make 2 scenes each with a light and a camera. To one scene we'll add a cube and to another a diamond.

function makeScene(elem) {
  const scene = new THREE.Scene();
 
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);
 
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
  }
 
  return {scene, camera, elem};
}
 
function setupScene1() {
  const sceneInfo = makeScene(document.querySelector('#box'));
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 'red'});
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}
 
function setupScene2() {
  const sceneInfo = makeScene(document.querySelector('#pyramid'));
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  sceneInfo.scene.add(mesh);
  sceneInfo.mesh = mesh;
  return sceneInfo;
}
 
const sceneInfo1 = setupScene1();
const sceneInfo2 = setupScene2();
And then we'll make a function to render each scene only if the element is on the screen. We can tell THREE.js to only render to part of the canvas by turning on the scissor test with Renderer.setScissorTest and then setting both the scissor and the viewport with Renderer.setViewport and Renderer.setScissor.

function renderSceneInfo(sceneInfo) {
  const {scene, camera, elem} = sceneInfo;
 
  // get the viewport relative position of this element
  const {left, right, top, bottom, width, height} =
      elem.getBoundingClientRect();
 
  const isOffscreen =
      bottom < 0 ||
      top > renderer.domElement.clientHeight ||
      right < 0 ||
      left > renderer.domElement.clientWidth;
 
  if (isOffscreen) {
    return;
  }
 
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
 
  const positiveYUpBottom = canvasRect.height - bottom;
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
 
  renderer.render(scene, camera);
}
And then our render function will just first clear the screen and then render each scene.

function render(time) {
  time *= 0.001;
 
  resizeRendererToDisplaySize(renderer);
 
  renderer.setScissorTest(false);
  renderer.clear(true, true);
  renderer.setScissorTest(true);
 
  sceneInfo1.mesh.rotation.y = time * .1;
  sceneInfo2.mesh.rotation.y = time * .1;
 
  renderSceneInfo(sceneInfo1);
  renderSceneInfo(sceneInfo2);
 
  requestAnimationFrame(render);
}
And here it is


click here to open in a separate window
You can see where the first <span> is there's a red cube and where the second span is there's a blue diamond.

Syncing up
The code above works but there is one minor issue. If your scenes are complicated or if for whatever reason it takes too long to render, the position of the scenes drawn into the canvas will lag behind the rest of the page.

If we give each area a border

.diagram {
  display: inline-block;
  width: 5em;
  height: 3em;
  border: 1px solid black;
}
And we set the background of each scene

const scene = new THREE.Scene();
scene.background = new THREE.Color('red');
And if we quickly scroll up and down we'll see the issue. Here's an animation of scrolling slowed down by 10x.


We can switch to a different method which has a different tradeoff. We'll switch the canvas's CSS from position: fixed to position: absolute.

#c {
  position: fixed;
  position: absolute;
Then we'll set the canvas's transform to move it so the top of the canvas is at the top of whatever part the page is currently scrolled to.

function render(time) {
  ...
 
  const transform = 
translateY(${window.scrollY}px)
;
  renderer.domElement.style.transform = transform;
position: fixed kept the canvas from scrolling at all while the rest of the page scrolled over it. position: absolute will let the canvas scroll with the rest of the page which means whatever we draw will stick with the page as it scrolls even if we're too slow to render. When we finally get a chance to render then we move the canvas so it matches where the page has been scrolled and then we re-render. This means only the edges of the window will show some un-rendered bits for a moment but the stuff in the middle of the page should match up and not slide. Here's a view of the results of the new method slowed down 10x.


Making it more Generic
Now that we've gotten multiple scenes working let's make this just slightly more generic.

We could make it so the main render function, the one managing the canvas, just has a list of elements and their associated render function. For each element it would check if the element is on screen and if so call the corresponding render function. In this way we'd have a generic system where individual scenes aren't really aware they are being rendered in some smaller space.

Here's the main render function

const sceneElements = [];
function addScene(elem, fn) {
  sceneElements.push({elem, fn});
}
 
function render(time) {
  time *= 0.001;
 
  resizeRendererToDisplaySize(renderer);
 
  renderer.setScissorTest(false);
  renderer.setClearColor(clearColor, 0);
  renderer.clear(true, true);
  renderer.setScissorTest(true);
 
  const transform = 
translateY(${window.scrollY}px)
;
  renderer.domElement.style.transform = transform;
 
  for (const {elem, fn} of sceneElements) {
    // get the viewport relative position of this element
    const rect = elem.getBoundingClientRect();
    const {left, right, top, bottom, width, height} = rect;
 
    const isOffscreen =
        bottom < 0 ||
        top > renderer.domElement.clientHeight ||
        right < 0 ||
        left > renderer.domElement.clientWidth;
 
    if (!isOffscreen) {
      const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);
 
      fn(time, rect);
    }
  }
 
  requestAnimationFrame(render);
}
You can see it loops over sceneElements which it expects is an array of objects each of which have an elem and fn property.

It checks if the element is on screen. If it is it calls fn and passes it the current time and its rectangle.

Now the setup code for each scene just adds itself to the list of scenes

{
  const elem = document.querySelector('#box');
  const {scene, camera} = makeScene();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshPhongMaterial({color: 'red'});
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}
 
{
  const elem = document.querySelector('#pyramid');
  const {scene, camera} = makeScene();
  const radius = .8;
  const widthSegments = 4;
  const heightSegments = 2;
  const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
  const material = new THREE.MeshPhongMaterial({
    color: 'blue',
    flatShading: true,
  });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
  addScene(elem, (time, rect) => {
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    mesh.rotation.y = time * .1;
    renderer.render(scene, camera);
  });
}
With that we no longer need sceneInfo1 and sceneInfo2 and the code that was rotating the meshes is now specific to each scene.


click here to open in a separate window
Using HTML Dataset
One last even more generic thing we can do is use HTML dataset. This is a way to add your own data to an HTML element. Instead of using id="..." we'll use data-diagram="..." like this

<canvas id="c"></canvas>
<p>
  <span id="box" class="diagram left"></span>
  <span data-diagram="box" class="left"></span>
  I love boxes. Presents come in boxes.
  When I find a new box I'm always excited to find out what's inside.
</p>
<p>
  <span id="pyramid" class="diagram left"></span>
  <span data-diagram="pyramid" class="right"></span>
  When I was a kid I dreamed of going on an expedition inside a pyramid
  and finding a undiscovered tomb full of mummies and treasure.
</p>
We can them change the CSS selector to select for that

.diagram
*[data-diagram] {
  display: inline-block;
  width: 5em;
  height: 3em;
}
We'll change the scene setup code to just be a map of names to scene initialization functions that return a scene render function.

const sceneInitFunctionsByName = {
  'box': () => {
    const {scene, camera} = makeScene();
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
  'pyramid': () => {
    const {scene, camera} = makeScene();
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
  },
};
And to init we can just use querySelectorAll to find all the diagrams and call the corresponding init function for that diagram.

document.querySelectorAll('[data-diagram]').forEach((elem) => {
  const sceneName = elem.dataset.diagram;
  const sceneInitFunction = sceneInitFunctionsByName[sceneName];
  const sceneRenderFunction = sceneInitFunction(elem);
  addScene(elem, sceneRenderFunction);
});
No change to the visuals but the code is even more generic.

Adding Controls to each element
Adding interactively, for example a TrackballControls is just as easy. First we add the script for the control.

import {TrackballControls} from 'three/addons/controls/TrackballControls.js';
And then we can add a TrackballControls to each scene passing in the element associated with that scene.

function makeScene() {
function makeScene(elem) {
  const scene = new THREE.Scene();
 
  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);
  scene.add(camera);
 
  const controls = new TrackballControls(camera, elem);
  controls.noZoom = true;
  controls.noPan = true;
 
  {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    scene.add(light);
    camera.add(light);
  }
 
  return {scene, camera};
 return {scene, camera, controls};
}
You'll notice we added the camera to the scene and the light to the camera. This makes the light relative to the camera. Since the TrackballControls are moving the camera this is probably what we want. It keeps the light shining on the side of the object we are looking at.

We need up update those controls in our render functions

const sceneInitFunctionsByName = {
 'box': () => {
    const {scene, camera} = makeScene();
 'box': (elem) => {
    const {scene, camera, controls} = makeScene(elem);
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({color: 'red'});
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      controls.handleResize();
      controls.update();
      renderer.render(scene, camera);
    };
  },
  'pyramid': () => {
    const {scene, camera} = makeScene();
  'pyramid': (elem) => {
    const {scene, camera, controls} = makeScene(elem);
    const radius = .8;
    const widthSegments = 4;
    const heightSegments = 2;
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const material = new THREE.MeshPhongMaterial({
      color: 'blue',
      flatShading: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return (time, rect) => {
      mesh.rotation.y = time * .1;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      controls.handleResize();
      controls.update();
      renderer.render(scene, camera);
    };
  },
};
And now if you drag the objects they'll rotate.


click here to open in a separate window
These techniques are used on this site itself. In particular the article about primitives and the article about materials use this technique to add the various examples throughout the article.

One more solution would be to render to an off screen canvas and copy the result to a 2D canvas at each element. The advantage to this solution is there is no limit on how you can composite each separate area. With the previous solution we and a single canvas in the background. With this solution we have normal HTML elements.

The disadvantage is it's slower because a copy has to happen for each area. How much slower depends on the browser and the GPU.

The changes needed are pretty small

First we'll change HTML as we no longer need a canvas in the page

<body>
  <canvas id="c"></canvas>
  ...
</body>
then we'll change the CSS

#c {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: block;
  z-index: -1;
}
canvas {
  width: 100%;
  height: 100%;
  display: block;
}
[data-diagram] {
  display: inline-block;
  width: 5em;
  height: 3em;
}
We've made all canvases fill their container.

Now let's change the JavaScript. First we no longer look up the canvas. Instead we create one. We also just turn on the scissor test at the beginning.

function main() {
  const canvas = document.querySelector('#c');
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({antialias: true, canvas, alpha: true});
  renderer.setScissorTest(true);
 
  ...
Then for each scene we create a 2D rendering context and append its canvas to the element for that scene

const sceneElements = [];
function addScene(elem, fn) {
  const ctx = document.createElement('canvas').getContext('2d');
  elem.appendChild(ctx.canvas);
  sceneElements.push({elem, fn});
  sceneElements.push({elem, ctx, fn});
}
Then when rendering, if the renderer's canvas is not big enough to render this area we increase its size. As well if this area's canvas is the wrong size we change its size. Finally we set the scissor and viewport, render the scene for this area, then copy the result to the area's canvas.

function render(time) {
  time *= 0.001;
 
  resizeRendererToDisplaySize(renderer);
 
  renderer.setScissorTest(false);
  renderer.setClearColor(clearColor, 0);
  renderer.clear(true, true);
  renderer.setScissorTest(true);
 
  const transform = 
translateY(${window.scrollY}px)
;
  renderer.domElement.style.transform = transform;
 
  for (const {elem, fn} of sceneElements) {
  for (const {elem, fn, ctx} of sceneElements) {
    // get the viewport relative position of this element
    const rect = elem.getBoundingClientRect();
    const {left, right, top, bottom, width, height} = rect;
    const rendererCanvas = renderer.domElement;
 
    const isOffscreen =
        bottom < 0 ||
        top > renderer.domElement.clientHeight ||
        top > window.innerHeight ||
        right < 0 ||
        left > renderer.domElement.clientWidth;
        left > window.innerWidth;
 
    if (!isOffscreen) {
      const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);
 
      // make sure the renderer's canvas is big enough
      if (rendererCanvas.width < width || rendererCanvas.height < height) {
        renderer.setSize(width, height, false);
      }
 
      // make sure the canvas for this area is the same size as the area
      if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
        ctx.canvas.width = width;
        ctx.canvas.height = height;
      }
 
      renderer.setScissor(0, 0, width, height);
      renderer.setViewport(0, 0, width, height);
 
      fn(time, rect);
 
      // copy the rendered scene to this element's canvas
      ctx.globalCompositeOperation = 'copy';
      ctx.drawImage(
          rendererCanvas,
          0, rendererCanvas.height - height, width, height,  // src rect
          0, 0, width, height);                              // dst rect
    }
  }
 
  requestAnimationFrame(render);
}
The result looks the same


-----

Responsive Design
This is the second article in a series of articles about three.js. The first article was about fundamentals. If you haven't read that yet you might want to start there.

This article is about how to make your three.js app be responsive to any situation. Making a webpage responsive generally refers to the page displaying well on different sized displays from desktops to tablets to phones.

For three.js there are even more situations to consider. For example, a 3D editor with controls on the left, right, top, or bottom is something we might want to handle. A live diagram in the middle of a document is another example.

The last sample we had used a plain canvas with no CSS and no size

<canvas id="c"></canvas>
That canvas defaults to 300x150 CSS pixels in size.

In the web platform the recommended way to set the size of something is to use CSS.

Let's make the canvas fill the page by adding CSS

<style>
html, body {
   margin: 0;
   height: 100%;
}
#c {
   width: 100%;
   height: 100%;
   display: block;
}
</style>
In HTML the body has a margin of 5 pixels by default so setting the margin to 0 removes the margin. Setting the html and body height to 100% makes them fill the window. Otherwise they are only as large as the content that fills them.

Next we tell the id=c element to be 100% the size of its container which in this case is the body of the document.

Finally we set its display mode to block. A canvas's default display mode is inline. Inline elements can end up adding whitespace to what is displayed. By setting the canvas to block that issue goes away.

Here's the result


click here to open in a separate window
You can see the canvas is now filling the page but there are 2 problems. One our cubes are stretched. They are not cubes they are more like boxes. Too tall or too wide. Open the example in its own window and resize it. You'll see how the cubes get stretched wide and tall.



The second problem is they look low resolution or blocky and blurry. Stretch the window really large and you'll really see the issue.



Let's fix the stretchy problem first. To do that we need to set the aspect of the camera to the aspect of the canvas's display size. We can do that by looking at the canvas's clientWidth and clientHeight properties.

We'll update our render loop like this

function render(time) {
  time *= 0.001;
 
  const canvas = renderer.domElement;
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
 
  ...
Now the cubes should stop being distorted.


click here to open in a separate window
Open the example in a separate window and resize the window and you should see the cubes are no longer stretched tall or wide. They stay the correct aspect regardless of window size.



Now let's fix the blockiness.

Canvas elements have 2 sizes. One size is the size the canvas is displayed on the page. That's what we set with CSS. The other size is the number of pixels in the canvas itself. This is no different than an image. For example we might have a 128x64 pixel image and using CSS we might display as 400x200 pixels.

<img src="some128x64image.jpg" style="width:400px; height:200px">
A canvas's internal size, its resolution, is often called its drawingbuffer size. In three.js we can set the canvas's drawingbuffer size by calling renderer.setSize. What size should we pick? The most obvious answer is "the same size the canvas is displayed". Again, to do that we can look at the canvas's clientWidth and clientHeight properties.

Let's write a function that checks if the renderer's canvas is not already the size it is being displayed as and if so set its size.

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
Notice we check if the canvas actually needs to be resized. Resizing the canvas is an interesting part of the canvas spec and it's best not to set the same size if it's already the size we want.

Once we know if we need to resize or not we then call renderer.setSize and pass in the new width and height. It's important to pass false at the end. renderer.setSize by default sets the canvas's CSS size but doing so is not what we want. We want the browser to continue to work how it does for all other elements which is to use CSS to determine the display size of the element. We don't want canvases used by three to be different than other elements.

Note that our function returns true if the canvas was resized. We can use this to check if there are other things we should update. Let's modify our render loop to use the new function

function render(time) {
  time *= 0.001;
 
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
 
  ...
Since the aspect is only going to change if the canvas's display size changed we only set the camera's aspect if resizeRendererToDisplaySize returns true.


click here to open in a separate window
It should now render with a resolution that matches the display size of the canvas.

To make the point about letting CSS handle the resizing let's take our code and put it in a separate .js file. Here then are a few more examples where we let CSS choose the size and notice we had to change zero code for them to work.

Let's put our cubes in the middle of a paragraph of text.


click here to open in a separate window
and here's our same code used in an editor style layout where the control area on the right can be resized.


click here to open in a separate window
The important part to notice is no code changed. Only our HTML and CSS changed.

Handling HD-DPI displays
HD-DPI stands for high-density dot per inch displays. That's most Macs nowadays and many Windows machines as well as pretty much all smartphones.

The way this works in the browser is they use CSS pixels to set the sizes which are supposed to be the same regardless of how high res the display is. The browser will just render text with more detail but the same physical size.

There are various ways to handle HD-DPI with three.js.

The first one is just not to do anything special. This is arguably the most common. Rendering 3D graphics takes a lot of GPU processing power. Mobile GPUs have less power than desktops, at least as of 2018, and yet mobile phones often have very high resolution displays. The current top of the line phones have an HD-DPI ratio of 3x meaning for every one pixel from a non-HD-DPI display those phones have 9 pixels. That means they have to do 9x the rendering.

Computing 9x the pixels is a lot of work so if we just leave the code as it is we'll compute 1x the pixels and the browser will just draw it at 3x the size (3x by 3x = 9x pixels).

For any heavy three.js app that's probably what you want otherwise you're likely to get a slow framerate.

That said if you actually do want to render at the resolution of the device there are a couple of ways to do this in three.js.

One is to tell three.js a resolution multiplier using renderer.setPixelRatio. You ask the browser what the multiplier is from CSS pixels to device pixels and pass that to three.js

 renderer.setPixelRatio(window.devicePixelRatio);
After that any calls to renderer.setSize will magically use the size you request multiplied by whatever pixel ratio you passed in. This is strongly NOT RECOMMENDED. See below

The other way is to do it yourself when you resize the canvas.

    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const pixelRatio = window.devicePixelRatio;
      const width  = Math.floor( canvas.clientWidth  * pixelRatio );
      const height = Math.floor( canvas.clientHeight * pixelRatio );
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
This second way is objectively better. Why? Because it means I get what I ask for. There are many cases when using three.js where we need to know the actual size of the canvas's drawingBuffer. For example when making a post processing filter, or if we are making a shader that accesses gl_FragCoord, if we are making a screenshot, or reading pixels for GPU picking, for drawing into a 2D canvas, etc... There are many cases where if we use setPixelRatio then our actual size will be different than the size we requested and we'll have to guess when to use the size we asked for and when to use the size three.js is actually using. By doing it ourselves we always know the size being used is the size we requested. There is no special case where magic is happening behind the scenes.

Here's an example using the code above.


click here to open in a separate window
It might be hard to see the difference but if you have an HD-DPI display and you compare this sample to those above you should notice the edges are more crisp.

HD-DPI: Limiting maximum drawing buffer size
When using a fractional UI scaling factor on some operating system (eg: 150% on OSX or Linux) the assumption that the real physical resolution equals width * window.devicePixelRatio and height * window.devicePixelRatio no longer holds. This may lead to excessive GPU load, lower frame rates and high power consumption.

A possible mitigation is to cap the maximum internal resolution (e.g. limit width × height) so the buffer remains within safe bounds.

    function resizeRendererToDisplaySize(renderer, maxPixelCount=3840*2160) {
      const canvas = renderer.domElement;
      const pixelRatio = window.devicePixelRatio;
      let width  = Math.floor( canvas.clientWidth  * pixelRatio );
      let height = Math.floor( canvas.clientHeight * pixelRatio );
      const pixelCount = width * height;
      const renderScale = pixelCount > maxPixelCount ? Math.sqrt(maxPixelCount / pixelCount) : 1;
      width = Math.floor(width * renderScale);
      height = Math.floor(height * renderScale);
 
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
This article covered a very basic but fundamental topic. Next up lets quickly go over the basic primitives that three.js provides.
)