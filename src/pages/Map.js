import React from 'react';
import axios from 'axios';
import fileDialog from 'file-dialog';
import parse from 'csv-parse';
import moment from 'moment';
import mapboxgl from 'mapbox-gl';



export default class Map extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      data:               [],
      timeRatio:          10,
      point:              null,
      isAnimationRunning: false
    };
    this.loop = setInterval(() => {this.loopUpdate();}, 200);
  }

  loopUpdate(){
    if(!this.state.isAnimationRunning){
      return false;
    }
    var data = this.state.data;
    var i = this.state.point + 1;
    if(i >= data.length){
      this.setState({
        point:              0,
        isAnimationRunning: false,
      });
      return false;
    }
    var j = i - 1;
    if(j <= 0){
      j = i + 1;
    }
    this.map.flyTo({
      center: [data[i]['longitude'], data[i]['latitude']],
      zoom: 16,
      bearing: this.bearing(data[j]['longitude'], data[j]['latitude'], data[i]['longitude'], data[i]['latitude']),
      easing: (t) => {return t;},
      duration: 200
    });
    this.setState({
      point: i
    });
  }

  bearing(lng1,lat1,lng2,lat2) {
    var dLon = (lng2-lng1);
    var y = Math.sin(dLon) * Math.cos(lat2);
    var x = Math.cos(lat1)*Math.sin(lat2) - Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon);
    var brng = Math.atan2(y, x) * 180 / Math.PI;
    return 360 - ((brng + 360) % 360);
  }

  startAnimation(){
    var data = this.state.data;
    if(data.length <= 0){
      return false;
    }
    this.setState({
      point:              0,
      isAnimationRunning: true
    });
  }

  stopAnimation(){
    this.setState({
      point:              null,
      isAnimationRunning: false
    });
  }

  componentDidMount(){
    var self = this;
    mapboxgl.accessToken = 'pk.eyJ1Ijoic29lcmVua2xlaW4iLCJhIjoiTFhjai1qcyJ9.JvmV0WKbbrySeFyHJQYRfg';
    this.map = new mapboxgl.Map({
      container: this.mapNode,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [10.8703515, 48.050783],
      zoom: 10
    });
  }

  importCsv(){
    fileDialog()
      .then((file) => {
        var reader = new FileReader();
        reader.onload = () => {
          var text = reader.result;
          parse(text, {cast: true, columns: true}, (error, data) => {
            this.map.flyTo({center: [data[0]['longitude'], data[0]['latitude']], zoom: 16});
            this.setState({
              data: data
            });
          });
        }
        reader.readAsText(file[0]);
      });
  }

  render(){
    var data = this.state.data;
    var table = null;
    if(data.length > 0){
      table = <p>{data.length}</p>;
      var head = [];
      head.push(<th scope="col">#</th>);
      for(var column in data[0]){
        head.push(<th scope="col">{column}</th>);
      }
      var body = [];
      for(var row in data){
        var cells = [];
        cells.push(<td>{row}</td>);
        for(var cell in data[row]){
          var value = data[row][cell];
          switch(cell){
            case 'longitude':
            case 'latitude':
              value = Number(value).toFixed(6);
              break;
            case 'altitude': // m
            case 'accuracy':
              value = Number(value).toFixed(1);
              break;
            case 'speed':
              value = Number(value * 3.6).toFixed(1); // km/h
              break;
            case 'system_time':
            case 'utc_time':
              value = moment(value).format('HH:mm:ss');
              break;
            default:
              break;
          }
          cells.push(<td>{value}</td>);
        }
        body.push(<tr>{cells}</tr>);
      }
      table = (
        <table class="table table-hover">
          <thead>
            <tr>
              {head}
            </tr>
          </thead>
          <tbody>
            {body}
          </tbody>
        </table>
      );
    }
    return (
      <div class="container camera mt-4">
        <div class="row">
          <div class="col-8">
            <h1>Map-Camera</h1>
            <button type="button" class="btn btn-primary mb-4 mr-4" onClick={() => {this.importCsv();}}>Import CSV</button>
            <button type="button" class="btn btn-primary mb-4 mr-4" onClick={() => {this.startAnimation();}}>Start animation</button>
            <button type="button" class="btn btn-primary mb-4" onClick={() => {this.stopAnimation();}}>Stop animation</button>
            {table}
          </div>
          <div class="col-4">
            <div class="map" ref={(node) => {this.mapNode = node;}}></div>
          </div>
        </div>
      </div>
    );
  }
}