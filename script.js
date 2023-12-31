let projectionMatrix, canvas, vectors, context, scale, originX, originY, objects, rotation, zoom;
let transformationForm, matrixForm, animStage, interval, animFrames, transformationQueue;
let queueDisplay;
function initialize() 
{
    canvas = document.getElementById("canvas");
    transformationForm = document.getElementById("transformationForm");
    transformationForm.addEventListener("submit", (e) => { addToQueue(e); });
    queueDisplay = document.getElementById("queue");
    buildMatrixForm();
    projectionMatrix = new Matrix([
        new Vector([1, 0]),
        new Vector([0, 1]),
        new Vector([0, 0])
    ])
    rotation = new Matrix([
        new Vector([1, 0, 0]),
        new Vector([0, 1, 0]),
        new Vector([0, 0, 1])
    ])
    zoom = new Matrix([
        new Vector([1, 0, 0]),
        new Vector([0, 1, 0]),
        new Vector([0, 0, 1])
    ])

    document.addEventListener('keydown', (e) => 
    {
        console.log(e);
        let code = e.code;
        if (code === "KeyA") 
        {
            rotation = getRotationMatrix(-2, 1).multiply(rotation);
            drawScene();
        }
        else if (code === "KeyD") 
        {
            rotation = getRotationMatrix(2, 1).multiply(rotation);
            drawScene();
        }
        if (code === "KeyW") 
        {
            rotation = getRotationMatrix(2, 2).multiply(rotation);
            drawScene();
        }
        else if (code === "KeyS") 
        {
            rotation = getRotationMatrix(-2, 2).multiply(rotation);
            drawScene();
        }
        if (code === "KeyE") 
        {
            zoom = new Matrix([
                new Vector([1.02, 0, 0]),
                new Vector([0, 1.02, 0]),
                new Vector([0, 0, 1.02])
            ]).multiply(zoom);
            drawScene();
        }
        else if (code === "KeyQ") 
        {
            zoom = new Matrix([
                new Vector([0.98, 0, 0]),
                new Vector([0, 0.98, 0]),
                new Vector([0, 0, 0.98])
            ]).multiply(zoom);
            drawScene();
        }
        if (code === "KeyR")
        {
            recenter();
        }
    }, false);

    context = canvas.getContext("2d");
    transformationQueue = new Map();
    context.lineWidth = 2;
    scale = 32;
    animStage = 0;
    animFrames = 40;
    frameOriginX = 256;
    frameOriginY = 256;
    objects = [];
    origin = new Vector([0, 0, -16])
    objects.push(new AnimatedObject(new Cube(3), new Matrix([new Vector([1, 0, 0]), new Vector([0, 1, 0]), new Vector([0, 0, 1])])));
    drawScene();
}

function addToQueue(e) 
{
    e.preventDefault();
    console.log("addToQueue");
    for (let i = 0; i < matrixForm.length; i++) 
    {
        if (isNaN(matrixForm[i].value)) 
        {
            matrixForm[i].value = "0";
        }
    }
    let v1 = new Vector([matrixForm[0].value, matrixForm[3].value, matrixForm[6].value]);
    let v2 = new Vector([matrixForm[1].value, matrixForm[4].value, matrixForm[7].value]);
    let v3 = new Vector([matrixForm[2].value, matrixForm[5].value, matrixForm[8].value]);
    let m = new Matrix([v1, v2, v3]);
    let queueElement = document.createElement("div");
    let table = document.createElement("table");
    for (let i = 0; i < 3; i++) 
    {
        let row = document.createElement("tr");
        for (let j = 0; j < 3; j++) 
        {
            let col = document.createElement("td");
            col.innerHTML = m.vectors[j].elements[i];
            row.appendChild(col);
        }
        table.appendChild(row);
    }
    table.setAttribute("id", "queueElement");
    table.setAttribute("class", "queueElement");
    queueElement.appendChild(table)
    let remove = document.createElement("button");
    remove.innerHTML = "Remove";
    remove.setAttribute("onclick", "removeFromQueue(this)");
    queueElement.appendChild(remove);
    queueElement.setAttribute("class", "queueSpan");
    queueDisplay.appendChild(queueElement);
    transformationQueue.set(queueElement, m);
}

function removeFromQueue(removeButton) 
{
    transformationQueue.delete(removeButton.parentElement);
    removeButton.parentElement.remove();
}

function beginTransform() 
{
    if (animStage === 0 && transformationQueue.size != 0) 
    {
        applyTransformation(transformationQueue.values().next().value);
        transformationQueue.delete(transformationQueue.keys().next().value);
    }
}

