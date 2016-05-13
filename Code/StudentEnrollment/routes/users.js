var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens //used to manipulate POST

var config = require('../config');
var user = require('../model/user_model');


//This will make sure that every requests that hits this controller will pass through these functions
router.use(bodyParser.urlencoded({
    extended: true
}))
router.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))



//Create a new student
router.route('/student').post(function(req, res) {
    // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
    // var userId = req.body.userId;
    var userName = req.body.userName;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var password = req.body.password;
    var email = req.body.email;
    var adddress = req.body.adddress;
    var contactNumber = req.body.contactNumber;
    var dob = req.body.dob,
        gender = req.body.gender,
        alStream = req.body.alStream,
        zScore = req.body.zScore,
        Department = 1,
        registeredDate = req.body.registeredDate,
        profileImage = "testS";
    // var subjects = req.body.subjects;

    //, subjects =  {moduleCode:req.body.subjects}
    //,subjects : subjects
    // profileImage = req.body.profileImage,


    //call the create function for our database
    mongoose.model('student').create({

        userName: userName,
        firstName: firstName,
        password: password,
        email: email,
        adddress: adddress,
        contactNumber: contactNumber,
        lastName: lastName,
        dob: dob,
        gender: gender,
        alStream: alStream,
        zScore: zScore,
        Department: Department,
        registeredDate: registeredDate,
        profileImage: profileImage
    }, function(err, user) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
            console.log(err);
        } else {
            //Blob has been created
            console.log('POST creating new blob: ' + user);
            res.format({

                //JSON response will show the newly created blob
                json: function() {
                    res.json(user);
                }
            });
        }
    })
});


// route middleware to validate :type
router.param('type', function(req, res, next, type) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database

    console.log('validating ' + type + ' exists');
    //id = "" + id;
    //find the ID in the Database

    if (type === "student" || type === "admin" || type === "coordinator") {
        //console.log("Test");
        req.type = type;
        next();
    } else {
        console.log(type + ' was not found');
        res.status(404)
        var err = new Error('Not Found');
        err.status = 404;
        res.format({
            html: function() {
                next(err);
            },
            json: function() {
                res.json({
                    message: err.status + ' ' + err
                });
            }
        });
    }


});


// route to authenticate a user (POST http://localhost:8080/api/authenticate)
router.post('/:type/authenticate', function(req, res) {
    
    // router.get('/:type/authenticate/:userName/:password', function(req, res) {
 console.log(req.params);
    // find the user
    mongoose.model(req.type).findOne({
        userName: req.body.userName
    }, function(err, user) {
        console.log("username is "+req.params.userName);

        if (err) throw err;

        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed. User not found.'
            });
        } else if (user) {

            //// check if password matches
            //user.verifyPassword(req.body.password, function (err, isMatch) {
            //  if(isMatch && !err){
            //    // if user is found and password is right
            //    // create a token
            //    var token = jwt.sign(user, config.secret, {
            //      expiresInMinutes: 1 // expires in 24 hours (in Mini)
            //    });
            //
            //    // return the information including token as JSON
            //    res.json({
            //      success: true,
            //      message: 'Enjoy your token!',
            //      token: token
            //    });
            //  }else{
            //    res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            //  }
            //});

            if (user.password == req.body.password) {
                //console.log(user.__t);
                var claims = {
                    userName: user.userName,
                    type: user.__t || 'student'
                };

                var token = jwt.sign(claims, config.secret, {
                    expiresInMinutes: 1440 // expires in 24 hours (in Mini)
                });
                     console.log("token is"+token);
                  
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                                 });
            } else {
                res.json({
                    success: false,
                    message: 'Authentication failed. Wrong password.'
                });
            }


        }

    });
});

// route middleware to validate :username
router.param('userName', function(req, res, next, userName) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database

    console.log('validating ' + userName + ' exists');
    // id = "" + id;
    //find the ID in the Database
    mongoose.model(req.type).findOne({
        userName: userName
    }, function(err, user) {
        //if it isn't found, we are going to repond with 404
        console.log(err);
        if (err || user == null) {
            console.log(userName + ' was not found');
            res.status(404)
            var err = new Error('User Not Found');
            err.status = 404;
            res.format({
                html: function() {
                    next(err);
                },
                json: function() {
                    res.json({
                        message: '' + err
                    });
                }
            });
            //if it is found we continue on
        } else {

            console.log(user);
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.userName = userName;
            // go to the next thing
            next();
        }
    });
});


// RFID validation
router.route('/:type/:userName/rfidvalidate/:rfid')
    .get(function(req, res) {

        if (req.type != "student") {
            return res.status(404).send({
                success: false,
                message: 'Wrong URL'
            });
        }

        mongoose.model('student').findOne({
            userName: req.userName,
            rfid: req.params.rfid
        }, 'rfid', function(err, student) {
            // console.log('ID: ' + req.params.id);
            if (err) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {

                console.log('GET Retrieving ID: ' + student);
                var message, status;
                if (student != null) {
                    message = "Ok";
                    status = true;
                } else {
                    message = "Invalid";
                    status = false;
                }

                //var blobdob = student.userName.toISOString();
                //blobdob = blobdob.substring(0, blobdob.indexOf('T'))
                res.format({
                    json: function() {
                        res.json({
                            message: message,
                            status: status
                        });
                    }
                });
            }
        });
    });




