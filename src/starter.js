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
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physic",
];
const radius = [0, 25, 50, 75, 100];

const angleScale = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

//color
const pointColor = "#42e695";

// line radial
const radarLine = d3
  .lineRadial()
  .angle((d, i) => angleScale(i))
  .curve(d3.curveCardinalClosed)
  .radius((d) => radiusScale(selectedPlayer[d]));

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////

// data

let data = [];
let selectedPlayer; //레이더차트 만드는 데이터

let radiusAxis, angleAxis, labels;
let path;

let players;
let selectedName = "H. Son";

d3.json("data/fifa23_maleplayers.json").then((raw_data) => {
  data = raw_data.filter((d) => d.overall > 85); //데이터 필터링
  selectedPlayer = data.filter((d) => d.short_name == selectedName)[0]; //원하는 선수 필터링
  // console.log(selectedPlayer);

  players = [...new Set(data.map((d) => d.short_name))];
  // console.log(players);

  const dropdown = document.getElementById("options");

  players.map((d) => {
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
    updatePlayer(); //updatePlayer 함수실행
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
    .attr("fill-opacity", 0.03)
    .attr("stroke", "white")
    .attr("stroke-opacity", 0.3)
    .attr("stroke-width", 0.5);

  angleAxis = g
    .selectAll("angle-axis")
    .data(attributes)
    .enter()
    .append("line")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", (d, i) => getXPos(100, i)) //d는 데이터 하나하나, i는 순서
    .attr("y2", (d, i) => getYPos(100, i)) //최대가 100이라서
    .attr("stroke", "white")
    .attr("stroke-opacity", 0.3)
    .attr("stroke-width", 0.5);

  labels = g
    .selectAll("labels")
    .data(attributes)
    .enter()
    .append("text")
    .attr("x", (d, i) => getXPos(120, i)) //숫자는 100보다만 크면 됨
    .attr("y", (d, i) => getYPos(120, i))
    .text((d) => d)
    .attr("class", "labels")
    .attr("fill", "white")
    .attr("fill-opacity", 0.3);

  path = g
    .append("path")
    .datum(attributes)
    .attr("d", radarLine)
    .attr("fill", pointColor)
    .attr("stroke", pointColor)
    .attr("stroke-width", 1.3)
    .style("fill-opacity", 0.25);

  d3.select("#player-name").text(selectedPlayer.long_name);
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

const updatePlayer = () => {
  selectedPlayer = data.filter((d) => d.short_name == selectedName)[0];
  console.log(selectedPlayer);

  radarLine.radius((d) => radiusScale(selectedPlayer[d]));

  path.transition().duration(500).attr("d", radarLine); //duration(1000)이 1초

  d3.select("#player-name").text(selectedPlayer.long_name);
};

// Resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));
  // console.log(width + ", " + height);
  g.attr("transform", `translate(${width / 2}, ${height / 2})`);

  //scale
  minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
  radiusScale.range([0, minLen]);

  //axis
  radiusAxis.attr("r", (d) => radiusScale(d));

  angleAxis
    .attr("x2", (d, i) => getXPos(100, i))
    .attr("y2", (d, i) => getYPos(100, i));

  radarLine.radius((d) => radiusScale(selectedPlayer[d]));

  path.attr("d", radarLine);

  labels
    .attr("x", (d, i) => getXPos(120, i)) //숫자는 100보다만 크면 됨
    .attr("y", (d, i) => getYPos(120, i));
});
