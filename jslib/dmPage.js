var dmPageScript = function(){
	$("div.sidebar ul").children().hover(
		function(){
		$(this).css("background-color","darkGray")
			.children("ul").stop(true,true).show("slide", {direction:"left"}, 200)},
		function(){
		$(this).css("background-color","gray")
			.find("ul").stop(true,true).hide("slide", {direction:"left"}, 200)});
			
	var dmListMaker = Mustache.compile(templates.dmListTemplate)
	var dmMaker = Mustache.compile(templates.dmTemplate)
	var optMaker = Mustache.compile(templates.optionTemplate) 
	Mustache.compilePartial("dmTemplate",templates.dmTemplate)
	Mustache.compilePartial("optionTemplate",templates.optionTemplate)
	
	var newDM = {
		name: "new decision maker",
		options: [
			{optName:	"new option",
			 image:		"images/option_icons/question_mark.png"}
		]
	};
	
	var newOpt = {optName:	"new option",
				  image:		"images/option_icons/question_mark.png"};
	
	var iconList = {icons:[	"images/option_icons/briefcase.png",
							"images/option_icons/dam.png",
							"images/option_icons/fist.jpg",
							"images/option_icons/handshake.png",
							"images/option_icons/question_mark.png",
							"images/option_icons/tree.png",
							"images/option_icons/water.png",
	]};
	
	$.getJSON("json/sc2.json").done(function(data){
		$("div.dmList").html(dmListMaker(data));
		console.log(data);
		$("ul.dmOptions").sortable({connectWith: "ul.dmOptions",
									items:"> li:not(.addOpt)"});		
		$("ul.dmList").sortable({connectWith: "ul.dmList",
								 items:"> form:not(.addDM)"});		//make lists sortable
	}).fail(function( jqxhr, textStatus, error ) {
	  var err = textStatus + ', ' + error;
	  console.log( "Request Failed: " + err);
	});
	
							 
	$("div.dmList").on("sortreceive","ul.dmOptions",function(){
		$(this).find("li.addOpt").appendTo(this);});			//keep "add Option" at end of list
	
	$("div.dmList").on("click","li.addOpt",function(){		//activate "add Option" button
		$(this).before(optMaker(newOpt));
	});
	
	$("div.dmList").on("click","li.addDM",function(){		//activate "add Option" button
		$(this).before(dmMaker(newDM));
		$("ul.dmOptions").sortable({connectWith: "ul.dmOptions",
							items:"> li:not(.addOpt)"});	
	});
	
	$("div.dmList").on("click","img.cornerX",function(){		//activate "remove" x's
		$(this).parent().remove();
	});
	
	var $iconPicker = $(Mustache.render(templates.iconChooserTemplate,iconList));
	$iconPicker.mouseleave(function(){$iconPicker.detach()});
	$iconPicker.find("img.iconPicker").click(function(){
		var newSrc = $(this).attr("src");
		$iconPicker.parent().find("img.icon").attr("src",newSrc);
		$iconPicker.detach();
	});
	$("div.dmList").on("click","img.icon",function(){
		$(this).after($iconPicker)
	});
	
};