// // route middleware to verify a token
// router.use(function(req, res, next) {

//     // check header or url parameters or post parameters for token
//     var token = req.body.token || req.query.token || req.headers['x-access-token'];

//     // decode token
//     if (token) {

//         // verifies secret and checks exp
//         jwt.verify(token, config.secret, function(err, decoded) {
//             if (err) {
//                 return res.json({
//                     success: false,
//                     message: 'Failed to authenticate token.'
//                 });
//             } else {
//                 // if everything is good, save to request for use in other routes
//                 req.decoded = decoded;
//                 next();
//             }
//         });

//     } else {

//         // if there is no token
//         // return an error
//         return res.status(403).send({
//             success: false,
//             message: 'No token provided.'
//         });

//     }
// });


//Create a new coordinator
router.route('/coordinator').post(function(req, res) {

    if (req.decoded.type != 'admin') {
        return res.format({


            json: function() {

                res.status(403).json({
                    success: false,
                    message: 'You don\'t have privilages to access '
                });
            }
        });

    }

    //call the create function for our database
    mongoose.model('coordinator').create(req.body, function(err, user) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
            console.log(err);
        } else {
            //Blob has been created
            console.log('POST creating new blob: ' + user);
            res.format({


                //JSON response will show the newly created blob
                json: function() {
                    res.json(user);
                }
            });

            //if it is found we continue on
        }
    })
});



// // Student API Get all the student in GET and add new Student in POST
// router.route('/:type')
//     //GET all blobs
//     .get(function(req, res, next) {
//
//         //retrieve all blobs from Monogo
//         mongoose.model(req.type).find({}, function (err, users) {
//               if (err) {
//                   return console.error(err);
//               } else {
//                   //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
//                   res.format({
//
//                     //JSON response will show all blobs in JSON format
//                     json: function(){
//                         res.json(users);
//                     }
//                 });
//               }
//         });
//     });



//     /* GET New Student page. */
// router.get('/student/new', function(req, res) {
//     res.render('users/new', { title: 'Add New User' });
// });



// Get data per user
router.route('/:type/:userName')

.get(function(req, res) {
    mongoose.model(req.type).findOne({
        userName: req.userName
    }, function(err, student) {
        // console.log('ID: ' + req.params.id);
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            console.log('GET Retrieving ID: ' + student.userName);
            //var blobdob = student.userName.toISOString();
            //blobdob = blobdob.substring(0, blobdob.indexOf('T'))
            res.format({

                json: function() {
                    res.json(student);
                }
            });
        }
    });
});


//GET the individual blob by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the blob within Mongo
    mongoose.model('admin').findById(req.userId, function(err, admin) {
        if (err) {
            console.log('GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the blob
            console.log('GET Retrieving ID: ' + admin.userId);
            //format the date properly for the value to show correctly in our edit form
            var blobdob = admin.userName.toISOString();
            // blobdob = blobdob.substring(0, blobdob.indexOf('T'))
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function() {
                    res.render('blobs/edit', {
                        title: 'Blob' + admin.userId,
                        "blobdob": blobdob,
                        "blob": admin
                    });
                },
                //JSON response will return the JSON output
                json: function() {
                    res.json(admin);
                }
            });
        }
    });
});



// Get Subjects Per Student
router.route('/:type/:userName/subjects')
    .get(function(req, res) {

        if (req.type == "admin") {
            return res.status(404).send({
                success: false,
                message: 'Wrong URL'
            });
        }

        mongoose.model(req.type).findOne({
            userName: req.userName
        }, 'subjects', function(err, subjects) {
            // console.log('ID: ' + req.params.id);
            if (err || subjects == null) {
                console.log('GET Error: There was a problem retrieving: ' + err);
            } else {

                console.log('GET Retrieving Subject ID: ' + subjects.subjects);
                mongoose.model("subject").find({
                    moduleCode: {
                        $in: subjects.subjects
                    }
                }, function(err, subject) {
                    if (err || subjects == null) {
                        console.log('GET Error: There was a problem retrieving: ' + err);
                    } else {
                        console.log('GET Retrieving Subjects: ' + subject);
                        res.format({
                            json: function() {
                                res.json(subject);
                            }
                        });
                    }
                });

                //var blobdob = student.userName.toISOString();
                //blobdob = blobdob.substring(0, blobdob.indexOf('T'))

            }
        });
    });




//Update Users
router.put('/:type/:userName', function(req, res) {

    //find the document by ID

    if (req.body.subjects.state == 1) {
        if (req.decoded.type == "student") {
            return res.format({
                json: function() {
                    res.status(403).json({
                        success: false,
                        message: 'You don\'t have privilages to access'
                    });
                }
            });
        }
    }


    if (req.type == "admin") {
        if (req.decoded.type != "admin") {
            return res.status(403).send({
                success: false,
                message: 'You don\'t have privilages to access'
            });
        }
    }
    if (req.type == "coordinator") {
        if (req.decoded.type == "student") {
            return res.status(403).send({
                success: false,
                message: 'You don\'t have privilages to access'
            });
        }
    }
    mongoose.model(req.type).findOneAndUpdate({
        userName: req.userName
    }, {
        "$set": req.body
    }, {
        new: true
    }, function(err, place) {

        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } else {
            res.format({
                //JSON responds showing the updated values
                json: function() {
                    res.json(place);
                }
            });
        }
    });
});







