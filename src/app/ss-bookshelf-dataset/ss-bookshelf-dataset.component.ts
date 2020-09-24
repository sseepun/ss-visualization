import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

import { L00_D00_V02_071200_01 } from '../dataset/bookshelf/L00_D00_V02_071200_01';
// import { L00_D00_V05_071200_01 } from '../dataset/bookshelf/L00_D00_V05_071200_01';
// import { L00_D00_V08_071200_01 } from '../dataset/bookshelf/L00_D00_V08_071200_01';
import { L00_D00_V02_071200_01_sparse } from '../dataset/bookshelf/L00_D00_V02_071200_01_sparse';

@Component({
  selector: 'app-ss-bookshelf-dataset',
  templateUrl: './ss-bookshelf-dataset.component.html',
  styleUrls: ['./ss-bookshelf-dataset.component.css']
})
export class SsBookshelfDatasetComponent implements OnInit {

  private colors = ['#063951', '#c13018', '#f36f13', '#ebcb38', '#a2b969', '#0d95bc'];
  public dataset = {
    '2 Volts': {
      'Set Number 1': L00_D00_V02_071200_01.features
    }
    // '5 Volts': {
    //   'Set Number 1': L00_D00_V05_071200_01.features
    // },
    // '8 Volts': {
    //   'Set Number 1': L00_D00_V08_071200_01.features
    // }
  };
  public sparseDataset = {
    '2 Volts': {
      'Set Number 1': L00_D00_V02_071200_01_sparse.features
    }
  };
  public dropdownList = [
    { index: 0, channel: 'Channel 1' }, { index: 1, channel: 'Channel 2' },
    { index: 2, channel: 'Channel 3' }, { index: 3, channel: 'Channel 4' },
    { index: 4, channel: 'Channel 5' }, { index: 5, channel: 'Channel 6' },
    { index: 6, channel: 'Channel 7' }, { index: 7, channel: 'Channel 8' },
    { index: 8, channel: 'Channel 9' }, { index: 9, channel: 'Channel 10' },
    { index: 10, channel: 'Channel 11' }, { index: 11, channel: 'Channel 12' },
    { index: 12, channel: 'Channel 13' }, { index: 13, channel: 'Channel 14' },
    { index: 14, channel: 'Channel 15' }, { index: 15, channel: 'Channel 16' },
    { index: 16, channel: 'Channel 17' }, { index: 17, channel: 'Channel 18' },
    { index: 18, channel: 'Channel 19' }, { index: 19, channel: 'Channel 20' },
    { index: 20, channel: 'Channel 21' }, { index: 21, channel: 'Channel 22' },
    { index: 22, channel: 'Channel 23' }, { index: 23, channel: 'Channel 24' },
    { index: 24, channel: 'Channel 1 Sparse' }, { index: 25, channel: 'Channel 2 Sparse' },
    { index: 26, channel: 'Channel 3 Sparse' }, { index: 27, channel: 'Channel 4 Sparse' },
    { index: 28, channel: 'Channel 5 Sparse' }, { index: 29, channel: 'Channel 6 Sparse' },
    { index: 30, channel: 'Channel 7 Sparse' }, { index: 31, channel: 'Channel 8 Sparse' },
    { index: 32, channel: 'Channel 9 Sparse' }, { index: 33, channel: 'Channel 10 Sparse' },
    { index: 34, channel: 'Channel 11 Sparse' }, { index: 35, channel: 'Channel 12 Sparse' },
    { index: 36, channel: 'Channel 13 Sparse' }, { index: 37, channel: 'Channel 14 Sparse' },
    { index: 38, channel: 'Channel 15 Sparse' }, { index: 39, channel: 'Channel 16 Sparse' },
    { index: 40, channel: 'Channel 17 Sparse' }, { index: 41, channel: 'Channel 18 Sparse' },
    { index: 42, channel: 'Channel 19 Sparse' }, { index: 43, channel: 'Channel 20 Sparse' },
    { index: 44, channel: 'Channel 21 Sparse' }, { index: 45, channel: 'Channel 22 Sparse' },
    { index: 46, channel: 'Channel 23 Sparse' }, { index: 47, channel: 'Channel 24 Sparse' }
  ];
  public dropdownSettings = {
    singleSelection: false, allowSearchFilter: false, enableCheckAll: false,
    idField: 'index', textField: 'channel'
  };

