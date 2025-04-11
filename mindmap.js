// Initialize the mindmap
const mindmapArea = document.getElementById('mindmap-area');
const addNodeBtn = document.getElementById('add-node-btn');
const connectNodesBtn = document.getElementById('connect-nodes-btn');
const exportBtn = document.getElementById('export-btn');
const contextMenu = document.getElementById('context-menu');
const deleteNodeBtn = document.getElementById('delete-node');
const changeColorBtn = document.getElementById('change-color');

let selectedNodes = [];
let lines = [];
let rightClickedNode = null;
let nodeCounter = 0;

// Load saved mindmap from localStorage
document.addEventListener('DOMContentLoaded', () => {
    loadMindmap();
});

addNodeBtn.addEventListener('click', () => {
    createNode();
});

connectNodesBtn.addEventListener('click', () => {
    if (selectedNodes.length === 2) {
        createConnection(selectedNodes[0], selectedNodes[1]);
        saveMindmap();
        selectedNodes.forEach(node => node.classList.remove('selected'));
        selectedNodes = [];
    } else {
        alert('Select exactly two nodes to connect.');
    }
});

exportBtn.addEventListener('click', exportToPDF);

// Handle right-click context menu
mindmapArea.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    const target = e.target.closest('.node');
    if (target) {
        rightClickedNode = target;
        contextMenu.style.display = 'block';
        contextMenu.style.left = `${e.clientX}px`;
        contextMenu.style.top = `${e.clientY}px`;
    } else {
        contextMenu.style.display = 'none';
    }
});

// Hide context menu when clicking elsewhere
document.addEventListener('click', () => {
    contextMenu.style.display = 'none';
});

deleteNodeBtn.addEventListener('click', () => {
    if (rightClickedNode) {
        deleteNode(rightClickedNode);
        rightClickedNode = null;
    }
});

changeColorBtn.addEventListener('click', () => {
    if (rightClickedNode) {
        const colors = ['#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#F44336'];
        const currentColor = rightClickedNode.style.backgroundColor || '#ffffff';
        const currentIndex = colors.findIndex(c => c === currentColor);
        const nextColor = colors[(currentIndex + 1) % colors.length];
        rightClickedNode.style.backgroundColor = nextColor;
        saveMindmap();
    }
});

function createNode(x, y, text = '', id = null) {
    const node = document.createElement('div');
    node.className = 'node';
    node.contentEditable = true;
    node.dataset.id = id || `node-${nodeCounter++}`;
    
    // Set position if provided, otherwise random
    node.style.left = x ? `${x}px` : `${Math.random() * (mindmapArea.offsetWidth - 150)}px`;
    node.style.top = y ? `${y}px` : `${Math.random() * (mindmapArea.offsetHeight - 100)}px`;
    
    node.textContent = text || 'New Node';
    mindmapArea.appendChild(node);

    makeDraggable(node);

    node.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleNodeSelection(node);
    });

    node.addEventListener('blur', () => {
        saveMindmap();
    });

    return node;
}

function toggleNodeSelection(node) {
    if (selectedNodes.includes(node)) {
        node.classList.remove('selected');
        selectedNodes = selectedNodes.filter(n => n !== node);
    } else {
        if (selectedNodes.length < 2) {
            selectedNodes.push(node);
            node.classList.add('selected');
        }
    }
}

function createConnection(node1, node2) {
    // Check if connection already exists
    const existingConnection = lines.find(line => 
        (line.start.element === node1 && line.end.element === node2) ||
        (line.start.element === node2 && line.end.element === node1)
    );
    
    if (existingConnection) {
        alert('These nodes are already connected.');
        return;
    }

    const line = new LeaderLine(
        node1,
        node2,
        {
            color: '#4CAF50',
            path: 'straight',
            size: 2,
            startSocket: 'right',
            endSocket: 'left'
        }
    );
    
    lines.push(line);
}

function makeDraggable(element) {
    let offsetX, offsetY, isDragging = false;

    element.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only left click for dragging
        
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const x = e.clientX - offsetX - mindmapArea.getBoundingClientRect().left;
            const y = e.clientY - offsetY - mindmapArea.getBoundingClientRect().top;
            
            // Boundary checks
            const maxX = mindmapArea.offsetWidth - element.offsetWidth;
            const maxY = mindmapArea.offsetHeight - element.offsetHeight;
            
            element.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            element.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
            
            // Update all lines connected to this node
            updateConnections(element);
        }
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
            saveMindmap();
        }
    });
}

function updateConnections(node) {
    lines.forEach(line => {
        if (line.start.element === node || line.end.element === node) {
            line.position();
        }
    });
}

function deleteNode(node) {
    // Remove all connections to this node
    lines = lines.filter(line => {
        if (line.start.element === node || line.end.element === node) {
            line.remove();
            return false;
        }
        return true;
    });
    
    // Remove node from selectedNodes if it's there
    selectedNodes = selectedNodes.filter(n => n !== node);
    
    // Remove the node from DOM
    node.remove();
    saveMindmap();
}

function saveMindmap() {
    const nodes = Array.from(document.querySelectorAll('.node')).map(node => ({
        id: node.dataset.id,
        x: node.offsetLeft,
        y: node.offsetTop,
        text: node.textContent,
        color: node.style.backgroundColor
    }));

    const connections = lines.map(line => ({
        sourceId: line.start.element.dataset.id,
        targetId: line.end.element.dataset.id
    }));

    const mindmapData = {
        nodes,
        connections,
        nodeCounter
    };

    localStorage.setItem('mindmapData', JSON.stringify(mindmapData));
}

function loadMindmap() {
    const savedData = localStorage.getItem('mindmapData');
    if (!savedData) return;

    const mindmapData = JSON.parse(savedData);
    nodeCounter = mindmapData.nodeCounter || 0;

    // Create nodes first
    const nodesMap = {};
    mindmapData.nodes.forEach(nodeData => {
        const node = createNode(nodeData.x, nodeData.y, nodeData.text, nodeData.id);
        if (nodeData.color) {
            node.style.backgroundColor = nodeData.color;
        }
        nodesMap[nodeData.id] = node;
    });

    // Then create connections
    mindmapData.connections.forEach(conn => {
        const sourceNode = nodesMap[conn.sourceId];
        const targetNode = nodesMap[conn.targetId];
        if (sourceNode && targetNode) {
            createConnection(sourceNode, targetNode);
        }
    });
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm'
    });

    html2canvas(mindmapArea).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = doc.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save('mindmap.pdf');
    });
}