router.delete('/:type/:userName', function(req, res) {

    //find blob by ID

    if (req.type == "admin") {
        if (req.decoded.type != "admin") {
            return res.status(403).send({
                success: false,
                message: 'You don\'t have privilages to access'
            });
        }
    }
    if (req.type == "coordinator") {
        if (req.decoded.type == "student") {
            return res.status(403).send({
                success: false,
                message: 'You don\'t have privilages to access'
            });
        }
    }

    mongoose.model(req.type).findOneAndRemove({
        userName: req.userName
    }, function(error, student) {
        if (error) {
            return console.error(error);
        } else {
            //Returning success messages saying it was deleted
            console.log('DELETE removing ID: ' + student.userName);
            res.format({

                //JSON returns the item with the message that is has been deleted
                json: function() {
                    res.json({
                        message: 'deleted',
                        item: student
                    });
                }
            });
        }
    });

});


//Enrrole a student for a subject
router.put('/:type/:userName/subjects', function(req, res) {

    //find the document by ID

    req.checkBody('subjects', 'Invalid body').notEmpty();

    if (req.type == "admin") {
        return res.status(404).send({
            success: false,
            message: 'Wrong URL'
        });
    }

    if (req.body.subjects.state == 1) {
        if (req.decoded.type == "student") {
            return res.format({


                json: function() {

                    res.status(403).json({
                        success: false,
                        message: 'You don\'t have privilages to access'
                    });
                }
            });
        }
    }

    var errors = req.validationErrors();
    if (errors) {
        res.send('There have been validation errors: ' + errors, 400);
        return;
    }

    mongoose.model(req.type).findOneAndUpdate({
        userName: req.userName
    }, {
        "$push": {
            subjects: req.body.subjects
        }
    }, {
        upsert: true,
        new: true
    }, function(err, place) {
        //update it


        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } else {

            res.format({

                //JSON responds showing the updated values
                json: function() {
                    res.json(place);
                }
            });
        }

    });


});


//Unerrole a subject from student
router.delete('/student/:userName/subjects', function(req, res) {
    //find blob by ID
    req.checkBody('subjects', 'Invalid body').notEmpty();


    var errors = req.validationErrors();
    if (errors) {
        res.send('There have been validation errors: ' + errors, 400);
        return;
    }


    mongoose.model('student').findOneAndUpdate({
        userName: req.userName
    }, {
        "$pull": {
            subjects: req.body.subjects
        }
    }, {
        new: true
    }, function(err, place) {
        //update it


        if (err) {
            res.send("There was a problem updating the information to the database: " + err);
        } else {

            res.format({

                //JSON responds showing the updated values
                json: function() {
                    res.json(place);
                }
            });
        }

    });



});


//   //GET the individual blob by Mongo ID
// router.get('/:id', function(req, res) {
//     //search for the blob within Mongo
//     mongoose.model('admin').findById(req.userId, function (err, admin) {
//         if (err) {
//             console.log('GET Error: There was a problem retrieving: ' + err);
//         } else {
//             //Return the blob
//             console.log('GET Retrieving ID: ' + admin.userId);
//             //format the date properly for the value to show correctly in our edit form
//           var blobdob = admin.userName.toISOString();
//           // blobdob = blobdob.substring(0, blobdob.indexOf('T'))
//             res.format({
//                 //HTML response will render the 'edit.jade' template
//                 html: function(){
//                        res.render('blobs/edit', {
//                           title: 'Blob' + admin.userId,
//                         "blobdob" : blobdob,
//                           "blob" : admin
//                       });
//                  },
//                  //JSON response will return the JSON output
//                 json: function(){
//                        res.json(admin);
//                  }
//             });
//         }
//     });
// });


// //GET the individual Student by ID
// router.get('/student/:id/edit', function(req, res) {
//   //search for the blob within Mongo
//   mongoose.model('admin').findOne({userId:req.params.id}, function (err, admin) {
//       if (err) {
//           console.log('GET Error: There was a problem retrieving: ' + err);
//       } else {
//           //Return the blob
//           console.log('GET Retrieving ID: ' + admin.userId);
//           //format the date properly for the value to show correctly in our edit form
//         var blobdob = admin.userName.toISOString();
//         // blobdob = blobdob.substring(0, blobdob.indexOf('T'))
//           res.format({
//               //HTML response will render the 'edit.jade' template
//               html: function(){
//                      res.render('blobs/edit', {
//                         title: 'Blob' + admin.userId,
//                       "blobdob" : blobdob,
//                         "blob" : admin
//                     });
//                },
//                //JSON response will return the JSON output
//               json: function(){
//                      res.json(admin);
//                }
//           });
//       }
//   });
// });


module.exports = router;
