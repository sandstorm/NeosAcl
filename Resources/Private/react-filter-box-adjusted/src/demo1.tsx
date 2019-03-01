import * as React from 'react';
import * as _ from "lodash";


import ReactFilterBox, { AutoCompleteOption, SimpleResultProcessing, Expression } from "./filterBox/ReactFilterBox";

export default class Demo1 extends React.Component<any, any> {

    options: AutoCompleteOption[];
    constructor(props: any) {
        super(props);
        this.options = [
            {
                columField: "Name",
                type: "text"
            },
            {
                columField: "Description",
                type: "text"
            },
            {
                columField: "Status",
                type: "selection"
            },
            {
                columnText: "Email @",
                columField: "Email",
                type: "text"
            }
        ];
    }

    onParseOk(expressions: Expression[]) {

        var newData = new SimpleResultProcessing(this.options).process(data, expressions);
        this.setState({ data: newData });
        console.log(newData);
    }

    render() {
        var rows = this.state.data;
        return <div className="main-container">
            <h3>Default setting, support filter data out of the box <span style={{ fontSize: 12, color: "darkgray" }}>(select Status will show values auto complete) </span>
                <a style={{ fontSize: 12, color: "#2196F3" }} href="https://github.com/nhabuiduc/react-filter-box/blob/master/js-example/src/demo1.js">Source</a>
            </h3>

            <ReactFilterBox
                query={this.state.query}
                options={this.options}
                onParseOk={this.onParseOk.bind(this)}
            />
        </div>
    }
}
