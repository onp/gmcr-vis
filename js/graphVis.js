(function (graphVis, $, undefined) {
    "use strict";

    graphVis.name = "Graph";
    graphVis.showOnlyUIs = false;
    graphVis.connectorShape = "line";
    graphVis.styleNonUIs = false;
    graphVis.styleUIs = false;
    
    var conflict, container;
    var visNodes, visLinks, visLabels;  // d3 selections
    
    function linkArc(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
      return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }
    
    function linkLine(d){
        return "M" + d.source.x +"," + d.source.y + "L" + d.target.x + "," + d.target.y;
    }
    
    function isNotUI(d){
        console.log("testing")
        if (graphVis.styleNonUIs == false){
            return false
        } else if (d.payoffChange <= 0){
            return true
        }
        return false
    }
	
    function isUI(d){
        console.log("testing")
        if (graphVis.styleUIs == false){
            return false
        } else if (d.payoffChange > 0){
            return true
        }
        return false
    }
    
    function markerSelector(d){
        if (graphVis.connectorShape == "line"){
            if ((d.payoffChange > 0 )&& graphVis.styleUIs){
                return "url(#straight-UI)"
            } else {
				return "url(#straight-nonUI)"
            }
        } else if (graphVis.connectorShape == "arc") {
            if ((d.payoffChange > 0 )&& graphVis.styleUIs){
                return "url(#arc-UI)"
            } else {
				return "url(#arc-nonUI)"
            }
        }
    }
    
    var refresh =  function () {
        graph.nodes(conflict.data.nodes)
        
        var rawLinks = [];
        $.each(conflict.data.nodes, function(i,a){
			Array.prototype.push.apply(rawLinks,a.reachable);
		});
        
        if (graphVis.showOnlyUIs == true){
            rawLinks = rawLinks.filter(function(a){
                return a.payoffChange > 0
            })
        }
        
        graph.links(rawLinks);

        visNodes = container.selectAll("circle.node").data(graph.nodes()),
        visLinks = container.selectAll("path.link").data(graph.links()),
        visLabels = container.selectAll("text.label").data(graph.nodes());

        visLinks.exit().remove();
        visLinks.enter()
            .insert("path", "circle")
        visLinks.attr("marker-end", markerSelector)
            .attr("class", function(d) { return "link " + d.dm; })
            .classed("ui",isUI)

        visNodes.exit().remove()
        visNodes.enter()
            .append("circle")
        visNodes.attr("class", function(d) { return "node st" + d.id; })
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
        visLabels.text(function(d){return d.ordered});
        
        
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
        
        if (graphVis.connectorShape == "arc"){
            visLinks.attr("d", linkArc);
        } else if (graphVis.connectorShape == "line"){
            visLinks.attr("d",linkLine);
        }
          
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
        var config = $(
            "<li>                                               \
                <input type='radio' name='connectorShape' value='line'> \
                <label>Line</label>                             \
                <input type='radio' name='connectorShape' value='arc'>  \
                <label>Arc</label>                              \
            </li>                                               \
            <li>                                                \
                <input type='checkbox' name='ui' id='ui'>       \
                <label for='ui'>Only show UIs</label>           \
            </li>                                               \
            <li>                                                \
                <input type='checkbox' name='styleUIs' id='styleUIs'>   \
                <label for='styleUIs'>differentiate UIs</label>         \
            </li>");
            
        config.find("input[name='connectorShape'][value='"+graphVis.connectorShape+"']")
            .prop('checked',true);
        config.find("input[name='connectorShape']")
            .change(function(){
                graphVis.connectorShape = $(this).val();
                refresh();
            });
        config.find("#ui")
            .prop("checked", graphVis.showOnlyUIs)
            .change(function(){
                graphVis.showOnlyUIs = $(this).prop("checked");
                refresh();
            });
        
        config.find("#styleUIs")
            .prop("checked", graphVis.styleUIs)
            .change(function(){
                graphVis.styleUIs = $(this).prop("checked");
                refresh();
            });
        
        $("ul#vis-config").html('').append(config);
    
    };
        
    var graph = d3.layout.force()
        .charge(-1000)
        .linkDistance(80)
        .on("tick",tick)
    

}(window.graphVis = window.graphVis || {}, jQuery));