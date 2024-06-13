function _1(md){return(
md`# CountrySciProud
Explore "Proyecto CountrySciProd" by AlexanderRV22 on Observable, a comprehensive project offering a visualization of global scientific production. This interactive notebook utilizes data visualization to illustrate various metrics and trends, enabling viewers to devise new perspectives on how countries contribute to scientific research. Ideal for researchers, educators, and policymakers interested in understanding and comparing scientific productivity worldwide.
### use
In this case we use the logarithmic scale to color the map. People who want to color according to their own frequencies can edit the file in use.

View the full project [here](https://observablehq.com/d/0e8735a115d6d3f7).

`
)}

function _chart(d3,DOM,scale,topojson,world,data,countryCodes,Legend)
{
  const width = 960;
  const height = 600;
  const path = d3.geoPath(d3.geoEquirectangular());
  let active = d3.select(null);

  const svg = d3.select(DOM.svg(width, height))
      .style("width", "100%")
      .style("height", "auto");

  const color = scale
  
  var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);
  
  svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "transparent")
    .on("click", reset);
  
  const g = svg.append( "g" );
  
  g.selectAll("path")
      .data(topojson.feature(world, world.objects.countries).features)
      .enter().append("path")
        .attr("fill", d => {
            let freq = 0;
          
        data.find( (pais, index) =>{
          let toReturn = pais.C == d.id
          if (toReturn){
            freq = pais.B
          }
          return toReturn
        });
          
            if (!freq) return color(0.2);
            return color(freq);
        
        })
        .attr("stroke", "black")
        .attr("stroke-linejoin", "round")
        .attr("d", path)
        .on("click", clicked)
        .append("title")
          .text(d => {
            let freq = 0;
          
        data.find( (pais, index) =>{
          let toReturn = pais.C == d.id
          if (toReturn){
            freq = pais.B
          }
          return toReturn
        });
            const code = countryCodes.find(c => c["country-code"] === d.id);
            let thisname = !code ? "unknown": code.name ;
            
          
            if (!freq) return thisname + ": " + 0;
            return thisname + ": " + freq;
        
        });

  function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];
    console.log("scale: ", scale);
    svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity.translate(translate[0],translate[1]).scale(scale) );
  }

  function reset() {
    active.classed("active", false);
    active = d3.select(null);
    svg.transition()
        .duration(750)
        .call( zoom.transform, d3.zoomIdentity );
  }
  
  function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    g.attr("transform", d3.event.transform);
  }
  
 svg.append("g")
      .attr("transform", "translate(650, 380)") 
      .append(() => {  return Legend(scale, {
  title: "CountrySciProd",
  ticks: 3,
  tickFormat :".0f"
})
             
             
             
             
                    });
  return svg.node();
}


function _workbook(FileAttachment){return(
FileAttachment("slim-2-2-2-1@3.xlsx").xlsx()
)}

function _customInterpolator(d3){return(
d3.interpolateRgb("cyan", "blue")
)}

function _scale(d3,customInterpolator,maxElement){return(
d3.scaleSequentialLog(customInterpolator).domain([0.2, maxElement+10])
)}

function _world(d3){return(
d3.json("https://unpkg.com/world-atlas@1/world/110m.json")
)}

function _topojson(require){return(
require("topojson-client@3")
)}

function _countryCodes(d3){return(
d3.json("https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-2/slim-2.json")
)}

function _d3(require){return(
require("d3@5")
)}

function _Legend(d3){return(
function Legend(color, {
  title,
  tickSize = 6,
  width = 300, 
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? d3.format(tickFormat)
        : tickFormat;

    x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title));

  return svg.node();
}
)}

function _11(workbook){return(
workbook.sheetNames
)}

function _data(workbook){return(
workbook.sheet(0, {
    headers: false,
    // range: "A1:J10"
  })
)}

function _maxElement(data){return(
data.reduce((max, current) => {
  return max > current.B ? max: current.B;
}, data[0].B)
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["slim-2-2-2-1@3.xlsx", {url: new URL("./files/2a368c335add52e85ba5b528d805961dca0e2bfe6a8a41551ccf852cbb1b4699320ec000ed6f1e805d163491f28d3764507a6f4ac76bc8574b1a73ccf6c28926.xlsx", import.meta.url), mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("chart")).define("chart", ["d3","DOM","scale","topojson","world","data","countryCodes","Legend"], _chart);
  main.variable(observer("workbook")).define("workbook", ["FileAttachment"], _workbook);
  main.variable(observer("customInterpolator")).define("customInterpolator", ["d3"], _customInterpolator);
  main.variable(observer("scale")).define("scale", ["d3","customInterpolator","maxElement"], _scale);
  main.variable(observer("world")).define("world", ["d3"], _world);
  main.variable(observer("topojson")).define("topojson", ["require"], _topojson);
  main.variable(observer("countryCodes")).define("countryCodes", ["d3"], _countryCodes);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  main.variable(observer("Legend")).define("Legend", ["d3"], _Legend);
  main.variable(observer()).define(["workbook"], _11);
  main.variable(observer("data")).define("data", ["workbook"], _data);
  main.variable(observer("maxElement")).define("maxElement", ["data"], _maxElement);
  return main;
}
