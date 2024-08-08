document.getElementById("nodeValue").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        document.getElementById("insertBtn").click();
        document.getElementById("nodeValue").value = ""
      }
})

class Node {
    constructor(data, color = null) {
        this.data = data;
        this.color = color;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.height = 1;  // Only used for AVL Tree
    }
}

class BinaryTree {
    constructor() {
        this.root = null;
    }

    insert(data) {
        const newNode = new Node(data);
        if (this.root === null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
        this.visualize();
    }

    insertNode(node, newNode) {
        if (newNode.data < node.data) {
            if (node.left === null) {
                node.left = newNode;
                newNode.parent = node;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
                newNode.parent = node;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    visualize() {
        const treeData = this.buildTreeData(this.root);
        this.drawTree(treeData);
    }

    buildTreeData(node) {
        if (node === null) return null;
        return {
            name: `${node.data}`,
            color: node.color,
            children: [this.buildTreeData(node.left), this.buildTreeData(node.right)].filter(n => n)
        };
    }

    drawTree(treeData) {
        const margin = { top: 20, right: 90, bottom: 30, left: 90 };
        const width = 960 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        d3.select("svg").remove();

        const svg = d3.select("body").append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const treemap = d3.tree().size([height, width]);

        let nodes = d3.hierarchy(treeData, d => d.children);
        nodes = treemap(nodes);

        const link = svg.selectAll(".link")
            .data(nodes.descendants().slice(1))
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d => {
                return "M" + d.y + "," + d.x
                    + "C" + (d.y + d.parent.y) / 2 + "," + d.x
                    + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x
                    + " " + d.parent.y + "," + d.parent.x;
            });

        const node = svg.selectAll(".node")
            .data(nodes.descendants())
            .enter().append("g")
            .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
            .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

        node.append("circle")
            .attr("r", 10)
            .attr("node-id", d => d.data.name)
            .style("fill", d => d.data.color ? (d.data.color === 'RED' ? '#ff4c4c' : '#000') : '#999');

        node.append("text")
            .attr("dy", ".35em")
            .attr("x", d => d.children ? -13 : 13)
            .style("text-anchor", d => d.children ? "end" : "start")
            .text(d => d.data.name);
    }
}

class RedBlackTree extends BinaryTree {
    constructor() {
        super();
        this.TNULL = new Node(null, 'BLACK');
    }

    leftRotate(x) {
        let y = x.right;
        x.right = y.left;
        if (y.left !== this.TNULL) {
            y.left.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.left) {
            x.parent.left = y;
        } else {
            x.parent.right = y;
        }
        y.left = x;
        x.parent = y;
    }

    rightRotate(x) {
        let y = x.left;
        x.left = y.right;
        if (y.right !== this.TNULL) {
            y.right.parent = x;
        }
        y.parent = x.parent;
        if (x.parent === null) {
            this.root = y;
        } else if (x === x.parent.right) {
            x.parent.right = y;
        } else {
            x.parent.left = y;
        }
        y.right = x;
        x.parent = y;
    }

    insert(data) {
        const newNode = new Node(data, 'RED');
        newNode.left = this.TNULL;
        newNode.right = this.TNULL;

        let y = null;
        let x = this.root;

        while (x !== null && x !== this.TNULL) {
            y = x;
            if (newNode.data < x.data) {
                x = x.left;
            } else {
                x = x.right;
            }
        }

        newNode.parent = y;
        if (y === null) {
            this.root = newNode;
        } else if (newNode.data < y.data) {
            y.left = newNode;
        } else {
            y.right = newNode;
        }

        if (newNode.parent === null) {
            newNode.color = 'BLACK';
            this.visualize();
            return;
        }

        if (newNode.parent.parent === null) {
            this.visualize();
            return;
        }

        this.fixInsert(newNode);
    }

    fixInsert(k) {
        while (k.parent.color === 'RED') {
            if (k.parent === k.parent.parent.right) {
                let u = k.parent.parent.left;
                if (u.color === 'RED') {
                    u.color = 'BLACK';
                    k.parent.color = 'BLACK';
                    k.parent.parent.color = 'RED';
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.left) {
                        k = k.parent;
                        this.rightRotate(k);
                    }
                    k.parent.color = 'BLACK';
                    k.parent.parent.color = 'RED';
                    this.leftRotate(k.parent.parent);
                }
            } else {
                let u = k.parent.parent.right;
                if (u.color === 'RED') {
                    u.color = 'BLACK';
                    k.parent.color = 'BLACK';
                    k.parent.parent.color = 'RED';
                    k = k.parent.parent;
                } else {
                    if (k === k.parent.right) {
                        k = k.parent;
                        this.leftRotate(k);
                    }
                    k.parent.color = 'BLACK';
                    k.parent.parent.color = 'RED';
                    this.rightRotate(k.parent.parent);
                }
            }
            if (k === this.root) {
                break;
            }
        }
        this.root.color = 'BLACK';
        this.visualize();
    }

    visualize() {
        setTimeout(() => {
            super.visualize();
        }, 1000);
    }
}

class AVLTree extends BinaryTree {
    constructor() {
        super();
    }

    insert(data) {
        this.root = this.insertNode(this.root, data);
        this.visualize();
    }

    insertNode(node, data) {
        if (node === null) {
            return new Node(data);
        }

        if (data < node.data) {
            node.left = this.insertNode(node.left, data);
        } else if (data > node.data) {
            node.right = this.insertNode(node.right, data);
        } else {
            return node;
        }

        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        const balance = this.getBalance(node);

        if (balance > 1 && data < node.left.data) {
            return this.rightRotate(node);
        }

        if (balance < -1 && data > node.right.data) {
            return this.leftRotate(node);
        }

        if (balance > 1 && data > node.left.data) {
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }

        if (balance < -1 && data < node.right.data) {
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y;
    }

    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x;
    }

    getHeight(node) {
        if (node === null) {
            return 0;
        }
        return node.height;
    }

    getBalance(node) {
        if (node === null) {
            return 0;
        }
        return this.getHeight(node.left) - this.getHeight(node.right);
    }

    visualize() {
        setTimeout(() => {
            super.visualize();
        }, 1000);
    }
}

let tree;
function insertNode() {
    const value = parseInt(document.getElementById('nodeValue').value);
    const feedback = document.getElementById('feedback');
    if (isNaN(value)) {
        feedback.textContent = 'Please enter a valid number!';
        return;
    }
    feedback.textContent = '';

    const treeType = document.getElementById('treeType').value;

    if (treeType === 'red-black') {
        if (!tree || !(tree instanceof RedBlackTree)) {
            tree = new RedBlackTree();
        }
    } else if (treeType === 'avl') {
        if (!tree || !(tree instanceof AVLTree)) {
            tree = new AVLTree();
        }
    } else {
        if (!tree || !(tree instanceof BinaryTree)) {
            tree = new BinaryTree();
        }
    }
    tree.insert(value);
}

function resetTree() {
    tree = null;
    d3.select("svg").remove();
}

let searchSteps = [];
let currentStep = 0;

function startSearch() {
    const value = parseInt(document.getElementById('searchValue').value);
    const feedback = document.getElementById('feedback');
    if (isNaN(value)) {
        feedback.textContent = 'Please enter a valid number!';
        return;
    }
    feedback.textContent = '';

    searchSteps = [];
    currentStep = 0;

    gatherSearchSteps(tree.root, value);

    if (searchSteps.length === 0) {
        feedback.textContent = 'Value not found!';
        return;
    }

    document.getElementById('prevBtn').disabled = false;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('skipBtn').disabled = false;

    highlightNode(searchSteps[currentStep]);
}

function gatherSearchSteps(node, value) {
    if (node === null || node.data === null) {
        return;
    }
    searchSteps.push(node);
    if (node.data > value) {
        gatherSearchSteps(node.left, value);
    } else if (node.data < value) {
        gatherSearchSteps(node.right, value);
    }
}

function highlightNode(node) {
    d3.selectAll("circle").style("stroke", "black");
    d3.select(`circle[node-id='${node.data}']`).style("stroke", "red");
}

function prevStep() {
    if (currentStep > 0) {
        currentStep--;
        highlightNode(searchSteps[currentStep]);
    }
}

function nextStep() {
    if (currentStep < searchSteps.length - 1) {
        currentStep++;
        highlightNode(searchSteps[currentStep]);
    }
}

function skipSearch() {
    highlightNode(searchSteps[searchSteps.length - 1]);
}

BinaryTree.prototype.visualize = function () {
    const treeData = this.buildTreeData(this.root);
    this.drawTree(treeData);
    setTimeout(() => {
        this.assignNodeIds(this.root);
    }, 1000);
}

BinaryTree.prototype.assignNodeIds = function (node) {
    if (node === null) {
        return;
    }
    d3.select(`circle[node-id='${node.data}']`).attr("node-id", node.data);
    this.assignNodeIds(node.left);
    this.assignNodeIds(node.right);
}