function applyTransformation(m) 
{
    queueDisplay.querySelector(".queueElement").setAttribute("highlight", "true");
    for (let i = 0; i < objects.length; i++) 
    {
        objects[i].animationDuration = animFrames;
        objects[i].setTransformation(m);
    }
    interval = setInterval(animate, 25);
}

function animate() 
{
    for (let i = 0; i < objects.length; i++) 
    {
        objects[i].animate();
    }
    animStage++;
    if (animStage >= animFrames) 
    {

        clearInterval(interval);
        animStage = 0;
        setTimeout(beginTransform, 250);
        let q = queueDisplay.querySelector(".queueSpan");
        q.remove();
    }
    drawScene();
}

function buildMatrixForm() 
{
    matrixForm = [];
    transformationFormInner = document.getElementById("transformationFormInner");
    for (let i = 0; i < 3; i++) 
    {
        for (let j = 0; j < 3; j++) 
        {
            let el = document.createElement("input");
            el.setAttribute("type", "text");
            el.setAttribute("class", "matrixInput");
            el.setAttribute("inputmode", "numeric");
            el.value = (i === j) ? 1 : 0;
            transformationFormInner.appendChild(el);
            matrixForm.push(el);
        }
        transformationFormInner.appendChild(document.createElement("br"));
    }
}

function getRotationMatrix(degrees, axis) 
{
    let x = Math.PI * degrees / 180;
    let m;
    switch (axis) 
    {
        case 0:
            m = new Matrix([
                new Vector([Math.cos(x), Math.sin(x), 0]),
                new Vector([-Math.sin(x), Math.cos(x), 0]),
                new Vector([0, 0, 1])
            ]);
            break;
        case 1:
            m = new Matrix([
                new Vector([Math.cos(x), 0, Math.sin(x)]),
                new Vector([0, 1, 0]),
                new Vector([-Math.sin(x), 0, Math.cos(x)])
            ]);
            break;
        case 2:
            m = new Matrix([
                new Vector([1, 0, 0]),
                new Vector([0, Math.cos(x), Math.sin(x)]),
                new Vector([0, -Math.sin(x), Math.cos(x)])
            ]);
            break;
        default:
            m = new Matrix([
                new Vector([Math.cos(x), Math.sin(x), 0]),
                new Vector([-Math.sin(x), Math.cos(x), 0]),
                new Vector([0, 0, 1])
            ]);
    }
    return m;
}

function drawEdge(edge) 
{
    let start = origin.add(edge.start).transform(projectionMatrix)
    let end = origin.add(edge.end).transform(projectionMatrix);
    context.beginPath();
    context.moveTo(frameOriginX + start.elements[0] * scale, frameOriginY - start.elements[1] * scale);
    context.lineTo(frameOriginX + end.elements[0] * scale, frameOriginY - end.elements[1] * scale);
    let grd = context.createLinearGradient(frameOriginX + start.elements[0] * scale,
        frameOriginY - start.elements[1] * scale,
        frameOriginX + end.elements[0] * scale,
        frameOriginY - end.elements[1] * scale);
    // 255, 200, 75
    // 30, 0, 60
    let r = Math.min(255, Math.max(30, (255 + 30) / 2 + edge.start.elements[2] * (-255 + 30) / 6));
    let g = Math.min(200, Math.max(0, (200 + 0) / 2 + edge.start.elements[2] * (-200 + 0) / 6));
    let b = Math.min(60, Math.max(75, (75 + 60) / 2 + edge.start.elements[2] * (-75 + 60) / 6));
    grd.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
    r = Math.min(255, Math.max(30, (255 + 30) / 2 + edge.end.elements[2] * (-255 + 30) / 6));
    g = Math.min(200, Math.max(0, (200 + 0) / 2 + edge.end.elements[2] * (-200 + 0) / 6));
    b = Math.min(60, Math.max(75, (75 + 60) / 2 + edge.end.elements[2] * (-75 + 60) / 6));
    grd.addColorStop(1, `rgb(${r}, ${g}, ${b})`);
    context.strokeStyle = grd;
    context.stroke();
}

