class Vector
{
    elements;
    constructor(elements)
    {
        this.elements = elements;
    }

    dotProduct(other)
    {
        if (this.elements.length != other.elements.length) { return null; }
        let res = [];
        for (let e = 0; e < this.elements.length; e++)
        {
            res.push(this.elements[e] * other.elements[e]); 
        }
        return new Vector(res);
    }

    add(other)
    {
        if (this.elements.length != other.elements.length) { return null; }
        let res = [];
        for (let i = 0; i < this.elements.length; i++)
        {
            res.push(this.elements[i] + other.elements[i]);
        }
        return new Vector(res);
    }
    
    transform(matrix)
    {
        if (this.elements.length != matrix.vectors.length) { return null; }
        let res = [];
        for (let i = 0; i < matrix.vectors[0].elements.length; i++)
        {
            let val = 0;
            for (let j = 0; j < this.elements.length; j++)
            {
                val += matrix.vectors[j].elements[i] * this.elements[j];
            }
            res.push(val);
        }
        return new Vector(res);
    }

    rotate(degrees, axis)
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
        this.elements = this.transform(m).elements;
    }

    print()
    {
        let str = "";
        for (let e = 0; e < this.elements.length; r++)
        {
            str += this.elements[e] + "\n";
        }
        console.log(str);
    }

    copy()
    {
        return new Vector([this.elements[0], this.elements[1], this.elements[2]]);
    }
}

class Matrix
{
    vectors; 
    constructor(vectors)
    {
        this.vectors = vectors;
    }

    transpose()
    {
        let result = [];
        for (let e = 0; e < this.vectors[0].elements.length; e++)
        {
            let r = [];
            for (let v = 0; v < this.vectors.length; v++)
            {
                r.push(this.vectors[v].elements[e]);
            }
            result.push(new Vector(r));
        }
        return new Matrix(result);
    }

    multiply(other)
    {
        if (this.vectors.length != other.vectors[0].elements.length) { return null; }
        let res = [];
        for (let v = 0; v < other.vectors.length; v++)
        {
            res.push(other.vectors[v].transform(this));
        }
        return new Matrix(res);
    }

    print()
    {
        let str = "";
        for (let e = 0; e < this.vectors[0].elements.length; e++)
        {
            for (let v = 0; v < this.vectors.length; v++)
            {
                str += this.vectors[v].elements[e] + " ";
            }
            str += "\n";
        }
        console.log(str);
    }
}

class Edge
{
    start;
    end;
    color;
    constructor(v1, v2, color)
    {
        this.start = v1;
        this.end = v2;
        this.color = (color != undefined) ? color : "#FF0000";
    }

    rotate(degrees, axis)
    {
        this.start.rotate(degrees, axis);
        this.end.rotate(degrees, axis);
    }
}

class Object
{
    edges;
    constructor(edges)
    {
        this.edges = edges;
    }

    rotate(degrees, axis)
    {
        for (let i = 0; i < this.edges.length; i++)
        {
            this.edges[i].rotate(degrees, axis);
        }
    }
}

class Cube extends Object
{
    constructor(size)
    {
        super([]);
        this.edges.push(new Edge(new Vector([size, -size, size]), new Vector([size, size, size])));
        this.edges.push(new Edge(new Vector([size, size, size]), new Vector([-size, size, size])));
        this.edges.push(new Edge(new Vector([-size, size, size]), new Vector([-size, -size, size])));
        this.edges.push(new Edge(new Vector([-size, -size, size]), new Vector([size, -size, size])));

        this.edges.push(new Edge(new Vector([size, -size, -size]), new Vector([size, size, -size])));
        this.edges.push(new Edge(new Vector([size, size, -size]), new Vector([-size, size, -size])));
        this.edges.push(new Edge(new Vector([-size, size, -size]), new Vector([-size, -size, -size])));
        this.edges.push(new Edge(new Vector([-size, -size, -size]), new Vector([size, -size, -size])));

        this.edges.push(new Edge(new Vector([size, -size, size]), new Vector([size, -size, -size])));
        this.edges.push(new Edge(new Vector([size, size, size]), new Vector([size, size, -size])));
        this.edges.push(new Edge(new Vector([-size, size, size]), new Vector([-size, size, -size])));
        this.edges.push(new Edge(new Vector([-size, -size, size]), new Vector([-size, -size, -size])));
    }
}

