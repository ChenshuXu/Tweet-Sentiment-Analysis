import React, { useState } from 'react';
import { Row, Col, Typography, Select } from 'antd';
import { Pie } from '@ant-design/charts';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import ReactWordcloud from 'react-wordcloud';
import './App.css';

const { Text, Link } = Typography;
const { Option } = Select;
const AnalysisResult = require('./certikorg_tweet_analysis.json');

function PercentChart(props) {
    const {data} = props;
    let colors = data.map(i => i.color);
    let values = data.map(i => i.value);
    let names = data.map(i => i.name);
    let nonNeg = Math.round((values[0]+values[1]) * 10) / 10;

    const innerLowerRowStyle = {
        y:110,
        alignmentBaseline:"middle",
        textAnchor:"middle",
        fontFamily:"Inter",
        fontStyle:"normal",
        fontWeight:400,
        fontSize:"10px",
        lineHeight:"150%",
        textAlign:"center",
        fill:"rgba(51,51,51,.5)"
    };

    const innerUpperRowStyle = {
        x:100,
        y:95,
        alignmentBaseline:"middle",
        textAnchor:"middle",
        fontFamily:"Inter",
        fontStyle:"normal",
        fontWeight:600,
        fontSize:"32px",
        lineHeight:"100%",
        fill:"rgba(51,51,51,.8)"
    };

    let config = {
        height: 200,
        width: 200,
        data: data,
        angleField: 'value',
        colorField: 'name',
        color: colors,
        radius: 1,
        innerRadius: 0.7,
        legend: false,
        statistic: {
            title: false,
            content: {
                customHtml: function formatter() {
                    return (
                        <Col>
                            <Row style={innerUpperRowStyle} >{nonNeg}%</Row>
                            <Row justify={'center'} style={innerLowerRowStyle} >Non-negative</Row>
                            <Row justify={'center'} style={innerLowerRowStyle} >Recognition</Row>
                        </Col>);
                }
            },
        },
        label: false
    };

    function Item(p) {
        const {color, name, value} = p;
        return (
            <li style={{display:"block", marginBottom:"0px"}}>
                <Row align={"middle"}>
                    <Col style={{
                        backgroundColor: color,
                        borderRadius: "4px",
                        height: "14px",
                        marginRight: "8px",
                        width: "14px"
                    }} />
                    <Col style={{fontWeight: "600", lineHeight: "20px"}}>{name}</Col>
                </Row>
                <Row align={"middle"} style={{marginTop:"8px"}}>
                    <Col style={{
                        height: "14px",
                        marginRight: "8px",
                        width: "14px"
                    }}/>
                    <Col style={{fontWeight: "400", lineHeight: "20px"}}>{value}%</Col>
                </Row>
            </li>
        );
    }
    return (
        <>
            <Pie style={{display: "block", margin: "48px auto"}} {...config} />
            <ul style={{alignItems:"center", display:"flex", justifyContent:"space-around", paddingLeft:"0px"}}>
                <Item color={colors[0]} name={names[0]} value={values[0]} />
                <Item color={colors[1]} name={names[1]} value={values[1]} />
                <Item color={colors[2]} name={names[2]} value={values[2]} />
            </ul>
        </>);
}


