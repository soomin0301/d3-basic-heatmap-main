import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

svg
  .append("text")
  .attr("x", 90) // x 위치
  .attr("y", 50) // y 위치
  .style("text-anchor", "middle")
  .text("Northern hemisphere");

svg
  .append("text")
  .attr("x", 90) // x 위치
  .attr("y", 200) // y 위치
  .style("text-anchor", "middle")
  .text("Southern hemisphere");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));

const margin = { top: 20, right: 20, bottom: 100, left: 10 };
// scale
const xScale = d3
  .scaleBand()
  .range([margin.left, width - margin.right])
  .paddingInner(0.1);

const colorScale = d3
  .scaleSequential()
  .domain([0.8, -0.8])
  .interpolator(d3.interpolateRgbBasis(["pink", "white", "skyblue"]));

const xLegendScale = d3
  .scaleBand()
  .range([width / 2 - 140, width / 2 + 140])
  .paddingInner(0.1);
// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data
let rects;
let rects1;
let data = [];
let data1 = [];
let data2 = [];
let xAxis;
let legendRects;
let legendLabels;
let legendData;

d3.csv("data/temperature-anomaly-data.csv").then((raw_data) => {
  console.log(raw_data);

  data = raw_data
    .filter((d) => d.Entity == "Global")
    .map((d) => {
      const obj = {};
      obj.year = parseInt(d.Year);
      obj.avg = +d["Global average temperature anomaly relative to 1961-1990"];
      return obj;
    });
  data1 = raw_data
    .filter((d) => d.Entity == "Northern hemisphere")
    .map((d) => {
      const obj1 = {};
      obj1.year = parseInt(d.Year);
      obj1.avg = +d["Global average temperature anomaly relative to 1961-1990"];
      return obj1;
    });

  data2 = raw_data
    .filter((d) => d.Entity == "Southern hemisphere")
    .map((d) => {
      const obj2 = {};
      obj2.year = parseInt(d.Year);
      obj2.avg = +d["Global average temperature anomaly relative to 1961-1990"];
      return obj2;
    });

  legendData = d3.range(
    d3.min(data, (d) => d.avg),
    d3.max(data, (d) => d.avg),
    0.2
  );
  console.log(legendData);

  xScale.domain(data.map((d) => d.year));

  xAxis = d3
    .axisBottom(xScale)
    .tickValues(xScale.domain().filter((d) => !(d % 10))); //!반대되는 값만 뽑는 거
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .attr("class", "x-axis")
    .call(xAxis);

  var div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip-data")
    .style("opacity", 0);

  rects = svg
    .selectAll("rects")
    .data(data1)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.year))
    .attr("y", margin.top + 40)
    .attr("width", xScale.bandwidth())
    .attr("height", height - margin.top - margin.bottom - 200)
    .attr("fill", (d) => colorScale(d.avg))
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration("50").attr("opacity", ".85");
      div.transition().duration(50).style("opacity", 1);

      // 페이지 상의 X 좌표 가져오기
      let pageX =
        event.pageX ||
        event.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;

      // 페이지 상의 Y 좌표 가져오기
      let pageY =
        event.pageY ||
        event.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop;

      div
        .html("Year: " + d.year + "<br>Avg:" + d.avg)
        .style("font-size", "8pt")
        .style("left", pageX + 10 + "px")
        .style("top", pageY - 15 + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).transition().duration("50").attr("opacity", "1");
      div.transition().duration("50").style("opacity", 0);
    }); //선택시 투명도

  rects1 = svg
    .selectAll("rects1")
    .data(data2)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.year))
    .attr("y", margin.bottom + 110)
    .attr("width", xScale.bandwidth())
    .attr("height", height - margin.top - margin.bottom - 200)
    .attr("fill", (d) => colorScale(d.avg))
    .on("mouseover", function (event, d) {
      d3.select(this).transition().duration("50").attr("opacity", ".85");
      div.transition().duration(50).style("opacity", 1);

      let pageX =
        event.pageX ||
        event.clientX +
          document.body.scrollLeft +
          document.documentElement.scrollLeft;

      let pageY =
        event.pageY ||
        event.clientY +
          document.body.scrollTop +
          document.documentElement.scrollTop;

      div
        .html("Year: " + d.year + "<br>Avg:" + d.avg)
        .style("font-size", "8pt")
        .style("left", pageX + 10 + "px")
        .style("top", pageY - 15 + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).transition().duration("50").attr("opacity", "1");
      div.transition().duration("50").style("opacity", 0);
    });

  xLegendScale.domain(legendData.map((d, i) => i));

  legendRects = svg
    .selectAll("legend-lables")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", (d, i) => xLegendScale(i))
    .attr("y", height - margin.bottom + 50)
    .attr("width", xLegendScale.bandwidth())
    .attr("height", 20)
    .attr("fill", (d) => colorScale(d));

  legendLabels = svg
    .selectAll("legend-labels")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", (d, i) => xLegendScale(i) + xLegendScale.bandwidth() / 2) //중간위치
    .attr("y", height - margin.bottom + 65)
    .text((d) => d3.format("0.1f")(d))
    .attr("class", "legend-labels")
    .style("fill", (d) => (d >= 1 ? "#fff" : "#111"));
});

////////////////////////////  Resize  //////////////////////////////
// Resize 이벤트에 대응하여 그래프 업데이트
window.addEventListener("resize", () => {
  // SVG 요소의 크기 업데이트
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  // x, y 축의 스케일 및 위치 업데이트
  xScale.range([margin.left, width - margin.right]);
  xLegendScale.range([width / 2 - 140, width / 2 + 140]);

  svg
    .select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  // heatmap 업데이트

  rects
    .attr("x", (d) => xScale(d.year))
    .attr("y", margin.top + 40)
    .attr("width", xScale.bandwidth())
    .attr("height", height - margin.top - margin.bottom - 200);

  rects1
    .attr("x", (d) => xScale(d.year))
    .attr("y", margin.bottom + 110)
    .attr("width", xScale.bandwidth())
    .attr("height", height - margin.top - margin.bottom - 200);

  // rects1
  //   .attr("x", (d) => xScale(d.year))
  //   .attr("y", margin.bottom + 110)
  //   .attr("width", xScale.bandwidth())
  //   .attr("height", height - margin.top - margin.bottom - 200);

  // 레전드 업데이트
  legendRects
    .attr("x", (d, i) => xLegendScale(i))
    .attr("y", height - margin.bottom + 50)
    .attr("width", xLegendScale.bandwidth());

  legendLabels
    .attr("x", (d, i) => xLegendScale(i) + xLegendScale.bandwidth() / 2)
    .attr("y", height - margin.bottom + 65);
});
