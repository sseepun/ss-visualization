import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';
import * as d3contour from 'd3-contour';

import { worldTemperature } from '../dataset/world-temperature';

@Component({
  selector: 'app-ss-temperature',
  templateUrl: './ss-temperature.component.html',
  styleUrls: ['./ss-temperature.component.css']
})
export class SsTemperatureComponent implements OnInit, OnDestroy {

  private host;
  private svg;
  private workspace;
  private width = 1000;
  private height = 580;

  private n = 180;
  private m = 90;

  private dataset;
  private range;
  private contour;
  private geoPath;

  selected = 0;
  months = ['January'];
  private colors = [
    '#5e4fa2', '#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#ffffff', 
    '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142'
  ];
  private colorScale;

  private count = 0;
  private animation = true;
  private timeout;
  private stroke = 'none';

  constructor(
    private elementRef: ElementRef
  ) { }

  ngOnInit() {
    this.host = d3.select(this.elementRef.nativeElement).select('.graph-container');
    this.svg = this.host.append('svg')
      .attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', 'xMidYMid')
      .attr('viewBox', '0 0 '+this.width+' '+this.height);
    this.workspace = this.svg.append('g').attr('class', 'workspace')
      .attr('transform', 'translate('+(0.05*this.width)+','+(0.1*this.width)+')');
    this.generateDataset();
    this.setup();
  }

  setup() {
    this.setupBackground();
    this.setupWorldScale();
    
    this.contour = d3contour.contours()
      .size([this.n, this.m])
      .thresholds(d3.range(-19, 10).map(d=>{
        if (d==-19) return this.range[0];
        else if (d==9) return this.range[1];
        else return d*4;
      }));
    this.geoPath = d3.geoPath(d3.geoIdentity().scale(0.95*this.width / this.n));
  
    this.workspace.selectAll('path.contour').data(this.contour(this.dataset)).enter()
      .append('path').attr('class', 'contour')
        .attr('d', this.geoPath).style('stroke', this.stroke)
        .attr('fill', d=>this.colorScale(d.value))
        .on('mouseenter', (d,i,doms)=>{
          if (d.value!=0) d3.select(doms[i]).style('stroke', 'black');
        })
        .on('mouseleave', (d,i,doms)=>{
          if (d.value!=0) d3.select(doms[i]).style('stroke', this.stroke);
        });

    this.temperatureAnimation();
  }
  setupBackground() {
    let bgSpace = this.svg.insert('g', '.workspace').attr('class', 'bg-space');

    let oneBlock = 0.045 * this.width,
        smallBlock = oneBlock * 0.4;
    bgSpace.append('rect').attr('class', 'scale-bg')
      .attr('width', smallBlock*12).attr('height', oneBlock)
      .attr('rx', 0.15*oneBlock).attr('ry', 0.15*oneBlock);
    for (let i=0; i<11; i++) {
      bgSpace.append('rect')
        .attr('x', smallBlock*(1/2 + i)).attr('y', 0.15*oneBlock)
        .attr('width', smallBlock*0.9).attr('height', smallBlock*0.9)
        .style('fill', this.colors[i])
    }
    bgSpace.append('text').attr('x', smallBlock/2).attr('y', 0.88*oneBlock).style('font-wight', 600)
      .style('font-size', 0.3*oneBlock).html(this.range[0]+'&#8451;');
    bgSpace.append('text')
      .attr('x', smallBlock*11.5).attr('y', 0.88*oneBlock).style('font-size', 0.3*oneBlock)
      .style('font-wight', 600).style('text-anchor', 'end').html(this.range[1]+'&#8451;');
  }
  setupWorldScale() {
    let width = 0.95*this.width - 1,
        height = 0.4755*this.width;
    let scaleSpace = this.svg.append('g').attr('class', 'scale-space')
      .attr('transform', 'translate('+(0.05*this.width)+','+(0.1*this.width)+')');

    let pad = 0.01*this.width,
        lats = d3.range(-3, 4).map(d=>d*30),
        latScale = d3.scaleLinear().domain([90, -90]).range([0, height]),
        lons = d3.range(-6, 7).map(d=>d*30),
        lonScale = d3.scaleLinear().domain([-180, 180]).range([0, width]);
    scaleSpace.selectAll('line.lat-line').data(lats).enter().append('line').attr('class', 'lat-line')
      .classed('line-small', d=>d%30!=0)
      .attr('x1', d=>{if(d%30==0)return -pad;else return 0;}).attr('y1', d=>latScale(d))
      .attr('x2', width).attr('y2', d=>latScale(d));
    scaleSpace.selectAll('text.lat-text').data(lats).enter().append('text').attr('class', 'lat-text')
      .attr('x', -1.5*pad).attr('y', d=>latScale(d)+0.01*height)
      .style('font-size', 0.03*height).html(d=>d+'&#176;');
    scaleSpace.selectAll('line.lon-line').data(lons).enter().append('line').attr('class', 'lon-line')
      .classed('line-small', d=>d%60!=0)
      .attr('x1', d=>lonScale(d)).attr('y1', d=>{if(d%60==0)return -pad;else return 0;})
      .attr('x2', d=>lonScale(d)).attr('y2', height);
    scaleSpace.selectAll('text.lon-text').data(lons).enter().append('text').attr('class', 'lon-text')
      .attr('x', d=>lonScale(d)).attr('y', -1.5*pad)
      .style('font-size', 0.03*height).html(d=>d+'&#176;');

    scaleSpace.append('line')
      .attr('x1', 0).attr('x2', width).attr('y1', height).attr('y2', height)
      .style('stroke', 'black').style('stroke-width', 2);
  }