function TwitterAccountActivity(props) {
    const {accountActivity} = props;
    const [length, setLength] = useState(7);
    const [step, setStep] = useState(1); // 1: by day, 7: by week, 30: by month
    let activityData = [];
    let today = new Date();
    today.setHours(0,0,0,0);

    let j = 0;
    today.setDate(today.getDate() - step);
    for (let i = 0; i < length; i++) {
        let count = 0;
        let like_count = 0;
        let retweet_count = 0;
        while (j < accountActivity.length && new Date(accountActivity[j]['date']) > today) {
            count += accountActivity[j]['count'];
            like_count += accountActivity[j]['like'];
            retweet_count += accountActivity[j]['retweet'];
            j++;
        }
        let dateString = "";
        if (step === 1) {
            if (i === 0) {
                dateString = "Today";
            } else if (i === 1) {
                dateString = "Yesterday";
            } else {
                dateString = `${i}d ago`;
            }
        } else if (step === 7) {
            if (i === 0) {
                dateString = "This Week";
            } else if (i === 1) {
                dateString = "Last Week";
            } else {
                dateString = `${i}w ago`;
            }
        } else if (step === 30) {
            if (i === 0) {
                dateString = "This Month";
            } else if (i === 1) {
                dateString = "Last Month";
            } else {
                dateString = `${i}m ago`;
            }
        }
        activityData.push(
            {
                x: dateString,
                tweets: count,
                favorites: like_count,
                retweets: retweet_count
            }
        );
        today.setDate(today.getDate() - step);
    }

    activityData = activityData.reverse();
    console.log(activityData);

    function handleLengthClick(e) {
        console.log('click length', e);
        setLength(e);
    }

    function handleStepClick(e) {
        console.log('click step', e);
        setStep(e);
        if (e === 1) {
            setLength(7);
        }
        else if (e === 7) {
            setLength(7);
        }
        else if (e === 30) {
            setLength(3);
        }
    }

    const renderColorfulLegendText = (value, entry) => {
        return <span style={{ color: "rgba(0,0,0,.85)" }}>{value}</span>;
    };

    function RangeText () {
        if (step === 1) {
            return (
                <Select defaultValue={length}
                        onChange={handleLengthClick}
                        bordered={false}
                >
                    <Option value={7}>7 days</Option>
                    <Option value={14}>14 days</Option>
                    <Option value={30}>30 days</Option>
                </Select>
            );
        } else if (step === 7) {
            return (
                <Select defaultValue={length}
                        onChange={handleLengthClick}
                        bordered={false}
                >
                    <Option value={7}>7 weeks</Option>
                    <Option value={10}>10 weeks</Option>
                    <Option value={12}>12 weeks</Option>
                </Select>
            );
        } else if (step === 30) {
            return (
                <Select defaultValue={length}
                        onChange={handleLengthClick}
                        bordered={false}
                >
                    <Option value={3}>3 month</Option>
                    <Option value={4}>4 month</Option>
                    <Option value={6}>6 month</Option>
                </Select>
            );
        }
    }

    return (
        <>
            <Row className={"ant-row-middle"}>
                <Col span={24} md={12} style={{marginBottom: "16px"}}>
                    <Text className={"percent-tab-title"}>Twitter Account Activity</Text>
                </Col>
                <Col span={24} md={12} style={{marginBottom: "16px"}}>
                    <Row className={"ant-row-end"} style={{marginLeft:"-6px", marginRight:"-6px"}}>
                        <Col style={{paddingLeft:"6px", paddingRight:"6px"}}>
                            <Row className={"data-filter-selector"}>
                                <RangeText />
                            </Row>
                        </Col>
                        <Col style={{paddingLeft:"6px", paddingRight:"6px"}}>
                            <Row className={"data-filter-selector"}>
                                <Select defaultValue={1}
                                        onChange={handleStepClick}
                                        bordered={false}
                                >
                                    <Option value={1}>By Day</Option>
                                    <Option value={7}>By Week</Option>
                                    <Option value={30}>By Month</Option>
                                </Select>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className={"percent-tab-card"}>
                <Col span={24}>
                    <ResponsiveContainer height={138}>
                        <LineChart data={activityData}>
                            <CartesianGrid strokeDasharray="4 0" vertical={false} />
                            <XAxis dataKey="x" padding={{ left: 30, right: 30 }} />
                            <YAxis />
                            <Tooltip />
                            <Legend formatter={renderColorfulLegendText} />
                            <Line
                                type="monotone"
                                dataKey="tweets"
                                stroke="#E1AA4C"
                            />
                            <Line
                                type="monotone"
                                dataKey="favorites"
                                stroke="#40B884"
                            />
                            <Line
                                type="monotone"
                                dataKey="retweets"
                                stroke="#4D6380"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Col>
            </Row>
        </>
    );
}

function SocialKeyWords(props) {
    const callbacks = {
        getWordTooltip: word => `${word.text} (${word.value})`,
    }
    const options = {
        rotations: 1,
        rotationAngles: [0],
        fontFamily: "Inter",
        fontSizes: [10, 72],
        fontStyle: "normal",
        fontWeight: "300",
        padding: 4,
        scale: "sqrt"
    };
    const words = AnalysisResult.word_freq;

    return (
        <>
            <Row className={"ant-row-middle"}>
                <Col span={24} md={12} style={{marginBottom: "16px"}}>
                    <Text className={"percent-tab-title"}>Social Key Words aggregated by CertiK</Text>
                </Col>
            </Row>
            <Row className={"percent-tab-card"}>
                <Col span={24}>
                    <Row style={{height:138}}>
                        <ReactWordcloud
                            callbacks={callbacks}
                            options={options}
                            words={words}
                        />
                    </Row>
                </Col>
            </Row>
        </>
    );
}

function App() {
    const pos = AnalysisResult.sentiment_count.pos;
    const neu = AnalysisResult.sentiment_count.neu;
    const neg = AnalysisResult.sentiment_count.neg;

    const posPercent = Math.round((pos)/(pos + neu + neg) * 1000)/10;
    const neuPercent = Math.round((neu)/(pos + neu + neg) * 1000)/10;
    const negPercent = Math.round((neg)/(pos + neu + neg) * 1000)/10;

    const beginDate = new Date(AnalysisResult['account_activity'][AnalysisResult['account_activity'].length -1]['date']);
    const beginDateString = beginDate.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    const endDate = new Date(AnalysisResult['account_activity'][0]['date']);
    const endDayeString = endDate.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
        <div style={{width:"1220px", height:"506px", margin:'auto'}}>
            <Row>
                <Col span={24} lg={8} style={{padding: "24px 12px 24px 24px"}}>
                    <Row className={"percent-tab-title"}>
                        <Text>CertiK Sentiment Analysis</Text>
                    </Row>
                    <Row className={"percent-tab-card"}>
                        <Col className={"percent-tab-card-date"} span={24}>
                            From {beginDateString} - {endDayeString}
                        </Col>
                        <Col span={24}>
                            <PercentChart data={[
                                {color: "#40b884", name: "positive", value: posPercent},
                                {color: "#486a79", name: "neutral", value: neuPercent},
                                {color: "#e1aa4c", name: "negative", value: negPercent}
                            ]}/>
                        </Col>
                    </Row>
                </Col>
                <Col span={24} lg={16} style={{padding: "24px 24px 24px 12px"}}>
                    <div style={{marginBottom: "24px"}}>
                        <TwitterAccountActivity accountActivity={AnalysisResult.account_activity} />
                    </div>
                    <div>
                        <SocialKeyWords />
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default App;