import './App.css';
import React, {useState, PureComponent} from "react";
import { render } from "react-dom";
import ReactWordcloud from 'react-wordcloud';
import {Container, Row, Col, CardDeck, Card, Dropdown} from "react-bootstrap";
import { PieChart, Pie, Sector, ResponsiveContainer } from 'recharts';
import CanvasJSReact from './canvasjs.react';

import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';
import 'bootstrap/dist/css/bootstrap.min.css';

var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const AnalysisResult = require('./certikorg_tweet_analysis.json');

function SentimentScoreCard(props) {
    const pos = AnalysisResult.sentiment_count.pos;
    const neu = AnalysisResult.sentiment_count.neu;
    const neg = AnalysisResult.sentiment_count.neg;
    const score = Math.round((pos + neu)/(pos + neu + neg) * 100);
    return (
        <Card
          style={{ width: '18rem' }}
          className="mb-2"
        >
            <Card.Header>Sentiment Score</Card.Header>
            <Card.Body>
                <Card.Text>
                    {score}/100
                </Card.Text>
            </Card.Body>
        </Card>
    );
}

function StatusCard(props) {
    const {headerText, number} = props;
    return (
        <Card
            style={{ width: '18rem' }}
            className="mb-2"
        >
            <Card.Header>{headerText}</Card.Header>
            <Card.Body>
                <Card.Text>
                    {number}
                </Card.Text>
            </Card.Body>
        </Card>
    );
}

function PercentChart(props) {
    const pos = AnalysisResult.sentiment_count.pos;
    const neu = AnalysisResult.sentiment_count.neu;
    const neg = AnalysisResult.sentiment_count.neg;
    const options = {
        animationEnabled: true,
        subtitles: [{
            text: `${Math.round((pos + neu)/(pos + neu + neg) * 100)}% Non-negative`,
            verticalAlign: "center",
            fontSize: 20,
            dockInsidePlotArea: true
        }],
        height: 300,
        data: [{
            type: "doughnut",
            showInLegend: true,
            yValueFormatString: "#,###'%'",
            dataPoints: [
                { name: "positive", y: pos, legendText: `positive ${Math.round(pos/(pos + neu + neg) * 100)}%`},
                { name: "neutral", y: neu, legendText: `neutral ${Math.round(neu/(pos + neu + neg) * 100)}%`},
                { name: "negative", y: neg, legendText: `negative ${Math.round(neg/(pos + neu + neg) * 100)}%`}
            ]
        }]
    }
    return (
        <>
            <CanvasJSChart options = {options}
                /* onRef={ref => this.chart = ref} */
            />
        </>
    );
}

function MyRingChart(props) {
    const pos = AnalysisResult.sentiment_count.pos;
    const neu = AnalysisResult.sentiment_count.neu;
    const neg = AnalysisResult.sentiment_count.neg;
    const data = [
        { name: 'positive', value: pos },
        { name: 'neutral', value: neu },
        { name: 'negative', value: neg },
    ];

    return (
        <>
            <h3>{"CertiK Sentiment Analysis"}</h3>
            <span>{"From May 30, 2021 - May 31, 2021"}</span>
            <PieChart width={300} height={300}>
                <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} fill="#82ca9d" label />
            </PieChart>
        </>
    );
}

function SplineChart(props) {
    const {selectedLength} = props;
    const accountActivity = AnalysisResult.account_activity;
    let activityData = [];
    let today = new Date();
    today.setHours(0,0,0,0);
    let j = 0;
    for(let i = 0; i < selectedLength; i++) {
        let count = 0;
        if (new Date(accountActivity[j]['date']).getDate() === today.getDate()) {
            count = accountActivity[j]['count'];
            j++;
        }
        activityData.push(
            {
                x: new Date(today),
                y: count
            }
        );
        today.setDate(today.getDate() - 1);
    }
    console.log(activityData);

    const options = {
        animationEnabled: true,
        axisX: {
            valueFormatString: "M/D"
        },
        height: 200,
        data: [{
            yValueFormatString: "#,###",
            xValueFormatString: "M/D",
            type: "spline",
            dataPoints: activityData
        }]
    }
    return (
        <>
            <CanvasJSChart options = {options}
                /* onRef={ref => this.chart = ref} */
            />
            {/*You can get reference to the chart instance as shown above using onRef. This allows you to access all chart properties and methods*/}
        </>
    );
}

function MyWordCloud(prop) {
    const callbacks = {
        getWordTooltip: word => `${word.text} (${word.value})`,
    }
    const options = {
        rotations: 1,
        rotationAngles: [0],
        fontFamily: "Impact",
        fontSizes: [20, 70],
        fontStyle: "normal",
        fontWeight: "normal",
        padding: 0,
        scale: "sqrt"
    };
    const size = [700, 200];
    const words = AnalysisResult.word_freq;

    return (
        <>
            <ReactWordcloud
                callbacks={callbacks}
                options={options}
                size={size}
                words={words}
            />
        </>
    );
}

function App() {
    const [selectedLength, setSelectedLength] = useState(7);

    const beginDate = new Date(AnalysisResult['account_activity'][AnalysisResult['account_activity'].length -1]['date']).toISOString().substring(0, 10);
    const endDate = new Date(AnalysisResult['account_activity'][0]['date']).toISOString().substring(0, 10);

    return (
        <Container className={'p-5'}>
            <Row>
                <CardDeck>
                    <SentimentScoreCard />
                    <StatusCard headerText={"platform monitoring"} number={1} />
                    <StatusCard headerText={"self-created content"} number={3959} />
                    <StatusCard headerText={"community impact"} number={1902006} />
                </CardDeck>
            </Row>
            <Row>
                <Col sm={4}>
                    <Row>
                        <div style={{padding: "24px 12px 24px 24px"}}>
                            <h3>{"CertiK Sentiment Analysis"}</h3>
                            <span>From {beginDate} - {endDate}</span>
                            <PercentChart />
                        </div>
                    </Row>
                </Col>
                <Col sm={8}>
                    <Row>
                        <Col>
                            <h3>Twitter Account Activity</h3>
                        </Col>
                        <Col>
                            <Dropdown className="float-right">
                                <Dropdown.Toggle variant="success" id="dropdown-basic">
                                    {selectedLength} days
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Dropdown.Item onSelect={()=>setSelectedLength(7)}>7 days</Dropdown.Item>
                                    <Dropdown.Item onSelect={()=>setSelectedLength(14)}>14 days</Dropdown.Item>
                                    <Dropdown.Item onSelect={()=>setSelectedLength(30)}>30 days</Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                    <Row>
                        <SplineChart selectedLength={selectedLength}/>
                    </Row>
                    <Row>
                        <h3>Social Key Words aggregated by CertiK</h3>
                    </Row>
                    <Row>
                        <MyWordCloud />
                    </Row>
                </Col>
            </Row>

        </Container>
    );
}

export default App;
