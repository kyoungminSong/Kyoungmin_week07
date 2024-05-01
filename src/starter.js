import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////

// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 65, right: 50, bottom: 65, left: 50 };
// console.log(width + "," + height);

// group
const g = svg
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`); //그룹으로 묶어서 이동

// scale
let minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]); //높이와 너비 중 짧은 값을 자동으로 결정
const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, minLen]);
const attributes = [
  "Quality",
  "Speed",
  "Value",
  "Healthy",
  "Clean",
  "Friendly",
  "Curb",
  "Atmosphere",
];
const radius = [0, 25, 50, 75, 100];

const angleScale = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

//color
const pointColor = "rgb(255, 135, 51)";

// line radial
const radarLine = d3
  .lineRadial()
  .angle((d, i) => angleScale(i))
  .curve(d3.curveCardinalClosed)
  .radius((d) => radiusScale(selectedBurger[d]));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////

// data

let data = [];
let selectedBurger; //레이더차트 만드는 데이터

let radiusAxis, angleAxis, labels;
let path;

let burgers;
let selectedName = "Five Guys";

d3.json("data/best_burgers.json").then((raw_data) => {
  data = raw_data;

  burgers = [...new Set(data.map((d) => d.Brand))];
  // console.log(burgers);

  selectedBurger = data.filter((d) => d.Brand == selectedName)[0];

  const dropdown = document.getElementById("options");

  burgers.map((d) => {
    const option = document.createElement("option");
    option.value = d; //value=컴퓨터가 인식하는 데이터
    option.innerHTML = d; //innerHTML=페이지에 나타나는 값
    option.selected = d === selectedName ? true : false; //조건?A:B -> true이면 A, false이면 B (dropdown에서 무엇이 선택되는지)
    //option.selected = d === 'Neymar Jr' ? true : false;
    dropdown.appendChild(option);
  });

  dropdown.addEventListener("change", function () {
    selectedName = dropdown.value;
    // console.log(selectedName);
    updateBrand(); //update 함수실행
  });

  // axis
  radiusAxis = g
    .selectAll("radius-axis")
    .data(radius)
    .enter() //데이터를 넣어주겠다는 뜻
    .append("circle") //축을 circle로 정의
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", (d) => radiusScale(d))
    .attr("fill", "white")
    .attr("fill-opacity", 0.01)
    .attr("stroke", "rgb(141, 92, 62")
    .attr("stroke-opacity", 0.3)
    .attr("stroke-width", 0.3);

  angleAxis = g
    .selectAll("angle-axis")
    .data(attributes)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => getXPos(100, i)) //d는 데이터 하나하나, i는 순서
    .attr("y2", (d, i) => getYPos(100, i)) //최대가 100이라서
    .attr("stroke", "rgb(141, 92, 62")
    .attr("stroke-opacity", 1)
    .attr("stroke-width", 0.1);

  labels = g
    .selectAll("labels")
    .data(attributes)
    .enter()
    .append("text")
    .attr("x", (d, i) => getXPos(120, i)) //숫자는 100보다만 크면 됨
    .attr("y", (d, i) => getYPos(120, i))
    .text((d) => d)
    .attr("class", "labels")
    .attr("fill", "rgb(141, 92, 62)")
    .attr("fill-opacity", 0.8);

  path = g
    .append("path")
    .datum(attributes)
    .attr("d", radarLine)
    .attr("fill", pointColor)
    .attr("stroke", pointColor)
    .attr("stroke-width", 2)
    .style("fill-opacity", 0.3);

  d3.select("#burger-name").text(selectedBurger.Brand);
});

////// function
const getXPos = (dist, index) => {
  // radius * cos (theta)
  return radiusScale(dist) * Math.cos(angleScale(index) - Math.PI / 2); //90도를 빼줌
};

const getYPos = (dist, index) => {
  // radius * sin (theta)
  return radiusScale(dist) * Math.sin(angleScale(index) - Math.PI / 2);
};

////////////////////////////////////////////////////////////////////
/////////////////////////////  Update  /////////////////////////////

const updateBrand = () => {
  selectedBurger = data.filter((d) => d.Brand == selectedName)[0];
  // console.log(selectedBurger);

  radarLine.radius((d) => radiusScale(selectedBurger[d]));

  path.transition().duration(500).attr("d", radarLine); //duration(1000)이 1초

  d3.select("#burger-name").text(selectedBurger.Brand);
};

// // Resize
// window.addEventListener("resize", () => {
//   width = parseInt(d3.select("#svg-container").style("width"));
//   height = parseInt(d3.select("#svg-container").style("height"));
//   // console.log(width + ", " + height);
//   g.attr("transform", `translate(${width / 2}, ${height / 2})`);

//   //scale
//   minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
//   radiusScale.range([0, minLen]);

//   //axis
//   radiusAxis.attr("r", (d) => radiusScale(d));

//   angleAxis
//     .attr("x2", (d, i) => getXPos(100, i))
//     .attr("y2", (d, i) => getYPos(100, i));

//   radarLine.radius((d) => radiusScale(selectedBurger[d]));

//   path.attr("d", radarLine);

//   labels
//     .attr("x", (d, i) => getXPos(120, i)) //숫자는 100보다만 크면 됨
//     .attr("y", (d, i) => getYPos(120, i));
// });
