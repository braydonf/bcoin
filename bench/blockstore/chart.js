/* global d3, document */

'use strict';

class Chart {
  constructor(file, level, type) {
    this.type = type;

    this.file = file.summary.filter(d => d.type === type);
    this.level = level.summary.filter(d => d.type === type);
    this.combined = this.file.concat(this.level);

    this.svg = d3.select(`#${type}`);

    this.width = Number(this.svg.attr('width'));
    this.height = Number(this.svg.attr('height'));

    this.margin = {
      top: 50,
      right: 30,
      bottom: 100,
      left: 60
    };
  }

  bytes(x) {
    if (x < 1024)
      return x;

    if (x < 1024 * 1024)
      return x / 1024 + ' KiB';

    if (x < 1024 * 1024 * 1024)
      return x / 1024 / 1024 + ' MiB';

    return x;
  }

  time(y) {
    return y / 1000 + ' ms';
  }

  series(summary) {
    const series = [];
    const keys = ['max', 'average', 'median', 'min'];

    for (const row of summary) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        if (!series[i]) {
          series[i] = [];
          series[i].key = key;
          series[i].index = i;
        }

        if (row[key]) {
          series[i].push({
            x: row.length,
            y: row[key]
          });
        }

        series[i].key = keys[i];
      }
    }

    return series;
  }

  draw(quad) {
    const seriesFile = this.series(this.file);
    const seriesLevel = this.series(this.level);
    const series = seriesFile.concat(seriesLevel);

    const x = d3.scaleBand();

    x.domain(this.combined.map(d => d.length))
      .rangeRound([this.margin.left, this.width - this.margin.right])
      .padding(0.2);

    let y = null;

    if (quad)
      y = d3.scalePow().exponent(quad);
    else
      y = d3.scaleLinear();

    y.domain([
      d3.min(series, serie => d3.min(serie, d => d.y)),
      d3.max(series, serie => d3.max(serie, d => d.y))
    ]);

    y.rangeRound([this.height - this.margin.bottom, this.margin.top]);

    const z = d3.scaleOrdinal(d3.schemeCategory10);

    const half = x.bandwidth() / 2;

    this.svg.append('g')
      .selectAll('g')
      .data(seriesFile)
      .enter().append('g')
      .attr('fill', d => z(d.key))
      .attr('class', d => 'file ' + d.key)
      .selectAll('rect')
      .data(d => d)
      .enter().append('rect')
      .attr('width', half)
      .attr('x', d => x(d.x))
      .attr('y', d => y(d.y))
      .attr('height', d => y(0) - y(d.y));

    this.svg.append('g')
      .selectAll('g')
      .data(seriesLevel)
      .enter().append('g')
      .attr('fill', d => z(d.key))
      .attr('class', d => 'level ' + d.key)
      .attr('transform', 'translate(' + (half + 2) + ',0)')
      .selectAll('rect')
      .data(d => d)
      .enter().append('rect')
      .attr('width', half)
      .attr('x', d => x(d.x))
      .attr('y', d => y(d.y))
      .attr('height', d => y(0) - y(d.y));

    this.svg.append('g')
      .attr('transform', 'translate(0,' + y(0) + ')')
      .call(d3.axisBottom(x).tickFormat(this.bytes));

    this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',0)')
      .call(d3.axisLeft(y).tickFormat(this.time));

    this.legend();
  }

  legend() {
    const legend = this.svg.append('g')
          .attr('class', 'legend')
          .attr('x', this.margin.left)
          .attr('y', this.height - 50)
          .attr('height', 100)
          .attr('width', 100);

    legend.append('rect')
      .attr('x', this.margin.left)
      .attr('y', this.height - 50)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', 'rgba(255, 145, 0, 0.8)');

    legend.append('text')
      .attr('x', this.margin.left + 20)
      .attr('y', this.height - 39)
      .text('File');

    legend.append('rect')
      .attr('x', this.margin.left + 75)
      .attr('y', this.height - 50)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', 'rgba(4, 113, 255, 0.8)');

    legend.append('text')
      .attr('x', this.margin.left + 95)
      .attr('y', this.height - 39)
      .text('Level');
  }

  static draw(file, level, type, quad) {
    return new this(file, level, type).draw(quad);
  }
}

async function main() {
  const file = await d3.json('file.json');
  const level = await d3.json('level.json');

  Chart.draw(file, level, 'write', 0.3);
  Chart.draw(file, level, 'read', 0);
  Chart.draw(file, level, 'randomread', 0);
  Chart.draw(file, level, 'prune', 0.55);
}

if (document.readyState !== 'loading')
  main();
else
  document.addEventListener('DOMContentLoaded', main);
