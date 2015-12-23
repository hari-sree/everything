var Chart = function(){

	this.drawChart = function(){
		this.data = getData(10);				   
		this.padding = 45; 
		this.chart = $("#chart");
		var chart_position = this.chart.position();
		this.left = chart_position.left;
		this.top = chart_position.top;
		this.h = this.chart.height();
		this.w = this.chart.width();
		this.isAscending = true;
		this.setupScales();
		this.setupAxes();
		this.drawAxes();
		this.plotChart();		
	}

	this.clearChart = function(){
		$("#chart").empty();
	}

	this.clearAxes = function(){
		$("#chart g.axis").empty();
	}
	this.key = function(d){
		return d[0];
	}
	this.addData = function (data){
		var c_data = this.data;
		
		var keys = this.data.map(function(d){ return d[0]; })

		data.forEach(function(d){
			if(d[0] in keys)
				c_data.data[d[0]] = d[1];
			else
				c_data.push(d);
		});
		this.updateChart();
	}	
	this.updateData = function (data){
		this.data = data;
		this.updateChart();
	}	

	this.sortBars = function(){
		var that = this;
		var bars = d3.select("#chart")
					 .selectAll("rect")
					 .sort(function(a,b){
					 	return that.isAscending ? d3.ascending(a[1],b[1]) : d3.descending(a[1],b[1]);
					 })
					 .transition()
					 .duration(1000)
					 .attr("x",function(d,i){
					 	return chart.xScale(i);
					 });


		var labels = d3.select("#chart").selectAll("text.label");	
		labels.sort(function(a,b){
					 	return that.isAscending ? d3.ascending(a[1],b[1]) : d3.descending(a[1],b[1]);
					 })
		   .transition()
		   .delay(function(d,i){ return i*100;})
		   .duration(500)
		   .text(function(d){ return d[1]; })
		   .attr("class","label")
		   .attr("x",function(d,i){ console.log(d[1]);return chart.xScale(i) + that.band_width/2; })
		   .attr("text-anchor","middle");
		this.isAscending=!this.isAscending;					 
	}

	this.updateChart = function(data){
		console.log("Refreshing Chart !! ");
		this.setupScales();
		this.setupAxes();

		
		var label_padding = 5;
		var data_points = this.data.length;

		var chart = this;		
		var bars = d3.select("#chart").selectAll("rect")
						   .data(this.data,this.key);
		var that = this;						   
		bars.transition()
		    .delay(function(d,i){ return (i/data_points)*100;})
		    .duration(1000)
		    .ease("circular")
		    .attr("x",function(d,i){ return chart.xScale(i) ;})
		    .attr("y",function(d){ return chart.yScale(d[1]) ;})
		    .attr("width",that.band_width)
		    .attr("height", function(d){ return (chart.h-chart.padding-chart.yScale(d[1])); } )
		    .attr("fill","teal")
		    .style(":hover","orange");

		var labels = d3.select("#chart").selectAll("text.label")
						   .data(chart.data,this.key);

		labels.exit().transition().duration(150).remove();
		bars.exit().transition().duration(1000).attr("x",chart.w).remove();
		
		
		bars.enter().append("rect")
						   .attr("clip-path","url(#chart-area)")
						   .attr("fill","teal")
						   .attr("height",0)
						   .attr("class","bar")
						   .attr("x",function(d,i){ console.log(chart.xScale(d[0]));return chart.xScale(d[0]) ;})
						   .attr("y", function(d){ return (chart.h-chart.padding); } )
						   .transition()
						   .duration(1000)
						   .attr("x",function(d,i){ return chart.xScale(i) ;})
						   .attr("y",function(d){ return chart.yScale(d[1]) ;})
						   .attr("width",that.band_width)
						   .attr("height", function(d){ return (chart.h-chart.padding-chart.yScale(d[1])); } )
						   .style(":hover","orange");

		labels.transition()
		   .delay(function(d,i){ return i*100;})
		   .duration(500)
		   .text(function(d){ return d[1]; })
		   .attr("class","label")
		   .attr("x",function(d,i){ return chart.xScale(i) + that.band_width/2; })
		   .attr("text-anchor","middle")
		   .attr("y",function(d,i){ return chart.yScale(d[1]) - label_padding; })	;			

		labels.enter().append("text")
						   .transition()
						   .duration(500)
						   .text(function(d){ return d[1]; })
						   .attr("class","label")
						   .attr("x",function(d,i){ return chart.xScale(i) + that.band_width/2; })
						   .attr("text-anchor","middle")
						   .attr("y",function(d,i){ return chart.yScale(d[1]) - label_padding; });

		d3.select("#chart .x.axis").transition()
								 .duration(1000)
						   		 .call(this.xAxis);

		d3.select("#chart .y.axis").transition()
								   .duration(1000)
								   .call(this.yAxis);	
	}

	this.setupScales = function(){
		var min_x = d3.min(this.data,function(d){ return d[1]});
		var max_x = d3.max(this.data,function(d){ return d[1]});
		//this.data.map(function(d){return d[0]})
		var that = this;
		this.xScale = d3.scale.ordinal().domain( d3.range(that.data.length))
										.rangeRoundBands([this.padding,this.w-this.padding],.1);
		this.yScale = d3.scale.linear().domain([0,max_x])
									   .range([this.h-this.padding,this.padding]);
		this.band_width = this.xScale.rangeBand()
	}

	this.clipCircleTest = function(){
		d3.select("#chart").append("clipPath")
						   .attr("id","chart-area")
						   .append("circle")
						   .attr("cx",this.left + this.w/2)
						   .attr("cy",this.top + this.h/2)
						   // .attr("height",this.h/2)
						   .attr("r",this.w/2);
	}
	this.plotChart = function(){
		var bar_width = 30;
		var chart = this;
		var band_width = this.xScale.rangeBand()
		var label_padding = 5;

		var that = this;
		var rects = d3.select("#chart").append("g")
						   .attr("id","datapoints")
						   .selectAll("rect")
						   .data(this.data,this.key)
						   .enter()
						   .append("rect");

		rects.attr("class","bar")
			   .attr("clip-path","url(#chart-area)")
			   .attr("fill","teal")
			   .attr("height",0)
			   .attr("x",function(d,i){ return chart.xScale(d[0]) ;})
			   .attr("y", function(d){ return (chart.h-chart.padding); } )			   
			   .transition()
			   .duration(1000)
			   .attr("x",function(d,i){ return chart.xScale(i) ;})
			   .attr("y",function(d){ return chart.yScale(d[1]) ;})
			   .attr("width",band_width)
			   .attr("height", function(d){ return (chart.h-chart.padding-chart.yScale(d[1])); } )
			   ;
		// to append a normal title toolbar 			   
		// rects.append("title")
		// 	   .text(function(d){ return "The value is "+d[1]; });

		rects.on("mouseover",function(d){
			var tooltip = $(".tooltip");
			var pos = $(this).position();
			var x = pos.left + that.band_width/2;
			var y = pos.top + $(this).attr("height") / 2;

			tooltip.css({top:y,left:x});
			tooltip.find("#value").text(d[1]);
			tooltip.toggleClass("hidden");
		});

		rects.on("mouseout",function(d){
			$(".tooltip").toggleClass("hidden");
		});

		d3.select("#chart").selectAll("text.label")
						   .data(chart.data,this.key)
						   .enter()
						   .append("text")
						   .transition()
						   .duration(1000)
						   .text(function(d){ return d[1]; })
						   .attr("class","label")
						   .attr("x",function(d,i){ return chart.xScale(i) + band_width/2; })
						   .attr("text-anchor","middle")
						   .attr("y",function(d,i){ return chart.yScale(d[1]) - label_padding; });

		// d3.select("#chart").append("circle").attr("r","10").attr("cx","0").attr("cy",(this.h-this.padding));
	}
	this.setupAxes = function(){
		this.xAxis = d3.svg.axis().orient("bottom")
								 .scale(this.xScale);

		this.yAxis = d3.svg.axis().orient("left")
								 .scale(this.yScale);
	}

	this.drawAxes = function(){
		d3.select("#chart").append("g")
						   .attr("class","x axis")
						   .attr("transform","translate("+0+","+(this.h-this.padding)+")")
						   .call(this.xAxis);

		d3.select("#chart").append("g")
						   .attr("class","y axis")
						   .attr("transform","translate("+this.padding+","+0+")")
						   .call(this.yAxis);	
	}
}