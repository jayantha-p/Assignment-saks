const express = require('express');
const router = express.Router();

var connection = require('../db')
var mail = require('../config/mail_handler')

// Login Page
router.get('/login', (req, res) => res.render('login'));

// Register email verify Page
router.get('/reg_mail_verify', (req, res) => res.render('reg_email_verify'));

// User Edit Page
router.get('/userEdit/(:email)', function (req, res) {

    let email = req.params.email;

    connection.query('SELECT * FROM user WHERE email = ?', email, function (err, rows, fields) {
        if (err) throw err

        // if user not found
        if (rows.length <= 0) {
            console.log('canot find user..!');
        }
        // if user found
        else {
            // render to userEdit.ejs
            res.render('userEdit', {
                title: 'Edit User',
                fname: rows[0].fname,
                lname: rows[0].lname,
                email: rows[0].email,
                empNo: rows[0].empNo,
                companyName: rows[0].companyName,
                dob: rows[0].dob,
                gender: rows[0].gender,
                nic: rows[0].nic,
                maritalStatus: rows[0].maritalStatus,
                address: rows[0].address,
                designation: rows[0].designation
            });
        }
    });
});



router.post('/userUpdate/:email', function (req, res) {
    let fname = req.body.fname;
    let lname = req.body.lname;
    let empNo = req.body.empNo;
    let companyName = req.body.companyName;
    let dob = req.body.dob;
    let gender = req.body.gender;
    let nic = req.body.nic;
    let maritalStatus = req.body.maritalStatus;
    let address = req.body.address;
    let designation = req.body.designation;
    let email = req.params.email;

    let errors = false;

    // if no error
    if (!errors) {
        var form_data = {
            fname: fname,
            lname: lname,
            empNo: empNo,
            companyName: companyName,
            dob: dob,
            gender: gender,
            nic: nic,
            maritalStatus: maritalStatus,
            address: address,
            designation: designation
        }
        // insert query
        connection.query('UPDATE user SET ? WHERE email = \'' + email + '\'', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                console.log(err);

            } else {
                console.log('User successfully Updated');

                connection.query('SELECT * FROM user WHERE email = \'' + email + '\'', function (err, result) {
                    if (err) {
                        console.log(err)

                    } else {
                        res.render('home', { data: result, message:"User Succesfully Updated" });
                    }
                });
            }
        })
    }
});


router.get('/userDelete/(:email)', function (req, res) {

    let email = req.params.email;

    connection.query('DELETE FROM user WHERE email = \'' + email + '\'', function (err, result) {
        //if(err) throw err
        if (err) {
            console.log(err)
        } else {
            console.log('User successfully deleted!');

            //res.redirect('/users/login');
            res.render('login', {  message:"User Succesfully Deleted" });
        }
    })
})



// Email Regiter Handle
router.post('/validateOtp', (req, res) => {

    let email = req.body.email;
    let page = req.body.page;
    let otp = req.body.otp;
 
    console.log(req.body)

    connection.query('SELECT otp FROM otp WHERE email = ?', email, function (err, result) {
        if (err) {
            console.log(err)

        } else {
            if(result[0].otp==otp){                
                console.log('otp matched') 

                if (page == 'register'){
                    res.render('register', {
                        email: req.body.email,success:"Login Success"
                    });
                } else {

                    connection.query('SELECT * FROM user WHERE email = ?', email, function (err, result) {
                        if (err) {
                            console.log(err)                
                        } else {
                            res.render('home', { data: result, message:"Login Success" });
                        }
                    });
                }                

            }
            else{
                console.log('enterd otp wrong')
                if (page == 'register'){
                    res.render('reg_email_verify', {
                        email: req.body.email,message:"Please enter correct OTP"
                    });
                } else {
                    res.render('login', {
                        email: req.body.email,message:"Please enter correct OTP"
                    });
                }                
            }
        } 
    })

});


// Email Regiter OTP Handle 
router.post('/regOtp', (req, res) => {
    var email = req.body.email
    var page = req.body.page
    var otp = mail.generate_otp()

    var form_data = {
        email: email,
        otp: otp
    }

    if(page == 'register'){
        connection.query('select 1 from user where email = ?',email, function(err, result){
            if (err) {
                console.log(err)    
            } else {
                if(result[0] != null){
                    console.log('email already registered..')
                   
                    res.render('reg_email_verify', {
                        message:"email already registered.."
                    });

                } else {
                    connection.query('Truncate table otp');
                    connection.query('INSERT INTO otp SET ?', form_data, function (err, result) {

                        if (err) {
                            console.log(err)
                
                        } else {
                            mail.send_otp(email, otp).then(function (next, d) {                
                                res.render('reg_email_verify',{
                                    email:email,
                                    otp:otp
                                });
                            })
                        }
                    });
                }
                
            }
        });
    } else {
        connection.query('select 1 from user where email = ?',email, function(err, result){
            if (err) {
                console.log(err)    
            } else {
                if(result[0] == null){
                    console.log('email not registered..!')

                    res.render('login', {
                        message:"email not registered.."
                    });
                } else {
                    connection.query('Truncate table otp');
                    connection.query('INSERT INTO otp SET ?', form_data, function (err, result) {

                        if (err) {
                            console.log(err)
                
                        } else {
                            mail.send_otp(email, otp).then(function (next, d) {                
                                res.render('login',{
                                    email:email,
                                    otp:otp
                                });
                            })
                        }
                    });
                }
                
            }
        });
    }
});

// user Regiter Handle
router.post('/register', (req, res) => {

    let fname = req.body.fname;
    let lname = req.body.lname;
    let email = req.body.email;
    let gender = req.body.gender;
    let dob = req.body.dob;

    let errors = false;

    /*
        validation here
    */

    // if no error
    if (!errors) {
        var form_data = {
            fname: fname,
            lname: lname,
            email: email,
            gender: gender,
            dob: dob
        }
        // insert query
        connection.query('INSERT INTO user SET ?', form_data, function (err, result) {
            //if(err) throw err
            if (err) {
                console.log(err)

            } else {
                console.log('User successfully added');
                // res.send(500,'showAlert') ;
                // res.redirect('/users/login');
                res.render('login', {
                    successmessage:"User Succefully Created.."
                });
            }
        })
    }

});


// // home page
// router.post('/home', (req, res) => {
//     console.log(req.body);
//     connection.query('SELECT * FROM user WHERE email = ?', req.body.email, function (err, result) {
//         if (err) {
//             console.log(err)

//         } else {
//             res.render('home', { data: result });
//         }
//     })
// });




module.exports = router;