  update() {
    this.dataset= worldTemperature['2014'][this.months[this.selected]];

    let paths = this.workspace.selectAll('path.contour').data(this.contour(this.dataset));
    paths.exit().remove();
    paths.enter().append('path').attr('class', 'contour')
      .attr('d', this.geoPath).style('stroke', this.stroke)
      .attr('fill', d=>this.colorScale(d.value))
      .on('mouseenter', (d,i,doms)=>{
        if (d.value!=0) d3.select(doms[i]).style('stroke', 'black');
      })
      .on('mouseleave', (d,i,doms)=>{
        if (d.value!=0) d3.select(doms[i]).style('stroke', this.stroke);
      });
    paths
      .attr('d', this.geoPath).style('stroke', this.stroke)
      .attr('fill', d=>this.colorScale(d.value));
  }

  temperatureAnimation() {
    if (this.animation) {
      this.selected = (this.selected + 1) % this.months.length;
      this.update();

      setTimeout(()=>{
        this.count += 1;
        if (this.count > 23) {
          this.count = 0;
          this.animation = false;
        }
        this.temperatureAnimation();
      }, 200);
    }
  }

  generateDataset() {
    this.dataset = worldTemperature['2014'].January;

    this.months = Object.keys(worldTemperature['2014']);
    let maxArray = [], 
        minArray = [];
    this.months.map(month=>{
      maxArray.push(d3.max(worldTemperature['2014'][month]));
      minArray.push(d3.min(worldTemperature['2014'][month]));
    });

    let max = Math.ceil(d3.max(maxArray)),
        min = Math.floor(d3.min(minArray)),
        stepPlus = Math.abs(max) / 5,
        stepMinus = Math.abs(min) / 5;
    this.range = [min, max];
    let domain = [
      min, min+1*stepMinus, min+2*stepMinus, min+3*stepMinus, min+4*stepMinus, 0,
      max-4*stepPlus, max-3*stepPlus, max-2*stepPlus, max-1*stepPlus, max
    ];
    this.colorScale = d3.scaleLinear().domain(domain).range(this.colors);
  }

  selectedMonthChange(sliderValue) {
    clearTimeout(this.timeout);
    this.count = 0;
    this.animation = false;    

    this.selected = sliderValue - 1;
    this.update();

    this.timeout = setTimeout(()=>{
      this.animation = true;
      this.temperatureAnimation();
    }, 4000);
  }
  strokeChange(stroke) {
    this.stroke = stroke;
    this.workspace.selectAll('path.contour').style('stroke', this.stroke);
  }

  ngOnDestroy() {
    this.animation = false;
  }

}
