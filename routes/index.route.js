var express = require('express');
var router = express.Router();
const mysql = require('mysql');


const connection = require('../db/index.db');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});
router.get('/header', function (req, res, next) {
    if (req.session.admin_id) {
        res.render('header', { adminname: req.session.admin_name });
    }
});
router.get('/home', (req, res, next) => {
    if (req.session.admin_id) {
        res.render('home', { adminname: req.session.admin_name });
    } else {
        console.log("session expire");
        res.redirect('/login');
    }
});
router.get('/changepassword', (req, res, next) => {
    if (req.session.admin_id) {
        res.render('changepassword', { adminname: req.session.admin_name });
    } else {
        console.log("Session Expire");
        res.redirect('/login');
    }
});
//process to change password
router.post('/changepasswordprocess', (req, res, next) => {
    var admin_id = req.session.admin_id;
    var opass = req.body.opass;
    var npass = req.body.npass;
    var cpass = req.body.cpass;
    if (req.session.admin_id) {
        connection.query("select * from tbl_admin where admin_id=?", [admin_id], function (err, admin_row) {
            if (err) {
                res.send(err);
            } else {
                if (admin_row.length > 0) {

                    var admin_pass = admin_row[0].admin_pass;
                    console.log(admin_pass);

                    if (opass == admin_pass) {

                        if (npass == cpass) {

                            connection.query("update tbl_admin set admin_pass=? where admin_id=?", [npass, admin_id], function (err) {
                                console.log("Password Change Successfully");
                                res.redirect('/home');
                            });

                        } else {
                            res.send("New Password And Confirm Password Not Matched..");
                        }
                    } else {
                        res.send("Old Password Not Matched..");
                    }
                } else {
                    res.send("No record found..")
                }
            }
        });

    } else {
        console.log("session expiry");
        res.redirect('/login');
    }
});

