(function (graphVis, $, undefined) {
    "use strict";

    graphVis.name = "Graph";
    
    var conflict, container;
    var visNodes, visLinks, visLabels;  // d3 selections
    
    var refresh =  function () {
        graph.nodes(conflict.data.nodes)
        
        var rawLinks = [];
        $.each(conflict.data.nodes, function(i,a){
			Array.prototype.push.apply(rawLinks,a.reachable);
		});
        
        graph.links(rawLinks);

        visNodes = container.selectAll(".node").data(graph.nodes()),
        visLinks = container.selectAll(".link").data(graph.links()),
        visLabels = container.selectAll(".label").data(graph.nodes());
    
        visLinks.exit().remove();
        visLinks.enter()
            .insert("line", "circle")
            .attr("class", function(d) { return "link " + d.dm; })
            .attr("marker-end","url(#arrow-head)");

        visNodes.exit().remove()
        visNodes.enter()
            .append("circle")
            .attr("class", function(d) { return "node st" + d.id; })
            .attr("r", 10)
            .call(graph.drag)
            .on("mouseover",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("fill","paleVioletRed");
                d3.select(this)
                    .style("stroke-width","2px")
            })
            .on("mouseout",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("stroke-width","1.5px")
                    .style("fill","lightBlue");
            });
        
        visLabels.exit().remove();
        visLabels.enter()
            .append("text")
            .attr("class", "label")
            .attr("dy",3)
            .text(function(d){return d.ordered});
        
        
        d3.selectAll("div.state")
            .on("mouseover",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("fill","paleVioletRed");
            })
            .on("mouseout",function(){
                d3.selectAll("circle."+this.classList[1])
                    .style("fill","lightBlue");
            });


        graph.start();
    };

    var tick = function () {
        visNodes.attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; })

        visLinks.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
          
        visLabels.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    };
    
    graphVis.refresh = refresh;
    
    graphVis.resize = function () {
        graph.size([container.style("width").slice(0, -2), container.style("height").slice(0, -2) - 80]);
        refresh();
    }
    
    graphVis.loadVis = function(newConflict,newContainer,selfCalled){
        conflict = newConflict;
        container = newContainer;
        
        graphVis.resize();
        
        //if (selfCalled === undefined){
        //    graphVis.loadVis(conflict, container, true);    //I have no idea why this is necessary.
        //}
    };
    
    graphVis.clearVis = function () {
        visLabels.data([]).exit().remove()
        visLinks.data([]).exit().remove()
        visNodes.data([]).exit().remove()
    }
    
    graphVis.visConfig = function(){
        $("ul#vis-config").html('')
    };
        
    var graph = d3.layout.force()
        .charge(-1000)
        .linkDistance(80)
        .on("tick",tick)
    

}(window.graphVis = window.graphVis || {}, jQuery));