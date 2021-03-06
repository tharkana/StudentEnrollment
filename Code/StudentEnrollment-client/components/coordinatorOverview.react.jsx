'use strict';

var React = require('react');
var request = require('superagent');
var nocache = require('superagent-no-cache');
import {Panel, Form, FormControl, FormGroup, ControlLabel, HelpBlock, Checkbox, Radio, Button, PageHeader, Modal, Col} from 'react-bootstrap';



import {BootstrapTable,TableHeaderColumn} from 'react-bootstrap-table'
import './../node_modules/react-bootstrap-table/css/react-bootstrap-table.min.css'
import ErrorHandling from './Utils/ErrorHandling';


function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}
var boolGaurd = true;
var tick = 0;
var previousTime = 0;

module.exports = React.createClass({
    displayName: 'App',


    getInitialState: function () {
        // var data = [];

        return {
            moduleCode: '',
            moduleName: '',
            day: '',
            semester: '',
            timeSlot: '',
            credits: '',
            description: '',
            status: '',
            count: '',
            showModal: false,

            data: []
        };
    },

    componentWillReceiveProps(newProps){
        this.setState({data: newProps.data})

    },



    close() {
        this.setState({showModal: false});
    },

    open() {
        this.setState({showModal: true});
    },


    startTimer() {
        var myVar = setInterval(function () {
            tick++;
            //console.log("x" + tick);
            if (tick - previousTime >= 3) {
                clearTimeout(myVar);
                boolGaurd = true;
                request.get('http://localhost:3000/subjects/' + this.state.moduleCode.trim())
                    .set('Accept', 'application/json')
                    .set('x-access-token', this.props.token)
                    .end(function (err, res) {
                        if (err) {
                        } else {
                            if (res.body || res.body.moduleCode || res.body === null || res.body === 'null') {
                                alert("Module Code is already taken");
                            }
                        }
                    });
            }
        }.bind(this), 1000);
    },


    handleChangeModuleCode: function (event) {
        //console.log("er");
        previousTime = tick;
        this.setState({
            moduleCode: event.target.value
        });
        if (boolGaurd) {
            boolGaurd = false;
            this.startTimer();
        }
    },
    handleChangeModuleName: function (event) {
        this.setState({moduleName: event.target.value});
    },
    handleChangeCredits: function (event) {
        this.setState({credits: event.target.value});
    },

    handleChangeDescription: function (event) {
        this.setState({description: event.target.value});
    },
    handleSelectSem: function (event) {
        this.setState({semester: event.target.value})
    },
    handleSelectDay: function (event) {
        this.setState({day: event.target.value});
    },
    handleSelectTimeSlt: function (event) {
        this.setState({timeSlot: event.target.value});
    },


    handleSubmit(data) {

        data.preventDefault();
        var formAddSub = {
            moduleCode: this.state.moduleCode.trim(),
            moduleName: this.state.moduleName.trim(),
            credits: this.state.credits.trim(),
            semester: this.state.semester.trim(),
            day: this.state.day.trim(),
            timeSlot: this.state.timeSlot.trim(),
            description: this.state.description.trim(),

        };

        var tabelData = {
            moduleCode: this.state.moduleCode.trim(),
            moduleName: this.state.moduleName.trim(),
            credits: this.state.credits.trim(),
            semester: this.state.semester.trim(),
            day: this.state.day.trim(),
            timeSlot: this.state.timeSlot.trim(),
            description: this.state.description.trim(),
            status: '1'

        };

        this.state.data.push(tabelData);
        this.setState({data: this.state.data});


        request.post('http://localhost:3000/subjects/subjectAdd')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('x-access-token', this.props.token)
            .send(formAddSub)
            .end(function (err, res) {
                if (err || !res.ok) {
                    console.log('Oh no! error');
                    ErrorHandling.tokenErrorHandling(err.response);
                } else {
                    console.log('yay got ' + JSON.stringify(formAddSub));
                    this.close();


                }

            }.bind(this));


        request.put('http://localhost:3000/users/coordinator/' + this.props.userName + '/subjectAdd')
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .set('x-access-token', this.props.token)
            .send(formAddSub)
            .end(function (err, res) {
                if (err || !res.ok) {
                    console.log('Oh no! error to add it coordinator');
                    ErrorHandling.tokenErrorHandling(err.response);
                } else {
                    console.log('yay got ');
                }
            })
    },


    afterDeleteRow(data)
    {

        request
            .put('http://localhost:3000/subjects/delete/' + data)
            .set('x-access-token', this.props.token)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err || !res.ok) {
                    // alert('Oh no! error');
                    console.log('Oh no! error' + err);
                    ErrorHandling.tokenErrorHandling(err.response);
                } else {
                    // alert('yay got ' + JSON.stringify(res.body));
                    console.log('yay got ' + JSON.stringify(res.body));
                }
            });
    }
    ,

    afterSaveCell(row)
    {
        console.log(row.moduleCode)
        request
            .put('http://localhost:3000/subjects/update/' + row.moduleCode)
            .send(row)
            .set('x-access-token', this.props.token)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err || !res.ok) {

                    console.log('Oh no! error' + err);
                    ErrorHandling.tokenErrorHandling(err.response);
                } else {

                    console.log('yay got ' + JSON.stringify(res.body));
                }
            });
    }
    ,


    format(cell, row)
    {
        return '<i class="glyphicon glyphicon-usd"></i> ' + cell;
    }
    ,

    onRowSelect(row, isSelected)
    {
        console.log(row);
        console.log("selected: " + isSelected)
    }
    ,


    render()
    {

        var selectRowProp = {
            mode: "radio",
            clickToSelect: true,
            bgColor: "rgb(238, 193, 213)",
            onSelect: this.onRowSelect
        };
        var options = {
            afterDeleteRow: this.afterDeleteRow,

        };
        var cellEdit = {
            mode: "click",
            blurToSave: true,
            afterSaveCell: this.afterSaveCell
        };

        var semesters = {
            0: "Semester 1",
            1: "Semester 2",
            2: "Semester 3",
            3: "Semester 4",
            4: "Semester 5",
            5: "Semester 6",
            6: "Semester 7",
            7: "Semester 8",

        };
        var days = {
            0: "Sunday",
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday",

        };
        var timeSlots = {
            0: "08.15-10.15",
            1: "10.30-12.30",
            2: "13.15-15.15",
            3: "15.30-17.30"

        };
        return (
            <div>
                <div><Col mdOffset={10} md={2}> <Button bsStyle="success" bsSize="xsmall" onClick={this.open}>Add
                    Subject</Button></Col></div>
                <h1>Subject List</h1>


                <BootstrapTable
                    data={this.state.data}
                    striped={true}
                    hover={true}
                    condensed={true}
                    pagination={true}
                    selectRow={selectRowProp}
                    deleteRow={true}
                    columnFilter={true}
                    search={true}
                    options={options}
                    cellEdit={cellEdit}>

                    <TableHeaderColumn dataField="moduleCode" isKey={true}>Module Code</TableHeaderColumn>
                    <TableHeaderColumn dataField="moduleName">Module Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="semester" dataFormat={enumFormatter} formatExtraData={semesters}
                                       editable={{type: "select",defaultValue:{semester:this.state.semester}, options: {values: [0,1,2,3,4,5,6,7]}}}>Semester</TableHeaderColumn>
                    <TableHeaderColumn dataField="day" dataFormat={enumFormatter} formatExtraData={days}
                                       editable={{type: "select",defaultValue:{day:this.state.day}, options: {values: [0,1,2,3,4,5,6]}}}>Day</TableHeaderColumn>
                    <TableHeaderColumn dataField="timeSlot" dataFormat={enumFormatter} formatExtraData={timeSlots}
                                       editable={{type: "select",defaultValue:{timeSlot:this.state.timeSlot}, options: {values: [0,1,2,3]}}}>timeSlot</TableHeaderColumn>

                    <TableHeaderColumn dataField="count" editable={false}>Student Count</TableHeaderColumn>
                    <TableHeaderColumn dataField="description">Description </TableHeaderColumn>
                </BootstrapTable>

                <div className="modal-container">
                    <Modal
                        show={this.state.showModal}
                        onHide={this.close}
                        //show={this.state.show}
                        //onHide={close}
                        //container={this}
                        aria-labelledby="contained-modal-title"
                        >
                        <Modal.Header closeButton>
                            <Modal.Title id="contained-modal-title">Contained Modal</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <Form onSubmit={this.handleSubmit}>
                                    <Col md={12}>
                                        <FormGroup>
                                            <ControlLabel>Module Code</ControlLabel>
                                            <FormControl type="text"
                                                         ref="moduleCode"
                                                         value={this.state.moduleCode}
                                                         onChange={this.handleChangeModuleCode}
                                                         required="true"
                                                />
                                        </FormGroup>
                                    </Col><Col md={12}>


                                    <FormGroup>
                                        <ControlLabel>Module Name</ControlLabel>
                                        <FormControl type="text"
                                                     ref="moduleName"
                                                     value={this.state.moduleName}
                                                     onChange={this.handleChangeModuleName}
                                                     required="true"/>
                                    </FormGroup>

                                </Col> <Col md={6}>
                                    <FormGroup>
                                        <ControlLabel>Credits</ControlLabel>
                                        <FormControl
                                            ref="credits"
                                            value={this.state.credits}
                                            onChange={this.handleChangeCredits}
                                            required="true"
                                            type="number" min="0" max="4" step="0.1"
                                            />
                                    </FormGroup>

                                </Col>
                                    <Col md={6}>
                                        <FormGroup >
                                            <ControlLabel>Semester</ControlLabel>
                                            <FormControl componentClass="select" placeholder="select" ref="semester"
                                                         onChange={this.handleSelectSem}
                                                         required="true"
                                                >

                                                <option value="">~Select ~</option>
                                                <option value="0">Semester 1</option>
                                                <option value="1">Semester 2</option>
                                                <option value="2">Semester 3</option>
                                                <option value="3">Semester 4</option>
                                            </FormControl>
                                        </FormGroup>

                                    </Col>
                                    <Col md={6}>
                                        <FormGroup >
                                            <ControlLabel>Day</ControlLabel>
                                            <FormControl componentClass="select" placeholder="select" ref="day"
                                                         onChange={this.handleSelectDay}
                                                         required="true">
                                                <option value="">~Select ~</option>
                                                <option value="0">Sunday</option>
                                                <option value="1">Monday</option>
                                                <option value="2">Tuesday</option>
                                                <option value="3">Wednesday</option>
                                                <option value="4">Thuesday</option>
                                                <option value="5">Friday</option>
                                                <option value="6">Saturday</option>
                                            </FormControl>
                                        </FormGroup>

                                    </Col> <Col md={6}>
                                    <FormGroup >
                                        <ControlLabel>Time Slot</ControlLabel>
                                        <FormControl componentClass="select" placeholder="select" ref="timeSlot"
                                                     onChange={this.handleSelectTimeSlt}
                                                     required="true">
                                            <option value="">~Select ~</option>
                                            <option value="0">08.15-10.15</option>
                                            <option value="1">10.30-12.30</option>
                                            <option value="2">13.15-15.15</option>
                                            <option value="3">15.30-17.30</option>
                                        </FormControl>
                                    </FormGroup>

                                </Col>
                                    <Col md={12}>
                                        <FormGroup >
                                            <ControlLabel>Description</ControlLabel>
                                            <FormControl componentClass="textarea" placeholder="Description here"
                                                         ref="description"
                                                         value={this.state.description}
                                                         onChange={this.handleChangeDescription}/>
                                        </FormGroup>

                                    </Col>


                                    <Col sm={6}>
                                        <Button bsStyle="danger" onClick={this.close}>Close</Button>
                                        <Button bsStyle="success" type="submit">Submit</Button>
                                    </Col>
                                </Form>
                            </div>
                        </Modal.Body>
                        <Modal.Footer>

                        </Modal.Footer>
                    </Modal>


                </div>

            </div>
        );
    }
})
;

// module.exports = SubjectTabelAdmin;
// module.exports = hello;