router.get('/forgotpassword', function (req, res, next) {
    res.render('forgotpassword');
});
//process to forgot password sent password in mail
router.post('/forgotpasswordprocess', function (req, res, next) {
    var admin_email = req.body.admin_email;
    connection.query("select * from tbl_admin where admin_email=?", [admin_email], function (err, admin_row) {
        if (err) {
            res.send(err);
        } else {
            if (admin_row.length > 0) {
                //
                "use strict";
                const nodemailer = require("nodemailer");
                // async..await is not allowed in global scope, must use a wrapper
                async function main() {
                    // Generate test SMTP service account from ethereal.email
                    // Only needed if you don't have a real mail account for testing
                    let testAccount = await nodemailer.createTestAccount();

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        secure: false, // true for 465, false for other ports
                        auth: {
                            user: 'testing.devloper.test@gmail.com', // generated ethereal user
                            pass: 'test@4402', // generated ethereal password
                        },
                    });
                    //take value from text box to session variable and session varivalr to simple variable
                    var admin_pass = admin_row[0].admin_pass;
                    console.log(admin_pass);

                    // send mail with defined transport object
                    let info = await transporter.sendMail({
                        from: "testing.devloper.test@gmail.com", // sender address
                        to: admin_email, // list of receivers
                        subject: "Forgot Password", // Subject line
                        text: "Password is " + admin_pass, // plain text body
                        html: "Password is " + admin_pass, // html body
                    });
                    // '"Fred Foo 👻" <foo@example.com>'

                    console.log("Message sent: %s", info.messageId);
                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                    // Preview only available when sending through an Ethereal account
                    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
                }

                main().catch(console.error);

                res.send("Email Sent Successfully...");

            } else {
                res.send("No Data Found");
            }
        }
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', { title: 'login', error: '' });
});
router.get('/admin', function (req, res, next) {
    if (req.session.admin_id) {
        res.render('admin', { adminname: req.session.admin_name, error: '' });
    } else {
        console.log("Session Expire");
        res.redirect('/login');
    }
});
router.get('/category', function (req, res, next) {
    if (req.session.admin_id) {
        res.render('category', { adminname: req.session.admin_name, error: '' });
    } else {
        console.log("Session Expire");
        res.redirect('/login');
    }
});
router.get('/product', function (req, res, next) {
    if (req.session.admin_id) {
        connection.query("select * from tbl_category", function (err, category_row) {
            res.render('product', { adminname: req.session.admin_name, category_array: category_row ,error:''});
        });
    } else {
        console.log("Session Expire");
        res.redirect('/login');
    }

});
router.get('/user', function (req, res, next) {
    if (req.session.admin_id) {
        res.render('user', { adminname: req.session.admin_name });
    } else {
        console.log("Session Expire");
        res.redirect('/login');
    }

});
//table-1 all process
//process to set admin data in database
router.post('/admin', function (req, res, next) {
    if (req.session.admin_id) {
        const admindata = {
            admin_name: req.body.admin_name,
            admin_email: req.body.admin_email,
            admin_pass: req.body.admin_pass
        }
        // console.log(admindata);
        connection.query("insert into tbl_admin set ?", admindata, function (err) {
            if (err) throw err;
            console.log("Data INserted");
            res.render('admin', { adminname: req.session.admin_name, error: "Admin Added Successfully." });
        });
    } else {
        console.log("Session Expire");
        res.redirect('/login');
    }

});
//process to get admin data into table
router.get('/getadminprocess', function (req, res, next) {
    if (req.session.admin_id) {
        connection.query("select * from tbl_admin", function (err, admin_row) {
            console.log(admin_row);
            res.render('admindisplay', { admin_array: admin_row, adminname: req.session.admin_name });
        });
    } else {
        console.log("Session Expire");
        res.redirect('/login');
    }

});
//admin data delete process
router.get('/admindelete/:id', function (req, res, next) {
    var admindeleteid = req.params.id;
    console.log("delete id is " + admindeleteid);
    connection.query("delete from tbl_admin where admin_id=?", [admindeleteid], function (err) {
        if (err) throw err;
        console.log("Record Deleted...");
        res.redirect('/getadminprocess')
    });
});
//step-1 process get admin data to edit form
router.get('/adminedit/:id', function (req, res, next) {
    var admineditid = req.params.id;
    console.log("Edit id is " + admineditid);
    connection.query("select * from tbl_admin where admin_id=?", [admineditid], function (err, admin_row) {
        if (err) throw err;
        res.render('adminedit', { admin_array: admin_row, adminname: req.session.admin_name });
    });
});
//step-2 process to set edited data into database
router.post('/adminedit/:id', function (req, res, next) {
    var admineditid = req.params.id;
    var admin_name = req.body.admin_name;
    var admin_email = req.body.admin_email;
    var admin_pass = req.body.admin_pass;
    connection.query("update tbl_admin set admin_name=?,admin_email=?,admin_pass=? where admin_id=?", [admin_name, admin_email, admin_pass, admineditid], function (err) {
        if (err) throw err;
        res.redirect('/getadminprocess');
    });
});
//get full admin details display
router.get('/adminshow/:id', function (req, res, next) {
    var adminfulldataid = req.params.id;
    console.log("Full data id is " + adminfulldataid);
    connection.query("select * from tbl_admin where admin_id=?", [adminfulldataid], function (err, admin_row) {
        if (err) throw err;
        res.render('adminfulldisplay', { admin_array: admin_row, adminname: req.session.admin_name });
    });
});