// Possible Orientations
// 0: Segments have no intersection (parallel or otherwise)
// 1: Segments have 1 intersection, edge 1 is in front
// 2: Segments have 1 intersection, edge 2 is in front
// 3: Segments have >1 insection
function orientation(edge1, edge2) 
{
    // TO DO: Special case for vertical line
    let m1 = (edge1.start.elements[1] - edge1.end.elements[1]) / (edge1.start.elements[0] - edge1.end.elements[0]);
    let m2 = (edge2.start.elements[1] - edge2.end.elements[1]) / (edge2.start.elements[0] - edge2.end.elements[0]);
    // y = mx + b --> b = y - mx
    let b1 = edge1.start.elements[1] - m1 * edge1.start.elements[0];
    let b2 = edge2.start.elements[1] - m2 * edge2.start.elements[0];
    // Same slope
    if (m1 == m2) 
    {
        if (b1 == b2) 
        {
            // colinear
            if (inRange(edge1.start.elements[0], edge2.start.elements[0], edge2.end.elements[0]) ||
                inRange(edge1.end.elements[0], edge2.start.elements[0], edge2.end.elements[0])) {
                if (edge1.start.elements[2] > edge2.start.elements[2]) 
                {
                    return 2;
                }
                else if (edge1.start.elements[2] < edge2.start.elements[2]) 
                {
                    return 1;
                }
                return 3;
            }
            return 0;
        }
        else 
        {
            // parallel
            return 0;
        }
    }
    // Find point of intersection of lines
    // y = m1 * x + b1 --> y - m1 * x = b1
    // y = m2 * x + b1 --> y - m2 * x = b2
    let y = ((b2 * m1) - (m2 * b1)) / (m1 - m2);
    let x = (-b1 + y) / m1;
    // Check if (x, y) is on both segments
    if (!(inRange(x, edge1.start.elements[0], edge1.end.elements[0]) &&
        inRange(x, edge2.start.elements[0], edge2.end.elements[0]) &&
        inRange(y, edge1.start.elements[1], edge1.end.elements[1]) &&
        inRange(y, edge2.start.elements[1], edge2.end.elements[1])))
    // if not: return 0
    {
        return 0;
    }
    // if: find and compare the z-coordinates
    let z1; let z2;
    // let slope = change in z / change in x
    slope1 = (edge1.start.elements[2] - edge1.end.elements[2]) / (edge1.start.elements[0] - edge1.end.elements[0]);
    slope2 = (edge2.start.elements[2] - edge2.end.elements[2]) / (edge2.start.elements[0] - edge2.end.elements[0]);
    // equation for a line Z - Zn = slope(M - Mn) --> Z = slope(M - Mn) + Zn
    z1 = slope1 * (x - edge1.start.elements[0]) + edge1.start.elements[2];
    z2 = slope2 * (x - edge2.start.elements[0]) + edge2.start.elements[2];
    if (z1 <= z2) return 1;
    return 2;
}

function drawScene() 
{
    // Clear canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Add all edges in scene to queue
    let queue = [];
    for (let i = 0; i < objects.length; i++) 
    {
        for (let j = 0; j < objects[i].current.edges.length; j++) 
        {
            let edge = objects[i].current.edges[j].transform(rotation).transform(zoom);
            queue.push(edge);
        }
    }
    // Place elements in queue into drawing order
    // toDraw ordered by furthest to closest
    let toDraw = [];
    while (queue.length > 0) 
    {
        let edge = queue.shift()
        // start with the first
        let index = 0;
        // increase position while edge is not behind edge at position
        while (index < toDraw.length && orientation(edge, toDraw[index]) != 2) 
        {
            index++;
        }
        toDraw.splice(index, 0, edge);
    }
    for (let i = 0; i < toDraw.length; i++) 
    {
        drawEdge(toDraw[i]);
    }
}

function inRange(x, bound1, bound2) 
{
    let min = Math.min(bound1, bound2);
    let max = Math.max(bound1, bound2);
    return (min <= x && x <= max)
}

function transformScene(matrix) 
{
    for (let i = 0; i < objects.length; i++) 
    {
        objects[i].setTransformation(matrix);
        objects[i].setProgress(animFrames);
    }
    drawScene()
}

function reset(object) 
{
    objects = [new AnimatedObject(object, new Matrix([new Vector([1, 0, 0]), new Vector([0, 1, 0]), new Vector([0, 0, 1])]))];
    zoom = new Matrix([
        new Vector([1, 0, 0]),
        new Vector([0, 1, 0]),
        new Vector([0, 0, 1])
    ]);
    drawScene();
}

function recenter() 
{
    rotation = new Matrix([
        new Vector([1, 0, 0]),
        new Vector([0, 1, 0]),
        new Vector([0, 0, 1])
    ]);
    drawScene();
}