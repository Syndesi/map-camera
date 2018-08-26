import React from 'react';
import axios from 'axios';
import Card from '../components/Card.js';

export default class Index extends React.Component {

  constructor(props){
      super(props);
  }

  render(){

    return (
      <div className="container">
        <h1>Map-Camera</h1>
      </div>
    );
  }
}