//table-2 all process
//process to set gategory data into database
router.post('/category', function (req, res, next) {
    console.log(req.body);
    const categorydata = {
        category_name: req.body.category_name
    }
    connection.query("insert into tbl_category set ?", categorydata, function (err) {
        if (err) throw err;
        console.log("Category data inserted");
        res.render('category', { adminname: req.session.admin_name, error: "Category Added Successfully." });
        // res.redirect('/category');
    });
});
//process to get category data into table
router.get('/getcategoryprocess', function (req, res, next) {
    connection.query("select * from tbl_category", function (err, category_row) {
        if (err) throw err;
        console.log(category_row);
        res.render('categorydisplay', { category_array: category_row, adminname: req.session.admin_name });
    });
});
//process to delete category data
router.get('/categorydelete/:id', function (req, res, next) {
    var catdeleteid = req.params.id;
    console.log("Your deletedd id is " + catdeleteid);
    connection.query("delete from tbl_category where category_id=?", [catdeleteid], function (err) {
        if (err) throw err;
        console.log("Data Deleted..");
        res.redirect('/getcategoryprocess');
    });
});
//step-1 process to get edit data into edit form
router.get('/categoryedit/:id', function (req, res, next) {
    var cateditid = req.params.id;
    console.log("Your Edited id is " + cateditid);
    connection.query("select * from tbl_category where category_id=?", [cateditid], function (err, category_row) {
        if (err) throw err;
        res.render('categoryedit', { category_array: category_row, adminname: req.session.admin_name });
    });
});
//setp-2 process to set edited data into database
router.post('/categoryedit/:id', function (req, res, next) {
    var cateditid = req.params.id;
    var category_name = req.body.category_name;
    connection.query("update tbl_category set category_name=? where category_id=?", [category_name, cateditid], function (err) {
        if (err) throw err;
        console.log("Data Edited Successfully..");
        res.redirect('/getcategoryprocess');
    });
});

//table-3
//process to set product data into databse
router.post('/product', function (req, res, next) {

    var fileobj = req.files.product_image;
    var filenm = req.files.product_image.name;
    var imgpath = "/uploadimage/";
    fileobj.mv("public/uploadimage/" + filenm, function (err) {
        if (err) throw err;
        console.log("Image Upload Successfully");
    });
    var category_name = req.body.category_name;
    connection.query("select category_id from tbl_category where category_name=?", [category_name], function (err, category_row) {
        if (err) throw err;
        const productdata = {
            product_name: req.body.product_name,
            product_details: req.body.product_details,
            product_price: req.body.product_price,
            product_image: imgpath + filenm,
            category_id: category_row[0].category_id
        }
        connection.query("insert into tbl_product set ?", productdata, function (err) {
            if (err) throw err;
            console.log("Data INserted Successfully... :)");
            // res.render('product', { adminname: req.session.admin_name,category_array: category_row, error: "Product Added Successfully." });
            connection.query("select * from tbl_category", function (err, category_row) {
                res.render('product', { adminname: req.session.admin_name, category_array: category_row ,error:"Product Added Successfully"});
            });
            // res.redirect('/product');
        });
    });
});
//process to get product data from databse to form
router.get('/getproductprocess', function (req, res, next) {
    connection.query("select tbl_product.product_id,tbl_product.product_name,tbl_product.product_details,tbl_product.product_price,tbl_product.product_image,tbl_category.category_name from tbl_category Inner Join tbl_product ON (tbl_product.category_id=tbl_category.category_id)", function (err, product_row) {
        if (err) throw err;
        console.log(product_row);
        res.render('productdisplay', { product_array: product_row, adminname: req.session.admin_name });
    });
});
//process to delete product
router.get('/productdelete/:id', function (req, res, next) {
    var prodeleteid = req.params.id;
    console.log("Delete id is " + prodeleteid);

    connection.query("delete from tbl_product where product_id=?", [prodeleteid], function (err) {
        if (err) throw err;
        console.log("Record deleted Successfully..");
        res.redirect('/getproductprocess');
    });
});
//step-1 process to get data in edit form to edit
router.get('/productedit/:id', function (req, res, next) {
    var proeditid = req.params.id;
    console.log("Your edit id is " + proeditid);
    connection.query("select * from tbl_product where product_id=?", [proeditid], function (err, product_row) {
        if (err) throw err;
        console.log(product_row);
        res.render('productedit', { product_array: product_row, adminname: req.session.admin_name });
    });
});
//step-2 process to set edited data into databse
router.post('/productedit/:id', function (req, res, next) {
    var proeditid = req.params.id;
    const producteditdata = {
        product_name: req.body.product_name,
        product_details: req.body.product_details,
        product_price: req.body.product_price,
        product_image: req.body.product_image,
        category_id: req.body.category_id
    }
    connection.query("update tbl_product set? where product_id=?", [producteditdata, proeditid], function (err) {
        if (err) throw err;
        console.log("Data Edited Successfully...");
        res.redirect('/getproductprocess');
    });
});