  public selectedVolt = '2 Volts';
  public selectedSet = 'Set Number 1';
  private selectedChannels = [];
  public data = [];

  private host;
  private svg;
  private workspace;
  private margin = {top: 20, bottom: 20, left: 40, right: 0};
  private width = 900;
  private height = 400;
  private workspace2;
  private margin2 = {top: 20, bottom: 40};
  private height2 = 60;

  private scaleX;
  private scaleY;
  private scaleX2;
  private scaleY2;

  private line;
  private line2;
  private zoom;
  private brush;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.host = d3.select(this.elementRef.nativeElement).select('.graph-container');
    this.svg = this.host.select('.graph').append('svg')
      .attr('width', '100%').attr('height', '100%').attr('preserveAspectRatio', 'xMidYMid')
      .attr('viewBox', '0 0 '+(this.width+this.margin.left+this.margin.right)+' '+(this.margin.top+this.height+this.margin.bottom+this.margin2.top+this.height2+this.margin2.bottom));
    this.workspace = this.svg.append('g').attr('class', 'workspace');
    this.workspace.append('g').attr('class', 'graph-space').attr('clip-path', 'url(#clip)')
      .attr('transform', 'translate('+(this.margin.left)+','+(this.margin.top)+')');
    this.workspace.append('g').attr('class', 'y-axis').attr('transform', 'translate('+(this.margin.left)+','+(this.margin.top)+')');
    this.workspace.append('g').attr('class', 'x-axis').attr('transform', 'translate('+(this.margin.left)+','+(this.margin.top+this.height)+')');
    this.workspace2 = this.svg.append('g').attr('class', 'workspace2')
      .attr('transform', 'translate(0,'+(this.margin.top+this.height+this.margin.bottom+this.margin2.top)+')');
    this.workspace2.append('g').attr('class', 'graph-space2').attr('transform', 'translate('+(this.margin.left)+','+(this.margin2.top)+')');
    this.workspace2.select('g.graph-space2').append('g').attr('class', 'brush');
    this.workspace2.append('g').attr('class', 'y-axis2').attr('transform', 'translate('+(this.margin.left)+','+(this.margin2.top)+')');
    this.workspace2.append('g').attr('class', 'x-axis2').attr('transform', 'translate('+(this.margin.left)+','+(this.margin2.top+this.height2)+')');

    this.svg.append('defs').append('clipPath').attr('id', 'clip')
      .append('rect').attr('width', this.width).attr('height', this.height)
      .attr('x', 0).attr('y', 0); 

    this.scaleX = d3.scaleLinear().range([0, this.width]);
    this.scaleY = d3.scaleLinear().range([this.height, 0]);
    this.scaleX2 = d3.scaleLinear().range([0, this.width]);
    this.scaleY2 = d3.scaleLinear().range([this.height2, 0]);

    this.line = d3.line().x((d,i)=>this.scaleX(i)).y(d=>this.scaleY(d));
    this.line2 = d3.line().x((d,i)=>this.scaleX(i)).y(d=>this.scaleY2(d));

