function Graph() {}

// Evaluates vertex with name vertexName
Graph.prototype.evaluateLazy = function(vertexName) {
    var vertex = this[vertexName];
    if (vertex === undefined) {
        throw new Error("Dependency missing: " + vertexName);
    }
    if (!vertex.isEvaluated) {
        if (vertex.isComputing) {
            throw new Error("Cyclic dependency in graph");
        }
        vertex.isComputing = true;
        var args = []
        for (var i = 0; i < vertex.dependencies.length; i++) {
            var name = vertex.dependencies[i];
            args.push(this.evaluateLazy(name));
        }
        vertex.computedValue = vertex.calculationFunction.apply(this, args);
        vertex.isComputing = false;
        vertex.isEvaluated = true;
    }
    return vertex.computedValue;
}

// Evaluates all vertices of the graph and returns map of obtained values
Graph.prototype.evaluateAll = function() {
    result = {}
    graph = this;
    function rec(key) {
        var vertex = graph[key];
        if (vertex === undefined) {
            throw new Error("Dependency missing: " + vertexName);
        }
        if (!vertex.isEvaluated) {
            if (vertex.isComputing) {
                throw new Error("Cyclic dependency in graph");
            }
            vertex.isComputing = true;
            var args = []
            for (var i = 0; i < vertex.dependencies.length; i++) {
                var name = vertex.dependencies[i];
                args.push(rec(name));
            }
            vertex.computedValue = vertex.calculationFunction.apply(this, args);
            vertex.isComputing = false;
            vertex.isEvaluated = true;
            result[key] = vertex.computedValue;
        }
        return vertex.computedValue;
    }
    Object.keys(graph).forEach(rec);
    return result;
}

// Creates a vertex
// dependencies is an array of strings
// calculationFunction is a function with arguments, which correspond to dependencies
function Vertex(dependencies, calculationFunction) {
    this.isEvaluated = false;
    this.isComputing = false;
    this.dependencies = dependencies;
    this.calculationFunction = calculationFunction;
}

// Creates sample graph from article http://plumatic.github.io/prismatics-graph-at-strange-loop/
function sampleGraph() {
    var graph = new Graph();
    graph.n = new Vertex(['xs'], function(xs) {return xs.length;});
    graph.m = new Vertex(['xs', 'n'], function(xs, n) {return xs.reduce((a, b) => a + b, 0) / n;});
    graph.m2 = new Vertex(['xs', 'n'], function(xs, n) {return xs.map(x => x * x).reduce((a, b) => a + b, 0) / n;});
    graph.v = new Vertex(['m', 'm2'], function(m, m2) {return m2 - m * m;});
    graph.xs = new Vertex([], () => [1, 2, 3, 6]);
    return graph;
}

// Creates sample graph and evaluates a vertex lazily
function runLazy() {
    graph = sampleGraph();
    console.log(graph.evaluateLazy('v'));
}

// Creates sample graph and evauates all vertices
function run() {
    graph = sampleGraph();
    console.log(graph.evaluateAll());
}

testLazy();
testAll();