//table-4
//process to set userdata into database
router.post('/userprocess', function (req, res, next) {
    const userdata = {
        user_name: req.body.user_name,
        user_gender: req.body.user_gender,
        user_email: req.body.user_email,
        user_mobile: req.body.user_mobile,
        user_pass: req.body.user_pass,
        user_address: req.body.user_address
    }
    connection.query("insert into tbl_user set ?", userdata, function (err) {
        if (err) throw err;
        console.log("Data INserted..");
        res.redirect('/user');
    });
});
//process to get user data into form.
router.get('/getuserprocess', function (req, res, next) {
    connection.query("select * from tbl_user", function (err, user_row) {
        if (err) throw err;
        console.log("data fatch successfully..");
        res.render('userdisplay', { user_array: user_row, adminname: req.session.admin_name });
    });
});
//process to delete user data
router.get('/userdelete/:id', function (req, res, next) {
    var userdeleteid = req.params.id;
    console.log("Delete id is " + userdeleteid);
    connection.query("delete from tbl_user where user_id=?", [userdeleteid], function (err) {
        if (err) throw err;
        console.log("Data Delete successfully..");
        res.redirect('/getuserprocess');
    });
});
//step-1 get data into edit form
router.get('/useredit/:id', function (req, res, next) {
    var usereditid = req.params.id;
    console.log("Edit id is " + usereditid);
    connection.query("select * from tbl_user where user_id=?", [usereditid], function (err, user_row) {
        if (err) throw err;
        console.log(user_row);
        res.render('useredit', { user_array: user_row, adminname: req.session.admin_name });
    });
});
//step-2 set edited data into databse
router.post('/useredit/:id', function (req, res, next) {
    var usereditid = req.params.id;
    const userdata = {
        user_name: req.body.user_name,
        user_gender: req.body.user_gender,
        user_email: req.body.user_email,
        user_mobile: req.body.user_mobile,
        user_pass: req.body.user_pass,
        user_address: req.body.user_address
    }
    connection.query("update tbl_user set ? where user_id=?", [userdata, usereditid], function (err) {
        if (err) throw err;
        console.log("Data Edited Successfully..");
        res.redirect('/getuserprocess');
    });
});
//get full admin details display
router.get('/usershow/:id', function (req, res, next) {
    var userfulldataid = req.params.id;
    console.log("Full data id is " + userfulldataid);
    connection.query("select * from tbl_user where user_id=?", [userfulldataid], function (err, user_row) {
        if (err) throw err;
        res.render('userfulldisplay', { user_array: user_row, adminname: req.session.admin_name });
    });
});
//login process
router.post('/login', function (req, res, next) {
    var admin_email = req.body.admin_email;
    var admin_pass = req.body.admin_pass;
    connection.query("select * from tbl_admin where admin_email=? and admin_pass=? ", [admin_email, admin_pass], function (err, admin_row) {
        if (err) {
            res.send(err);
        } else {
            console.log(admin_row);
            if (admin_row.length > 0) {
                var admin_id = admin_row[0].admin_id;
                var admin_name = admin_row[0].admin_name;
                var admin_email = admin_row[0].admin_email;
                var admin_pass = admin_row[0].admin_pass;

                req.session.admin_id = admin_id;
                req.session.admin_name = admin_name;
                req.session.admin_email = admin_email;
                console.log("Login Successfully. " + req.session.admin_name);
                res.redirect('/home');
            } else {
                // res.redirect('login');
                res.render('login', { title: 'login', error: 'No data found' });
            }
        }
    });
});
//logout process
router.get('/logout', function (req, res, next) {
    req.session.destroy(function (err) {
        if (err) throw err;
        res.redirect('/login');
    });
});

module.exports = router;