    this.zoom = d3.zoom().scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]]);
    this.svg.append('rect').attr('class', 'zoom').attr('width', this.width)
      .attr('height', this.height).style('opacity', 0)
      .attr('transform', 'translate('+this.margin.left+','+this.margin.top+')');

    this.brush = d3.brushX().extent([[0, 0], [this.width, this.height2]]);
    
    this.setup();
  }

  voltOnChange(volt) {this.selectedVolt = volt; this.updateData();}
  setOnChange(set) {this.selectedSet = set; this.updateData();}
  onChannelSelect(channel) {this.selectedChannels.push(channel.index); this.updateData();}
  onChannelDeSelect(channel) {
    let selectedChannels = [];
    for(let i=0; i<this.selectedChannels.length; i++) {
      if(this.selectedChannels[i]!=channel.index) selectedChannels.push(this.selectedChannels[i]);
    }
    this.selectedChannels = selectedChannels;
    this.updateData();
  }
  updateData() {
    this.data = [];
    let data = this.dataset[this.selectedVolt][this.selectedSet],
        sparseData = this.sparseDataset[this.selectedVolt][this.selectedSet];
    for(let i=0; i<this.selectedChannels.length; i++){
      let channel = this.selectedChannels[i];
      if(channel<24) this.data.push(data[channel]);
      else this.data.push(sparseData[channel-24]);
    }
    this.setup();
  }

  setup() {
    if(this.data.length>0){
      this.scaleX.domain([0, this.data[0].length]);
      this.scaleX2.domain([0, this.data[0].length]);
      let min = 0, max = 0;
      for(let i=0; i<this.data.length; i++){
        let newMin = d3.min(this.data[i]),
            newMax = d3.max(this.data[i]);
        if(newMin<min) min = newMin;
        if(newMax>max) max = newMax;
      }
      this.scaleY.domain([min, max]);
      this.scaleY2.domain([min, max]);
      
      let xAxis = d3.axisBottom(this.scaleX),
          yAxis = d3.axisLeft(this.scaleY),
          yAxis2 = d3.axisLeft(this.scaleY2);

      let graph = this.workspace.select('g.graph-space');
      graph.selectAll('path').remove();
      graph.selectAll('path').data(this.data).enter().append('path')
        .attr('id', (d,i)=>'channel'+this.selectedChannels[i]).attr('class', 'channel')
        .attr('d', d=>this.line(d)).style('fill', 'none').attr('stroke', (d,i)=>this.colors[i%this.colors.length])
        .style('opacity', 0.65);
      this.workspace.select('.x-axis').transition().duration(400).call(xAxis);
      this.workspace.select('.y-axis').transition().duration(400).call(yAxis);

      let graph2 = this.workspace2.select('g.graph-space2');
      graph2.selectAll('path').remove();
      graph2.selectAll('path').data(this.data).enter().append('path')
        .attr('id', (d,i)=>'subchannel'+this.selectedChannels[i]).attr('class', 'subchannel')
        .attr('d', d=>this.line2(d)).style('fill', 'none').attr('stroke', (d,i)=>this.colors[i%this.colors.length])
        .style('opacity', 0.65);
      this.workspace2.select('.x-axis2').transition().duration(400).call(xAxis);
      this.workspace2.select('.y-axis2').transition().duration(400).call(yAxis2);

      let self = this;

      self.brush.on('brush end', function(){
        if (d3.event.sourceEvent && d3.event.sourceEvent.type==="zoom") return; // ignore brush-by-zoom
        let s = d3.event.selection || self.scaleX2.range();
        self.scaleX.domain(s.map(self.scaleX2.invert, self.scaleX2));
        self.workspace.select('g.graph-space').selectAll('.channel').attr('d', self.line);
        self.workspace.select('.x-axis').call(xAxis);
        self.svg.select('.zoom').call(
          self.zoom.transform, 
          d3.zoomIdentity.scale(self.width / (s[1] - s[0])).translate(-s[0], 0)
        );
      });
      graph2.select('g.brush').call(self.brush).call(self.brush.move, self.scaleX.range());

      self.zoom.on('zoom', function(){
        if (d3.event.sourceEvent && d3.event.sourceEvent.type==='brush') return; // ignore zoom-by-brush
        let t = d3.event.transform;
        self.scaleX.domain(t.rescaleX(self.scaleX2).domain());
        self.workspace.select('g.graph-space').selectAll('.channel').attr('d', self.line);
        self.workspace.select('.x-axis').call(xAxis);
        graph2.select('.brush').call(self.brush.move, self.scaleX.range().map(t.invertX, t));
      });
      self.svg.select('rect.zoom').call(self.zoom);
    }else{
      let graph = this.workspace.select('g.graph-space');
      graph.selectAll('path').remove();

      let graph2 = this.workspace2.select('g.graph-space2');
      graph2.selectAll('path').remove();
    }
  }

}