class Dodecahedron extends Object
{
    constructor()
    {
        super([]);
        let gR = (1 + Math.sqrt(5)) / 2;
        // Vertices
        let vertices = [new Vector([gR, gR, gR]), new Vector([gR, gR, -gR]), new Vector([gR, -gR, gR]),
                        new Vector([gR, -gR, -gR]), new Vector([-gR, gR, gR]), new Vector([-gR, gR, -gR]),
                        new Vector([-gR, -gR, gR]), new Vector([-gR, -gR, -gR]), new Vector([0, Math.pow(gR, 2), 1]),
                        new Vector([0, Math.pow(gR, 2), -1]), new Vector([0, -Math.pow(gR, 2), 1]), new Vector([0, -Math.pow(gR, 2), -1]),
                        new Vector([Math.pow(gR, 2), 1, 0]), new Vector([Math.pow(gR, 2), -1, 0]), new Vector([-Math.pow(gR, 2), 1, 0]),
                        new Vector([-Math.pow(gR, 2), -1, 0]), new Vector([1, 0, Math.pow(gR, 2)]), new Vector([1, 0, -Math.pow(gR, 2)]),
                        new Vector([-1, 0, Math.pow(gR, 2)]), new Vector([-1, 0, -Math.pow(gR, 2)])];
        this.edges.push(new Edge(vertices[0].copy(), vertices[8].copy()));
        this.edges.push(new Edge(vertices[0].copy(), vertices[12].copy()));
        this.edges.push(new Edge(vertices[0].copy(), vertices[16].copy()));
        this.edges.push(new Edge(vertices[1].copy(), vertices[12].copy()));
        this.edges.push(new Edge(vertices[1].copy(), vertices[9].copy()));
        this.edges.push(new Edge(vertices[1].copy(), vertices[17].copy()));
        this.edges.push(new Edge(vertices[8].copy(), vertices[4].copy()));
        this.edges.push(new Edge(vertices[8].copy(), vertices[9].copy()));
        this.edges.push(new Edge(vertices[16].copy(), vertices[18].copy()));
        this.edges.push(new Edge(vertices[16].copy(), vertices[2].copy()));
        this.edges.push(new Edge(vertices[18].copy(), vertices[4].copy()));
        this.edges.push(new Edge(vertices[18].copy(), vertices[6].copy()));
        this.edges.push(new Edge(vertices[10].copy(), vertices[2].copy()));
        this.edges.push(new Edge(vertices[10].copy(), vertices[6].copy()));
        this.edges.push(new Edge(vertices[10].copy(), vertices[11].copy()));
        this.edges.push(new Edge(vertices[6].copy(), vertices[15].copy()));
        this.edges.push(new Edge(vertices[7].copy(), vertices[15].copy()));
        this.edges.push(new Edge(vertices[7].copy(), vertices[11].copy()));
        this.edges.push(new Edge(vertices[15].copy(), vertices[14].copy()));
        this.edges.push(new Edge(vertices[14].copy(), vertices[4].copy()));
        this.edges.push(new Edge(vertices[14].copy(), vertices[5].copy()));
        this.edges.push(new Edge(vertices[5].copy(), vertices[9].copy()));
        this.edges.push(new Edge(vertices[5].copy(), vertices[19].copy()));
        this.edges.push(new Edge(vertices[7].copy(), vertices[19].copy()));
        this.edges.push(new Edge(vertices[11].copy(), vertices[3].copy()));
        this.edges.push(new Edge(vertices[3].copy(), vertices[13].copy()));
        this.edges.push(new Edge(vertices[12].copy(), vertices[13].copy()));
        this.edges.push(new Edge(vertices[13].copy(), vertices[2].copy()));
        this.edges.push(new Edge(vertices[3].copy(), vertices[17].copy()));
        this.edges.push(new Edge(vertices[19].copy(), vertices[17].copy()));
    }
}