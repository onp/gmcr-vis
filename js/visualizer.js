'use strict';

var conflicts = [
	{"name" : "Conflict", "url" : "json/conflictData.json"},
];

var visualizations = [treeVis, graphVis];

var visualization = visualizations[0];
var conflict = conflicts[0];

var unpackJSONconflict = function(data){
    //this conflict unpacker is incomplete.  Currently only deals with reachability.
    for (var i = 0; i < data.nodes.length; i++){
        var node = data.nodes[i];
        node.reachable = $.map(node.reachable,
                function (link) {
                    link.source = node;
                    link.target = data.nodes[link.target];
                    return(link);
                }
        );
    }
    for (var i = 0; i < data.decisionMakers.length; i++){
        data.decisionMakers[i].isShown = true;
    }
    conflict.data = data;
    loadConflict();
};

var loadConflict = function () {
    //fetches the conflict if it has not already been retrieved, then loads it.
    if (conflict.data === undefined) {
        $.getJSON(conflict.url, unpackJSONconflict);
        return;
    }
    visualization.loadVis(conflict,d3.select("svg#visualization-container"));
    changeLegend();
};

var tElemMaker = function(val,elem, rows, classes){
    if (elem === undefined){
        elem = "td";
    }
    var elemText = "<" + elem;
    if (rows !== undefined){
        elemText += " rowspan=" + rows;
    }
    if (classes !== undefined){
        elemText += " class='"+ classes.join(' ') + "'";
    }
    elemText+= ">" + val + "</" + elem + ">";
    return elemText;
};

var changeLegend = function () {
    $("div#menu-bottom table").html("");
    
    var legendData = [[],[]];
    var dmNames = "";
    
    for (var i = 2; i<conflict.data.options.length+2; i++){
        legendData[i] = [];
    }
    
    
    legendData[0][0] = tElemMaker("", "th");
    legendData[1][0] = tElemMaker("", "th");
    legendData[0][1] = tElemMaker("Ordered", "th");
    legendData[1][1] = tElemMaker("Decimal", "th");
    
    var row = 2;
    for (var i = 0; i < conflict.data.decisionMakers.length; i++){
        var dm = conflict.data.decisionMakers[i];
        legendData[i+row][0] = tElemMaker(dm.name, "th", dm.options.length,["dm"+i]);
        row += dm.options.length -1;
        dmNames += "<p class='dm"+i+"'>---- "+dm.name+"</p>";
    }
    
    for (var i = 0; i < conflict.data.options.length; i++){
        legendData[i+2][1] = tElemMaker(conflict.data.options[i].name,undefined,undefined,["option","opt"+i]);
    }
    
    for (var j = 0; j < conflict.data.nodes.length; j++){
        var node = conflict.data.nodes[j];
        legendData[0][j+2] = tElemMaker(node.ordered,undefined,undefined,["state","st"+node.id]);
        legendData[1][j+2] = tElemMaker(node.decimal,undefined,undefined,["state","st"+node.id]);
        for (var i = 0; i<node.state.length; i++){
            legendData[i+2][j+2] =tElemMaker(node.state[i],undefined,undefined,["option","opt"+i,"state","st"+node.id]);
        }
    }
    
    var tString = "";
    
    for (var i = 0; i<legendData.length; i++){
        tString += "<tr>";
        for (var j = 0; j<legendData[i].length; j++){
            var elem = legendData[i][j];
            tString += elem;
        }
    }
    
    $(tString).appendTo("div#menu-bottom table");
    
    var tableHeight = $("div#menu-bottom table").height();
    $("div#menu-bottom").height(tableHeight+60);
    var styleSheet = document.styleSheets[1];  //this is easily breakable.
    for (var i = 0; i<styleSheet.cssRules.length; i++){
        var rule = styleSheet.cssRules[i];
        if (rule.selectorText == "div#menu-bottom"){
            rule.style.bottom = String(-40-tableHeight) + "px";
            break;
        }
    }
    
    
    $(".option").mouseover(function () {
        $("."+this.className.match(/opt\d+/)).css("background-color","paleVioletRed");
    }).mouseout(function (){
        $("."+this.className.match(/opt\d+/)).css("background-color","transparent");
    });
    
    $(".state").mouseover(function () {
        var clsName = this.className.match(/st\d+/);
        $("."+clsName).css("background-color","paleVioletRed");
        d3.selectAll("." + clsName)
            .style("fill", "paleVioletRed");
    }).mouseout(function (){
        var clsName = this.className.match(/st\d+/);
        $("."+clsName).css("background-color","transparent");
        d3.selectAll("." + clsName)
            .style("fill", "lightBlue");
    }).click(function(){
        if (visualization.name == "Tree") {
            var stateNum = this.className.match(/st(\d+)/)[1];
            visualization.changeRoot(stateNum);
        }
    });
    
    $("#dm-names").html(dmNames);
    
    $("#disp-dms").html("");
    for (var i = 0; i < conflict.data.decisionMakers.length; i++){
        (function(dm){
            dm.isShown = dm.isShown || false;
            var $dm = $("<li><input type='checkbox' name='dm" + i + "checkbox'><label for='dm" + i + "checkbox'>"+dm.name+"</label></li>");
            var $dmCheckbox = $dm.find("input");
            $dmCheckbox.prop("checked",dm.isShown);
            $("#disp-dms").append($dm);
            $dmCheckbox.change(function(){
                dm.isShown = $dmCheckbox.prop("checked");
                visualization.refresh();
            });

        })(conflict.data.decisionMakers[i]);        
    }
    
};


$(function () {

    var addConflict = function (i, conf) {
        $("<li>" + conf.name + "</li>")
            .click(function () {
                conflict = conf;
                loadConflict();
                $(this).siblings().removeClass('selected');
                $(this).addClass('selected');
            }).appendTo("ul#conflict-list");
    };
    
    $.each(conflicts,addConflict);
    
    $.each(visualizations, function (i, vis) {
        $("<li>" + vis.name + "</li>")
            .click(function () {
                visualization.clearVis();
                visualization = vis;
                loadConflict();
                vis.visConfig();
                $(this).siblings().removeClass('selected');
                $(this).addClass('selected');
            }).appendTo("ul#visualization-list");
    });
    
    $( window ).resize(function() {
        visualization.resize();
    });
    
    var extendMenu= function (){
        var $th = $(this);
        $th.addClass("extended");
        setTimeout(function(){
            $th.one('click',function(){
                $th.removeClass("extended")
                    .one('touchstart',extendMenu);
            });
        },500);
    };
    
    $("div#menu-left,div#menu-bottom")
        .one('touchstart',extendMenu
        ).on('mouseover',function(){
            $(this).addClass("extended");
        }).on('mouseout',function(){
            $(this).removeClass("extended");
        });
        
    $("#confFileSelector").change(function(event){
        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            var newData = {'name':file.name,
                           'url':"FromFile"
            };
            conflicts.push(newData);
            addConflict(undefined,newData);
            conflict = newData;
            unpackJSONconflict(JSON.parse(reader.result));
        };
        
        reader.readAsText(file);
    });
    
    $("ul#conflict-list li").first().click();
    $("ul#visualization-list li").first().addClass('selected');
    visualization.visConfig();
});