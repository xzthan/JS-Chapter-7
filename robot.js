const roads = [
    "Alice's House-Bob's House", "Alice's House-Cabin",
    "Alice's House-Post Office", "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Shop",
    "Marketplace-Town Hall", "Shop-Town Hall"
];

function buildGraph(edges) {
    let graph = Object.create(null);

    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}

class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        } else {
            let parcels = this.parcels.map(p => {
                if (p.place != this.place) return p;
                return { place: destination, address: p.address };
            }).filter(p => p.place != p.address);
            return new VillageState(destination, parcels);
        }
    }
}

function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0) {
            console.log(`Done in ${turn} turns`);
            break;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Moved to ${action.direction}`);
    }
}

function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

function randomRobot(state) {
    return { direction: randomPick(roadGraph[state.place]) };
}

VillageState.random = function(parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);
        parcels.push({ place, address });
    }
    return new VillageState("Post Office", parcels);
};

const mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
    if (memory.length == 0) {
        memory = mailRoute;
    }
    return { direction: memory[0], memory: memory.slice(1) };
}

function findRoute(graph, from, to) {
    let work = [{ at: from, route: [] }];
    for (let i = 0; i < work.length; i++) {
        let { at, route } = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place);
            if (!work.some(w => w.at == place)) {
                work.push({ at: place, route: route.concat(place) });
            }
        }
    }
}

function goalOrientedRobot({ place, parcels }, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    return { direction: route[0], memory: route.slice(1) };
}

// compareRobots method 
function compareRobots(robot1, memory1, robot2, memory2) { // creates compareRobots function with robot1, memory1, robot2, and memory 2 parameters
    var robotTurnOne = 0; // instantiates robotTurnOne variable and sets to zero to keep track of turns
    var robotTurnTwo = 0; // instantiates robotTurnTwo variable and sets to zero to keep track of turns
    for (var i = 0; i < 100; i++) { // creates a for loop that runs 100 times 
        var currentState = VillageState.random(); // creates currentState variable and sets to random from VillageState

        robotTurn1 += runRobot(currentState, robot1, memory1); // adds turn to robotTurnOne
        robotTurn2 += runRobot(currentState, robot2, memory2); // adds turn to robotTurnTwo
    }
    var robotOneAvg = robotTurnOne / 100; // divides robotTurnOne by 100 to find average
    var robotTwoAvg = robotTurnTwo / 100; // divides robotTurnOne by 100 to find average
    console.log("Robot 1 has an average of " + robotOneAvg + " turns."); // reports to console log the avg (robotOneAvg)
    console.log("Robot 2 has an average of " + robotTwoAvg + " turns."); // reports to console log the avg (robotTwoAvg)
}

// betterOrientedRobot method
function betterOrientedRobot({ place, parcels }, route) { // creates betterOrientedRobot method with {place, parcels} and route parameters 
    if (route.length == 0) { // creates if statement if route has a length of zero
        var pickRoute = []; // creates pickRoute array and sets to empty
        var delRoute = []; // creates delRoute array and sets to empty

        for (const parcel in parcels) { // for each parcel in parcels
            if (parcel.place != place) { // if parcel.place is NOT place
                pickRoute.push(findRoute(roadGraph, place, parcel.place)); // pushes new route to pickRoute
            } else {
                delRoute.push(findRoute(roadGraph, place, parcel.address)); // pushes new route to delRoute
            }
        }
        pickRoute.sort((first, sec) => { // sort function returns difference of first and sec length
            return first.length - sec.length;
        });

        delRoute.sort((first, sec) => { // sort function returns difference of the first and sec length
            return first.length - sec.length;
        });

        if (pickRoute.length == 0) { // evaluates if pickRoute has length of zero
            route = delRoute[0]; // assigns route to first index of delRoute
        } else {
            route = pickRoute[0]; // assigns route to first index of pickRoute
        }
    }
    return {
        direction: route[0],
        memory: route.slice(1)
    };
}

// PGroup class 
class PGroup { // creates PGroup class
    constructor(arr) { // creates constructor with arr
        this.group = arr; // creates this.group as arr
    }

    add(val) { // creates add method with val param 
        var pgOne = new PGroup([...this.group]); // creates pgOne and sets to new PGroup
        pgOne.group.push(val);
        return pgOne; // returns pgOne 
    }
    delete(val) { // creates delete method with val param
        var pgOne = new PGroup([...this.group]); // creates pgOne and sets to new PGroup
        var i = this.group.indexOf(val); // creates i and sets of index of param

        if (i > -1) { // checks if i is greater than -1
            pgOne.group.splice(i, 1);
        }
        return pgOne; // returns pgOne
    }
    has(val) { // creates has method with val param
        return this.group.includes(val);
    }
}