let svgContainer;
let xmlhtpps = new XMLHttpRequest();
var margin = {
  top: 80, 
  right: 20,
  bottom: 30,
  left: 60
},
   width= 900 - margin.left - margin.right,
   height= 580 - margin.top - margin.bottom;

/*return an array of ten categorical colors*/
var color = d3.scaleOrdinal(d3.schemeCategory10);

/*minute and second separator format*/
var timeFormat = d3.timeFormat('%M:%S');

const createTitle = () => {
    d3.selectAll('.container')
      .append('h1')
      .attr('id','title')
      .attr("x", width/2)
      .attr("y", margin.top/2)
      .style("font-size", "30px")
      .style("text-align", "center")
      .text("Doping in Professional Bicycle Racing");
  
    d3.selectAll('.container')
      .append('h2')
      .attr('id','subtitle')
      .attr("x", width/2)
      .attr("y", margin.top/2 +30)
      .style("font-size", "20px")
      .style("text-align", "center")
      .text("35 Fastest times up Alpe d'Huez");
}

const createCanvas = () => {
   return d3.selectAll('.container')
            .append('svg')
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "graph")
            .append('g')
            .attr("transform","translate("+ margin.left + ', ' + margin.top +")");
};

const createTooltip = () => {
  return d3.selectAll('.container')
    .append('div')
    .attr('id', 'tooltip')
    .attr('class', 'tooltip');
};

const defineScales = (dataset) => {
  
  const minData = d3.min(dataset, function (d) { return d.Year -1;});
  
  const maxData = d3.max(dataset, function (d) { return d.Year +1;});
  /*.extent returns the minimum and maximum the array*/
  const yDomain = d3.extent(dataset, function (d) { return d.Time});
  
  const xScale = d3.scaleLinear()
                    .range([0, width])
                    .domain([minData, maxData]);
   const yScale = d3.scaleTime()
                     .range([0, height])
                     .domain(yDomain);
  return { xScale, yScale};
};

const createAxes = (scales) => {
  
  var xAxis = d3.axisBottom(scales.xScale).tickFormat(d3.format('d'));
  var yAxis = d3.axisLeft(scales.yScale).tickFormat(timeFormat);
  
  svgContainer.append('g')
              .attr('id','x-axis')
              .attr('class','x-axis')
              .call(xAxis)
              .attr('transform', 'translate(0,' + height +')')
              .append('text')
              .attr('class', 'x-axis-label')
              .attr('x', width)
              .attr('y', -6)
              .style('text-anchor', 'end')
              .text('Year');
  
  svgContainer.append('g')
              .attr('id','y-axis')
              .attr('class','y-axis')
              .call(yAxis)
              .append('text')
              .attr('class', 'label')
              .attr('transform', 'rotate(-90)')
              .attr('y', 6)
              .attr('dy', '.71em')
              .style('text-anchor', 'end')
              .text("Best Time (minutes)");
};

const createGraph = (dataset, scales) => {
  
  svgContainer.selectAll('.dot')
              .data(dataset)
              .enter()
              .append('circle')
              .attr('class','dot')
              .attr('r', 6)
              .attr('cx' , function (d) { return scales.xScale(d.Year); })
              .attr('cy', function (d) { return scales.yScale(d.Time); })
              .attr('data-xvalue', function (d) { return d.Year; })
              .attr('data-yvalue', function (d) { return d.Time.toISOString(); })
              .style('fill', function (d) { return color(d.Doping !== ''); })
              .on('mouseover', function (e, d) {
    //console.log(d);
    d3.selectAll('#tooltip')
      .style('opacity', 0.9)
      .style('left', e.pageX + 'px')
      .style('top', e.pageY - 28 + 'px')
      .attr('data-year', d.Year)
      .html('<p>'+ d.Name + ': '
                 + d.Nationality + '<br>' 
                 + 'Year: '+ d.Year 
                 + ', Time: '+ timeFormat(d.Time) 
                 + (d.Doping ? `<br/><br/><span class='doping-label'>` + d.Doping +'</span>' : '')
            +'</p>');
  })
            .on('mouseout', function (e, d) {                                       
              d3.selectAll('#tooltip')
                .style('opacity', 0)
                .style('left', 0)
                .style('top', 0); 
            });
};

const createLegendAxes = () => {
  
    svgContainer.append('text')
                .attr('transform', 'rotate(-90)')
                .attr('x', -150)
                .attr('y', -48)
                .style('font-size',16)
                .text("Time in minutes");
  
  svgContainer.append('text')                
                .attr('x', width-45)
                .attr('y', height +30)
                .style('font-size',16)
                .text("Year");
};

const createLegendColors = () => {
  var legendContainer = svgContainer.append('g').attr('id','legend');
  
  var legend = legendContainer.selectAll('#legend')
                 .data(color.domain())
                 .enter()
                 .append('g')
                 .attr('class', 'legend-label')
                 .attr('transform' , function (d, i) {
                    return 'translate(0,'+ (height/2 - i *20) +')';
                  });
  
  legend.append('rect')
        .attr('x', width - 20)
        .attr('height', 20)
        .attr('width', 20)
        .attr('fill', color);
  
  legend.append('text')
        .attr('x', width - 25)
        .attr('y', 9)
        .attr('dy','0.35em')
        .style('text-anchor', 'end')
        .text(function (d) {
          //console.log(d); //true, false
            if(d){
              return "Riders with doping allegations";
            } else {
               return "No doping allegations";
            } 
        });
};

const sendResquestData = (xmlhtpps) => {
  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
  const method = "GET";
  xmlhtpps.open(method, url, true);
  return xmlhtpps; 
}

xmlhtpps.onload = () => {
    const dataset = JSON.parse(xmlhtpps.responseText);
    dataset.forEach( function (d) {
    d.Place =+ d.Place; 
    var parseTime = d.Time.split(':');
    d.Time = new Date(1970, 0, 1, 0, parseTime[0], parseTime[1]);
  });
  //console.log(dataset);
  const scales = defineScales(dataset); //{ xScale, yScale}
  createAxes(scales);
  createGraph(dataset, scales);
  createLegendAxes();
  createLegendColors();
}

const leadingGraphic = () => {
  createTitle();
  svgContainer = createCanvas();
  createTooltip();
  xmlhtpps = sendResquestData(xmlhtpps);
  xmlhtpps.send();
};

leadingGraphic();