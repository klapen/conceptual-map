// Create first and second generation usin the selector
function getTree(data,children_selector) {
    var tree = {first:[],second:[],links:[]};
    
    if (!children_selector) children_selector = 'children';
    // Map data to structure
    data.forEach(function(d) {
	var parentId = tree.first.indexOf(d.name);
	if(parentId < 0) parentId = tree.first.push(d.name);
	d[children_selector].forEach(function(c){
	    var childId = tree.second.indexOf(c);
	    if(childId < 0) childId = tree.second.push(c);
	    tree.links.push({source:parentId, target:childId});
	})
    });
    // Sort output
    tree.first = tree.first.sort(function(a, b){return a == b ? 0 : a < b ? -1 : 1;})
    tree.second = tree.second.sort(function(a, b){return a == b ? 0 : a < b ? -1 : 1;})
    return tree;
}

function createNodes(data,radius,start_index,deg_offset) {
    var nodes = [],
	numNodes = data.length,
	offset = deg_offset*(Math.PI/180),
        width = (radius * 2),
        height = (radius * 2),
        angle,x,y,i;

    var angle_step = (5*Math.PI)/(6*numNodes);
    
    for (i=0; i<numNodes; i++) {
        angle = offset + (angle_step*i); // Calculate the angle at which the element will be placed.
        y = (radius * Math.cos(angle)) + (width/2); // Calculate the x position of the element.
        x = (radius * Math.sin(angle)) + (width/2)-6; // Calculate the y position of the element.
        nodes.push({'id': start_index+i,'name':data[i],'x': x,'y': y});
    }
    return nodes;
}

function translate(x,y){
    return 'translate('+x+','+y+')';
}
var dim = {
    height: 400,
    width: 400,
    margin: {top:20,bottom:20,left:20,right:20},
    barHeight: 20,
    barWidth: 100
};
var oas,blah;
document.addEventListener('DOMContentLoaded', function(){ 
    d3.json('json/data.json',function(error,data){
	console.log(data);
	var nodes = getTree(data,'imports');
	oas = nodes;
	
	// Create graph container
	var svg = d3.select('#chart').append('svg')
	    .attr('width',dim.width)
	    .attr('height',dim.height);
	
	// Create center bars from First
	var barChartHeight = dim.barHeight*nodes.first.length;
	var chart = svg.append('g')
	    .attr('width',dim.barWidth)
	    .attr('height',barChartHeight)
	    .attr('transform',translate((dim.width/2)-(dim.barWidth/2),(dim.height/2)-(barChartHeight/2)));
	
	var bar = chart.selectAll('g')
	    .data(nodes.first)
	    .enter().append('g')
	    .attr('transform', function(d,i){return translate(0,i*dim.barHeight)});

	var first_rect = bar.append('rect')
	    .attr('width', dim.barWidth)
	    .attr('height', dim.barHeight -1)
	    .attr('id',function(d,i){return 'first-'+i});

	var first_text = bar.append('text')
	    .attr('x', dim.barWidth/2)
	    .attr('y', dim.barHeight / 2)
	    .attr('dy', '.35em')
	    .attr('text-anchor', 'middle')
	    .text(function(d,i){return d;});

	// Divide Seconds into 2 groups
	var snd_len = nodes.second.length;
	var snd_half = Math.floor(snd_len / 2);
	var snd_right = nodes.second.slice(snd_half,snd_len);
	var snd_left = nodes.second.slice(0,snd_half);
	
	// Create dots for each Seconds
	var snd_nodes_right = createNodes(snd_right,dim.width/2,snd_half,30);
	blah = snd_nodes_right;
	console.log(blah);

	var snd_elem_right = svg.append('g')
	    .selectAll('circle')
            .data(snd_nodes_right)
            .enter().append('svg:circle')
            .attr('r', 5)
            .attr('cx',function(d,i){return d.x})
            .attr('cy',function(d,i){return d.y});

	// Make lines from bars to dots

	// Make highlight on mouseover
    })
}, false);
