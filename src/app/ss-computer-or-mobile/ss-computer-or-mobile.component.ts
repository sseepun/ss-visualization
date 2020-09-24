import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

import { thaiMap } from '../dataset/thai-map';

@Component({
  selector: 'app-ss-computer-or-mobile',
  templateUrl: './ss-computer-or-mobile.component.html',
  styleUrls: ['./ss-computer-or-mobile.component.css']
})
export class SsComputerOrMobileComponent implements OnInit {

  private host;
  private svg;
  private workspace;
  private width = 1000;
  private height = 620;
  private colorSet = [];

  private dataset;
  private transitionTime = 325;
  private colors = [
    '#5e4fa2', '#3288bd', '#66c2a5', '#abdda4', '#e6f598', '#f6faaa', 
    '#fee08b', '#fdae61', '#f46d43', '#d53e4f', '#9e0142'
  ];

  private clickable = false;
  private criteria = {state: '', type: ''};
  private timeout;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.host = d3.select(this.elementRef.nativeElement).select('.graph-container');
    this.svg = this.host.append('svg')
      .attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', 'xMidYMid')
      .attr('viewBox', '0 0 '+this.width+' '+this.height);
    this.workspace = this.svg.append('g').attr('class', 'workspace');
    this.generateDataset();
    this.setup();
  }

  generateDataset() {
    this.dataset = thaiMap.features.slice(0, thaiMap.features.length);
    this.dataset = this.dataset.map(d=>{
      let value = d.properties,
          pop = value.pop,
          users = pop * (0.5 + 0.45*Math.random()),
          mobileProb = 0.5 + 0.2*Math.random();
      let mobileUsers = users * mobileProb,
          computerUsers = users - mobileUsers;
      return {
        name: value.name,
        pop: pop,
        mobile: {
          mon: this.generateOneDayData(mobileUsers*(0.7+0.3*Math.random())),
          tue: this.generateOneDayData(mobileUsers*(0.7+0.3*Math.random())),
          wed: this.generateOneDayData(mobileUsers*(0.7+0.3*Math.random())),
          thu: this.generateOneDayData(mobileUsers*(0.7+0.3*Math.random())),
          fri: this.generateOneDayData(mobileUsers*(0.7+0.3*Math.random())),
          sat: this.generateOneDayData(mobileUsers*(0.7+0.3*Math.random())),
          sun: this.generateOneDayData(mobileUsers*(0.7+0.3*Math.random()))
        },
        computer: {
          mon: this.generateOneDayData(computerUsers*(0.7+0.3*Math.random())),
          tue: this.generateOneDayData(computerUsers*(0.7+0.3*Math.random())),
          wed: this.generateOneDayData(computerUsers*(0.7+0.3*Math.random())),
          thu: this.generateOneDayData(computerUsers*(0.7+0.3*Math.random())),
          fri: this.generateOneDayData(computerUsers*(0.7+0.3*Math.random())),
          sat: this.generateOneDayData(computerUsers*(0.7+0.3*Math.random())),
          sun: this.generateOneDayData(computerUsers*(0.7+0.3*Math.random()))
        }
      };
    });
  }
  generateOneDayData(maxUsers) {
    let result = [],
        PI = Math.PI;
    for (let i=0; i<24; i++) {
      let prob = 0.7*Math.sin(PI * Math.abs(2 - i)/25) + 0.3*Math.random();
      result.push(Math.round(maxUsers * prob));
    }
    return result;
  }

  setup() {
    let data = this.heatmapDataFormat(this.criteria),
        oneBlock = this.width / 25,
        clock = [
          '12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
          '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'
        ],
        days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    let range = this.heatmapRange(data),
        colorScale = d3.scaleLinear().domain(range).range([0, 10]);

    let smallBlock = oneBlock * 0.4;
    this.workspace.append('rect').attr('class', 'scale-bg')
      .attr('width', smallBlock*12).attr('height', oneBlock)
      .attr('rx', 0.15*oneBlock).attr('ry', 0.15*oneBlock);
    for (let i=0; i<11; i++) {
      this.workspace.append('rect')
        .attr('x', smallBlock*(1/2 + i)).attr('y', 0.15*oneBlock)
        .attr('width', smallBlock*0.9).attr('height', smallBlock*0.9)
        .style('fill', this.colors[i])
    }
    this.workspace.append('text')
      .attr('x', smallBlock/2).attr('y', 0.87*oneBlock).style('font-size', 0.33*oneBlock).text('low users');
    this.workspace.append('text')
      .attr('x', smallBlock*11.5).attr('y', 0.87*oneBlock).style('font-size', 0.33*oneBlock)
      .style('text-anchor', 'end').text('high users');

    this.workspace.selectAll('text.time-label').data(clock).enter().append('text').attr('class', 'time-label')
      .attr('x', (d,i)=>{return (1.475 + i)*oneBlock}).attr('y', 1.75*oneBlock)
      .style('font-size', 0.375*oneBlock).text(d=>{return d});
    this.workspace.selectAll('text.day-label').data(days).enter().append('text').attr('class', 'day-label')
      .attr('x', oneBlock * 0.75).attr('y', (d,i)=>{return (2.65 + i)*oneBlock})
      .style('font-size', 0.375*oneBlock).text(d=>{return d});

    let heatmap = this.workspace.append('g').attr('class', 'heatmap')
        .attr('transform', 'translate('+(oneBlock)+','+(2*oneBlock)+')');
    days.map((day,i)=>{
      let dayRow = heatmap.append('g').attr('class', 'day').attr('id', day)
        .attr('transform', 'translate(0,'+(i*oneBlock)+')');
      dayRow.selectAll('rect.heatblock').data(data[day]).enter().append('rect').attr('class', 'heatblock')
        .attr('id', (k,j)=>{return day+'-'+j})
        .attr('width', 0.94*oneBlock).attr('height', 0.94*oneBlock)
        .style('rx', 0.1*oneBlock).style('ry', 0.1*oneBlock)
        .attr('x', (k,j)=>{return j*oneBlock})
        .on('mouseenter', (k,j)=>{
          clearTimeout(this.timeout);
          this.barChartHover(data, day, j);
        })
        .on('mouseleave', ()=>{
          this.timeout = setTimeout(()=>{this.barChartLeave(data)}, 200);
        })
        .transition().duration(this.transitionTime).delay((k,j)=>{return 200 + 25*i + 25*j}).ease(d3.easeExpIn)
          .attr('width', 0).attr('x', (k,j)=>{return (j + 1/2)*oneBlock})
          .on('end', (k,j)=>{
            dayRow.select('#'+day+'-'+j).style('fill', m=>{return this.heatmapColor(m, colorScale)})
              .transition().duration(this.transitionTime).ease(d3.easeExpOut)
                .attr('width', 0.94*oneBlock).attr('x', j*oneBlock);
          });
    });

    this.setupThaiMap();
    this.setupCriteriaButtons();
    this.setupPieChart();
    this.setupBarChart(data);

    d3.timeout(()=>{this.clickable = true}, 1300);
  }
  setupThaiMap() {
    let height = this.height - 9.25*this.width/25,
        width = 0.2*this.width;
    let mapSpace = this.svg.append('g').attr('class', 'map-space')
      .attr('transform', 'translate(0,'+(9.25*this.width/25)+')');

    let projection = d3.geoMercator().scale(950)
      .rotate([-100.6331, -13.2]).translate([width*0.45, height*0.49]);
    let geoPath = d3.geoPath().projection(projection);

    mapSpace.selectAll('path.province').data(thaiMap.features).enter().append('path')
      .attr('class', 'province').attr('id', d=>{return this.stringToId(d.properties.name)})
      .attr('d', geoPath)
      .on('click', d=>{
        if (this.clickable) {
          this.clickable = false;

          if (this.criteria.state!=d.properties.name) {
            this.criteria.state = d.properties.name;
            mapSpace.selectAll('.province').classed('active', false);
            mapSpace.select('.province#'+this.stringToId(d.properties.name)).classed('active', true);
            this.svg.select('.btn-space').select('.thai-btn').classed('active', false);
          } else {
            this.criteria.state = '';
            mapSpace.select('.province#'+this.stringToId(d.properties.name)).classed('active', false);
            this.svg.select('.btn-space').select('.thai-btn').classed('active', true);
          }
          this.update();
        }
      });
  }
  setupCriteriaButtons() {
    let height = this.height - 9.25*this.width/25,
        width = 0.14*this.width;
    let btnSpace = this.svg.append('g').attr('class', 'btn-space')
      .attr('transform', 'translate('+(0.2*this.width)+','+(9.25*this.width/25)+')');

    let btnSet = [
      {desc: 'All devices', value: '', h: 0.2*height, y: 0.0333*height, w: 0.6*width},
      {desc: 'Mobile', value: 'mobile', h: 0.2*height, y: 0.2666*height, w: 0.6*width},
      {desc: 'Computer', value: 'computer', h: 0.2*height, y: 0.5*height, w: 0.6*width}
    ];
    let btns = btnSpace.selectAll('g.btn').data(btnSet).enter().append('g').attr('class', 'btn')
      .attr('id', (d,i)=>{return 'btn'+i}).classed('active', (d,i)=>{return i==0})
      .attr('transform', d=>{return 'translate('+((width - d.w)/2)+','+(d.y)+')'});
    btns.append('rect').attr('class', 'btn-rect')
      .attr('width', d=>{return d.w}).attr('height', d=>{return d.h})
      .attr('rx', d=>{return 0.1*d.h}).attr('ry', d=>{return 0.1*d.h})
      .on('click', (d,i)=>{
        if (this.clickable && this.criteria.type!=d.value) {
          this.clickable = false;

          this.criteria.type = d.value;
          btnSpace.selectAll('g.btn').classed('active', false);
          btnSpace.select('g.btn#btn'+i).classed('active', true);
          this.update();
        }
      });
    btns.append('text').attr('class', 'btn-text')
      .attr('x', d=>{return d.w/2}).attr('y', d=>{return 0.6*d.h})
      .style('font-size', d=>{return 0.3*d.h}).text(d=>{return d.desc});

    let thaiBtn = btnSpace.append('g').attr('class', 'thai-btn active')
      .attr('transform', 'translate('+((width - btnSet[0].w)/2)+','+(0.7333*height)+')');
    thaiBtn.append('rect').attr('class', 'btn-rect')
      .attr('width', btnSet[0].w).attr('height', btnSet[0].h)
      .attr('rx', 0.1*btnSet[0].h).attr('ry', 0.1*btnSet[0].h)
      .on('click', ()=>{
        if (this.clickable && this.criteria.state!='') {
          this.clickable = false;

          this.criteria.state = '';
          thaiBtn.classed('active', true);          
          this.svg.select('.map-space').selectAll('.province').classed('active', false);
          this.update();
        }
      });
    thaiBtn.append('text').attr('class', 'btn-text')
      .attr('x', btnSet[0].w/2).attr('y', 0.6*btnSet[0].h)
      .style('font-size', 0.3*btnSet[0].h).text('Thailand');
  }
  setupPieChart() {
    let height = this.height - 9.25*this.width/25,
        width = 0.28*this.width,
        data = this.pieDataFormat(this.criteria),
        outerRadius = 0.35*height;
    let pieSpace = this.svg.append('g').attr('class', 'pie-space')
      .attr('transform', 'translate('+(0.34*this.width)+','+(9.25*this.width/25)+')');

    pieSpace.append('text').attr('class', 'province-name')
      .attr('x', 0.5*width).attr('y', 0.1*height).style('font-size', 0.1*height)
      .text('All Provinces');
    pieSpace.append('text').attr('class', 'computer percent changeable')
      .attr('x', 0.68*width).attr('y', 0.93*height).style('font-size', 0.12*height)
      .text(Math.round(data[0] * 100 / (data[0] + data[1])) + '%');
    pieSpace.append('text').attr('class', 'computer changeable')
      .attr('x', 0.65*width).attr('y', height).style('font-size', 0.06*height)
      .text('Computer');
    pieSpace.append('text').attr('class', 'mobile percent changeable')
      .attr('x', 0.32*width).attr('y', 0.93*height).style('font-size', 0.12*height)
      .text(Math.round(data[1] * 100 / (data[0] + data[1])) + '%');
    pieSpace.append('text').attr('class', 'mobile changeable')
      .attr('x', 0.285*width).attr('y', height).style('font-size', 0.06*height)
      .text('Mobile');

    let pie = d3.pie().value(d=>{return d}).sort(null).padAngle(0),
        arc = d3.arc().outerRadius(outerRadius).innerRadius(0);
    let pieChart = pieSpace.append('g').attr('class', 'pie-chart')
      .attr('transform', 'translate('+(width/2)+','+(height*0.525)+')');

    pieChart.selectAll('path.pie').data(pie(data)).enter().append('path').attr('class', 'pie')
      .attr('id', (d,i)=>{if(i==0) return 'computer'; else return 'mobile';}).attr('d', arc)
      .transition().duration(3*this.transitionTime).delay(200)
        .attrTween('d', d=>{
          var interpolate = d3.interpolate({startAngle: 0, endAngle: 0}, d);
          return function(t) {
            return arc(interpolate(t));
          };
        })
        .on('end', (d,i,dom)=>{
          dom[i].__last__ = dom[i].__data__;
        });
  }
  setupBarChart(data, day='') {
    let height = this.height - 9.25*this.width/25,
        width = 0.36*this.width,
        barData = this.dailyDataFormat(data, day),
        clock = [
          '12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
          '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'
        ];
        
    let barSpace = this.svg.append('g').attr('class', 'bar-space')
      .attr('transform', 'translate('+(0.64*this.width)+','+(9.25*this.width/25)+')');
    barSpace.append('text').attr('class', 'bar-type')
      .attr('y', height).style('font-size', 0.06*height).text('All users');
    barSpace.append('text').attr('class', 'bar-day')
      .attr('x', width/2).attr('y', 0.1*height)
      .style('font-size', 0.1*height).text('Monday - Sunday');

    let barHeight = 0.67*height,
        scale = d3.scaleLinear().domain([0, d3.max(barData)]).range([0, barHeight]),
        slotW = width / 24;
    let barChart = barSpace.append('g').attr('class', 'bar-chart')
      .attr('transform', 'translate(0,'+(0.18*height)+')');

    let barSlots = barChart.selectAll('g.bar-slot').data(barData).enter().append('g').attr('class', 'bar-slot')
      .attr('transform', (d,i)=>{return 'translate('+(slotW * i)+','+barHeight+')'});
    barSlots.append('rect').attr('class', 'bar')
      .attr('y', 0).attr('height', 0).attr('width', 0.85*slotW)
      .transition().duration(2.5*this.transitionTime).delay(300)
        .attr('y', d=>-scale(d)).attr('height', d=>scale(d));
    barSlots.append('text').attr('class', 'bar-time').attr('id', (d,i)=>'time'+i)
      .attr('y', 0.07*height).style('font-size', 0.06*height)
      .style('opacity', (d,i)=>{if(i%3==0)return 1;else return 0;})
      .text((d,i)=>clock[i]);
  }

  update() {
    let data = this.heatmapDataFormat(this.criteria),
        oneBlock = this.width / 25,
        clock = [
          '12a','1a','2a','3a','4a','5a','6a','7a','8a','9a','10a','11a',
          '12p','1p','2p','3p','4p','5p','6p','7p','8p','9p','10p','11p'
        ],
        days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    let range = this.heatmapRange(data),
        colorScale = d3.scaleLinear().domain(range).range([0, 10]);
    
    let heatmap = this.workspace.select('.heatmap');
    days.map((day,i)=>{
      let dayRow = heatmap.select('g.day#'+day);
      dayRow.selectAll('rect.heatblock').data(data[day])
        .on('mouseenter', (k,j)=>{
          clearTimeout(this.timeout);
          this.barChartHover(data, day, j);
        })
        .on('mouseleave', ()=>{
          this.timeout = setTimeout(()=>{this.barChartLeave(data)}, 200);
        })
        .transition().duration(this.transitionTime).delay((k,j)=>{return 25*i + 25*j}).ease(d3.easeExpIn)
          .attr('width', 0).attr('x', (k,j)=>{return (j + 1/2)*oneBlock})
          .on('end', (k,j)=>{
            dayRow.select('#'+day+'-'+j).style('fill', m=>{return this.heatmapColor(m, colorScale)})
              .transition().duration(this.transitionTime).ease(d3.easeExpOut)
                .attr('width', 0.94*oneBlock).attr('x', j*oneBlock);
          });
    });

    this.updatePieChart();
    this.updateBarChart(data);

    d3.timeout(()=>{this.clickable = true}, 1100);
  }
  updatePieChart() {
    let height = this.height - 9.25*this.width/25,
        data = this.pieDataFormat(this.criteria),
        outerRadius = 0.35*height;

    let pie = d3.pie().value(d=>{return d}).sort(null).padAngle(0),
        arc = d3.arc().outerRadius(outerRadius).innerRadius(0);
    let pieSpace = this.svg.select('g.pie-space');
    
    let pieChart = pieSpace.select('g.pie-chart');
    pieChart.selectAll('path.pie').data(pie(data)).attr('d', arc)
      .transition().duration(2*this.transitionTime)
        .attrTween('d', (d,i,dom)=>{
          var interpolate = d3.interpolate(dom[i].__last__, d);
          return function(t) {
            return arc(interpolate(t));
          };
        })
        .on('end', (d,i,dom)=>{
          dom[i].__last__ = dom[i].__data__;
        });

    pieSpace.selectAll('.computer.percent').text(Math.round(data[0] * 100 / (data[0] + data[1])) + '%');
    pieSpace.selectAll('.mobile.percent').text(Math.round(data[1] * 100 / (data[0] + data[1])) + '%');

    if (this.criteria.state=='') pieSpace.select('.province-name').text('All Provinces');
    else pieSpace.select('.province-name').text(this.criteria.state);
    if (this.criteria.type=='') {
      pieSpace.selectAll('.changeable').classed('active', false).classed('inactive', false);
      pieChart.selectAll('.pie').classed('active', false).classed('inactive', false);
    } else {
      pieSpace.selectAll('.changeable').classed('inactive', true).classed('active', false);
      pieSpace.selectAll('.'+this.criteria.type).classed('inactive', false).classed('active', true);
      pieChart.selectAll('.pie').classed('inactive', true).classed('active', false);
      pieChart.selectAll('.pie#'+this.criteria.type).classed('inactive', false).classed('active', true);
    }
  }
  updateBarChart(data, day='') {
    let height = this.height - 9.25*this.width/25,
        barData = this.dailyDataFormat(data, day);
        
    let barSpace = this.svg.select('g.bar-space');
    if (this.criteria.type=='') barSpace.select('.bar-type').text('All users');
    else barSpace.select('.bar-type').text(this.criteria.type+' users');

    let barHeight = 0.67*height,
        scale = d3.scaleLinear().domain([0, d3.max(barData)]).range([0, barHeight]);
    let barChart = barSpace.select('g.bar-chart');

    barChart.selectAll('g.bar-slot').data(barData).select('.bar')
      .transition().duration(2.5*this.transitionTime)
        .attr('y', d=>-scale(d)).attr('height', d=>scale(d));
  }

  barChartHover(data, day, hour) {
    let barData = this.dailyDataFormat(data, day),
        dates = {
          mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
          fri: 'Friday', sat: 'Saturday', sun: 'Sunday'
        };
    let barSpace = this.svg.select('g.bar-space');
    barSpace.select('.bar-day').text(dates[day]);

    let height = this.height - 9.25*this.width/25,
        barHeight = 0.67*height,
        scale = d3.scaleLinear().domain([0, d3.max(barData)]).range([0, barHeight]);

    let barSlots = barSpace.select('g.bar-chart').selectAll('g.bar-slot').data(barData)
      .classed('active', (d,i)=>i==hour);
    barSlots.select('.bar').attr('y', d=>-scale(d)).attr('height', d=>scale(d));
    barSlots.select('.bar-time').style('opacity', (d,i)=>{if(i==hour)return 1;else return 0;});
  }
  barChartLeave(data) {
    let barData = this.dailyDataFormat(data, ''),
        height = this.height - 9.25*this.width/25,
        barHeight = 0.67*height,
        scale = d3.scaleLinear().domain([0, d3.max(barData)]).range([0, barHeight]);

    let barSpace = this.svg.select('g.bar-space');
    barSpace.select('.bar-day').text('Monday - Sunday');

    let barSlots = barSpace.select('g.bar-chart').selectAll('g.bar-slot').data(barData)
      .classed('active', false);
    barSlots.select('.bar').attr('y', d=>-scale(d)).attr('height', d=>scale(d));
    barSlots.select('.bar-time').style('opacity', (d,i)=>{if(i%3==0)return 1;else return 0;});
  }

  heatmapDataFormat(criteria) {
    let result = {
      mon: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      tue: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      wed: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      thu: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      fri: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      sat: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      sun: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    },
        days = Object.keys(this.dataset[0].mobile),
        hours = this.dataset[0].mobile[days[0]].length;

    if (criteria.state=='' && criteria.type=='') {
      this.dataset.map(d=>{
        days.map(day=>{
          for (let hour=0; hour<hours; hour++) {
            result[day][hour] += d.mobile[day][hour] + d.computer[day][hour];
          }
        });
      });
    } else if (criteria.state!='' && criteria.type=='') {
      this.dataset.filter(d=>{return d.name==criteria.state}).map(d=>{
        days.map(day=>{
          for (let hour=0; hour<hours; hour++) {
            result[day][hour] += d.mobile[day][hour] + d.computer[day][hour];
          }
        });
      });
    } else if (criteria.state=='' && criteria.type!='') {
      this.dataset.map(d=>{
        days.map(day=>{
          for (let hour=0; hour<hours; hour++) {
            result[day][hour] += d[criteria.type][day][hour];
          }
        });
      });
    } else {
      this.dataset.filter(d=>{return d.name==criteria.state}).map(d=>{
        days.map(day=>{
          for (let hour=0; hour<hours; hour++) {
            result[day][hour] += d[criteria.type][day][hour];
          }
        });
      });
    }

    return result;
  }
  heatmapRange(data) {
    return [
      d3.min([d3.min(data.mon), d3.min(data.tue), d3.min(data.wed), d3.min(data.thu), d3.min(data.fri), d3.min(data.sat), d3.min(data.sun)]),
      d3.max([d3.max(data.mon), d3.max(data.tue), d3.max(data.wed), d3.max(data.thu), d3.max(data.fri), d3.max(data.sat), d3.max(data.sun)])
    ];
  }
  heatmapColor(value, colorScale) {
    return this.colors[Math.round(colorScale(value))];
  }
  pieDataFormat(criteria) {
    let result = [0, 0], // [computer, mobile]
        days = Object.keys(this.dataset[0].mobile),
        hours = this.dataset[0].mobile[days[0]].length;

    if (criteria.state=='') {
      this.dataset.map(d=>{
        days.map(day=>{
          for (let hour=0; hour<hours; hour++) {
            result[0] += d.computer[day][hour];            
            result[1] += d.mobile[day][hour];
          }
        });
      });
    } else {
      this.dataset.filter(d=>{return d.name==criteria.state}).map(d=>{
        days.map(day=>{
          for (let hour=0; hour<hours; hour++) {
            result[0] += d.computer[day][hour];            
            result[1] += d.mobile[day][hour]; 
          }
        });
      });
    }

    return result;
  }
  dailyDataFormat(data, day) {
    if (day=='') {
      let result = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
          hours = 24;
      Object.keys(data).map(key=>{
        for (let hour=0; hour<hours; hour++) {
          result[hour] += data[key][hour];
        }
      });
      return result;
    } else return data[day];
  }

  stringToId(name) {
    var newname = name.replace(/\\| |\//g, '').replace(/\./g, '');
    return newname;
  }

}
