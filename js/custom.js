// Create first and second generation usin the selector
function getTree(data,children_selector) {
    var tree = {first:[],second:[],links:[]};
    
    if (!children_selector) children_selector = 'children';
    // Map data to structure
    data.forEach(function(d) {
	var parentId = tree.first.indexOf(d.name);
	if(parentId < 0) parentId = tree.first.push(d.name)-1;
	d[children_selector].forEach(function(c){
	    var childId = tree.second.indexOf(c);
	    if(childId < 0) childId = tree.second.push(c)-1;
	    tree.links.push({source:parentId, target:childId});
	})
    });
    // Sort output
    tree.first = tree.first.sort(function(a, b){return a == b ? 0 : a < b ? -1 : 1;})
    tree.second = tree.second.sort(function(a, b){return a == b ? 0 : a < b ? -1 : 1;})
    return tree;
}

function createNodes(data,radius,start_index,center,deg_offset,isRight) {
    var nodes = [],
	numNodes = data.length-1, // Due to the first node is on 0 angle, the number of nodes is minus 1
	offset = deg_offset*(Math.PI/180),
        angle,x,y,i;

    var angle_step = (Math.PI-(2*offset))/numNodes; // remove one to make it simetrical
    
    for (i=0; i<data.length; i++) {
	// Calculate the angle at which the element will be placed.
        angle = isRight ? (offset+(angle_step*(numNodes-i))):(offset+Math.PI+(angle_step*i));
        y = (radius*Math.cos(angle))+center.y; // Calculate the y position of the element.
        x = (radius*Math.sin(angle))+center.x; // Calculate the x position of the element.
        nodes.push({'id': start_index+i,'name':data[i],'x': x,'y': y,'isRight':isRight});
    }
    return nodes;
}

function translate(x,y){
    return 'translate('+x+','+y+')';
}
var dim = {
    height: 400,
    width: 600,
    margin: {top:20,bottom:20,left:100,right:100},
    barHeight: 20,
    barWidth: 100
};
var oas,blah;
document.addEventListener('DOMContentLoaded', function(){ 
    d3.json('json/data.json',function(error,data){
	console.log(data);
	var nodes = getTree(data,'imports');
	
	// Create graph container
	var svg = d3.select('#chart').append('svg')
	    .attr('width',dim.width)
	    .attr('height',dim.height);
	var svgWidth = dim.barWidth-(dim.margin.left+dim.margin.right);
	var svgHeight = dim.barHeight-(dim.margin.top+dim.margin.bottom);
	
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
	    .attr('height', dim.barHeight-1)
	    .attr('id',function(d,i){return 'fst-'+i});

	var first_text = bar.append('text')
	    .attr('x', dim.barWidth/2)
	    .attr('y', dim.barHeight / 2)
	    .attr('dy', '.35em')
	    .text(function(d,i){return d;});

	// Divide Seconds into 2 groups
	var snd_len = nodes.second.length;
	var snd_half = Math.floor(snd_len / 2);
	var snd_right = nodes.second.slice(snd_half,snd_len);
	var snd_left = nodes.second.slice(0,snd_half);
	
	// Create dots for each Seconds
	var drawRadius = (dim.width-dim.barWidth-dim.margin.right)/2;
	console.log(drawRadius);
	var snd_nodes_right = createNodes(snd_right, drawRadius,
					  snd_half,
					  {x:((dim.width+dim.barWidth)/2)-6,y:dim.height/2},
					  50,true);
	var snd_nodes_left = createNodes(snd_left, drawRadius,0,
					 {x:((dim.width-dim.barWidth)/2)-6,y:dim.height/2},
					 50,false);
	var rNodes = 5;
	oas = snd_nodes_left;
	
	var lineFunction = d3.line()
	    .y(function(d) { return d.y; })
	    .x(function(d) { return d.x; })
	    .curve(d3.curveBundle.beta(0.65));

	drawNodes(snd_nodes_left.concat(snd_nodes_right),nodes.links);
	function drawNodes(nodes,links){
	    var snd_elem = svg.append('g')
		.classed('nodes',true)
		.selectAll('g')
		.data(nodes)
		.enter().append('g');
	    
	    var snd_circles = snd_elem.append('svg:circle')
		.attr('r', rNodes)
		.attr('cx',function(d){return d.x})
		.attr('cy',function(d){return d.y})
		.attr('id',function(d){return 'snd-'+d.id});;

	    snd_elem.append('svg:text')
		.attr('x',function(d,i){return d.x+(d.isRight ? rNodes : -rNodes)}) // Separate from center
		.attr('y',function(d,i){return d.y})
		.attr('dy', '.35em')
		.style('text-anchor',function(d){return (d.isRight ? 'start' : 'end')})
		.text(function(d,i){return d.name;})
	    
	    blah = [];
	    
	    links.forEach(function(d,i){
		var src = document.getElementById('fst-'+d.source).getBoundingClientRect();
		var tar = d3.select('#snd-'+d.target);

		if (!tar.empty()){
		    var xCenter = tar.datum().isRight ? src.right : src.left;
		    xcenter = parseFloat(xCenter)-8;
		    var xFstPnt = xCenter+(tar.datum().isRight ? 50 : -50);
		    var xSndPnt = parseFloat(tar.attr('cx'))+(tar.datum().isRight ? -70 :30);

		    var lineGraph = svg.append("path")
			.attr("d",lineFunction([{'x':(parseFloat(xCenter)-8),'y':src.y},
						{'x':xFstPnt,'y':src.y},
						{'x':xSndPnt,'y':tar.attr('cy')},
						{'x':tar.attr('cx'),'y':tar.attr('cy')}]))
			.attr("stroke", "lightgreen")
			.attr("stroke-width", 2)
			.attr("fill", "none");
		    blah.push(lineGraph);
		}
	    });
	}
	// Make lines from bars to dots
	
	// Make highlight on mouseover
    })
}, false);
