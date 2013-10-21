$(function () {
	'use strict';

	var confURLs = {
		"Prisoners": "json/networkfor_Prisoners.json",
		"Garrison" : "json/networkfor_Garrison.json",
		"SyriaIraq": "json/networkfor_SyriaIraq.json"
	};

	var vis = d3.select("svg.layout.tree");     //svg canvas container

	var tree = d3.layout.tree()         //create d3 tree layout object
		.size([900, 550]);

	var node = vis.selectAll(".node"),	//establish d3 selection variables
		link = vis.selectAll(".link"),
		label = vis.selectAll(".label");

	var buildTree = function (sourceNode, dm, height) {
		var thisNode = {};
		thisNode.dat = sourceNode;
		thisNode.height = height;
		thisNode.dm = dm;
		if (height > 0) {
			thisNode.children = $.map(sourceNode.reachable, function (a) {
				if (a.dm !== dm) {
					return buildTree(a.target, a.dm, height-1);
				}
			});
		} else {
			thisNode.children = [];
		}
		return thisNode;
	};

	var diagonal = d3.svg.diagonal()      //diagonal projection function controls appearance of arrows
		.projection(function (d) {return [d.x+50, d.y+25]; });

	var changeRoot = function (newRoot) {
		var root = buildTree(newRoot, null, 3);   //build new tree data structure

		var nodes = tree.nodes(root),	//insert structure into d3 tree, store in nodes
			links = tree.links(nodes);  //store calculated link data in links

		link = link.data(links);	//update data attached to link selection
		link.exit().remove();
		link.enter().insert("path", "circle");
		link.attr("d", diagonal)
			.attr("class", function (d) {return "link " + d.target.dm; });

		node = node.data(nodes);    //update data attached to node selection
		node.exit().remove();
		node.enter().insert("circle", "text")
			.attr("r", 10)
			.on("mouseover", function () {
				d3.selectAll("circle." + this.classList[1])
					.style("fill", "paleVioletRed");
				d3.select(this)
					.style("stroke-width", "2px");
			})
			.on("mouseout", function () {
				d3.selectAll("circle." + this.classList[1])
					.style("stroke-width", "1.5px")
					.style("fill", "lightBlue");
			})
			.on("click", function (d) {
				d3.selectAll("circle." + this.classList[1])
					.style("fill", "lightBlue");
				changeRoot(d.dat);
			});

		node.attr("class", function (d) {return "node st" + d.dat.id; })
			.attr("cx", function (d) {return d.x + 50; })
			.attr("cy", function (d) {return d.y + 25; });

		label = label.data(nodes);    //update data attached to label selection
		label.exit().remove();
		label.enter()
			.append("text")
			.attr("class", "label")
			.attr("dy", 3);
		label.text(function (d) {return d.dat.id; })
			.attr("transform", function (d) {
				return "translate(" + (d.x + 50) + "," + (d.y + 25) + ")";
			});
	};

	var loadConflict = function (confURL) {

		$.getJSON(confURL, function (data) {
			$.each(data.nodes, function () {
				this.reachable = $.map(this.reachable, function (b) {
					b.source = this;
					b.target = data.nodes[b.target];
					return (b);
				});
			});

			$(".stateBar").html(
				$.map(data.nodes, function (a) {
					var $st = $(Mustache.render(templates.stateListTemplate, a));
					$st.data("stateData", a);
					return $st;
				})
			);

			d3.selectAll("div.state")
				.on("mouseover", function () {
					d3.selectAll("circle." + this.classList[1])
						.style("fill", "paleVioletRed");
				})
				.on("mouseout", function () {
					d3.selectAll("circle." + this.classList[1])
						.style("fill", "lightBlue");
				});
			$("div.state").click(function () {
				d3.selectAll("circle." + this.classList[1])
					.style("fill", "lightBlue");
				changeRoot($(this).data("stateData"));
			});

			changeRoot(data.nodes[data.startNode]);
		});
	};

	loadConflict("json/networkfor_Prisoners.json");


	$(".confBtn").click(function () {
		var url = confURLs[$(this).attr("id")];
		loadConflict(url);
	});

});