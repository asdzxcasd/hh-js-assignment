// Evaluates vertex with name vertexName
function evaluateLazy(graph, vertexName) {
    var vertex = graph[vertexName];
    if (vertex === undefined) {
        throw new Error("Dependency missing: " + vertexName);
    }
    if (vertex.computedValue === undefined) {
        if (vertex.isComputing) {
            throw new Error("Cyclic dependency in graph");
        }
        vertex.isComputing = true;
        var args = []
        for (var i = 0; i < vertex.dependencies.length; i++) {
            var name = vertex.dependencies[i];
            args.push(evaluateLazy(graph, name));
        }
        vertex.computedValue = vertex.calculationFunction.apply(vertex, args);
        vertex.isComputing = false;
    }
    return vertex.computedValue;
}

// Evaluates all vertices of the graph and returns map of obtained values
function evaluateAll(graph) {
    result = {}
    Object.keys(graph).forEach(function(key) {
        result[key] = evaluateLazy(graph, key);
    });
    return result;
}

// Creates a vertex
// dependencies is an array of strings
// calculationFunction is a function with arguments, which correspond to dependencies
function Vertex(dependencies, calculationFunction) {
    this.isComputing = false;
    this.dependencies = dependencies;
    this.calculationFunction = calculationFunction;
}

// Creates sample graph from article http://plumatic.github.io/prismatics-graph-at-strange-loop/
function sampleGraph() {
    var graph = {};
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
    console.log(evaluateLazy(graph, 'v'));
}

// Creates sample graph and evauates all vertices
function run() {
    graph = sampleGraph();
    console.log(evaluateAll(graph));
}

runLazy();
run();
